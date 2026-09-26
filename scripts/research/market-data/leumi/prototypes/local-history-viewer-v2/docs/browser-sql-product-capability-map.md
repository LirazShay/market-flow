# Browser SQL V2 — Product Capability Map

## Role

This is Pass A of the D-043 execution-plan re-baseline.

It derives the required V2 capabilities **from the product backward**, independently from the existing Work Package list.

It intentionally does **not** decide which current WP survives, which Issue owns a capability, or the final implementation order. Those are later audit passes.

Operational progress remains only in `../STATUS.json`.

Product authorities:

~~~text
../../../../../../../docs/product/local-history-viewer-v2-product-shape.md
../../../../../../../docs/product/live-sql-query-execution.md
../../../../../../../docs/product/live-opportunity-discovery.md
../../../../../../../docs/project/decisions/D-043.md
~~~

## 1. Product boundary

V2 is not a new market-data collector.

The product boundary is:

~~~text
same proven V1 provider/data acquisition
→ SQL-backed durable authority
→ preserve the two V1-derived browsing experiences
→ add a separate Dynamic SQL Scanner
~~~

The initial V2 product does not include trade placement, automatic order execution, position management or a fixed trading formula.

## 2. Capability classes

This map distinguishes four kinds of capability:

~~~text
CORE
= required observable V2 product behavior

ANALYTICAL
= required analytical capability already established by V2 product direction,
  but not necessarily needed to prove basic V1-on-SQL parity

CORRECTNESS
= non-optional integrity/security/recovery capability required for a trustworthy implementation

CONDITIONAL
= mechanism/hardening that is not inherently part of the product;
  it must be justified later by evidence, scale or lifecycle requirements
~~~

This classification is not the final execution order.

---

# 3. Provider and collection continuity

## CAP-COL-01 — authenticated page-context collection [CORE]

Collection continues to run in the authenticated Leumi browser/page context.

No second authentication path is introduced for SQL.

## CAP-COL-02 — dynamic universe discovery [CORE]

The product continues to obtain the current universe from MapHeat2.

Requirements:

- no hardcoded universe size;
- canonical identity remains `String(PaperId or Key)`;
- universe membership is provider-derived.

## CAP-COL-03 — proven sequential security collection [CORE]

The existing GetSecuritiesData flow remains the collection baseline.

Storage migration alone does not justify changing:

- endpoint semantics;
- chunk/request semantics;
- response interpretation.

## CAP-COL-04 — exact complete-cycle validation [CORE]

Before a cycle can become durable success, the system must validate as relevant:

~~~text
requested
received
unique
duplicates
missing
unexpected
response shape
~~~

Partial or uncertain data is never promoted to a successful market cycle.

## CAP-COL-05 — source-fact preservation [CORE]

A validated cycle preserves:

- full raw MapHeat records;
- full raw GetSecuritiesData Security objects;
- canonical SecurityId;
- source timing evidence;
- `null != 0 != "" != undefined`;
- unknown provider semantics as unknown.

## CAP-COL-06 — collector lifecycle and no-overlap behavior [CORE]

The collector must continue to have explicit start/stop/error health and must not create overlapping collection cycles that weaken complete-cycle reasoning.

## CAP-COL-07 — provider failure isolation [CORRECTNESS]

Provider or validation failure:

~~~text
does not create partial durable market success
does not fabricate empty success
does not corrupt the previous committed state
~~~

---

# 4. SQL durable market-data authority

## CAP-DB-01 — Browser SQL can actually run on the target origin [CORRECTNESS]

The selected browser SQL engine must be proven to work in the real authenticated Leumi environment with the required Worker/Wasm/storage primitives before dependent production use.

## CAP-DB-02 — one authoritative market-history owner [CORRECTNESS]

At any instant there is one production market-history authority.

After SQL cutover:

~~~text
DuckDB-Wasm + OPFS
= active market-history authority
~~~

Viewer clients are not independent DB owners.

## CAP-DB-03 — persistent reopen/recovery [CORE]

Committed SQL history must survive:

- Viewer close/reopen;
- page/runtime restart;
- SQL Worker recreation;
- normal browser reopen scenarios supported by the target.

