# Browser SQL V2 — Pre-materialization Reconciliation Map

## Role

This document defines the exact repository reconciliation required before and during creation of the new compact Browser SQL GitHub graph.

It is the bridge between:

~~~text
post-KISS planning
→ canonical repository rewrite
→ new Master + C01..C12 Issues
→ old 42-WP graph retirement
→ final planning verification
~~~

This is planning-only. No product/runtime implementation is authorized here.

Current execution-plan inputs:

~~~text
docs/browser-sql-compact-execution-dag.md
docs/browser-sql-compact-issue-specifications.md
~~~

Current live progress remains only in STATUS.json.

---

# 1. Reconciliation objective

After materialization, a fresh implementation chat must see one current truth:

~~~text
STATUS.json
→ ROADMAP.md
→ one compact GitHub Master
→ C01..C12 executable Issues
→ only directly linked current contracts/code/tests
~~~

It must **not** encounter the old 42-WP plan as a second plausible current implementation path.

The old plan remains preserved as historical evidence, not rewritten out of existence.

---

# 2. Final current-authority model

After reconciliation, ownership should be:

~~~text
STATUS.json
= live current/next/verification only

ROADMAP.md
= compact implementation scope/order only

GitHub Master + C01..C12
= executable work units / direct dependencies / acceptance

D-043
= product continuity + three surfaces

new D-044
= post-KISS Browser SQL architecture/implementation baseline

