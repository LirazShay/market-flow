# Local History Viewer V2 — Design Docs

This directory contains durable V2 design/evidence. It does **not** own live progress; use `../STATUS.json`.

## Current Node-SQL authorities

| Need | Authority |
|---|---|
| product/provider continuity + three surfaces | [product shape](../../../../../../../docs/product/local-history-viewer-v2-product-shape.md) + [D-043](../../../../../../../docs/project/decisions/D-043.md) |
| current runtime/process boundary | [D-045](../../../../../../../docs/project/decisions/D-045.md) |
| live user SQL product behavior | [live SQL requirement](../../../../../../../docs/product/live-sql-query-execution.md) |
| Browser-SQL → Node-SQL disposition | [node-sql-migration-inventory.md](node-sql-migration-inventory.md) |
| testing policy | [../tests/TESTING_POLICY.md](../tests/TESTING_POLICY.md) |
| live planning pointer | [../STATUS.json](../STATUS.json) |

## Browser-SQL history/reference

The former Browser-SQL C01-C12 plan and all top-level `browser-sql-*.md` files are reference/evidence only under D-045.

The previous compact baseline is preserved in [D-044](../../../../../../../docs/project/decisions/D-044.md), which is superseded for current V2.

Pre-KISS Browser-SQL history remains under:

~~~text
history/README.md
~~~

Do not treat an old Browser-SQL manual, DAG, Issue map or freeze document as executable guidance.

## Source-of-truth reminder

~~~text
STATUS.json = live progress/current/verification
D-043       = provider/data/product continuity
D-045       = current Node.js localhost authority boundary
inventory   = keep/adapt/archive/retire migration disposition
docs/history = cold historical evidence
~~~
