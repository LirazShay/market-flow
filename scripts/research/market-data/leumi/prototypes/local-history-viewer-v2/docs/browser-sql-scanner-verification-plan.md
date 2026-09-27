# Browser SQL V2 — Dynamic SQL Scanner Verification Plan

> **Reference-only / superseded verification guidance.** Current Scanner verification belongs to C08/C09 and C11 under `tests/TESTING_POLICY.md`; ND-25/ND-27 are not current execution gates.


## Role

This is Pass E9 of Issue #72.

It defines the verification architecture for the Dynamic SQL Scanner and the exact closure rules for:

~~~text
ND-25 — Scanner engine checkpoint
ND-27 — Scanner product checkpoint
~~~

This document is planning-only. It does not implement runtime/product code and does not mutate the canonical GitHub Issue graph.

Implementation authority: browser-sql-scanner-implementation-manual.md.

Dependency authority: browser-sql-rebaseline-dependency-dag.md Pass D3.

---

# 1. Verification principles

Scanner verification follows five rules:

1. test public/runtime contracts, not private helper structure;
2. use Node for deterministic policy/state-machine logic;
3. use Chromium for DuckDB-Wasm, Arrow, Worker, OPFS, Viewer and multi-context behavior;
4. use benchmarks for mechanism selection, not as substitutes for correctness tests;
5. live authenticated evidence is required only for facts deterministic browser CI cannot prove.

Every selected mechanism must be tested at the layer that actually proves it.

---

# 2. ND-25 versus ND-27 boundary

## ND-25 proves the engine

~~~text
SQL contract
+ active lifecycle
+ read-only safety
+ committed-state execution
+ execution identity
+ truthful result semantics
+ scheduler/no-overlap
+ restart recovery
+ baseline resource safety
+ any activated CND-03 mechanism
~~~

No Scanner UI completion is required for ND-25.

## ND-27 proves the user-facing product

~~~text
editor + interval
+ explicit activation
+ dynamic result grid
+ errors/latest-success
+ restart/reconnect
+ SecurityId drill-down
+ multi-Viewer policy
+ Scanner isolation
+ full three-surface Viewer behavior
~~~

ND-27 consumes a green ND-25 rather than re-proving engine internals through UI-only tests.

---

# 3. Test-layer matrix

| Contract area | Node | Chromium | Live |
|---|---|---|---|
| SQL surface metadata/schema rules | yes | yes | no |
| draft/active lifecycle | yes | yes | no |
| activation policy | yes | yes | no |
| interval validation | yes | yes | no |
| read-only safety classification | yes where parser logic is pure | mandatory pinned-build | no |
| DuckDB hardening controls | no | mandatory pinned-build | no |
| committed-state consistency | limited model | mandatory | no |
| execution identity/latest-success | yes | yes | no |
| Arrow/result type normalization | yes policy | mandatory actual values | no |
| scheduler/no-overlap/overrun | yes deterministic clock | mandatory integration | no |
| restart/interruption | yes state reducer | mandatory | no |
| large-result truthfulness | yes policy | mandatory | no |
| mixed ingest/query contention | no | mandatory benchmark | later L-3 only for final candidate |
| editor/grid UX | no | mandatory | no |
| multi-Viewer editing | yes policy | mandatory two-client | no |
| SecurityId drill-down | yes validation | mandatory | no |
| Current/Detail/provider isolation | yes where pure | mandatory | later L-3 final candidate |
| selected CND-03 cancellation/preemption | yes state policy | mandatory pinned-build | later L-3 if shipped |

---

# 4. Stable SQL-contract verification

Permanent tests must prove:
- documented Scanner objects exist;
- documented column names/types/units match contract;
- current/latest baseline query returns coherent committed data;
- history objects support joins/aggregation;
- intentionally exposed raw facts are queryable;
- hidden/internal control objects are not required by public examples;
- schema-discovery/default-query examples remain valid.

A physical schema refactor is allowed if this stable user-facing contract remains intact.

Changing the stable Scanner contract requires explicit contract/version review and invalidates affected Scanner tests/evidence.

