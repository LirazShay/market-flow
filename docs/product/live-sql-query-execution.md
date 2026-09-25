# Live SQL Query Execution — Product Requirement

Market Flow's live opportunity discovery must support a real, user-changeable SQL query as a first-class product capability.

This is a product-level requirement. It does not select the final database engine or process architecture.

## Core behavior

The user must be able to define SQL and have Market Flow execute it automatically every configured X seconds against coherently committed market data.

Conceptually:

~~~text
continuous market-data ingest
+
active SQL text
+
repeat interval X seconds
→ repeated SQL executions
→ 0..N result rows
~~~

Changing the SQL should not normally require changing application code.

## Query capability

The selected engine should support the SQL constructs needed for live analytical exploration, including where relevant:

- SELECT;
- JOIN;
- WHERE;
- GROUP BY;
- HAVING;
- ORDER BY;
- LIMIT;
- window functions;
- historical/time-window conditions;
- cross-security comparison/ranking.

The exact query is intentionally not a product contract. It will evolve frequently.

## Runtime behavior

- zero result rows is valid;
- a query error is observable and must not corrupt stored market data;
- query failure must not silently stop market-data ingestion;
- execution duration and result row count should be observable;
- the system must define deterministic behavior when a query takes longer than its configured repeat interval;
- queries operate only on committed coherent data.

## Data requirement

The analytical store must preserve sufficiently rich raw historical market data so future SQL can use fields that were not anticipated when the data was collected.

Derived columns/views may be added for repeated high-value computations, but they must not replace the raw source facts.

## Architecture implication

A SQL-capable engine is required for the analytical layer.

IndexedDB by itself is not the target analytical query interface.

The final engine/process choice remains an engineering decision and may be browser-embedded or local/native if it satisfies the product requirement.

## Security

Authenticated provider collection should remain in the browser unless a separate future requirement changes that boundary.

A local analytical service does not need browser cookies, session tokens or authorization headers merely to receive validated market-data snapshots.
