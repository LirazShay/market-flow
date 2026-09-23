# AGENTS.md — Fast AI Operating Rules for Market Flow

This file is the **mandatory compact entry point** for any AI/agent working in this repository.

Goal: preserve correctness **without forcing a full-repository reread on every small continuation**.

The repository is the source of truth.

---

## 0. Fresh-chat entry point

When a chat starts without enough current context, do not guess which part of Market Flow is active.

Use:

~~~text
AGENTS.md
→ docs/project/workstreams.md
→ target workstream AI_CONTEXT.md
→ target workstream STATUS.json
→ HANDOFF.md if present/relevant
→ target files
→ relevant tests
~~~

If the user names a concrete workstream/path, you may go directly to that workstream after reading this file.

For "continue the project" with no more detail, docs/project/workstreams.md is the project-wide routing table.

The workstream-local STATUS.json is authoritative for the exact next implementation pointer.

Do not hardcode the currently active workstream into project-wide operating rules.

---

## 1. Choose the correct context depth

### Normal continuation inside an existing workstream

If the workstream contains:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

read only:

1. `AI_CONTEXT.md`
2. `STATUS.json`
3. files being changed
4. directly relevant tests

Do **not** reread the full project documentation by default.

### Escalate to broader context only when needed

Read wider project/design/docs when one of these is true:

- entering a new/different workstream;
- `AI_CONTEXT.md` / `STATUS.json` is missing or stale;
- changing architecture, schema, public behavior, or a durable decision;
- resolving a contradiction;
- re-verifying external API evidence;
- touching a cross-cutting project concern.

Then read only the relevant subset, such as:

~~~text
PROJECT_CONTEXT.md
docs/project/current-state.md
docs/project/decisions.md
relevant design/API docs
~~~

Do not mechanically read every project file.

---

## 2. Choose implementation scope naturally

When the user asks to continue existing work without naming a stage boundary, choose scope according to technical coherence and verification needs.

There is no default rule that one chat message must equal one substep or one stage.

A response may implement part of a substage, one full stage, or adjacent work when that is the most coherent verified unit.

Prefer:

~~~text
meaningful implementation + verification boundary
over
arbitrary numbering/message boundary
~~~

### Continuation command

When the user writes:

~~~text
תמשיך לשלב הבא
~~~

continue from the authoritative workstream `STATUS.json` / `ROADMAP.md` into the next planned work.

The user explicitly prefers natural engineering/verification boundaries. A single response does **not** have to complete an entire numbered stage.

It is valid to complete a coherent substep or part of a stage, verify it, update `STATUS.json`, and stop there.

Do not skip planned work or jump to an unrelated later stage.

The word:

~~~text
סיימתי
~~~

is reserved for the end of the full planned process/version the user asked to complete. Do not use it merely because a stage, checkpoint or mini-project finished.

---

## 3. Fast status files are operational state

For workstreams using fast context:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

Rules:

- `AI_CONTEXT.md` = compact human/AI working context.
- `STATUS.json` = machine-readable current pointer.
- update `STATUS.json` on normal implementation progress;
- update `AI_CONTEXT.md` only when current focus, invariants, or relevant working set changes;
- update `ROADMAP.md` only when scope/order/stage definitions change; operational completion belongs only in `STATUS.json`.

If fast context conflicts with a durable design/decision document:
1. inspect the authoritative document;
2. resolve the conflict;
3. update the fast context in the same work batch.

---

## 4. KISS — simplest sufficient design by default

Use the **simplest design that fully satisfies the current verified requirement**.

~~~text
current requirement + proven constraints
→ smallest coherent solution
→ verify
→ stop
~~~

Do not add complexity merely because it may be useful later.

Examples of complexity that require a concrete current need before introduction:

- new abstraction layers;
- generic frameworks or plugin systems;
- loaders/updaters/rollback machinery;
- generalized lifecycle/state machinery;
- extra persistence/cache layers;
- concurrency/parallelism;
- retry/recovery orchestration;
- extensibility points for hypothetical future consumers;
- migrations or compatibility layers that no current supported version requires.

Acceptable reasons to add complexity include:

- a current requirement cannot be met cleanly without it;
- an observed bug/failure requires it;
- measured performance/reliability evidence requires it;
- a repeated concept is stable enough that duplication is now causing real cost;
- correctness, data integrity, security, testability, or recoverability requires it.

Not acceptable by itself:

~~~text
"we may need this later"
"this is more enterprise"
"this is more flexible"
"let's make it generic now"
~~~

