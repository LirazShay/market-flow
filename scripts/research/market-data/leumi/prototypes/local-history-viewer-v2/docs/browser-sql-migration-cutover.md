# Browser SQL — Migration and Cutover Strategy

This is the Phase N planning artifact for Local History Viewer V2.

It defines how the currently implemented IndexedDB authority transitions to the Browser SQL authority without creating two permanent market-history sources of truth.

It does not implement migration or cutover.

Durable decision: ../../../../../../../docs/project/decisions/D-035.md

## 1. Migration objective

Current implemented authority:

~~~text
Recorder
→ IndexedDB
  → cycles
  → history
  → latest
  → meta
→ Viewer rereads IndexedDB
~~~

Target authority:

~~~text
Recorder
→ Runtime Controller
→ SQL Authority Worker
→ DuckDB-Wasm + OPFS
→ Viewer through Runtime Controller
~~~

The transition must have one explicit authority at every point.

## 2. Selected migration principle

Selected KISS strategy:

~~~text
verify SQL separately
→ stop IndexedDB Recorder at an explicit boundary
→ start a fresh production OPFS database
→ Browser SQL becomes the only active market-history authority
~~~

Initial cutover does **not** bulk-import existing IndexedDB history.

The legacy IndexedDB database is left physically untouched and closed by the new runtime until an explicit later cleanup decision.

## 3. Why existing IndexedDB history is not imported initially

The current IndexedDB history is useful prototype/research data, but no current product requirement states that pre-cutover history must be queryable in the Browser SQL database.

Importing it correctly would require additional implementation for:

- mapping legacy auto-increment session/cycle identities;
- creating stable SQL snapshot identities;
- creating migration/retry identity;
- rebuilding target current/latest state;
- recomputing all core-horizon predecessor links and derived metrics in chronological order;
- validating null/zero/empty/missing preservation through two storage models;
- verifying partial/interrupted migration recovery;
- validating large historical migration performance and quota impact.

That complexity has no proven current value.

Therefore:

~~~text
no automatic history import
no lazy history import
no dual-read query layer
no permanent legacy compatibility adapter
~~~

If preservation of pre-cutover history later becomes a real product requirement, it receives a separate evidence-backed migration Issue/decision.

## 4. Data continuity consequence

Browser SQL historical coverage starts at the first successful SQL-authority cycle after cutover.

Expected startup behavior:

- current/latest becomes available after the first successful SQL cycle;
- horizon-derived values are NULL until sufficient post-cutover history exists;
- the maximum core horizon (600s) naturally warms up from new SQL history;
- no fake predecessor is taken from legacy IndexedDB.

This is visible, intentional data coverage rather than hidden migration loss.

## 5. Temporary coexistence is verification-only

Before cutover, temporary coexistence is allowed only with an explicit authority label.

Baseline:

~~~text
IndexedDB = authoritative
candidate SQL DB = verification shadow only
~~~

The candidate SQL path may consume the same already-validated cycle payload for comparison/endurance testing.

Rules:

- provider collection happens once;
- IndexedDB remains the user-visible authority;
- SQL shadow failure cannot change IndexedDB success semantics;
- SQL shadow does not drive the production Viewer;
- candidate SQL data is never silently promoted to production authority;
- candidate DB identity is separate from the production OPFS database;
- the shadow mechanism is temporary test/migration scaffolding and must be removed after cutover verification.

## 6. Candidate/shadow database isolation

The live compatibility probe and any provider-backed shadow/endurance validation must use database identities that are explicitly non-production.

Conceptual examples:

~~~text
market-flow-v2-probe.duckdb
market-flow-v2-shadow.duckdb
~~~

The production authority remains:

~~~text
market-flow-v2.duckdb
~~~

Exact filenames are implementation constants, but these identities must never collide.

Cleanup may delete only a DB explicitly owned by the probe/shadow harness.

## 7. Shadow comparison contract

When shadow verification is used, compare observable data contracts rather than implementation IDs.

At minimum compare:

- validated requested/received/unique counts;
- exact canonical security membership;
- one target snapshot per expected security;
- raw Security preservation;
- collected/source timing mapping;
- latest/current membership after a complete candidate cycle;
- selected promoted typed fields;
- core horizon NULL/warm-up behavior;
- later horizon values against deterministic expected calculations.

SQL-generated session/cycle/snapshot IDs are not required to equal IndexedDB auto-increment IDs.

## 8. Cutover prerequisites

