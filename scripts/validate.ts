// Small JSON Schema validator for the keywords this schema uses.
// No dependencies. It is not a full draft 2020-12 implementation.
import { readFileSync } from 'node:fs'

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
type Schema = { [k: string]: any }

export function validate(schema: Schema, data: Json, path = '$'): string[] {
  const errors: string[] = []
  const err = (m: string) => errors.push(`${path}: ${m}`)

  if (schema.enum && !schema.enum.includes(data)) err(`must be one of ${schema.enum.join(', ')}`)

  const t = schema.type
  if (t) {
    const ok =
      t === 'object' ? typeof data === 'object' && data !== null && !Array.isArray(data)
      : t === 'array' ? Array.isArray(data)
      : t === 'integer' ? Number.isInteger(data)
      : t === 'number' ? typeof data === 'number' && Number.isFinite(data)
      : typeof data === t
    if (!ok) { err(`expected ${t}`); return errors }
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) err(`shorter than ${schema.minLength}`)
    if (schema.maxLength !== undefined && data.length > schema.maxLength) err(`longer than ${schema.maxLength}`)
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) err(`does not match ${schema.pattern}`)
  }
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) err(`below ${schema.minimum}`)
    if (schema.maximum !== undefined && data > schema.maximum) err(`above ${schema.maximum}`)
    if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) err(`must be above ${schema.exclusiveMinimum}`)
  }
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) err(`fewer than ${schema.minItems} items`)
    if (schema.items) data.forEach((d, i) => errors.push(...validate(schema.items, d, `${path}[${i}]`)))
  }
  if (t === 'object' && typeof data === 'object' && data && !Array.isArray(data)) {
    const obj = data as { [k: string]: Json }
    for (const r of schema.required ?? []) if (!(r in obj)) err(`missing "${r}"`)
    const props = schema.properties ?? {}
    for (const [k, v] of Object.entries(obj)) {
      if (props[k]) errors.push(...validate(props[k], v, `${path}.${k}`))
      else if (schema.additionalProperties === false) err(`unknown field "${k}"`)
    }
  }
  return errors
}

// Cross-field rules JSON Schema cannot express.
export function extraChecks(s: any): string[] {
  const e: string[] = []
  if (s.players && s.players.min > s.players.max) e.push('$.players: min is above max')
  if (Array.isArray(s.steps)) {
    s.steps.forEach((st: any, i: number) => {
      if (st.order !== i + 1) e.push(`$.steps[${i}]: order must be ${i + 1}`)
    })
  }
  return e
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const files = process.argv.slice(2)
  const schema = JSON.parse(readFileSync(new URL('../schema.json', import.meta.url), 'utf8'))
  let bad = 0
  for (const f of files) {
    const data = JSON.parse(readFileSync(f, 'utf8'))
    const errs = [...validate(schema, data), ...extraChecks(data)]
    console.log(errs.length ? `FAIL ${f}\n  ${errs.join('\n  ')}` : `OK   ${f}`)
    bad += errs.length ? 1 : 0
  }
  process.exit(bad ? 1 : 0)
}
