# Browser SQL V2 — Post-KISS Testing / CI / Live Verification Audit

## Role

This is the sixth post-KISS consistency audit under Issue #72.

Scope:
- V2 testing policy;
- Browser SQL testing/verification strategy;
- CI cadence;
- Chromium obligations;
- live Leumi verification;
- temporary POCs/benchmarks;
- checkpoint/stage verification rules.

Goal:

~~~text
keep strong public-contract verification
while removing duplicate gates, stale WP/Stage assumptions and test infrastructure that no longer matches the KISS product
~~~

This audit does not implement runtime/product code and does not yet mutate canonical GitHub execution Issues.

Current scope authority: browser-sql-kiss-scope-reset.md.

---

# 1. Overall conclusion

The repository's core testing philosophy is already good and should remain.

Keep:

~~~text
pure deterministic logic → Node
browser/runtime/storage/UI semantics → Chromium
real authenticated-origin/provider facts → live self-verifying probe
~~~

Also keep:
- tests protect observable/public contracts;
- test-first/regression-first when practical;
- automation-first;
- temporary POCs are allowed but must be removed or promoted deliberately;
- no credentials/session data in CI;
- added/modified Playwright tests run in Chromium after final edit.

The over-engineering is mostly in the Browser SQL-specific planning layer, not in the core testing policy.

---

# 2. TESTING_POLICY.md classification

## KEEP

Keep the general sections:
- three test layers;
- test-first/change flow;
- public behavior over private internals;
- automation-first rule;
- temporary POC disposition;
- Fast CI command/workflow;
- Browser CI command/workflow;
- live-session security boundary;
- E2E debugging/failure-review discipline.

These remain excellent project rules.

## SIMPLIFY / UPDATE

The Browser SQL-specific tail currently contains stale assumptions:
- mandatory implementation-entry wording tied to the old WP-03 model;
- synthetic preflight framed around WP-03;
- real-origin Web Locks implicitly coupled to the early gate;
- numbered Stage closure language;
- references to the old detailed Browser SQL strategy as canonical implementation target.

Pass G should rewrite this section to reflect the compact KISS execution plan.

---

# 3. Keep the CI topology small

Initial V2 needs only two normal CI workflows:

~~~text
Fast CI
= Node/unit/static/build/guard checks

Browser CI
= Playwright + Chromium integration
~~~

Do not create a permanent workflow for every mini-project or capability.

Temporary focused POC workflows are allowed while answering a real uncertainty, then removed if no longer useful.

---

# 4. Fast CI responsibility

Fast CI should stay the default push/PR gate.

It should cover only deterministic, cheap checks such as:
- collector validation logic;
- canonical SecurityId logic;
- null/zero/empty/missing policy where pure;
- simple Scanner timer/config policy where pure;
- SQL safety policy helpers if independently testable;
- result-formatting helpers where pure;
- build/runtime manifest consistency;
- secret/static guards;
- documentation/current-plan consistency guards when useful.

Do not put browser emulation or benchmark-scale workloads into Fast CI.

---

# 5. Browser CI responsibility

Browser CI owns behavior that actually depends on Chromium/browser APIs:
- DuckDB-Wasm Worker/Wasm startup;
- OPFS persistence/reopen;
- atomic SQL cycle persistence;
- runtime/Viewer integration;
- Current/Detail behavior;
- history paging;
- Browser Web Locks;
- Scanner execution/safety on the pinned engine;
- Scanner timer/no-overlap integration;
- result-grid behavior;
- runtime restart/reconnect;
- representative integrated daily workload at synthetic/compressed scale.

Browser CI proves real browser mechanics, not the real Leumi authenticated origin.

---

# 6. Browser CI cadence

Keep the practical rule:

~~~text
browser-dependent production change
→ targeted Chromium during TDD/debugging
→ final affected Chromium verification
~~~

Run the **full Browser suite** when a change crosses important subsystem boundaries, including:
- SQL storage/runtime assembly;
- persistence/recovery;
- Recorder→SQL→Viewer integration;
- shared Viewer shell/runtime protocol;
- Scanner integration with ingest/Viewer;
- single-owner behavior;
- final mini-project/checkpoint closure.

