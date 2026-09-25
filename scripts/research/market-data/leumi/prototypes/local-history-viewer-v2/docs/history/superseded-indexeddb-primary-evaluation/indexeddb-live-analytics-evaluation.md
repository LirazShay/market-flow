# IndexedDB Live Analytics Evaluation — Design

This is the durable research/design plan for evaluating whether the existing browser-local IndexedDB foundation can support Market Flow V2 live opportunity discovery.

It does not contain live progress. Operational state belongs only in ../STATUS.json.

## 1. Decision question

The program must eventually answer:

Can IndexedDB be the primary storage and query foundation for Market Flow V2 live opportunity discovery at the required scale and latency?

If yes, the evidence must show how to structure storage, enrichment, references and queries.

If no, the evidence must identify the exact failing workload, measured magnitude, and the minimum replacement or analytical layer required.

## 2. Starting evidence

The inherited V1/V2 browser architecture already establishes:

~~~text
authenticated browser collection
→ complete-cycle validation
→ atomic successful-cycle persistence
→ IndexedDB source of truth
→ BroadcastChannel notification only
→ Viewer rereads IndexedDB
~~~

The current V2 schema already contains:

| Store | Current identity / notable indexes | Reuse hypothesis |
|---|---|---|
| meta | key | retain lifecycle/state role |
| sessions | sessionId; byStartedAt | retain |
| universe | securityId; byPaperName | retain |
| cycles | cycleId; bySession/byStartedAt/byStatus | retain |
| latest | securityId | retain as elimination-first current-universe read model |
| history | [cycleId, securityId]; bySecurityTime, byCollectedAt, byCycle, bySession | strong reuse candidate |

The existing history.bySecurityTime = [securityId, collectedAtMs] index is already aligned with recent-history-per-security queries.

The evaluation therefore starts from evolution of the proven schema, not from a blank database design.

## 3. Product requirements relevant to the evaluation

The product direction requires:

- complete relevant provider snapshots;
- canonical SecurityId;
- stable identity for every persisted snapshot;
- persistent temporal references for the core horizons;
- cheap persisted core metrics such as MID, LastChange and DealsDelta;
- arbitrary future access to fields from referenced historical rows;
- dynamic live filtering/aggregation/ranking;
- zero candidates as a valid result;
- coherent failure/atomicity semantics.

Current core horizons:

~~~text
10, 20, 30, 60, 90, 120, 300, 600 seconds
~~~

These values must have one owner when implementation begins.

## 4. Working architecture hypothesis

The hypothesis to test is:

~~~text
provider cycle
→ validate full universe response
→ normalize/preserve raw rows
→ assign current snapshot identity
→ resolve temporal references
→ compute cheap repeated metrics
→ atomically persist cycle + history + latest + meta
→ read latest
→ eliminate most securities cheaply
→ read targeted indexed history for survivors
→ aggregate/custom compare/rank in JavaScript
→ return 0..small candidate set
~~~

This is a hypothesis, not the architecture verdict.

## 5. Reuse map

### Strong reuse candidates

- provider collection flow;
- dynamic universe handling;
- canonical String(PaperId or Key) SecurityId;
- full raw MapHeat / Security preservation;
- complete-cycle validation;
- one coherent successful-cycle transaction;
- latest store;
- history store;
- bySecurityTime compound index;
- recorder recovery/lifecycle foundation;
- Browser/Playwright infrastructure;
- sanitized fixture discipline.

### Required new capabilities

- stable per-snapshot identity distinct from SecurityId;
- one owner for horizon configuration;
- temporal reference resolution;
- ingest enrichment;
- verified deals-count semantics before DealsDelta becomes normative;
- benchmark harness at realistic scale;
- elimination-first analytical pipeline;
- targeted history aggregation APIs;
- performance evidence under mixed ingest/query load.

### Open decisions

- physical SnapshotId representation;
- whether the history primary key changes;
- exact temporal matching rule;
- temporal-reference storage shape;
- which derived fields are persisted beyond the initial core set;
- whether additional indexes are justified;
- whether JS analytics remain sufficient;
- whether a Worker provides measured value;
- whether a SQL/analytical layer is justified.

## 6. Logical snapshot contract

The logical model to prove should support:

~~~text
Snapshot
  SnapshotId
  SecurityId
  SessionId
  CycleId
  CollectedAtMs

  Raw
    full relevant provider Security record

  DerivedSameRow
    Mid

  TemporalReferences
    Prev10sId
    Prev20sId
    Prev30sId
    Prev60sId
    Prev90sId
    Prev120sId
    Prev300sId
    Prev600sId

  DerivedCrossTime
    LastChange10sPct ... LastChange600sPct
    DealsDelta10s ... DealsDelta600s
~~~

Logical fields do not force a wide physical schema. Stage 06 compares representations.

Missing historical context yields null, never zero or an invented row.

## 7. Snapshot identity candidates

