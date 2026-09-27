# Local History Viewer V2 — 12-Chat Implementation Plan

This file defines the stable fresh-chat execution partition for Browser SQL V2.

It does not own live progress, completion state or the current pointer.

~~~text
STATUS.json = live progress/current/verification
ROADMAP.md = stable product implementation order/scope
Master #85 + C01..C12 = executable GitHub work
CHAT_EXECUTION_PLAN.md = stable fresh-chat boundaries
~~~

## Why exactly 12 chats

The planned implementation uses exactly twelve fresh chats: one executable Issue per chat.

~~~text
C01..C12 = #73..#84
~~~

Each Issue already owns one coherent implementation and verification concern. Combining Issues creates unnecessarily large chats with multiple closure contracts; splitting an Issue again creates artificial handoffs and repeated context.

Conditional O1..O6 work is evidence-triggered and is not counted as standing chats. If triggered, it stays with the chat that owns the triggering Issue until its documented rejoin verification is green.

## Sequential chat order versus the dependency DAG

The durable DAG still permits parallel work, but the human-driven fresh-chat strategy is intentionally sequential:

~~~text
Chat 01 → C01
Chat 02 → C02
Chat 03 → C03
Chat 04 → C04
Chat 05 → C05
Chat 06 → C06
Chat 07 → C07
Chat 08 → C08
Chat 09 → C09
Chat 10 → C10
Chat 11 → C11
Chat 12 → C12
~~~

This is an orchestration strategy, not a new GitHub dependency graph. ROADMAP.md and docs/browser-sql-compact-execution-dag.md remain dependency authorities.

The serial order ensures every chat starts from a verified predecessor, makes C06 naturally own the shared Current→Detail→Back closure regression, postpones C10 until the actual runtime shape exists, and leaves C11 as the single final convergence point.

## Strict serial chat protocol

Every implementation prompt identifies itself explicitly:

~~~text
I am Chat NN of 12.
My owner is Cxx / Issue #yy.
I may start work only if STATUS.json points to my Cxx/#yy and all required predecessor verification is green.
~~~

The chat must validate that statement against GitHub before implementation.

If STATUS.json does not point to that chat/Issue, the chat must **not** guess or continue from prompt text alone. It must reconcile GitHub state first. A stale prompt never overrides STATUS.json.

Only one planned implementation chat is active at a time.

~~~text
Chat N active
→ Chat N owns all blocking discoveries, implementation and required verification
→ Chat N reaches its exit gate
→ Issue closes
→ STATUS points to Chat N+1
→ only then open Chat N+1
~~~

The previous chat's prose is never an entry gate. GitHub is.

### Completion signal

For Chats 01..11, the chat may emit the agreed completion word only after all of these are true:

- its owning Issue is closed;
- all required verification is green;
- every blocking/conditional discovery owned by that chat has rejoined;
- STATUS.json points to the next chat/Issue;
- there is no verification-pending state left behind.

For Chat 12, the same completion signal is allowed only after C12 and the implementation master are genuinely closed and the final operating pointer is written.

The completion word is therefore a **receipt of a committed GitHub handoff**, never merely "I finished coding."

## Discovery/change protocol

Unexpected findings are normal. They do not break the serial model.

Every new finding discovered while Chat N is active is classified immediately into exactly one of these buckets:

### A. Required-now defect

Use when the finding:

- violates an invariant/security/data-integrity rule;
- breaks the current Issue acceptance contract;
- invalidates a predecessor assumption required by the current work;
- causes required verification to fail;
- would make handing off to the next chat unsafe.

Action:

~~~text
keep Chat N active
→ add/update regression or proof when practical
→ repair the owning code/spec/Issue/decision
→ rerun the smallest affected earlier verification
→ rerun Chat N verification
→ only then close Chat N
~~~

Do not create a later-chat TODO for a defect that makes the current handoff false.

### B. Evidence-triggered conditional O1..O6

Use only when the exact documented trigger fires.

Action:

~~~text
record the evidence
→ create focused conditional Issue only if useful
→ keep the triggering chat active
→ implement smallest justified mechanism
→ rerun affected contracts
→ rejoin the triggering Cxx
→ close only after green
~~~

The planned next chat does not start during this branch.

### C. Necessary plan correction

Use when implementation evidence proves the current executable plan itself is wrong or incomplete, but the correction is still needed for the product.

Action:

~~~text
stop coding forward
→ update the owning GitHub Issue / decision / ROADMAP or CHAT_EXECUTION_PLAN as appropriate
→ update STATUS
→ add/adjust guards if the contradiction is mechanically protectable
→ continue in the same Chat N from the corrected source of truth
~~~

