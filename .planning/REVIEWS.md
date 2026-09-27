# Planning Reviews

### R-001 — 2026-09-27 — Goal boundary + root decomposition

**Result:** pass

**Gates checked:**
- goal clarity
- strategy/tactic validity at root
- top-level necessity
- top-level sufficiency
- assumption honesty
- KISS
- fresh-session continuity

**Findings:**
- The requested migration goal is unambiguous from D-043, D-045 and the Stage-03 inventory.
- Five top-level concerns are individually necessary: browser/transport boundary, Node/DuckDB authority, Current/Detail reads, Dynamic SQL Scanner, and verified cutover/cleanup.
- Those five are sufficient at the root level if their child plans become implementation-ready.
- The old fixed 100-stage structure is arbitrary under S&T and must not constrain decomposition.
- Scanner write-safety remains a material open decision (D-006); it does not block planning node 1.

**Corrections made:**
- Fixed the planning boundary around the already accepted D-045 Node/WebSocket/DuckDB architecture.
- Chose the maintained current DuckDB Node API candidate and the already-proven `ws` transport library as resolved planning inputs.
- Kept the existing same-origin Viewer instead of introducing a second local web application.

**Opened/referenced decisions:**
- D-001 through D-006

**Note:** This is not Final Planning Review. Child branches are still draft.

### R-002 — 2026-09-27 — S&T Node 1 browser↔Node boundary

**Result:** pass

**Gates checked:**
- strategy/tactic validity
- child necessity
- child sufficiency
- assumption honesty
- KISS
- implementation readiness
- failure/security boundary
- reuse of proven code

**Necessity test:**
- Remove 1.1: browser/server can drift on messages; parent fails.
- Remove 1.2: no deterministic request/ACK transport exists; parent fails.
- Remove 1.3: Recorder still persists to IndexedDB or needs an implementation-time design decision; parent fails.
- Remove 1.4: disconnected/duplicate producer behavior remains unsafe/undefined; parent fails.

**Sufficiency test:**
Assuming 1.1–1.4 succeed, the browser can connect, identify itself, send every existing Recorder persistence/lifecycle operation, wait for authoritative ACKs, and stop safely on transport failure. Remaining server/database semantics are correctly outside this node and owned by Node 2.

**KISS findings:**
- reuse existing universe and complete-cycle objects unchanged;
- one WebSocket endpoint, no HTTP API;
- no reconnect, replay, offline queue or local token;
- no new market-data DTO layer;
- no Browser DB fallback after cutover.

**Corrections made:**
- narrowed Node 1 from “all read/query requests” to the producer/browser handoff only;
- kept Viewer/Scanner message extensions for Nodes 3/4;
- made connection loss fail closed instead of introducing idempotent replay machinery.

**Opened/referenced decisions:**
- D-007
- D-008

### R-003 — 2026-09-27 — S&T Node 2 localhost Node/DuckDB authority

**Result:** pass

**Gates checked:**
- strategy/tactic validity
- child necessity
- child sufficiency
- transaction/data integrity
- restart/recovery
- security/ownership
- KISS
- implementation readiness

**Necessity test:**
- Remove 2.1: no safe/singular service ownership or serialized mutation; parent fails.
- Remove 2.2: no durable database/schema contract; parent fails.
- Remove 2.3: producer/session/universe/failure lifecycle remains undefined; parent fails.
- Remove 2.4: complete-cycle atomicity/current-history coherence is not implemented; parent fails.
- Remove 2.5: restart/readiness can leave stale ownership or ambiguous authority; parent fails.

**Sufficiency test:**
Assuming 2.1–2.5 succeed, one loopback Node process owns one validated schema/file, one producer write stream, complete lifecycle persistence, atomic cycle commits and deterministic recovery. That is sufficient for the durable authority; consumer read UX and Scanner semantics remain correctly downstream in Nodes 3/4.

**KISS findings:**
- six small tables including schema_info; no ORM;
- raw provider facts stay JSON instead of a speculative wide typed schema;
- no secondary indexes before measurement;
- no migration framework, PID lock, replay log, Docker or service manager;
- latest is replaced wholesale because every accepted cycle is already complete;
- one serialized writer path avoids transaction interleaving.

**External capability evidence checked:**
- current DuckDB Node API supports file-backed `DuckDBInstance` creation and normal connection execution;
- DuckDB Appenders are connection/transaction scoped and explicit transactions can control commit frequency.

