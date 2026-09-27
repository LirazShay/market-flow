# Browser SQL V2 — Post-KISS Scanner Audit

## Role

This is the fourth post-KISS consistency audit under Issue #72.

Scope:
- Scanner implementation manual;
- Scanner verification plan;
- D-029 analytical execution decision;
- D-032 Viewer/client decision as it affects Scanner;
- D-039 analytical preemption decision;
- Live SQL Query Execution product requirement.

Goal:

~~~text
retain a useful, safe Dynamic SQL Scanner
without turning it into a query-management platform
~~~

This audit does not implement runtime/product code and does not yet mutate canonical GitHub execution Issues.

Current scope authority: browser-sql-kiss-scope-reset.md.

---

# 1. Overall conclusion

The Scanner remains a first-class V2 feature, but its first release can be much simpler than E8/E9.

Initial product:

~~~text
SQL textarea
+ repeat interval
+ explicit Activate
+ one active SQL/config
+ read-only execution
+ at most one Scanner query running
+ result table
+ clear status/error
+ optional SecurityId drill-down
~~~

That is enough.

Initial V2 does not need a query-versioning system, collaboration protocol, generic scheduler framework, advanced cancellation system or streaming architecture unless measured reality forces one.

---

# 2. What remains non-negotiable

Keep:
- editable user SQL;
- independent repeat interval;
- explicit activation rather than executing every keystroke;
- read-only safety enforced by a real parser/engine-backed mechanism, not regex alone;
- queries see coherent committed market data;
- at most one Scanner execution at a time;
- no hidden filter/ranking/sort added by Viewer;
- zero rows is success;
- errors are visible and do not corrupt market data;
- Scanner does not change provider cadence or persistence-success semantics;
- result rendering preserves NULL and numeric meaning;
- Current/Detail continue to work when Scanner is absent, failing or returning zero rows;
- representative mixed-load behavior is tested;
- arbitrary SQL remains user-controlled within the safe read-only boundary.

These are the actual product/correctness requirements.

---

# 3. Replace immutable query versions with one active config

D-029 currently requires immutable query versions and execution version IDs.

SUPERSEDE for initial V2.

Use:

~~~text
draftSql
draftInterval
activeSql
activeInterval
~~~

On Activate:

~~~text
validate interval
→ validate SQL safety
→ if valid: replace active config
→ start/restart simple schedule
→ execute according to selected immediate-run behavior
~~~

No history of every activation is required.

Git history is not relevant to user-entered SQL, but this daily tool also does not need an in-product audit log of every edit.

If saved queries/history become useful later, add them as a product feature later.

---

# 4. Persist only the current active config

Initial restart usefulness justifies one small durable Scanner config:

~~~text
activeSql
activeInterval
enabled/active flag if needed
~~~

Nothing else is required initially.

Do not persist:
- every previous SQL version;
- editor keystrokes;
- previous result tables;
- full execution history;
- collaborative edit metadata.

On runtime restart:

~~~text
load active config
→ SQL authority becomes ready
→ Scanner starts again from a clean runtime state
~~~

Draft text may be ephemeral in initial V2.

---

# 5. Simplest restart behavior

Do not preserve complicated latest-execution metadata across runtime restarts.

Preferred initial behavior:

~~~text
runtime restart
→ active config restored
→ previous in-memory result/status cleared or marked unavailable
→ run active SQL once when runtime is ready
→ establish fresh result/status
~~~

This is simpler and more useful than restoring metadata for a result whose rows no longer exist in runtime memory.

If automatic restart execution later proves undesirable, that can be adjusted with one explicit product rule.

---

# 6. Keep latest error and latest success only in live runtime state

Within one runtime lifetime, it is useful to preserve:

~~~text
current/latest execution status
+ last successful result
~~~

So:

~~~text
success
→ later query error
→ show the error
→ previous successful result may remain visible as clearly stale/previous
~~~

This is a small UI/runtime behavior, not a durable execution-history subsystem.

After full runtime restart, a fresh run establishes new state.

---

# 7. Scheduler becomes a small timer policy

D-029's anchored cadence mathematics and the E8/E9 scheduler framework are more than initial V2 needs.

Required behavior only:

- configurable positive interval;
- one active query at a time;
- no overlapping executions;
- no burst replay of missed intervals;
- changing interval requires explicit Activate;
- runtime restart starts a fresh schedule;
- Scanner interval does not change collector cadence.

