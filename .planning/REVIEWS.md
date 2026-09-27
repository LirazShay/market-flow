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

