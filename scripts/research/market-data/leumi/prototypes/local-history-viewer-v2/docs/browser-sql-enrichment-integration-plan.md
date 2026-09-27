# Browser SQL V2 — Enrichment Integration Plan

> **Reference-only / superseded integration guidance.** Initial V2 does not require a mandatory enrichment handoff before Scanner work. C07 and C08/C09 run in parallel after C05+C06; only evidence-triggered O1 may add targeted enrichment.


## Role

This is Pass E7 of Issue #72.

It defines ND-21: how enrichment that already passed ND-20 may be selectively exposed to the V1-derived browsing surfaces, and what proven analytical contract is handed forward to the later Dynamic SQL Scanner mini-project.

This document is planning-only. It does not implement product/runtime code and does not mutate the canonical GitHub Issue graph.

Entry gate:

~~~text
ND-20 enrichment correctness/performance checkpoint = complete
~~~

Authorities:
- browser-sql-enrichment-implementation-manual.md;
- browser-sql-enrichment-benchmark-plan.md;
- browser-sql-v1-on-sql-checkpoint.md;
- browser-sql-rebaseline-dependency-dag.md Pass D3;
- D-043 / local-history-viewer-v2-product-shape.md.

---

# 1. Core separation

Three separate decisions must never be collapsed:

~~~text
persisted in SQL
!=
shown in Current/Detail
!=
available to Scanner SQL
~~~

A metric may be:

~~~text
persisted + Scanner-visible + not shown in Current
persisted + shown in Detail only
query-time Scanner-only
diagnostics-only
not selected at all
~~~

Persistence is an implementation/performance decision.

Viewer exposure is a product/usability decision.

Scanner availability is an analytical SQL-contract decision.

---

# 2. ND-21 purpose

ND-21 answers only:

~~~text
Given the proven enrichment set from ND-20,
which values, if any, improve Current Universe or Detail/History enough to justify adding them?
~~~

ND-21 must not reopen:
- provider semantics;
- horizon-selection correctness;
- predecessor algorithm;
- persist-vs-query decisions;
- enrichment atomicity;
- Scanner execution/scheduling design.

If one of those needs reopening, route back to its owning checkpoint rather than silently changing it in UI work.

---

# 3. Exposure decision matrix

For every ND-20-selected analytical item, create one product exposure record:

~~~text
itemId
sqlName
type
unit
semanticStatus
availability/warmup semantics
candidateSurface:
  Current | Detail | History | ScannerOnly | DiagnosticsOnly
userQuestionAnswered
displayValue
sortMeaning
space/readabilityCost
parityRisk
decision:
  expose | do-not-expose
rationale
~~~

No metric appears in a browsing surface without an explicit decision row.

---

# 4. Exposure eligibility gates

An enrichment may be shown in Current/Detail only if all are true:

1. ND-20 accepted its semantics and implementation;
2. unit is explicit;
3. missing/warm-up behavior is explicit;
4. the user-facing question it answers is clear;
5. the UI can present it without implying unsupported meaning;
6. adding it does not break preserved V1 browsing behavior;
7. the same authoritative SQL value can be read through an application-owned contract;
8. browser tests can verify its public behavior.

An item failing any gate stays out of Current/Detail even if it is persisted.

---

# 5. Explicit no-op outcome

ND-21 is allowed to conclude:

~~~text
No enrichment belongs in Current/Detail in initial V2.
~~~

This is a successful product decision when:
- Scanner/query access already satisfies the analytical need;
- table readability would worsen;
- the metric is experimental;
- warm-up semantics are too complex for the browsing surface;
- the value is useful only in combinations expressed by SQL.

A no-op ND-21 still produces:
- exposure decision records;
- explicit Scanner handoff contract;
- tests/guards proving Current/Detail remain unchanged.

Do not add columns merely so ND-21 has visible code changes.

---

# 6. Current Universe exposure policy

Current Universe remains the normal all-securities browsing table.

