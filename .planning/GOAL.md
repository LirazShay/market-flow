# Goal

This file owns the stable planning boundary for the current Local History Viewer V2 architecture migration.

## Desired outcome

Move Local History Viewer V2 from the failed Browser-SQL/DuckDB-Wasm path to the simplest reliable local architecture:

~~~text
authenticated Leumi page
→ preserved V1 provider collection + exact complete-cycle validation
→ loopback WebSocket
→ one localhost Node.js service
→ native DuckDB
→ trusted Current + Detail/History reads
→ Dynamic SQL Scanner
~~~

The migration succeeds when the daily tool works end-to-end with Node/DuckDB as the only new SQL/history authority, while the proven Leumi collection/data contract and user-facing V1-derived browsing behavior remain intact.

## Current reality

- D-045 already selected the localhost Node.js + native DuckDB authority boundary after authenticated DuckDB-Wasm failed at `wasm-instantiate`.
- A real Leumi-origin smoke test already proved communication to `ws://127.0.0.1:8765`.
- The current V2 implementation still uses the V1-derived browser Recorder, IndexedDB persistence, BroadcastChannel notifications and same-origin Viewer.
- Provider collection/validation, canonical SecurityId handling, raw payload preservation and current Viewer behavior already have substantial deterministic/Chromium coverage.
- The old Browser-SQL C01-C12 graph is frozen; Stage-03 inventory classifies what to keep, adapt, archive or retire.
- `@duckdb/duckdb-wasm` and Browser-SQL probe assets are still present only because retirement has not yet been executed.
- S&T Planner now owns the replacement plan in `.planning/`; the previous fixed 100-stage planning sequence is superseded as a planning mechanism.

## Constraints

- Keep the architecture local and simple: no cloud/backend service, Docker, cluster, framework stack or second database unless evidence proves a need.
- Node.js is the local service runtime.
- Browser↔local service transport is WebSocket over loopback.
- Native DuckDB is the SQL/history database and has one owning Node process.
- Provider authentication, cookies, tokens and private session state stay inside the authenticated Leumi page.
- Bind production service to loopback only and reject unapproved browser origins.
- Preserve the proven MapHeat2 → sequential GetSecuritiesData → exact complete-cycle validation contract.
- Preserve canonical `String(PaperId or Key)`, full raw source facts, and `null != 0 != "" != missing`.
- A complete validated cycle becomes visible atomically or not at all.
- Preserve Current Universe and Security Detail/History observable behavior.
- Keep Dynamic SQL Scanner user-changeable and independent from collector cadence.
- Prefer one producer and multiple read/viewer clients; do not reintroduce browser DB ownership/election.
- Tests protect public/observable behavior; use Node for service/database logic and Chromium for browser↔localhost/UI integration.
- Repository remains public; fixtures/logs/evidence must stay sanitized.
- Planning completes and freezes before production implementation starts.

## Non-goals

- Returning to DuckDB-Wasm/OPFS as the production authority.
- Importing legacy IndexedDB history into the first Node/DuckDB production database.
- Permanent dual-write or dual-read authorities.
- Automatic trading/order execution or a final trading formula.
- Cloud deployment, remote multi-user access or collaboration.
- General-purpose database migration/version framework beyond what the first local release actually needs.
- Advanced streaming, compression, cancellation, caching or concurrency machinery without measured need.
