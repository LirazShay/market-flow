# Decisions and Open Questions

## D-001 — Runtime process boundary

**Status:** resolved

**Related S&T node(s):** 0, 1, 2

**Question:** Where does SQL/history authority run?

**Resolution:** One localhost Node.js service owns native DuckDB; the authenticated Leumi page only collects/validates provider data and communicates over loopback WebSocket.

**Resolution basis / rationale:** D-045 plus the real `wasm-instantiate` failure and successful Leumi-origin WebSocket smoke test.

**What would reopen this:** Direct evidence that the loopback Node architecture cannot satisfy a required product constraint.

---

## D-002 — Native DuckDB Node package

**Status:** resolved

**Related S&T node(s):** 2, 4

**Question:** Which maintained Node binding should the plan target?

**Resolution:** Pin `@duckdb/node-api@1.5.5-r.5` for the first implementation candidate.

**Resolution basis / rationale:** Current DuckDB installation guidance uses `@duckdb/node-api`; the package is the maintained high-level Node API and current npm version is `1.5.5-r.5`, aligned with current DuckDB 1.5.5. Do not use the deprecated legacy `duckdb` Node package.

**What would reopen this:** Package install/platform failure or a verified API gap that blocks an implementation-ready leaf.

---

## D-003 — WebSocket implementation

**Status:** resolved

**Related S&T node(s):** 1, 2, 3, 4

**Question:** Which transport/library should the local service use?

**Resolution:** Browser uses native `WebSocket`; Node pins `ws@8.21.3`. Production endpoint remains loopback `ws://127.0.0.1:8765`.

**Resolution basis / rationale:** The exact browser→Node shape was already proven manually on the real Leumi origin using `ws`; `ws` is a focused Node WebSocket server library with no framework requirement.

**What would reopen this:** Verified browser policy change or a concrete protocol requirement that `ws` cannot satisfy.

---

## D-004 — Viewer hosting/topology

**Status:** resolved

**Related S&T node(s):** 3, 4

**Question:** Should Node also host a new Viewer web app/API?

**Resolution:** No for initial migration. Keep the existing same-origin browser Viewer shell and pure UI logic; replace its IndexedDB adapters with WebSocket client adapters to Node.

**Resolution basis / rationale:** Smallest migration, preserves proven UI behavior, reuses the already-verified transport and avoids adding HTTP hosting/CORS/PNA/UI deployment surfaces.

**What would reopen this:** Browser-side Viewer constraints that make direct local WebSocket reads materially unsafe or unusable.

---

## D-005 — Legacy IndexedDB history

**Status:** resolved

**Related S&T node(s):** 5

**Question:** Import old IndexedDB history into DuckDB?

**Resolution:** No initial import. Start a fresh Node/DuckDB history epoch at cutover; preserve old IndexedDB unchanged for explicit rollback/diagnosis until the new release is accepted.

**Resolution basis / rationale:** KISS; no current product requirement requires prototype history import, and import/dual-write would add substantial correctness complexity.

**What would reopen this:** A concrete product requirement for pre-cutover history inside the new SQL surface.

---

## D-006 — Scanner write-safety mechanism

**Status:** resolved

**Related S&T node(s):** 2.2, 2.3, 2.4, 4.1, 4.2

**Question:** What is the smallest exact mechanism that proves user SQL is read-only on the same writable DuckDB authority?

**Resolution:** Use one hardened shared DuckDB instance and a dedicated Scanner connection. At instance creation set `enable_external_access=false`, `allow_community_extensions=false`, `autoinstall_known_extensions=false`, `autoload_known_extensions=false`, `allow_persistent_secrets=false`, then `lock_configuration=true`. For every Scanner SQL string, use `extractStatements`, require exactly one statement, prepare it and require `prepared.statementType === StatementType.SELECT` before execution. Schema v1 creates no sequences; writer IDs use serialized `MAX(id)+1` allocation inside write transactions, removing the known durable `SELECT nextval(...)` mutation path.

**Resolution basis / rationale:** The current maintained Node API exposes `DuckDBPreparedStatement.statementType` backed by DuckDB's prepared-statement type API. DuckDB's security guidance explicitly recommends disabling external access/extensions and locking configuration for untrusted SQL. A second read-only DuckDBInstance is deliberately rejected because DuckDB recommends sharing one instance for the same file and different instance configurations cannot safely provide the desired mixed read/write topology.

**What would reopen this:** A verified SELECT expression/function in the pinned DuckDB version that can mutate Market Flow durable tables/schema despite the hardened no-sequence design, or a Node API regression that removes prepared statement typing.

---

## D-007 — Loopback access and producer ownership boundary

**Status:** resolved

**Related S&T node(s):** 1, 2

**Question:** What minimum local access control is required without turning a single-machine tool into an authentication system?

**Resolution:** Production Node binds only to `127.0.0.1:8765`, accepts browser upgrades only from the exact approved Leumi Origin `https://hb2.bankleumi.co.il`, and permits one active `role=producer` connection at a time. Multiple viewer-role clients are allowed later. Test harnesses may override the allowed Origin explicitly. No local password/token is added initially.