When choosing a more complex approach, be able to state the concrete present-day reason the simpler approach is insufficient.

KISS does **not** mean cutting required validation, tests, observability, security, or data-integrity guarantees. It means meeting those requirements with the minimum necessary machinery.

---

## 5. Testing policy

Tests should protect observable/public behavior, not private implementation details.

For new behavior, define the meaningful tests first whenever practical.

For a reproducible bug:

~~~text
regression test
→ fix
→ keep the regression test
~~~

Default testing pyramid:

~~~text
pure deterministic behavior
→ fast Node unit tests

browser semantics / integration
→ run the exact changed/new Playwright test in Chromium first
→ expand only when evidence/risk requires it
→ full Browser CI at every numbered Stage closure

real provider behavior
→ live verification only when required
~~~

Fast CI is the normal cheap feedback loop, but this browser-based workstream must not treat it as sufficient proof after code changes. Any production/runtime/browser code change requires Chromium verification on the final changed code state.

### Non-negotiable test-change gate

Checkpoint scheduling controls **when broad suites are run for unchanged tests**. It never permits an edited test to remain unexecuted.

If a test, test fixture, harness, or test helper is added or modified:

~~~text
change/add test
→ execute the smallest test target that proves that change

intentional TDD/regression red
→ confirm the exact target fails for the intended reason
→ implement/fix
→ rerun that exact target until green

unexpected red
→ stop
→ diagnose
→ fix
→ rerun the smallest relevant target
~~~

Rules:

- changed unit tests must be executed before continuing; targeted unit execution is preferred first, while the cheap Fast suite may still run normally;
- changed Playwright/browser tests must be executed in Chromium before continuing, **targeted to the exact changed/new test by default**;
- do **not** run the full Browser suite merely to prove an expected TDD red;
- an intentional red phase is complete when the targeted test fails for the intended behavior gap; that expected red does not block moving to implementation;
- after implementation/fix, the same targeted browser test must pass before widening verification;
- **any production/runtime/browser code change requires a Chromium run on the final changed code state**, even when no browser test file itself changed;
- for a small localized code change, the smallest relevant Chromium test/spec may satisfy the immediate code-change gate;
- for runtime assembly, shared harness/fixture, storage integration, messaging, viewer integration, cross-component behavior, or multi-area code changes, run the full Browser suite;
- widen from exact test → spec/related cluster when coupling, shared fixtures/harness, or evidence makes that useful;
- run the full Browser suite at required Stage/checkpoint boundaries and for broad/shared browser code risk; do not skip browser execution merely because the code previously matched a known-good design;
- if targeted browser execution is unavailable, do not substitute an expensive full suite solely to demonstrate an expected red; establish a targeted execution path or mark that proof pending;
- a planned later Browser checkpoint is **not** permission to leave newly added/modified browser tests unexecuted;
- an **unexpected** failing test, or a test still red after the supposed fix, blocks progression: inspect logs, decide whether product code or the test is wrong, fix, and rerun;
- if the required environment cannot be run, mark the work `verification-pending` in the workstream `STATUS.json` and stop before the next feature/substep;
- do not mark behavior verified from source inspection alone when its test layer has not run;
- verification evidence must identify the run and code/test state being claimed as verified.

This gate applies even when Fast CI is green.

### Mandatory Browser CI at every Stage closure

Before **any numbered Stage** is marked `complete`, the full Browser CI suite must pass against the final code/test state of that Stage.

~~~text
Stage implementation complete
→ Fast CI green
→ full Browser CI green
→ only then Stage = complete
~~~

Broad checkpoints remain useful as additional integration milestones, but they never replace this per-Stage Browser CI gate.

For non-trivial E2E/Playwright failures, follow the RCA/debugging method in:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/tests/E2E_DEBUGGING.md
~~~

For browser work:
- use real IndexedDB/DOM/BroadcastChannel where their semantics matter;
- mock Leumi endpoints with deterministic sanitized fixtures;
- never store Leumi session data/credentials in CI.

If a behavior can only be verified live, mark it:

~~~text
Live verification pending
~~~

Workstream-specific testing policy may further refine browser checkpoints.

---

## 6. Data correctness rules

Never silently accept partial/corrupt data.

Validate where relevant:

- requested count;
- received count;
- unique count;
- duplicates;
- missing IDs;
- response structure.

Preserve:

~~~text
null != 0 != ""
~~~

Do not guess unknown schema semantics.

Use:

~~~text
Verified
Inferred
Unknown
~~~

