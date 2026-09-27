# Live SQL Query Execution — Product Requirement

Market Flow must support real, user-changeable SQL as a first-class analytical capability.

The current V2 boundary is **authenticated Leumi collection → loopback WebSocket → localhost Node.js → native DuckDB**, as fixed by D-045. Exact package/runtime identity is engineering metadata, not a user-facing product contract.

## Core behavior

~~~text
continuous committed market-data history
+
active SQL text
+
repeat interval X
→ repeated read-only SQL executions
→ 0..N result rows or an explicit query error
~~~

Changing the SQL should not normally require application/collector code changes.

For Local History Viewer V2 this is exposed through the separate Dynamic SQL Scanner alongside Current Universe and Security Detail/History.

## Query capability

The Scanner should support the analytical SQL needed by the product, including where relevant:

- SELECT;
- JOIN;
- WHERE;
- GROUP BY;
- HAVING;
- ORDER BY;
- LIMIT;
- window functions;
- historical/time-window predicates;
- cross-security comparison/ranking.

The exact query is intentionally not fixed.

## Runtime behavior

- activation is explicit;
- one active SQL/config is sufficient for initial V2;
- zero rows is success;
- query errors are visible and do not corrupt stored market data;
- query failure does not silently stop market-data ingestion;
- queries see committed coherent data;
- at most one Scanner execution runs at a time;
- if execution exceeds the configured interval, another execution does not overlap it and missed intervals do not burst later;
- result schema/order follows SQL;
- the UI adds no hidden analytical semantics.

Immutable query-version history, anchored scheduling, mandatory streaming and advanced cancellation/preemption are not product requirements. They may be added only if evidence shows a current need.

## Data requirement

The SQL authority preserves sufficiently rich raw historical market facts so future queries can use fields not anticipated when data was collected.

Derived/typed/persisted optimizations are optional:

~~~text
real query
→ measure
→ smallest useful optimization only if needed
~~~

They never replace preserved raw source facts.

## Architecture boundary

~~~text
authenticated Leumi browser
→ existing collector/validation
→ loopback WebSocket
→ one localhost Node.js service
→ native DuckDB
→ read-only Scanner execution
→ Scanner results
~~~

IndexedDB is not the target analytical query interface. D-045 owns this evidence-backed replacement of the failed Browser-SQL runtime boundary.

## Security

Provider authentication remains in the authenticated browser page.

Repository/runtime evidence must not contain cookies, session tokens, authorization headers, credentials, account numbers or private session data.

The SQL Worker needs validated market data and application/query commands, not copied provider secrets.

## Traceability

Product shape:
`docs/product/local-history-viewer-v2-product-shape.md`

Durable runtime/process boundary:
`docs/project/decisions/D-045.md`

Active implementation planning:
`.planning/TREE.yaml`