Do not preserve a known-bad plan merely to keep the original chat numbering intact.

If the correction changes future chat ownership/boundaries materially, explicitly revise CHAT_EXECUTION_PLAN.md before proceeding. The serial protocol remains, but the durable plan is allowed to evolve from evidence.

### D. Non-blocking future improvement

Use only when the finding is genuinely not required for the current contract, safety, integrity, or downstream correctness.

Action:

- capture it in the appropriate durable planning location or focused future Issue if warranted;
- do not silently expand the current Issue;
- do not move the live STATUS pointer to it;
- continue the current chat.

### E. Historical/debug observation only

If the observation has no durable product/implementation consequence, keep it out of HOT status and permanent planning.

## Standard startup contract

Every fresh implementation chat fetches latest main and reads:

~~~text
AGENTS.md
→ README.md
→ STATUS.json
→ AI_CONTEXT.md
→ active Cxx GitHub Issue
→ only directly touched current code/tests/specs
~~~

Rules:
- GitHub main is source of truth.
- Do not preload old WP/ND/Phase planning.
- Read historical Browser SQL material only when the active Issue links a specific uncertainty.
- Read the latest version of every directly touched file before editing.
- Update STATUS.json as part of implementation.

## Standard work contract

~~~text
observable behavior/public contract
→ smallest meaningful test/proof
→ intended red when applicable
→ implementation
→ focused verification
→ verification-pending if required verification remains
→ required Fast/Browser/live verification
→ green
→ close Issue
→ STATUS points to next planned chat
~~~

Do not advance the pointer while required verification is red or pending. Tests protect public/observable behavior, not private implementation details.

## Standard end-of-chat handoff

Before handing off:
1. update only durable docs/specs affected by behavior changes;
2. remove temporary exploratory scaffolding with no continuing purpose;
3. run verification required by the Issue and tests/TESTING_POLICY.md;
4. record meaningful verification in STATUS.json;
5. close the owning GitHub Issue;
6. set one STATUS.json pointer to the next Issue;
7. leave no material decision only in chat prose.

If verification is pending, the same chat remains owner. Do not open the next implementation chat.

At successful handoff, the chat's final report must state at minimum:

- chat number and owning Cxx/#Issue;
- implementation summary;
- changed files;
- tests added/changed;
- Fast CI result;
- Browser CI result when relevant;
- live verification result when relevant;
- conditional/discovery disposition;
- closed Issue;
- next STATUS pointer.

Only after those GitHub facts are true may the chat emit the agreed completion signal.

---

## Chat 01 — C01 / #73 — Authenticated DuckDB feasibility

Entry: final planning freeze green, #72 closed, STATUS points to C01, reusable #29/#30 evidence available.

Owns: authenticated L-1 only — injected JS → Blob Worker → exact pinned Worker/Wasm → probe-only OPFS → synthetic COMMIT → close/reopen/read marker → probe cleanup.

Does not own: provider calls, production DB/schema, Recorder/Viewer/Scanner, Web Locks, production durability cadence.

Verification: relevant Fast/build/probe guards; deterministic Chromium probe if touched; authenticated sanitized L-1 PASS.

Exit: C01 closed and STATUS points to C02/#74. If the premise fails materially, reopen planning instead of coding around it.

---

## Chat 02 — C02 / #74 — Minimum SQL runtime and schema

Entry: C01 complete.

Owns: one Runtime Controller, one SQL Worker, production OPFS DB identity, runtime/build identity, separate schema/storage compatibility, minimum raw/current/history structures, readiness/open states, incompatible-storage blocking without destructive reset.

Does not own: normal provider collection, complete-cycle persistence, Viewer, Scanner, migration framework, archive/rollover.

Verification: Node identity/compatibility tests; Chromium Worker/Wasm/OPFS open/reopen and incompatible schema; Fast CI + full Browser CI.

Exit: C02 closed; STATUS points to C03/#75. C10 is technically unblocked but intentionally deferred to Chat 10 in this serial strategy.

---

## Chat 03 — C03 / #75 — Atomic persistence and durability

Entry: C02 complete.

Owns: one validated complete cycle entering SQL atomically; authoritative cycle/current/history coherence; dynamic-universe add/remove; raw fact fidelity; null/zero/empty/missing distinctions; failure-before-commit semantics; smallest proven durable-success acknowledgement boundary; reopen; retry/idempotency only if evidence requires it.