Simple candidate policy:

~~~text
Activate
→ run once promptly
→ timer creates repeat opportunities every X seconds
→ if query is already running, skip/coalesce that opportunity
→ next normal opportunity continues
~~~

No persisted schedule anchor is required.

Exact timer implementation can be chosen during code/tests as long as these behaviors hold.

---

# 8. Query replacement while one is running

Do not add cancellation just to make activation instantaneous.

Simple first-release rule:

~~~text
query A running
+ user activates B
→ B becomes the next active config
→ A is allowed to finish unless the engine already offers a trivial proven safe cancellation path
→ A result remains attributable to A
→ next execution uses B
~~~

UI must not display A's completed result as if B produced it.

This needs a small execution/config identity in memory, not immutable durable version history.

---

# 9. Multi-Viewer editing is not a collaboration problem

The product has one user.

Multiple Viewer windows may exist, but initial V2 does not need collaborative editor concurrency control.

SUPERSEDE D-032's mandatory optimistic expectedActiveQueryVersionId mechanism.

Simple policy:

~~~text
each Viewer keeps its own draft
explicit Activate sends one command to the single runtime
last successfully processed activation becomes active
all Viewers resync/show current active config
~~~

If two activations race, the runtime processes them in one deterministic command order.

No silent second runtime/DB owner is created.

A stale local draft is merely a draft; it is not authoritative until Activate.

---

# 10. SQL safety stays strong

This is one area not to weaken.

Scanner user SQL must not mutate the market-data authority or escape the intended browser-local analytical boundary.

Keep:
- one result-producing read-only statement;
- parser/engine-backed classification;
- block DML/DDL/transaction/admin/external access paths;
- verify hardening features on the exact pinned DuckDB-Wasm build;
- trusted schema/admin SQL uses a separate application-controlled path.

Representative allowed tests:
- SELECT;
- WITH;
- JOIN;
- WHERE;
- GROUP BY/HAVING;
- ORDER BY;
- LIMIT;
- window functions;
- historical conditions;
- ranking.

Representative blocked tests:
- INSERT/UPDATE/DELETE/MERGE;
- CREATE/ALTER/DROP;
- transaction control;
- ATTACH/DETACH;
- COPY/external-file access;
- INSTALL/LOAD;
- disallowed SET/PRAGMA/configuration;
- multi-statement attempts.

Keep a small bypass-regression corpus for comments/whitespace/semicolons/strings.

Do not turn it into a generic SQL-security research project.

---

# 11. Scanner SQL surface should be ordinary and discoverable

Do not build a separate elaborate SQL API layer unless needed.

The Scanner should expose a small stable set of intentionally queryable tables/views:

~~~text
current/latest market state
history snapshots
useful verified typed source fields
raw provider JSON where intentionally exposed
any selected persisted derived fields
~~~

Internal control/migration tables need not be advertised.

A short schema/help section and a default example query are enough for first use.

---

# 12. Result delivery: simplest path first

Do not require streaming in initial V2.

Preferred baseline:

~~~text
execute query using the simplest proven DuckDB-Wasm result API
→ obtain result metadata/rows
→ render a bounded practical number of rows in Viewer
~~~

Rules:
- SQL is not silently rewritten with LIMIT;
- if the full result is materialized and row count is known, report it truthfully;
- if Viewer renders only the first N rows, label that clearly;
- no hidden sort/filter/rank;
- zero rows remains a successful empty result.

Representative Scanner queries should normally be written sensibly, including LIMIT where the user only wants top opportunities.

If real result-size tests show materialization is unsafe, activate conditional streaming work.

---

# 13. Large results are a conditional optimization problem

Remove mandatory initial streaming/full-count/partial-count architecture.

Initial requirement:

~~~text
do not lie about what is displayed
~~~

If simple materialization is safe for representative day-sized Scanner queries, keep it.

If not:

~~~text
measure problem
→ add the smallest proven streaming/chunked result mechanism
~~~

Do not build both paths before evidence requires them.

---

# 14. Result type handling should be practical, not exhaustive

The E9 exhaustive type matrix is useful reference but too broad as a mandatory first-release gate.

Initial renderer must safely handle the common result types produced by real queries:
- NULL;
- boolean;
- numeric integer/float/decimal;
- BIGINT without precision loss;
- text;
- date/time/timestamp;
- JSON/raw text.

