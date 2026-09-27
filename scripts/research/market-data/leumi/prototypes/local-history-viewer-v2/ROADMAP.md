# Local History Viewer V2 — Browser SQL Implementation Roadmap

This file owns stable implementation scope and order.

Live progress, current focus and verification results belong only in `STATUS.json`.

Durable boundaries:

~~~text
D-043 = provider/data continuity + three product surfaces
D-044 = post-KISS Browser SQL implementation baseline
~~~

## Fixed product and integrity constraints

V1 provider/collection continuity is preserved while storage and analytical authority change.

- preserve the proven V1 authenticated MapHeat2 → sequential GetSecuritiesData contract;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- validate complete-cycle requested/received/unique/duplicate/missing/unexpected accounting;
- preserve full raw MapHeat and Security facts;
- preserve `null != 0 != "" != undefined`;
- incomplete/corrupt cycles do not advance authoritative state;
- successful cycle persistence is atomic;
- DuckDB-Wasm/OPFS becomes the sole new market-history authority after cutover;
- Viewer uses trusted reads; notifications are hints;
- Scanner is read-only and non-overlapping;
- one exclusive Web Lock owner controls production DB/Recorder;
- no silent DB delete/reset.

## Group 1 — Feasibility + SQL Core

~~~text
completed evidence #29/#30
→ C01 real-origin DuckDB L-1
→ C02 minimum SQL runtime + schema
→ C03 atomic persistence + reopen/durability
→ C04 Recorder integration + trusted reads
~~~

C10 Web Lock ownership may start after C02 in parallel with C03-C09 work.

## Group 2 — V1 Product on SQL

~~~text
C04
├→ C05 Current Universe SQL parity
└→ C06 Detail/History SQL parity + bounded L-2
~~~

C05 Current Universe and C06 Security Detail/History are separate preserved product surfaces and may progress in parallel.

Both must be complete before new analytical product work becomes the active dependency path.

## Group 3 — Analytics + Dynamic SQL Scanner

~~~text
C05 + C06
├→ C07 real analytical SQL + representative day-sized measurement
└→ C08 Scanner core → C09 Scanner UI/results/integration
~~~

C07 and C08/C09 intentionally run in parallel.

The Scanner does not depend on precomputed enrichment.

C07 may conclude that dynamic SQL is sufficient and no persisted analytical optimization is needed.

## Group 4 — Daily Readiness + Cutover

~~~text
C07 + C09 + C10
→ C11 representative daily mixed workload
→ C12 final authenticated verification + explicit cutover/rollback/cleanup
~~~

Cutover starts fresh SQL production history. There is no required legacy IndexedDB history import, permanent dual authority or automatic fallback.

## Conditional work — create only from evidence

No standing Issues exist for these paths.

- **O1 analytical optimization** — only if C07 shows an important query is materially too slow/awkward.
- **O2 Scanner resource hardening** — only if C11 shows Scanner materially harms ingest after simpler fixes fail.
- **O3 streaming/chunked results** — only if C09/C11 shows simple materialization is unsafe/unusable.
- **O4 storage/export/fresh-DB workflow** — only if C11 shows retain-all cannot support required daily use.
- **O5 target Windows/Chrome evidence** — only if normal Chromium evidence is insufficient for a material target-environment decision.
- **O6 temporary shadow comparison** — only if C06 leaves one specific material live parity uncertainty unresolved.

Any candidate-changing conditional must rerun the affected verification before C12.

## Verification model

~~~text
Node
→ pure deterministic logic

Chromium
→ Worker/Wasm/OPFS/runtime/Viewer/Web Locks/Scanner integration

authenticated Leumi
→ only real-origin/provider facts that CI cannot prove
~~~

Permanent normal workflows remain Fast CI and Browser CI.

## Initial-V2 non-goals

- generalized engine/schema migration framework;
- automatic archive/rollover orchestration;
- restore/import or multi-epoch query federation;
- immutable history of every SQL edit;
- collaborative SQL editing;
- generic cancellation/preemption platform;
- rich telemetry/incident platform;
- final trading formula;
- order placement/execution.

## Execution authority

The compact dependency/design source is:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

The executable Issue-body source before GitHub materialization is:

~~~text
docs/browser-sql-compact-issue-specifications.md
~~~

After materialization, GitHub Master + C01..C12 own executable work. This ROADMAP continues to own only stable scope/order, while `STATUS.json` remains the only live progress pointer.
