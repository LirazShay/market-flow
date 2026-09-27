# Browser SQL V2 — Dynamic SQL Scanner Implementation Manual

## Role

This is Pass E8 of Issue #72.

It is the implementation manual for the Dynamic SQL Scanner mini-project:

~~~text
proven enrichment checkpoint
→ stable Scanner-facing SQL contract
→ draft/active lifecycle
→ safe truthful execution
→ repeat scheduling/resource safety
→ Scanner engine checkpoint
→ editor + dynamic result grid
→ Detail drill-down/integration
→ Scanner product checkpoint
~~~

This document is planning-only. It does not implement product/runtime code and does not mutate the canonical GitHub Issue graph.

Entry gate:

~~~text
ND-20 enrichment checkpoint = complete
~~~

Inputs:
- E7 analytical handoff;
- D-043 product shape;
- live-sql-query-execution product requirement;
- Pass D3 normalized DAG.

---

# 1. Scope

This mini-project owns ND-22..ND-27.

It includes:
- stable user-queryable SQL surface;
- editable SQL + interval;
- explicit activation;
- read-only safety;
- coherent committed-state execution;
- execution identity/status;
- repeated no-overlap scheduling;
- truthful arbitrary result delivery;
- restart/recovery;
- Scanner UI;
- optional SecurityId drill-down;
- Scanner isolation from Current/Detail/provider behavior.

It does not include:
- provider collection changes;
- order placement;
- automated trading decisions;
- final production ownership/cutover;
- archive/rollover unless later capacity evidence activates it;
- a final trading formula;
- saved-query library/preset product unless explicitly added later.

---

# 2. Re-baseline authority over older Scanner mechanism drafts

Older Phase H/K/T documents preserve useful evidence and acceptance concerns, but several mechanism choices predate the product-first re-baseline.

Treat these as candidates unless E8 evidence re-selects them:

~~~text
immutable history of every SQL version
activation-anchored fixed cadence
one specific missed-tick coalescing algorithm
optimistic multi-Viewer editor concurrency
streaming as the mandatory path for every result size
exact preview/full-count strategy
advanced cancellation/preemption/Worker-recovery machinery
hard runtime budgets
automatic suspension policy
~~~

Requirements that remain non-negotiable include:

~~~text
editable SQL
independent interval
explicit activation
read-only safety
committed-state reads
no overlapping executions
truthful result/error state
ingest correctness priority
bounded resource behavior
restart truthfulness
Scanner isolation
~~~

If E8 selects mechanisms that contradict durable D-029/D-032/D-039, Pass G must supersede/update those decisions before implementation.

---

# 3. Scanner authority boundary

Scanner is a client capability of the one SQL Authority.

Required shape:

~~~text
Viewer Scanner UI
→ Runtime Controller command
→ Scanner execution service inside SQL Authority boundary
→ read-only SQL over committed state
→ normalized result/status
→ Viewer
~~~

Viewer must not:
- open DuckDB directly;
- bypass SQL safety classification;
- execute arbitrary SQL through trusted admin connection;
- treat result rows as authoritative Current/Detail records;
- alter collector cadence.

---

# 4. ND-22A — Stable Scanner-facing SQL contract

Before scheduler/UI work, define what the user is allowed to query as a stable semantic surface.

Inputs from E7:
- raw/current/history concepts;
- accepted persisted enrichment;
- accepted query-time analytical concepts;
- names/types/units;
- warm-up/NULL semantics.

Decision options may include:
- stable views over physical tables;
- selected stable table contracts;
- a small documented namespace of views/functions where supported.

Rules:
1. physical implementation tables are not automatically public API;
2. Current/latest baseline must be easy to query;
3. history must remain accessible for joins/aggregation;
4. full preserved raw facts remain queryable where intentionally exposed;
5. internal migration/version/control tables may remain hidden from normal examples;
6. names/types/units are documented;
7. no user-facing name implies unverified provider semantics.

### Exit

A user can discover enough schema/semantics to write useful SQL without reading implementation source.

---

# 5. ND-22B — First-run/default SQL experience