docs/product/*.md
= durable product behavior

tests/TESTING_POLICY.md
= durable testing policy

compact DAG
= durable dependency/design rationale

docs/history/
= old 42-WP plan, old freeze, deep audit/planning rationale
~~~

No other document should carry a competing live execution pointer.

---

# 3. New durable decision: D-044

Create one compact successor decision rather than many replacement decisions.

Proposed title:

~~~text
D-044 — Browser SQL V2 uses a post-KISS minimum SQL core, product-first migration and evidence-triggered optimization
~~~

D-044 should own the current implementation-level decisions that changed during the re-baseline:

- minimum raw/current/history SQL core first;
- atomic complete-cycle persistence remains mandatory;
- persisted analytical enrichment is optional/evidence-triggered;
- one active Scanner SQL/config rather than immutable query-version history;
- simple no-overlap timer rather than anchored scheduler machinery;
- simple materialized/bounded truthful results first; streaming conditional;
- minimum proven durability/retry mechanism rather than fixed CHECKPOINT/idempotency ritual;
- Viewer remains a client; no mandatory optimistic editor concurrency;
- representative daily workload rather than fixed 25%/50% and mandatory 2x gates;
- retain-all + no silent loss; archive/rollover conditional/future;
- one query at a time; advanced preemption conditional;
- one stable exclusive Web Lock remains mandatory, with live proof moved to final readiness;
- generalized persistence upgrade framework is future-only;
- implementation graph is one Master + C01..C12;
- conditional O1..O6 work is created only when evidence triggers it.

D-044 must explicitly say it preserves the product/data invariants from D-043 and the core Browser-only/one-authority/pinned-runtime decisions that remain valid.

---

# 4. Decision-file disposition D-025..D-043

Do not silently edit old decision meaning while leaving all files simply 'Accepted'.

Each affected file receives a short top-of-file status/supersession note and, only where necessary, a concise current clarification.

| Decision | Treatment | Current meaning after reconciliation |
|---|---|---|
| D-025 | KEEP + AMEND | Browser-only remains; DuckDB-Wasm is now selected/pinned rather than unknown |
| D-026 | KEEP | one dedicated SQL Authority Worker / Runtime Controller boundary remains |
| D-027 | SUPERSEDE by D-044 | fixed eight-horizon wide schema is no longer mandatory |
| D-028 | SUPERSEDE by D-044 | atomic complete-cycle persistence remains, but fixed SQL-side enrichment/predecessor scheme does not |
| D-029 | SUPERSEDE by D-044 | replace immutable versions/anchored scheduler/mandatory streaming with simple active config + no-overlap timer |
| D-030 | SUPERSEDE by D-044 | keep OPFS authority/no silent reset; production checkpoint/idempotency mechanism becomes evidence-driven |
| D-031 | KEEP + AMEND | pinned self-contained runtime remains; real-origin capability proof is C01; exact production durability policy belongs to C03 |
| D-032 | SUPERSEDE by D-044 | keep Viewer-as-client/resync; remove mandatory query-version/OCC/result-recovery machinery |
| D-033 | KEEP + AMEND | Node/Chromium/live layering remains; remove old WP/numbered-stage gate assumptions |
| D-034 | SUPERSEDE by D-044 | replace rigid ratios/2x target gate with representative daily workload evidence |
| D-035 | KEEP + AMEND | fresh SQL cutover/no legacy import/explicit rollback remains; shadow is conditional only |
| D-036 | SUPERSEDE by D-044 | preserve scoped failure/security, replace rich health/incident model with minimal truthful health/diagnostics |
| D-037 | SUPERSEDE by D-044 | old 42-WP execution decomposition retired |
| D-038 | SUPERSEDE by D-044 | retain-all/no silent deletion remains; archive/rollover conditional/future |
| D-039 | SUPERSEDE by D-044 | no mandatory preemption framework; activate only from C11 evidence |
| D-040 | KEEP + AMEND | stable exclusive Web Lock remains; real-origin proof moves from early blocker to C12 |
| D-041 | SUPERSEDE for initial V2 by D-044 | generalized upgrade lifecycle becomes future-only |
| D-042 | SUPERSEDE by D-044 | old 42-package planning freeze no longer current |
| D-043 | KEEP + AMEND traceability | product/provider meaning unchanged; remove old WP ownership/freeze wording |

`docs/project/decisions.md` must be updated in the same batch so status/index text never disagrees with individual decisions.

Do not create multiple D-045/D-046 decisions merely to restate each compact Issue.

---

# 5. Product documents

## local-history-viewer-v2-product-shape.md

Treatment: AMEND, keep as current product authority.

Required changes:
- keep provider/data continuity unchanged;
- keep three surfaces unchanged;
- replace 'SQL-side enrichment needed by the model' with evidence-driven optional optimization language;
- remove old WP-09..WP-38 traceability;
- trace implementation conceptually to C02..C12, then add actual GitHub Issue links after materialization;
- make clear Current and Detail/History are separate preserved product surfaces;
- keep Scanner additive and no trading execution.

## live-sql-query-execution.md

Treatment: AMEND, keep as current product requirement.

Required changes:
- replace 'engine undecided' with selected pinned DuckDB-Wasm/OPFS boundary;
- keep editable SQL, interval, SQL constructs, zero-row success and committed reads;
- define only behavior when query exceeds interval: no overlap/no burst; avoid prescribing anchored scheduling;
- avoid implying immutable query versions, mandatory streaming or preemption;
- preserve rich raw-history requirement.

---

# 6. ROADMAP.md

Treatment: REWRITE as the compact implementation roadmap.

Do not preserve Planning Phases A..W in the current ROADMAP.

Move the old A..W roadmap to cold history first, then replace ROADMAP.md with approximately:

~~~text
Fixed product/integrity constraints

Implementation group 1 — Feasibility + SQL Core
C01 → C02 → C03 → C04
with C10 allowed to start after C02

Implementation group 2 — V1 Product on SQL
C04 → C05 || C06

Implementation group 3 — Analytics + Scanner
C05+C06 → C07 || C08→C09

Implementation group 4 — Daily Readiness + Cutover
C07+C09+C10 → C11 → C12

Conditional O1..O6 triggers

Implementation non-goals
~~~

ROADMAP must not store completion/current pointer.

After GitHub materialization, ROADMAP may include stable links to the Master/C01..C12, but status stays in STATUS.json.

---

# 7. AI_CONTEXT.md

Treatment: REWRITE after the new GitHub graph exists.

The current AI_CONTEXT is materially stale because it still states:
- Master #20 / Epics #21..#28 / WP-01..WP-42;
- fixed eight horizons;
- ingest_token + COMMIT→CHECKPOINT→ack as mandatory;
- immutable query versions;
- anchored cadence;
- ingest preemption;
- mandatory archive/rollover;
- side-by-side upgrade lifecycle;
- early WP-03 Web Lock gate.

New AI_CONTEXT should contain only compact technical continuation context:

~~~text
same V1 provider contract
→ one SQL Worker / DuckDB-Wasm / OPFS
→ atomic raw/current/history
→ trusted reads
→ Current + Detail/History
→ simple Scanner
→ one Web Lock owner
~~~

Plus:
- data-integrity invariants;
- selected engine identity;
- simple read-only/no-overlap Scanner rules;
- conditional-complexity rule;
- fresh-chat path to current Master/Issue;
- cold-history pointer.

It must not duplicate current/next or Issue completion.

---

# 8. TESTING_POLICY.md

Treatment: AMEND Browser SQL-specific sections only.

Keep the general project policy.

Replace stale Browser SQL wording with:

~~~text
Node → deterministic logic
Chromium → browser/SQL/runtime/Viewer/ownership behavior
Live → authenticated origin/provider facts only
~~~

Specific corrections:
- WP-03 becomes C01 L-1 premise;
- remove early live Web Lock blocker;
- remove numbered-Stage-specific Browser SQL closure language from the workstream-specific section;
- remove mandatory horizon/query-version/anchored-scheduler/preemption/upgrade test expectations unless those features are selected;
- keep full Browser CI at meaningful cross-component/browser-runtime Issue boundaries and before cutover;
- retain automation-first and test-public-contract rules.

Repository-wide AGENTS.md does not need a Browser-SQL-specific rewrite in this batch unless a true repository-wide conflict remains after TESTING_POLICY is updated.

---

# 9. Browser SQL requirements catalog

File:

~~~text
docs/browser-sql-requirements-and-acceptance.md
~~~

Treatment: ARCHIVE / SUPERSEDE as a current planning authority.

Reason:

The catalog contains planning-era requirements that are no longer current initial-V2 contracts, including mandatory core horizons, reusable predecessor relationships, query-version identity and other mechanism-level expectations.

Do not maintain a second large DR/AB catalog just to remap every ID to C01..C12.

Preserve it in cold history as evidence of the pre-KISS planning process.

Promote only still-needed durable truths into:
- product docs;
- D-043/D-044;
- C01..C12 Issue acceptance;
- tests/specs where actually implemented.

Guards must stop requiring DR/AB→old-WP traceability.

---

# 10. Current architecture/design documents

Use a small current set; do not try to make every pre-KISS design document current.

## Keep and rewrite as current

### browser-sql-target-architecture.md

Rewrite compactly to match:

~~~text
authenticated page
→ existing Recorder
→ Runtime Controller / one SQL Worker
→ DuckDB-Wasm/OPFS
→ atomic raw/current/history
→ trusted reads
→ Current / Detail / Scanner
~~~

Remove:
- immutable query version assumptions;
- mandatory preemption references;
- fixed enrichment architecture;
- old planning-phase references.

### browser-sql-compact-execution-dag.md

Keep current.

After actual Issue creation, add stable GitHub Issue links/numbers without adding live status.

## Current only until GitHub materialization

### browser-sql-compact-issue-specifications.md

Keep as the exact Issue-body source until C01..C12 are created and verified.

After successful materialization, archive it as planning evidence so GitHub Issues are the executable source and the repo does not duplicate every Issue body forever.

---

# 11. Pre-KISS mechanism/design documents

These are valuable research history but must not appear as current instructions after materialization.

Archive/supersede the following as cold reference:

- browser-sql-relational-data-model.md;
- browser-sql-ingest-enrichment-atomicity.md;
- browser-sql-execution-scheduler.md;
- browser-sql-persistence-recovery.md;
- browser-sql-viewer-result-delivery.md;
- browser-sql-testing-verification-strategy.md;
- sql-live-engine-benchmark-plan.md;
- browser-sql-migration-cutover.md;
- browser-sql-failure-security-observability.md;
- browser-sql-data-lifecycle-retention.md;
- browser-sql-analytical-resource-isolation.md;
- browser-sql-upgrade-release-lifecycle.md.

Do not rewrite all of them into smaller versions. Their still-valid principles are already captured by D-043/D-044, product docs, TESTING_POLICY and executable Issue acceptance.

Where an existing historical Issue/decision links directly to one of these files, preserve discoverability through an archive path or a small superseded redirect/banner.

---

# 12. Old 42-WP execution-authority documents

These must be removed from current authority decisively.

Files:
- browser-sql-implementation-decomposition.md;
- browser-sql-github-execution-structure.md;
- browser-sql-final-plan-audit.md;
- browser-sql-final-planning-freeze.md.

Treatment:

~~~text
copy exact old content to docs/history/browser-sql-pre-kiss-42wp-plan/
→ preserve old commit/Issue references
→ replace current-path content only where a stable path is still useful
   with a short superseded pointer or new compact equivalent
~~~

Recommended current-path outcomes:

| Path | Current-path result |
|---|---|
| browser-sql-implementation-decomposition.md | short superseded pointer to compact DAG + GitHub Master; old full content archived |
| browser-sql-github-execution-structure.md | rewrite after materialization as concise Master/C01..C12 navigation map with actual Issue numbers |
| browser-sql-final-plan-audit.md | short historical pointer; final post-KISS audit gets a new/current artifact |
| browser-sql-final-planning-freeze.md | old freeze archived; later rewrite same path as the new post-KISS final planning freeze only after final verification |

This preserves stable discoverability without leaving the old 42-WP text looking current.

---

# 13. Post-KISS audit/planning documents

The seven audits, KISS reset, synthesis, critique and reconciliation work are important rationale but should not be normal implementation startup reading.

After the new plan is frozen:

~~~text
index them from docs/history/
→ remove them from 'Current Browser SQL planning direction'
→ keep only a single cold-history pointer in current docs navigation
~~~

Do not delete them.

The compact DAG may remain current; the Issue-specification draft becomes historical after materialization.

---

# 14. docs/README.md

Treatment: REWRITE its Browser SQL navigation into two clearly separated sections.

## Current implementation authorities

Only list the small active set, approximately:
- product shape;
- live SQL product requirement;
- D-043;
- D-044;
- target architecture;
- compact execution DAG;
- current GitHub execution map;
- TESTING_POLICY;
- ROADMAP;
- history index.

## Historical Browser SQL planning

One pointer to:

~~~text
docs/history/README.md
~~~

Do not continue listing every pre-KISS Phase E..W document as if all are equally current.

---

# 15. docs/history

Create a dedicated historical entry such as:

~~~text
docs/history/browser-sql-pre-kiss-42wp-plan/
~~~

At minimum preserve:
- old ROADMAP A..W;
- old implementation decomposition;
- old GitHub execution structure;
- old final plan audit;
- old final planning freeze;
- a STATUS snapshot containing the old 42-WP live-looking verification fields;
- a short README explaining that D-044/post-KISS plan superseded this baseline.

Optionally index the detailed pre-KISS mechanism docs and post-KISS audit trail from the same history README rather than duplicating file bytes when stable links suffice.

History must remain discoverable but COLD.

---

# 16. Guard/test reconciliation

## product-shape-contract.test.js

Must be changed because it currently **requires** D-043 to contain old WP ranges and requires old decomposition/freeze traceability.

New guard should verify:
- product doc still contains MapHeat2/sequential GetSecuritiesData/exact validation/three surfaces;
- D-043 still contains provider continuity + three surfaces;
- D-043 points to D-044/current compact execution authority rather than WP ranges;
- compact DAG/spec or current GitHub execution map owns Current, Detail/History and Scanner;
- no old WP-09..WP-38 ownership text remains in current D-043/product traceability.

## Add a narrow Browser SQL current-plan guard

Create one focused unit guard, not a generic linter.

It should mechanically assert current surfaces such as:
- D-044 exists and is indexed current;
- ROADMAP contains C01..C12 and not the 42-WP handoff;
- current GitHub execution map, once materialized, contains one Master + C01..C12;
- old D-037/D-042 are marked superseded;
- old execution/freeze docs cannot claim the 42-WP graph is current;
- STATUS does not expose old 42-WP decomposition as current verification after transition.

## Existing repository/status guards

Keep:
- documentation-status-source-of-truth.test.js;
- repository-self-maintenance.test.js;
- context-loading-architecture.test.js;
- secret/build/runtime guards.

Update only where the planned new history/current paths deliberately change their expectations.

Do not weaken guards merely to make the rewrite pass.

---

# 17. CI workflow reconciliation

Permanent normal workflows remain:

~~~text
Local History Viewer V2 Fast CI
Local History Viewer V2 Browser CI
~~~

No new permanent workflow is needed for each C Issue.

Temporary old targeted workflows:

~~~text
local-history-viewer-v2-wp02-probe-ci.yml
local-history-viewer-v2-wp03-poc-ci.yml
~~~

Treatment:

- preserve their historical run evidence;
- verify their underlying Playwright specs are covered by normal Browser CI or by C01's explicit live-probe workflow/process;
- remove the WP-named workflows when they no longer provide unique verification value;
- do not rename them into permanent C01/C02 workflows merely to preserve structure.

Because the current reconciliation is docs/planning only, no Browser CI is required merely for these map edits.

---

# 18. STATUS.json reconciliation

STATUS is currently below the HOT-size limit but contains large historical fields that look current.

After the new graph is created and old graph retirement is safe, remove/archive these current-looking fields:
- implementationDecomposition;
- githubExecutionStructure;
- finalPlanningFreeze;
- assuranceAdditions;
- old WP-specific live-gate wording;
- old WP02/WP03 failure-review detail if no longer needed for current execution.

Preserve current useful evidence compactly:
- selected DuckDB-Wasm/core identity;
- reusable Browser SQL probe evidence;
- current latest Fast/Browser CI;
- current spec impact;
- C01 live L-1 status until it passes.

Update C01 live gate meaning to:

~~~text
Worker/Wasm/OPFS/write/COMMIT/close-reopen on authenticated Leumi
~~~

and explicitly remove real-origin Web Lock from the early blocker; C12 owns final real-origin ownership proof.

Create a pre-rewrite STATUS snapshot under docs/history before deleting old fields.

Do not point STATUS to C01 implementation until:
- new Master/C01..C12 exist;
- old plan is clearly superseded;
- current docs/decisions/guards are coherent;
- final planning verification is green.

---

# 19. GitHub Issue transition

Do not create new Issues until the current docs/decision rewrite and guards are in a coherent state.

Then materialize:

~~~text
1 new compact Master
+ C01..C12
~~~

Rules:
- C labels remain stable human identifiers;
- GitHub Issue numbers are assigned by creation and then backfilled into the execution map/Master;
- only direct dependencies from the corrected DAG are recorded;
- #29/#30 are evidence links for C01, not reopened children;
- no P1..P4 navigation Issues;
- no O1..O6 placeholder Issues.

After creation and verification:
- transfer pending L-1 ownership from old #31 to new C01 explicitly;
- only then retire old open Work Issues;
- retire old Epics #21..#28;
- retire old Master #20 last.

---

# 20. Safe materialization order

The rewrite should occur in controlled batches so the repository never has an ownerless current plan.

## R0 — Historical snapshot

- snapshot current STATUS;
- archive old A..W ROADMAP and 42-WP authority docs;
- create/update history index;
- no authority switch yet.

## R1 — Durable decision reconciliation

- create D-044;
- amend/supersede D-025..D-043 per section 4;
- update decisions.md;
- Fast CI.

## R2 — Product/current design reconciliation

- amend product shape;
- amend live SQL requirement;
- rewrite compact target architecture;
- rewrite ROADMAP to C01..C12;
- archive/supersede large stale mechanism docs;
- simplify docs/README current navigation;
- Fast CI.

## R3 — Testing/guard reconciliation

- update TESTING_POLICY Browser SQL section;
- update product-shape guard;
- add narrow current-plan guard;
- update any context/history guard deliberately;
- Fast CI.

At the end of R3, #72 remains the sole active planning owner and implementation is still blocked.

## R4 — Create new GitHub execution graph

- create compact Master;
- create C01..C12 from corrected Issue specifications;
- add only direct dependency links/references;
- link #29/#30 evidence to C01;
- add Master group headings rather than parent Issues.

## R5 — Backfill repository navigation

- rewrite browser-sql-github-execution-structure.md with actual new Issue numbers;
- add stable Issue links to compact DAG/ROADMAP where useful;
- rewrite AI_CONTEXT to compact current technical context;
- update docs navigation;
- Fast CI.

## R6 — Retire old GitHub graph

- comment old WPs with successor/conditional/future disposition;
- close old open WPs;
- close old Epics;
- close old Master #20 last;
- keep #29/#30 evidence closed;
- keep #65 duplicate closed.

## R7 — STATUS authority switch

- archive a final pre-switch STATUS snapshot;
- compact STATUS verification fields;
- point currentFocus/next to C01 only after all current docs/Issues agree;
- old #31 L-1 owner must already point to new C01 before closure.

## R8 — Final post-KISS planning freeze

- fresh-AI dry run from AGENTS→README→STATUS→AI_CONTEXT→C01;
- fresh-AI dry run on representative middle and final Issues;
- mechanical current-plan/decision/Issue consistency guard;
- Fast CI;
- full Browser CI only if runtime/browser/test code changed during materialization; docs/guards-only changes do not require it unless a browser test changed;
- rewrite browser-sql-final-planning-freeze.md as the new freeze artifact;
- close planning Issue #72 only after all checks pass.

---

# 21. Why the new Issues are created after R1-R3

Creating C01..C12 before decisions/product/testing authorities are reconciled would make each new Issue link into contradictory current docs.

R1-R3 deliberately establish:

~~~text
one current product meaning
+ one current architecture meaning
+ one current testing meaning
~~~

while #72 explicitly keeps implementation paused.

Only then do the executable Issues become trustworthy.

---

# 22. Why old Issues are retired after new Issues exist

Closing #31/#33..#71 first would temporarily leave real pending work without an executable owner.

Therefore:

~~~text
new owner exists
→ successor link written
→ old owner closes
~~~

This is especially important for the still-pending authenticated L-1 evidence currently owned by old #31.

---

# 23. Fresh-chat end state

After R8, a fresh implementation chat should normally read:

~~~text
AGENTS.md
→ workstream README.md
→ STATUS.json
→ AI_CONTEXT.md
→ active Cxx GitHub Issue
→ only directly linked specs/code/tests
~~~

It should not need:
- old ROADMAP A..W;
- old 42-WP decomposition;
- old final freeze;
- seven post-KISS audits;
- pre-KISS detailed scheduler/enrichment/lifecycle designs.

Those remain discoverable through docs/history only.

---

# 24. Reconciliation acceptance

This transition is ready for GitHub materialization only when:

- D-044/current decision chain is unambiguous;
- product docs no longer trace to old WP ranges;
- ROADMAP expresses C01..C12 order only;
- TESTING_POLICY no longer encodes old WP/Phase mechanisms;
- current docs navigation clearly separates current from history;
- guards protect the compact plan rather than the 42-WP graph;
- archived old plan remains discoverable;
- #72/STATUS still explicitly block implementation;
- no current authority claims both the 42-WP plan and C01..C12 are executable.

Next step: execute R0, the historical snapshot/archive boundary, before mutating durable decisions.