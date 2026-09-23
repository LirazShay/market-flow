# Continuous Improvement / Failure Learning Policy — Market Flow

This is the repository-wide policy for learning from bugs, unexpected test failures, CI failures, live-verification surprises, rework, and incorrect engineering assumptions.

The goal is not merely:

~~~text
failure
→ fix
→ green
~~~

The required learning loop is:

~~~text
failure
→ understand what happened
→ understand why we created the conditions for it
→ understand why it escaped earlier detection
→ make the smallest correct fix
→ identify the cheapest prevention
→ promote only generalizable lessons
→ verify
~~~

This policy complements KISS. Continuous improvement must reduce future waste without turning every incident into new machinery or a growing pile of one-off rules.

---

## 1. When the learning loop is mandatory

Run a Failure Review for a meaningful **unexpected** event such as:

- an unexpected unit/browser/CI failure;
- a product regression;
- a bug found during live/manual verification;
- a data-integrity or atomicity defect;
- a security/privacy boundary mistake;
- a race/state-ownership bug;
- a test that turns out to be wrong or misleading;
- a CI/workflow mistake that wastes meaningful time;
- repeated implementation/revert/rework caused by a wrong assumption;
- a late architecture correction that reveals avoidable over-engineering;
- a provider/API assumption disproved by evidence.

The loop is **not** required merely because a tests-first test is intentionally red for a not-yet-implemented behavior.

An expected TDD red becomes a learning trigger only if something unexpected is discovered while proving or fixing it.

---

## 2. Four-cause review

Do not stop at the first technical cause.

For a meaningful unexpected failure, answer all four layers.

### A. Technical root cause

~~~text
What exact system/test/workflow behavior caused the failure?
~~~

Use evidence, not intuition.

### B. Reasoning / process cause

~~~text
What assumption, design choice, implementation shortcut,
test design choice, or workflow decision led us to create this condition?
~~~

This is often the most valuable question.

Examples:

- assumed one component owned a UI field when two wrote it;
- generalized before a requirement existed;
- changed several variables at once;
- relied on source inspection instead of executing the real layer;
- interpreted a provider field without evidence.

### C. Escape cause

~~~text
Why did our existing tests, review, specs, validation,
or development sequence fail to catch this earlier?
~~~

Examples:

- missing regression case;
- assertion tested the wrong public state;
- race was not made deterministic;
- integration boundary had no browser coverage;
- spec ownership was ambiguous;
- verification happened only after several unrelated changes accumulated.

### D. Prevention

~~~text
What is the smallest change that would have prevented
this class of failure earlier or made it cheaper to diagnose?
~~~

Prefer the cheapest effective prevention.

Possible prevention layers:

- regression/characterization test;
- invariant/assertion/validation;
- clearer state ownership;
- simpler design;
- better test helper;
- targeted diagnostic;
- spec clarification;
- test-policy rule;
- engineering guideline;
- durable decision.

---

## 3. Counterfactual question

Before closing the incident, ask:

~~~text
If we started this work again with today's knowledge,
what would we do differently from the beginning?
~~~

The answer should be concrete.

Weak:

~~~text
"be more careful"
"test better"
~~~

Strong:

~~~text
"assign one owner for each shared header metric"
"run the exact Playwright test before widening the suite"
"prove provider after-market timestamps before coding market-state policy"
"do not design a loader until a real deployment requirement exists"
~~~

---

## 4. Learning Promotion Gate

Not every incident deserves a new repository-wide rule.

Before changing instructions/guidelines, evaluate:

1. **Generalizable** — does this apply beyond the exact incident?
2. **Actionable** — can a future engineer/AI actually use the rule?
3. **Preventive** — would it catch/prevent a meaningful class of failures earlier?
4. **Evidence-based** — is it supported by what actually happened?
5. **Cost-effective** — is the maintenance/verification cost lower than the expected waste it prevents?
6. **KISS-compatible** — does it reduce future complexity rather than create ceremonial process?
7. **Non-duplicate** — is there already an existing rule that only needs clarification?

