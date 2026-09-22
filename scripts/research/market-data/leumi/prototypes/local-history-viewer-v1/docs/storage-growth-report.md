# Storage Growth Report — Local History Viewer V1

This report records the reproducible Stage 18 Chromium/IndexedDB storage-growth benchmark.

It is a durable measurement report, not live project status. Current progress remains in `../STATUS.json`.

---

## 1. Question

Stage 18 measures:

~~~text
rows/minute
MiB/minute
effective bytes/history-row
estimated hours at current browser quota
~~~

V1 still has:

~~~text
no automatic retention
~~~

No retention threshold is introduced by this report.

---

## 2. Measurement method

The benchmark is implemented in:

~~~text
../tests/automation/specs/storage-growth.spec.js
~~~

It uses the real V1 persistence path:

~~~text
startSession
→ warm-up successful cycle
→ baseline navigator.storage.estimate()
→ 20 additional successful cycles
→ final navigator.storage.estimate()
→ exact IndexedDB history count
~~~

The benchmark runs in Chromium with the real V1 IndexedDB schema and `commitSuccessfulCycle()`.

### Payload

Each synthetic security preserves the shape of the sanitized representative full `GetSecuritiesData` record in:

~~~text
../../../../../../../docs/leumi-api/samples/get-securities-data-record.json
~~~

Only identity/rate values are varied to produce distinct canonical securities.

This avoids using the tiny four-security unit-test payload as a storage proxy.

### Benchmark scenario

~~~text
security count       = 561
chunk size           = 187
measured cycles      = 20
warm-up cycles       = 1
average cycle time   = 4.986 seconds
~~~

The 561 / 4.986-second values reproduce the previously verified recorder run documented in `data-model.md`.

They are **benchmark inputs only**. They are not production hardcoded universe limits; runtime code remains universe-size agnostic.

### Why warm up first

The warm-up cycle establishes:

- schema/session state;
- a populated `latest` store;
- the first history snapshot.

The measured delta therefore better represents steady-state history growth instead of first-run database creation cost.

### What "bytes/history-row" means here

The reported value is an **effective incremental byte cost per added history row**:

~~~text
storage usage delta
÷
new history rows
~~~

It therefore includes small per-cycle overhead and steady-state `latest/meta/cycles` churn in addition to the history record itself.

That is intentional: it better approximates real recorder growth than serializing one JavaScript object.

---

## 3. Raw Chromium runs

All three runs used the same benchmark code/test state.

| Run attempt | Rows added | Storage delta | Effective bytes/history-row | Growth | Runner quota | Hours to runner quota |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 11,220 | 5,703,617 B (5.439 MiB) | 508.34 B | 3.273 MiB/min | 835.48 MiB | 4.223 h |
| 2 | 11,220 | 5,545,506 B (5.289 MiB) | 494.25 B | 3.182 MiB/min | 811.72 MiB | 4.220 h |
| 3 | 11,220 | 5,980,116 B (5.703 MiB) | 532.99 B | 3.431 MiB/min | 1,052.16 MiB | 5.080 h |

GitHub Actions run:

~~~text
35783084785
~~~

Attempts:

~~~text
1
2
3
~~~

All three attempts passed.

---

## 4. Aggregate result

### Verified in Chromium

Across the three runs:

~~~text
effective bytes/history-row:
min     494.25 B
median  508.34 B
max     532.99 B
mean    511.86 B
~~~

Storage growth for 11,220 new history rows:

~~~text
5.289–5.703 MiB
~~~

The benchmark also verified exact row accumulation:

~~~text
history before = 561
rows added      = 11,220
history after  = 11,781
~~~

No history rows were automatically retained or deleted.

### Derived from verified benchmark inputs

Using:

~~~text
average cycle = 4.986 sec
rows/cycle    = 561
~~~

gives:

~~~text
cycles/minute ≈ 12.0337
rows/minute   ≈ 6,750.90
rows/hour     ≈ 405,054
~~~

Combining that rate with the measured effective byte range:

~~~text
growth:
3.18–3.43 MiB/min

median:
~3.27 MiB/min
~196.37 MiB/hour
~~~

---

## 5. Capacity estimate

The benchmark computes:

~~~text
free browser quota
÷
measured bytes/minute
~~~

The GitHub Chromium runners produced:

~~~text
~4.22–5.08 hours until their reported quota
~~~

This is **not** a prediction for the user's browser.

The runner quota itself varied materially between attempts:

~~~text
~812 MiB
to
~1,052 MiB
~~~

Therefore the useful portable result is the measured growth rate, not the CI runner's absolute hours-to-quota number.

For a real browser, the same calculation should use that browser's live:

~~~text
navigator.storage.estimate()
~~~

which is already exposed by V1 diagnostics.

---

## 6. Verified / Inferred / Unknown

### Verified

- Chromium persisted the real V1 row shape through the real V1 transaction path.
- 20 measured cycles added exactly 11,220 history rows.
- Effective incremental cost was 494.25–532.99 bytes/history-row across three runs.
- Median measured growth was about 3.27 MiB/min for the benchmark scenario.
- No automatic retention occurred.
- Storage quota reported by Chromium is environment-specific.

### Inferred / derived

- ~6,750.90 rows/minute is derived from the previously verified 4.986-second cycle and 561-row universe.
- ~3.18–3.43 MiB/min combines that derived row rate with measured bytes/history-row.
- ~196 MiB/hour is the median extrapolation, not a long-run disk measurement.

### Unknown until Stage 19 live/long-run verification

- the exact live Leumi distribution of record sizes across the whole universe;
- whether future API fields materially increase/decrease average record size;
- the user's actual browser quota during a real recording session;
- long-run IndexedDB/LevelDB fragmentation/compaction behavior;
- whether multi-hour growth remains linear at the short-run benchmark rate.

---

## 7. Decision for V1

Stage 18 does **not** introduce automatic retention.

The evidence shows storage growth is large enough to monitor explicitly, but retention remains intentionally outside V1.

~~~text
V1:
complete raw history
+ diagnostics
+ explicit user control
+ no silent deletion
~~~

Stage 19 should compare this CI benchmark with real-browser and long-run evidence before any future retention policy is designed.
