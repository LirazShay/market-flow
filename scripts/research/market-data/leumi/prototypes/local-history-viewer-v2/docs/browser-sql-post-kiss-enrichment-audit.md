# Browser SQL V2 — Post-KISS Enrichment Audit

## Role

This is the third post-KISS consistency audit under Issue #72.

Scope:
- enrichment implementation manual;
- enrichment decision benchmark plan;
- enrichment integration plan;
- D-027/D-028 enrichment assumptions.

Goal:

~~~text
keep only analytical structure that the daily V2 product actually needs
~~~

This audit does not implement runtime/product code and does not yet mutate canonical GitHub execution Issues.

Current scope authority: browser-sql-kiss-scope-reset.md.

---

# 1. Overall conclusion

The pre-KISS enrichment plan is substantially overbuilt for initial V2.

The key correction is:

~~~text
persisted enrichment is OPTIONAL for initial V2
~~~

Initial V2 already has:

~~~text
raw current/history SQL
+ full raw provider facts
+ timestamps
+ canonical SecurityId
+ dynamic SQL capability
~~~

That is enough to begin writing real analytical queries.

Persisted horizons, predecessor links, derived metrics, indexes and schema expansion are added only when a real query demonstrates a repeated performance or usability need.

---

# 2. New KISS enrichment principle

Old flow:

~~~text
select horizons
→ choose predecessor semantics
→ choose promoted fields
→ benchmark variants
→ evolve schema
→ backfill/rebuild
→ integrate enrichment
→ expose to UI
~~~

New flow:

~~~text
start with raw SQL history
→ write the actual query we want
→ run it on representative day-sized data
→ if fast/simple enough: stop
→ only if not: add the smallest targeted optimization
~~~

This changes enrichment from a mandatory subsystem into an evidence-triggered optimization step.

---

# 3. What stays mandatory

These principles survive unchanged:

- preserve full raw MapHeat and Security facts;
- preserve canonical SecurityId and stable history identity;
- null != 0 != empty string != missing;
- never derive from an unverified provider semantic;
- any persisted derived value must be deterministic/rebuildable from preserved source facts;
- if enrichment is persisted as part of a cycle, it must not create partial committed state;
- dynamic SQL must still be able to access full historical facts even when optimizations exist.

These are correctness rules, not a mandate to add derived columns.

---

# 4. What is removed from mandatory initial scope

Remove as required initial-V2 work:

- choosing a canonical persisted horizon set in advance;
- persisted predecessor links by default;
- wide prev_H columns;
- wide last_change_H_pct columns;
- persisted DealsDelta family;
- persisted MID family merely because it was discussed;
- generalized candidate inventory covering every imaginable metric;
- one benchmark matrix for every horizon/metric/index combination;
- schema migration/backfill framework for enrichment before production cutover;
- enrichment-version metadata unless a real mixed-schema state exists;
- mandatory enrichment exposure in Current/Detail;
- a separate ND-18/ND-19/ND-20/ND-21 execution chain.

---

# 5. Start from actual analytical questions

Initial optimization work should begin only from concrete SQL we actually want to run.

Examples already relevant to the product vision include:

~~~text
current LAST vs LAST ~10s / 20s / 30s / 60s ago
current BID1 vs historical LAST/BID1/ASK1
current ASK1 vs historical LAST/BID1/ASK1
recent trade/deal activity when source semantics are verified
cross-security ranking by short-horizon movement
GROUP BY/HAVING over recent history
~~~

These are query requirements, not automatically persisted-column requirements.

---

# 6. Minimal analytical schema before optimization

V1-on-SQL should expose enough typed/source data to write practical queries without forcing every query through painful JSON parsing.

However, even typed promotion must be justified by actual query ergonomics/performance.

Candidate minimal source promotions may include frequently used verified fields such as:

~~~text
LAST
BID1
ASK1
provider deal/activity count if semantics are verified for the intended use
~~~

Rule:

~~~text
promote frequently queried source facts when it clearly simplifies/accelerates real SQL
~~~

Do not promote a field merely because it may someday be queried.

Full raw JSON remains authoritative preservation.

---

# 7. Horizons are query inputs first

The previously discussed horizons:

~~~text
10s, 20s, 30s, 60s, 90s, 120s, 300s, 600s
~~~

remain useful **query ideas**, not a required physical schema.

Initial implementation should allow SQL such as:

~~~text
find the latest older snapshot around a requested time offset
~~~

without first creating eight persisted predecessor columns.