**Resolution basis / rationale:** Loopback + exact browser Origin blocks ordinary remote and unrelated-web-page access while avoiding secret-distribution machinery. A local process capable of spoofing Origin is already inside the local-machine trust boundary; a copied token would not materially improve that threat model.

**What would reopen this:** A concrete requirement for remote access, a browser Origin change, or evidence of a local threat the current boundary does not address.

---

## D-008 — Connection loss/retry policy

**Status:** resolved

**Related S&T node(s):** 1.2, 1.3, 1.4, 2

**Question:** Should the initial version automatically reconnect, queue or replay producer writes?

**Resolution:** No. Transport failure is fail-closed: pending requests fail, Recorder stops, and the user/runtime must explicitly relaunch after the local service is available. No producer message replay or offline queue exists in the initial version.

**Resolution basis / rationale:** This removes duplicate/idempotency/replay machinery and matches the current single-machine daily workflow. WebSocket/TCP already provides ordered delivery while connected; an ACK lost after a durable server commit may make browser diagnostics conservative, but no automatic resend can duplicate the cycle.

**What would reopen this:** Observed local-service instability that makes manual relaunch materially harmful to daily use.

---

## D-009 — Local DuckDB file and schema shape

**Status:** resolved

**Related S&T node(s):** 2.2, 2.3, 2.4, 3, 4

**Question:** What is the smallest durable schema that preserves the V1 data contract and remains useful for SQL?

**Resolution:** Use one file-backed DuckDB database at `local-service/data/market-flow-v2.duckdb` by default, with `MARKET_FLOW_DB_PATH` override for tests. Git ignores `local-service/data/`. Schema v1 contains `schema_info`, `sessions`, `universe`, `cycles`, `history`, and `latest`. Identity/time/query metadata uses typed relational columns; raw MapHeat/Security/chunks/error/config payloads use DuckDB JSON. No secondary indexes or generalized migration framework initially.

**Resolution basis / rationale:** This mirrors the proven V1 logical stores without reproducing IndexedDB mechanics. Raw JSON keeps future analytical fields; relational identity/time columns keep current/history queries straightforward. DuckDB is analytical and optimization is evidence-driven.

**What would reopen this:** Measured query/storage evidence requiring a typed promoted field/index, or an actual schema evolution requirement after the first release.

---

## D-010 — Successful-cycle persistence algorithm

**Status:** resolved

**Related S&T node(s):** 2.4

**Question:** How does one complete validated cycle become the new authority with the least write complexity?

**Resolution:** One explicit DuckDB transaction allocates `cycle_id`, inserts cycle metadata, bulk-appends history, deletes all `latest`, bulk-appends the same complete cycle into `latest`, updates the active session, and commits. ACK follows COMMIT only. Any error rolls back the entire transaction.

**Resolution basis / rationale:** Every accepted cycle already contains the full validated current universe, so wholesale latest replacement is simpler and safer than per-security upserts. Official DuckDB Node/Appender behavior is connection/transaction scoped and supports explicit transactions for controlled commit boundaries.

**What would reopen this:** Evidence that full latest replacement is materially too slow for the verified daily workload.

---

## D-011 — Service restart and schema evolution policy

**Status:** resolved

**Related S&T node(s):** 2.2, 2.5, 5

**Question:** What recovery/migration machinery is required for the first Node-SQL release?

**Resolution:** On startup, open the file, create schema v1 only when absent, reject unknown schema versions, mark any stale `running` session `interrupted`, then listen. No automatic data migration, replay log, WAL management layer, PID file or service manager is added. Committed DB state is authoritative; uncommitted work is lost/rolled back normally.

**Resolution basis / rationale:** Fresh Node/DuckDB authority is already selected; legacy import is a non-goal. Port binding gives process exclusivity and DuckDB owns its storage durability internals.

**What would reopen this:** A real post-v1 schema change, a verified multi-process requirement, or restart evidence that committed-state recovery is insufficient.

---

## D-012 — Viewer read protocol and history cursor

**Status:** resolved

**Related S&T node(s):** 3.1, 3.3, 3.4, 4

**Question:** What is the smallest Node read API that preserves the existing Viewer without exposing general database access?

**Resolution:** Add exactly four viewer requests: `viewer.current.get`, `viewer.security.get`, `viewer.history.page`, and `viewer.status.get`. Return the existing logical latest/universe/history/diagnostics shapes rather than a new UI DTO. History page size remains 500 and uses keyset continuation `{securityId,collectedAtMs,cycleId}` ordered by `collected_at_ms DESC, cycle_id DESC`.

**Resolution basis / rationale:** These are the only reads required by the preserved Current/Detail/diagnostics surfaces. Existing pure Viewer logic can remain unchanged, and the two-part history ordering gives a deterministic tie-breaker for equal timestamps.

**What would reopen this:** A required Viewer behavior that cannot be expressed by these four operations, or measured paging performance requiring a different key/index.