Do not require the full suite after every tiny isolated pure-code/doc change.

Do not define closure around obsolete numbered Stages.

---

# 7. Remove 'numbered Stage' as a testing concept

The old policy says every numbered V2 Stage closure requires Fast CI + full Browser CI.

SUPERSEDE.

The compact plan should instead use:

~~~text
coherent browser/runtime mini-project completes
→ Fast CI
→ full Browser CI
~~~

For a pure planning/docs or pure Node-only unit of work, Browser CI is not automatically required.

This is simpler and directly tied to what changed.

---

# 8. L-1 live probe remains an early hard premise

One early real-origin live probe still earns its place.

It should prove only:

~~~text
injected runtime works on authenticated Leumi origin
→ Blob Worker
→ exact pinned DuckDB Worker/Wasm
→ OPFS DB
→ synthetic write/commit
→ required durability/reopen behavior
→ sanitized PASS/FAIL
~~~

If this fails because of CSP/origin/browser policy, stop and revisit the runtime-delivery premise.

This is the one live check that legitimately occurs before the main SQL implementation depends on the environment.

---

# 9. Remove Web Locks from the early live blocker

Real-origin Web Lock behavior is important but it does not need to block SQL storage implementation.

New placement:

~~~text
Chromium two-tab Web Lock tests during ownership implementation
→ real-origin two-tab ownership probe before final cutover
~~~

Therefore:
- L-1 = Worker/Wasm/OPFS premise;
- ownership live proof = later final-integration requirement.

Pass G should remove old wording that WP-05+ is blocked on real-origin Web Locks.

---

# 10. L-2 remains one bounded provider integration proof

After the normal Recorder→SQL path exists, one live authenticated probe should prove:
- MapHeat2 still supplies the dynamic universe;
- sequential GetSecuritiesData still works;
- complete-cycle validation succeeds on real responses;
- the same validated cycle reaches SQL;
- committed SQL facts can be read back;
- no new auth/session material is copied outside the page boundary.

This does not need its own permanent CI workflow because authenticated CI is intentionally unavailable.

The generated live artifact should self-judge PASS/FAIL.

---

# 11. Final live verification is integrated, not another platform

At cutover, run one bounded final authenticated transition using the actual candidate after the old IndexedDB Recorder has settled/stopped.

It should observe enough to show:
- no normal overlap between old and SQL production authorities;
- real collection continues into SQL commits;
- exact cycle-integrity counters remain valid;
- Current/Detail work;
- one representative Scanner query is explicitly activated and succeeds;
- one runtime owner holds and a second same-origin tab remains passive;
- no obvious live-only runtime/storage/provider failure occurs.

Day-scale load/performance belongs primarily in deterministic Chromium.

Do not build a separate L-3 framework, workflow family or evidence database.

---

# 12. Live evidence should stay tiny

Each live probe needs only:
- probe kind;
- candidate commit/build identity;
- PASS/FAIL;
- failed stage if any;
- safe counters relevant to that probe.

Security rule remains strict:
- no cookies;
- no authorization/session tokens;
- no account identifiers;
- no raw authenticated provider dumps;
- no sensitive screenshots/traces.

A generic evidence schema/freshness service is unnecessary.

---

# 13. Synthetic fixtures remain, but only by contract family

Keep sanitized fixtures for meaningful public behaviors.

Recommended compact fixture families:

## F1 — provider/universe
- changing universe;
- duplicate/missing/unexpected IDs;
- varied canonical string IDs;
- provider failure/partial response.

## F2 — source-value semantics
- normal values;
- null;
- zero;
- empty string;
- missing property;
- future/unknown raw field preservation.

## F3 — persistence/history
- multiple committed cycles;
- equal timestamps;
- failure before commit;
- reopen;
- security leaves/returns to current universe.

## F4 — Scanner
- useful SELECT/JOIN/GROUP BY/HAVING/window;
- zero rows;
- syntax/runtime error;
- unsafe SQL;
- practical large result;
- canonical SecurityId result.