for material factual claims/evidence.

---

## 7. Preserve proven behavior and change safely

Before modifying something already verified:

- understand its observable behavior;
- keep that behavior unless intentionally changing it;
- prefer small changes over rewrites;
- add/extend tests when practical;
- create or strengthen a characterization/regression test before risky changes;
- prefer one behavior change at a time;
- separate behavior change from structural refactoring when practical;
- keep a nearby known-green checkpoint so regressions can be localized.

Do not introduce architecture/frameworks/abstractions without a demonstrated need.

Repository-wide Clean Code, design, refactoring, and safe-change rules live in:

~~~text
docs/project/engineering-practices.md
~~~

---

## 8. Documentation cadence

### Mandatory SPEC impact review

Every meaningful system change must review the relevant durable specifications before the work batch is considered complete.

Repository-wide policy:

~~~text
docs/project/specification-policy.md
~~~

Review specs when changing observable behavior, architecture, public APIs, data model/schema, transaction boundaries, integrity rules, lifecycle/state transitions, provider assumptions, messaging, UI/UX behavior, failure/recovery semantics, security/privacy boundaries, runtime delivery, or extension/reuse boundaries.

The outcome must be explicit in the work:

~~~text
No spec impact
or
affected specs updated/added/removed in the same coherent batch
~~~

If a new durable responsibility has no owning spec, create one when the responsibility is substantial enough to have its own contract/invariants/failure semantics.

If code/tests and a spec disagree, treat that as a coherence defect. Do not silently assume either side is authoritative; resolve intended behavior from evidence/design/decisions and update the affected artifacts together.

Specs must not duplicate live operational status. Current stage/substep, next pointer and current verification state still belong only in the workstream `STATUS.json`.

Do **not** update every document on every tiny implementation edit.

### Normal implementation batch

Usually update:

~~~text
code
tests
STATUS.json
~~~

### Meaningful stage boundary

Also update when useful:

~~~text
component README
AI_CONTEXT.md if focus/working set changed
~~~

Update `ROADMAP.md` only if the plan/scope/order itself changed.

### Durable project decision

Update both:

~~~text
docs/project/decisions/D-NNN.md
docs/project/decisions.md
~~~

### Documentation source-of-truth rule

Operational progress belongs **only** in the workstream `STATUS.json`.

Never copy current stage/substep, completion state, next pointer, or "latest verification" snapshots into:

~~~text
README.md
AI_CONTEXT.md
HANDOFF.md
NEXT_CHAT_PROMPT.md
docs/project/current-state.md
docs/project/workstreams.md
component README files
design/architecture docs
~~~

Those files may link to `STATUS.json` and may contain durable architecture/evidence, but not a live progress snapshot.

Historical stage/run narratives belong under an explicit history location such as `docs/history/`, not in a README that users may read as current.

The Fast unit suite contains a documentation source-of-truth guard; do not bypass it.

Code-specific documentation stays next to the code.
Cross-cutting/domain knowledge stays under `docs/`.

---

## 9. Security

Never commit:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- unnecessary private/personal data;
- sensitive raw dumps.

Use sanitized fixtures/examples.

---

## 10. Completion standard

A work batch is done when the relevant items are true:

- code/change is valid;
- available automated tests pass;
- every code change has the required Chromium verification on its final state; documentation-only changes are exempt;
- every added/modified test has been executed in its native test layer;
- no red test or unexecuted changed test is carried into the next implementation unit;
- if a numbered Stage is being closed, full Browser CI passed on that Stage's final state;
- live-only verification is explicitly marked pending when applicable;
- no known failure is hidden;
- integrity validations are present where needed;
- status/documentation is updated at the correct cadence;
- SPEC impact review is complete and affected specs are synchronized;
- repository remains in a clear state.

At the end, report briefly:

1. what changed;
2. files added/changed;
3. what was tested;
4. what remains pending/unknown.

---

## 11. Priority order

~~~text
Correctness / data integrity / security
→ Simplicity
→ Observability
→ Testability
→ Documentation
→ Speed
~~~

Efficiency matters, but not at the cost of data integrity.

---

## Detailed rules

For deeper guidance on:

- evidence classification;
- research vs production;
- testing philosophy;
- error handling;
- data-integrity assertions;
- documentation ownership;
- Leumi documentation map;
- schema discipline;
- logging;
- Definition of Done;

read:

~~~text
docs/project/ai-engineering-guidelines.md
~~~

Only read that file when the current task needs those details.