---

# 5. Draft/active lifecycle state matrix

At minimum cover:

| Starting state | Action | Expected authoritative result |
|---|---|---|
| no active config | edit draft | no execution; active unchanged |
| no active config | valid activate | active config established |
| active A | edit draft B | A continues; B is draft only |
| active A | invalid activate B | A remains active |
| active A | valid activate B | B becomes authoritative according to selected activation policy |
| active A running | activate B | no overlap; A result retains A identity; future work uses B |
| active A | interval edit only | no cadence change until activation |
| Viewer reload | reconnect | authoritative active state restored; local draft behavior follows explicit UX contract |
| runtime restart | recover | durable active state recovered; prior running execution becomes interrupted |

Every transition should be independently assertable without relying on private database row layout.

---

# 6. Multi-Viewer activation matrix

Using two independent Viewer clients against one runtime, verify the selected first-release policy.

Mandatory outcomes regardless of mechanism:
- both viewers can read authoritative active state;
- stale editor/draft cannot silently masquerade as active;
- two near-simultaneous activations have one deterministic authoritative outcome;
- losing/stale client receives visible reconciliation/error/resync behavior;
- no extra DuckDB/OPFS owner is created;
- closing one Viewer does not stop Scanner runtime.

If optimistic revision checking is not selected, do not retain tests asserting optimistic-version internals.

Test the chosen product behavior only.

---

# 7. SQL safety positive corpus

On the exact pinned DuckDB-Wasm build, verify representative allowed queries:
- simple SELECT;
- WITH/CTE;
- JOIN current/history;
- WHERE;
- GROUP BY;
- HAVING;
- ORDER BY;
- LIMIT;
- window function;
- set operation if included in supported contract;
- zero-row query;
- expressions over selected enrichment;
- raw JSON access where intentionally exposed.

Successful safety classification must not break normal query semantics.

---

# 8. SQL safety negative corpus

Verify representative rejection/blocking for:
- INSERT;
- UPDATE;
- DELETE;
- MERGE;
- CREATE;
- ALTER;
- DROP;
- transaction control;
- ATTACH/DETACH;
- COPY/external file behavior;
- INSTALL/LOAD/extension paths;
- SET/PRAGMA/configuration/admin statements where disallowed;
- multi-statement payloads;
- comments/whitespace intended to fool prefix-based checks;
- CTE or nested constructs containing unsafe behavior where syntactically possible;
- external/network/filesystem access mechanisms exposed by the pinned engine.

The exact corpus should be derived from the pinned parser/engine capabilities, not from regex assumptions.

Pass condition:

~~~text
unsafe query never reaches authoritative mutation/admin execution
~~~

---

# 9. Safety escape/fuzz regression

Maintain a small deterministic parser-edge corpus for:
- leading comments;
- unusual whitespace;
- quoted identifiers;
- semicolons;
- nested parentheses;
- case variation;
- SQL keywords inside strings;
- multiple statements;
- explain-like/introspection constructs if relevant.

This is not security fuzzing of all SQL grammar.

It is regression coverage for plausible classifier bypasses discovered during implementation.

Any real bypass found gets a minimal permanent regression.

---

# 10. Pinned-build hardening proof

If the selected design uses engine settings such as external-access or extension restrictions, Chromium must prove on the exact package/build:
- required setting exists;
- setting order works;
- safe analytical SELECT continues to work;
- forbidden capability is actually blocked;
- configuration cannot be silently reopened by user SQL if the contract says it is locked;
- trusted ingest/admin path still functions.

Upstream documentation alone is not PASS evidence.

---

# 11. Committed-state consistency scenarios

Use controlled ingest transactions and Scanner execution timing.

Mandatory cases:

## S-C1 query before next cycle starts

Scanner sees previous committed cycle.

## S-C2 query becomes due while cycle transaction is active

Scanner does not see partial new cycle; it runs only according to selected serialization policy.

## S-C3 new cycle arrives during Scanner execution

Scanner result remains attributable to one coherent committed state; ingest behavior follows selected resource policy.