## F5 — browser capability/failure
- Worker/Wasm success/failure;
- OPFS startup/reopen;
- dropped notification;
- runtime restart;
- Web Lock competition.

Do not maintain fixture families for unimplemented horizon/preemption/upgrade machinery.

---

# 14. Remove stale enrichment tests from the baseline strategy

The current strategy lists mandatory Node/Chromium tests for:
- horizon canonicalization;
- predecessor selection;
- LAST calculations;
- MID;
- temporal enrichment;
- DealsDelta;
- multi-session history.

These are no longer baseline tests.

New rule:

~~~text
an enrichment optimization ships
→ add focused tests for exactly that optimization
~~~

If no persisted enrichment ships, there is no enrichment test subsystem.

---

# 15. Remove stale Scanner complexity tests

The current strategy lists mandatory tests for:
- anchored cadence;
- immutable query-version activation;
- optimistic editor concurrency;
- stream counting;
- restart catch-up anchors;
- preemption decisions.

These are not baseline requirements after KISS.

Replace with the six Scanner groups already defined by the post-KISS Scanner audit:

~~~text
S1 activation/config
S2 read-only safety
S3 execution/timer
S4 result table
S5 isolation/navigation
S6 mixed daily workload
~~~

Only selected conditional mechanisms add extra tests.

---

# 16. Remove upgrade/rollover test suites from initial V2

The current strategy ends with large Phase U/V-style multi-tab/upgrade obligations.

Initial V2 should keep only:

### Ownership
- one owner;
- passive loser;
- release on owner close;
- next owner runs readiness;
- no steal/heartbeat authority.

### Schema incompatibility
- unsupported schema/build refuses to record;
- DB remains untouched;
- no silent reset.

Do not test:
- side-by-side future release migration;
- promotion journals;
- old/new candidate DB rollback;
- archive rollover phases;
- engine storage-format migration.

Those tests belong to a future feature only when that feature exists.

---

# 17. Fault injection remains valuable, but sparse

Keep fault injection where it proves a real dangerous boundary:
- persistence fails before COMMIT;
- acknowledgement/retry ambiguity only if the selected implementation can create it;
- Worker/runtime loss around reopen;
- dropped Viewer notification;
- storage write failure;
- Scanner execution error;
- unsafe SQL rejection.

Do not create fault injection points for hypothetical subsystems.

Use test adapters/public seams, not production backdoors.

---

# 18. Performance tests are not ordinary CI

Representative daily workload verification should be deterministic and repeatable, but does not need to run on every push if it is materially heavier.

Recommended policy:

~~~text
small correctness Browser CI
+ focused representative daily-workload job/checkpoint when performance-affecting work changes
+ final run before cutover
~~~

If the daily workload is cheap enough to fit comfortably in normal Browser CI, keep it there.

Do not create a separate benchmark framework unless timing evidence actually requires one.

---

# 19. Windows/target lane remains conditional

No permanent Windows workflow is required until one of these is true:
- a browser/OPFS issue is Windows-specific;
- a performance decision depends materially on the target environment;
- final release confidence warrants a target-OS run.

Otherwise normal Chromium CI remains sufficient.

---

# 20. Permanent high-value regression suite

Initial V2 should permanently protect roughly these contracts:

## Provider/data
- complete-cycle validation;
- dynamic universe;
- canonical IDs;
- raw/value preservation;
- failed cycle no commit.

## SQL storage
- atomic visibility;
- current/history/latest coherence;
- reopen;
- no silent reset;
- safe unsupported-schema behavior.

## Viewer
- Current membership/sort/display;
- Detail/history paging/no duplicate-skip;
- authoritative reread after notification/reload;
- Current↔Detail navigation.

## Ownership
- one Web Lock owner;
- passive non-owner;
- safe takeover after release.

## Scanner
- activation/config;
- read-only safety;
- no-overlap timer;
- truthful result/error/zero rows;
- isolation from Recorder/Current/Detail.

## Integrated
- representative daily mixed load;
- final generated runtime/build consistency.

This is enough to protect the product without encoding every planning detail.