Choose the smallest useful first-run experience.

Preferred baseline candidate:

~~~text
default safe SELECT
→ shows current universe through stable Scanner SQL contract
~~~

Also decide:
- visible schema/help reference;
- a few documentation examples;
- reset-to-default action if useful.

Do not require presets/history manager in first release.

---

# 6. ND-22C — Draft versus active lifecycle

Own separate states:

~~~text
draft SQL
draft interval
active SQL/config
execution state
latest successful result
~~~

Rules:
- typing never silently changes the active query;
- interval edits remain draft until explicit activation;
- failed activation leaves previous active config unchanged;
- active config is authoritative across Viewer clients;
- Viewer reconnect reads authoritative active state rather than trusting local draft.

Draft persistence across Viewer reload is a UX choice; active config durability is a runtime/product contract.

---

# 7. ND-22D — Activation contract

Define explicit activation semantics before code.

Must answer:
- validation happens before active pointer/config changes;
- whether successful activation executes immediately or at next deterministic opportunity;
- when schedule/cadence starts;
- what status appears before first execution;
- what interval change does to timing;
- what happens if the previous active query is currently running.

Required invariant:

~~~text
result/error is always attributable to the exact config that produced it
~~~

Do not label an old execution result as belonging to newly activated SQL.

---

# 8. ND-22E — Minimal durable Scanner state

Persist only state required for truthful restart.

Candidate minimum:
- active SQL/config identity or exact snapshot;
- active SQL text if product requires recovery without external source;
- interval;
- enabled/disabled state if selected;
- activation timestamp or timing state required by selected scheduler;
- latest execution metadata needed for recovery;
- latest successful execution identity.

Do not persist every editor keystroke or immutable version history unless a real recovery/concurrency requirement justifies it.

---

# 9. ND-22F — Multi-Viewer editing policy

Multiple Viewer clients do not automatically require collaborative editing.

Select the simplest safe first-release policy.

Acceptable candidates:
- one authoritative editor lease;
- activation with expected active revision/version;
- explicit last activation wins plus authoritative resync, if it cannot create ambiguity.

Required behavior:
- no silent lost activation;
- every Viewer can discover current active config;
- stale draft does not masquerade as active;
- policy is testable with two Viewer clients.

Do not inherit optimistic versioning merely because Phase K proposed it.

---

# 10. ND-22 checkpoint output

Before ND-23 starts, freeze:
- Scanner SQL surface/version;
- draft/active state model;
- activation semantics;
- interval units/validation baseline;
- minimal durable state;
- multi-Viewer edit policy;
- execution identity inputs.

These are product/runtime contracts, not UI styling.

---

# 11. ND-23A — Read-only SQL safety contract

Scanner executes exactly the allowed class of analytical queries.

Minimum allowed intent:

~~~text
one result-producing read-only analytical statement
~~~

Required rejection includes mutation/admin/external-access paths capable of changing authority or escaping the intended boundary.

Examples requiring rejection/hardening include:
- INSERT/UPDATE/DELETE/MERGE;
- CREATE/ALTER/DROP;
- transaction control;
- ATTACH/DETACH;
- COPY or external file/network behavior not explicitly allowed;
- extension install/load/autoload paths;
- configuration/admin statements.

Prefix/regex-only safety is insufficient.

Implementation must prove a parser/engine-backed classification/hardening mechanism on the exact pinned DuckDB-Wasm build.

Trusted migrations/admin SQL use a separate application path.

---

# 12. ND-23B — Security configuration proof

Verify exact pinned-build support/order for applicable DuckDB hardening controls.

Examples from older evidence include:

~~~text
disable external access
disable automatic/community extension paths
preload only trusted required capabilities
lock configuration
~~~

Do not assume upstream-main behavior equals the selected package.

Chromium tests must prove:
- safe SELECT still works;
- representative forbidden statements are rejected/blocked;
- hardening does not break normal ingest/admin path;
- Scanner cannot mutate market authority.

---

# 13. ND-23C — Committed-state consistency

Every Scanner execution observes a coherent committed state.

Required invariant:

~~~text
Scanner sees last fully committed cycle
or a later fully committed cycle
never half a transaction
~~~

Capture enough execution metadata to identify the visible committed cycle/revision where practical.

Exact connection/queuing strategy is implementation, not product contract.

---

# 14. ND-23D — Execution identity

Every attempted execution gets an opaque execution identity tied to:
- exact active SQL/config identity;
- scheduled/due context where applicable;
- start/finish timestamps;
- status;
- visible committed-cycle identity where available;
- result completeness metadata;
- sanitized error/cancel reason.

Statuses must distinguish at least:

~~~text
running
success
error
cancelled
interrupted
~~~

Do not collapse cancellation into SQL error.

---

# 15. ND-23E — Latest execution versus latest success

First-class state:

~~~text
latestExecution
latestSuccessfulExecution
~~~

If run 42 fails after success 41:

~~~text
latestExecution = 42 / error
latestSuccessfulExecution = 41 / success
displayable successful result remains attributable to 41
~~~

A new failure/cancellation never erases or relabels prior successful result state.

---

# 16. ND-23F — Arbitrary result schema/type contract

Scanner SQL can return arbitrary columns/types supported by the selected SQL contract.

Define normalization/presentation for at least:
- column order;
- duplicate/ambiguous names;
- NULL;
- BOOLEAN;
- signed/unsigned integer shapes exposed by Wasm/Arrow;
- BIGINT;
- DECIMAL;
- floating point including non-finite values if possible;
- DATE/TIME/TIMESTAMP;
- VARCHAR;
- JSON;
- LIST/STRUCT/MAP if exposed;
- BLOB/binary;
- unsupported/unrenderable types.

Rules:
- do not silently stringify everything when semantics are lost;
- do not lose large integer precision;
- preserve NULL distinctly;
- unsupported presentation is explicit, not fake empty text.

Node tests can own normalization policy; Chromium proves actual DuckDB/Arrow values.

---

# 17. ND-23G — Result order and zero-row semantics

Required:
- columns follow engine result metadata order;
- rows follow SQL result order;
- Viewer applies no hidden sort/filter/rank;
- zero rows = success;
- syntax/runtime failure = error;
- safety rejection = distinct failure category;
- no hidden LIMIT is injected.

The active SQL is the authority for Scanner result meaning.

---

# 18. ND-23H — Large-result truthfulness

Product contract is independent from transport mechanism.

If Viewer receives only a bounded preview, expose truthfully:
- preview row count;
- whether preview is complete/truncated;
- full row count only if actually known;
- partial count if execution stopped before full consumption;
- execution status.

Never claim exact total when the execution did not establish it.

Never change user SQL silently to manufacture a bounded result.

---

# 19. ND-23I — Result lifetime across restart

Choose explicitly which result state is durable.

Simple baseline candidate:

~~~text
execution metadata durable
latest-success identity durable
preview rows ephemeral runtime memory
~~~

After runtime restart:
- stale old preview is not presented as current-runtime data;
- latest-success metadata may remain;
- UI can say preview unavailable until next successful execution;
- Viewer attach does not auto-run SQL merely to reconstruct preview unless product explicitly chooses that behavior.

---

# 20. ND-23 test-first suite

Before scheduler work, permanent tests should already cover:
- allowed SELECT/WITH/JOIN/GROUP BY/HAVING/window/LIMIT;
- representative prohibited statements;
- syntax error;
- safety rejection;
- committed-state read;
- zero-row success;
- latest success survives later failure;
- arbitrary result types;
- preview completeness metadata;
- runtime restart result-lifetime semantics.

---

# 21. ND-24A — Interval contract

Define interval input semantics:
- user-visible unit;
- finite positive validation;
- invalid input behavior;
- persistence/restart behavior;
- independence from collector cadence.

Minimum/maximum permitted values are selected from performance/resource evidence, not arbitrary planning numbers.

Do not silently clamp invalid interval input.

---

# 22. ND-24B — Scheduler policy selection