A reopen failure is explicit; the system does not silently reset data.

## CAP-DB-04 — stable market-data identity model [CORE]

The SQL model must represent, at minimum:

- recording/run/session identity;
- dynamic current universe;
- complete collection cycle identity;
- stable per-security historical snapshot identity;
- current/latest pointer per security;
- full raw provider facts.

## CAP-DB-05 — atomic successful-cycle persistence [CORE]

One validated cycle must become visible coherently.

At minimum these concepts advance together:

~~~text
cycle
history snapshots
current universe
latest/current pointers
required cycle metadata
~~~

Failure before successful commit leaves no partial successful cycle.

## CAP-DB-06 — durable acknowledgement boundary [CORRECTNESS]

The collector may expose a durable-successful cycle only after the SQL authority confirms the required durability boundary.

Ambiguous retry/restart must not create duplicate successful cycles.

## CAP-DB-07 — truthful current and history read contracts [CORE]

The SQL authority must provide stable read behavior for:

~~~text
all latest/current securities
one selected security current/detail data
one selected security chronological history
history continuation/paging
~~~

These are product read contracts, not merely ad-hoc SQL snippets hidden inside UI code.

## CAP-DB-08 — raw historical SQL queryability [ANALYTICAL]

User SQL must be able to reach the complete preserved historical market facts needed for unforeseen future comparisons.

Typed/promoted fields may optimize common queries but do not replace raw facts.

---

# 5. Shared Viewer/application shell

## CAP-UI-01 — explicit three-surface navigation [CORE]

The user-facing application has a clear navigation model for:

~~~text
Current Universe
Security Detail/History
Dynamic SQL Scanner
~~~

Security Detail may be a drill-down state rather than a permanently visible top-level tab, but the product must make the three capabilities unambiguous.

## CAP-UI-02 — one shared runtime/data authority [CORRECTNESS]

All surfaces observe one coherent committed authority.

Navigating between surfaces must not create:

- another collector;
- another production DB owner;
- another independent market-data truth.

## CAP-UI-03 — recoverable Viewer attachment [CORE]

Opening/reloading the Viewer reconstructs current presentation from authoritative/runtime state without requiring a historical notification to have been observed.

## CAP-UI-04 — common health/freshness/error presentation [CORE]

The UI must expose enough state to distinguish at least:

- loading;
- no committed data yet;
- healthy current data;
- stale/stopped collector;
- read/runtime/query error where applicable.

Failed reads are not rendered as successful emptiness.

## CAP-UI-05 — preserved V1 usability baseline [CORE]

Where still relevant after the storage change, preserve the proven V1 interaction baseline:

- Hebrew/RTL desktop target;
- deterministic display formatting;
- visible distinction between zero and missing;
- accessible real controls/focus;
- no provider fetch merely because the user refreshes a Viewer surface.

---

# 6. Surface 1 — Current Universe

## CAP-CUR-01 — all latest committed securities [CORE]

The Current Universe surface shows one latest committed row for every current security represented by the last complete cycle.

A security must not disappear merely because optional metadata is absent.

## CAP-CUR-02 — V1 bank-data field continuity [CORE]

The surface continues to expose the relevant V1 bank fields, including identity, LAST/change, BID/ASK, activity/volume and collection timing, subject to proven provider semantics.

## CAP-CUR-03 — deterministic sorting [CORE]

The V1-derived current table retains deterministic sorting behavior.

Default/interactive sorting is a presentation capability, distinct from Dynamic SQL Scanner ordering.

## CAP-CUR-04 — live refresh from committed state [CORE]

After a new successful cycle, the surface can update from the authoritative committed state while preserving appropriate UI state.

Manual refresh is DB/runtime-state only and never triggers provider collection.

## CAP-CUR-05 — row-to-security drill-down [CORE]

Activating a current-universe row opens the existing Security Detail/History capability for that canonical SecurityId.

---

# 7. Surface 2 — Security Detail / History

## CAP-DET-01 — selected-security summary [CORE]

The user can inspect current/detail data for one canonical SecurityId.

## CAP-DET-02 — persisted chronological history [CORE]

The user can inspect the stored history for that security independently from other securities.