---

# 21. Temporary POC disposition remains mandatory

Keep the rule:

~~~text
temporary experiment answers question
→ if it protects a durable contract: retain minimal regression
→ otherwise remove it
~~~

Examples likely to remain temporary:
- cancellation API experiments if cancellation is not selected;
- streaming experiments if simple materialization works;
- storage-growth probes beyond retained day-scale verification;
- shadow comparison if never activated or after its one question is resolved.

---

# 22. CI workflow target after Pass G

The target workflow set should remain small:

~~~text
Local History Viewer V2 Fast CI
Local History Viewer V2 Browser CI
~~~

Optionally retain/create a focused temporary or manually triggered performance/live-preparation workflow only when a concrete need exists.

Do not encode the canonical execution plan as one workflow per Issue.

---

# 23. Documentation guards

A few cheap static guards are worthwhile after the canonical rewrite.

Potential guards:
- STATUS.json remains parseable and within HOT-size budget;
- current product docs do not claim the 42-WP graph is canonical;
- accepted decision references do not point to superseded plan as current authority;
- generated runtime manifest matches pinned assets;
- public artifacts do not contain forbidden credential/token patterns.

Do not build a generic plan linter beyond concrete recurring risks.

---

# 24. Verification rule for a normal implementation Issue

Use this simple pattern:

~~~text
public behavior/test first when practical
→ implement
→ run exact target
→ if browser-dependent: Chromium on final change
→ Fast CI
→ full Browser CI only when the Issue closes a coherent browser/runtime slice or crosses components
~~~

If a live-only fact belongs to that slice:

~~~text
implementation complete
→ verification-pending
→ run the small self-verifying live probe
→ PASS
→ complete
~~~

No separate checkpoint framework is needed.

---

# 25. Final-release verification rule

Before cutover:

~~~text
Fast CI PASS
+ full Browser CI PASS
+ representative daily workload PASS
+ L-1/L-2 already satisfied for current compatible candidate
+ final real-origin ownership/integrated live run PASS
+ no unresolved data-integrity/security issue
~~~

Then perform the explicit cutover.

This is a release checklist, not another implementation subsystem.

---

# 26. Testing-policy changes required later

Pass G should update TESTING_POLICY.md to:
- retain the general three-layer policy;
- replace old WP-03 wording with small L-1 premise wording;
- remove early real-origin Web Lock blocker;
- replace numbered Stage closure language with coherent mini-project/browser-slice closure;
- remove old WP/Phase-specific references;
- point Browser SQL planning target to the compact canonical plan rather than the old Phase-L strategy.

---

# 27. browser-sql-testing-verification-strategy.md disposition

Classification: SUPERSEDE as canonical testing strategy; KEEP as cold detailed test-idea inventory.

Its strongest durable contributions remain:
- cheapest valid test layer;
- public contracts over internals;
- automation-first;
- synthetic sanitized fixtures;
- Chromium for actual browser mechanics;
- live verification only for real origin/provider facts;
- no manual acceptance when assertions can self-verify.

Its stale baseline assumptions around horizons, query versions, anchored scheduling, preemption, upgrade lifecycle and old WP gates must not guide implementation.

---

# 28. Proposed compact test documentation

After Pass G, implementation should normally need:

~~~text
tests/TESTING_POLICY.md
+ active Issue acceptance/tests
~~~

Optionally one short Browser SQL test matrix can summarize:

~~~text
Provider/Data
Storage
Viewer
Ownership
Scanner
Integrated Daily
Live L-1/L-2/Final
~~~

Do not require engineers to read the old long Phase-L strategy for normal work.

---

# 29. Post-KISS testing acceptance test

The verification plan is simple enough when a fresh engineer can say:

~~~text
test pure logic in Node
→ test real browser/SQL behavior in Chromium
→ use live Leumi only for origin/provider facts
→ keep the important regressions
→ remove experiments
→ run full Browser CI at meaningful integration boundaries
~~~

If a normal feature requires navigating named phases, WP-specific workflows, evidence registries, stage aggregators or future-upgrade test suites, testing is still over-planned.
