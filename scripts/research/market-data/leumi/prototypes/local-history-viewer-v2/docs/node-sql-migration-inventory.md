# Node SQL Migration Inventory — Stage 03/100

Status: Current re-plan input

This inventory classifies the existing Browser-SQL/V2 repository surface after D-045 changed the runtime boundary to:

~~~text
authenticated Leumi page
→ validated complete cycle
→ loopback WebSocket
→ localhost Node.js service
→ native DuckDB authority
~~~

It does **not** delete, close or rewrite the classified items. Later stages consume this inventory deliberately.

Classification meanings:

- **KEEP** — still authoritative/useful as-is or as direct evidence.
- **ADAPT** — concept/contract remains, but the owning artifact must be rewritten for Node/localhost.
- **ARCHIVE** — historical evidence/rationale; move out of current execution/HOT surfaces after any reusable constraints are extracted.
- **RETIRE** — executable mechanism/dependency/work item that must not survive into the Node-SQL implementation; remove/close only after replacement ownership is materialized.

## 1. Durable decisions

### KEEP

- `D-043` — provider/data continuity + Current/Detail/Scanner product shape.
- `D-045` — current localhost Node.js SQL authority boundary.
- repository-wide evidence/KISS/testing/context decisions `D-001`, `D-002`, `D-003`, `D-017`..`D-024`.
- provider/data decisions `D-004`..`D-015` where still applicable to the preserved Leumi collection contract.

### ARCHIVE

These remain valuable architectural evidence but are no longer current V2 runtime authority:

- `D-025` — Browser-only SQL process boundary.
- `D-026` — browser SQL Authority Worker.
- `D-031` — DuckDB-Wasm/Worker/Wasm delivery.
- `D-033` — Browser-SQL-specific verification topology; retain only the general layered-verification lesson.
- `D-035` — OPFS-specific cutover mechanics; fresh-authority/no-import principle must be reconsidered explicitly.
- `D-040` — browser Web Lock database ownership.
- `D-044` — post-KISS Browser-SQL implementation baseline.
- `D-027`..`D-042` already historical/superseded Browser-SQL mechanisms unless a later stage explicitly extracts one implementation-independent requirement.

## 2. GitHub Issues

### KEEP as evidence

- `#29` — completed exact DuckDB-Wasm pin/manifest evidence.
- `#30` — completed deterministic Browser-SQL probe evidence.

These are not implementation dependencies for Node-SQL; they explain the rejected path.

### ADAPT temporarily

- `#73 / C01` — remains the temporary owner of the architecture-correction/re-plan until a replacement Node-SQL planning/master Issue graph exists. It must then close as superseded/architecture-corrected, not as a successful Browser-SQL feasibility proof.

### RETIRE after replacement graph materialization

- `#74..#84 / C02..C12` — old Browser-SQL executable units.
- `#85` — old Browser-SQL compact implementation master.

Do not close these before successor ownership/backlinks are materialized; afterward close as superseded/not-planned rather than completed Browser-SQL work.

## 3. Workstream live/navigation surfaces

### ADAPT

- `README.md`
- `AI_CONTEXT.md`
- `STATUS.json`
- `ROADMAP.md`
- `CHAT_EXECUTION_PLAN.md`
- `CHAT_PROMPTS.md`
- `NEXT_CHAT_PROMPT.md`
- `HANDOFF.md` if it still references the old graph
- `docs/README.md`
- `specs/README.md`
- `tests/README.md`
- `runtime/README.md`
- `recorder/README.md`
- `messaging/README.md`
- `storage/README.md`
- `viewer/README.md`

Current state: HOT files already point at D-045, while old execution files are frozen. Later stages replace, rather than merely banner, the old executable graph.

## 4. Product/spec contracts

### KEEP

Preserve observable behavior and data semantics from:

- `docs/product/local-history-viewer-v2-product-shape.md`
- `docs/product/live-sql-query-execution.md`
- `specs/provider-data-contract.spec.md`
- existing public Recorder/Viewer behavior that is still a product requirement.

### ADAPT

These specs describe valid responsibilities but currently encode browser/IndexedDB/Browser-SQL mechanics:

- `specs/system.spec.md`
- `specs/recorder.spec.md`
- `specs/persistence.spec.md`
- `specs/messaging.spec.md`
- `specs/viewer.spec.md`
- `specs/runtime-delivery.spec.md`
- `specs/debug-bundle.spec.md`
- `specs/research-evolution.spec.md`

Rule: preserve observable contracts; replace implementation ownership from browser persistence/messaging to browser collector + loopback Node service.

## 5. Browser-SQL design/planning docs

### ARCHIVE by default

All current top-level `docs/browser-sql-*.md` files are Browser-SQL architecture/planning evidence and must not remain current execution authority.

This includes the compact C01-C12 DAG/specification/freeze/audit files and older mechanism research.

Before archival, later planning stages may extract implementation-independent requirements from specific documents, especially:

- data integrity / relational semantics;
- complete-cycle atomicity;
- Current/Detail parity;
- Dynamic SQL Scanner product/safety semantics;
- failure/security/observability lessons;
- workload/testing requirements.

Extraction does **not** keep the Browser-SQL file current; the requirement must move to a Node-SQL-owned decision/spec/Issue.

