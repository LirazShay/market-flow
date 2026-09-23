# Engineering Practices — Market Flow

This is the durable repository-wide code-quality, design, refactoring, and safe-change policy.

It is influenced by established refactoring and legacy-code practices associated with Martin Fowler, Michael Feathers, and the broader Clean Code / evolutionary-design tradition. It translates those ideas into concrete rules for this repository.

The objective is not merely code that works today. The objective is a system that stays understandable, testable, recoverable, and safe to change.

---

# 1. Core objective

~~~text
correct behavior
→ easy verification
→ easy diagnosis
→ safe change
→ clear design
→ maintainability
→ delivery speed
~~~

Speed is valuable only while the repository remains healthy.

---

# 2. KISS and complexity budget

The default design rule is:

~~~text
solve today's verified problem
with the smallest coherent mechanism
that preserves correctness and required guarantees
~~~

Complexity is a cost and must be justified by a current need.

Before adding an abstraction, framework, generalized lifecycle, extra state layer, loader/updater, cache, concurrency, retry orchestration, compatibility layer, or future-facing extension point, ask:

1. What current requirement or observed failure needs this?
2. Why is the simpler design insufficient right now?
3. Can the same contract be satisfied with fewer moving parts?
4. Is the complexity reversible if the assumption proves wrong?

Prefer:

~~~text
direct code
→ clear contract
→ focused test
→ verified behavior
~~~

over:

~~~text
hypothetical future requirement
→ generalized mechanism
→ more state/lifecycle
→ more failure modes
~~~

Good reasons for additional complexity include:

- demonstrated correctness or data-integrity need;
- current security or recovery requirement;
- measured performance bottleneck;
- observed operational failure;
- repeated stable concept whose duplication now causes concrete maintenance risk;
- testability constraint that cannot be handled cleanly with the simpler design.

Weak reasons that are not sufficient alone:

- "we might need it later";
- "it is more flexible";
- "it is more enterprise";
- "it makes future features easier" without a current feature requiring it.

KISS is not permission for hacks, duplicated sources of truth, silent failure, weak tests, or skipped validation. Simplicity means **minimum necessary machinery**, not minimum rigor.

If a more complex solution is selected, the code/review should make the present-day justification clear.

---

# 3. Safe-change protocol

For non-trivial changes, especially existing/legacy code:

1. identify the observable behavior and exact change point;
2. establish a safety net before risky edits;
3. add a characterization test when important existing behavior is insufficiently specified;
4. create a seam around hard dependencies when needed;
5. make the smallest coherent change;
6. run the nearest relevant tests immediately;
7. stop on unexplained red and diagnose before unrelated edits;
8. run the required broader regression layer;
9. refactor further only from a green state;
10. leave a clear commit/status boundary.

Keep a nearby known-green state so regressions can be localized.

## Failure-learning gate

When an unexpected failure, regression, CI defect, live-verification surprise, or meaningful rework occurs, fixing the symptom is only the first half of the work.

Use:

~~~text
technical root cause
→ reasoning/process cause
→ escape cause
→ smallest prevention
→ Promotion Gate
~~~

The repository-wide method is:

~~~text
docs/project/continuous-improvement.md
~~~

The review should ask what we would do differently if starting again with the new evidence.

Do not promote every incident into a global rule. Promote only reusable lessons; keep exact behavior protection in regression tests/local invariants.

---

# 4. Characterization before modification

When behavior exists but is unclear:

~~~text
observe behavior
→ characterize the important public contract
→ confirm the test
→ change code
→ keep the regression/characterization test
~~~

Do not freeze accidental private details unless temporarily necessary to create a safe seam.

---

# 5. Refactoring discipline

- prefer small, reversible refactorings;
- keep tests green between refactoring steps;
- separate behavior change from structural refactoring when practical;
- do not mix broad rename/restructure/rewrite with a feature unless coupling makes separation impossible;
- avoid rewrites around behavior that is not characterized;
- introduce seams before replacing deeply coupled code;
- remove duplication when the common concept is stable;
- avoid speculative abstractions for requirements that do not yet exist.

A refactor that makes the next change safer is more valuable than one that merely looks clever.

---

# 6. Clean Code rules

## Naming

Names reveal intent and domain meaning. Use repository/domain vocabulary consistently. Avoid vague names such as `doWork`, `handleData`, `tmp`, or numbered helpers.

## Functions

Prefer functions that:

- do one coherent thing;
- have explicit inputs/outputs;
- keep side effects visible;
- use guard clauses for invalid states;
- avoid deep nesting;
- avoid hidden mutable-global dependencies;
- remain understandable without unrelated concerns.

Do not split functions mechanically just to reduce line count. Cohesion matters more than arbitrary size.

## Modules

Prefer high cohesion, low coupling, explicit state ownership, clear dependency direction, and pure deterministic logic separated from I/O where practical.

For shared mutable state or shared UI surfaces, prefer a **single authoritative owner/writer**. Multiple writers to the same state/DOM metric require an explicit coordination contract; otherwise ordering/race bugs become likely.

Avoid modules that simultaneously own storage, networking, scheduling, rendering, and policy.

## Comments

Comments explain why, invariants, constraints, or non-obvious tradeoffs. They should not compensate for unclear code.

## Duplication

Remove duplication when it represents one stable concept. Do not abstract merely because two blocks currently look similar.

---

# 7. Design principles

Prefer:

