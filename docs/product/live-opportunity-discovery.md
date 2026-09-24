# Live Opportunity Discovery — Product Direction and Initial Requirements

## Document role

This is an early **product-direction and requirements** document for Market Flow.

It is not:

- a technical implementation guide;
- a final architecture decision;
- a final trading formula;
- a V2-only component specification;
- a live status document.

The ideas here are broader than the current Local History Viewer V2 workstream and may affect future collection, storage/history, scanning, analysis/signals, ranking and UI workstreams.

The goal of this document is to preserve the product intent and the technical capabilities that the future platform must make possible, while leaving implementation choices open until they are measured and justified.

---

## 1. Product intent

The long-term capability under discussion is a live market-analysis engine that continuously evaluates the available security universe and identifies a very small set of securities whose current behavior best matches short-horizon opportunity criteria.

The present universe observed from the current provider is approximately 561 securities, but the design must not hardcode that size.

The desired operating style is short-horizon and live:

- repeated collection during the trading session;
- candidate evaluation every few seconds;
- expected holding/evaluation horizons measured in seconds to a small number of minutes;
- a final live result that will often contain only a handful of candidates, potentially 0–5 and sometimes one.

The exact entry/exit/trading formula is **not defined yet**.

The platform must first make it cheap and flexible to ask many different live questions about the data.

---

## 2. The system must support elimination as well as ranking

The intended future logic is not necessarily one monolithic score over the entire universe.

A major part of the decision process may be elimination:

~~~text
all securities
→ remove currently inactive securities
→ remove securities that fail recent-activity requirements
→ remove securities that fail short-horizon price behavior requirements
→ remove securities that fail historical-behavior requirements
→ rank the small surviving set
~~~

A security rejected now may become relevant again later when its activity changes.

Therefore filters are dynamic and are reevaluated repeatedly.

No specific thresholds are final yet.

Early examples discussed include:

- whether any trades occurred recently;
- at least some minimum number of trades in recent 2-minute / 5-minute windows;
- positive recent LAST movement;
- recent movement over 10s / 20s / 30s / 1m / 1.5m / 2m;
- evidence that the same security has already produced target-sized short moves recently.

These examples describe capabilities the platform should support, not a final strategy contract.

---

## 3. LIVE is the primary use case

Historical data exists mainly to support live decisions.

The desired flow is approximately:

~~~text
collect current market state
→ validate
→ enrich during ingest
→ persist
→ run live analytical query
→ filter / aggregate / HAVING / rank
→ return a small candidate set
~~~

A representative cadence under discussion is approximately every 5 seconds.

The exact cadence is not yet frozen, but the live query path must have substantial performance headroom and should not consume most of the collection interval.

---

## 4. Dynamic SQL-style analysis is a core capability

The final decision logic is intentionally unknown today.

Market Flow should make it possible to change live analytical logic without redesigning the collector every time.

The target capability is SQL-style expression over prepared market snapshots, including where useful:

~~~text
SELECT
JOIN
WHERE
GROUP BY
HAVING
ORDER BY
LIMIT
windowed/history conditions
cross-security ranking
~~~

Examples of questions the system should eventually support:

- which securities had at least N trades during a recent horizon;
- which securities rose during several recent horizons;
- which securities show increasing trade activity;
- which securities already demonstrated X% movement within two minutes several times during the last hour;
- which securities rank near the top of the universe on one or more current metrics;
- arbitrary comparisons between fields from the current snapshot and fields from earlier snapshots.

The exact database/query engine is still open.

---

## 5. Preserve the full snapshot

Every collected security snapshot should preserve the complete relevant provider record.

The system must not reduce history to only a small predefined set of derived metrics.

Conceptually:

~~~text
Snapshot
--------
Id
SecurityId
CollectedAt

full raw market fields
+
persisted derived fields
+
persistent temporal references
~~~

Keeping the full record is important because future analysis may compare fields that are not known to be important today.

Examples:

~~~text
ASK1 now vs BID1 earlier
BID2 now vs ASK3 earlier
LAST now vs an earlier ASK
changes in any other retained raw field
~~~

The raw historical row should exist once; other rows should reference it rather than copy all of its fields.

---

## 6. Every snapshot needs stable identity

Each persisted snapshot needs its own stable ID.

The ID is not only for storage identity. It also enables other persisted structures and later snapshots to refer directly to the exact historical row.

The canonical security identity remains a separate concern from snapshot identity.

A snapshot therefore has at least:

~~~text
SnapshotId
SecurityId
CollectedAt
...
~~~

---

## 7. Persistent temporal links per snapshot