Non-negotiable properties:
- at most one Scanner execution at a time;
- deterministic timing behavior;
- no unbounded missed-tick queue;
- no burst replay after downtime;
- ingest correctness has priority;
- restart semantics are defined.

Candidates include activation-anchored cadence/coalescing from Phase H, but E8 must select the simplest policy that satisfies product needs and benchmark evidence.

Node deterministic clock tests own pure timing semantics.

---

# 23. ND-24C — Query replacement while running

Define behavior when a new active config is activated while old execution is running.

Required invariants:
- no overlap;
- old execution retains old config identity;
- new config cannot inherit old result;
- activation result is explicit;
- future execution uses the new config.

Mechanism may be:
- let old run finish then switch;
- cooperative cancellation;
- another proven simple strategy.

Choose from measured/engine evidence rather than assumption.

---

# 24. ND-24D — Baseline resource-safety envelope

Before advanced preemption, define minimum bounds:
- one active analytical execution;
- bounded pending scheduling state;
- bounded retained preview memory;
- no unbounded provider-cycle queue;
- explicit handling for query/resource overrun;
- Scanner cannot own trusted writer/admin connection.

Collection correctness is mandatory; exact preemption depth is evidence-driven.

---

# 25. ND-24E — Mixed-load benchmark

Run representative:

~~~text
continuous cycle-shaped ingest
+ repeated Scanner workload
~~~

Measure:
- ingest wait caused by Scanner;
- query lateness;
- backlog trend;
- query cancellation need;
- result-memory behavior;
- connection disposal/recreation cost if tested;
- restart/recovery cost if escalation tested.

Use the E6 benchmark harness conventions.

---

# 26. ND-24F — Advanced hardening activation [CND-03]

Only if baseline evidence is insufficient, activate the smallest required advanced mechanism.

Possible candidates:
- pending-query cancellation;
- stream abort/connection recycle;
- hard runtime budget;
- automatic suspension;
- controlled Worker reopen/recovery fallback.

Each selected mechanism requires exact pinned-build Chromium proof.

Do not implement the full old Phase T mechanism set merely because it exists in documentation.

If an advanced mechanism is activated:

~~~text
implement smallest mechanism
→ focused correctness tests
→ rerun mixed-load benchmark
→ only then ND-25
~~~

---

# 27. ND-24G — Cancellation outcome model

If cancellation ships, define reasons separately:

~~~text
ingest_priority
runtime_budget
query_replacement
runtime_shutdown
user_stop  (only if explicit stop control ships)
~~~

Cancelled execution:
- status != success;
- cannot replace latest successful result;
- full row count is incomplete unless actually completed;
- partial count is labeled partial;
- scheduler retry behavior is explicit per reason.

---

# 28. ND-24H — Restart/recovery scheduling semantics

Automate:
- restart with active config;
- restart during running execution;
- old running execution becomes interrupted, not guessed success/error;
- active config recovery;
- latest-success metadata recovery;
- preview-lifetime behavior;
- no burst of missed schedules;
- at most the selected catch-up opportunity;
- no provider side effect caused by Scanner restart.

---

# 29. ND-25 — Scanner engine checkpoint

ND-25 is a headless/runtime checkpoint.

It proves:

~~~text
stable Scanner SQL contract
+ durable active lifecycle
+ safe read-only execution
+ exact execution attribution
+ committed-state visibility
+ truthful arbitrary result model
+ deterministic no-overlap scheduler
+ restart recovery
+ baseline resource safety
+ any activated CND-03 hardening
~~~

Mandatory evidence:
- Node lifecycle/scheduler/result-policy tests;
- exact pinned-build safety tests;
- Chromium DuckDB execution tests;
- restart/reopen tests;
- mixed ingest/query benchmark;
- zero unresolved mandatory Unknowns;
- Fast CI;
- affected/full Browser CI as required;
- security/artifact guards.

ND-25 does not claim the Scanner UI is complete.

---

# 30. ND-26A — Scanner UI shell

After ND-23 contracts stabilize, UI work may proceed in parallel with ND-24/25 using deterministic mock runtime states.

