# Context Loading Policy — Market Flow

This policy defines how much repository context an AI/agent should read before working.

Goal:

~~~text
enough context to work correctly
without preloading unrelated history/policies/code
~~~

The repository must support both:

- efficient continuation in an existing chat;
- safe continuation in a completely new chat with no conversation history.

The solution is **progressive disclosure**, not deleting history.

---

## 1. Context tiers

### HOT — default fresh-chat context

Read this before meaningful work:

~~~text
AGENTS.md
→ identify workstream
→ workstream README.md
→ workstream STATUS.json
→ workstream AI_CONTEXT.md
~~~

Then read only the target files/tests needed for the next unit of work.

HOT context answers:

- where am I?
- what is active now?
- what architecture/invariants must I preserve?
- what should I do next?
- where do I look for deeper information?

HOT context must remain compact.

### WARM — task-specific context

Read only when the current task needs it:

- the current Stage section in ROADMAP.md;
- owning SPEC(s);
- component README;
- target implementation files;
- directly relevant tests;
- TESTING_POLICY.md when test/verification rules materially matter;
- E2E_DEBUGGING.md for browser failure diagnosis;
- provider/API docs when provider semantics matter;
- engineering-practices.md for non-trivial refactor/design work.

Do not load the whole WARM set mechanically.

### COLD — history / rationale / deep policy

Read only when a trigger requires it:

- docs/history/;
- old status snapshots;
- completed mini-project records;
- detailed durable decisions;
- continuous-improvement policy;
- broad project research/evidence;
- historical CI/run evidence.

COLD context exists so a fresh chat can recover **how and why** the project reached the current state.

It is not part of the default read path.

---

## 2. Fresh-chat algorithm

When conversation history is unavailable:

~~~text
1. fetch main
2. read AGENTS.md
3. identify workstream
4. read workstream README.md
5. read workstream STATUS.json
6. read workstream AI_CONTEXT.md
7. read only current Stage scope / target code / target tests / owning SPEC as needed
8. escalate to history/decisions only when the current compact context is insufficient
~~~

Do not assume chat memory is available.

Do not reconstruct current state from history when STATUS.json is available.

---

## 3. Same-chat continuation

If the same chat already has current repository context and GitHub has not materially changed, reuse it.

Before meaningful new work:

- refresh files that are about to be changed;
- refresh STATUS.json when progress may have changed;
- fetch broader context only when needed.

Do not reread the full HOT/WARM/COLD stack on every message.

---

## 4. History preservation rule

Compaction must never destroy useful project knowledge.

When live/fast context accumulates historical material:

~~~text
archive it under docs/history/
→ link it from the history index
→ keep only the current pointer/summary in HOT context
~~~

Git history is useful, but important historical evidence should not require archaeology through commits.

The history index should explain **when** an archived item is worth reading.

---

## 5. STATUS.json rule

STATUS.json is a **live operational pointer**, not a development diary.

It may contain:

- current overall status;
- current Stage/substep;
- active mini-project;
- exact next action;
- current/pending verification that materially affects what may happen next;
- latest code-verification evidence needed to trust the current state;
- links to cold history.

It should not accumulate:

- every completed Stage's full verification record;
- old CI runs;
- resolved incident narratives;
- completed mini-project details;
- durable testing/engineering policy text;
- architecture/design rationale.

Those belong in history, specs, decisions or policy docs.

---

## 6. AI_CONTEXT.md rule

AI_CONTEXT.md contains only compact technical continuation knowledge that a fresh chat is likely to need before touching code:

- architecture;
- critical invariants;
- implementation map;
- current operational usage constraints that affect development;
- task-to-document routing.

It must not contain:

- live progress/next pointer;
- old Stage-specific working notes after that Stage is complete;
- duplicated full testing/engineering policies;
- CI history.

---

## 7. AGENTS.md rule

AGENTS.md is the mandatory repository-wide gate.

It should contain only:

- context-loading/read-order rules;
- source-of-truth ownership;
- KISS;
- essential testing gates;
- failure-learning gate;
- data-integrity baseline;
- SPEC/documentation gate;
- security;
- completion/reporting baseline.

Detailed methods belong in linked policy documents.

If a rule needs examples, long rationale or domain-specific procedure, prefer a linked detailed policy unless the example is necessary to avoid a common high-cost mistake.

---

## 8. Escalation triggers

Read deeper context when:

- current docs conflict;
- changing architecture/schema/public behavior;
- changing a durable product contract;
- provider semantics are uncertain;
- an unexpected failure requires RCA;
- user asks why/how a past decision was made;
- code has non-obvious historical compatibility behavior;
- resuming an archived mini-project;
- compact context explicitly points to historical evidence.

Otherwise remain on the smallest relevant context set.

---

## 9. Context budget guard

The repository uses automated size guards for HOT context.

Budgets are guardrails, not product correctness rules.

If legitimate HOT context can no longer fit the budget:

1. first remove duplication/stale material;
2. move deep detail to WARM/COLD ownership;
3. only raise the budget if the information is genuinely required on nearly every fresh-chat continuation.

Do not raise a budget merely to avoid organizing context.

---

## 10. Self-maintenance during normal development

Context architecture is maintained **as part of each change**.

When work affects status, documentation, specs, policies, history or routing:

~~~text
identify the owning surface
→ update it in the same coherent batch
→ archive old evidence when needed
→ keep HOT context compact
→ run Fast CI guards
~~~

Do not defer known context/documentation drift to a later cleanup task.

A future change that legitimately needs a new HOT/live field may update the corresponding guard, but only after deciding that the information is required routinely rather than merely convenient.

The goal is **no-cleanup debt**: a completed work unit should not make a later agent reorganize documentation just to restore repository order.

---

## 11. Anti-patterns

Avoid:

### Everything-is-HOT

Fresh chat reads every policy, roadmap, history file and spec before touching one local change.

### History deletion

Compacting context by throwing away evidence needed to understand past decisions.

### Duplicate summaries

The same testing policy or current-state narrative copied into AGENTS, AI_CONTEXT, HANDOFF, NEXT_CHAT_PROMPT and README.

### Status diary

STATUS.json growing indefinitely with every completed run and incident.

### Hidden knowledge

A critical invariant exists only in an old chat or old commit and is not discoverable from repository navigation.

---

## 12. Desired outcome

A fresh chat should be able to:

~~~text
read a small HOT context
→ understand current state and invariants
→ start the correct work
→ discover deeper rationale on demand
~~~

without relying on conversation history and without paying the cost of reading the entire project every time.
