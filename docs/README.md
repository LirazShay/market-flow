# Documentation

The repository has two durable documentation domains.

## [project/](project/README.md)

Cross-project material:

- current state.
- system scope.
- repository structure.
- workstream map.
- durable decisions.
- AI engineering guidance.

## [leumi-api/](leumi-api/README.md)

Durable Leumi market-data research knowledge:

- endpoint behavior.
- API flow.
- field semantics/availability.
- sanitized samples.

## Active implementation docs

The active prototype keeps its design docs beside the prototype:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/docs/
~~~

Start from its [README](../scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/README.md).

Rule:

~~~text
cross-project/domain knowledge → /docs
component-specific design     → beside the component
operational status            → component STATUS.json
~~~