## CAP-DET-03 — bounded history loading [CORE]

The Viewer must not require unbounded history DOM/materialization.

It supports a bounded initial history page and explicit continuation/load-older semantics without duplicate/skip errors at the boundary.

The exact page size is an implementation/UX tuning value unless later fixed deliberately.

## CAP-DET-04 — detail live continuity [CORE]

When new committed data arrives for the selected security, the detail experience can refresh without unexpectedly returning the user to another surface.

## CAP-DET-05 — return-state continuity [CORE]

Returning from detail preserves useful Current Universe presentation state such as sort/position where practical.

---

# 8. Surface 3 — Dynamic SQL Scanner

## CAP-SCN-01 — editable user SQL [CORE]

The user can edit the analytical SQL without changing collector/application source code.

## CAP-SCN-02 — configurable repeat interval [CORE]

The user chooses the Scanner execution interval independently from the market-data collection cadence.

## CAP-SCN-03 — explicit activation/lifecycle state [CORE]

The Scanner has a clear lifecycle for the active SQL definition and interval.

At minimum the product distinguishes:

- draft/editing state;
- active definition;
- execution in progress;
- last success;
- latest failure/error.

Whether a dedicated pause/off control is needed will be decided from UX, but the active-vs-draft boundary is required.

## CAP-SCN-04 — safe analytical SQL boundary [CORRECTNESS]

User SQL is analytical/read-only.

It must not be able to mutate authoritative market history or become an unintended file/network/extension/admin surface.

## CAP-SCN-05 — repeated non-overlapping execution [CORE]

The active SQL executes repeatedly with deterministic behavior when one execution takes longer than its configured interval.

Concurrent overlapping executions of the same active Scanner are not allowed.

## CAP-SCN-06 — committed-state query semantics [CORE]

Scanner SQL observes coherent committed market state.

It must not see a half-persisted collection cycle.

## CAP-SCN-07 — query failure isolation [CORE]

A syntax/runtime query failure:

- is visible;
- does not corrupt market data;
- does not turn ingestion into failure;
- does not erase the identity of the previous successful result.

## CAP-SCN-08 — dynamic result grid [CORE]

The result grid renders the active SQL result schema dynamically:

- arbitrary selected columns;
- 0..N rows;
- zero rows as successful empty result;
- explicit execution/error/timing/count metadata;
- visible truncation if UI preview is intentionally bounded.

The UI does not silently apply a second independent filter/ranking algorithm that changes the SQL meaning.

## CAP-SCN-09 — expressive SQL [CORE]

The Scanner supports the analytical constructs already required by the product direction, where meaningful:

~~~text
SELECT
JOIN
WHERE
GROUP BY
HAVING
ORDER BY
LIMIT
window functions
historical/time conditions
cross-security ranking
~~~

## CAP-SCN-10 — SecurityId drill-down [CORE]

If a Scanner result exposes canonical SecurityId, the user can navigate to the existing Security Detail/History capability.

This is navigation only; it starts no trade/order workflow.

## CAP-SCN-11 — active definition recovery [CORE]

The currently active SQL definition and interval must have defined reload/restart semantics so the Scanner does not silently become a different query after runtime recovery.

---

# 9. Analytical data capabilities

These are required by the already-established live-analysis direction, but they are separate from basic Current/History parity.

## CAP-AN-01 — stable historical SnapshotId [ANALYTICAL]

Every persisted historical security snapshot has stable identity so other analytical structures/snapshots can refer to the exact row.

## CAP-AN-02 — canonical core horizons [ANALYTICAL]

The analytical model has one canonical definition for the current core horizons:

~~~text
10s
20s
30s
60s
90s
120s
300s
600s
~~~

The definition is not scattered as unrelated magic numbers.

## CAP-AN-03 — persisted historical predecessor links [ANALYTICAL]

Each historical snapshot can retain references to the appropriate same-security predecessor snapshots for the core horizons.

Missing history remains NULL.

Natural collection jitter must be handled by the defined predecessor-selection rule rather than requiring millisecond equality.

## CAP-AN-04 — core LAST-change metrics [ANALYTICAL]

