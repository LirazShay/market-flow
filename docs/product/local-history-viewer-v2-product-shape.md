# Local History Viewer V2 — Product Continuity and Three Viewer Surfaces

## Role

This is the product requirement for the V2 user-facing shape.

It contains no live progress. Operational current/next state belongs only in the V2 `STATUS.json`.

V2 is an evolution of the proven Local History Viewer V1 behavior, not a new market-data product invented from scratch.

## 1. Provider/data collection continuity

The Browser SQL migration does **not** create a product requirement to change the Leumi collection contract that already works in V1.

The preserved collection behavior is:

~~~text
authenticated Leumi page
→ MapHeat2 dynamic universe
→ sequential GetSecuritiesData chunks
→ exact completeness validation
→ one validated complete cycle
~~~

The following remain part of the V2 contract unless separate evidence explicitly requires a later provider change:

- the existing authenticated page-context collection model;
- MapHeat2 dynamic-universe discovery;
- the proven GetSecuritiesData request/chunking flow;
- canonical security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- exact requested/received/unique/missing/unexpected validation;
- full raw MapHeat record preservation;
- full raw GetSecuritiesData Security object preservation;
- `null != 0 != "" != undefined`;
- unknown provider-field semantics are not guessed.

Changing the storage engine is not, by itself, justification for changing provider endpoints, request semantics, response interpretation or complete-cycle validation.

## 2. What V2 changes

At the successful-cycle handoff, V1 and the Browser SQL target diverge.

Conceptually:

~~~text
V1:
validated complete cycle
→ IndexedDB atomic persistence
→ Viewer reads IndexedDB

V2 target:
same validated complete cycle
→ SQL Authority
→ DuckDB-Wasm + persistent OPFS atomic persistence
→ SQL-backed Viewer/read APIs
~~~

After production cutover, DuckDB/OPFS becomes the market-history authority. IndexedDB is not kept as a co-equal production authority.

V2 also adds:

- SQL-side enrichment needed by the Browser SQL model;
- a user-defined analytical SQL runtime;
- a configurable SQL repeat interval independent from collection cadence;
- a third Viewer surface for dynamic SQL scanning.

## 3. Viewer surface 1 — Current Universe

V2 preserves the V1 all-securities/latest-data experience as a first-class surface.

Purpose:

~~~text
all current securities
→ latest committed bank data per security
→ deterministic table/sorting
~~~

The data source changes from direct IndexedDB reads to Runtime Controller / SQL Authority reads after cutover.

The product behavior does not disappear merely because persistence changes.

This surface continues to expose the relevant current bank fields already available in V1, subject to the same truthfulness rules for missing/null/zero values.

## 4. Viewer surface 2 — Security Detail and History

V2 preserves the V1 per-security drill-down as a first-class surface.

Purpose:

~~~text
selected SecurityId
→ current/detail data
→ persisted chronological history for that security
~~~

The source changes from IndexedDB to Runtime Controller / SQL Authority reads after cutover.

V2 may enrich the stored/queryable data, but it must not remove the basic ability to inspect one security and its history.

## 5. Viewer surface 3 — Dynamic SQL Scanner

V2 adds a separate SQL-driven scanner surface. It does not replace either V1-derived surface.

The scanner contains, at minimum:

- editable user SQL;
- a user-selectable repeat interval X;
- activation/status/error feedback;
- execution timing/status;
- a result grid driven by the active SQL result schema;
- 0..N result rows, where zero rows is a successful empty result.

Its conceptual baseline is the current/latest universe, so a simple query can display all current securities and their latest committed values.

The user may then change SQL to express filtering, sorting, selected columns, joins, history predicates, aggregation, `GROUP BY`, `HAVING`, ranking/window logic and `LIMIT` without changing collector/application code.

The active SQL is the authority for what the scanner shows. The UI must not secretly apply a second independent filtering/ranking algorithm that changes the SQL result meaning.

The SQL repeat interval is independent from the market-data collector cadence.

## 6. Navigation between surfaces

The three surfaces are different views over one runtime/data authority.

A SQL result row that exposes the canonical SecurityId may reuse the existing Security Detail/History surface for drill-down rather than invent another security-detail implementation.

That navigation is still observational research UI.

The current V2 scope does **not** add:

- order placement;
- automatic trade selection/execution;
- a downstream position-management workflow;
- a final trading formula.

Those may be separate later product work.

## 7. Acceptance shape

A completed V2 Viewer/runtime integration must demonstrate all of the following together:

1. the proven V1 provider/data-collection contract still produces the same class of complete raw market cycle;
2. that cycle is persisted through the SQL authority rather than the V1 IndexedDB authority;
3. the Current Universe surface still shows all latest committed securities/bank data;
4. the Security Detail/History surface still supports one-security historical inspection;
5. the separate Dynamic SQL Scanner accepts user SQL + interval and repeatedly displays the resulting 0..N table;
6. changing scanner SQL/interval does not require collector code changes;
7. all three surfaces read one coherent committed authority and do not create independent DB owners.

## 8. Traceability

Durable decision:

~~~text
docs/project/decisions/D-043.md
~~~

Implementation ownership:

~~~text
WP-09..WP-14 / #37..#42
  preserve the validated V1 cycle/raw-data contract through SQL ingest

WP-23 / #51
  integrate the unchanged provider/Recorder contract with SQL persistence

WP-24 / #52
  live provider compatibility/equivalence

WP-25 / #53
  Viewer bridge for all three surfaces

WP-26 / #54
  Dynamic SQL Scanner editor + interval activation

WP-27 / #55
  Dynamic SQL Scanner result-grid presentation

WP-28 / #56
  Current Universe + Security Detail/History on SQL reads

WP-29 / #57
  integrated three-surface checkpoint

WP-36..WP-38 / #64, #66, #67
  preserve the same contract through cutover, live endurance and final cleanup
~~~