~~~text
passes Promotion Gate
→ promote to the narrowest durable owning instruction

fails Promotion Gate
→ keep the fix/test local
→ do not create instruction churn
~~~

---

## 5. Where a lesson belongs

Promote to the **narrowest correct owner**.

| Lesson type | Preferred destination |
|---|---|
| exact behavior regression | regression test |
| local invariant / invalid state | code validation/assertion |
| durable product contract | owning SPEC |
| Playwright/E2E diagnosis technique | workstream `tests/E2E_DEBUGGING.md` |
| testing cadence / verification rule | workstream `tests/TESTING_POLICY.md` |
| component-specific operation | component README / local guide |
| repository-wide engineering habit | `docs/project/engineering-practices.md` |
| mandatory compact AI operating rule | `AGENTS.md` |
| detailed AI execution guidance | `docs/project/ai-engineering-guidelines.md` |
| durable cross-cutting decision | `docs/project/decisions/D-NNN.md` |
| current incident/progress/evidence | workstream `STATUS.json` only |

Do not copy the same lesson into many files unless each file serves a distinct entry-point responsibility.

Do not use `STATUS.json` as the durable instruction manual.

Do not use a durable guideline to store live CI/run snapshots.

---

## 6. Failure Review template

For a non-trivial unexpected failure, the work should be able to answer:

~~~text
Incident:
Evidence / run / reproduction:

Technical root cause:
Reasoning/process cause:
Escape cause:

What would we do differently if starting again?
Smallest prevention:

Generalization scope:
- local only
- workstream
- repository-wide

Promotion Gate result:
- promote
- do not promote

Durable updates made:
Regression test kept:
Verification:
~~~

This may be recorded in `STATUS.json` while the incident is active/resolved, or summarized in a durable decision/history document when the incident itself is architecturally significant.

A separate postmortem file is **not** mandatory for every failure.

---

## 7. Completion gate after unexpected failure

A meaningful unexpected failure is not considered fully resolved merely because tests are green.

Before leaving the work unit:

- root cause is understood;
- reasoning/process cause was considered;
- escape cause was considered;
- regression/safety net exists when practical;
- the smallest prevention was implemented or consciously rejected with reason;
- Promotion Gate was evaluated;
- any promoted lesson was added to its correct owner;
- temporary diagnostics/workflow changes were removed;
- required verification passed.

If no generalizable lesson exists, say so explicitly rather than inventing one.

---

## 8. Before similar future work

Promoted lessons must be placed where future work naturally reads them.

That is the feedback loop:

~~~text
incident
→ lesson
→ owning instruction/test/spec
→ future agent reads it before similar work
→ failure becomes less likely / cheaper
~~~

Do not require future agents to read an ever-growing incident archive.

The normal entry points should carry the distilled lesson.

---

## 9. Anti-patterns

Avoid:

### Fix-and-forget

~~~text
red
→ patch
→ green
→ move on
~~~

without asking why it happened and why it escaped.

### Blame without mechanism

~~~text
"human error"
"AI mistake"
"flaky test"
~~~

is not a root cause unless the specific mechanism is explained.

### Rule explosion

Do not add a new global rule for every one-off typo or environment hiccup.

### Overfitted prevention

Do not write an instruction that names only one exact incident when a smaller local regression test is sufficient.

### Process theater

A retrospective is useful only when it changes future behavior, validation, tests, or decision quality.

---

## 10. Relationship to KISS

Continuous improvement and KISS reinforce each other.

A good lesson usually:

- removes an unnecessary moving part;
- makes ownership clearer;
- catches failure earlier;
- narrows verification;
- avoids repeated debugging;
- turns an assumption into evidence.

A bad lesson often adds ceremony without reducing risk.

The objective is:

~~~text
higher quality
+ faster diagnosis
+ less rework
+ fewer repeated mistakes
with the least process necessary
~~~