Production Browser SQL cutover is blocked until all applicable gates are green.

Required evidence includes:

### Browser compatibility

- Live Gate L-1 on the real authenticated Leumi page;
- Bookmarklet/injected runtime executes;
- Blob Worker works;
- exact pinned Worker/Wasm loads;
- production-equivalent OPFS write + COMMIT + CHECKPOINT + reopen works.

### Functional verification

- Fast CI green;
- full Browser SQL Chromium suite green on final cutover candidate;
- OPFS reopen/recovery tests green;
- atomic ingest and ingest-token retry tests green;
- scheduler/query/Viewer tests green;
- schema migration/readiness failure tests green.

### Provider/live integration

- Live Gate L-2 verifies existing provider collection still works through the authenticated page context;
- no copied authentication secrets are required.

### Performance/capacity

- Phase M normal-profile headroom gates green;
- representative full-session target Windows/Chrome benchmark green;
- 2x-session capacity/stress gate green or an explicitly approved evidence-equivalent;
- no unresolved OOM/quota/backlog/corruption issue.

### Operational/security

- Phase O failure/security/observability requirements implemented and verified;
- exact runtime + engine manifest/version recorded;
- previous IndexedDB runtime release is retained as an explicit rollback artifact.

## 9. Production database precondition

Cutover must not silently reuse arbitrary candidate/probe data.

Before the first production SQL recording session:

~~~text
production OPFS DB is absent
OR
production OPFS DB is a verified compatible authority created by the production cutover path
~~~

If an unexpected/incompatible production-named DB already exists:

~~~text
do not reset automatically
→ recovery-required / explicit cleanup decision
~~~

Probe/shadow databases never become production merely by renaming a flag.

## 10. Cutover boundary

Cutover is an explicit runtime/release transition, not an automatic feature flag flip during a running collection cycle.

Procedure:

~~~text
1. stop the IndexedDB Recorder cleanly
2. wait for any in-flight IndexedDB cycle to settle
3. record/observe the final legacy complete-cycle boundary
4. close legacy runtime/Viewer ownership
5. start the Browser SQL cutover release
6. open/create verified production OPFS database
7. complete SQL startup/recovery/readiness
8. start a new SQL recording_session
9. collect + durably acknowledge the first complete SQL cycle
10. expose Browser SQL Viewer/query operation
~~~

No cycle is intentionally split across authorities.

## 11. One-authority rule after cutover

After step 5 above:

~~~text
DuckDB/OPFS = active market-history authority
IndexedDB   = inert legacy data only
~~~

The Browser SQL runtime must not:

- continue dual-writing to IndexedDB;
- read IndexedDB as query fallback;
- merge latest state from both stores;
- silently use IndexedDB if SQL startup fails.

If SQL authority cannot start:

~~~text
Recorder does not start
→ explicit failure/recovery state
~~~

## 12. Runtime/release identity

The cutover release must make storage authority explicit in generated build metadata.

Conceptual manifest field:

~~~text
storageAuthority = duckdb-opfs
~~~

The previous IndexedDB release must remain identifiable as its own immutable rollback artifact.

The rolling user-facing artifact may advance to Browser SQL only after cutover gates pass.

Do not rely on an unversioned rolling file as the only rollback copy.

## 13. Rollback before cutover

If any prerequisite, probe, shadow or candidate test fails:

~~~text
IndexedDB remains authoritative
→ no production authority change occurred
~~~

Disposable candidate/probe SQL DBs may be removed explicitly after evidence is captured.

No production history repair is needed because cutover did not occur.

## 14. Rollback after cutover

There is no automatic runtime fallback.

If a serious Browser SQL defect requires rollback:

~~~text
stop SQL Recorder
→ preserve production OPFS DB unchanged
→ explicitly launch the retained IndexedDB runtime release
→ IndexedDB resumes as authority from its own last legacy state
~~~

Important consequence:

IndexedDB was not dual-written after cutover, so a rollback can contain a time gap covering the SQL-authority interval.

That gap is explicit and preferable to permanent dual-write complexity and ambiguous authority.

SQL-period data remains in OPFS for diagnosis and later roll-forward/recovery; it is not automatically merged back into IndexedDB.

## 15. Roll-forward after SQL failure

Preferred recovery for a fixed Browser SQL bug is roll-forward when the OPFS database passes readiness/integrity checks.

~~~text
fixed runtime
→ open existing production OPFS
→ recovery/readiness
→ resume from committed SQL history
~~~

