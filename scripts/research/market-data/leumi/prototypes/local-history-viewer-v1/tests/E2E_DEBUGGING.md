# E2E / Browser Test Debugging Methodology

This is the required debugging method for Playwright/Chromium failures in Local History Viewer V1.

The objective is not merely to make a red test green. The objective is to find the real cause with minimal disturbance, prove it, fix the correct layer, and keep the repository trustworthy.

---

## 1. Core loop

~~~text
evidence
→ classify
→ one hypothesis
→ one small experiment
→ observe
→ accept/reject hypothesis
→ minimal fix
→ targeted green
→ required broader regression
~~~

Do not start by repeatedly running the whole suite, adding sleeps, weakening assertions, or changing production code before understanding the failure.

---

## 2. Preserve evidence first

Before editing code or tests, capture:

- failing workflow/run ID and commit SHA;
- exact spec/test title and failing assertion;
- stack location and pass/fail count;
- screenshot, trace and error-context artifacts when available;
- whether the test fails alone, only in its spec, or only in the full suite;
- relevant browser/application state at the failure point.

Important findings belong in STATUS.json until the failure is resolved.

---

## 3. Classify the failure

Use one of these working categories:

- **Product regression** — the user-visible/persisted behavior is wrong.
- **Test-contract bug** — the assertion protects an accidental or transient detail rather than the intended contract.
- **Selector ambiguity** — locator matches the wrong or multiple DOM nodes.
- **Fixture/data bug** — IDs, timestamps, ordering, cleanup or null/zero/empty semantics are wrong.
- **Timing/race** — the test observes the wrong moment.
- **State leakage/order dependence** — passes alone, fails in suite.
- **Browser/Playwright semantics** — click/focus/auto-scroll/layout/RTL changes what is measured.
- **Infrastructure** — runner, server, browser installation, workflow or environment failure.

Do not assume the test is correct. Do not assume production is correct either.

---

## 4. Narrow before broad

During diagnosis, use the smallest run that can prove or reject the current hypothesis:

~~~bash
npx playwright test tests/automation/specs/viewer-security-detail.spec.js -g "Stage 14.4"
npx playwright test tests/automation/specs/viewer-security-detail.spec.js
npm run test:browser
~~~

Preferred sequence:

~~~text
exact failing test
→ failing spec
→ related cluster
→ full Browser suite
~~~

Do not spend the full-suite cost on every experiment unless the failure only reproduces in the suite.

For tests-first browser work, this same rule applies to the intentional red phase:

~~~text
new regression/behavior test
→ run exact test only
→ confirm intended red
→ implement/fix
→ run exact test only
→ targeted green
~~~

Do not run the full Browser suite merely to demonstrate a failure that is deliberately expected.

After a fix, the exact changed/failing test must pass first. Widen to the spec/related cluster only when useful, then run the broader regression required by TESTING_POLICY.md at the actual checkpoint. Full Browser CI is still mandatory at every numbered Stage closure.

---

## 5. Hypothesis ledger

For each experiment write:

~~~text
Observation:
Hypothesis:
Experiment:
Expected if true:
Expected if false:
Actual:
Conclusion:
Next hypothesis:
~~~

Change one meaningful variable per experiment. If several things change together, the result is weak evidence.

---

## 6. Build an event/state timeline

For race, navigation, live-refresh and state-preservation bugs, reconstruct the sequence.

Example:

~~~text
T0 MAIN visible
T1 scroll/sort selected
T2 Playwright prepares click
T3 click may auto-scroll target
T4 production captures viewport
T5 MAIN hidden
T6 DETAIL opens
T7 DB changes
T8 BroadcastChannel event
T9 hidden MAIN rerenders
T10 DETAIL refreshes
T11 Back
T12 MAIN visible
T13 viewport restore
T14 next animation frame
~~~

At each point ask:

- which DOM node instance exists?
- which state owner is authoritative?
- what value was captured?
- can Playwright or browser layout mutate it?
- is the element visible or hidden?
- did rerender replace the node?

---

## 7. Instrument minimally

Prefer temporary diagnostics in the test or an existing observable boundary before adding production logging.

Useful snapshots include:

- viewer state and selected securityId;
- sort state and row order;
- refresh count;
- IndexedDB values;
- hidden/visible state;
- scrollLeft/scrollTop;
- scrollWidth/clientWidth;
- getBoundingClientRect();
- computed direction;
- active/focused element;
- timestamps around async boundaries.

For layout issues compare immediate state with requestAnimationFrame. Add a second frame only when the first-frame evidence proves it is needed. Do not add arbitrary delays.