- explicit contracts;
- deterministic core logic;
- side effects at clear edges;
- one source of truth;
- atomic persistence where consistency requires it;
- idempotent/retry-safe behavior where practical;
- clear state transitions;
- explicit failure states;
- recoverability;
- observability.

Project invariants include:

~~~text
IndexedDB = durable browser source of truth
BroadcastChannel = notification, not market-data transport
STATUS.json = live workstream progress source of truth
~~~

Never introduce a second competing state authority.

---

# 8. Error handling and invariants

Prefer:

~~~text
validate
→ fail clearly
→ preserve prior consistent state
~~~

over guessing/defaulting and continuing with uncertain state.

Validate requested/received/unique/missing/unexpected counts and transaction atomicity where relevant.

Preserve:

~~~text
null != 0 != "" != undefined
~~~

---

# 9. Test design

Tests protect behavior, not implementation trivia.

Prefer public contracts, persistence effects, input/output behavior, user-visible DOM behavior, integration boundaries, invariants, and regressions.

Avoid unnecessary assertions on private structure, incidental call order, exact internal decomposition, or transient timing when a stable public state can be asserted.

A test suite should enable refactoring, not punish it.

---

# 10. Non-negotiable verification rule

Any added or modified test must run after its final edit before work advances, but verification should use the **smallest sufficient target first**.

~~~text
unit test changed
→ run exact/nearby unit target
→ green
→ cheap Fast suite may run normally

browser test changed
→ run exact Playwright test in Chromium
→ green
→ widen only when justified

intentional TDD/regression red
→ exact target fails for intended reason
→ implement/fix
→ exact target green

unexpected red
→ stop
→ diagnose
→ fix
→ targeted rerun
~~~

Do not spend a full Browser-suite run merely to prove that a newly written TDD test is red when that failure is expected.

Once implementation code changes, however, the final changed code state must receive browser verification in Chromium for browser-based workstreams. A localized change may use a targeted browser test; shared runtime/harness/storage/messaging/viewer integration or multi-area changes require the full Browser suite.

Checkpoint scheduling controls broad-suite frequency during the red/green loop. It never authorizes carrying changed code forward without browser proof.

Every numbered Stage also has a full-browser closure gate:

~~~text
Stage ready to close
→ Fast CI green
→ full Browser CI green on final Stage state
→ close Stage
~~~

If the required environment cannot be executed:

~~~text
STATUS = verification-pending
→ stop before next feature/substep
~~~

Verification evidence must be traceable to the code/test state being claimed as verified.

---

For browser/E2E work, the workstream's dedicated RCA method is `scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/tests/E2E_DEBUGGING.md`. Diagnose and verify narrowly before broad reruns. Full Browser CI is reserved for required closure/checkpoints or evidence that demands suite-level reproduction; do not use retries, sleeps, weakened assertions, or routine full-suite runs as substitutes for root-cause analysis.

# 11. Legacy-code strategy

When touching fragile or tightly coupled code:

- minimize edit surface;
- protect the behavior most likely to break;
- introduce seams before invasive changes;
- move logic toward pure/deterministic functions incrementally;
- compare old/new behavior during transition where practical;
- keep discovered regression tests;
- avoid cleaning up unrelated nearby code.

Preferred path:

~~~text
characterize
→ create seam
→ small change
→ verify
→ refactor
→ verify again
~~~

---

# 12. Commit hygiene

Prefer small reviewable commits with one coherent reason for change.

Do not knowingly leave:

- a failing test;
- an unexecuted changed test;
- temporary debug code;
- a temporary CI trigger;
- stale STATUS information;
- half-applied schema/state changes.

Temporary verification mechanisms must be restored before closing the work unit.

---

# 13. Specification impact discipline

Every meaningful change must perform a SPEC impact review using:

~~~text
docs/project/specification-policy.md
~~~

The review is mandatory even when the result is `No spec impact`.

Changes to behavior, architecture, public APIs, persistence, provider assumptions, failure/recovery semantics, UI contracts, runtime delivery, security/privacy boundaries, or reuse/extension seams require the owning specs to be reviewed and updated in the same coherent batch when affected.

A known stale spec is a repository-coherence defect. Do not knowingly complete work while leaving a contradictory durable spec behind.

Specs describe intended durable contracts; tests describe executable evidence; code is implementation. A mismatch must be investigated and reconciled rather than hidden.

---

# 14. Healthy-system Definition of Done

Relevant items must be true:

- [ ] behavior/contract is clear;
- [ ] risky existing behavior is characterized where needed;
- [ ] implementation is cohesive and understandable;
- [ ] the solution is the simplest coherent design that satisfies the current verified requirement;
- [ ] no speculative abstraction/framework/lifecycle/extensibility was added without a concrete present-day need;
- [ ] error/integrity paths are explicit;
- [ ] changed tests were executed after their final edits;
- [ ] required unit/integration/browser layers are green;
- [ ] every numbered Stage closure has fresh full Browser CI evidence for its final state;
- [ ] no known regression is deferred;
- [ ] any meaningful unexpected failure received a Failure Review covering technical cause, reasoning/process cause, escape cause and smallest prevention;
- [ ] reusable lessons were promoted to the narrowest correct owner, or the decision not to promote was explicit;
- [ ] status is accurate;
- [ ] SPEC impact review is complete and affected specs are synchronized;
- [ ] temporary verification changes are restored;
- [ ] repository has a clear next pointer;
- [ ] another engineer/AI can continue without guessing.

A healthy system supports small changes with fast, trustworthy feedback and without fear of breaking unrelated behavior.
