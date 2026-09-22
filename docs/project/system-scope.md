# System Scope — Market Flow

מסמך זה מגדיר את גבולות המערכת ברמה גבוהה.

הוא אינו architecture specification ואינו קובע technologies.

---

## Vision

~~~text
Market Data
    ↓
Collection
    ↓
Storage / Historical Data
    ↓
Scanner
    ↓
Analysis / Derived Metrics
    ↓
Signals / Trading Logic
    ↓
Execution
    ↓
Orders / Positions
    ↓
UI / Monitoring
~~~

## Market Data

אחריות: sources, universe, quotes, trades/activity, field semantics, timestamps, availability, API limitations.

מצב:

~~~text
Active / researched for Leumi market data
~~~

## Collection

אחריות עתידית: polling/stream ingestion, batching, retries, validation, timing, rate/load control, collection health, schema drift detection.

מצב:

~~~text
Research PoC only
~~~

## Storage / History

אחריות עתידית: raw snapshots, normalized snapshots, retention, historical queries, time-series access, recovery, storage monitoring.

מצב:

~~~text
Not started
~~~

לא נבחרה database.

## Scanner

אחריות עתידית: screening, filters, ranking, time-window changes, activity/liquidity filters, configurable criteria.

מצב:

~~~text
Not started in this repository
~~~

## Analysis / Derived Metrics

אחריות עתידית: changes over time windows, trade-count deltas, volume deltas, spread, last-to-bid/ask, momentum/wave metrics.

מצב:

~~~text
Not started
~~~

## Signals / Trading Logic

אחריות עתידית: entry/exit conditions, momentum continuation/deterioration logic, explicit state machines where appropriate.

מצב:

~~~text
Not started
~~~

## Execution

אחריות עתידית: buy, sell, order creation/update/cancel, recovery, execution validation.

מצב:

~~~text
Not started in this repository
~~~

## Orders / Positions

אחריות עתידית: order state, fills, partial fills, positions, reconciliation.

מצב:

~~~text
Not started
~~~

## UI / Monitoring

אחריות עתידית: scanner table, filters/sorting, diagnostics, system health, errors, historical drill-down.

מצב:

~~~text
Only research browser table PoC exists
~~~

---

# Cross-cutting requirements

- correctness.
- observability.
- testability.
- documentation.
- resilience.
- clear errors.
- public-behavior tests.
- schema/data validation.
- no hidden failures.
- no secrets in repository.

---

# Non-decisions

המסמך לא קובע programming language, backend framework, frontend framework, database, message broker, hosting, deployment model, cloud provider או real-time architecture.

כל החלטה כזו צריכה להגיע מתוך צורך ממשי, להיבדק ולהירשם ב-decisions.md.