---

## 8. Use Playwright artifacts deliberately

Inspect in this order when relevant:

1. textual error + stack;
2. screenshot;
3. error context;
4. trace;
5. diagnostic state snapshots.

Trace is especially useful for locator resolution, auto-waiting, element replacement, focus, clicks and Playwright-induced scrolling.

---

## 9. Flake analysis

If intermittent, repeat the narrow test:

~~~bash
npx playwright test tests/automation/specs/<spec>.spec.js -g "<test title>" --repeat-each=10
~~~

Interpretation:

- fails alone consistently → deterministic test/product bug;
- passes alone, fails in suite → state leakage/order dependence;
- intermittent alone → race/browser/environment timing;
- only CI fails → environment/layout/resource difference.

Retries are diagnostic evidence, not a substitute for RCA.

---

## 10. Selector debugging

Scope selectors to the owning view. Hidden duplicate elements still exist in the DOM.

Prefer:

~~~text
MAIN panel → current table → column
DETAIL panel → history table → column
~~~

Do not silence strict-mode ambiguity with .first() unless first-element ordering is itself the contract.

---

## 11. Scroll / layout / RTL debugging

Always record:

- direction;
- scrollLeft;
- scrollWidth/clientWidth;
- hidden state;
- element identity before/after rerender;
- value before the triggering action;
- value at the production capture point;
- value after restore;
- value after an animation frame.

Remember:

- RTL scroll offsets may be negative;
- layout can clamp offsets when content geometry changes;
- rerender can replace the scroll container;
- Playwright may scroll a click target into view before dispatching the click;
- exact pixel preservation may be the wrong contract if the semantic requirement is "same visible context".

First decide whether the real contract is exact raw offset, same visible column/anchor, same relative viewport, or same user context.

---

## 12. IndexedDB / data debugging

For browser persistence failures verify:

- cleanup before and after the test;
- transaction completion;
- canonical securityId;
- key/index order;
- duplicate/missing IDs;
- newest/oldest ordering;
- continuation token;
- atomicity;
- null != 0 != "" != undefined.

Use real browser IndexedDB when the failure concerns real persistence semantics.

---

## 13. Race debugging

Never start with waitForTimeout().

Prefer waiting for the causal condition:

- viewer state;
- row count;
- refreshCount increment;
- transaction completion;
- exact DB value;
- visible panel;
- requestAnimationFrame for layout-only behavior.

If a sleep makes the test pass, treat that as evidence of a race, not as the final fix.

---

## 14. Fix discipline

Once RCA is strong enough:

1. make the smallest fix at the correct layer;
2. keep/improve the regression test;
3. run the exact failing test;
4. if red, continue RCA rather than stacking speculative fixes;
5. once targeted green, run the relevant spec/cluster only when coupling/risk/evidence justifies it;
6. run full Browser CI only when required by policy/checkpoint or when suite-level reproduction is necessary;
7. restore temporary diagnostics and CI triggers;
8. update STATUS.json with root cause, fix commit and verification evidence.

---

## 15. Stop conditions

Stop feature development when:

- a changed test is red or unexecuted;
- the failure is unexplained;
- the apparent fix depends on arbitrary delay/retry;
- a temporary CI/debug mechanism is still active;
- the test passes alone but suite failure remains unexplained.

Keep STATUS as in-progress / verification-pending / blocked until evidence is green.

---

## 16. Required RCA report

For a non-trivial E2E failure, be able to answer:

~~~text
What failed?
At which commit/run?
Does it reproduce narrowly?
What failure category is it?
What evidence was collected?
What hypotheses were tested/rejected?
What is the current leading hypothesis?
What minimal fix was made?
Did the exact test pass?
Did the required broader Browser suite pass?
Were temporary diagnostics restored?
~~~

---

## 17. Stage 14.4 example

Initial observation:

~~~text
expected scrollLeft = -180
received scrollLeft = 0
~~~

Diagnostic experiment: wait one animation frame after returning to MAIN and capture layout/scroll state.

Observed:

~~~text
panelHidden = false
scrollLeft = -1285
~~~

Therefore the simple hypothesis "restore runs too early and leaves scroll at zero" is not sufficient.

Next investigation should distinguish, one hypothesis at a time:

- did Playwright auto-scroll the row before production captured the viewport?
- was the production capture already -1285?
- did RTL/layout clamping alter the raw offset?
- is exact raw-pixel preservation actually the intended user contract?

Do not change production scroll logic until those possibilities are separated by evidence.
