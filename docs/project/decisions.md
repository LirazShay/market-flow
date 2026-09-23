# Decision Index — Market Flow

This is the **compact decision index**.

Normal AI work should scan this file, identify only the decisions relevant to the current task, and open those specific files under `docs/project/decisions/`.

Do not read all detailed decisions by default.

## Read flow

~~~text
decisions.md
→ identify relevant IDs/tags
→ read only those D-NNN.md files
~~~

| ID | Decision | Status | Relevance tags |
|---|---|---|---|
| [D-001](decisions/D-001.md) | Evidence before architecture | Accepted | architecture, evidence |
| [D-002](decisions/D-002.md) | Repository is the project memory | Accepted | repository, project-memory |
| [D-003](decisions/D-003.md) | Adaptive work batches + natural continuation boundaries | Accepted / evolved | workflow, delivery, chat-handoff |
| [D-004](decisions/D-004.md) | MapHeat2 role | Accepted based on observed behavior | leumi-api, mapheat2 |
| [D-005](decisions/D-005.md) | GetSecuritiesData role | Accepted based on observed behavior | leumi-api, securities-data |
| [D-006](decisions/D-006.md) | Join key | Verified | data, join |
| [D-007](decisions/D-007.md) | Do not hardcode 561 | Accepted | universe, data-integrity |
| [D-008](decisions/D-008.md) | Conservative GetSecuritiesData batching | Accepted for current research flow | leumi-api, batching |
| [D-009](decisions/D-009.md) | Sequential batching is the proven baseline | Accepted until measured otherwise | polling, batching |
| [D-010](decisions/D-010.md) | null != 0 | Accepted / required | data-model, null-semantics |
| [D-011](decisions/D-011.md) | Level 1 is nullable | Verified | market-data, order-book |
| [D-012](decisions/D-012.md) | Do not use order-book levels 2–5 from GetSecuritiesData | Verified for tested Equity snapshot | market-data, order-book |
| [D-013](decisions/D-013.md) | Dynamic values from both endpoints are not atomic | Verified | market-data, timing |
| [D-014](decisions/D-014.md) | Prefer GetSecuritiesData for live/dynamic values | Accepted recommendation | market-data, source-selection |
| [D-015](decisions/D-015.md) | Preserve raw payloads when production collection is designed | Accepted design requirement | data-model, raw-payload |
| [D-016](decisions/D-016.md) | No final technology stack yet | Open / intentionally undecided | architecture, technology-stack |
| [D-017](decisions/D-017.md) | Separate research, production code and production tests | Accepted | repository-structure, testing |
| [D-018](decisions/D-018.md) | Documentation follows code ownership | Accepted | documentation, repository-structure |
| [D-019](decisions/D-019.md) | Local History Viewer V1 is a browser-only prototype | Accepted for V1 planning | local-history-viewer-v1, architecture |
| [D-020](decisions/D-020.md) | Tests-first pyramid: fast unit default, sparse browser checkpoints | Accepted / evolved | testing, ci, playwright |
| [D-021](decisions/D-021.md) | KISS: simplest sufficient design, complexity only when proven necessary | Accepted | architecture, simplicity, kiss, yagni |
| [D-022](decisions/D-022.md) | Failure-to-learning loop and continuous improvement | Accepted | quality, learning, rca, process, testing |

## Fast lookup

~~~text
Leumi batching/polling
→ D-008, D-009

Data identity/null/raw preservation
→ D-006, D-007, D-010, D-015

Repository/docs/workflow
→ D-002, D-003, D-017, D-018

Architecture / complexity / KISS
→ D-001, D-021

Failures / RCA / continuous improvement
→ D-022

Local History Viewer V1
→ D-019, D-020
~~~

## Adding a durable decision

1. create the next `docs/project/decisions/D-NNN.md`;
2. add one row to this index;
3. update wider project state only if the decision changes it.

The individual decision files are the detailed durable source.