A central requirement is that each snapshot can permanently reference the historical snapshot for the same security at several relative time horizons.

These are not only temporary links for the current live row.

Once a snapshot is stored, its historical references remain part of that snapshot's analytical context.

Current horizons:

~~~text
10 seconds
20 seconds
30 seconds
60 seconds
90 seconds
120 seconds
300 seconds
600 seconds
~~~

Equivalent names:

~~~text
10s
20s
30s
1m
1.5m
2m
5m
10m
~~~

Conceptually:

~~~text
Prev10sId
Prev20sId
Prev30sId
Prev60sId
Prev90sId
Prev120sId
Prev300sId
Prev600sId
~~~

The exact physical schema is still open. These may eventually be columns on the snapshot or represented through another efficient structure, but logically every historical snapshot must retain these relationships.

---

## 8. Horizon configuration may change later

The current eight horizons are important now but are not guaranteed to be permanent.

Future work may add or remove horizons.

Therefore the implementation should not scatter these values as unrelated magic numbers.

There should be a single clear definition of the active/core horizons used by ingest enrichment.

Performance remains more important than theoretical schema flexibility, so no decision has been made yet between a wide fixed schema and a more generic horizon representation.

---

## 9. Historical-link time semantics

The collector is expected to run at a stable cadence, but real collection timestamps may vary slightly.

The requirement is **not** millisecond-exact matching.

For a requested horizon such as 10 seconds, the system should use the appropriate collected snapshot nearest to that intended historical point when the small difference is simply the result of actual collection timing.

Example:

~~~text
target historical age: 10s
available relevant collection age: ~11s
→ use the available corresponding historical snapshot
~~~

The design should remain simple and should not become dominated by elaborate edge-case machinery for small cadence drift.

When the system has only just started and the required history does not exist at all, the relevant historical reference is naturally NULL.

Example after only ~40 seconds of runtime:

~~~text
10s  → available
20s  → available
30s  → available
60s  → NULL
90s  → NULL
120s → NULL
300s → NULL
600s → NULL
~~~

Missing history must not be fabricated.

---

## 10. Compute useful data during ingest

A major performance principle is:

> Prefer paying once during ingest for cheap, repeatedly useful calculations rather than recomputing the same basic metric in every live query.

The intended pattern is:

~~~text
compute once
→ persist once
→ read/filter many times
~~~

This is especially important because live evaluation will run repeatedly throughout the trading session.

---

## 11. LAST change by horizon is a core persisted metric

Price change relative to historical horizons is considered central to the intended analysis.

For each available horizon, the snapshot should be able to expose a precomputed LAST percentage change.

Current examples:

~~~text
LastChange10sPct
LastChange20sPct
LastChange30sPct
LastChange60sPct
LastChange90sPct
LastChange120sPct
LastChange300sPct
LastChange600sPct
~~~

Conceptually:

~~~text
(current.Last - historical.Last) / historical.Last
~~~

with the appropriate percent representation chosen consistently by the implementation.

If the required historical snapshot is unavailable, the corresponding derived metric is NULL.

---

## 12. Deals delta by horizon is a core persisted metric

Recent trade count is also a central signal.

Where the provider exposes a cumulative deal-count field with verified semantics, the system should precompute the difference between the current count and the historical count for each core horizon.

Current examples:

~~~text
DealsDelta10s
DealsDelta20s
DealsDelta30s
DealsDelta60s
DealsDelta90s
DealsDelta120s
DealsDelta300s
DealsDelta600s
~~~

Conceptually:

~~~text
current cumulative deal count
-
historical cumulative deal count
=
deals observed during the horizon
~~~

Provider field semantics must be verified before this becomes a production contract.

---

## 13. Other cheap same-row derived values

The platform may also persist cheap calculations that are likely to be useful repeatedly.

MID was explicitly discussed as an example:

~~~text
Mid = (Bid1 + Ask1) / 2
~~~

Other fields may be added later.

The rule is not "precompute everything."

The rule is:

~~~text
cheap
+
commonly useful
+
repeated in many live queries
→ strong candidate for ingest-time persistence
~~~

---

## 14. Do not precompute every possible cross-time combination

The system must retain analytical freedom.

It should not create permanent columns for every possible comparison such as:

~~~text
ASK1 now vs BID1 10s ago
ASK1 now vs BID2 30s ago
BID3 now vs ASK2 90s ago
...
~~~

That would create excessive duplication and schema growth.

Instead:

- preserve the full historical row once;
- preserve fast references to important historical rows;
- persist only high-value core metrics;
- compute unusual combinations dynamically through joins/queries.

This allows a future query to use any field from any linked historical snapshot.

---

