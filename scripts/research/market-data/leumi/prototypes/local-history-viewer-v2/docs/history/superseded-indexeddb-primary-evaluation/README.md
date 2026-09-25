# Superseded IndexedDB-Primary Evaluation

Status: superseded by the SQL-first product direction.

The files in this directory preserve the evaluation plan created when V2 was still considering IndexedDB + JavaScript as the primary analytical foundation.

That assumption was later replaced by a stronger product requirement:

~~~text
user-defined real SQL
→ execute automatically every X seconds
→ return live result rows
~~~

The archived material remains useful for IndexedDB performance/background reasoning, but it must not be treated as the active roadmap or architecture direction.

Active planning is owned by:

~~~text
../../../ROADMAP.md
../../../STATUS.json
../../sql-live-analytics-design.md
../../sql-live-engine-benchmark-plan.md
~~~
