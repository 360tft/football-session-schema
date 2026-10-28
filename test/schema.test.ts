import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { validate, extraChecks } from '../scripts/validate.ts'

const read = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const schema = read('../schema.json')
const files = readdirSync(new URL('../examples/', import.meta.url)).filter((f) => f.endsWith('.json'))

test('there are three examples', () => assert.equal(files.length, 3))

for (const f of files) {
  test(`example ${f} is valid`, () => {
    const data = read(`../examples/${f}`)
    assert.deepEqual([...validate(schema, data), ...extraChecks(data)], [])
  })
}

const good = () => structuredClone(read(`../examples/${files[0]}`))

test('missing required field fails', () => {
  const d = good(); delete d.steps
  assert.ok(validate(schema, d).some((e) => e.includes('missing "steps"')))
})
test('unknown field fails', () => {
  const d = good(); d.secret = 1
  assert.ok(validate(schema, d).some((e) => e.includes('unknown field')))
})
test('bad age group fails', () => {
  const d = good(); d.ageGroup = 'kids'
  assert.ok(validate(schema, d).length > 0)
})
test('min above max fails', () => {
  const d = good(); d.players.min = 20
  assert.ok(extraChecks(d).length > 0)
})
test('step order must run 1..n', () => {
  const d = good(); d.steps[1].order = 5
  assert.ok(extraChecks(d).length > 0)
})
test('no banned word in schema or examples', () => {
  const banned = ['dr' + 'ill']
  for (const p of ['../schema.json', ...files.map((f) => `../examples/${f}`)]) {
    const t = readFileSync(new URL(p, import.meta.url), 'utf8').toLowerCase()
    for (const b of banned) assert.ok(!t.includes(b), `${p} contains ${b}`)
  }
})