For each supported horizon, the snapshot can expose the precomputed LAST/rate percentage change when the required source facts exist.

Missing predecessor/source/valid denominator yields NULL rather than invented data.

## CAP-AN-05 — deal-activity deltas only after semantics proof [ANALYTICAL]

Horizon deal-count deltas are a desired analytical capability, but production population is conditional on verified cumulative deal-count semantics.

The platform must not infer those semantics from a field name.

## CAP-AN-06 — cheap repeatedly useful same-row metrics [ANALYTICAL]

Cheap repeatedly useful values such as MID may be persisted when their input mappings are verified.

The product does not require precomputing every possible derived value.

## CAP-AN-07 — arbitrary cross-time field comparison [ANALYTICAL]

Because raw historical rows and stable links exist, user SQL can compare unusual combinations dynamically rather than requiring a permanent column for every possible comparison.

## CAP-AN-08 — historical aggregation and cross-security ranking [ANALYTICAL]

The data model/query layer supports questions over recent history such as:

- count qualifying windows;
- GROUP BY/HAVING over a security;
- rank current securities against the universe;
- combine current and historical predicates.

Distinct-wave semantics are not yet a defined product contract.

---

# 10. Runtime correctness and ownership

## CAP-RUN-01 — reproducible Browser SQL delivery [CORRECTNESS]

The browser runtime is generated reproducibly from repository source and exact compatible engine assets.

Generated delivery is not maintained as a hand-edited fork.

## CAP-RUN-02 — single active runtime/collector/storage owner [CORRECTNESS]

Multiple same-origin tabs must not create simultaneous production collectors/DB owners.

The implementation mechanism may be Web Locks or another proven browser primitive, but the capability is singleton ownership.

## CAP-RUN-03 — detachable Viewer clients [CORE]

Viewer windows can attach/re-attach without owning the production SQL database.

Closing a Viewer does not inherently stop collection/storage.

## CAP-RUN-04 — runtime restart recovery [CORRECTNESS]

Unexpected runtime/Worker loss has defined recovery behavior.

Recovery never fabricates successful persistence or silently starts a second owner.

## CAP-RUN-05 — secrets stay at the provider edge [CORRECTNESS]

No runtime/repository artifact requires copying cookies, session tokens, authorization headers, credentials, account numbers or private session dumps into SQL/Worker/test artifacts.

## CAP-RUN-06 — bounded diagnostics/debug evidence [CORRECTNESS]

Failures expose sanitized enough information to distinguish provider, storage, runtime, Viewer and Scanner failure domains without persisting secrets.

---

# 11. Verification capabilities

## CAP-VER-01 — V1 collection characterization/parity proof [CORRECTNESS]

Before intentionally changing collector behavior, deterministic fixtures/tests and live verification must prove which V1 provider/validation behaviors are being preserved.

## CAP-VER-02 — V1 Viewer behavior parity proof [CORRECTNESS]

Current Universe and Security Detail/History need explicit observable parity tests for the behavior that V2 promises to retain.

This is distinct from generic SQL-engine tests.

## CAP-VER-03 — real Chromium persistence/integration proof [CORRECTNESS]

Worker/Wasm/OPFS/Viewer/window/ownership behavior is verified in real Chromium rather than mocked away.

## CAP-VER-04 — authenticated-Leumi capability/provider gates [CORRECTNESS]

Real-origin behavior that CI cannot prove is directly verified with sanitized evidence.

The live artifact must self-verify its assertions and emit explicit PASS/FAIL evidence. The user is not a manual test executor; any unavoidable participation is limited to crossing the authenticated-session boundary.

This includes:

- engine/Worker/Wasm/OPFS compatibility;
- provider compatibility after SQL integration;
- representative end-to-end behavior before production-shaped completion.

## CAP-VER-05 — Scanner contract tests [CORRECTNESS]

Tests cover:

- SQL activation/editing;
- interval independence;
- zero-row success;
- errors;
- no-overlap/overrun;
- committed-state reads;
- dynamic result schema;
- SecurityId drill-down;
- recovery of active definition.

## CAP-VER-06 — realistic performance evidence [CORRECTNESS]

Before claiming the intended live cadence is sustainable, benchmark the representative mixed workload:

~~~text
collection + atomic ingest + history/enrichment where enabled + repeated analytical SQL + Viewer reads
~~~

Correctness tests do not substitute for capacity evidence.

## CAP-VER-07 — automation-first engineering verification [CORRECTNESS]

Everything technically provable in GitHub Actions, Node, Chromium, deterministic mocks or fault-injection harnesses is automated rather than delegated to the user.

Temporary POC tests/workflows may be created to prove implementation hypotheses and removed afterward unless they protect a durable contract or regression.

---

# 12. Storage and lifecycle capabilities

## CAP-LIFE-01 — no silent history deletion [CORE]

Ordinary runtime operation must not silently delete retained market history merely to make storage pressure disappear.

## CAP-LIFE-02 — visible storage pressure [CORRECTNESS]

The system must be able to detect/report relevant browser storage pressure or inability to continue safely.

## CAP-LIFE-03 — retention/archive/rollover mechanism [CONDITIONAL]

A dedicated archive/export/rollover workflow is **not inherently implied by the three-screen product**.

It becomes required for the initial delivery only if evidence shows that the intended session/data volume cannot be operated safely without it, or if an explicit product retention/export requirement requires it.

## CAP-LIFE-04 — shadow migration comparison [CONDITIONAL]

A dual-path shadow DB is a verification mechanism, not a user-facing capability.

Use it only if it is the simplest reliable way to prove the SQL candidate against the existing authority before cutover.

## CAP-LIFE-05 — production cutover authority switch [CORRECTNESS]

If V2 transitions from the inherited IndexedDB authority to SQL in-place, that transition must have one explicit boundary and must not leave permanent dual authority.

The exact cutover mechanism is an implementation/migration decision.

## CAP-LIFE-06 — advanced future release/engine upgrade rollback [CONDITIONAL]

A full side-by-side future engine/schema upgrade and rollback framework is not automatically part of the initial three-screen product.

The initial release still needs explicit schema/version compatibility rules and must avoid destructive reset, but advanced generalized upgrade machinery requires separate justification.

---

# 13. Capabilities that are deliberately not implied

The V2 product definition does not itself require:

- a new Leumi API adapter;
- provider request parallelization;
- a new collector cadence;
- a server/native database;
- automatic trading;
- a fixed ranking formula;
- charts;
- saved query presets;
- multiple simultaneous active Scanner queries;
- multiple independent production DB owners;
- precomputing every cross-time comparison;
- distinct-wave detection before its semantics are defined;
- automatic retention deletion;
- mandatory legacy IndexedDB history import;
- permanent IndexedDB + DuckDB dual reads/writes;
- generalized future-upgrade machinery beyond what the initial release actually needs.

These may become future requirements only through explicit evidence/product decisions.

---

# 14. Natural product capability boundaries

Without assigning WPs or execution order yet, the capability tree has these natural responsibility groups:

~~~text
A. preserved provider collector
B. SQL durable authority
C. shared Viewer/application shell
D. Current Universe
E. Security Detail/History
F. Dynamic SQL Scanner
G. analytical historical/enrichment model
H. runtime ownership/recovery/security
I. verification/performance evidence
J. storage/cutover/lifecycle
~~~

These groups are the basis for Pass B.

Pass B must compare every existing WP against this map rather than forcing this map into the old milestone structure.

---

# 15. Pass-A completeness check

A proposed implementation plan is incomplete if it cannot point to an owner for every non-conditional capability above.

A proposed implementation plan is over-scoped if it treats a CONDITIONAL mechanism as mandatory without a current product/correctness/evidence reason.

A proposed dependency is suspicious if it blocks one capability group on another group whose observable contract is not actually required.

Examples to examine in later passes, without deciding them here:

- Current Universe / Security Detail blocking on temporal enrichment;
- basic SQL-backed Viewer parity blocking on the complete Scanner scheduler stack;
- product shell/navigation being implicit rather than owned;
- advanced storage rollover blocking an initial usable product without capacity evidence;
- generalized future-upgrade machinery blocking initial V2 without a concrete first-release compatibility need.

This completes the independent capability decomposition only. It does not yet modify the Work Package graph.