Existing `docs/history/browser-sql-*` material remains historical and needs no second archive copy.

## 6. Browser-SQL runtime/probe assets

### RETIRE after replacement evidence exists

- `runtime/browser-sql-probe.js`
- `runtime/build-browser-sql-probe.js`
- `runtime/duckdb-engine-manifest.js`
- generated Browser-SQL probe artifacts
- Browser-SQL-specific runtime delivery logic whose only purpose is Worker/Wasm/OPFS authority.

### ADAPT

- `runtime/build-runtime.js`
- `runtime/source-order.js`
- `runtime/entry.js`

Reason: browser-side runtime packaging remains useful for the authenticated collector/bootstrap, but its target responsibility changes from owning SQL/storage to connecting to localhost and sending validated cycles.

## 7. Existing V1-derived implementation

### KEEP

Keep the proven provider acquisition and pure validation/data-shaping logic unless a later evidence-backed change is required:

- MapHeat2 acquisition;
- sequential GetSecuritiesData;
- canonical SecurityId;
- exact cycle accounting;
- raw-value/null semantics;
- pure recorder/data builders.

### ADAPT

- Recorder persistence handoff: committed browser storage path becomes validated-cycle transport to Node.
- messaging layer: Browser BroadcastChannel/IndexedDB coordination must be re-evaluated against WebSocket/service APIs.
- storage layer: IndexedDB remains legacy/rollback evidence until Node cutover policy is decided; it is not the new SQL authority.
- Viewer data access: move from browser storage reads toward trusted localhost service APIs while preserving public Current/Detail behavior.

## 8. Tests

### KEEP

Keep tests that protect implementation-independent public/provider/data behavior:

- provider fixtures and validation;
- MapHeat2/GetSecuritiesData contracts;
- SecurityId and raw/null semantics;
- Recorder complete/incomplete-cycle behavior;
- Current Universe observable behavior;
- Security Detail/History observable behavior;
- generic Viewer state/error semantics;
- repository/HOT/spec ownership guards, updated to D-045.

### ADAPT

Browser/IndexedDB integration tests that express still-required product behavior:

- `integrated-v1-e2e.spec.js`
- Recorder persistence/integration tests;
- Viewer Current/Detail/history/recovery/live-refresh tests;
- runtime assembly tests;
- storage lifecycle/growth tests where the product requirement survives.

They should be rehomed against a local Node test service/native DuckDB rather than discarded wholesale.

### ARCHIVE

- `tests/automation/mock-leumi-wasm-blocked.html` after the rejected-path evidence is preserved.
- Browser-SQL live-gate/probe failure fixtures that only demonstrate Wasm/CSP behavior.

### RETIRE

- `tests/automation/specs/browser-sql-probe.spec.js`
- `tests/automation/specs/browser-sql-live-gate-poc.spec.js`
- `tests/unit/browser-sql-probe-build.test.js`
- `tests/unit/duckdb-engine-manifest.test.js`
- old Browser-SQL current-plan guards once equivalent Node-SQL plan guards exist.

Do not remove these before replacement planning/guards make the rejected Browser-SQL path impossible to resurrect accidentally.

## 9. CI workflows

### KEEP

- `.github/workflows/local-history-viewer-v2-fast-ci.yml` — adapt its test set as Node-SQL tests appear.
- `.github/workflows/local-history-viewer-v2-ci.yml` — retain as the browser/integration lane and adapt it to launch the local test service.

### RETIRE

After equivalent Node-SQL coverage exists:

- `.github/workflows/local-history-viewer-v2-wp02-probe-ci.yml`
- `.github/workflows/local-history-viewer-v2-wp03-poc-ci.yml`

These exist specifically for the rejected Browser-SQL Worker/Wasm probe path.

## 10. npm/package surface

### ADAPT

`package.json` remains the workstream package/test entry point.

Planned package-level changes, not yet implementation:

- remove production dependence on `@duckdb/duckdb-wasm`;
- remove Browser-SQL probe build/test scripts after their retirement gate;
- add one maintained native DuckDB Node binding only after official-evidence selection;
- add/retain a WebSocket server dependency only when the production protocol stage selects it;
- preserve Playwright and deterministic build/test tooling that still serves browser↔localhost integration.

Exact packages/versions are intentionally **not** selected by this inventory stage.

## 11. Security classification

### KEEP unchanged

- no credentials/cookies/tokens/account identifiers in Node messages, fixtures, logs or repository artifacts;
- authentication remains browser-owned;
- repository fixtures remain sanitized/synthetic;
- no WAF/CSP bypass.

### ADAPT

Later protocol design must explicitly define:

- loopback-only bind;
- accepted WebSocket Origin(s);
- message schema/size validation;
- connection/session identity that does not copy bank credentials;
- failure/backpressure behavior;
- which market payload fields cross the bridge.

## 12. Inventory exit rule

Stage 03 is complete when:

1. every major Browser-SQL repository surface has a deterministic KEEP/ADAPT/ARCHIVE/RETIRE disposition;
2. no deletion/Issue closure is performed merely from this inventory;
3. successor ownership must exist before RETIRE actions execute;
4. Stage 04 can derive the replacement Node-SQL requirement set without rereading all historical Browser-SQL planning.