## S-C4 persistence attempt fails

Scanner never sees attempted partial state.

## S-C5 enrichment transaction fails

Scanner sees previous coherent analytical state only.

These are permanent Chromium regressions.

---

# 12. Execution identity verification

For every execution assert:
- unique opaque execution identity;
- exact active-config identity captured at start;
- start/finish/status timestamps are coherent;
- visible committed-cycle/revision metadata is correct where exposed;
- success/error/cancelled/interrupted is explicit;
- preview/result identity matches the producing execution;
- later activation cannot relabel an older result.

Do not assert private surrogate-key values beyond identity invariants.

---

# 13. Latest-execution/latest-success matrix

Required sequence examples:

~~~text
E1 success
E2 error
→ latestExecution = E2
→ latestSuccessfulExecution = E1
→ shown successful preview remains E1
~~~

~~~text
E1 success
E2 cancelled
E3 zero-row success
→ latestExecution = E3
→ latestSuccessfulExecution = E3
→ zero-row success replaces prior successful preview with valid empty result
~~~

~~~text
E1 success
runtime restart
→ latest-success metadata follows durability contract
→ old ephemeral preview is unavailable unless explicitly persisted
~~~

---

# 14. Result-type corpus

Use real DuckDB-Wasm/Arrow results to cover every type retained by the Scanner contract.

Minimum candidate corpus:
- NULL;
- BOOLEAN;
- small/large signed integer;
- BIGINT beyond JavaScript safe integer range;
- DECIMAL;
- FLOAT/DOUBLE;
- negative zero/non-finite values if emitted/supported;
- DATE;
- TIME;
- TIMESTAMP;
- VARCHAR;
- JSON;
- LIST;
- STRUCT;
- MAP if exposed;
- BLOB/binary;
- duplicate/ambiguous column labels;
- unsupported type/presentation fallback.

Assertions:
- no precision loss;
- no NULL collapse;
- stable column order;
- explicit representation for unsupported types;
- formatting does not change semantic value.

---

# 15. Dynamic result schema tests

Queries should return:
- 0 columns only if the engine/product legitimately permits such a result; otherwise reject as not applicable;
- 1 column;
- many columns;
- reordered columns;
- aliased columns;
- duplicate labels;
- 0 rows;
- 1 row;
- many rows.

Viewer grid follows result metadata exactly and adds no hidden analytical semantics.

---

# 16. Large-result truthfulness matrix

Test at least:

## LRG-1 complete small result

~~~text
success
preview complete
full row count known
~~~

## LRG-2 complete large result with bounded preview

~~~text
success
preview truncated
full row count known only if fully consumed
~~~

## LRG-3 interrupted/cancelled before full consumption

~~~text
status != success
partial count labeled incomplete
full count not fabricated
~~~

## LRG-4 zero rows

~~~text
success
complete
row count = 0
~~~

## LRG-5 large schema / expensive rendering

Viewer remains bounded; preview/render caps do not rewrite SQL.

---

# 17. Scheduler deterministic state matrix

Use a fake/deterministic clock for pure policy.

Cover the selected scheduler semantics for:
- activation;
- first execution;
- interval change;
- execution shorter than interval;
- execution longer than one interval;
- multiple missed opportunities;
- query due while ingest is active;
- ingest arrives while query is active;
- runtime pause/restart;
- clock jump if relevant to selected wall-clock model;
- active query disabled/suspended if that feature ships.

Non-negotiable assertions:
- no overlapping executions;
- no unbounded missed-tick queue;
- no burst replay after downtime;
- deterministic next opportunity;
- collector cadence remains independent.

Do not retain tests for activation-anchored cadence specifically unless that mechanism is selected.

---

# 18. Scheduler Chromium integration

Use real Worker/DuckDB execution with deliberately slow synthetic queries where safe.

Verify:
- at most one analytical execution;
- cycle transaction and Scanner query obey selected serialization/resource policy;
- timing/status metadata matches policy;
- no duplicate execution from one scheduler opportunity;
- runtime remains usable after query error;
- later normal execution succeeds.

