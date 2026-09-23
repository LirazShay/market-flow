# Browser Test Runtime Optimization Plan

This plan belongs to the Stage 20 V1-freeze mini-project.

Operational progress remains only in:

~~~text
../STATUS.json
~~~

The goal is to reduce elapsed CI/test time without weakening behavioral coverage, changing production behavior, or replacing required Chromium verification with cheaper-but-invalid substitutes.

## Baseline

Reference Browser CI:

~~~text
run: 35862723542
result: 56 / 56 passed
workflow elapsed: about 90 seconds
browser-tests job: about 67 seconds
Playwright-reported suite: 39.0 seconds
~~~

Observed major costs:

~~~text
npm install                    ~3s
Playwright Chromium + deps    ~20s
runtime build + browser suite ~40s
rolling release publication   additional post-test latency
~~~

The largest individual browser test in that run was:

~~~text
storage-growth.spec.js
~12 seconds
~~~

These numbers are baseline evidence, not permanent targets.

## Optimization principles

1. Preserve public/observable coverage.
2. Do not move browser-semantic tests to Node merely to make CI faster.
3. Do not remove failure/integrity coverage.
4. Prefer eliminating setup/repetition before weakening test depth.
5. Change one performance dimension at a time and measure it.
6. Every browser-test/harness/config change must be verified in Chromium.
7. A speed improvement is accepted only if repeated runs remain green.
8. Keep the simplest configuration that produces a material measured benefit.

## Phase A — Baseline and classification

### A1 — Restore Fast CI

Close the current freeze-documentation guard failures first.

### A2 — Classify wall-clock cost

Separate:

- runner/action startup;
- dependency installation;
- Chromium/system-dependency setup;
- runtime build;
- Playwright suite;
- artifact upload;
- rolling release publication.

### A3 — Classify browser tests

For each expensive area determine whether it is:

- ordinary correctness coverage;
- browser integration coverage;
- measurement/benchmark coverage;
- release/publication work.

No test moves layers unless its actual contract permits it.

## Phase B — Setup optimization

### B1 — Deterministic dependency install

Evaluate whether a lockfile + `npm ci` improves determinism/runtime enough to justify the repository change.

### B2 — Playwright browser caching

Evaluate caching the Playwright Chromium binary using a versioned cache key.

System dependencies must remain reliable; cache optimization must not assume unavailable libraries.

### B3 — Avoid redundant browser installation work

Measure warm-cache behavior before making additional setup changes.

Acceptance:

- no loss of browser compatibility;
- clean/cold runner still works;
- repeated CI materially reduces setup time.

## Phase C — Suite execution optimization

### C1 — Parallel-safety audit

Inspect browser fixtures/tests for:

- shared server-side mutable state;
- shared filesystem state;
- cross-test IndexedDB assumptions;
- fixed global resources;
- ordering dependencies.

### C2 — Controlled worker benchmark

Benchmark only configurations proven safe, for example:

~~~text
workers = 1  (baseline)
workers = 2
~~~

Do not jump to high worker counts on a small CI runner.

### C3 — Repeatability check

The faster configuration must pass multiple full-suite runs.

If parallelism exposes hidden coupling, fix the coupling only when it is a real test-isolation defect; otherwise retain the safer worker count.

## Phase D — Expensive-test review

### D1 — storage-growth characterization

Determine why the Stage 18 storage-growth test takes ~12 seconds:

- actual required IndexedDB volume;
- artificial waits;
- repeated setup;
- benchmark sample size.

### D2 — Preserve measurement validity

If sample size can be reduced, prove that the measured contract remains meaningful.

Do not convert the storage benchmark into a trivial smoke test.

### D3 — Checkpoint classification

Evaluate whether benchmark-style coverage belongs in every ordinary full Browser CI or in an explicit benchmark checkpoint while preserving the repository's numbered-Stage closure requirements.

Any policy change must update `TESTING_POLICY.md` explicitly; do not silently skip tests.

## Phase E — Release-path latency

### E1 — Separate verification latency from publication latency

The browser test result should not wait on unrelated release work unless publication is part of the requested checkpoint.

### E2 — Simplest safe publication model

Evaluate either:

- optional publication input on Browser CI; or
- a separate publish workflow triggered only after a verified run.

Prefer the lower-complexity option.

The rolling release must still only contain artifacts from successful full Browser CI.

## Phase F — Final verification and freeze

Required before accepting the optimization:

- Fast CI green;
- optimized full Browser CI green;
- at least one repeated full Browser CI green for flake confidence if concurrency/cache behavior changed;
- timing comparison against the baseline;
- no coverage/policy/spec contradiction;
- temporary benchmark/CI scaffolding removed.

Only then resume the final Stage 20 freeze.

## Success criteria

Primary:

~~~text
material reduction in elapsed developer wait time
without reducing required coverage
~~~

Secondary target:

~~~text
aim for comfortably below the current ~90s verification path
~~~

No arbitrary target justifies unsafe test deletion or hidden skipping.

## Phase A findings

Baseline evidence from Browser CI run `35862723542`:

| Cost area | Observed elapsed |
|---|---:|
| npm dependency install | ~3s |
| `playwright install --with-deps chromium` | ~20.6s |
| runtime build + Playwright command | ~40.2s |
| Playwright-reported 56-test suite | 39.0s |
| `storage-growth.spec.js` alone | ~12.2s |
| browser-tests job overall | ~67s |
| end-to-end workflow including rolling publication | ~90s |

