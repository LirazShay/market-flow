# Browser SQL V2 — Self-Verifying Live Gates Plan

> **Reference-only / superseded live-gate design.** Current initial-V2 live boundaries are C01, controlled single-tab C06/L-2, and the no-overlap C12 release transition. Use the active Issues, D-044 and `tests/TESTING_POLICY.md`; do not implement the old L-3 framework from this file.


## Role

This is Pass E3 of Issue #72.

It defines the live-verification architecture for:

~~~text
L-1 — real-origin Browser SQL feasibility
L-2 — real provider + Recorder→SQL compatibility
L-3 — production-shaped live endurance
~~~

The live gates exist only for facts deterministic CI cannot prove.

This document is planning-only. It does not implement runtime/product code and does not mutate the canonical GitHub Issue graph.

Dependency authority: browser-sql-rebaseline-dependency-dag.md Pass D3.

Parity authority: browser-sql-v1-parity-verification-plan.md.

---

# 1. Core automation-first rule

Human participation is limited to unavoidable browser/session boundaries.

Preferred flow:

~~~text
user is already authenticated in Leumi
→ user invokes one generated verifier
→ verifier performs all machine-checkable actions
→ verifier judges every assertion
→ verifier cleans probe-owned state
→ verifier emits sanitized evidence
→ overall PASS / FAIL / Unknown
~~~

The user is not asked to inspect DevTools, inspect OPFS manually, compare tabs manually, count provider responses manually, inspect raw SQL tables, or decide whether a condition passed.

If a browser user-gesture restriction requires an extra click, that click starts/resumes automation; it does not replace machine judgement.

---

# 2. What live verification may and may not do

## Allowed

- run inside the user's already-authenticated page context;
- call the same provider APIs already used by Market Flow;
- create synthetic probe-only SQL/OPFS state;
- open a controlled same-origin child/window/tab where browser policy permits;
- read bounded runtime/provider metadata needed for assertions;
- download/export sanitized JSON evidence;
- clean only assets/state created by the verifier.

## Forbidden

- requesting credentials from the user;
- copying cookies/session tokens/Authorization headers;
- bypassing WAF/access controls;
- retaining authenticated raw provider dumps;
- uploading private browser/session data;
- deleting unrelated Leumi-origin OPFS/storage;
- treating a manual visual check as PASS evidence.

---

# 3. One verifier framework, three gate profiles

Do not build three unrelated scripts.

Use one versioned verifier framework with explicit profiles:

~~~text
profile = L1
profile = L2
profile = L3
~~~

Shared framework responsibilities:
- exact build/runtime identity;
- step orchestration;
- assertion recording;
- PASS/FAIL/Unknown semantics;
- timeouts;
- cancellation/abort;
- sanitization;
- probe-owned resource registry;
- cleanup;
- evidence export;
- failure-stage reporting.

Gate-specific modules own only their assertions/actions.

---

# 4. Evidence identity

Every live evidence artifact must identify exactly what was tested.

Minimum identity:

~~~text
schemaVersion
gate
probeVersion
repositoryCommit
runtimeBuildId
runtimeArtifactHash or equivalent
duckdbPackageVersion
duckdbCoreVersion
workerAssetIdentity
wasmAssetIdentity
browser name/version
OS/platform category
startedAt
completedAt
originClass = authenticated-leumi
~~~

Do not include full URL query strings if sensitive, cookies, storage keys unrelated to Market Flow, or account/user identifiers.

If an identity cannot be safely captured, report a sanitized category/hash or Unknown rather than leaking it.

---

# 5. Assertion record schema

Each machine assertion conceptually emits:

~~~json
{
  "id": "L1-OPFS-OPEN",
  "status": "PASS",
  "classification": "Verified",
  "startedAt": "...",
  "completedAt": "...",
  "durationMs": 123,
  "safeDetails": { "stage": "opfs-open" }
}
~~~

Allowed statuses:

~~~text
PASS
FAIL
UNKNOWN
NOT_APPLICABLE
~~~

Allowed evidence classifications:

~~~text
Verified
Inferred
Unknown
~~~

A gate overall result is PASS only when every mandatory assertion is PASS.

A mandatory UNKNOWN means overall UNKNOWN, not PASS.

---

# 6. Failure taxonomy

At minimum classify live failures as:

~~~text
BOOTSTRAP_BLOCKED
WORKER_BLOCKED
WASM_LOAD_FAILED
WASM_COMPILE_BLOCKED
OPFS_UNAVAILABLE
OPFS_OPEN_FAILED
SQL_WRITE_FAILED
COMMIT_FAILED
CHECKPOINT_FAILED
REOPEN_FAILED
SAME_ORIGIN_CONTEXT_BLOCKED
WEB_LOCKS_UNAVAILABLE
LOCK_SEMANTICS_FAILED
PROVIDER_MAPHEAT_FAILED
PROVIDER_SECURITIES_FAILED
PROVIDER_VALIDATION_FAILED
SQL_DURABLE_ACK_FAILED
RUNTIME_RESTART_FAILED
VIEWER_READ_FAILED
SCANNER_EXECUTION_FAILED
CLEANUP_FAILED
SANITIZATION_FAILED
TIMEOUT
UNKNOWN_FAILURE
~~~

The artifact stores sanitized stage/error categories, not private response bodies.

---

# 7. Cleanup contract

Every verifier-owned resource is registered when created.

Examples:

~~~text
probe DB logical name
probe OPFS path
probe Web Lock name
controlled child context
temporary BroadcastChannel
temporary timers/listeners
download object URLs
~~~

Cleanup runs in a finally-style path after PASS or FAIL where possible.

Rules:
1. never clear all origin storage;
2. delete only verifier-owned probe names;
3. production market-history DB is read-only to L-1;
4. L-2/L-3 may use the production candidate only according to their gate purpose;
5. cleanup failure is separately reported;
6. a cleanup failure cannot be hidden by otherwise successful assertions.

---

# 8. Sanitization-before-export rule

Evidence is built in two layers:

~~~text
internal assertion state
→ sanitizer/allowlist
→ exportable evidence
~~~

Only allowlisted fields reach the downloadable artifact.

Before export, scan for prohibited material patterns/categories:
- cookie/header/token-like fields;
- Authorization;
- account identifiers;
- provider raw bodies;
- arbitrary DOM dumps;
- arbitrary localStorage/sessionStorage values;
- full Scanner result rows unless explicitly synthetic and allowed.

If sanitization fails:

~~~text
gate overall = FAIL
evidence export contains only sanitization-failure metadata
~~~

No unsafe fallback dump is produced.

---

# 9. L-1 — Real-origin Browser SQL feasibility

## Purpose

Answer one early question:

~~~text
Can the selected browser SQL runtime primitives work on the real authenticated Leumi origin?
~~~

L-1 is not a production-data test.

## Mandatory assertions

### L1-01 bootstrap

The generated verifier can execute in the authenticated page context.

### L1-02 Blob Worker

Create a verifier-owned Blob Worker.

### L1-03 exact engine assets

The Worker loads exactly the pinned Worker/Wasm identities. No silent CDN/latest fallback.

### L1-04 OPFS capability

Required OPFS APIs exist and the probe DB can open.

### L1-05 synthetic SQL write

Create probe-only table/state and write a synthetic marker.

### L1-06 transaction commit

COMMIT completes successfully.

### L1-07 checkpoint

CHECKPOINT completes successfully.

### L1-08 Worker teardown/reopen

Terminate/recreate the SQL Worker and reopen the same probe DB.

### L1-09 marker persistence

The exact synthetic marker is recovered after reopen.

### L1-10 page/runtime relaunch evidence

Where technically automatable without losing the evidence runner, exercise the supported runtime/page relaunch boundary.