## 15. Persisted metrics vs dynamic views/queries

The preferred evolution model is:

~~~text
new idea
→ test it dynamically in SQL / query / view
→ determine whether it is useful
→ measure its runtime cost
→ if it is repeatedly valuable and expensive
   promote it to an ingest-time persisted metric
~~~

A view is a tool, not an automatic performance solution.

If a view repeatedly performs expensive joins or calculations, the system may benefit from moving part of that computation to ingest.

No materialized-view strategy has been selected yet.

---

## 16. Live query should focus on decision logic

The desired live query path should spend most of its effort on:

~~~text
filter
compare
aggregate
HAVING
rank
~~~

rather than rebuilding basic facts that could already have been prepared.

A simple future query might conceptually look like:

~~~sql
WHERE LastChange30sPct > 0
  AND DealsDelta30s >= 3
  AND LastChange120sPct > 0

ORDER BY LastChange30sPct DESC
~~~

A more advanced future query may combine current metrics, linked historical rows and history aggregates.

The examples are illustrative only; thresholds and final rules remain undecided.

---

## 17. Historical capability of a security

The live decision may use not only what a security is doing now but also what it has demonstrated recently.

Example question:

> During the last hour, how many historical windows show that this security moved at least X% over two minutes?

Because each historical row can reference its own two-minute-previous row, a query can compare:

~~~text
historical row at T
vs
historical row referenced by T.Prev120sId
~~~

and aggregate over the last hour.

Conceptually:

~~~text
GROUP BY SecurityId
HAVING qualifying_window_count >= N
~~~

This is one reason temporal references must belong to every historical snapshot, not only the current live snapshot.

---

## 18. Qualifying windows are not automatically distinct waves

A known future analytical issue is that one real price wave may cause many consecutive snapshots to satisfy the same two-minute-change condition.

Therefore these are different concepts:

~~~text
number of qualifying snapshots/windows
!=
number of distinct waves/events
~~~

The platform should eventually support both if they prove useful.

The exact definition of a distinct wave is not part of this initial document.

---

## 19. Comparison against other securities

The engine may eventually evaluate a security not only against its own history but against the rest of the current universe.

Examples:

- rank of 30-second return;
- rank of recent deal activity;
- top X% by a metric;
- relative acceleration compared with the universe.

Cross-sectional ranking is part of the desired analytical capability, but no final ranking formula has been defined.

---

## 20. Ingest pipeline direction

A likely conceptual ingest flow is:

~~~text
provider response
→ validate complete collection
→ normalize full records
→ compute cheap same-row derived values
→ resolve core historical references
→ compute important persisted cross-time metrics
→ persist the successful cycle coherently
→ execute the current live analytical query
→ return ranked candidates
~~~

The exact implementation order may change after design and benchmarking.

Existing Market Flow integrity expectations remain relevant: do not silently accept partial/corrupt cycles and do not leave successful-cycle storage partially updated.

---

## 21. Performance is a first-class requirement

This feature is expected to operate continuously and live.

With approximately 561 securities and a representative 5-second cadence, ingestion is on the order of:

~~~text
561 × 12 cycles/minute
≈ 6,732 snapshot rows/minute
≈ 112 rows/second average
~~~

Over a trading day this becomes millions of historical snapshot rows.

The platform therefore needs deliberate performance design.

However, performance claims must be established by benchmark rather than intuition.

Important scenarios to benchmark later include:

- sustained ingest;
- resolving eight temporal references per new snapshot;
- persisted derived-metric computation;
- indexed joins from current/historical snapshots;
- queries over recent one-hour windows;
- GROUP BY / HAVING over historical rows;
- current-universe sorting/ranking;
- mixed ingest + query workload.

The live decision path should have substantial headroom relative to the collection cadence.

---

## 22. Avoid unnecessary repeated temporal searching

The product requirement favors persistent historical references specifically because repeatedly rediscovering the same relative historical row during every live query is wasteful.

The intended direction is:

~~~text
resolve historical relationship during ingest
→ retain the relationship
→ reuse it in future queries
~~~

Then an arbitrary query can join directly to the full referenced row.

Conceptually:

~~~sql
JOIN Snapshot old
  ON old.Id = current.Prev120sId
~~~

instead of repeatedly searching the historical timeline from scratch for the same relationship.

The final storage engine and index design remain open and must be benchmarked.

---

## 23. Full-row access remains important even with persisted metrics

Precomputed LastChange* and DealsDelta* do not replace the historical row.

Both are needed:

~~~text
persisted core metric
→ fast common live condition

persistent snapshot reference
→ arbitrary future comparisons
~~~

