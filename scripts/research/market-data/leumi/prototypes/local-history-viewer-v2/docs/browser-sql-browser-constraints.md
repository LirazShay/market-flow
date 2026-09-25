# Browser SQL — Browser / Platform Constraint Matrix

This document is the Phase C planning artifact for the Browser SQL migration.

It defines browser/platform boundaries that later capability research and target architecture must satisfy.

It does not select DuckDB-Wasm, OPFS, Worker topology, persistence APIs or packaging mechanisms.

Live progress belongs only in `../STATUS.json`.

Use:

~~~text
Fixed Decision
Verified Baseline
Design Constraint
Unknown
Out of Scope
~~~

## 1. Target platform

| ID | Class | Constraint | Consequence |
|---|---|---|---|
| BC-01 | Fixed Decision | The target is Browser-only SQL. | No localhost/Node/.NET/native DB design in this planning cycle. |
| BC-02 | Fixed Decision | Primary supported environment is Chrome/Chromium on Windows. | Safari/Firefox/mobile parity is outside current scope. |
| BC-03 | Fixed Decision | Provider authentication remains in the authenticated Leumi browser context. | SQL architecture integrates around the existing collector rather than adding another authentication path. |
| BC-04 | Design Constraint | Missing required browser capabilities must fail explicitly. | No silent degradation to partial/corrupt storage or weaker query behavior. |
| BC-05 | Design Constraint | Runtime activation must eventually use explicit feature/capability checks. | Do not rely on optimistic browser assumptions. |

## 2. Origin and same-origin boundary

### Verified baseline

Current V2 already uses:

~~~text
authenticated Leumi page
+
same-origin Viewer
+
browser-local persisted state
~~~

The Viewer is intentionally opened in a same-origin context so it can access the current browser database.

This proves the inherited V2 behavior only; it does not decide the future SQL topology.

### Constraints and unknowns

| ID | Class | Constraint / question |
|---|---|---|
| BC-06 | Design Constraint | Target architecture must identify exactly which browser origin owns the authoritative SQL database. |
| BC-07 | Design Constraint | Collector, SQL owner and Viewer access must be compatible with that authority boundary. |
| BC-08 | Design Constraint | A Viewer must never become an independent market-history authority. |
| BC-09 | Unknown | Exact persistence visibility and locking behavior across same-origin windows/workers for the selected SQL stack. |
| BC-10 | Unknown | Exact behavior across page navigation, logout/login and any origin change. |
| BC-11 | Unknown | Whether Viewer reads the SQL DB directly or receives results through a single DB owner. |

## 3. CSP / CORS / modules / Workers / WASM

### Verified baseline

Current V2 produces a self-contained Bookmarklet/runtime and does not fetch application code from an external runtime host.

This does not prove future WASM/Worker/module loading will work the same way.

### Constraints and unknowns

| ID | Class | Constraint / question |
|---|---|---|
| BC-12 | Design Constraint | Browser SQL delivery must respect the bank page and browser security policies. |
| BC-13 | Design Constraint | Do not bypass CSP, origin controls, browser security restrictions or access controls. |
| BC-14 | Unknown | Actual Leumi CSP directives affecting Worker, module, blob, WASM and external asset loading. |
| BC-15 | Unknown | Required Worker form and compatibility with the selected engine/page environment. |
| BC-16 | Unknown | Whether WASM/Worker assets can remain self-contained or need another browser-only delivery mechanism. |
| BC-17 | Unknown | CORS/integrity/version-pinning needs for non-embedded assets. |
| BC-18 | Design Constraint | If Bookmarklet delivery becomes impractical, the replacement delivery mechanism must still remain Browser-only. |

## 4. Page and tab lifecycle

### Verified baseline

Current Recorder/runtime state is in browser JavaScript memory while running.

Persisted data, not Viewer memory, is what enables current Viewer reload/reopen recovery.

### Constraints and unknowns

| ID | Class | Constraint / question |
|---|---|---|
| BC-19 | Design Constraint | Browser SQL correctness must not depend solely on ephemeral JavaScript state. |
| BC-20 | Design Constraint | Refresh/reopen requires an explicit recovery path from committed authoritative data. |
| BC-21 | Design Constraint | Collector and SQL scheduler correctness must not depend on the Viewer remaining open. |
| BC-22 | Unknown | Hidden/background-tab timer throttling relevant to collector and SQL scheduling. |
| BC-23 | Unknown | Worker behavior when its owning tab is hidden, suspended, navigated or closed. |
| BC-24 | Unknown | What page refresh does to the selected SQL Worker/connection and required restart sequence. |
| BC-25 | Unknown | Session/browser restoration implications for DB ownership/locks. |

## 5. Persistence, quota and eviction

Persistent Browser SQL is required, but Phase C does not assume OPFS is sufficient.

| ID | Class | Constraint / question |
|---|---|---|
| BC-26 | Design Constraint | Refresh must not silently erase committed market history. |
| BC-27 | Design Constraint | Storage exhaustion/write failure must be observable and must not create partial successful market state. |
| BC-28 | Design Constraint | Storage usage/capacity must be observable enough to detect growth risk. |
| BC-29 | Design Constraint | Do not silently delete history to hide quota pressure without an explicit retention policy. |
| BC-30 | Unknown | Exact persistent-storage API used by the selected Browser SQL engine. |
| BC-31 | Unknown | Current Chrome/Chromium quota, persistence and eviction behavior relevant to the target origin. |
| BC-32 | Unknown | Large DB/file behavior and recovery after quota/disk/write failure. |
| BC-33 | Unknown | Whether the selected persistence design needs explicit persistence requests/permissions. |

