# Stage 20 V1 Freeze Report — 2026-09-23

This is cold historical verification evidence for the Local History Viewer V1 freeze.

Current operational status remains authoritative in:

~~~text
../../../STATUS.json
~~~

## Freeze scope

Stage 20 froze the V1 workstream after:

- stable README / known-limitations cleanup;
- durable `VERSION = V1` marker;
- Browser CI runtime optimization without reducing coverage;
- cleanup of temporary optimization planning material into cold history;
- final Fast CI and full Chromium closure gates.

No V2 feature was added during the freeze.

## Test-runtime optimization result

Original Browser CI baseline:

~~~text
Playwright suite: ~39.0s
browser-tests job: ~67s
full workflow with publication: ~90s
~~~

Durable optimized configuration:

~~~text
runner: ubuntu-24.04
Playwright Chromium cache: enabled
workers: 2
retries: 0
browser tests retained: 56
storage-growth sample reduction: none
publish_runtime default: false
~~~

Observed optimized verification range:

~~~text
Playwright suite: ~24-28s
browser-tests job: ~39-47s
ordinary verification workflow: ~46-51s
~~~

Historical optimization detail:

~~~text
../test-runtime-optimization/2026-09-23-browser-ci-optimization.md
~~~

## Final Browser closure incident

First Stage 20 closure Browser CI:

~~~text
run: 35869228422
result: 55 passed / 1 failed
failing test: debug-bundle.spec.js
failure: IndexedDB deleteDatabase() blocked during end-of-test cleanup
~~~

The Debug Bundle assertions themselves had already passed. The failure occurred only during teardown.

### Worker-isolation review

The suite uses Playwright's ordinary built-in `page` fixture and does not configure shared `storageState`, custom shared BrowserContexts, or manual context reuse.

Each test therefore receives an isolated BrowserContext/IndexedDB storage partition.

A targeted pre-fix diagnostic run repeated the same Debug Bundle test ten times using `workers=2`:

~~~text
run: 35869664692
result: 10 / 10 passed
~~~

This evidence rejected the hypothesis that two workers were concurrently writing the same IndexedDB database.

### Failure Review

Technical root cause:

- the test explicitly called `indexedDB.deleteDatabase()` at the end of an otherwise isolated Playwright test;
- a Viewer DB read that had already started could still own a short-lived IndexedDB connection even after recorder stop and viewer close;
- `deleteDatabase.onblocked` was treated as a test failure even though the tested Debug Bundle behavior was already correct.

Reasoning/process cause:

- teardown assumed that `stop + closeViewer` implied global quiescence of every async DB operation already started by the Viewer.

Escape cause:

- the timing window did not surface in earlier successful runs;
- `workers=2` increased scheduling/timing variance and exposed the latent teardown assumption, but did not create shared IndexedDB state.

Smallest prevention:

- for ordinary tests using Playwright's isolated BrowserContext, let BrowserContext teardown own final storage cleanup;
- use explicit `deleteDatabase()` only for a reset required inside the same context or when deletion/blocking itself is the behavior under test;
- when explicit deletion is required, close known owners and await their semantic completion rather than adding sleeps/retries.

Learning promotion:

~~~text
tests/E2E_DEBUGGING.md
→ IndexedDB teardown ownership
~~~

The lesson is workstream-wide browser-testing guidance, not a repository-global rule.

SPEC impact review:

~~~text
No spec impact.
~~~

The fix changed test teardown only; production/runtime behavior was unchanged.

## Verification after the fix

Targeted final test verification:

~~~text
run: 35869937371
debug-bundle.spec.js --repeat-each=10
workers: 2
result: 10 / 10 passed
~~~

Final full Browser CI:

~~~text
run: 35870035162
workers: 2
tests: 56 / 56 passed
Playwright suite: 24.9s
publish_runtime: skipped
~~~

The temporary push trigger and targeted diagnostic command were removed after verification. The durable workflow returned to:

~~~text
workflow_dispatch
workflow_call
~~~

with ordinary full Browser verification using `publish_runtime=false` by default.

## Freeze result

V1 keeps the verified architecture and explicit limitations documented in the workstream README/specs.

The Stage 20 freeze does not claim that external provider behavior is permanent. It freezes the repository's V1 implementation, contracts, verification evidence and delivery process at this checkpoint.
