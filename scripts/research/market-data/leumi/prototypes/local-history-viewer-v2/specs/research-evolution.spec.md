# MF-LHV-EVOL-001 — Research Evolution and Reuse Specification

## Purpose

Local History Viewer V1 is an **initial research tool and architectural probe**, not the final form of Market Flow.

This spec preserves what the tool is teaching us so later work can:

- improve the same tool;
- extract reusable capabilities;
- build new tools from the same concepts;
- replace prototype-only implementation choices without losing proven behavior;
- avoid rediscovering rationale from code or chat history.

Operational progress is tracked only in `../STATUS.json`.

## Scope

This spec defines:

- what knowledge is meant to survive beyond this prototype;
- what should be reused as a concept;
- what is prototype-specific and replaceable;
- how future tools should consume this work;
- how specs should evolve when the architecture grows.

It does not prescribe the final production architecture.

## Contract

The prototype must leave behind reusable knowledge in four categories:

### 1. Domain/data knowledge

Examples:

- provider universe discovery;
- identity join boundary;
- field/evidence semantics;
- response integrity conditions;
- timing/snapshot limitations.

Durable provider findings belong under repository-level `docs/leumi-api/`.

### 2. Behavioral contracts

Examples:

- complete-cycle definition;
- no-overlap recorder behavior;
- atomic successful persistence;
- viewer source-of-truth behavior;
- messaging semantics;
- restart/recovery expectations.

These belong in `specs/`.

### 3. Reusable engineering patterns

Examples:

- pure deterministic core + thin browser adapters;
- tests at cheapest valid layer;
- atomic browser persistence;
- generated self-contained runtime;
- metadata invalidation + DB reread;
- Verified/Inferred/Unknown evidence boundaries.

### 4. Prototype-only choices

Examples that may be replaced later:

- plain JavaScript/no framework;
- same-origin child window;
- IndexedDB specifically;
- Bookmarklet packaging;
- sequential chunking;
- browser-only deployment;
- current UI layout.

A prototype-only choice must not accidentally become a permanent architectural constraint merely because it exists in code.

## Invariants

1. Research results worth reusing are documented outside transient chat history.
2. Durable behavior is represented in specs rather than inferred solely from implementation.
3. Provider evidence is separated from tool-specific implementation docs.
4. Prototype-only constraints are labeled as such where material.
5. New tools should reuse contracts/patterns intentionally, not copy entire code trees blindly.
6. A replacement implementation must preserve or explicitly revise important integrity/failure contracts.
7. Verified/Inferred/Unknown boundaries survive into future research.
8. Specs remain status-free and are maintained alongside system changes.
9. Shared concepts should move upward into repository-wide specs/docs when more than one workstream truly owns them.
10. Premature generalization is avoided; extraction follows demonstrated reuse.

## Failure semantics

Research knowledge is considered at risk when:

- behavior changes but specs remain stale;
- API evidence is mixed with guessed semantics;
- reusable patterns exist only in code;
- a future tool forks behavior without declaring intentional differences;
- prototype implementation choices are treated as immutable requirements;
- multiple workstreams duplicate a concept with divergent undocumented semantics.

When drift is found:

~~~text
identify authoritative intent/evidence
→ update/reconcile specs
→ add characterization tests if needed
→ only then build further on the concept
~~~

## Extension and reuse

### Improve this tool

When adding capabilities such as filtering, derived metrics, charts, retention, export/import, workers, or richer history queries:

1. identify affected specs;
2. define new durable behavior;
3. preserve integrity/source-of-truth boundaries unless intentionally revised;
4. add tests;
5. update specs in the same batch.

### Build a sibling research tool

Prefer extracting concepts such as:

~~~text
provider adapter
collector/cycle contract
persistence contract
viewer/query model
runtime packaging
~~~

rather than copying the entire Local History Viewer implementation.

If two tools genuinely share a contract, consider promoting that contract to a repository-level spec/module.

### Move toward production

Productionization requires explicit decisions for:

- provider access model;
- authentication/session ownership;
- server vs browser responsibility;
- storage technology;
- retention/capacity;
- concurrency/backpressure;
- observability;
- security/privacy;
- deployment/versioning;
- operational recovery.

The research prototype does not answer those automatically.

## Verification mapping

Evidence that a reusable concept is actually implemented comes from:

- component unit tests;
- browser integration tests;
- integrated E2E;
- live provider verification where required;
- durable API research documents.

A concept should not be promoted to a repository-wide shared abstraction based only on one speculative future use.

## Change triggers

Review this spec whenever:

- a new major research capability is added;
- a new sibling tool is planned;
- a component is extracted/shared;
- a prototype-only choice becomes a durable requirement;
- architecture moves beyond browser-only;
- a V2/production direction is defined;
- provider evidence is generalized across tools;
- specs are promoted from workstream-local to repository-wide ownership.

## References

- `system.spec.md`
- `provider-data-contract.spec.md`
- `recorder.spec.md`
- `persistence.spec.md`
- `messaging.spec.md`
- `viewer.spec.md`
- `runtime-delivery.spec.md`
- `../docs/`
- `../../../../../../../docs/project/specification-policy.md`
- `../../../../../../../docs/leumi-api/`
