# Local History Viewer V2 — Specs

The files in this directory are the durable observable contracts inherited from the frozen V1 baseline at V2 creation time.

They are **baseline contracts, not immutable V1 constraints**. When V2 intentionally changes behavior:

~~~text
requirement
→ identify affected spec(s)
→ update/add/remove the V2 contract in the same coherent batch
→ tests
→ implementation
→ verification
~~~

Do not edit the sibling V1 specs to express V2 behavior.

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

Exact live progress belongs only in `../STATUS.json`.