If a small subset is repeatedly expensive, that subset may later earn optimization.

---

# 8. Predecessor semantics are decided only when a query needs them

The old plan considered:
- at-or-before;
- nearest;
- at-or-before with tolerance;
- session/day restrictions.

Do not choose a global physical predecessor policy before there is a concrete analytical use.

For each real query, define the intended temporal semantics in the SQL/test.

If the same semantics recur enough to justify persisted links, then promote that rule into a durable optimization contract.

Until then:

~~~text
temporal relationship lives in query logic
~~~

---

# 9. DealsDelta remains blocked

Keep the strong old rule:

~~~text
DailyDealsQuantity semantics not sufficiently verified
→ do not persist DealsDelta
~~~

More strongly after KISS:

Do not spend implementation time designing DealsDelta schema at all until a real analytical query needs it and the source reset/session/day semantics are verified.

Availability of a field is not proof of its subtraction semantics.

---

# 10. MID is not an initial enrichment requirement

MID can be computed dynamically when needed.

Before persisting or broadly exposing it:
- verify BID/ASK zero/missing semantics;
- prove it is repeatedly useful;
- show dynamic calculation is materially costly or awkward.

Otherwise keep it query-time.

---

# 11. Benchmark plan becomes tiny and query-driven

The E6 benchmark methodology is sound but too broad as a mandatory subsystem.

Keep the principle:

~~~text
same dataset
→ dynamic query
vs
small targeted optimization
→ compare correctness + cost
~~~

Remove the requirement for a fixed V0/V1/V2/V3/V4 matrix for every candidate.

For each optimization question, benchmark only:

~~~text
A. current simple design
B. one proposed optimization
~~~

Maybe C only if a second plausible simple option exists.

---

# 12. Representative benchmark data

Use day-shaped deterministic data, not many abstract dataset tiers by default.

Minimum useful benchmark shape:

~~~text
representative universe size discovered/configured dynamically
× realistic collection cadence
× representative trading-day duration or a compressed equivalent row count
~~~

Add one modest safety-margin dataset if useful.

Do not create short/medium/large/stress matrices unless a specific scaling question needs them.

Never hardcode universe size as a product invariant.

---

# 13. Benchmark measurements

For an enrichment optimization decision, usually enough to measure:

- query latency for the real query;
- ingest cost impact;
- storage growth impact;
- reopen impact if the schema change is material;
- correctness.

p50/p95 may be useful for repeated query timing.

No need to collect every possible runtime metric for every experiment.

Correctness remains a hard gate.

---

# 14. Optimization decision rule

Persist or index only if:

~~~text
real query is important
+ simple dynamic SQL is materially too slow/awkward
+ optimization materially helps
+ added write/storage/schema complexity is acceptable
~~~

Otherwise:

~~~text
keep it dynamic SQL
~~~

Absence of evidence defaults to no optimization.

---

# 15. Prefer the smallest optimization

If a query is too slow, consider optimizations in increasing complexity:

~~~text
1. better SQL formulation
2. one useful typed source column
3. one targeted index / engine-appropriate optimization if proven useful
4. one persisted predecessor reference
5. one persisted derived metric
~~~

Do not jump directly to a wide precomputed analytical schema.

Note: whether DuckDB benefits from a particular index/access pattern must be measured on the pinned build; do not assume traditional OLTP index behavior.

---

# 16. Enrichment schema evolution before cutover should stay simple

Because enrichment is developed before the final production SQL cutover, do not build a non-destructive migration platform unless valuable SQL history already exists.

Preferred development rule:

~~~text
schema experiment changes materially
+ only disposable development data exists
→ explicitly rebuild the development SQL DB
~~~

Requirements:
- rebuild is deliberate, never silent;
- production-named valuable DB is never auto-reset;
- fixtures/tests recreate data deterministically.

If valuable production SQL history later exists, that future release can design the migration it actually needs.

---

# 17. No enrichment backfill framework by default

The old plan required choosing:

~~~text
backfill
raw-only old rows
or fresh rebuild
~~~

For initial pre-cutover V2, default to:

~~~text
fresh development rebuild when physical enrichment design changes
~~~

unless implementation timing has already created valuable SQL history that must be preserved.

Do not build mixed-enrichment availability/version machinery preemptively.

---

# 18. Atomicity rule if optimization is persisted

If a selected optimization creates derived data that is expected to match each committed snapshot/cycle, it must be computed/committed coherently with that cycle.

But do not overgeneralize this into an enrichment transaction framework.