The program must compare the smallest plausible options rather than choosing by taste.

Candidate families include:

1. existing compound history identity reused as logical snapshot identity;
2. deterministic identity derived from committed cycle identity + SecurityId;
3. dedicated scalar SnapshotId.

Evaluation criteria:

- write simplicity;
- reference storage size;
- direct lookup latency;
- migration complexity;
- human/debug readability;
- recovery semantics;
- IndexedDB key/index behavior.

No hardcoded universe-size arithmetic may be introduced merely to create IDs.

## 8. Temporal-reference resolution design space

A naive implementation could perform approximately:

~~~text
securityCount × horizonCount
~~~

IndexedDB searches every cycle.

That approach may be measured, but it is not the preferred starting hypothesis.

A more promising simple design is a small rebuildable recent-history working set:

~~~text
IndexedDB remains authority
+
in-memory recent committed snapshot metadata for <= max horizon
~~~

For each security, the working set may contain only the minimum fields needed to resolve current references and core derived metrics:

- SnapshotId;
- CollectedAtMs;
- LAST;
- verified cumulative deals count.

Constraints:

- correctness cannot depend on volatile memory surviving refresh;
- after reload, bootstrap the bounded working set from IndexedDB;
- only successfully committed snapshots enter the working set;
- temporal links written into history are immutable;
- the working set is an optimization/rebuildable index, not a second source of truth.

The benchmark must compare this with simpler IndexedDB lookup approaches before production selection.

## 9. Temporal matching semantics

The product requirement does not demand millisecond-exact historical timestamps.

Stage 04 must define a deterministic rule for choosing the appropriate historical row near the requested horizon.

The rule must:

- tolerate normal cadence drift;
- never fabricate missing history;
- remain simple;
- produce immutable references once persisted;
- be testable without wall-clock flakiness.

Potential rules such as nearest eligible row, nearest-at-or-before target, or bounded nearest match must be evaluated against actual collector timing evidence before one becomes normative.

## 10. Enrichment boundary

Enrichment occurs only after complete-cycle validation.

Preferred conceptual order:

~~~text
validated cycle
→ deterministic enrichment in memory
→ one coherent persistence transaction
→ commit success
→ publish notification / advance working state
~~~

This protects the existing invariant that provider/API/validation/storage failures do not create partial successful history/latest state.

If SnapshotId allocation requires data created during the IndexedDB transaction, the implementation must preserve the same all-or-nothing boundary.

## 11. Core enrichment semantics

MID is conceptually:

~~~text
(Bid1 + Ask1) / 2
~~~

Exact null/invalid behavior must follow verified provider contracts.

LAST change is conceptually:

~~~text
(current.Last - previous.Last) / previous.Last
~~~

No previous snapshot means null.

Deals delta is conceptually:

~~~text
current cumulative deals count - previous cumulative deals count
~~~

This becomes durable only after provider semantics are Verified.

## 12. Query architecture hypothesis

The normal live path must avoid scanning cumulative history by default.

Preferred shape:

~~~text
latest current universe
→ JS current-row filtering
→ JS current-row ranking
→ survivor SecurityIds
→ IndexedDB bySecurityTime range reads
→ JS aggregation / arbitrary reference lookups
→ final qualification and ranking
~~~

The benchmark must prove whether this remains fast when total history reaches millions of rows.

## 13. Index strategy rule

Indexes are added only for demonstrated query paths.

The existing history.bySecurityTime index is the primary reuse candidate for one-security + time-range queries.

Potential additional indexes must show measurable value greater than their write/storage cost.

Compare get, getAll, openCursor, IDBKeyRange and compound-key patterns where relevant rather than assuming cursor iteration is best.

## 14. Worker rule

A Web Worker is not part of the baseline architecture.

Use one only if measurement shows a meaningful main-thread problem that cannot be solved more simply.

## 15. SQL rule

Lack of SQL is not evidence that IndexedDB fails.

The decision separates:

~~~text
storage/query performance
from
developer/query ergonomics
~~~

A small analytical layer may be justified for maintainability even if IndexedDB remains fast. That is a different conclusion from storage-engine failure.

## 16. Recovery rule

Any rebuildable in-memory helper must be recoverable from IndexedDB after refresh/reopen.

The bootstrap should be bounded by the maximum temporal horizon, not by all historical data.

Recovery evidence must prove:

- no historical links are rewritten;
- only committed history participates;
- latest/history remain coherent;
- new snapshots after recovery resolve consistently under the chosen temporal semantics.

## 17. Evidence classification

Every major conclusion should be classified as Verified, Inferred or Unknown.

Performance claims are Verified only when measured in the relevant browser/workload.

## 18. Design success condition

The program succeeds when it can make an evidence-backed architecture decision while preserving a clear implementation path.

It does not require IndexedDB to win.

A useful negative result identifies exactly what failed and prevents an unnecessary full-stack rewrite when only one analytical responsibility needs replacement.