If browser navigation would destroy the runner irrecoverably, use a controlled same-origin child context or explicit two-phase continuation token owned by the verifier.

The user must not manually inspect persistence.

### L1-11 controlled cross-context primitive check

Create a controlled same-origin context when required for browser primitive verification.

This may test Web Locks primitive semantics if the implementation is ready, but failure of full production ownership architecture does not block the early SQL premise unless the selected runtime itself requires it.

### L1-12 cleanup

Remove only the L-1 probe DB/resources.

### L1-13 sanitization/export

Generate sanitized machine-readable evidence.

## L-1 PASS meaning

Verified on the exact tested authenticated origin/build:
- Worker delivery works;
- Wasm works;
- OPFS persistence works;
- COMMIT/CHECKPOINT works;
- reopen works;
- probe cleanup/evidence is safe.

It does not prove provider compatibility, production schema correctness, V1 parity, Scanner behavior, or production cross-tab ownership.

---

# 10. L-1 two-phase continuation design

Some browser lifecycle assertions may require a real page reload/relaunch.

If one JavaScript invocation cannot survive it, use a verifier-owned continuation protocol:

~~~text
phase 1
→ create random probeRunId
→ persist only synthetic continuation marker
→ request/perform allowed reload/relaunch
→ phase 2 detects probeRunId
→ verify persisted marker
→ finish cleanup/evidence
~~~

Continuation data must contain no session secret.

It should be narrowly namespaced and expire automatically.

A stale interrupted probe must be recognizable and safely cleanable on next verifier launch.

---

# 11. L-2 — Real provider + Recorder→SQL compatibility

## Purpose

Answer:

~~~text
Does the production-shaped candidate preserve the real V1 provider/validation contract through the new SQL durable boundary?
~~~

L-2 runs after Recorder→SQL integration exists.

## Mandatory assertions

### L2-01 runtime identity

The executing runtime matches the exact candidate build.

### L2-02 MapHeat2 success

One normal provider cycle obtains the dynamic universe through the preserved flow.

Evidence stores counts/IDs only in sanitized aggregate/hashed form where necessary.

### L2-03 canonical identity

Every requested security identity is normalized by the preserved canonical rule.

### L2-04 sequential GetSecuritiesData behavior

Record enough metadata to prove chunk count/order, no overlap if sequentiality is required, request completion before next request, and no alternate provider path introduced by SQL migration.

Do not export request headers or bodies.

### L2-05 exact validation accounting

Machine-compute:

~~~text
requested
received
unique
duplicates
missing
unexpected
~~~

Successful cycle requires exact complete validation.

### L2-06 raw handoff preservation

Verify structural/hash-based preservation of full raw MapHeat/Security facts across the collector→SQL handoff without exporting private raw objects.

Use safe canonical serialization/hash/count/field-presence evidence.

### L2-07 source-value distinction checks

Where the live cycle actually contains examples, verify distinctions such as null/zero/empty/missing.

Absence of a naturally occurring example is UNKNOWN/NOT_APPLICABLE for that sub-assertion, not fabricated evidence.

Deterministic parity fixtures remain the primary proof for all variants.

### L2-08 SQL durable acknowledgement

The successful validated cycle reaches the defined COMMIT/CHECKPOINT/durable-ack boundary.

### L2-09 trusted read smoke

Read back bounded committed facts through the application-owned read contracts and verify cycle/security consistency.

### L2-10 no session leakage

Verify the Worker/evidence/export contains no copied authentication/session material.

### L2-11 safe evidence

Export sanitized L-2 result; do not retain raw provider dump.

## L-2 failure rule

If provider collection succeeds but SQL integration fails:

~~~text
do not change provider semantics to make SQL work
→ classify the integration defect
→ fix SQL/runtime boundary
→ rerun deterministic suites
→ rerun L-2
~~~

---

# 12. L-2 boundedness

L-2 is not an endurance run.

It should execute only enough real provider work to prove one or a small bounded number of complete production-shaped cycles.