Example future comparisons may include:

~~~text
current ASK1 vs previous BID1
current BID1 vs previous ASK1
current BID2 vs historical ASK3
historical MID vs current LAST
~~~

without requiring those combinations to have been anticipated at ingest time.

---

## 24. Parallel enrichment is a possible optimization, not a current decision

Different securities in a completed provider cycle may allow independent enrichment work.

Parallel processing may therefore become useful.

But parallelism is not a requirement by itself.

Preferred process:

~~~text
simple correct implementation
→ benchmark
→ identify actual bottleneck
→ parallelize only where measured value justifies the complexity
~~~

---

## 25. SQL/query engine is not selected yet

No final choice has been made between:

- traditional relational SQL;
- analytical SQL engine;
- time-series oriented database;
- embedded/in-process database;
- a hybrid architecture.

The selection must follow from the workload, not the other way around.

Evaluation criteria should include at least:

- write throughput;
- update/insert transaction semantics;
- primary-key/index lookup latency;
- multi-join performance;
- GROUP BY / HAVING performance;
- recent-window scans;
- concurrent ingest and query behavior;
- operational complexity;
- integration complexity;
- storage footprint;
- ability to benchmark and observe latency.

---

## 26. Physical schema is not final

Several physical designs remain open.

Examples:

- temporal IDs directly on the snapshot row;
- temporal relationship data in a related structure;
- wide persisted metric columns;
- generic horizon/metric tables;
- a hybrid of fixed core horizons and dynamic analytical structures.

The logical product requirements in this document should be preserved regardless of which physical schema proves fastest and simplest.

---

## 27. Current core horizons and core metrics

Current horizons:

~~~text
10s
20s
30s
60s
90s
120s
300s
600s
~~~

Current likely persisted data for each horizon:

~~~text
historical snapshot reference
LAST percentage change
deals delta
~~~

Additional likely same-row persisted value:

~~~text
MID
~~~

This set is intentionally small enough to evolve.

---

## 28. Examples of future live filtering ideas

The following are ideas that motivated the platform requirements. They are **not yet final rules**:

- no recent trade activity may disqualify a security temporarily;
- at least 3 trades during 5 minutes;
- at least 2 trades during 2 minutes;
- positive price change over one or more short horizons;
- recent deals count increasing;
- historical evidence of several target-sized two-minute moves during the last hour;
- price moving consistently upward or at least not materially downward across selected recent observations;
- current behavior relative to the rest of the universe.

The product must make these kinds of ideas easy to test and change.

---

## 29. Candidate result

The live analytical layer should be able to return a very small ordered set.

Conceptually:

~~~text
0 candidates
1 candidate
or
a short ordered list such as 3–5 candidates
~~~

The system should not be forced to return a security when none satisfies the active query conditions.

The definition of ranking and minimum qualification remains open.

---

## 30. What this document deliberately does not decide

Not decided yet:

- final momentum/opportunity formula;
- final candidate score;
- weights;
- exact thresholds;
- final SQL/database engine;
- production technology stack;
- exact physical schema;
- exact distinct-wave definition;
- final ranking model;
- final collector cadence;
- entry logic;
- exit logic;
- execution integration;
- final UI.

These should be decided in later work only when requirements and evidence are strong enough.

---

## 31. Relationship to Local History Viewer V2

The current Local History Viewer V2 workstream is a practical place where some of these ideas may first be explored.

However this document is intentionally product-level.

Future V2 specifications should adopt only the portions that are deliberately selected for V2 implementation.

This document must not become a second V2 STATUS.json, ROADMAP.md, or implementation contract.

---

## 32. Relationship to future Market Flow scope

This direction can affect multiple future responsibilities:

~~~text
Market Data
→ Collection
→ Storage / History
→ Scanner
→ Analysis / Signals
→ Trading Logic
→ UI / Monitoring
~~~

For example:

- collection must provide stable, validated cycles;
- storage/history must preserve complete snapshots and efficient relationships;
- scanner/analysis must support fast dynamic filtering;
- ranking may consume both persisted and dynamic metrics;
- UI may later expose candidate results and query experimentation.

The product-level direction should therefore remain discoverable outside any one prototype directory.

---

## 33. Guiding principle

The strongest current principle is:

> Preserve rich historical data and prepare high-value repeated facts at ingest time, so live evaluation can spend its time deciding rather than reconstructing.

In compact form:

~~~text
full snapshots
+
persistent temporal references
+
persisted high-value core metrics
+
dynamic SQL-style filtering/aggregation/ranking
=
flexible low-latency live opportunity discovery
~~~

This is the current direction, not a frozen final architecture.