Just extend the existing atomic cycle write with the selected derived values.

Tests cover only the selected calculation/failure seam.

---

# 19. Rebuildability remains, but prove only what exists

If no persisted derived enrichment ships:

~~~text
rebuildability proof = NOT APPLICABLE
~~~

If one persisted metric/link ships:

~~~text
recompute that one metric/link from raw history in a deterministic test
→ compare
~~~

No generic rebuild engine is required.

---

# 20. Current/Detail exposure defaults to no-op

E7 correctly allowed a no-op.

Post-KISS default should now explicitly be:

~~~text
do not add enrichment columns to Current/Detail unless there is a clear browsing use
~~~

The Scanner is the primary place for exploratory analytical combinations.

Current and Detail should remain the simple V1-style browsing surfaces unless one specific enrichment materially improves them.

---

# 21. If one value is exposed to Current/Detail

Then define only for that value:
- type/unit;
- zero/NULL/warm-up display;
- sort semantics if sortable;
- trusted read projection;
- public UI tests.

Do not create a general exposure-decision registry.

Existing V1 parity tests remain green.

---

# 22. Scanner handoff becomes simpler

The Scanner does not need a large 'analytical handoff package'.

Before Scanner work it needs:

~~~text
which SQL tables/views are intentionally queryable
which useful typed fields exist
which persisted derived fields, if any, exist
their names/types/units/null semantics
a few representative example queries
~~~

Everything else can be discovered/documented as normal SQL schema.

---

# 23. Enrichment no longer needs a separate UI integration phase

Remove a mandatory standalone ND-21-like phase.

If a persisted/query-time analytical value is later selected for Current/Detail:

~~~text
implement that small UI change in the same optimization Issue or a small follow-up Issue
~~~

If none is selected, there is literally no UI enrichment work.

---

# 24. Proposed compact enrichment execution shape

Initial V2 should treat enrichment as **one small mini-project**, probably one or two executable Issues:

~~~text
1. write representative real analytical SQL on raw/history
   + measure day-sized behavior

2. only if needed:
   add the smallest proven typed/persisted optimization
   + regression/benchmark it
~~~

Possible outcome:

~~~text
no persisted enrichment needed before Scanner
~~~

That outcome is fully acceptable.

---

# 25. Checkpoint simplification

Remove the old broad ND-20 gate list.

Enrichment mini-project is complete when:

~~~text
representative analytical queries work correctly
+ important queries are acceptably responsive on day-sized data
+ every persisted optimization (if any) has verified semantics/tests
+ atomicity remains green
+ Fast CI / affected Browser CI are green
~~~

No mandatory selected-horizon table, rebuild framework, backfill framework or enrichment evidence registry.

---

# 26. What remains cold reference

## browser-sql-enrichment-implementation-manual.md

Classification: SUPERSEDE as canonical implementation plan; KEEP as edge-case/reference material.

Useful retained knowledge:
- source semantics before derivation;
- DealsDelta caution;
- null/warm-up correctness;
- set-based computation if optimization is later needed;
- derived state rebuildability principle.

## browser-sql-enrichment-benchmark-plan.md

Classification: SIMPLIFY strongly.

Keep controlled comparison/correctness-first principles, but benchmark only real optimization questions.

## browser-sql-enrichment-integration-plan.md

Classification: REMOVE as mandatory phase; KEEP its key separation principle:

~~~text
persisted != shown in Current/Detail != queryable by Scanner
~~~

Use it as reference only if an enrichment is actually exposed in browsing UI.

---

# 27. D-027 / D-028 required successor meaning

Pass G should replace the old fixed-schema decisions with something close to:

~~~text
initial SQL authority stores the minimum raw/current/history data required for V1 parity.

Analytical SQL runs on that history first.

Typed fields or persisted derived enrichment are added only for verified semantics and demonstrated query value/performance need.

Any persisted derived value remains rebuildable from preserved raw facts and participates coherently in the atomic cycle state it represents.
~~~

This preserves the strong architectural truth without pre-selecting physical optimization.

---

# 28. Post-KISS enrichment acceptance test

The enrichment plan is simple enough when a fresh engineer can explain it as:

~~~text
first write the SQL we actually want
→ try it on a day of realistic data
→ if it is good enough, build nothing else
→ if it is not, optimize only the bottleneck
~~~

If implementation must first choose eight horizons, predecessor policies, backfill modes, migration machinery and UI exposure matrices, enrichment is still over-planned.