---

# 19. Baseline resource-safety verification

Regardless of CND-03 activation, permanent regressions prove:
- one active query maximum;
- bounded pending scheduler state;
- bounded Viewer preview memory/rows;
- no unbounded validated-cycle backlog;
- user SQL never runs on trusted admin/writer path if separation is selected;
- query failure never acknowledges a provider cycle;
- Scanner failure does not stop collection by itself.

---

# 20. Mixed-load benchmark evidence

Before ND-25 closes, run the selected representative workload:

~~~text
cycle-shaped ingest
+ repeated Scanner queries
~~~

Record:
- ingest service/wait time;
- query service/lateness;
- pending-cycle high-water mark;
- Scanner overlap violations;
- memory/result retention;
- selected cancellation/recycle timings if applicable;
- correctness counters.

Outcome:

~~~text
baseline sufficient
or
CND-03 activated with explicit reason
~~~

An inconclusive benchmark is not sufficient to silently choose advanced hardening.

---

# 21. Conditional CND-03 verification

If advanced cancellation/preemption is **not** selected:
- do not keep production tests requiring it;
- retain only evidence showing baseline policy is adequate.

If selected, add pinned-build permanent regressions for exactly the chosen mechanisms.

Possible cases when applicable:
- pending-query cancellation;
- natural completion racing cancellation;
- stream abort;
- analytics connection dispose/recreate;
- ingest-priority cancellation;
- runtime-budget cancellation;
- query replacement cancellation;
- cancellation timeout escalation;
- controlled Worker reopen/recovery;
- row-count completeness after cancellation.

Do not retain unselected Phase-T mechanism tests as mandatory gates.

---

# 22. Restart/interruption matrix

Permanent tests cover:
- restart with no active config;
- restart with active config but no running execution;
- restart during running execution;
- old running execution becomes interrupted;
- latest-success metadata follows durability contract;
- ephemeral preview lifetime follows contract;
- active interval/timing state recovers according to selected scheduler;
- no burst catch-up;
- no duplicate execution immediately caused by Viewer attach;
- no provider collection caused by Scanner recovery.

---

# 23. Runtime/Worker failure matrix

Inject public-boundary failures for:
- query execution failure;
- result transport failure;
- Worker loss during execution;
- runtime Controller reconnect;
- storage/readiness blocked;
- analytics connection recreation failure if selected;
- Worker recovery failure if selected.

Assert Scanner state is truthful and authoritative market state is not corrupted.

Global storage/runtime failure may affect all surfaces; Scanner-local failures may not.

---

# 24. Editor/UI verification

Chromium tests cover:
- multiline editing;
- draft-only typing;
- interval editing;
- explicit activation;
- active-vs-draft indication;
- success state;
- zero-row empty-success;
- parse error;
- safety rejection;
- execution error;
- cancellation/interruption if shipped;
- runtime unavailable;
- preview unavailable after restart;
- keyboard/focus/label accessibility;
- RTL layout contract.

A visual CSS refactor should not break tests unless it changes public behavior.

---

# 25. Result-grid verification

Permanent browser tests assert:
- grid columns come from result schema;
- column order matches result metadata;
- row order matches SQL result;
- no hidden Viewer sort/filter;
- supported type formatting;
- NULL vs zero;
- latest-error/latest-success presentation;
- preview completeness/truncation labels;
- bounded rendering;
- execution/config identity is visible enough to prevent stale ambiguity.

Do not assert incidental DOM nesting/class names.

---

# 26. SecurityId drill-down matrix

Cases:
- exact canonical SecurityId column/value → Detail opens;
- no SecurityId column → no drill-down;
- NULL SecurityId → no drill-down;
- invalid/noncanonical value → rejected/no navigation;
- duplicate/misleading columns named similarly → only defined contract column counts;
- row contains stale current-looking fields → Detail ignores them and rereads authority;
- selected security not in Current → Detail follows not-current/history contract;
- Back restores Scanner state.

No case starts order/trading workflow.

---

# 27. Scanner isolation matrix