For nested/binary/uncommon engine types:

~~~text
render a truthful safe representation
or
show explicit unsupported value/type
~~~

Do not silently coerce values in a way that changes meaning.

Add permanent tests for uncommon types only when supported/used behavior is implemented or a bug is discovered.

---

# 15. One result-grid contract

Keep the UI contract small:

- columns come from SQL result metadata;
- column order follows SQL result;
- row order follows SQL result;
- NULL stays distinct from zero;
- errors are not rendered as empty results;
- zero rows is a successful empty table;
- result is associated with the SQL/config that actually produced it;
- Viewer does not add hidden analytical semantics.

Do not build a generic data-grid product beyond what the Scanner needs.

---

# 16. Performance/resource model: measure the simple design first

D-039's dedicated disposable analytics connection, pending-query cancellation, stream abort, budgets and Worker-restart escalation are not mandatory initial scope.

Initial model:

~~~text
one Scanner query at a time
+ same single SQL authority
+ simplest proven query connection/execution path
+ no new query starts while one is running
~~~

Run a representative mixed workload:

~~~text
normal cycle ingest
+ repeated real Scanner query
~~~

Observe:
- whether ingest backlog grows;
- whether query durations are acceptable;
- whether Current/Detail remain responsive enough;
- whether memory/result handling is stable.

If the simple model passes, stop.

---

# 17. Conditional advanced resource work

Only if the mixed-load test proves a real problem may initial V2 add the smallest necessary mechanism.

Potential escalation order:

~~~text
1. improve the query / add LIMIT where semantically correct
2. improve SQL/schema for the expensive query
3. adjust Scanner minimum interval if evidence supports it
4. use a separate analytics connection if that materially helps and is safe
5. add proven cancellation/abort behavior
6. Worker restart/recovery only as a last resort
~~~

Do not jump to step 5/6 because Phase T planned them.

---

# 18. Interval limits are evidence-driven but simple

The product needs a configurable interval.

Exact minimum interval is selected from the normal daily mixed-load test.

Do not create a generic performance-policy system.

Implementation may have:

~~~text
default interval
minimum accepted interval
positive finite validation
~~~

with the values documented and tested.

No silent clamping.

---

# 19. Scanner restart is not a state-recovery project

Initial behavior can be:

~~~text
runtime starts
→ DB ready
→ active config loaded
→ Scanner timer starts
→ active query runs fresh
~~~

There is no need to reconstruct:
- an interrupted execution object;
- partial row counts;
- old previews;
- old scheduler anchor;
- old cancellation state.

Anything running at shutdown simply did not complete in the new runtime lifetime.

---

# 20. SecurityId drill-down remains small and optional

Keep the useful rule:

~~~text
if the result exposes a valid canonical SecurityId
→ user may open the shared Detail/History view
~~~

Detail always rereads authoritative SQL state by SecurityId.

Do not trust other Scanner result columns as current market authority.

If drill-down would delay the basic Scanner, it may be the final small Scanner integration task rather than part of core execution.

---

# 21. Scanner isolation remains a permanent regression target

These tests are high value and simple:

- changing SQL does not change provider endpoint/chunking/cadence;
- changing Scanner interval does not change collector cadence;
- Scanner activation does not call provider APIs;
- unsafe SQL cannot mutate market tables;
- Scanner query failure cannot mark a provider cycle successful;
- Current/Detail work with Scanner disabled or broken;
- Current manual refresh does not execute Scanner;
- Detail rereads authoritative data;
- one runtime owns SQL/OPFS.

Keep these permanently.

---

# 22. Verification plan can shrink drastically

The E9 plan has separate matrices for lifecycle, multi-Viewer, safety, committed state, execution identity, exhaustive types, large results, scheduler, restart, resource safety, runtime faults, editor/grid, drill-down and two checkpoints.

For initial V2, organize permanent Scanner tests into six groups:

## S1 — activation/config
- draft does not execute;
- valid Activate changes active SQL/interval;
- invalid Activate keeps prior active config;
- runtime restart restores active config and runs fresh;
- multiple Viewer activation follows simple last-processed-wins/resync behavior.

## S2 — read-only safety
- representative allowed SQL;
- representative blocked SQL;
- bypass-regression cases;
- exact pinned-build hardening.

## S3 — execution/timer
- one execution at a time;
- no overlap;
- no burst replay;
- interval change on Activate;
- query replacement while running stays attributable correctly;
- zero rows success;
- query errors visible.

