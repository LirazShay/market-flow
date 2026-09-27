# Local History Viewer V2 — Specs

The files in this directory are durable observable contracts inherited from the frozen V1 baseline at V2 creation time.

They describe the currently implemented V2 baseline behavior; they do not by themselves claim the Node-SQL target is already implemented.

Current target ownership:

~~~text
../STATUS.json
../../../../../../../docs/project/decisions/D-043.md
../../../../../../../docs/project/decisions/D-045.md
../docs/node-sql-migration-inventory.md
../../../../../../../docs/product/local-history-viewer-v2-product-shape.md
~~~

The former Browser-SQL target/compact graph under D-044 is historical for current V2.

As Node-SQL work changes observable behavior:

~~~text
requirement
→ identify affected spec(s)
→ update/add/remove the V2 contract in the same coherent batch
→ tests
→ implementation
→ verification
~~~

Do not edit sibling V1 specs to express V2 behavior.

Current spec files:

- `system.spec.md`
- `provider-data-contract.spec.md`
- `recorder.spec.md`
- `persistence.spec.md`
- `messaging.spec.md`
- `viewer.spec.md`
- `runtime-delivery.spec.md`
- `debug-bundle.spec.md`
- `research-evolution.spec.md`

Stage 03/100 classifies `provider-data-contract.spec.md` and still-valid public Recorder/Viewer behavior as KEEP, while system/persistence/messaging/viewer/runtime-delivery ownership must be ADAPTED to the Node.js localhost boundary.

Exact live progress belongs only in `../STATUS.json`.
