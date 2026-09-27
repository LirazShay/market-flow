# Market Flow — V2 Browser SQL Planning Continuation Prompt

Continue the existing Market Flow repository:

~~~text
LirazShay/market-flow
branch: main
~~~

Default response language: Hebrew. Code/identifiers/technical terms may remain English.

## Critical boundary for this chat

This continuation is **planning/materialization only**.

Do **not** implement or modify product/runtime/browser code.

The goal is to finish the Browser SQL plan re-baseline/materialization completely through R8, leave GitHub as the single clear source of truth for future implementation, and only then close planning Issue #72.

Do not start C01 implementation in this chat.

Do not use the word `סיימתי` until the entire planned Browser SQL planning process is fully complete, including final consistency checks and verification.

---

## Startup — GitHub is source of truth

Fetch latest `main`, then read:

~~~text
AGENTS.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
~~~

Then read only the current planning sources needed for the exact STATUS pointer:

~~~text
docs/project/decisions/D-043.md
docs/project/decisions/D-044.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/ROADMAP.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-compact-execution-dag.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-compact-issue-specifications.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-pre-materialization-reconciliation-map.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/tests/TESTING_POLICY.md
~~~

Also inspect planning Issue #72 and the old Browser SQL Master/Issue graph only when needed for the R4-R8 transition.

If this prompt conflicts with current `main`, follow `main` and state the discrepancy.

---

## Current verified state at handoff

At the handoff boundary:

~~~text
R0 historical archive/snapshot       = complete
R1 durable-decision reconciliation  = complete
R2 current docs/product reconciliation = complete
R3 testing/guard reconciliation     = complete
R4 compact GitHub graph creation    = next
~~~

`STATUS.json` is the only live progress authority.

D-044 is the accepted post-KISS implementation baseline.

Fast CI for R3 is green.

Implementation remains intentionally paused.

---

## Current Browser SQL implementation plan

The mandatory executable graph is:

~~~text
C01  Real-origin DuckDB L-1
C02  Minimum SQL runtime + schema
C03  Atomic persistence + reopen/durability
C04  Recorder integration + trusted reads
C05  Current Universe SQL parity
C06  Detail/History SQL parity + bounded L-2
C07  Real analytical SQL + day-sized measurement
C08  Scanner core
C09  Scanner UI/results/integration
C10  Exclusive Web Lock ownership
C11  Representative daily mixed workload
C12  Final live verification + cutover/rollback/cleanup
~~~

GitHub materialization target:

~~~text
1 compact Master Issue
+ C01..C12 executable Issues
+ 0 navigation-only Epic/parent Issues
+ 0 placeholder conditional Issues
~~~

Completed old evidence:

~~~text
#29 = engine pin/manifest evidence
#30 = deterministic Browser SQL Worker/Wasm/OPFS/reopen probe
~~~

Reuse them by reference. Do not reopen/reimplement them.

---

## Important KISS/product rules

Preserve:

- existing authenticated V1 provider flow;
- MapHeat2 dynamic universe;
- sequential GetSecuritiesData;
- exact complete-cycle validation;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- full raw MapHeat + Security preservation;
- `null != 0 != "" != undefined`;
- successful cycle atomicity;
- Viewer rereads SQL authority; notifications are hints;
- Scanner read-only + no overlap;
- one stable exclusive Web Lock owner;
- no silent DB delete/reset.

Initial V2 does **not** require:

- fixed 8-horizon persisted schema;
- mandatory predecessor links;
- mandatory DealsDelta/MID persistence;
- immutable Scanner query-version history;
- anchored scheduler framework;
- advanced cancellation/preemption by default;
- mandatory streaming;
- archive/rollover platform;
- generalized DB/schema upgrade framework;
- permanent shadow/dual-write;
- automatic trading execution.

Conditional complexity is created only from evidence triggers.

---

## Remaining planning work — execute R4 through R8

### R4 — Create the compact GitHub execution graph

Create:

~~~text
1 new compact Browser SQL Master
+ C01..C12 executable Issues
~~~

Use the corrected exact Issue bodies from:

~~~text
docs/browser-sql-compact-issue-specifications.md
~~~

