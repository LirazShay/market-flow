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
