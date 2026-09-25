# Live SQL Query Execution — Product Requirement

Market Flow's live opportunity discovery must support a real, user-changeable SQL query as a first-class product capability.

This is a product-level requirement. It fixes the current process boundary as **Browser-only SQL**, while leaving the concrete browser SQL engine and physical design to engineering research/planning.

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

Derived columns/views may be added for repeated high-value computations, but they must not replace raw source facts.

## Architecture implication

A SQL-capable engine is required for the analytical layer.

IndexedDB by itself is not the target analytical query interface.

For the current V2 planning cycle, the required boundary is:

~~~text
authenticated browser
→ collector
→ Browser SQL engine
→ persistent browser SQL database
→ scheduled SQL
→ results
~~~

The concrete Browser SQL engine remains an engineering decision until current capabilities are researched and the design is completed.

localhost / Node / .NET / native database services are not active alternatives in this planning cycle. Reopening that boundary requires a future explicit architecture decision based on evidence that Browser SQL cannot meet a required capability.

## Security

Authenticated provider collection remains in the browser.

Repository artifacts must not contain cookies, session tokens, authorization headers, credentials, account numbers or private session data.

Browser SQL planning must preserve that boundary rather than creating a second authentication path.