Preserved baseline includes:
- all current securities;
- latest committed bank data;
- deterministic default sorting;
- explicit zero/missing behavior;
- row→Detail navigation;
- committed-cycle refresh;
- Hebrew/RTL/accessibility.

Candidate enrichment belongs in Current only if it is broadly useful for scanning the whole universe without requiring user-written SQL.

Examples of evaluation questions:

~~~text
Does this metric improve the default broad overview?
Is one value meaningful without additional SQL context?
Will it make the table substantially wider/noisier?
Does it tempt hidden ranking/filter semantics?
Is the metric available for enough rows after warm-up?
~~~

ND-21 must not convert Current Universe into the Dynamic SQL Scanner.

---

# 7. Current default-sort protection

Adding an enrichment column does not automatically change the preserved V1 default sort.

Default sorting changes only if there is a separate explicit product decision and corresponding parity-contract update.

Otherwise:

~~~text
existing default sort remains
new enrichment column may be explicitly sortable if selected
~~~

No hidden ranking based on enrichment is allowed.

---

# 8. Detail/History exposure policy

Detail/History is the better candidate surface for information that:
- is meaningful for one selected security;
- benefits from temporal context;
- would overcrowd Current;
- needs explanation of warm-up/availability.

Possible placements are distinct decisions:

~~~text
Detail current-summary field
History row column
small analytical summary block
Scanner only
~~~

Do not render a derived value in every history row merely because a column exists physically.

---

# 9. History-row contract protection

If ND-21 adds an enrichment column to history:
- newest-first ordering remains unchanged;
- continuation cursor semantics remain unchanged;
- page size/bounded loading remain unchanged unless independently justified;
- no duplicate/skip behavior remains mandatory;
- row identity remains SnapshotId/canonical history identity, not metric value;
- NULL warm-up displays truthfully;
- old/raw-only rows follow the explicit ND-19 history-compatibility strategy.

An enrichment column may not force unbounded history materialization.

---

# 10. Formatting contract

Every exposed analytical value defines:

~~~text
SQL type
semantic unit
display unit
precision/rounding
positive/negative formatting
zero formatting
NULL/missing/warm-up display
sort interpretation
~~~

Example rule if a selected change metric uses percentage points:

~~~text
stored 0.5
→ means +0.5%
→ UI may display 0.50%
~~~

Formatting must not change the underlying numeric meaning.

Do not infer a unit from a column name.

---

# 11. NULL and warm-up presentation

ND-21 must preserve:

~~~text
0 != missing analytical history
~~~

Possible product states must remain distinguishable:
- numeric zero;
- metric NULL because predecessor unavailable;
- source value unavailable;
- old raw-only history not enriched, if that strategy was selected;
- read failure.

UI may use the same visual dash for multiple non-values only when the product does not need to distinguish them visually, but the internal/view-model state must remain truthful and diagnostics must not collapse them.

Do not display 0 for warm-up.

---

# 12. Trusted read-contract extension

Current/Detail never query enrichment through arbitrary Scanner SQL.

If an enrichment is exposed in browsing UI, extend the application-owned read contract deliberately.

Preferred shape:

~~~text
SQL Authority physical schema
→ stable trusted read projection
→ Runtime Controller
→ Current/Detail
~~~

The Viewer should not gain knowledge of physical predecessor tables/columns beyond the stable projection contract.

Only exposed values need to enter Current/Detail read DTOs.

Scanner-only analytical fields do not bloat trusted browsing DTOs.

---

# 13. Read-contract versioning/change control

When ND-21 changes a trusted read result shape:
- update the durable read/viewer contract;
- update deterministic serializers/type guards if used;
- update affected Viewer tests;
- mark Current/Detail parity evidence stale only for the affected surface;
- preserve backward-safe behavior within the same release where practical.

A physical schema change with no trusted-read contract change must not force Viewer code changes.

---

# 14. Current surface test-first matrix

