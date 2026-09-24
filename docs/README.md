# Documentation

The repository has four durable documentation domains.

## [project/](project/README.md)

Cross-project material: scope, structure, workstream routing, durable decisions and AI engineering guidance.

## [product/](product/README.md)

Product-level vision, capabilities, broad requirements and early cross-cutting specifications that may affect several workstreams.

## [leumi-api/](leumi-api/README.md)

Durable Leumi market-data research: endpoint behavior, API flow, field semantics/availability and sanitized samples.

## [analysis/](analysis/README.md)

Cross-cutting market-analysis research and design, including momentum ranking, feature semantics, scoring architecture and validation plans.

Rule:

~~~text
product vision / cross-workstream requirements → /docs/product
cross-project/domain knowledge                → /docs
component-specific design                     → beside the component
operational status                            → workstream STATUS.json
~~~
