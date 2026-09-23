# AI Engineering Guidelines — Market Flow

This file contains the detailed engineering guidance intentionally removed from the compact root `AGENTS.md`.

Purpose:

~~~text
keep normal AI continuations fast
while preserving detailed rules on demand
~~~

Read `AGENTS.md` first. Read this document only when the current task touches the relevant topic or when the compact rules are insufficient.

---

# 1. Evidence classification

Never present an assumption as a verified fact.

Use three levels.

## Verified

Observed and checked in practice.

Example:

~~~text
GetSecuritiesData with 187 IDs
→ HTTP 200
→ 187 records
~~~

## Inferred

A reasoned conclusion from observed behavior that has not been directly proven.

Example:

~~~text
MapHeat2 appears to define the active universe/order for this page.
~~~

## Unknown

Not yet established.

Example:

~~~text
Exact cause of HTTP 403 above a certain request size.
~~~

When practical, record what would be required to turn an Inferred/Unknown item into Verified.

---

# 2. Research vs production

Research/browser probes belong under:

~~~text
scripts/research/
~~~

Production code belongs under:

~~~text
src/
~~~

Production automated tests belong under:

~~~text
tests/
~~~

Research code may contain:

- probes;
- recorders;
- reverse-engineering helpers;
- browser PoCs;
- exploratory tests.

Do not promote a research script directly into production without an explicit production design/refactor/testing step.

---

# 3. KISS / YAGNI operating rule

Default to the simplest solution that satisfies the **current** verified requirement and repository invariants.

Do not proactively build infrastructure for hypothetical future use.

Before introducing extra abstraction, generalized lifecycle, loader/updater, cache, concurrency, retry machinery, compatibility path, extension point, or additional state owner, require a concrete present-day reason.

Decision test:

~~~text
Can the current contract be met safely with a simpler design?
yes → use the simpler design
no  → add only the complexity needed to close the proven gap
~~~

Future possibility alone is not evidence.

If complexity is justified, record the reason in the relevant code/spec/decision context so a later engineer can understand why the simpler option was insufficient.

This principle never overrides:

- correctness;
- data integrity;
- security;
- atomicity;
- required observability;
- required testing/verification;
- recoverability that is part of the current contract.

The goal is not "less code at any cost". The goal is fewer moving parts while still meeting the real contract.

---

# 4. Testing philosophy

Tests should protect meaningful observable behavior.

Prefer:

- public behavior;
- inputs/outputs;
- HTTP/API contracts;
- integration boundaries;
- persisted state;
- user-visible behavior.

Avoid unnecessary coupling to:

- private helpers;
- internal implementation details;
- incidental file/function structure;
- details that may change during refactoring without changing behavior.

## Bug workflow

For a reproducible bug, when practical:

1. add a failing test that demonstrates the bug;
2. confirm failure;
3. establish the technical root cause;
4. ask what reasoning/process choice created the condition;
5. ask why existing safeguards did not catch it earlier;
6. implement the smallest correct fix;
7. confirm pass;
8. evaluate the smallest prevention and Learning Promotion Gate;
9. promote only generalizable lessons to the narrowest correct owner;
10. document material behavior/contract changes if needed.

Repository method:

~~~text
docs/project/continuous-improvement.md
~~~

Expected TDD red is not itself a failure-learning event.

---

# 5. Tests-first layered testing

For new behavior, define externally meaningful tests before implementation whenever practical.

For bugs, keep the regression test that reproduces the defect.

Default pyramid:

~~~text
pure deterministic behavior
→ fast Node unit tests

browser semantics / cross-component browser integration
→ exact changed/new Playwright test in Chromium first
→ widen only when coupling/evidence requires it
→ full Browser CI at every numbered Stage closure

real provider behavior
→ live verification only when required
~~~

Fast CI is the normal feedback loop.

Fast CI is cheap feedback, but browser-based production/runtime code changes still require Chromium verification on the final changed state. Documentation-only changes are exempt.

### Non-negotiable test-change gate

Checkpoint scheduling controls **when broad suites are run for unchanged tests**. It never permits an edited test to remain unexecuted.

If a test, test fixture, harness, or test helper is added or modified:

~~~text
change/add test
→ execute the smallest target that proves it

intentional TDD/regression red
→ exact target fails for intended reason
→ implement/fix
→ exact target green

unexpected red
→ stop
→ diagnose
→ targeted rerun
~~~

Rules:

