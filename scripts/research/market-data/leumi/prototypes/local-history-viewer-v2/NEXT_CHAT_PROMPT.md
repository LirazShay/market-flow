# Market Flow — Browser SQL V2 Final Planning Handoff

Continue the existing repository:

~~~text
LirazShay/market-flow
branch: main
~~~

Default response language: Hebrew. Code/identifiers/technical terms may remain English.

## Critical boundary

This next chat is **still planning-only**.

Do **not** implement C01 or modify product/runtime/browser behavior.

Your job is to finish the Browser SQL planning process completely, including the final critique/review stages, guards/CI and post-KISS planning freeze. Only after that may you prepare a separate implementation handoff for a new chat.

Do not use the completion word requested by the user until the entire planning process is actually complete and verified.

## Startup — GitHub is source of truth

Fetch latest `main`, then read in this order:

~~~text
AGENTS.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
GitHub Issue #72
~~~

Then read the current planning authority:

~~~text
docs/project/decisions/D-043.md
docs/project/decisions/D-044.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/ROADMAP.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-github-execution-structure.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-compact-execution-dag.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-compact-issue-specifications.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/tests/TESTING_POLICY.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/tests/unit/browser-sql-current-plan.test.js
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-final-planning-freeze.md
~~~

Inspect GitHub Master #85 and C01-C12 #73-#84 directly.

Do not preload old 42-WP planning except when checking that it is correctly historical/retired.

If this prompt conflicts with current GitHub main, follow main and state the discrepancy.

## Current state

Already complete:

~~~text
R0 historical archive/snapshot
R1 durable-decision reconciliation
R2 current docs/product reconciliation
R3 testing-policy/current-plan guard reconciliation
R4 compact GitHub graph materialization
R5 current docs/navigation backfill
R6 retirement of old #20-#71 execution graph
~~~

Materialized graph:

~~~text
Master #85

C01 #73  Real-origin DuckDB L-1
C02 #74  Minimum SQL runtime + schema
C03 #75  Atomic persistence + reopen/durability
C04 #76  Recorder integration + trusted reads
C05 #77  Current Universe SQL parity
C06 #78  Detail/History SQL parity + bounded L-2
C07 #79  Real analytical SQL + day-sized measurement
C08 #80  Scanner core
C09 #81  Scanner UI/results/integration
C10 #82 Exclusive Web Lock ownership
C11 #83 Representative daily mixed workload
C12 #84 Final live verification + cutover/rollback/cleanup
~~~

Old Master #20, Epics #21-#28 and superseded old WPs are closed. #29/#30 remain completed reusable evidence. #65 remains the closed duplicate.

**Planning is not frozen yet. Do not start C01.**

## Remaining work — finish planning completely

### 1. Final adversarial planning critique

Review the whole compact plan as if trying to break it.

At minimum check:

- each C01-C12 Issue has one clear owner/outcome;
- Issue size is neither artificially tiny nor dangerously broad;
- direct dependencies are necessary and only direct;
- no transitive blocker is duplicated;
- Current and Detail split is still justified;
- C07 and C08/C09 parallelism is valid;
- C10 Web Lock parallelism from C02 is valid;
- C11 convergence dependencies are exactly right;
- C12 is a bounded release operation, not a hidden migration platform;
- O1-O6 are truly conditional and no missing standing work exists;
- no old mechanism accidentally survived as mandatory through stale wording;
- no important data-integrity/security requirement was lost during KISS simplification.

If the critique finds a real defect, fix the plan before proceeding.

### 2. Fresh-AI dry runs

Simulate a fresh implementation chat using only the intended HOT path.

Run at least three dry runs:

~~~text
AGENTS
→ README
→ STATUS
→ AI_CONTEXT
→ active Issue
→ only directly touched current code/tests/specs
~~~

Use:
- C01/#73;
- one representative middle Issue, preferably C06/#78 or C08/#80;
- C12/#84.