---

## D-013 — Viewer refresh transport

**Status:** resolved

**Related S&T node(s):** 1.3, 3.2, 3.5

**Question:** Should Node push commit events over WebSocket or should the existing BroadcastChannel notification survive?

**Resolution:** Keep BroadcastChannel as a metadata-only invalidation hint. After Node `cycle.commit` COMMIT + ACK, the producer publishes the existing `CYCLE_COMMITTED` metadata message. Viewers reread Node. No WebSocket server-push event protocol is added for initial V2.

**Resolution basis / rationale:** BroadcastChannel is already verified, same-origin, non-authoritative and the existing Viewer refresh logic is built around it. Keeping it avoids adding unsolicited WebSocket events while preserving the rule that durable authority is reread after a hint.

**What would reopen this:** Viewer and producer move to different origins/processes, or observed BroadcastChannel limitations materially hurt daily use.

---

## D-014 — Viewer read-connection lifecycle

**Status:** resolved

**Related S&T node(s):** 3.2, 3.5

**Question:** Does every Viewer window need an independent Node socket and automatic reconnect?

**Resolution:** No. One lazy `role=viewer` WebSocket client in the opener runtime is shared by its Viewer windows. Transport failure discards it; no background reconnect occurs. A later explicit read/manual refresh creates a new client.

**Resolution basis / rationale:** This is the smallest topology compatible with the current same-origin child-window design, multiple read-only Viewer windows and the fail-closed/no-background-retry policy.

**What would reopen this:** A future standalone Viewer origin/process or evidence that one shared read socket causes material contention.

---

## D-015 — Scanner scheduling/config ownership

**Status:** resolved

**Related S&T node(s):** 4.2, 4.3, 4.4

**Question:** Should Scanner repeat scheduling/config live in Node or in the existing browser runtime?

**Resolution:** Keep Node execution stateless (`scanner.execute {sql}`) and keep the single active Scanner config/timer in one browser runtime controller. Activation runs immediately, later runs use completion-based `setTimeout(intervalMs)`, executions never overlap, missed intervals do not queue, and re-activation replaces the generation without cancelling an in-flight query. Scanner config/results are not persisted initially.

**Resolution basis / rationale:** The product does not require headless Scanner operation, query-version history, anchored scheduling or cancellation. Browser ownership removes a server scheduler/config store while keeping query execution beside DuckDB.

**What would reopen this:** A concrete requirement for Scanner execution while no Viewer/runtime browser context exists, or a requirement to persist/restore active query configuration across restarts.

---

## D-016 — Candidate publication and rollback release

**Status:** resolved

**Related S&T node(s):** 5.3, 5.4

**Question:** How can the Node candidate be tested live without overwriting the known-good rolling IndexedDB release first?

**Resolution:** Build the Node runtime/service as one commit-matched candidate artifact/prerelease. Do not change the rolling release tag before authenticated cutover acceptance. On PASS, promote the exact candidate artifacts to the rolling release. On FAIL, stop the candidate and relaunch the still-unchanged rolling IndexedDB release.

**Resolution basis / rationale:** This removes the need for a special backup tag or reverse migration. Rollback remains a runtime selection because legacy IndexedDB is never modified by Node cutover.

**What would reopen this:** A release platform limitation that prevents promotion of the already-verified candidate artifacts without rebuilding them.

---

## D-017 — Final authenticated verification boundary

**Status:** resolved

**Related S&T node(s):** 5.4

**Question:** What live evidence remains necessary after deterministic Node/Chromium/workload verification?

**Resolution:** Exactly one final no-overlap authenticated self-verifying cutover run on the final candidate. It proves real provider collection through one Node commit plus Current, Detail/History, representative Scanner and producer-ownership behavior. The verifier emits sanitized machine-readable PASS/FAIL only. If the assistant cannot control an authenticated browser/session at execution time, the cutover remains pending; do not convert the limitation into a user-operated test checklist.

**Resolution basis / rationale:** Browser→localhost feasibility is already proven on the real Leumi origin and provider acquisition is preserved. Repeating live gates during implementation adds user/session dependency without proving contracts that CI can cover.

**What would reopen this:** A later code change that alters the real provider/origin transport premise materially before cutover.

---

## D-018 — Legacy IndexedDB and obsolete Browser-SQL retirement

**Status:** resolved

**Related S&T node(s):** 5.4, 5.5

**Question:** What is removed after Node acceptance, and what remains as rollback/history?

**Resolution:** After cutover PASS, remove obsolete Browser-SQL executable dependencies/probes/tests/workflows and archive/remove duplicated planning docs according to the Stage-03 inventory. Close old Browser-SQL Issues as superseded. Do not automatically delete the user's old IndexedDB contents; it remains inert local rollback/history data. No Node→IndexedDB reverse import exists.

**Resolution basis / rationale:** Repository/runtime cleanup removes contradictory authority while leaving user data untouched and avoiding a destructive migration step.

**What would reopen this:** A later explicit product requirement to import/delete legacy browser history.

