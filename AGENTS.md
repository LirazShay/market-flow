# AGENTS.md — Fast AI Operating Rules for Market Flow

This file is the **mandatory compact entry point** for any AI/agent working in this repository.

Goal: preserve correctness **without forcing a full-repository reread on every small continuation**.

The repository is the source of truth.

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

When the user asks to continue existing work, continue from the current repository state and choose the implementation scope according to technical coherence and verification needs.

There is **no fixed relationship between one chat message and one stage/substage**.

A response may implement:

- part of a substage;
- one complete stage;
- several adjacent stages;

when that is the most coherent and efficient way to work.

Prefer:

~~~text
meaningful implementation + verification boundary
over
arbitrary numbering/message boundary
~~~

Do not stop merely because a numbered stage ended if the next adjacent work belongs to the same coherent change.

Stop when there is a real reason, such as:

- a meaningful verification boundary;
- a user/product decision is needed;
- the next work is unrelated;
- continuing would make the change hard to review or validate.

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
- update `ROADMAP.md` at meaningful stage/substage boundaries, not after every tiny edit.

If fast context conflicts with a durable design/decision document:
1. inspect the authoritative document;
2. resolve the conflict;
3. update the fast context in the same work batch.

---

## 4. Testing policy

Tests should protect observable/public behavior, not private implementation details.

Default strategy:

~~~text
Automated CI first
→ controlled mocks for external APIs
→ real browser APIs where practical
→ live provider verification after CI passes
~~~

For browser work:
- prefer Chromium/Playwright;
- use real IndexedDB/DOM/BroadcastChannel when practical;
- mock Leumi endpoints with deterministic sanitized fixtures;
- never store Leumi session data/credentials in CI.

If a behavior can only be verified live, mark it:

~~~text
Live verification pending
~~~

Detailed testing guidance:
`docs/project/ai-engineering-guidelines.md`

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

## 6. Preserve proven behavior

Before modifying something already verified:

- understand its observable behavior;
- keep that behavior unless intentionally changing it;
- prefer small changes over rewrites;
- add/extend tests when practical.

Do not introduce architecture/frameworks/abstractions without a demonstrated need.

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

Also update:

~~~text
ROADMAP.md
component README when useful
AI_CONTEXT.md if focus/working set changed
~~~

### Durable project decision

Update:

~~~text
docs/project/decisions.md
~~~

### Meaningful project/workstream milestone

Update:

~~~text
docs/project/current-state.md
~~~

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
