# Local History Viewer V2 — Specs

The files in this directory are the durable observable contracts inherited from the frozen V1 baseline at V2 creation time.

They describe the **currently implemented V2 baseline behavior**, not the future Browser SQL target.

Browser SQL is currently a planning/implementation target governed by:

~~~text
../ROADMAP.md
../STATUS.json
../../../../../../../docs/project/decisions/D-025.md
../../../../../../../docs/project/decisions/D-043.md
../../../../../../../docs/product/local-history-viewer-v2-product-shape.md
~~~

D-043 is target behavior, not a claim that the inherited V1-backed specs already implement the three-surface SQL design. As WP-23..WP-29 change observable behavior, the affected V2 specs must be evolved in the same implementation batch.

When V2 intentionally changes runtime behavior:

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

Some bodies still contain inherited V1-era wording/identifiers. Where such text conflicts with verified V2 runtime identity, treat it as baseline documentation debt identified by the Browser SQL current-state audit, not as authority over current code. Correct these surfaces before they are reused as Browser SQL normative contracts.

Exact live progress belongs only in `../STATUS.json`.
