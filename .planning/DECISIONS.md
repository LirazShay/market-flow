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

**Status:** open

**Related S&T node(s):** 4

**Question:** What is the smallest exact mechanism that proves user SQL is read-only on the same writable DuckDB authority?

**Why it matters:** Application string-prefix checks are insufficient; execution must not permit mutation of the market-history authority.

**Options considered (only when useful):**
- parse/extract statements with the pinned Node API and allow only verified read/query statement types;
- execute Scanner through a separately opened read-only database authority only if the Node API/locking model proves this is safe and simpler.

**Resolution:** TBD during Scanner branch planning.

**Resolution basis / rationale:** Current `@duckdb/node-api` exposes statement extraction, but the exact statement-type/safety surface must be verified before the leaf is implementation-ready.

**What would reopen this:** N/A while open.

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