Required controls:
- multiline SQL editor;
- repeat interval control;
- explicit Activate/Apply action;
- active-vs-draft indication;
- runtime/query status;
- execution timing/status;
- error feedback;
- result grid area.

No auto-activation on each keystroke.

---

# 31. ND-26B — Editor behavior

Tests/behavior:
- typing changes draft only;
- active SQL remains visibly distinguishable;
- failed activation preserves previous active config;
- successful activation resyncs authoritative active state;
- Viewer reload behavior for draft is explicit;
- keyboard/focus/labels are accessible;
- stale multi-Viewer action follows selected concurrency policy.

---

# 32. ND-26C — Dynamic result grid

The grid is generated from result metadata.

Required behavior:
- arbitrary column count within practical UI bounds;
- engine column order preserved;
- SQL row order preserved;
- zero-row success has a clear empty-success state;
- no hidden Viewer sorting/filtering/ranking;
- supported types formatted truthfully;
- NULL distinct from numeric zero;
- result belongs visibly to one execution/config;
- truncated/incomplete preview is labeled;
- latest failure does not erase the last successful preview if product retains it.

Exact visual styling is not architecture.

---

# 33. ND-26D — Result performance/UI bounds

UI must not materialize unbounded DOM/result state.

Preview caps are selected by benchmark evidence.

Rules:
- bounds affect Viewer retention/rendering, not SQL text;
- no hidden LIMIT;
- large result truthfulness remains visible;
- scrolling/render strategy is implementation tuning after measurement.

---

# 34. ND-26E — Scanner error states

At minimum distinguish:
- draft/activation validation error;
- SQL parse error;
- safety rejection;
- execution error;
- cancellation/interruption;
- runtime unavailable/not-ready;
- storage/recovery blocked;
- preview unavailable;
- result presentation/transport error.

Scanner-local errors do not turn healthy Current/Detail into ERROR.

---

# 35. ND-27A — SecurityId drill-down

A Scanner result can reuse shared Detail/History only through a validated canonical SecurityId value.

Rules:
- arbitrary result columns are not authoritative current data;
- Detail rereads authoritative data by SecurityId;
- row without valid SecurityId remains a plain result;
- no order/trade workflow starts;
- Scanner→Detail→Back preserves Scanner state according to the selected UI state contract.

Test malicious/misleading columns such as columns named like current fields; only SecurityId is navigation identity.

---

# 36. ND-27B — Scanner isolation regressions

Permanent tests must prove:
- SQL/interval changes do not change provider collection cadence;
- Scanner error does not break Current/Detail;
- Current/Detail refresh does not execute Scanner;
- Scanner result schema never redefines Current columns;
- no active Scanner is required to render Current/Detail;
- no user SQL can mutate market-history authority;
- Scanner cannot acknowledge provider cycle success.

---

# 37. ND-27C — Multi-surface navigation

Automate:

~~~text
Current → Scanner → Current
Scanner(SecurityId) → Detail → Back to Scanner
Current → Detail → Back to Current
~~~

Each origin surface retains the state contract promised for it.

One shared Detail implementation is used.

---

# 38. ND-27D — Runtime reconnect

With Scanner present:
- runtime restart invalidates old in-memory preview ownership;
- Viewer fully resyncs active config/execution metadata;
- Current/Detail authoritative reads recover independently;
- Scanner state clearly distinguishes recovered metadata from unavailable preview;
- no implicit query execution occurs merely because Viewer reconnects unless product explicitly selected it.

---

# 39. ND-27E — Scanner contract suite

Permanent coverage includes:
- SELECT/JOIN/WHERE/GROUP BY/HAVING/ORDER BY/LIMIT/window;
- zero rows;
- arbitrary result schema/types;
- syntax/runtime errors;
- safety rejection;
- activation failure/success;
- query replacement;
- interval changes;
- scheduler no-overlap/overrun;
- restart/interruption;
- latest execution vs latest success;
- large-result completeness;
- SecurityId drill-down;
- Scanner isolation;
- two Viewer clients under selected edit policy;
- runtime reconnect.

Node handles deterministic policy; Chromium handles DuckDB/runtime/UI semantics.

---

