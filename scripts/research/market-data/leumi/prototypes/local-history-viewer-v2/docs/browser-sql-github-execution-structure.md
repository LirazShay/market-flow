# Browser SQL — GitHub Execution Structure

Phase Q materializes the Browser SQL implementation decomposition into the repository's real GitHub Issue system.

Live implementation status still belongs only in:

~~~text
../STATUS.json
~~~

This document is durable navigation from planning artifacts to the GitHub execution graph.

## Master program

~~~text
#20 — [Browser SQL] Implementation master plan
~~~

URL:

~~~text
https://github.com/LirazShay/market-flow/issues/20
~~~

The Master Issue rolls up the eight execution Epics and critical gates.

## Epic hierarchy

| Epic | Issue | Scope |
|---|---:|---|
| M1 | #21 | Feasibility and test foundation |
| M2 | #22 | SQL authority, OPFS and ingest |
| M3 | #23 | Analytical SQL runtime |
| M4 | #24 | Runtime delivery and Viewer |
| M5 | #25 | Health, diagnostics and security |
| M6 | #26 | Shadow migration verification |
| M7 | #27 | Performance and capacity evidence |
| M8 | #28 | Production cutover and cleanup |

Each Epic contains a GitHub checklist of its executable Work Issues.

## Executable work issues

| WP | Issue | Epic |
|---|---:|---|
| WP-01 | #29 | M1 |
| WP-02 | #30 | M1 |
| WP-03 | #31 | M1 |
| WP-04 | #32 | M1 |
| WP-05 | #33 | M2 |
| WP-06 | #34 | M2 |
| WP-07 | #35 | M2 |
| WP-08 | #36 | M2 |
| WP-09 | #37 | M2 |
| WP-10 | #38 | M2 |
| WP-11 | #39 | M2 |
| WP-12 | #40 | M2 |
| WP-13 | #41 | M2 |
| WP-14 | #42 | M2 |
| WP-15 | #43 | M3 |
| WP-16 | #44 | M3 |
| WP-17 | #45 | M3 |
| WP-18 | #46 | M3 |
| WP-19 | #47 | M3 |
| WP-20 | #48 | M3 |
| WP-21 | #49 | M4 |
| WP-22 | #50 | M4 |
| WP-23 | #51 | M4 |
| WP-24 | #52 | M4 |
| WP-25 | #53 | M4 |
| WP-26 | #54 | M4 |
| WP-27 | #55 | M4 |
| WP-28 | #56 | M4 |
| WP-29 | #57 | M4 |
| WP-30 | #58 | M5 |
| WP-31 | #59 | M5 |
| WP-32 | #60 | M6 |
| WP-33 | #61 | M6 |
| WP-34 | #62 | M7 |
| WP-35 | #63 | M7 |
| WP-36 | #64 | M8 |
| WP-37 | #66 | M8 |
| WP-38 | #67 | M8 |
| WP-39 | #68 | M8 |
| WP-40 | #69 | M3 |
| WP-41 | #70 | M4 |

Issue #65 is closed as a duplicate of canonical WP-37 Issue #66 after a connector batch persisted the Issue before returning its result.

## Dependency representation

Every Work Issue contains explicit GitHub blocker references:

~~~text
## Dependencies / blockers

- [ ] #<issue> — WP-xx
~~~

The Issue body also contains:

- source planning contracts;
- scope;
- explicit non-goals;
- implementation sequence;
- acceptance criteria;
- required verification layer;
- security/data-integrity requirements;
- SPEC/docs impact;
- cleanup;
- definition of done.

The Master and Epic checklists are navigation/roll-up only. They do not replace STATUS.json as live operational state.

## Critical gates

~~~text
#31  WP-03  real authenticated-Leumi feasibility gate
#42  WP-14  SQL authority checkpoint
#69  WP-40  analytical cancellation/resource-isolation gate
#48  WP-20  analytical SQL checkpoint
#70  WP-41  cross-tab runtime ownership gate
#57  WP-29  integrated runtime/Viewer checkpoint
#61  WP-33  shadow/live correctness checkpoint
#63  WP-35  Windows/Chrome performance gate
#68  WP-39  storage lifecycle / archive / rollover gate
#64  WP-36  production authority switch
#66  WP-37  rollback/roll-forward + live endurance
#67  WP-38  migration scaffolding removal/final closure
~~~

WP-03 must pass before heavy SQL-authority implementation beginning at WP-05.

## GitHub API capability used

The connected GitHub tool surface available during Phase Q supports:

- Issue creation;
- Issue updates;
- Issue state/reason;
- direct Issue references;
- Markdown task checklists.

It does not expose repository mutations for:

- creating Milestones;
- creating repository Labels;
- native GitHub sub-issue/parent relationships.

Therefore Phase Q uses the strongest executable structure available through the connected API:

~~~text
Master Issue
→ Epic Issues
→ linked Work Issues
→ direct blocker references
→ task checklists
~~~

No manual milestone/label requirement blocks implementation.

## Verification result

Phase-Q structural verification established:

~~~text
open Browser SQL Issues = 50
Master                    = 1
Epics                     = 8
unique executable WPs     = 41
missing WP IDs            = 0
duplicate open WP IDs     = 0
placeholder Epic links    = 0
undefined parent links    = 0
~~~

The issue-number mapping above is now the durable execution navigation layer.


## Final audit

Phase R audits the complete requirements/decision/Issue coverage and implementation handoff:

~~~text
docs/browser-sql-final-plan-audit.md
~~~


## Phase-S extension

The post-Phase-R assurance review added canonical WP-39 / Issue #68 under M8. WP-39 depends on WP-35 and is an additional blocker of WP-36 production cutover. It closes storage retention/archive/rollover lifecycle before implementation handoff.


## Phase-T extension

Phase T adds WP-40 / Issue #69 under M3 for analytical cancellation/resource isolation. WP-20 / #48 and M3 closure depend on it.


## Phase-U extension

Phase U adds WP-41 / Issue #70 under M4 for cross-tab runtime ownership with Web Locks. WP-22 / #50 production Runtime Controller orchestration depends on it.


## Phase-V extension

Phase V adds WP-42 under M8 for engine/schema/release upgrade compatibility and rollback. Its canonical GitHub Issue is linked after creation; WP-36 production cutover must depend on it.