Does not own: authenticated Recorder wiring, Viewer, enrichment, generic checkpoint/recovery framework.

Verification: Node deterministic pieces; Chromium transaction failure/reopen; focused fault injection; replay tests only if idempotency is selected; Fast + full Browser CI.

Exit: atomic-or-absent persistence and durability/reopen contract proven; C03 closed; STATUS points to C04/#76.

---

## Chat 04 — C04 / #76 — Recorder integration and trusted reads

Entry: C03 complete.

Owns: preserved V1 MapHeat2 + sequential GetSecuritiesData + exact accounting into SQL; Recorder success tied to C03 durability; semantic reads for current universe/current security/bounded history/readiness; committed-only visibility; stable equal-timestamp paging; notifications as hints.

Does not own: Current/Detail rendering parity, Scanner, analytical optimization, new provider API.

Verification: collector characterization only where missing; Chromium Recorder→SQL→trusted reads; dropped-notification/reread; Fast + full Browser CI.

Exit: normal Recorder→SQL path and trusted read API green; C04 closed; STATUS points to C05/#77.

---

## Chat 05 — C05 / #77 — Current Universe on SQL

Entry: C04 complete.

Owns: Current membership, columns/values, deterministic sort/ties, missing/empty/zero rendering, EMPTY versus ERROR, reload/open-after-data, manual/notification authoritative reread with no provider calls, canonical SecurityId navigation, Scanner independence.

Does not own: Detail/History, L-2, Scanner, enrichment UI.

Verification: Chromium Current parity and existing public-behavior regressions; Fast + full Browser CI.

Exit: Current fully SQL-backed and green; C05 closed; STATUS points to C06/#78. Because execution is serial, C06 owns the shared Current→Detail→Back closure regression.

---

## Chat 06 — C06 / #78 — Security Detail/History + L-2

Entry: C05 complete.

Owns: Detail/History trusted reads, newest-first bounded paging, equal-timestamp continuation, known-but-not-current history, reload/missed-notification/live refresh, Current→Detail→Back with Current sort/scroll preservation, bounded authenticated real provider→SQL→trusted-read L-2.

L-2 is controlled single-tab evidence, not C10/C12 ownership proof.

Conditional: O6 only for one unresolved material live parity uncertainty. Chat 06 stays open until the uncertainty is resolved, temporary shadow is retired and affected C06 proof reruns green.

Verification: Chromium Detail/history/lifecycle parity; shared navigation regression; full Browser CI; sanitized authenticated single-tab L-2 PASS.

Exit: both V1-derived browsing surfaces proven on SQL and no material scoped parity Unknown remains; C06 closed; STATUS points to C07/#79.

---

## Chat 07 — C07 / #79 — Real analytical SQL evidence

Entry: C05+C06 complete.

Owns: predeclare representative query corpus and deterministic day-sized workload; prove expected SQL results; measure the same corpus in browser runtime; decide whether raw/history SQL is sufficient; promote optimization only from concrete evidence. No final trading formula.

Conditional: O1 only if an important query is materially too slow/awkward. Chat 07 stays responsible for the smallest optimization, correctness, affected-query remeasurement and any directly affected earlier regression.

Verification: deterministic query correctness; focused Chromium/DuckDB measurement; Fast CI; Browser CI only for changed browser/SQL surfaces.

Exit: record either dynamic-SQL-sufficient or one evidence-backed O1 optimization implemented and remeasured; C07 closed; STATUS points to C08/#80.

---

## Chat 08 — C08 / #80 — Safe Scanner core

Entry: C05+C06 complete; in this serial strategy C07 is also complete.

Owns: non-executing draft, validated Activate, failed-Activate preservation, one active config, exact-engine read-only safety, committed reads, one execution at a time, no burst replay, deterministic activation order, execution/config attribution, zero rows success, isolated errors, collector-cadence independence, simple restart behavior.

Does not own: rich grid/editor UX, immutable query history, collaboration/OCC, mandatory streaming, advanced preemption.

Verification: Node pure state logic where useful; Chromium exact-engine safety corpus/hardening, draft/Activate behavior, no-overlap/no-burst, race/attribution/restart; Fast + full Browser CI.

Exit: Scanner runtime contract green; C08 closed; STATUS points to C09/#81.

---

## Chat 09 — C09 / #81 — Scanner UI and truthful results

Entry: C08 complete.

Owns: editor, interval, Activate, runtime-authoritative active/status versus local draft, dynamic result schema/order, truthful types, zero-row versus error, truthful truncation, correct result/config attribution, optional SecurityId drill-down, isolation from provider cadence and Current/Detail/Recorder.