# 40. ND-27 — Scanner product checkpoint

Product statement:

~~~text
user edits SQL + interval
→ explicitly activates
→ runtime safely executes repeatedly on coherent committed data
→ Viewer shows truthful 0..N dynamic result
→ error/restart/latest-success behavior remains explicit
→ valid SecurityId may drill into shared Detail
→ Current/Detail/provider behavior remains independent
~~~

Mandatory fresh gates:
- ND-25 engine checkpoint PASS;
- editor/activation tests PASS;
- result-grid/type tests PASS;
- large-result truthfulness PASS;
- drill-down/navigation PASS;
- Scanner isolation PASS;
- restart/reconnect PASS;
- selected multi-Viewer policy PASS;
- relevant mixed-load/performance evidence PASS;
- Fast CI PASS;
- full Browser CI PASS;
- security/artifact guards PASS;
- zero mandatory Unknowns;
- docs/contract consistency PASS.

Live provider execution is not automatically required just to prove arbitrary SQL semantics if deterministic Browser SQL tests prove them; live evidence is required only for facts tied to actual origin/provider/runtime behavior.

---

# 41. STATUS flow during Scanner implementation

Recommended high-level progression:

~~~text
ND-22 in-progress
→ lifecycle/SQL contract fixed
→ ND-23 safe execution/result model
→ ND-24 scheduler/resource safety
→ ND-25 verification-pending
→ ND-25 complete

ND-26 UI may overlap after ND-23 contracts stabilize

→ ND-27 integration
→ ND-27 verification-pending
→ all product gates fresh PASS
→ ND-27 complete
~~~

`STATUS.json` remains the only live progress source.

---

# 42. Recommended coherent commit boundaries

Suggested:

~~~text
A Scanner SQL surface
B lifecycle/activation policy tests
C durable active state
D read-only safety
E execution identity/latest-success
F result type normalization
G large-result truthfulness
H scheduler policy
I mixed-load baseline
J optional CND-03 hardening
K ND-25 engine checkpoint
L editor/activation UI
M result grid
N drill-down/navigation
O restart/multi-Viewer/isolation regressions
P ND-27 product checkpoint
~~~

Parallel work still uses small concern-focused commits.

---

# 43. Failure routing

## SQL safety mechanism cannot be proven on pinned build

~~~text
block ND-25
→ reopen safety/execution architecture
~~~

Do not fall back to regex-only security.

## Baseline scheduler delays ingest materially

~~~text
activate smallest CND-03 mechanism
→ prove exact pinned behavior
→ rerun benchmark
~~~

## Arbitrary result type cannot be represented safely

~~~text
define explicit unsupported representation/error
→ do not silently corrupt/stringify
~~~

## Multi-Viewer editing creates ambiguity

~~~text
simplify first-release editing policy
→ do not add collaborative complexity unless needed
~~~

## UI benchmark shows large previews are costly

~~~text
reduce visible preview cap or improve rendering
→ keep SQL semantics unchanged
~~~

---

# 44. Outputs consumed by final integration

ND-27 leaves:
- stable Scanner-facing SQL contract;
- selected scheduler semantics;
- selected resource-safety mechanisms;
- active/restart state model;
- execution/result/error contract;
- UI behavior;
- drill-down contract;
- performance configuration values selected from evidence;
- test/evidence mapping;
- deferred advanced features.

ND-29 then integrates this with Current/Detail and production single-owner behavior.

---

# 45. E8 exit criteria

Pass E8 planning is complete when another implementation chat can determine without guessing:
- what the stable Scanner SQL contract is allowed to expose;
- how draft/active configuration works;
- how activation and replacement are defined;
- what Scanner state is durable;
- how arbitrary SQL is proven read-only;
- how committed-state consistency is guaranteed;
- how execution identity/latest-success works;
- how arbitrary result types and large results are represented truthfully;
- how interval/no-overlap/restart semantics are selected;
- when advanced preemption is activated rather than assumed;
- what ND-25 proves;
- what ND-26 can build in parallel;
- how drill-down/isolation work;
- what exact evidence closes ND-27.