Rules:
- use C01..C12 as stable human IDs;
- GitHub Issue numbers are assigned normally;
- record only direct dependencies from the compact DAG;
- link #29/#30 as historical evidence for C01;
- no P1..P4 navigation Issues;
- no O1..O6 placeholder Issues;
- Master groups children only under headings:
  - Feasibility + SQL Core
  - V1 Product on SQL
  - Analytics + Scanner
  - Daily Readiness + Cutover
- Master must point to STATUS for live progress and must not duplicate current status.

After creation, verify every Issue body/title/dependency against the source specification before proceeding.

### R5 — Backfill current repository navigation/context

After actual Issue numbers exist:

- rewrite `docs/browser-sql-github-execution-structure.md` to the new Master + C01..C12;
- add stable GitHub Issue links/numbers to compact DAG/ROADMAP only where useful;
- rewrite `AI_CONTEXT.md` into compact current technical continuation context;
- update current docs navigation;
- keep old planning rationale COLD under `docs/history/`;
- Fast CI.

`AI_CONTEXT.md` must not duplicate live current/next/completion status.

### R6 — Retire the old GitHub graph safely

Only after the new graph is verified:

- transfer pending authenticated L-1 ownership from old #31 to new C01 explicitly;
- comment each old open WP with successor / conditional / future disposition;
- close old open WPs;
- keep #29/#30 closed as historical completed evidence;
- keep #65 closed duplicate;
- close old Epics #21..#28;
- close old Master #20 **last**.

Do not rewrite old Issue bodies into the new plan.

Do not temporarily leave live work ownerless.

### R7 — Switch STATUS authority to the new graph

Before changing live pointer:

- archive a final pre-switch STATUS snapshot;
- compact historical old-42-WP verification fields out of HOT STATUS;
- preserve current useful engine/probe/CI evidence compactly;
- update C01 live L-1 meaning so it proves authenticated-Leumi Worker/Wasm/OPFS/write/COMMIT/close-reopen;
- remove real-origin Web Lock from the early C01 blocker; final real-origin ownership proof belongs to C12;
- point `currentFocus` / `next` to new C01 only after docs, decisions, Issue graph and guards agree.

### R8 — Final post-KISS planning freeze

Before closing planning:

1. run a fresh-AI dry run:

~~~text
AGENTS
→ README
→ STATUS
→ AI_CONTEXT
→ C01
~~~

2. run another fresh-AI dry run on a representative middle Issue (for example C06/C08) and C12;
3. verify direct dependencies, current-doc authority, old-graph retirement, conditional triggers and fresh-chat context;
4. run mechanical current-plan/decision/Issue consistency guards;
5. run Fast CI;
6. run Browser CI only if runtime/browser/test code changed during materialization, or if an actual browser test changed;
7. rewrite `browser-sql-final-planning-freeze.md` as the **new** post-KISS freeze artifact;
8. update STATUS to the implementation entry point;
9. close Issue #72 only when all planning verification is green.

At that point the next chat may implement C01.

---

## Old planning/history discipline

Old 42-WP material is historical evidence, not current instruction.

Keep it discoverable under:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/history/
~~~

Do not delete historical evidence.

Do not leave old current-path docs claiming the 42-WP graph is still canonical.

Current implementation authority must be unambiguous.

---

## Verification policy during R4-R8

These are planning/docs/GitHub-structure changes.

- run Fast CI after coherent reconciliation/materialization batches;
- Browser CI is not automatically required for docs/GitHub-only changes;
- if a browser/Playwright test is changed, run it in Chromium after the final edit;
- never weaken guards simply to make the rewrite pass;
- keep public-contract/data-integrity/security invariants intact.

---

## End-of-work reporting

After each continuation unit, report briefly:
- what changed;
- files/Issues changed;
- tests/guards changed;
- Fast CI result;
- Browser CI result if relevant;
- pending work;
- exact next pointer from STATUS.json.

When I say `תמשיך לשלב הבא`, advance the next sensible coherent unit according to STATUS and the R4-R8 order. Do not assume one message equals one full R-stage.

Do not start product/runtime implementation until the planning stage is fully frozen and #72 is closed.