Long-duration stability belongs to L-3.

This reduces unnecessary authenticated data handling.

---

# 13. Production ownership live evidence

Cross-tab ownership is a production invariant owned by ND-28.

It should reuse the verifier framework.

## Required automated flow

~~~text
owner context A launches
→ A requests exclusive stable Web Lock with ifAvailable:true
→ A reports acquired
→ verifier opens controlled same-origin context B
→ B attempts same lock
→ B reports denied while A holds
→ assert B opened no production DB / started no Recorder
→ A releases/closes controlled ownership
→ B retries
→ B reports acquired
→ readiness/recovery completes before Recorder start
~~~

Required negative assertions:
- no steal:true;
- no heartbeat/localStorage election override;
- no second production DB owner;
- no second Recorder;
- hidden/background owner is not displaced merely for being hidden.

The user does not switch tabs and interpret outcomes.

---

# 14. L-3 — Production-shaped live endurance

## Purpose

Answer:

~~~text
Can the final pre-cutover candidate operate coherently over a representative live session after capacity verification?
~~~

L-3 occurs only after final three-surface integration, final post-change capacity verification, and all activated conditional mechanisms have been implemented and reverified.

## Precondition identity

L-3 refuses to start if its expected candidate identity differs from repository commit, generated runtime build, schema/version tuple, or engine assets.

This prevents accidentally testing an old candidate.

---

# 15. L-3 machine-collected evidence

Over the configured endurance window collect bounded counters/summaries.

## Collection
- cycles attempted;
- cycles completed;
- cycles failed;
- validation failures;
- requested/received/unique aggregate checks;
- maximum pending validated cycles;
- no-overlap violations.

## Persistence
- cycles durably acknowledged;
- retry/reconciliation count;
- storage errors;
- checkpoint failures;
- reopen/recovery checks if exercised.

## Trusted reads
- Current read success/failure counts;
- Detail/history read success/failure counts;
- coherence checks against latest committed cycle.

## Scanner

Only if shipped:
- scheduled executions;
- successful;
- zero-row success;
- errors;
- cancelled/interrupted;
- overlap violations;
- latest-success attribution checks;
- bounded result/preview counters.

Do not export arbitrary result rows.

## Ownership/runtime
- owner identity transitions;
- forbidden duplicate-owner observations;
- runtime restart/re-attach checks;
- Viewer client attach/re-attach summaries.

## Performance/health
- bounded service-time summaries;
- backlog high-water mark;
- memory/storage observations only where reliably measurable;
- stale/stopped/error periods.

---

# 16. L-3 duration policy

The planning contract does not invent a magic duration now.

The configured endurance window must be long enough to exercise many real cycles, normal provider variation, repeated SQL writes/checkpoints, repeated trusted reads, and repeated Scanner scheduling if shipped.

The eventual implementation Issue should define the exact duration from capacity/performance evidence and practical provider/session constraints.

Evidence records the actual duration.

---

# 17. L-3 pass/fail conditions

L-3 fails on any mandatory invariant violation, including:
- partial successful cycle;
- validation mismatch promoted as success;
- duplicate successful cycle from retry;
- false durable acknowledgement;
- split-brain production ownership;
- unbounded pending-cycle growth;
- Scanner overlap when prohibited;
- corrupted Current/Detail read coherence;
- unexplained storage/runtime failure;
- unsafe evidence leakage.

L-3 does not fail solely because one query returns zero rows.

A successful empty Scanner result is normal.

---

# 18. Interrupted live run semantics

If the page/browser closes unexpectedly:

~~~text
run = INTERRUPTED
not PASS
~~~

On next launch:
- detect verifier-owned unfinished run metadata;
- perform safe cleanup/reconciliation;
- export an interrupted summary if safe;
- start a new run with a new run ID.

Do not merge two interrupted sessions into one PASS.

---

# 19. Live evidence freshness