For each dry run verify the fresh AI can answer without reading old planning:
- what exactly to build;
- what not to build;
- direct dependencies;
- public acceptance criteria;
- required tests/CI/live evidence;
- security/data-integrity constraints;
- what completion means;
- where STATUS must move next.

Record/fix any ambiguity.

### 3. Current-plan consistency audit

Verify all current authority surfaces agree:

- D-043;
- D-044;
- ROADMAP;
- AI_CONTEXT;
- product shape;
- live SQL product doc;
- TESTING_POLICY;
- current GitHub execution map;
- Master #85;
- C01-C12 Issue bodies;
- conditional O1-O6 ownership/triggers;
- L-1 runbook;
- STATUS live planning pointer.

Verify old 42-WP docs are clearly historical/superseded and do not look concurrently canonical.

### 4. Mechanical guards

Update/repair narrow guards so they protect the new materialized plan, including at least:

- D-044 is current and D-037/D-042 are superseded;
- ROADMAP contains Master #85 and C01-C12 #73-#84;
- current execution map contains the exact materialized numbers/direct dependencies;
- no current docs claim the old 42-WP graph is active;
- old freeze is historical until replaced;
- testing policy uses C01/C06/C12 semantics;
- early C01 does not include real-origin Web Locks;
- conditional work is not represented as standing Issues.

Do not build a generic planning framework; guard only concrete drift risks.

### 5. Verification

Run Fast CI after final corrections.

Browser CI is required only if a runtime/browser/Playwright test or behavior changed during this finalization. Docs/GitHub/Node-guard-only changes do not require it.

If CI fails:
- inspect logs;
- fix the actual inconsistency;
- rerun;
- do not freeze until green.

### 6. New post-KISS planning freeze

Only after the critique, dry runs, consistency audit and required CI are green:

Rewrite:

~~~text
docs/browser-sql-final-planning-freeze.md
~~~

as the **new** freeze authority.

It should record, without duplicating live status:
- D-043/D-044 authority;
- Master #85 + C01-C12 #73-#84;
- old graph retirement;
- final guard/CI evidence;
- fresh-AI dry-run result;
- conditional/future scope policy;
- implementation entry contract.

Do not revive the old Phase-W freeze as current.

### 7. Close planning and prepare a separate implementation handoff

Only after the new freeze is green:

- update STATUS.json from planning to implementation entry C01/#73;
- set C01 to verification-pending as appropriate;
- close planning Issue #72;
- replace NEXT_CHAT_PROMPT.md with a **new implementation-chat prompt** for a separate chat;
- the implementation prompt must start from C01/#73 and must not ask the implementation chat to finish planning.

Then, and only then, planning is complete.

## Invariants to preserve during final planning review

- existing authenticated V1 provider flow;
- MapHeat2 dynamic universe;
- sequential GetSecuritiesData;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- exact complete-cycle validation;
- full raw MapHeat + Security preservation;
- `null != 0 != "" != undefined`;
- atomic successful-cycle persistence;
- Viewer rereads SQL authority;
- Scanner read-only/no overlap;
- one exclusive Web Lock owner;
- no silent DB deletion/reset;
- no credentials/session/account data in repo/evidence.

## KISS rules

Do not reintroduce by default:

- fixed 8-horizon persisted schema;
- mandatory predecessor links;
- mandatory DealsDelta/MID persistence;
- immutable Scanner query history;
- anchored scheduler framework;
- mandatory streaming;
- advanced preemption/cancellation;
- archive/rollover platform;
- generalized upgrade/migration platform;
- permanent shadow/dual-write;
- automatic trading/order execution.

Conditional complexity exists only when the documented trigger proves it is needed.

## Final reporting

At the end of the planning-finalization chat, report:

- final critique findings and fixes;
- docs/decisions/Issues changed;
- dry-run results;
- guards/tests changed;
- Fast CI result;
- Browser CI result or why not required;
- freeze artifact;
- #72 closure;
- exact implementation entry pointer;
- path/content purpose of the new implementation NEXT_CHAT_PROMPT.

Do not start C01 implementation in the planning-finalization chat.