For every enrichment selected for Current, add public-contract tests before UI implementation:
- column/label exists only when selected;
- authoritative numeric value is displayed correctly;
- zero stays zero;
- unavailable/warm-up follows display contract;
- interactive sort uses numeric semantics if sortable;
- deterministic null ordering;
- default V1 sort unchanged unless explicitly revised;
- live committed-cycle refresh updates the value;
- manual refresh is still runtime/DB-only;
- row navigation remains canonical SecurityId;
- RTL/keyboard behavior remains usable.

Use Node for pure table/sort/formatting logic and Chromium for rendered behavior.

---

# 15. Detail/History test-first matrix

For every enrichment selected for Detail/History, test:
- selected security only;
- current-summary value comes from trusted read;
- history-row value aligns with the correct snapshot;
- warm-up NULLs;
- older-page loading;
- equal-timestamp continuation;
- no duplicate/skip;
- security leaves Current while historical enrichment remains readable;
- live refresh while Detail stays open;
- old/raw-only row semantics if applicable;
- localized read failure.

---

# 16. Parity protection after ND-16

ND-16 proved V1-on-SQL behavior before enrichment.

ND-21 additions must be additive unless a durable product decision explicitly revises an old behavior.

Regression rule:

~~~text
existing Current/Detail parity corpus
+ enrichment-specific tests
→ must remain green
~~~

If adding a new column unexpectedly changes old sort, navigation, paging, state or refresh behavior, treat it as a regression rather than redefining parity.

---

# 17. Performance protection for exposed fields

UI exposure must not accidentally reintroduce expensive per-row analytical queries.

Required pattern:

~~~text
one bounded trusted read
→ contains selected exposed values
→ Viewer renders
~~~

Reject patterns such as:

~~~text
Current rows
→ N additional SQL calls for N securities
~~~

or:

~~~text
history page
→ one extra query per row/horizon
~~~

ND-20 performance evidence remains the analytical basis; ND-21 only verifies that UI/read projection does not destroy it.

---

# 18. Scanner handoff contract

ND-21 must leave one explicit analytical handoff for ND-22.

The handoff contains:
- selected physical enrichment facts from ND-20;
- selected query-time analytical patterns that remain intentionally dynamic;
- stable logical names proposed for Scanner-facing SQL;
- SQL types;
- units;
- NULL/warm-up semantics;
- source/derived classification;
- which fields are trusted application projections versus Scanner-only;
- rebuildability notes;
- deferred/rejected analytical candidates.

This is an input to Scanner SQL-contract design, not yet the final Scanner API.

---

# 19. Scanner-facing naming rules

Before ND-22 starts, every accepted analytical concept needs one unambiguous semantic name.

Naming rules:
- one unit per name;
- no legacy ambiguous aliases without reason;
- horizon encoded consistently if horizon-specific;
- source-promoted versus derived semantics documented;
- names do not imply stronger provider semantics than Verified.

If E5 changed the old horizon/metric design, do not preserve obsolete names merely for compatibility with a plan that was never implemented.

---

# 20. Physical schema is not the Scanner API

ND-21 handoff must distinguish:

~~~text
physical implementation object
vs
stable Scanner-facing analytical concept
~~~

Examples:
- a predecessor may be stored as a physical SnapshotId but exposed through a stable view;
- a query-time metric may exist in a documented SQL example without being a stored column;
- internal enrichment-version metadata may remain hidden from normal Scanner queries.

ND-22 decides the final stable SQL surface.

---

# 21. Surface ownership separation

After ND-21:

~~~text
Current/Detail
= application-owned trusted reads

Scanner
= user-authored read-only SQL over its stable SQL contract
~~~

Rules:
- Current/Detail never require active Scanner SQL;
- Scanner state never changes Current/Detail columns;
- Scanner filters/ranks only its own result;
- browsing manual refresh does not execute Scanner;
- Scanner query error does not invalidate browsing data;
- both read the same committed SQL authority.

---

# 22. Health/error separation

Exposed enrichment introduces no new global-health state merely because one value is NULL.

Distinguish:

~~~text
normal warm-up/unavailable metric
browsing read error
global SQL/runtime/storage error
future Scanner query error
~~~