These are permanent high-value regressions:

## Isolation from provider
- changing SQL does not change endpoints/chunking/cadence;
- changing interval does not change collector cadence;
- Scanner activation does not fetch provider data.

## Isolation from persistence authority
- unsafe SQL cannot mutate market tables;
- query failure cannot mark cycle successful;
- Scanner cannot create another DB authority.

## Isolation from Current/Detail
- Scanner error leaves healthy Current usable;
- zero-row Scanner leaves Current unchanged;
- Current manual refresh does not execute Scanner;
- Detail navigation rereads authoritative data;
- Scanner result columns do not redefine Current schema;
- Scanner disabled/unconfigured still allows Current/Detail.

---

# 28. Multi-surface navigation matrix

Automate:

~~~text
Current → Scanner → Current
Current → Detail → Current
Scanner → Detail → Scanner
~~~

Assert each source surface preserves only the state promised by its contract:
- Current sort/viewport where practical;
- Scanner draft/active/result state;
- selected Detail identity;
- no duplicate Viewer/runtime owner.

---

# 29. Multi-Viewer runtime matrix

With two Viewer clients:
- both observe same active Scanner config;
- selected edit policy resolves concurrent activation deterministically;
- result/status updates reach both through authoritative resync;
- dropping one notification is recoverable;
- one Viewer close does not stop Scanner;
- runtime restart causes both to reattach/resync;
- no Viewer opens DuckDB/OPFS;
- no second Recorder/Scanner runtime owner is created.

Production cross-tab runtime ownership remains ND-28; this matrix is Viewer-client behavior inside one authority.

---

# 30. ND-25 mandatory gate matrix

ND-25 remains verification-pending until every applicable gate is fresh PASS.

| Gate | Required |
|---|---|
| Scanner SQL contract/schema tests | PASS |
| draft/active lifecycle tests | PASS |
| activation/replacement semantics | PASS |
| pinned-build read-only safety positive/negative corpus | PASS |
| pinned-build hardening settings proof | PASS where selected |
| committed-state consistency | PASS |
| execution identity/latest-success | PASS |
| arbitrary result type normalization | PASS |
| large-result truthfulness | PASS |
| deterministic scheduler matrix | PASS |
| Chromium scheduler/runtime integration | PASS |
| restart/interruption | PASS |
| baseline resource safety | PASS |
| mixed-load benchmark | PASS/adequate |
| activated CND-03 exact mechanism tests | PASS or NOT_APPLICABLE |
| Fast CI | PASS |
| required Browser CI | PASS |
| security/artifact guards | PASS |
| zero mandatory Unknowns | PASS |

ND-25 does not require editor/grid/drill-down completion.

---

# 31. ND-27 mandatory gate matrix

ND-27 requires fresh ND-25 plus:

| Gate | Required |
|---|---|
| editor/draft/activation UI | PASS |
| dynamic result grid | PASS |
| type/NULL rendering | PASS |
| zero-row empty-success UX | PASS |
| latest-error/latest-success UX | PASS |
| large-result/truncation UX | PASS |
| runtime restart/reconnect UX | PASS |
| selected multi-Viewer edit policy | PASS |
| SecurityId drill-down | PASS |
| Scanner→Detail→Back | PASS |
| Scanner isolation matrix | PASS |
| Current/Detail regression suites | PASS |
| multi-Viewer client matrix | PASS |
| relevant performance evidence | PASS |
| Fast CI | PASS |
| full Browser CI | PASS |
| security/artifact guards | PASS |
| documentation/contract consistency | PASS |
| zero mandatory Unknowns | PASS |

---

# 32. Evidence freshness rules

At minimum:

| Changed area | Evidence invalidated |
|---|---|
| Scanner SQL surface | SQL contract tests, examples, affected safety/result tests |
| lifecycle/activation state | lifecycle, multi-Viewer, restart, UI activation tests |
| safety classifier/hardening | full pinned-build safety corpus |
| DuckDB/Wasm version | safety corpus, type corpus, selected cancellation/preemption proof |
| execution/result normalization | identity/latest-success/type/large-result tests |
| scheduler policy | scheduler Node + Chromium + restart + mixed-load evidence |
| resource mechanism | mixed-load + pinned-build mechanism tests |
| preview cap/result transport | large-result + grid + performance tests |
| Viewer bridge/runtime identity | reconnect + multi-Viewer + integration tests |
| drill-down contract | SecurityId/navigation tests |
| Current/Detail shared shell | isolation + navigation + full Browser integration |

Do not rerun unrelated live-provider gates solely because Scanner CSS changed.

---

# 33. Exact candidate identity

ND-25/ND-27 evidence should record:

~~~text
repository commit
runtime build identity
Scanner SQL contract/schema version
DuckDB package/core identity
Worker/Wasm identities
fixture/query-suite versions
scheduler/resource configuration
preview/result configuration
selected CND-03 mechanism set
browser/OS evidence class
~~~

Evidence from different incompatible candidate configurations cannot be combined into one PASS.

---

# 34. Failure classification

Use at least:

~~~text
SCANNER_CONTRACT_DEFECT
SAFETY_DEFECT
ENGINE_COMPATIBILITY_DEFECT
COMMITTED_STATE_DEFECT
LIFECYCLE_DEFECT
SCHEDULER_DEFECT
RESOURCE_DEFECT
RESULT_SEMANTICS_DEFECT
RESTART_DEFECT
VIEWER_UI_DEFECT
DRILLDOWN_DEFECT
ISOLATION_DEFECT
TEST_ORACLE_DEFECT
UNKNOWN
~~~

Fix the owning layer; do not rewrite expectations merely to obtain green.

---

# 35. Temporary POC retention rules

Examples of temporary experiments:
- cancellation API probe;
- stream-abort behavior probe;
- alternative result materialization benchmark;
- alternative scheduler timing experiment.

Before ND-25/ND-27 closure, each gets one disposition:

~~~text
promote useful public-contract regression
or
remove temporary probe/workflow/code
~~~

No abandoned production hooks remain.

---

# 36. Live evidence boundary

ND-25 and ND-27 are primarily deterministic browser checkpoints.

Authenticated live evidence is required only when a Scanner guarantee depends on the real production origin/session rather than browser mechanics.

Normally:
- arbitrary SQL semantics → Chromium;
- safety/type/scheduler/restart → Chromium;
- provider isolation → deterministic mocked provider + final L-3;
- production origin/ownership interaction → later ownership/L-3 gates.

Do not burden the user with live runs for facts CI can prove.

---

# 37. ND-25 closure algorithm

Conceptually:

~~~text
collect ND-25 evidence
→ verify candidate identity/freshness
→ reject missing/FAIL/Unknown
→ verify safety corpus
→ verify committed-state/result/scheduler/restart
→ evaluate mixed-load result
→ if CND-03 required: require selected-mechanism proof
→ require Fast/Browser/security green
→ ND-25 PASS
~~~

The aggregator/checklist itself should be deterministic and testable.

---

# 38. ND-27 closure algorithm

Conceptually:

~~~text
require fresh ND-25 PASS
→ collect UI/navigation/isolation evidence
→ verify candidate identity/freshness
→ reject missing/FAIL/Unknown
→ require Current/Detail regression green
→ require full Browser CI + security guards
→ ND-27 PASS
~~~

No product PASS is inferred solely from engine PASS.

---

# 39. E9 exit criteria

Pass E9 planning is complete when another implementation chat can determine without guessing:
- which Scanner contracts are permanent regression targets;
- which tests belong in Node versus Chromium;
- what exact safety positive/negative corpus is required;
- how committed-state consistency is verified;
- how execution/result/type/large-result truth is verified;
- how scheduler/no-overlap/restart behavior is verified;
- when CND-03 is activated and what extra proof it creates;
- how UI/grid/drill-down/multi-Viewer behavior is verified;
- how Scanner isolation is protected permanently;
- exactly what closes ND-25;
- exactly what closes ND-27;
- which changes stale which evidence;
- which temporary POCs are retained or removed.