**Corrections made:**
- removed “idempotent cycle persistence” from the parent tactic because initial transport explicitly has no replay;
- separated lifecycle persistence from successful-cycle atomic persistence;
- made stale-session interruption the only application-level restart repair.

**Opened/referenced decisions:**
- D-009
- D-010
- D-011

### R-004 — 2026-09-27 — S&T Node 3 Node-backed Viewer

**Result:** pass

**Gates checked:**
- strategy/tactic validity
- child necessity
- child sufficiency
- Current/Detail product parity
- pagination correctness
- refresh/recovery
- authority separation
- KISS
- implementation readiness

**Necessity test:**
- Remove 3.1: no authoritative Node read contract; parent fails.
- Remove 3.2: Viewer modules duplicate/own transport lifecycle; implementation decision remains; parent fails.
- Remove 3.3: Current/diagnostics still read IndexedDB or regress; parent fails.
- Remove 3.4: Detail/history still read IndexedDB or lose paging/historical-only securities; parent fails.
- Remove 3.5: live/manual/reload parity remains undefined; parent fails.

**Sufficiency test:**
Assuming 3.1–3.5 succeed, every existing Viewer market-state read comes from Node, Current and Detail/history preserve their public behavior, committed-cycle hints trigger authoritative rereads, and reload/manual refresh remain provider-free. Scanner remains correctly outside this branch.

**KISS findings:**
- keep existing pure table/detail rendering and sorting;
- return existing logical row shapes instead of introducing UI DTOs;
- four explicit read operations, no general Viewer SQL API;
- keep BroadcastChannel only as metadata invalidation; no WebSocket server-push layer;
- one shared viewer read socket, no background reconnect/cache;
- keep 500-row paging with a simpler SQL keyset cursor.

**Planning corrections discovered while reviewing Node 3:**
- clarified Node 2.2 universe/history/latest typed metadata needed to reconstruct the existing logical Viewer rows;
- corrected Node 1.3 to retain metadata-only `CYCLE_COMMITTED` after Node ACK instead of retiring BroadcastChannel entirely.
Neither correction changes the approved parent strategies or invalidates prior leaves.

**Opened/referenced decisions:**
- D-012
- D-013
- D-014

### R-005 — 2026-09-27 — S&T Node 4 Dynamic SQL Scanner

**Result:** pass

**Gates checked:**
- strategy/tactic validity
- D-006 security/read-only resolution
- child necessity
- child sufficiency
- SQL semantics truthfulness
- scheduler/no-overlap behavior
- Scanner/Recorder independence
- KISS
- implementation readiness

**Necessity test:**
- Remove 4.1: editable SQL is not safely read-only/external-state constrained; parent fails.
- Remove 4.2: no exact Node execution/result contract exists; parent fails.
- Remove 4.3: one-active-config/no-overlap/repeat semantics remain undefined; parent fails.
- Remove 4.4: required Scanner product surface does not exist; parent fails.

**Sufficiency test:**
Assuming 4.1–4.4 succeed, the user can explicitly activate arbitrary supported analytical SELECT SQL, run it repeatedly against coherent committed DuckDB state, receive exact 0..N schema/rows/errors without hidden semantics, avoid overlap/burst, and navigate SecurityId results to the shared Detail surface. Collector cadence/authority is unaffected.

**Security findings:**
- StatementType.SELECT alone is not sufficient because SELECT can access external files/functions and sequences can mutate via nextval.
- D-006 therefore combines engine hardening + one parsed SELECT + no durable sequences.
- No second read-only DuckDBInstance is introduced; the same file should have one shared instance with separate connections.
- Scanner user is local/trusted, so CPU/RAM governance, cancellation and arbitrary result caps are deferred rather than altering SQL semantics preemptively.

**KISS findings:**
- stateless Node scanner.execute request;
- browser owns one active config/timer;
- completion-based delay, no anchored scheduler;
- no query history/config persistence;
- no mandatory streaming/cancellation;
- no hidden LIMIT/filter/sort;
- arrays + explicit column metadata preserve duplicate names/order.

**Planning corrections:**
- Node 2 schema no longer uses DuckDB sequences; IDs are allocated on the serialized writer transaction.
- Node 2 shared instance is hardened once at database creation.
- Product docs are amended to D-045 Node/WebSocket/native-DuckDB architecture.

**Resolved/opened decisions:**
- D-006 resolved
- D-015

### R-006 — 2026-09-27 — S&T Node 5 verification/cutover/retirement