Setup observation:

- the Chromium setup step runs apt/dependency work on every fresh runner;
- it also downloads a Playwright Chromium Headless Shell of about 104 MB;
- this is the largest non-test cost and is the first low-risk optimization target.

Suite-isolation audit:

- no `test.describe.serial`;
- no `beforeAll` / `afterAll` ordering dependency;
- no browser spec writes shared repository files;
- the local HTTP server is static/read-only;
- Playwright creates isolated browser contexts for ordinary tests, so IndexedDB state is isolated between tests;
- no browser spec depends on shared `process.env` mutation.

Result:

- a controlled `workers=2` experiment is technically reasonable;
- it is not yet accepted and must be benchmarked/repeated before becoming the default.

Storage-growth observation:

- benchmark sample = 20 measured cycles × 561 securities = 11,220 added history rows;
- the test also intentionally waits for repeated `navigator.storage.estimate()` stabilization;
- most of its ~12s runtime is meaningful IndexedDB volume work, not a single accidental sleep;
- sample-size reduction therefore needs measurement-validity evidence before any change.

Optimization order chosen from the evidence:

~~~text
Phase B: reduce repeated Chromium/setup cost
→ Phase C: benchmark safe worker parallelism
→ Phase D: review storage-growth sample cost
→ Phase E: remove rolling-release publication from ordinary verification critical path if useful
→ Phase F: repeated full verification + timing comparison
~~~

This order attacks overhead first and avoids weakening tests prematurely.


## Phase B cold-run findings

Browser CI run `35865004148` verified the setup change on a fresh hosted runner:

~~~text
result: 56 / 56 passed
runner: ubuntu-24.04
Playwright suite: 38.0s
browser-tests job: about 57s
cache state: miss
~~~

Cold setup behavior:

- `npm install` remained about 2–3s;
- the Playwright cache lookup was a miss as expected;
- `npx playwright install chromium` downloaded the browser binaries without running the previous apt-heavy `--with-deps` path;
- the full Chromium suite launched successfully, proving the pinned `ubuntu-24.04` hosted image provides the runtime libraries required by this test suite;
- the successful run saved the versioned Playwright browser cache for the next run.

Compared with the ~67s baseline browser-test job, the cold path improved by about 10s even before a cache hit.

### Dependency-install decision

A lockfile + `npm ci` was evaluated as a possible setup optimization, but dependency installation is only about 2–3s in the measured runs. It is not the material runtime bottleneck for this mini-project, so Phase B does not add lockfile complexity solely for speed.

Direct test-tool versions remain exact in `package.json`. Any future lockfile decision belongs to dependency/reproducibility maintenance rather than being justified as a meaningful Browser CI speed optimization.

### Flake found during the first cold experiment

The first cold experiment run `35864772837` produced:

~~~text
55 passed / 1 failed
viewer-live-refresh refreshCount expected >= 1, received 0
~~~

RCA showed a test-synchronization race:

- the test waited for the rendered security count;
- the rendered table becomes observable before `executeRefresh()` completes all detail/diagnostic work;
- `refreshCount` increments only at the end of that refresh;
- the assertion could therefore observe the correct DOM while the semantic refresh completion counter was still zero.

Fix:

- wait on `refreshCount >= 1` as the actual completion condition;
- no fixed sleep was added;
- production/runtime behavior was unchanged.

The corrected full cold run passed 56/56.

### Warm-run gate

Phase B is not accepted from the cold result alone.

The next run must demonstrate:

- cache hit;
- full 56-test Chromium success;
- lower setup/job elapsed time than the cold path;
- no change to workers or storage-growth coverage.


## Phase B warm-run findings

Browser CI run `35865194288` exercised the same setup on a fresh hosted runner after the browser cache had been populated:

~~~text
result: 56 / 56 passed
runner: ubuntu-24.04
cache state: hit
Playwright suite: 36.5s
browser-tests job: about 48s
end-to-end workflow including publication: about 67s
~~~

The cache was restored successfully and the subsequent:

~~~text
npx playwright install chromium
~~~

completed in under one second because the matching Playwright browser binaries were already present.

Measured comparison:

| Path | Baseline | Phase B | Approx. improvement |
|---|---:|---:|---:|
| browser-tests job, warm cache | ~67s | ~48s | ~19s / ~28% |
| full workflow incl. publication | ~90s | ~67s | ~23s / ~26% |
| corrected cold browser-tests job | ~67s | ~57s | ~10s / ~15% |

Phase B therefore keeps the following durable setup:

- pin Browser CI to `ubuntu-24.04`;
- cache `~/.cache/ms-playwright` with a key derived from the pinned test-tool package definition;
- use `npx playwright install chromium` instead of reinstalling OS dependencies with `--with-deps` on every run;
- keep all 56 browser tests, `workers=1`, and the Stage 18 storage-growth benchmark unchanged.

The temporary `push` trigger used only to produce cold/warm benchmark runs was removed after measurement.

Phase B acceptance:

~~~text
cold full Chromium run: 35865004148 — 56/56
warm full Chromium run: 35865194288 — 56/56
coverage removed: none
worker count changed: no
storage-growth changed: no
production/runtime behavior changed: no
~~~

Result:

- setup optimization is accepted;
- the next isolated experiment is Phase C controlled worker parallelism.
