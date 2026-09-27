# Browser SQL V2 — Post-KISS Final Planning Freeze

## Status of this document

This is the durable planning freeze for the initial Browser SQL V2 implementation.

It freezes stable product/architecture/execution boundaries. It does **not** own live progress.

~~~text
STATUS.json = current/next/completion/verification
ROADMAP.md = stable scope/order
D-043 = provider/data continuity + three product surfaces
D-044 = compact implementation baseline
Master #85 + C01..C12 #73..#84 = executable work
CHAT_EXECUTION_PLAN.md = serial fresh-chat boundaries
CHAT_PROMPTS.md = copy/paste launcher for each planned chat
~~~

The old Phase-W / 42-WP planning freeze remains historical under:

~~~text
docs/history/browser-sql-pre-kiss-42wp-plan/
~~~

## Frozen product target

Preserve the proven V1 collection contract:

~~~text
authenticated Leumi page
→ MapHeat2 dynamic universe
→ sequential GetSecuritiesData
→ exact complete-cycle validation
→ full raw market facts
~~~

Change persistence/analytical authority to:

~~~text
one Runtime Controller / SQL Authority Worker
→ exact pinned DuckDB-Wasm + persistent OPFS
→ atomic raw/current/history authority
→ trusted reads
→ Current Universe
→ Security Detail/History
→ separate Dynamic SQL Scanner
~~~

The three user surfaces remain distinct.

## Frozen integrity constraints

- no hardcoded universe size;
- canonical SecurityId = `String(PaperId or Key)`;
- exact requested/received/unique/duplicate/missing/unexpected validation;
- full raw MapHeat and Security preservation;
- `null != 0 != "" != undefined`;
- incomplete/corrupt cycles never advance authority;
- a successful cycle is atomically visible or not visible;
- Viewer rereads authoritative state; notifications are hints;
- unsupported storage/schema compatibility blocks writable startup without destructive reset;
- one canonical exclusive Web Lock owns production mutation authority;
- Scanner is read-only, non-overlapping and cannot alter collector cadence;
- no silent history pruning/reset.

## Frozen implementation graph

~~~text
C01 #73 — authenticated pinned DuckDB/OPFS feasibility
C02 #74 — minimum SQL runtime + schema
C03 #75 — atomic persistence + durability/reopen
C04 #76 — Recorder integration + trusted reads
C05 #77 — Current Universe on SQL
C06 #78 — Security Detail/History + bounded single-tab L-2
C07 #79 — real analytical SQL + evidence-driven optimization decision
C08 #80 — simple safe Scanner core
C09 #81 — Scanner UI/results/integration
C10 #82 — one production owner with Web Locks
C11 #83 — representative daily mixed workload
C12 #84 — authenticated no-overlap production transition
~~~

Direct dependency authority remains:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

Executable detail remains in the live GitHub Issues and:

~~~text
docs/browser-sql-compact-issue-specifications.md
~~~

## Fresh-chat execution freeze

The planned human/AI execution is exactly twelve serial fresh chats:

~~~text
Chat 01 ↔ C01/#73
...
Chat 12 ↔ C12/#84
~~~

The serial order is an orchestration policy, not a replacement for the dependency DAG.

Chat N+1 starts only after Chat N:

- closes its owning Issue;
- has all required verification green;
- resolves/rejoins every blocking discovery or triggered conditional it owns;
- leaves no `verification-pending`;
- advances the sole live pointer in `STATUS.json`.

A stale chat prompt never overrides `STATUS.json`.

Unexpected findings are handled in the active chat:
- blocking defects are fixed now;
- O1..O6 activate only from their documented evidence triggers and rejoin their owner;
- evidence may correct the durable plan rather than preserving a known-bad freeze;
- truly non-blocking future work is captured without hijacking the live pointer.

## Conditional work freeze

There are no standing O1..O6 Issues.

- O1 ← C07 analytical evidence;
- O2 ← C11 Scanner resource evidence;
- O3 ← C09/C11 result-materialization evidence;
- O4 ← C11 storage evidence;
- O5 ← C11 target-environment evidence;
- O6 ← C06 unresolved live parity evidence.

A conditional is the smallest justified branch, not a new permanent phase or source of truth.

## Live verification boundaries

- **C01 / L-1:** exact pinned Worker/Wasm + probe-only OPFS + synthetic write/COMMIT + close/reopen on authenticated Leumi. No provider calls and no Web Lock proof.
- **C06 / L-2:** controlled single-tab real provider → validation → SQL → trusted-read proof. Not production cross-tab ownership evidence.
- **C12:** one no-overlap authenticated release transition: old IndexedDB Recorder settles/stops first; then real-origin two-tab ownership, fresh SQL authority, real cycles, Current/Detail and one representative Scanner query are proven.

## Cutover freeze

Initial V2 cutover is explicit:

~~~text
settle/stop old IndexedDB Recorder
→ preserve legacy IndexedDB
→ launch tested SQL candidate
→ prove one real-origin owner + passive loser
→ open fresh production OPFS/readiness
→ start SQL recording
→ verify first cycles + trusted reads + Scanner
→ accept
~~~

On material failure:

~~~text
stop SQL runtime
→ preserve SQL DB
→ run retained old release
~~~

No automatic fallback, permanent dual-write, history synchronization or mandatory legacy-history import.

## Evidence-driven non-goals

Initial V2 does not prebuild:

- fixed analytical horizon schema;
- mandatory persisted derived metrics;
- immutable SQL-edit history;
- anchored scheduler machinery;
- collaboration/OCC;
- generic cancellation platform;
- mandatory streaming;
- generalized migration/upgrade framework;
- automatic archive/rollover;
- permanent shadow mode;
- final trading formula;
- automated order execution.

## Planning verification completed before freeze

The candidate passed:

- adversarial review of Master #85 and every C01..C12 Issue;
- dependency/parallelism/O1..O6 rejoin review;
- KISS and current-doc/spec authority review;
- removal/marking of misleading pre-KISS execution guidance;
- representative fresh-AI dry runs for Chat 01, Chat 08 and Chat 12;
- mechanical current-plan and 12-chat prompt guards;
- Fast CI on the audited planning candidate.

Browser CI was not required for planning finalization because no production/runtime/browser/Playwright behavior changed.

## Change rule after freeze

This freeze is not a prohibition on learning.

If implementation evidence proves a frozen assumption wrong:

~~~text
stop coding forward
→ record the evidence
→ correct the owning Issue/decision/plan
→ update STATUS
→ add/adjust focused regression/guard when useful
→ continue from the corrected source of truth
~~~

Do not keep a bad plan merely because it was frozen.

## Implementation entry

Normal implementation starts only when:

- planning Issue #72 is closed;
- `STATUS.json` points to Chat 01 / C01 / #73;
- the Chat 01 prompt validates that entry gate against GitHub.

From there, follow the strict serial protocol in `CHAT_EXECUTION_PLAN.md`.
