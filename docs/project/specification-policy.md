# Specification Policy — Market Flow

This document defines how durable specifications are written, owned, reviewed, and kept synchronized with the system.

A specification is a **normative description of intended durable behavior and constraints**. It exists so an engineer or AI can understand what a subsystem is, why it exists, what it promises, what it must never violate, and how it may evolve without first reverse-engineering the implementation.

Operational progress is not a specification concern. Workstream progress remains owned by the relevant `STATUS.json`.

---

## 1. Why Market Flow uses multiple specs

Market Flow is a research-and-development repository. Research prototypes are expected to teach us things, be reused, be extended, and sometimes become foundations for new tools.

A single monolithic specification becomes hard to maintain. No specification at all forces future work to reconstruct intent from code and chat history.

The repository therefore prefers:

~~~text
one system-level spec
+
small responsibility-level specs
+
links to deeper design/evidence documents
~~~

Examples of responsibility-level specs:

- provider/data contract;
- recorder/collector;
- persistence;
- messaging;
- viewer/UI;
- runtime/delivery;
- evolution/reuse.

Specs should be split when a responsibility has its own public contract, invariants, failure semantics, or independent evolution path.

Do not create a separate spec for every private helper or implementation detail.

---

## 2. Source-of-truth boundaries

Different artifacts own different kinds of truth:

~~~text
STATUS.json
= live operational progress, current pointer, verification state

ROADMAP.md
= planned scope/order

*.spec.md
= durable intended behavior, contracts, invariants, boundaries, evolution rules

design docs
= deeper rationale, alternatives, data models, UX details, evidence

code
= current implementation

tests
= executable behavioral evidence

README.md
= navigation and local orientation
~~~

A spec must never become a second live status file.

Do not put current stage/substep, current completion snapshot, exact next pointer, or latest CI run snapshot into a spec.

---

## 3. Mandatory SPEC impact review

Every meaningful system change requires a **SPEC impact review** before the work batch is considered complete.

Review specs whenever a change affects any of the following:

- observable/public behavior;
- architecture or dependency direction;
- public API or runtime entry point;
- data model, schema, keys, indexes, or transaction boundary;
- data-integrity rules;
- lifecycle or state transitions;
- scheduling/cadence semantics;
- failure/recovery behavior;
- provider/API assumptions;
- messaging contract;
- UI/UX behavior;
- security/privacy boundary;
- packaging/delivery;
- extension/reuse boundary;
- supported/non-supported scope.

The result must be one of:

~~~text
No spec impact
    Existing specs still describe the durable contract accurately.

Spec update required
    Update the affected specs in the same coherent work batch.

New spec required
    A new durable responsibility/contract was introduced and deserves its own spec.

Spec deletion/merge required
    A responsibility or contract no longer exists independently.
~~~

Do not leave a known stale spec for a later cleanup task unless the work is explicitly blocked and recorded as such in the authoritative `STATUS.json`.

---

## 4. Spec/code/test disagreement

A disagreement between a spec and implementation is a defect in repository coherence.

Do not silently assume either side is correct.

Use:

~~~text
identify intended behavior
→ inspect evidence/design/decision history
→ characterize implemented behavior if needed
→ resolve the mismatch
→ update code/tests/spec together as appropriate
~~~

Tests prove implemented behavior; they do not automatically make that behavior the intended contract.

Specs describe intended durable behavior; they do not prove the implementation currently satisfies it.

---

## 5. Required structure for a durable spec

Responsibility-level specs should normally contain:

1. **Purpose** — why this responsibility exists.
2. **Scope** — what is inside and outside the contract.
3. **Contract** — inputs, outputs, public behavior, lifecycle.
4. **Invariants** — rules that must always remain true.
5. **Failure semantics** — what happens when something fails.
6. **Extension and reuse** — what future work may build on and which boundaries should remain stable.
7. **Verification mapping** — where executable evidence lives and which claims remain live-only.
8. **Change triggers** — changes that require this spec to be reviewed.
9. **References** — design docs, API evidence, code areas, testing policy.

Add domain-specific sections when useful, such as security, state machine, persistence model, data integrity, accessibility, performance, or delivery.

---

## 6. Granularity rule

Create or split a spec when at least one of these is true:

- the responsibility has a distinct public contract;
- it has independent invariants/failure semantics;
- another future tool could reuse it independently;
- it is likely to evolve independently;
- understanding it requires more than a short subsection in the parent spec.

Do **not** split merely because the code has another file/class/function.

The spec structure should follow **domain responsibilities**, not implementation decomposition.

---

## 7. Research prototypes are specified deliberately

A research prototype is not disposable knowledge.

Its specs should make explicit:

- what question/tool the prototype addresses;
- which findings/contracts are reusable;
- which choices are intentionally prototype-only;
- what must be preserved if the idea is rebuilt differently;
- what is safe to replace;
- what future tools are expected to share;
- what evidence is Verified, Inferred, or Unknown.

A future implementation may replace all code while still conforming to the same useful spec.

---

## 8. Spec maintenance during refactoring

Pure structural refactoring that preserves every specified contract may require no spec text change.

However the SPEC impact review is still required.

If refactoring changes:

- module ownership;
- dependency direction;
- public entry points;
- lifecycle;
- failure semantics;
- extension seams;

then the relevant spec must change even when user-visible output looks the same.

---

## 9. Spec maintenance during feature work

Preferred sequence:

~~~text
behavior/contract intent
→ spec impact
→ test/public acceptance contract
→ implementation
→ verification
→ final spec consistency review
~~~

For exploratory work where the contract is not known upfront:

~~~text
experiment
→ evidence
→ decide durable behavior
→ write/update spec
→ characterize/verify
~~~

Do not prematurely spec uncertain hypotheses as established contracts.

Use `Verified / Inferred / Unknown` where evidence level matters.

---

## 10. Review checklist

Before completing a meaningful change:

- [ ] relevant specs were identified;
- [ ] new/changed behavior is represented accurately;
- [ ] removed behavior was removed from specs;
- [ ] invariants still match implementation intent;
- [ ] failure/recovery semantics still match;
- [ ] extension/reuse guidance is still valid;
- [ ] links/references still resolve;
- [ ] no live operational status was copied into specs;
- [ ] changed specs remain consistent with tests/design evidence;
- [ ] a new durable responsibility received a spec when warranted.

This checklist applies to humans and AI/agents.

---

## 11. Navigation expectation

Every substantial workstream should expose its specification set from a stable local index such as:

~~~text
specs/README.md
~~~

Component READMEs should link to their owning spec rather than duplicating the complete contract.

Repository-wide operating rules should link back to this policy.