**Result:** pass

**Gates checked:**
- strategy/tactic validity
- child necessity
- child sufficiency
- automated verification coverage
- workload viability
- release reproducibility
- no-overlap cutover/rollback
- retirement/source-of-truth hygiene
- KISS
- implementation readiness

**Necessity test:**
- Remove 5.1: no trustworthy integrated CI proof; parent fails.
- Remove 5.2: tiny-fixture correctness can hide a workload design failure; parent fails.
- Remove 5.3: live cutover can test an untracked/unreproducible build or overwrite rollback; parent fails.
- Remove 5.4: authority transition/live acceptance/rollback is unsafe or manual; parent fails.
- Remove 5.5: obsolete Browser-SQL execution paths remain discoverable/current; parent fails.

**Sufficiency test:**
Assuming 5.1–5.5 succeed, all leaf contracts from Nodes 1–4 are exercised together, the target workload is viable, the exact candidate can be installed/run, one authenticated no-overlap cutover can accept or reject it without destroying rollback, and the repository/runtime end with only the Node-SQL path executable/current.

**KISS findings:**
- no deployment platform, Docker image, service manager or installer executable;
- one production zip + existing bookmarklet/runtime artifacts;
- old rolling release is preserved until acceptance instead of creating backup machinery;
- one final live gate only;
- no dual-write/dual-read migration;
- cleanup is deferred until successor runtime is accepted.

**Planning correction:**
- Node 2.1 gains only a minimal GET /healthz on the same loopback HTTP/WebSocket server so CI/release readiness is deterministic; no application HTTP API is introduced.

**Resolved/opened decisions:**
- D-016
- D-017
- D-018

### R-007 — 2026-09-27 — Replan for offline-first full verification / Fake Leumi

**Result:** pass

**Trigger:**
The implementation will be performed while the market is closed. The user requires much stronger automatic verification from the start and a local Fake Leumi environment that can exercise the whole architecture before real market data is available.

**Affected planning area reopened:**
- GOAL verification constraints;
- root success evidence;
- Node 5.1;
- test policy/verification assumptions.
Nodes 1–4 product strategies remain valid; their leaf success evidence already expects unit/integration/browser proof and is strengthened by D-020 rather than redesigned.

**Necessity test for 5.1 children:**
- Remove 5.1.1: tests/demo duplicate fake provider semantics or depend on request interception; offline proof is inconsistent.
- Remove 5.1.2: database/service failures first appear in slow browser E2E; deep transactional/security proof is missing.
- Remove 5.1.3: build/runtime/browser wiring is not proven across real HTTP/WebSocket/DuckDB boundaries.
- Remove 5.1.4: the user still cannot exercise the complete system locally without knowing the test runner.

**Sufficiency test:**
Given shared deterministic Fake Leumi scenarios, real Node/DuckDB integration, real-boundary Chromium E2E and one-command local demo, all product behavior except genuine authenticated Leumi-origin/provider facts can be verified while the market is closed. 5.2 separately covers scale and 5.4 remains the minimal final real-world gate.

**KISS findings:**
- reuse existing 4-security fixtures/provider paths;
- extend simple loopback HTTP infrastructure rather than introducing a mock framework;
- one default small-moving scenario, optional explicit scenario selection;
- no fake-site GUI/config editor;
- no Electron/installer;
- keep Playwright route interception only for focused failure cases.

**Planning changes:**
- 5.1 is no longer a large leaf; it is decomposed into 5.1.1–5.1.4.
- D-019 defines Fake Leumi as the canonical offline browser-provider environment.
- D-020 makes test layering/test-first expectations explicit for all implementation leaves.

### R-008 — 2026-09-27 — Final Planning Review (correction pass)

**Result:** corrections applied; final audit pending in this review

**Outside-in gaps found before freeze:**
1. Scanner read-only admission was incomplete: DuckDB documents `query(...)` as arbitrary nested SQL even inside an outer SELECT. D-006 / node 4.1 were strengthened with engine hardening + one SELECT + dangerous function-call rejection using `query` plus catalog `has_side_effects`.
2. Fake Leumi local demo claimed one-command operation but did not explicitly auto-load the real built runtime. Node 5.1.4 now requires the fake page to auto-load the exact normal runtime in demo mode with explicit local-Origin service configuration.

**Disposition:**
Both are material correctness/testability gaps, so freeze was withheld until corrected. The whole-plan audit must now be rerun against the corrected tree.

