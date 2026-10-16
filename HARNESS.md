# Browser Harness — BT Quick Contract Scenario Tool

Repeatable manual + scripted test loop for the static app.

## 1. Serve (required — browsers block `fetch('mechs.json')` on `file://`)

```bash
python3 -m http.server 8766 --bind 127.0.0.1
# open http://127.0.0.1:8766/index.html
```

Health check: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8766/mechs.json` → `200`.

## 2. Smoke checks (run in devtools console)

```js
MECHS.length            // expect 4295
MECH_SOURCE             // expect "MekBay catalog (4,295 Mek units, …)"
```

Expect zero console errors (only Google-Fonts network entries).

## 3. End-to-end script (verified 2026-10-14, all passing)

1. **Brigades** → add brigade "Test Brigade".
2. Search `Atlas AS7-D` → dropdown filters 4295 → 5 variants → **+ Add selected** → inventory row `Atlas AS7-D | 1897 BV | 9,626,000`.
3. Add pilot `Test Pilot 3/4`, **+ Load slot**, assign mech + pilot.
4. **Scenarios** → game date present → **Generate** → 10 scenarios.
5. Activate one (e.g. `Breakthrough — Op 01`).
6. **Pre-Drop** → TW mode: `1,897 → x1.15 → +175 → 2,357 BV`.
7. Toggle **ALPHA STRIKE** → header flips to `Alpha Strike (PV)`, row becomes `52 → PV skill 15 → +2 → 51 PV`.
8. **⇩ Export** → downloads `bt-scenario.ods` (Forces / Objectives / Map sheets).
9. **⇧ Import** (Settings tab, next to Export) → re-upload that ODS → Apply Import → forces, objectives, payouts and map restored into the selected game date.

## 4. Known notes

- Test data above lives in the harness browser profile's `localStorage` (`bqct_state_v1`); clear site data to reset.
- `file://` use falls back to the 12-unit built-in list with a source note — this is by design, not a failure.
