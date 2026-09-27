# Local History Viewer V2 — Product Continuity and Three Viewer Surfaces

## Role

This is the durable product requirement for the V2 user-facing shape.

It contains no live progress. Operational current/next state belongs only in the V2 `STATUS.json`.

V2 evolves the proven Local History Viewer V1 behavior; changing persistence does not redefine the working provider/data contract.

## 1. Provider/data collection continuity

The preserved acquisition contract is:

~~~text
authenticated Leumi page
→ MapHeat2 dynamic universe
→ sequential GetSecuritiesData chunks
→ exact complete-cycle validation
→ one validated complete cycle
~~~

The following remain product invariants unless later evidence explicitly changes the provider contract:

- existing authenticated page-context collection;
- MapHeat2 dynamic-universe discovery;
- proven sequential GetSecuritiesData flow;
- canonical security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- exact requested/received/unique/duplicate/missing/unexpected validation;
- full raw MapHeat preservation;
- full raw GetSecuritiesData Security preservation;
- `null != 0 != "" != undefined`;
- unknown provider-field semantics are not guessed.

Changing storage/analytics is not itself justification for changing provider endpoints, request semantics or response interpretation.

## 2. What V2 changes

~~~text
V1:
validated complete cycle
→ IndexedDB atomic persistence
→ Viewer reads IndexedDB

V2:
same validated complete cycle
→ one SQL Authority
→ pinned DuckDB-Wasm + persistent OPFS
→ atomic raw/current/history persistence
→ trusted SQL-backed reads
~~~

After explicit production cutover, DuckDB/OPFS is the only new market-history authority. IndexedDB is not a co-equal production authority.

V2 also adds:

- real user-defined analytical SQL;
- a configurable SQL repeat interval independent from collector cadence;
- a third Viewer surface for Dynamic SQL scanning.

Analytical optimization is evidence-driven:

~~~text
real SQL first
→ measure on representative history
→ persist/promote only what proves useful
~~~

No fixed horizon/predecessor/derived-metric schema is a product requirement.

## 3. Surface 1 — Current Universe

Current Universe remains a first-class V1-derived browsing surface:

~~~text
all current securities
→ latest committed bank data per security
→ deterministic table/sorting
~~~

The source changes from IndexedDB to trusted Runtime Controller / SQL Authority reads.

Missing/null/zero distinctions remain truthful.

## 4. Surface 2 — Security Detail and History

Security Detail/History remains a separate first-class V1-derived surface:

~~~text
selected canonical SecurityId
→ current/detail data
→ persisted chronological history
~~~

The source changes from IndexedDB to trusted Runtime Controller / SQL Authority reads.

The surface must remain useful for known persisted history even when a security is no longer in the current universe.

## 5. Surface 3 — Dynamic SQL Scanner

The Scanner is additive; it does not replace Current or Detail/History.

Minimum behavior:

- editable user SQL;
- configurable repeat interval;
- explicit activation;
- one active SQL/config;
- read-only execution against committed coherent data;
- at most one Scanner execution at a time;
- missed intervals do not burst into overlapping catch-up runs;
- status/error feedback;
- result grid driven by SQL result schema;
- 0 rows is successful empty output.

The user SQL may use, where supported and safe:

- SELECT / JOIN / WHERE;
- GROUP BY / HAVING;
- ORDER BY / LIMIT;
- window functions;
- history/time predicates;
- cross-security comparison/ranking.

The UI must not silently add a second filter/rank/sort or hidden LIMIT that changes SQL meaning.

## 6. Navigation and authority

All three surfaces are clients of one Runtime Controller / SQL Authority.

Notifications are hints. Viewer state is rebuilt from authoritative reads.

A Scanner row exposing canonical SecurityId may navigate to the shared Detail/History surface; other Scanner columns are not treated as independent current-market authority.

Cross-tab production ownership is singular: only one runtime may own production DB/Recorder work.

## 7. Explicit product non-goals

Initial V2 does not add:

- order placement;
- automatic trade selection/execution;
- downstream position management;
- a final trading formula;
- a long-term historical warehouse product;
- a collaborative SQL editor.

## 8. Acceptance shape

A completed V2 must demonstrate together:

1. the preserved V1 provider contract still produces validated complete raw cycles;
2. successful cycles become coherent SQL authority state;
3. Current Universe works from committed SQL reads;
4. Security Detail/History works from committed SQL reads;
5. Dynamic SQL Scanner accepts user SQL + interval and repeatedly displays truthful 0..N results;
6. changing Scanner SQL/interval does not change collector code/cadence;
7. all surfaces share one coherent committed authority and do not create independent DB owners;
8. representative daily mixed use is viable before cutover.

## 9. Traceability

Product/provider authority:

~~~text
docs/project/decisions/D-043.md
~~~

Implementation baseline:

~~~text
docs/project/decisions/D-044.md
~~~

Conceptual implementation ownership:

~~~text
C02-C04
  minimum SQL authority, atomic cycle persistence, Recorder integration and trusted reads

C05
  Current Universe SQL parity

C06
  Detail/History SQL parity + bounded real-provider L-2

C07
  real analytical SQL + evidence-driven optimization decision

C08-C09
  simple Scanner core + Scanner UI/results

C10-C11
  single-owner runtime + representative daily mixed workload

C12
  final live verification + explicit cutover/rollback/cleanup
~~~

The compact dependency source is:
`scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/docs/browser-sql-compact-execution-dag.md`.

Actual GitHub Issue numbers are added only after materialization; live completion state remains only in `STATUS.json`.