Only actual runtime/storage authority failures belong in shared health.

---

# 23. Diagnostics

If enrichment diagnostics are useful, expose bounded summaries such as:
- enrichment schema/version;
- selected horizon identifiers;
- count of current rows with/without a selected metric;
- last enrichment checkpoint/build identity;
- safe benchmark/decision IDs.

Do not export arbitrary raw provider rows or Scanner results by default.

Diagnostics do not become another data authority.

---

# 24. ND-21 implementation sequence

Recommended sequence:

~~~text
1. read ND-20 accepted analytical contract
2. create exposure decision matrix
3. choose Current/Detail/ScannerOnly/DiagnosticsOnly per item
4. accept explicit no-op if warranted
5. define trusted-read projection changes only for exposed values
6. write Current/Detail public-contract tests
7. implement smallest Viewer/read changes
8. rerun old parity/regression suites
9. run affected Chromium tests
10. run full Browser CI because Viewer/read contract changed
11. produce Scanner analytical handoff
12. close ND-21
~~~

If ND-21 is a no-op for UI, steps 5-10 reduce to guards proving preserved Current/Detail behavior and the Scanner handoff still occurs.

---

# 25. ND-21 exit matrix

ND-21 may complete only when:

| Gate | Required |
|---|---|
| ND-20 enrichment checkpoint | PASS |
| exposure decision exists for every accepted analytical item | PASS |
| every exposed value has type/unit/NULL/format contract | PASS |
| trusted read contracts updated only where needed | PASS or explicit no-op |
| Current regression/parity suite | PASS |
| Detail/History regression/parity suite | PASS |
| enrichment-specific UI tests | PASS or NOT_APPLICABLE for no-op |
| affected Chromium tests | PASS |
| full Browser CI | PASS when Viewer/read code changed |
| Scanner analytical handoff | complete |
| zero unresolved exposure Unknowns | PASS |
| docs/decision consistency | PASS |

ND-21 does not require Scanner implementation.

---

# 26. Failure routing

## Metric is correct but harms browsing usability

~~~text
do not expose in Current/Detail
→ keep Scanner-only/queryable
~~~

## UI requires expensive N+1 reads

~~~text
reject UI shape
→ redesign bounded trusted projection
→ do not compensate with hidden caching semantics
~~~

## Existing parity behavior changes unintentionally

~~~text
treat as regression
→ fix
→ rerun affected parity/browser evidence
~~~

## Exposure semantics become unclear

~~~text
remove/defer exposure
→ do not weaken ND-20 semantic contract
~~~

## Scanner handoff reveals ambiguous naming/unit

~~~text
resolve semantic name before ND-22
→ do not push ambiguity into user SQL
~~~

---

# 27. Documentation reconciliation note

The current D-043 product document still contains traceability to the old WP-09..WP-38 graph.

That traceability is historical after the re-baseline and must be rewritten in Pass G to reference the new canonical execution graph.

Do not treat those old WP references as implementation dependencies for ND-21 or the Scanner.

---

# 28. Output consumed by ND-22

ND-22 should receive a compact package containing:

~~~text
proven raw/current/history SQL authority
selected persisted analytical concepts
selected query-time concepts
stable semantic names/types/units
NULL/warm-up rules
ScannerOnly vs browsing-exposed classification
representative analytical SQL examples
benchmark decision IDs
deferred/rejected candidates
~~~

ND-22 then decides the final Scanner-facing SQL objects and lifecycle.

---

# 29. E7 exit criteria

Pass E7 planning is complete when another implementation chat can determine without guessing:
- why persistence does not imply UI exposure;
- how each accepted enrichment is classified by surface;
- when ND-21 may legitimately be a no-op;
- how Current default behavior/parity is protected;
- how Detail/history exposure is bounded;
- how type/unit/NULL/warm-up formatting is specified;
- how trusted read contracts are extended without exposing physical schema;
- what browser tests are mandatory;
- what exactly is handed to ND-22;
- why Current/Detail remain independent from Scanner state.