Conditional: O3 only if representative simple materialization is unsafe/unusable. Chat 09 remains open until the smallest streaming/chunking mechanism and affected result tests are green.

Verification: Chromium UI/result/type tests, active/draft resync, attribution, representative result-size/truncation, Scanner isolation and zero-provider-call regression; Fast + full Browser CI.

Exit: complete truthful third surface; C09 closed; STATUS points to C10/#82.

---

## Chat 10 — C10 / #82 — One production owner

Entry: technical dependency C02 complete; in this serial strategy C03-C09 are also complete.

Owns: canonical exclusive Web Lock market-flow:local-history-viewer-v2:runtime-owner; same-tab singleton reuse; fail-fast independent-tab acquisition; only granted holder starts Worker/DB/Recorder; passive loser starts none; lock spans mutation-capable lifetime; teardown-before-release; later reacquisition/readiness; no steal/heartbeat/localStorage/IndexedDB/BroadcastChannel election; locks.query diagnostic only.

Does not own: authenticated-origin two-tab proof; C12 owns that.

Verification: Chromium multi-page race, passive loser, relaunch, hidden owner, unavailable/SecurityError, diagnostic-only paths, teardown-before-release and reacquire/readiness; Fast + full Browser CI.

Exit: ownership mechanics green; C10 closed; STATUS points to C11/#83.

---

## Chat 11 — C11 / #83 — Representative daily mixed workload

Entry: C07+C09+C10 complete and every earlier candidate-changing conditional rejoined.

Owns: predeclare workload parameters, then exercise collection + SQL persistence + Current/Detail + representative Scanner + one-owner runtime together; measure exact integrity, backlog, overlap, memory/storage, reopen and practical responsiveness evidence without post-hoc thresholds.

Conditionals: O2 resource hardening, O3 streaming, O4 storage/fresh-DB, O5 target Windows/Chrome only from evidence. All remain Chat 11 ownership. Candidate-changing branches rerun the smallest affected earlier regressions plus C11.

Verification: deterministic integrated Chromium workload with fixed parameters and exact cycle counters; Fast + full Browser CI; target Windows/Chrome only if O5 triggers.

Exit: mixed daily workload green and every O2/O3/O4/O5 rejoined; final candidate identified; C11 closed; STATUS points to C12/#84.

---

## Chat 12 — C12 / #84 — Authenticated production transition

Entry: C11 complete on final candidate; Fast + full Browser CI green; L-1/L-2 still valid for relevant final boundaries; retained old IndexedDB release available; no unresolved material integrity/security issue.

Owns one no-overlap transition:

~~~text
settle/stop old IndexedDB Recorder
→ preserve legacy IndexedDB
→ launch tested SQL candidate
→ prove real-origin two-tab canonical Web Lock
→ exactly one owner + passive loser
→ owner opens fresh production OPFS/readiness
→ begin SQL recording
→ bounded real provider verification
→ Current/Detail trusted reads
→ explicitly run one representative safe Scanner query
→ verify first production cycles/readback
→ accept cutover
~~~

On material post-stop/cutover failure: stop SQL, preserve SQL DB, run retained old release. No automatic fallback, dual-write or history synchronization.

Verification: Fast + full Browser CI, C11 evidence, authenticated no-overlap self-verifier, real two-tab ownership, first-cycle exact integrity, final security/static/docs consistency.

Exit: SQL is the only new market-history authority; legacy IndexedDB preserved; rollback readiness documented; temporary release/probe artifacts dispositioned; C12 closed; Master #85 closes when all child/conditional obligations are closed; STATUS moves to the next normal V2 operating/development pointer.

---

## Conditional work and the fixed 12-chat count

The planned count remains 12:

~~~text
O6 → Chat 06
O1 → Chat 07
C09-triggered O3 → Chat 09
O2/O3/O4/O5 from C11 → Chat 11
~~~

A conditional may take several messages and may create a focused GitHub Issue when its trigger fires, but it does not automatically create another fresh-chat boundary.

If an exceptional conditional becomes so large that the same-chat boundary is genuinely unsafe, update this plan and STATUS.json explicitly before creating an extra chat. Never silently change the planned chat count.

## Handoff invariant

The next chat must not depend on prose remembered from the previous chat.

It must be able to reconstruct its state from:

~~~text
GitHub main
+ STATUS.json
+ active Issue
+ directly relevant current code/tests/specs
~~~

That is the acceptance criterion for the multi-chat execution design.
