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

## 4. Testing policy

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
→ Playwright + Chromium immediately when browser behavior/tests change
→ full Browser CI at every numbered Stage closure

real provider behavior
→ live verification only when required
~~~

Fast CI is the normal feedback loop. Browser CI is intentionally sparse for ordinary changes that do not modify browser tests or require browser-only proof.

### Non-negotiable test-change gate

Checkpoint scheduling controls **when broad suites are run for unchanged tests**. It never permits an edited test to remain unexecuted.

If a test, test fixture, harness, or test helper is added or modified:

~~~text
change test
→ execute that test in its real layer immediately
→ fix every failure
→ rerun until green
→ only then continue to the next implementation unit
~~~

Rules:

- changed unit tests must be executed before continuing;
- changed Playwright/browser tests must be executed in Chromium before continuing;
- if targeted browser execution is unavailable in CI, run the Browser suite rather than defer the changed test;
- a planned later Browser checkpoint is **not** permission to leave newly added/modified browser tests unexecuted;
- a failing test blocks progression: inspect logs, decide whether product code or the test is wrong, fix, and rerun;
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

## 5. Data correctness rules

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

## 6. Preserve proven behavior and change safely

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

## 7. Documentation cadence

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

## 8. Security

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

## 9. Completion standard

A work batch is done when the relevant items are true:

- code/change is valid;
- available automated tests pass;
- every added/modified test has been executed in its native test layer;
- no red test or unexecuted changed test is carried into the next implementation unit;
- if a numbered Stage is being closed, full Browser CI passed on that Stage's final state;
- live-only verification is explicitly marked pending when applicable;
- no known failure is hidden;
- integrity validations are present where needed;
- status/documentation is updated at the correct cadence;
- repository remains in a clear state.

At the end, report briefly:

1. what changed;
2. files added/changed;
3. what was tested;
4. what remains pending/unknown.

---

## 10. Priority order

~~~text
Correctness
→ Observability
→ Testability
→ Documentation
→ Simplicity
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
