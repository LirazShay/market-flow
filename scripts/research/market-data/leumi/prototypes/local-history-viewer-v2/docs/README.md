# Local History Viewer V2 — Design Docs

This directory contains stable design documents, not operational status.

## Read by question

| Need | File |
|---|---|
| IndexedDB LIVE analytics evaluation design / reuse / gaps | [indexeddb-live-analytics-evaluation.md](indexeddb-live-analytics-evaluation.md) |
| benchmark workloads, scales and measurement rules | [indexeddb-live-analytics-benchmark-plan.md](indexeddb-live-analytics-benchmark-plan.md) |
| evidence-to-architecture decision gates | [indexeddb-live-analytics-decision-framework.md](indexeddb-live-analytics-decision-framework.md) |
| inherited requirements baseline | [requirements.md](requirements.md) |
| inherited component architecture | [architecture.md](architecture.md) |
| inherited schema, stores, records and transaction boundaries | [data-model.md](data-model.md) |
| measured inherited IndexedDB growth evidence | [storage-growth-report.md](storage-growth-report.md) |
| viewer behavior / RTL / tables / states | [viewer-ux.md](viewer-ux.md) |
| inherited test cases/design | [test-plan.md](test-plan.md) |
| Clean Code / safe-change rules | [project engineering practices](../../../../../../../docs/project/engineering-practices.md) |

The inherited V1-era documents remain useful baseline evidence. New V2 decisions must not silently rewrite history; update or add V2 design/spec material deliberately when behavior changes.

## Product direction

Cross-cutting product requirements live at repository level:

~~~text
../../../../../../../docs/product/live-opportunity-discovery.md
~~~

This V2 directory maps only deliberately selected implementation/research responsibilities.

## Normative specifications

Durable behavioral contracts, invariants, failure semantics and reuse boundaries live in:

~~~text
../specs/README.md
~~~

Design docs explain rationale, alternatives and evidence. If design and spec appear inconsistent, perform a SPEC impact review and resolve the mismatch.

## What does not live here

Current progress:

~~~text
../STATUS.json
~~~

Stage order:

~~~text
../ROADMAP.md
~~~

Testing execution/checkpoint policy:

~~~text
../tests/TESTING_POLICY.md
~~~

Historical completed evidence:

~~~text
history/
~~~

## Ownership rule

Design/research rationale belongs here.

Implementation details/run instructions belong beside the code in recorder, storage and tests.
