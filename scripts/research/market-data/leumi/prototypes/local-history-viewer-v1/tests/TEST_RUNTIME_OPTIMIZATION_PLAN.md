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