## S4 — result table
- dynamic columns/order;
- common types;
- BigInt precision;
- NULL vs zero;
- bounded rendering/truncation truth;
- previous success vs new error within one runtime.

## S5 — isolation/navigation
- provider/collector independence;
- Current/Detail independence;
- optional SecurityId drill-down;
- one SQL/runtime owner.

## S6 — mixed daily workload
- repeated representative Scanner query;
- normal collector/persistence;
- no growing backlog;
- stable memory/result behavior;
- acceptable user responsiveness.

This preserves meaningful proof without turning the test plan into another product.

---

# 23. Remove separate ND-25 and ND-27 checkpoints

For the KISS product, separate formal engine and product checkpoints add little value.

Replace them with one Scanner completion checkpoint:

~~~text
Scanner core + UI implemented
→ S1..S6 green
→ Fast CI green
→ full Browser CI green
→ security guards green
→ Scanner complete
~~~

Implementation can still naturally use two Issues:

~~~text
A. Scanner core/safety/timer
B. Scanner UI/results/integration
~~~

but they do not need separate release-gate bureaucracy.

---

# 24. Live verification boundary

Scanner behavior is primarily Browser-CI work.

Do not create a separate authenticated-Leumi Scanner live gate.

The final integrated live run later naturally verifies that:
- Scanner can run while real collection is active;
- Current/Detail remain healthy;
- one runtime owner is active.

SQL safety, timer behavior, result types and UI semantics belong in deterministic Chromium tests.

---

# 25. Updated meaning of D-029

Pass G should replace D-029 with something close to:

~~~text
Scanner owns one active read-only SQL statement and repeat interval.

Activation is explicit.

At most one Scanner query runs at once.

Missed timer opportunities do not burst.

Queries read committed SQL state.

Zero rows is success.

Errors are visible and do not replace/corrupt market authority.

Result order/schema follow SQL.

Exact timer/result-delivery optimizations are selected only when evidence requires them.
~~~

No immutable version-history requirement.

---

# 26. Updated meaning of D-032

Keep:

~~~text
Viewer is a client
Runtime/SQL is authority
notifications are hints
Viewer resyncs authoritative state
multiple Viewers do not create multiple DB owners
~~~

Remove mandatory optimistic Scanner editor concurrency.

A simple last-processed activation rule is enough for one-user V2.

---

# 27. Updated meaning of D-039

Pass G should supersede mandatory preemption with:

~~~text
Scanner must not create overlapping executions or unbounded ingest backlog.

Start with the simplest one-query-at-a-time execution model.

Measure representative mixed load.

Add cancellation/preemption only if required by evidence.
~~~

---

# 28. Detailed-doc disposition

## browser-sql-scanner-implementation-manual.md

Classification: SUPERSEDE as canonical implementation manual; KEEP as cold edge-case/reference material.

Useful retained knowledge:
- read-only safety boundary;
- committed-state consistency;
- execution/result attribution;
- Scanner isolation;
- SecurityId drill-down principle.

## browser-sql-scanner-verification-plan.md

Classification: SUPERSEDE as canonical verification structure; KEEP as regression idea inventory.

Replace the broad matrices with S1..S6.

## live-sql-query-execution.md

Classification: KEEP + UPDATE.

Product behavior remains correct.

Update stale engine-undecided wording and avoid implying a particular complex scheduler.

---

# 29. Proposed compact Scanner execution shape

Likely two executable Issues:

~~~text
1. Scanner core
   - active SQL + interval
   - persistence of current active config
   - read-only safety
   - one-at-a-time timer
   - execution/result state

2. Scanner UI + integration
   - editor/Activate/status
   - result table
   - common type formatting
   - optional SecurityId drill-down
   - isolation + mixed daily workload
~~~

If implementation is small enough, these may be one coherent Issue.

---

# 30. Post-KISS Scanner acceptance test

The Scanner plan is simple enough when a fresh engineer can explain it as:

~~~text
user writes SQL
→ clicks Activate
→ one safe read-only query runs now and every X seconds
→ if one is already running, do not start another
→ show exactly the result/error truthfully
→ do not disturb Recorder or Current/Detail
~~~

If implementation requires understanding immutable query versions, scheduler anchors, OCC, streaming protocols, preemption budgets and Worker-restart escalation before the first query can run, the Scanner is still over-planned.
