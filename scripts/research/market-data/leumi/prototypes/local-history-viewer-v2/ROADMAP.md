# Local History Viewer V2 — Roadmap

This file owns V2 plan/scope/order only. Live progress belongs in `STATUS.json`.

V2 intentionally starts from the frozen V1 implementation but is a new workstream. The old V1 numbered roadmap does not govern V2.

## Bootstrap — independent V2 baseline

Scope:

- exact copy of the complete V1 workstream as the starting point;
- preserve V1 unchanged beside V2;
- isolate V2 IndexedDB, BroadcastChannel, Viewer window/marker and runtime artifact names;
- create V2-specific Fast CI and Browser CI;
- verify the inherited baseline after isolation.

## Scope definition — define the new V2 product

Before changing behavior:

- capture the user's new V2 method and goals;
- identify which inherited V1 behaviors are retained, replaced or removed;
- define observable/public behavior before internal design;
- perform SPEC impact review;
- derive the implementation sequence from the new requirements rather than from the old V1 backlog.

## Implementation

Implementation stages are created only after V2 scope is known.

Preferred flow:

~~~text
behavior / public contract
→ tests
→ implementation
→ targeted verification
→ broader verification when required
→ STATUS.json
~~~

Keep V1 available as a frozen reference and regression baseline throughout V2 development.