- changed unit tests must be executed before continuing; prefer the exact/nearby unit target first, while cheap Fast CI may still run normally;
- changed Playwright/browser tests must be executed in Chromium before continuing, targeted to the exact changed/new test by default;
- do **not** run the full Browser suite merely to establish an expected TDD red;
- an intentional red that fails for the intended missing behavior is valid evidence and permits moving to implementation;
- after implementation/fix, rerun the same targeted test until green before widening;
- any production/runtime/browser code change requires Chromium verification on the final changed state, even if no Playwright file changed;
- small localized code changes may use the smallest relevant targeted Chromium test/spec;
- shared runtime/harness/storage/messaging/viewer integration, cross-component, or multi-area code changes require the full Browser suite;
- widen to a spec/related cluster when shared fixtures, harness, integration coupling, or observed evidence justify it;
- full Browser CI remains mandatory at Stage/checkpoint boundaries and for broad/shared browser risk;
- if targeted browser execution is unavailable, do not substitute a full expensive suite solely to demonstrate expected red; establish a targeted path or mark that proof pending;
- a planned later Browser checkpoint is **not** permission to leave newly added/modified browser tests unexecuted;
- an unexpected red, or a red that remains after the supposed fix, blocks progression;
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

For browser prototypes:

- exercise real IndexedDB where its transaction semantics matter;
- exercise real DOM/BroadcastChannel where practical;
- mock private/external APIs such as Leumi;
- keep fixtures deterministic;
- do not use real provider credentials/session state in GitHub Actions.

Node/Playwright as test tooling does **not** choose the production stack.

A feature that is automatable should have the appropriate layer of CI coverage before it is considered complete.

If the remaining proof requires the live provider, mark:

~~~text
Live verification pending
~~~

---

# 6. Error handling

Do not hide failures.

Avoid empty catch blocks unless there is a clear documented reason.

When an operation fails, provide useful context when relevant:

- component/step;
- endpoint/operation;
- HTTP status;
- expected vs actual;
- original safe error message.

Prefer stopping with a clear error over continuing with partial/corrupt state.

---

# 7. Data-integrity assertions

For collection/ingestion flows, validate when applicable:

~~~text
requested
received
unique
duplicates
missing
response structure
~~~

Do not treat “looks okay” as proof.

For full-cycle market snapshots, completeness checks belong before persistence.

---

# 8. Null/empty/value semantics

Never use a generic falsy fallback for market data when values may legitimately be zero.

Preserve distinctions such as:

~~~text
null
0
""
undefined
~~~

unless a documented normalization rule explicitly maps them.

---

# 9. Schema discipline

Do not infer a field type or meaning solely from its name.

When a new/changed API field appears:

- preserve a safe raw example when useful;
- inspect multiple samples when needed;
- document uncertainty;
- label semantics as Verified/Inferred/Unknown.

Do not silently invent defaults.

---

# 10. Preserve proven flows / safe change

Before changing a flow that already works:

1. understand the verified behavior;
2. preserve the observable contract unless intentionally changing it;
3. add validations/tests before broad refactors when practical;
4. prefer a small change over a rewrite;
5. add characterization tests when behavior exists but is insufficiently specified;
6. introduce seams around hard-to-test dependencies before changing deeply coupled behavior;
7. keep refactoring and behavior changes separate when practical;
8. stop on the first unexplained red test and localize it before continuing.

This is especially important for browser/research code where comparing with a proven version is valuable.

The authoritative project-wide Clean Code / design / refactoring / legacy-safe-change rules are in:

~~~text
docs/project/engineering-practices.md
~~~

---

# 11. Logging

Long-running components should emit enough information to reconstruct what happened.

Useful minimum:

- timestamp;
- component/step;
- operation;
- result;
- duration when relevant;
- error details on failure.

Do not flood logs with low-value noise.

Goal:

~~~text
traceability, not volume
~~~

---

# 12. Documentation ownership

Default:

~~~text
code-specific docs
→ next to code

cross-cutting/domain knowledge
→ docs/
~~~

Keep beside the code/test suite:

- run instructions;
- configuration;
- component-specific behavior;
- raw test reports;
- test fixtures documentation.

Keep under `docs/`:

- project architecture/context;
- durable decisions;
- API/domain semantics;
- cross-cutting conclusions.

Avoid maintaining duplicate manuals in two locations.

### Operational status ownership

For staged workstreams, only `STATUS.json` may contain live operational progress.

Do not duplicate current stage/substep, completion state, exact next pointer, or latest-verification snapshots into README/context/handoff/routing/design documents.

Allowed:

~~~text
"Operational progress: STATUS.json"
~~~

Forbidden outside `STATUS.json`:

~~~text
"Stages X–Y complete"
"Next: Stage Z"
"Current pointer: ..."
"Stage N is in progress"
~~~

Historical stage/run narratives belong under an explicitly historical location such as `docs/history/`.

A Fast unit guard enforces this rule for the Market Flow routing/context and Local History Viewer README/handoff/context surfaces.

---

# 13. Project navigation

Context loading is governed by:

~~~text
docs/project/context-loading.md
~~~

Default fresh-chat flow:

~~~text
AGENTS.md
→ identify workstream
→ workstream README.md
→ workstream STATUS.json
→ workstream AI_CONTEXT.md
→ task-specific files/tests/specs
~~~

Global/deep project documents such as `PROJECT_CONTEXT.md`, `current-state.md`, `decisions.md` and repository/design docs are WARM/COLD context. Read them only when the task crosses boundaries, changes durable context, or compact context is insufficient.

Historical evidence stays discoverable under workstream/project history locations but is not preloaded.

---

# 14. Leumi documentation map

Durable Leumi API knowledge:

~~~text
docs/leumi-api/
~~~

Common files:

~~~text
overview/api-flow.md
overview/api-usage-guide.md
endpoints/mapheat2.md
endpoints/get-securities-data.md
fields/field-reference-he.md
fields/field-availability.md
samples/
~~~

Concrete script instructions and raw run reports stay under:

~~~text
scripts/research/market-data/leumi/
~~~

---

# 15. Security and secrets

Never commit:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- unnecessary personal/private data;
- full raw dumps that may contain sensitive content.

Examples/fixtures should be minimized and sanitized.

---

# 16. Natural implementation sizing

The project uses incremental development, but chat-message boundaries must not dictate engineering boundaries.

There is no default preset rule such as "one substep per message" or a fixed number of adjacent substeps.

Choose scope based on the work itself.

When the user explicitly writes `תמשיך לשלב הבא`, continue into the next planned work from the authoritative status/roadmap, but still choose a natural implementation + verification boundary. The user does not require a whole numbered stage to fit in one response.

A good implementation unit:

- has a coherent objective;
- can be verified meaningfully;
- does not require user feedback in the middle;
- leaves the repository in a clear state;
- remains understandable and reviewable.

It may be smaller than a numbered substage, equal to a full stage, or span several adjacent stages when they naturally belong together.

Do not combine unrelated architecture, storage, polling, and UI work merely to reduce message count.

---

# 17. Status/documentation update cadence

## Every normal implementation batch

Usually:

~~~text
code
tests
STATUS.json
~~~

## At a meaningful substage/stage boundary

Also when useful:

~~~text
component README
AI_CONTEXT.md if focus changed
~~~

Update `ROADMAP.md` only when scope/order/stage definitions changed.

## Only for durable decisions

~~~text
docs/project/decisions/D-NNN.md
docs/project/decisions.md
~~~

## Only for meaningful project milestones

~~~text
docs/project/current-state.md
~~~

This rule exists to prevent documentation churn and unnecessary Git/tool round-trips.

---

# 18. Definition of Done

Apply only the checklist items relevant to the current natural work unit.

- [ ] code/change is syntactically/executably valid;
- [ ] the design is the simplest coherent solution for the current verified requirement;
- [ ] added complexity has a concrete present-day justification;
- [ ] automated tests pass where available;
- [ ] every production/runtime/browser code change received Chromium verification on its final state;
- [ ] every added/modified test was executed in its native layer after its final edit;
- [ ] no known red test is deferred to a later stage;
- [ ] if closing a numbered Stage, full Browser CI passed on that Stage's final state;
- [ ] live-only verification is marked pending where required;
- [ ] no known failure is hidden;
- [ ] meaningful unexpected failures were reviewed for technical cause, reasoning/process cause, escape cause and prevention;
- [ ] reusable lessons were promoted appropriately without creating instruction churn;
- [ ] integrity validations exist where needed;
- [ ] documentation/status updated at the correct cadence;
- [ ] material facts are labeled Verified/Inferred/Unknown;
- [ ] no secrets introduced;
- [ ] repository remains in a clear, recoverable state.

---

# 19. Completion reporting

At the end of a work batch, report briefly:

1. what changed;
2. files added/changed;
3. what was tested;
4. what remains Unknown/Pending.

Do not automatically execute the next unrelated work batch unless the user requested it.

---

# 20. Priority order

~~~text
Correctness / data integrity / security
→ Simplicity
→ Observability
→ Testability
→ Documentation
→ Speed
~~~

The purpose of the fast-context structure is to improve speed **without weakening the earlier priorities**.