If readiness cannot prove coherence, remain recovery-required.

Do not delete the production OPFS database merely to restore service.

## 16. Legacy IndexedDB retention after cutover

The existing database:

~~~text
market-flow-leumi-history-v2
~~~

is retained unchanged initially.

It is:

- not active authority;
- not read by the Browser SQL Viewer;
- not updated by the Browser SQL Recorder;
- available only as a rollback/diagnostic asset through the old runtime.

There is no fixed retention duration in Phase N.

Deletion requires an explicit stabilization/cleanup decision after Browser SQL has proven reliable.

## 17. Legacy cleanup

After the rollback window is deliberately closed:

- remove temporary shadow/probe runtime paths;
- remove migration-only comparison code;
- remove IndexedDB production wiring from the active Browser SQL runtime/build;
- remove obsolete IndexedDB-specific Viewer reads from the active target;
- keep historical implementation/code only where repository history or archived docs already preserve it;
- offer an explicit user action to delete the old local IndexedDB database if desired.

Do not automatically delete the user's legacy local data during ordinary upgrade/startup.

## 18. No permanent compatibility layer

The final target must not retain:

~~~text
if DuckDB works → use DuckDB
else → use IndexedDB
~~~

or:

~~~text
query DuckDB + IndexedDB together
~~~

Such mechanisms would create two long-lived authorities and double the verification surface.

Migration scaffolding has a removal condition, not permanent architecture status.

## 19. Current Viewer transition

Before cutover:

~~~text
Viewer → IndexedDB
~~~

After cutover:

~~~text
Viewer → Runtime Controller → SQL Authority
~~~

There is no target Viewer mode that merges old IndexedDB history into live SQL results.

A user opening an old retained runtime is explicitly operating the legacy rollback system, not the Browser SQL Viewer.

## 20. Acceptance scenarios

N-A1: shadow SQL fails during pre-cutover validation; production Viewer/current state continues from IndexedDB unchanged.

N-A2: candidate SQL database contains test/provider data; cutover does not silently promote or reuse it as production authority.

N-A3: after clean cutover, first SQL cycle creates current/latest state and insufficient horizons remain NULL.

N-A4: SQL startup fails after the IndexedDB runtime is stopped; Recorder remains stopped rather than silently writing IndexedDB.

N-A5: after cutover, normal Browser SQL operation performs no new IndexedDB market-history writes.

N-A6: old IndexedDB database remains physically intact and closed by the SQL runtime.

N-A7: rollback explicitly launches the retained IndexedDB release and acknowledges that SQL-period history is not merged into it.

N-A8: SQL rollback preserves the OPFS database unchanged for diagnosis/roll-forward.

N-A9: fixed SQL runtime reopens a coherent production OPFS database and resumes without resetting it.

N-A10: legacy IndexedDB cleanup requires explicit action; normal startup never deletes it.

N-A11: migration-specific shadow/comparison paths are removed before the final Browser SQL runtime is considered complete.

N-A12: no final production code path automatically chooses between IndexedDB and DuckDB authorities.

## 21. Deferred / future requirement trigger

A dedicated IndexedDB → DuckDB historical importer is out of scope for the initial cutover.

Reopen it only if there is a concrete requirement such as:

- pre-cutover historical analysis has continuing product value;
- rollback continuity without gaps becomes mandatory;
- user explicitly requires old recordings inside the SQL query surface.

That future work must define idempotent import identity, chronological enrichment rebuild, large-data verification and interrupted migration recovery.

## 22. Phase N completion result

~~~text
pre-cutover:
IndexedDB authority + optional isolated SQL shadow verification

cutover:
explicit stop boundary
→ fresh verified production OPFS
→ SQL authority starts from new history epoch

post-cutover:
DuckDB/OPFS only active authority
+ inert legacy IndexedDB rollback asset
+ no dual-write/read fallback

rollback:
explicit old-runtime switch
+ possible documented history gap
+ OPFS preserved

cleanup:
explicitly close rollback window
→ remove migration scaffolding
→ optional explicit legacy DB deletion
~~~


## Phase V future release upgrades

Initial cutover is not the only authority transition. After Browser SQL becomes production, persistence-affecting releases use a side-by-side candidate upgrade: preserve pre-upgrade production DB, migrate/verify candidate, promote through a crash-recoverable journal, and keep the old snapshot for rollback. Rollback never opens the newer-written DB with the older engine. Initial production cutover is blocked until this lifecycle is implemented/Browser-verified.