## 6. Ownership and concurrency

### Verified inherited principle

Current V2 has one Recorder owner and allows multiple Viewer windows without making each Viewer an authority.

### Browser SQL constraints

| ID | Class | Constraint / question |
|---|---|---|
| BC-34 | Design Constraint | Exactly one component must coordinate authoritative successful-cycle writes. |
| BC-35 | Design Constraint | SQL must never observe a half-committed cycle. |
| BC-36 | Design Constraint | Multiple UI contexts must not race to mutate authoritative market history independently. |
| BC-37 | Unknown | Whether selected engine supports one writer plus readers, serializes access, or needs one Worker/connection owner for all DB access. |
| BC-38 | Unknown | Locking/concurrency across tabs/workers/connections. |
| BC-39 | Unknown | Whether scheduled user SQL may run concurrently with ingest or should serialize around commits. |
| BC-40 | Unknown | Whether Viewer can safely own a read connection or should request results from a central owner. |

Do not copy the IndexedDB/BroadcastChannel implementation automatically. Preserve correctness behavior, not accidental implementation.

## 7. Messaging

Current baseline:

~~~text
durable commit
→ metadata notification
→ Viewer rereads source of truth
~~~

This remains a useful pattern, but the mechanism is open.

| ID | Class | Constraint / question |
|---|---|---|
| BC-41 | Design Constraint | Notifications/results must not create a competing source of truth. |
| BC-42 | Design Constraint | Losing a notification must not corrupt authoritative DB state. |
| BC-43 | Unknown | Whether BroadcastChannel remains appropriate with a SQL Worker/connection owner. |
| BC-44 | Unknown | Whether result delivery uses DB reread, message payloads, Worker responses or a combination. |

## 8. Security

| ID | Class | Constraint |
|---|---|---|
| BC-45 | Fixed Decision | Provider cookies/session tokens/authorization remain browser-owned and are not moved to repository artifacts or a local service. |
| BC-46 | Design Constraint | SQL engine inputs should contain market/query data needed for analytics, not copied authentication secrets merely for convenience. |
| BC-47 | Design Constraint | Repository fixtures and benchmarks use sanitized synthetic data. |
| BC-48 | Design Constraint | Runtime delivery must not require bypassing bank/browser security controls. |
| BC-49 | Design Constraint | User analytical SQL must not accidentally become an unrestricted schema/persistence-admin channel; exact enforcement is later design/research. |

## 9. Compatibility scope

### In scope

~~~text
Chrome / Chromium
Windows
authenticated Leumi browser
same-origin browser integration
persistent browser SQL
Workers/WASM where required
~~~

### Out of scope

~~~text
Safari
Firefox
mobile browsers
server-side SQL
localhost SQL service
Node/.NET/native database runtime
cross-device database sync
~~~

## 10. Required Phase D evidence questions

Official capability research must answer, where documentation can prove it:

1. What is the current DuckDB-Wasm browser/Worker architecture?
2. What persistent browser filesystem/database mechanisms are officially supported?
3. What are the transaction/connection/concurrency semantics?
4. How are Worker and WASM assets loaded?
5. What browser requirements exist for OPFS or equivalent persistence?
6. What cancellation/interruption support exists for user SQL?
7. What JSON and Arrow/bulk-ingest mechanisms exist?
8. What browser/WASM memory/resource limitations are documented?
9. What APIs support persistent DB reopen/recovery?
10. Which Leumi-specific questions remain unprovable without later authenticated-browser verification?

## 11. Phase C completion boundary

Phase C is complete when later work can distinguish:

~~~text
already fixed
vs
verified inherited behavior
vs
browser design constraint
vs
engine/browser capability unknown
~~~

This phase intentionally stops before answering engine-specific unknowns.


## Phase U cross-tab ownership constraint

A page-local singleton is not sufficient. The target requires the secure-context Web Locks API to acquire one stable exclusive `market-flow:local-history-viewer-v2:runtime-owner` lock before any production SQL Worker/OPFS/provider startup. BroadcastChannel/heartbeat/query snapshots never grant ownership, and `steal:true` is forbidden. WP-03 must verify two-tab behavior on the real authenticated Leumi origin.

## Phase W resolution index for Phase-C unknowns

Phase C intentionally recorded unknowns before engine/design research. Their current owners are:

- CSP/Worker/Wasm/external assets → D-031, WP-01/WP-03 live gate;
- OPFS persistence/reopen/quota → D-030/D-038, WP-06/WP-39;
- DB ownership/concurrency/Viewer direct access → D-026/D-032/D-040, WP-41;
- ingest/query scheduling and cancellation → D-029/D-039, WP-18/WP-40;
- hidden/background behavior and capacity → D-034, WP-35;
- cross-tab locking → D-040, WP-03/WP-41;
- release/schema/storage compatibility → D-041, WP-42.

Any exact browser/provider behavior still requiring real evidence is therefore an explicit implementation/live/benchmark gate, not an unowned planning gap.