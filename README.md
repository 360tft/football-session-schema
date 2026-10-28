# football-session-schema

A JSON Schema for football coaching sessions and practices. One session in, one shape out.
Point your app, your agent or your spreadsheet export at it.

Fields: title, age group, player numbers, pitch size, equipment, ordered steps,
coaching points, progressions, safety notes.

```json
{
  "title": "Treasure gates dribbling",
  "ageGroup": "U8",
  "players": { "min": 6, "max": 12 },
  "pitch": { "widthMetres": 20, "lengthMetres": 20 },
  "steps": [{ "order": 1, "instruction": "Set 8 gates, two cones each." }],
  "coachingPoints": ["Small touches near the foot"]
}
```

## Files

- [schema.json](schema.json): the JSON Schema (draft 2020-12).
- [examples/](examples/): three fresh example sessions (U8 technical, U12 small-sided game, adult set piece).
- [scripts/validate.ts](scripts/validate.ts): a dependency-free validator. Use it as a CLI or import it.

## Validate

Needs Node 22.6 or newer.

```
node scripts/validate.ts my-session.json
npm test
```

The validator covers the keywords this schema uses. For full draft 2020-12 support, use Ajv with `schema.json`.
It also checks two rules the schema cannot: `players.min` is not above `players.max`, and step `order` runs 1, 2, 3.

## Need sessions to put in it?

[FootballGPT](https://footballgpt.co/features/drill-creator?utm_source=github&utm_medium=open_source&utm_campaign=football-session-schema) builds a full practice from a plain-English prompt.

## Licence

- Schema, scripts and tests: MIT. See [LICENSE](LICENSE).
- Example sessions in `examples/`: CC BY 4.0. See [LICENSE-DATA](LICENSE-DATA). Credit "360TFT".

The examples are written fresh. They contain no user data.

---
Made by [360TFT](https://360tft.com). Build practices and sessions with [FootballGPT](https://footballgpt.co?utm_source=github&utm_medium=open_source&utm_campaign=football-session-schema). Test your knowledge of the Laws with [RefereeGPT](https://refereegpt.co/quiz?utm_source=github&utm_medium=open_source&utm_campaign=football-session-schema).
