# Browser SQL — Runtime Delivery and Authenticated-Browser Integration

This is the Phase J planning artifact for Local History Viewer V2.

It defines the generated Browser SQL delivery package, the authenticated-Leumi bootstrap boundary, pinned DuckDB-Wasm asset loading, capability/CSP checks, Runtime Controller / SQL Worker lifecycle and explicit startup failure behavior.

It does not define Viewer/result messaging details; those belong to Phase K.

Durable decision: ../../../../../../../docs/project/decisions/D-031.md

## 1. Selected delivery shape

The Browser-only target keeps Market Flow application code self-contained in the generated runtime/Bookmarklet, while DuckDB's large Worker/Wasm assets are loaded from exact pinned immutable URLs.

Target:

~~~text
generated Market Flow Bookmarklet
  contains:
    Market Flow application/runtime code
    bundled @duckdb/duckdb-wasm main JavaScript library
    exact engine asset manifest

authenticated Leumi page
→ Bookmarklet bootstrap
→ capability/preflight gate
→ Blob SQL Worker bootstrap
→ exact pinned DuckDB Worker asset
→ exact matching DuckDB Wasm asset
→ DuckDB-Wasm AsyncDuckDB
→ opfs://market-flow-v2.duckdb
~~~

No Market Flow business logic is fetched dynamically from an external server at runtime.

## 2. Why the current fully self-contained Bookmarklet must evolve

The inherited V2 runtime is a concatenated self-contained JavaScript Bookmarklet.

DuckDB-Wasm deployment adds distinct artifacts:

- main JavaScript library;
- JavaScript Worker;
- Wasm engine module;
- optional extensions;
- optional pthread worker for threaded builds.

Embedding every binary byte directly into a Bookmarklet would create unnecessary size and maintenance pressure.

Selected compromise:

~~~text
Market Flow code + DuckDB main JS = bundled into generated runtime
DuckDB Worker/Wasm binaries        = exact pinned external assets
~~~

This preserves repository-owned application logic while avoiding a huge inline Wasm payload.

## 3. Engine bundle baseline

Only the normal single-thread bundle family is required:

~~~text
preferred when supported: eh
fallback:                 mvp
not required:             coi
~~~

The runtime may use DuckDB's feature selection between eh and mvp.

The coi/threaded bundle is excluded from the required delivery package because Phase E established single-thread-first and the Leumi page is not known to be cross-origin isolated.

## 4. Exact asset versioning

The generated runtime contains one immutable engine asset manifest tied to the exact installed/pinned @duckdb/duckdb-wasm package.

Conceptual generated manifest:

~~~text
duckdbPackageVersion
embeddedDuckdbCoreVersion when available
assetBaseUrl
mvp.workerUrl
mvp.wasmUrl
eh.workerUrl
eh.wasmUrl
build/runtime version
~~~

Rules:

- never generate URLs containing an unpinned latest or next tag;
- Worker and Wasm for a selected bundle must come from the same exact package artifact;
- package lock + generated manifest must agree;
- changing engine version is an explicit reviewed dependency change;
- Phase I write/CHECKPOINT/reopen verification remains mandatory before authority cutover.

## 5. Asset host

The implementation baseline uses an immutable HTTPS CDN path capable of serving the exact pinned @duckdb/duckdb-wasm distribution artifacts.

The official DuckDB-Wasm CDN pattern through jsDelivr is the initial target because it is documented by DuckDB and supports mvp/eh bundle selection.

The exact package version is embedded in the generated asset URLs.

No automatic fallback to another version, another CDN or latest is allowed.

If the configured asset host is unavailable or blocked, startup fails explicitly.

A future mirrored asset host may be introduced only if it serves byte-equivalent pinned artifacts and is covered by the same verification contract.

## 6. Worker construction and origin

The selected browser bootstrap follows the official CDN pattern:

~~~text
page runtime
→ create Blob wrapper
→ Blob worker importScripts(exact pinned DuckDB worker URL)
→ new Worker(blobUrl)
→ AsyncDuckDB(worker)
→ instantiate(exact matching Wasm URL)
~~~

A blob: Worker inherits the creating document's origin in the target browser model.

This is important because the SQL Worker must own the Leumi-origin OPFS database selected in Phase I.

The temporary Blob URL is revoked after successful Worker startup.

## 7. Main JavaScript library ownership

The @duckdb/duckdb-wasm main JavaScript library is bundled at build time into the generated Market Flow runtime.

It is not fetched as executable application JavaScript during launch.

The runtime build therefore evolves from source concatenation to a real deterministic bundling step capable of resolving the pinned npm package.

This is a planned build-system change, not implementation in Phase J.

## 8. Required preflight/capability gate

Before starting Recorder collection, Runtime Controller must prove the required capabilities in the actual page context.