Live evidence is valid only for the dependency surface it exercised.

Examples:
- runtime packaging change → L-1 may need rerun if Worker/Wasm/bootstrap surface changed;
- provider/Recorder integration change → L-2 stale;
- schema/durability change → L-2 stale;
- ownership implementation change → ownership live evidence stale;
- Scanner/runtime/capacity-affecting change after L-3 → L-3 stale;
- any activated conditional mechanism after final capacity → final capacity and downstream L-3 stale.

Final guards should encode these relationships explicitly.

---

# 20. Evidence storage/public-repo boundary

Permitted durable repository evidence:
- sanitized JSON summary;
- workflow/run IDs;
- commit/build hashes;
- aggregate counts;
- assertion statuses;
- safe timing summaries;
- safe field-presence/hash summaries.

Not permitted:
- raw authenticated provider payloads;
- cookies/tokens;
- request headers containing auth;
- account/user identifiers;
- full session storage dumps;
- screenshots containing private account/session information.

If evidence cannot be safely sanitized, store only the assertion classification and enough non-sensitive diagnostics to reproduce locally.

---

# 21. CI preflight for every live verifier

Every live verifier must have deterministic CI coverage before asking the user to launch it.

Use synthetic pages/mocks to test:
- happy path;
- each major failure classification;
- timeout handling;
- continuation/relaunch logic;
- same-origin controlled context;
- cleanup after PASS;
- cleanup after FAIL;
- stale probe recovery;
- sanitization rejection;
- evidence-schema validation.

A live gate is not ready merely because its JavaScript builds.

---

# 22. Generated artifact rule

Live verifiers are generated release artifacts.

Required:

~~~text
readable source
→ deterministic build
→ generated launch artifact
→ build identity embedded
→ tests verify generated artifact matches source/build manifest
~~~

Do not hand-edit the launched bookmarklet/runtime artifact.

The artifact must know which commit/build it is claiming to verify.

---

# 23. User launch UX

The eventual runbook should be minimal.

Target flow:
1. open/log in to the normal Leumi page;
2. invoke the generated verifier;
3. if browser requires one user gesture for controlled child context/download, approve that explicit step;
4. verifier runs;
5. verifier presents one clear terminal result: PASS, FAIL with sanitized failure stage, or UNKNOWN with reason;
6. verifier offers/creates sanitized evidence artifact.

No multi-page checklist should be required for normal execution.

---

# 24. Relationship to current L-1 runbook

The existing browser-sql-live-gate-l1.md remains historical/current preparation input until implementation replaces it.

Its manual Tab-A/Tab-B judgement model is not the target.

During implementation planning/materialization, the canonical L-1 runbook should be rewritten to point to the generated self-verifying runner.

Do not delete useful failure notes or synthetic preflight history; move durable lessons into the new runbook/tests.

---

# 25. Gate ownership summary

~~~text
L-1
owner: Browser SQL premise
blocks: heavy SQL Authority implementation

L-2
owner: provider + Recorder→SQL compatibility
blocks: ND-16 V1-on-SQL product checkpoint

Ownership live gate
owner: ND-28
blocks: final three-surface production integration

L-3
owner: final production-shaped candidate
blocks: cutover
~~~

---

# 26. E3 exit criteria

Pass E3 planning is complete when implementation has an unambiguous answer to:
- how one verifier framework supports all live gates;
- what the user must and must not do;
- what each gate proves;
- what each gate explicitly does not prove;
- how same-origin/multi-context assertions are automated;
- how reload/relaunch continuation works;
- how raw authenticated data is kept out of artifacts;
- how cleanup is bounded;
- how PASS/FAIL/Unknown is calculated;
- how interrupted runs are classified;
- how evidence is tied to the exact build;
- when live evidence becomes stale;
- what deterministic CI must prove before a live artifact is used.

The next Pass E work can define the V1-on-SQL checkpoint in a concise gate matrix using E1, E2 and E3 as its detailed authorities.