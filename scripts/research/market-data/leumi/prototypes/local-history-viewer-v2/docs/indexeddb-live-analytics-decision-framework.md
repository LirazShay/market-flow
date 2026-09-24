# IndexedDB Live Analytics — Decision Framework

This document defines how the V2 evaluation turns benchmark evidence into an architecture decision.

It does not select an architecture in advance and contains no live status.

## 1. Allowed outcomes

### A. IndexedDB + JavaScript analytics

~~~text
browser collector
→ IndexedDB durable source of truth
→ JavaScript filtering/aggregation/ranking
~~~

Choose this only if measured workloads have sufficient headroom and query code remains maintainable enough.

### B. IndexedDB + small analytical layer

~~~text
browser collector
→ IndexedDB durable source of truth
→ optional analytical/query layer
~~~

Use this when IndexedDB storage/query primitives are fast enough but analytical/query ergonomics or a specific operation benefits from a focused additional engine.

The additional layer must not become a second competing durable truth source.

### C. Browser collector + localhost engine

~~~text
authenticated browser collector
→ localhost boundary
→ local service/database/analytical engine
~~~

Use this only when browser-local constraints are demonstrated by evidence or a required capability cannot be delivered safely and simply in-browser.

The browser remains responsible for authenticated provider collection unless a separate security/product decision changes that boundary.

## 2. Decision dimensions

Evaluate:

- data correctness and atomicity;
- write throughput;
- central live-query latency;
- scaling with cumulative history;
- recovery/reload behavior;
- memory/browser stability;
- storage footprint;
- query flexibility;
- developer ergonomics;
- operational complexity;
- testing complexity;
- security/credential boundary;
- migration cost;
- observability and diagnosability.

Correctness/data integrity/security outrank convenience.

## 3. Evidence rules

Every material claim is Verified, Inferred or Unknown.

Do not turn an inference into a numerical promise.

## 4. IndexedDB rejection gate

Do not reject IndexedDB because it is not SQL, because the database contains millions of rows, because another database is fashionable, because cursor syntax is inconvenient, or because localhost feels more scalable.

Reject or augment it only for a concrete failing requirement such as:

- measured central live path lacks adequate headroom;
- write/commit latency conflicts with sustained collection;
- targeted range queries degrade materially at required scale;
- browser memory/storage stability is unacceptable;
- required arbitrary analysis is unmaintainable even when runtime is fast;
- a browser capability boundary prevents a required feature.

The evidence must name the failing workload and magnitude.

## 5. Hybrid admission gate

A hybrid layer is justified only when it solves a specific measured or demonstrated problem.

Before adding one, define source-of-truth ownership, rebuild/recovery semantics, synchronization boundary, failure behavior, extra memory/storage cost and testing burden.

## 6. Local-backend admission gate

A localhost backend adds operational and security complexity.

Before selecting it, prove why this is insufficient:

~~~text
IndexedDB
+
bounded enrichment
+
targeted indexed reads
+
JavaScript analytics
~~~

If selected, keep provider credentials/session state in the authenticated browser unless there is a separate explicit requirement to move them.

## 7. Worker admission gate

A Worker is an optimization option, not an architecture requirement.

Add it only when profiling shows a current main-thread problem and the same contract cannot be met more simply.

## 8. Final decision record contents

The architecture conclusion must include:

1. decision question;
2. measured environment;
3. dataset sizes;
4. workload results;
5. correctness evidence;
6. bottlenecks;
7. Verified / Inferred / Unknown table;
8. selected minimum architecture;
9. rejected alternatives and why;
10. consequences/tradeoffs;
11. V2 spec impact;
12. next implementation plan.

If the decision is cross-cutting beyond this prototype, promote it to the repository decision area according to repository policy.

## 9. No forced winner

A conditional outcome is valid.

Example:

~~~text
IndexedDB is sufficient for live ingest/current-universe elimination/targeted one-hour history,
but a separate analytical layer is justified for ad-hoc query ergonomics.
~~~

The goal is the smallest architecture that satisfies the actual workload.
