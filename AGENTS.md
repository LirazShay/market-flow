# AGENTS.md — Market Flow AI Operating Rules

This is the mandatory compact entry point for AI/agents working in this repository.

GitHub `main` is the source of truth.

Detailed context-loading policy:

~~~text
docs/project/context-loading.md
~~~

---

## 1. Fresh-chat / continuation loading

### Fresh chat

When conversation history is unavailable:

~~~text
fetch main
→ AGENTS.md
→ identify workstream
→ workstream README.md
→ workstream STATUS.json
→ workstream AI_CONTEXT.md
→ current Stage scope / target files / direct tests / owning SPEC as needed
~~~

If the user names a concrete workstream/path, go directly there after this file.

If the workstream is unknown:

~~~text
docs/project/workstreams.md
~~~

Do **not** preload all project policies, ROADMAP, specs, decisions or history.

Use progressive disclosure:

~~~text
HOT  = AGENTS + workstream README + STATUS + AI_CONTEXT
WARM = task-specific ROADMAP section / code / tests / SPEC / component docs
COLD = history / completed mini-projects / deep rationale / detailed policies
~~~

History must remain discoverable for new chats, but is read only when needed.

### Same-chat continuation

Reuse context already read when still current.

Before meaningful changes, refresh:

- `STATUS.json` if progress may have changed;
- files being edited;
- directly relevant tests/specs.

Do not mechanically reread the repository.

---

## 2. Source-of-truth ownership

For a workstream:

~~~text
STATUS.json
= live operational state / current pointer / current verification

ROADMAP.md
= plan, scope and order

AI_CONTEXT.md
= compact technical continuation context

specs/
= durable normative contracts/invariants

workstream/docs/history/
= preserved cold history / past evidence

docs/project/decisions/
= durable cross-cutting decisions
~~~

Operational stage/completion/next state belongs only in `STATUS.json`.

If sources conflict, inspect the authoritative code/spec/decision/evidence, resolve the contradiction, and update the stale surface in the same coherent batch.

---

## 3. Scope and continuation

When the user asks to continue, work directly on the repository.

Choose a natural engineering + verification boundary. One message does not equal one Stage or one substep.

For:

~~~text
תמשיך לשלב הבא
~~~

continue from the exact `STATUS.json` pointer into the next correct work.

Do not skip planned work.

The word:

~~~text
סיימתי
~~~

is reserved for completion of the full planned process/version, not a Stage/checkpoint.

---

## 4. KISS — simplest sufficient design

Default to the simplest coherent design that satisfies the **current verified requirement**.

~~~text
current requirement + proven constraints
→ smallest sufficient mechanism
→ verify
→ stop
~~~

Do not add abstraction/framework/lifecycle/cache/concurrency/retry/compatibility/extensibility merely because it may help later.

Additional complexity needs a concrete present-day reason:

- correctness/data integrity/security;
- observed failure;
- measured performance/reliability;
- current recovery/testability need;
- stable repetition causing real maintenance cost.

Future possibility alone is not enough.

Detailed rule:

~~~text
docs/project/engineering-practices.md
docs/project/decisions/D-021.md
~~~

---

## 5. Testing and verification

Tests protect observable/public behavior, not private implementation details.

Use the cheapest valid layer:

~~~text
pure deterministic logic
→ Node unit tests

browser semantics / IndexedDB / DOM / BroadcastChannel / integration
→ Playwright + Chromium

provider/session behavior not provable by mocks
→ live verification
~~~

Tests-first when practical.

For browser TDD:

~~~text
new/changed test
→ exact targeted Chromium red
→ implement/fix
→ exact targeted green
~~~

Do not run the full Browser suite merely to prove an expected red.

After **production/runtime/browser code changes**, Chromium verification on the final changed state is mandatory:

- localized change → targeted Chromium may be sufficient;
- shared runtime/harness/storage/messaging/viewer integration, cross-component or multi-area change → full Browser suite;
- every numbered Stage closure → Fast CI + full Browser CI.

Any added/modified test must run in its real layer after the final edit.

Unexpected red or red remaining after the intended fix blocks progression.

Detailed workstream policy:

~~~text
target workstream/tests/TESTING_POLICY.md
~~~

Browser failure methodology:

~~~text
target workstream/tests/E2E_DEBUGGING.md
~~~

---

## 6. Learn from unexpected failures

A meaningful unexpected bug/test/CI/live-verification/rework failure does not end at:

~~~text
fix
→ green
~~~

Ask:

1. What technically failed?
2. What assumption/process choice helped create it?
3. Why did existing safeguards not catch it earlier?
4. What would we do differently if starting again?
5. What is the smallest prevention?
6. Is the lesson local, workstream-wide or repository-wide?

Expected TDD red is not itself an incident.

Promote only lessons that are generalizable, actionable, evidence-based, preventive and KISS-compatible.

Put the lesson in the narrowest correct owner: regression test, code invariant, SPEC, test guide, engineering policy or durable decision.

Detailed method:

~~~text
docs/project/continuous-improvement.md
docs/project/decisions/D-022.md
~~~

---

## 7. Data correctness baseline

Never silently accept partial/corrupt data.

Validate where relevant:

- requested / received / unique;
- duplicate IDs;
- missing/unexpected IDs;
- response shape;
- transaction atomicity.

Preserve:

~~~text
null != 0 != "" != undefined
~~~

Do not guess unknown API/schema semantics.

Use:

~~~text
Verified
Inferred
Unknown
~~~

for material evidence claims.

Workstream-specific invariants belong in its `AI_CONTEXT.md` / specs, not here.

---

## 8. Safe change + SPEC impact

Before modifying proven behavior:

- understand the observable contract;
- keep it unless intentionally changing it;
- prefer small coherent changes;
- add/strengthen regression/characterization tests when practical;
- avoid mixing unrelated refactor + behavior change.

Every meaningful system change must perform a SPEC impact review.

Outcome:

~~~text
No spec impact
or
affected specs updated/added/removed in the same batch
~~~

Detailed policies:

~~~text
docs/project/engineering-practices.md
docs/project/specification-policy.md
~~~

Do not duplicate live status into README/AI_CONTEXT/HANDOFF/design/spec docs.

Archive historical evidence under explicit `docs/history/` locations rather than growing live context indefinitely.

---

## 9. Repository self-maintenance

Repository order is maintained **during the change**, not by a later cleanup pass.

For every meaningful work unit:

~~~text
change implementation/tests/docs
→ update affected owner documents in the same coherent batch
→ archive historical detail instead of growing HOT/live context
→ remove temporary diagnostics/triggers/artifacts
→ run the relevant guards
→ leave no-cleanup debt
~~~

Do not finish work while knowingly leaving:

- stale duplicated status/context;
- abandoned experiment files/assets;
- temporary CI/debug scaffolding;
- historical dumps in HOT context;
- a changed contract without its owning SPEC/docs;
- an instruction that conflicts with current policy.

If new structure is truly required, update the owning guard/policy deliberately rather than bypassing it.

Detailed decision:

~~~text
docs/project/decisions/D-024.md
~~~

---

## 10. Security

The repository is public.

Never commit:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- private browser/session data;
- unnecessary sensitive raw dumps.

Use sanitized synthetic fixtures.

Do not bypass WAF/access controls.

---

## 11. Completion standard

A work unit is complete only when relevant items are true:

- implementation/change is valid;
- required tests passed;
- changed tests ran in their native layer;
- code changes received required Chromium verification;
- numbered Stage closure has Fast + full Browser CI;
- live-only verification is explicitly pending when applicable;
- no known failure is hidden;
- data-integrity checks are present where needed;
- SPEC impact review is complete;
- unexpected-failure learning disposition is complete when applicable;
- `STATUS.json` is current;
- repository is left in a clear resumable state;
- no-cleanup debt remains from the work unit.

End report briefly:

- what changed;
- files changed;
- tests;
- Fast CI;
- Browser CI if relevant;
- pending/unknown;
- next pointer from `STATUS.json`.

---

## 12. Priority order

~~~text
Correctness / data integrity / security
→ Simplicity
→ Observability
→ Testability
→ Documentation
→ Speed
~~~

For detailed repository-wide engineering guidance, read only when the task needs it:

~~~text
docs/project/engineering-practices.md
docs/project/ai-engineering-guidelines.md
docs/project/specification-policy.md
docs/project/continuous-improvement.md
docs/project/decisions.md
~~~