Required checks:

~~~text
supported Chrome/Chromium environment
Worker constructor available
Blob + URL.createObjectURL available
WebAssembly available
OPFS / navigator.storage.getDirectory capability available as required by pinned DuckDB path
StorageManager APIs observable where supported
exact pinned DuckDB Worker can start
exact pinned Wasm can instantiate
persistent database can open/reopen readiness path
~~~

Static feature existence alone is not enough for CSP-sensitive capabilities. The startup must actually exercise the Worker/Wasm path before declaring SQL Authority READY.

## 9. CSP boundary

Potential blockers include:

~~~text
worker-src / fallback directives blocking blob:
script-src/default-src blocking imported Worker code
script-src policy blocking WebAssembly compilation without wasm-unsafe-eval or equivalent permitted behavior
connect/network policy blocking the Wasm/asset URL
Trusted Types or other page policy affecting dynamic URL construction
~~~

The runtime does not attempt to weaken or bypass the bank's CSP.

If policy blocks a required capability:

~~~text
SQL Authority startup = failed
Recorder = not started
no fallback to IndexedDB authority
no partial Browser SQL mode
diagnostic = explicit blocked capability / stage
~~~

Resolving a real Leumi CSP incompatibility requires a later evidence-driven delivery decision; it is not hidden by fallback behavior.

## 10. Startup state machine

Target Runtime Controller states:

~~~text
idle
preflighting
loading-engine
opening-database
recovering
ready
failed
stopping
~~~

Conceptual sequence:

~~~text
Bookmarklet invoked
→ create/reuse Runtime Controller
→ preflight browser/CSP/storage capabilities
→ load exact pinned engine assets
→ create SQL Authority Worker
→ instantiate DuckDB-Wasm
→ open/recover OPFS database
→ schema/readiness/recovery checks from Phase I
→ SQL Authority READY
→ start Recorder
→ start/restore analytical scheduler
~~~

Recorder is downstream of SQL readiness, never parallel with engine bootstrap.

## 11. Repeated launch / singleton behavior

Launching the Bookmarklet again while a healthy Runtime Controller already owns the SQL Authority:

~~~text
reuse existing controller
→ do not create second SQL Worker
→ do not open a second OPFS handle
→ expose/focus Viewer behavior later defined by Phase K
~~~

If the existing controller is failed/recovery-required, repeated launch reports/re-enters the explicit recovery path rather than silently creating a competing owner.

## 12. Runtime Controller responsibility

Runtime Controller owns:

- singleton lifecycle;
- capability/preflight state;
- SQL Worker creation/termination;
- engine asset configuration;
- readiness/failure state;
- Recorder start/stop orchestration;
- Worker restart/recovery handoff;
- bridge endpoint for Viewer/result transport defined later.

It does not become the market-history source of truth.

## 13. SQL Worker responsibility

SQL Authority Worker owns:

- DuckDB-Wasm instance and connection lifecycle;
- OPFS handle/database;
- schema/recovery/migration commands;
- market-cycle persistence;
- query scheduler/execution;
- durable query/config state;
- structured Worker status/errors.

It does not perform authenticated Leumi provider fetches.

## 14. Authenticated-provider boundary

Provider collection remains in the authenticated Leumi page runtime.

Reason:

- current collection behavior is already proven there;
- no cookies/session tokens need to be copied into SQL Worker;
- changing network/security context is unnecessary;
- SQL Worker receives only validated market data and runtime commands.

## 15. Generated artifacts

Planned generated outputs:

~~~text
runtime/dist/market-flow-v2.runtime.js
runtime/dist/market-flow-v2.bookmarklet.txt
runtime/dist/market-flow-v2.runtime-manifest.json
~~~

runtime-manifest.json records at minimum:

- Market Flow build/version identity;
- exact DuckDB-Wasm package version;
- selected asset base/versioned URLs;
- expected bundle names;
- build timestamp/commit metadata where reproducibly appropriate.

The runtime itself also contains the exact engine manifest it uses so runtime behavior does not depend on fetching the manifest separately.

Generated dist remains derived output, not hand-edited source.

## 16. Build/source ownership

Repository source remains authoritative.

Planned build inputs:

~~~text
Market Flow source modules
+ runtime entry/controller sources
+ pinned @duckdb/duckdb-wasm main JS dependency
+ engine asset-manifest generator
→ deterministic bundler
→ readable runtime
→ compact Bookmarklet
→ inspection manifest
~~~

The current no-mangling/readable compact-delivery principle should be retained where technically practical, but exact bundler/minifier settings become implementation details.

## 17. Release/publication contract

Browser CI remains the gate before publishing a user-facing generated runtime.

A release must not mix:

- runtime generated from commit A;
- engine manifest from package B;
- Worker/Wasm URL from version C.

Release evidence must identify the repository commit and exact engine package version.

The existing rolling runtime release may be extended rather than replaced, but publication details are implementation planning items.

## 18. No silent dependency loading

Startup must report which step failed:

~~~text
bookmarklet bootstrap
browser capability
Worker creation
remote Worker asset load
Wasm fetch/compile/instantiate
OPFS open
schema/recovery
SQL readiness
~~~

Do not collapse these into a generic 'DuckDB failed' message.

Sanitized diagnostics must not include browser authentication/session secrets.

## 19. Live verification boundary

CI can prove generated runtime behavior in Chromium with deterministic pages and controlled CSP fixtures.

CI cannot by itself prove the real authenticated Leumi page permits:

- javascript: Bookmarklet execution;
- blob: Worker creation;
- remote DuckDB Worker import;
- Wasm compilation;
- pinned CDN Wasm fetch;
- OPFS behavior under the real page origin/policy.

Those remain explicit authenticated-browser verification gates before cutover.

## 20. Rejected alternatives

### Fully inline Wasm Bookmarklet

Rejected as baseline because embedding the full engine binary in the Bookmarklet adds large avoidable packaging cost with no proven requirement.

### Runtime application code fetched remotely

Rejected as baseline because Market Flow application/business logic can remain repository-built and self-contained.

### Floating CDN latest

Rejected because Phase I requires exact persistence-tested engine identity.

### Automatic fallback to IndexedDB

Rejected because it would create ambiguous authority and hide Browser SQL startup failure.

### Automatic alternate CDN/version fallback

Rejected because recovery must not silently change the engine artifact.

### Extension/local server as parallel baseline

Rejected from the current target because D-025 fixes Browser-only page integration and there is no evidence yet that the simpler page-runtime path is impossible.

## 21. Acceptance scenarios

J-A1: generated runtime identifies one exact DuckDB-Wasm package and exact matching Worker/Wasm asset URLs.

J-A2: repeated launch reuses one healthy SQL Authority and never creates a second OPFS owner.

J-A3: blocked blob Worker causes explicit startup failure before Recorder starts.

J-A4: blocked Wasm compile/fetch causes explicit startup failure before Recorder starts.

J-A5: engine asset 404/version mismatch causes explicit startup failure; no alternate version is selected.

J-A6: successful preflight + engine instantiate + OPFS recovery reaches READY before Recorder begins.

J-A7: Market Flow application code executes from the generated runtime rather than being dynamically downloaded at launch.

J-A8: exact pinned engine assets are used consistently across runtime manifest, Worker and Wasm.

J-A9: CI fixture can model CSP/capability failure states without requiring real bank credentials.

J-A10: real authenticated-Leumi compatibility remains a named live-verification gate and is never inferred from mock Chromium success.

## 22. Official evidence

- DuckDB-Wasm instantiation/bundle selection: https://duckdb.org/docs/current/clients/wasm/instantiation
- DuckDB-Wasm deployment components: https://duckdb.org/docs/current/clients/wasm/deploying_duckdb_wasm
- MDN worker-src CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/worker-src
- MDN script-src / wasm-unsafe-eval: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
- MDN Worker constructor / blob URL behavior: https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker

## 23. Deferred

Phase J does not decide:

- Viewer/result messaging protocol;
- SQL editor/result UI;
- exact result preview cap;
- migration/cutover from IndexedDB;
- final benchmark thresholds;
- real Leumi CSP outcome before live verification.

## 24. Completion result

~~~text
self-contained Market Flow generated runtime
+ bundled pinned DuckDB main JS
+ exact versioned external DuckDB Worker/Wasm assets
+ Blob same-origin SQL Worker
+ explicit capability/CSP preflight
+ one Runtime Controller / one SQL Authority
+ no silent fallback
+ generated runtime manifest
~~~

## Phase U multi-tab startup extension

Generated runtime startup order is: local singleton reuse → Web Locks capability → fail-fast exclusive V2 runtime-owner acquisition → only then Worker/OPFS/readiness/Recorder. The ownership lock lifetime wraps the complete runtime and is released on clean shutdown only after Recorder/DB/Worker shutdown. Normal runtime never requests `steal:true` and has no localStorage/IndexedDB/heartbeat fallback.


## Phase V release compatibility manifest

The generated runtime manifest is a compatibility unit, not only an asset list. It records release/build, exact DuckDB-Wasm package/core/bundle assets, storage_compatibility_target, Market Flow schema/support range and migration_set_id. Startup acquires the Phase-U owner lock, then makes a read-only compatibility decision before any writable DB/provider/scheduler activity. Runtime/Worker/Wasm/migration identities from different releases must never be mixed.
