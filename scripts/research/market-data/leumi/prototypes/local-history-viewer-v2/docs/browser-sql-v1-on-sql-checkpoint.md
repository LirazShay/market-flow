# Browser SQL V2 — V1-on-SQL Checkpoint Gate Matrix

## Role

This is Pass E4 of Issue #72.

It defines the exact closure contract for ND-16.

Detailed authorities:

- implementation sequence: `browser-sql-v1-on-sql-implementation-manual.md`;
- parity/oracle rules: `browser-sql-v1-parity-verification-plan.md`;
- live evidence: `browser-sql-self-verifying-live-gates-plan.md`;
- dependency order: `browser-sql-rebaseline-dependency-dag.md` Pass D3.

This document is deliberately concise. It is a closure matrix, not a duplicate implementation manual.

---

# 1. Product statement being proven

ND-16 proves exactly this:

~~~text
same inherited V1 provider/collector contract
→ one durable SQL market-data authority
→ trusted application reads
→ Current Universe
→ Security Detail/History
~~~

ND-16 does not prove:

- analytical enrichment;
- Dynamic SQL Scanner;
- production cross-tab ownership;
- final capacity;
- L-3 endurance;
- production cutover.

---

# 2. Checkpoint states

Allowed ND-16 states:

~~~text
in-progress
verification-pending
complete
~~~

Transition rule:

~~~text
implementation work finishes
→ verification-pending
→ all mandatory fresh gates PASS
→ complete
~~~

Any mandatory FAIL, UNKNOWN, missing evidence or stale evidence keeps ND-16 at verification-pending.

There is no partial PASS.

---

# 3. Mandatory gate matrix

| Gate | Required result | Primary evidence |
|---|---|---|
| G16-01 Collector characterization | PASS | deterministic Node/browser characterization |
| G16-02 Real-origin SQL premise L-1 | PASS | sanitized self-verifying live evidence |
| G16-03 SQL persistence foundation ND-08 | PASS | Fast + Chromium/full Browser evidence |
| G16-04 Runtime build reproducibility | PASS | build/manifest guards |
| G16-05 Recorder→SQL integration | PASS | mocked Chromium integration |
| G16-06 Trusted SQL read contracts | PASS | deterministic + Chromium contract tests |
| G16-07 Current Universe parity | PASS | parity corpus + Viewer browser tests |
| G16-08 Detail/History parity | PASS | parity corpus + Viewer browser tests |
| G16-09 Viewer lifecycle/recovery | PASS | Chromium lifecycle/reconnect suite |
| G16-10 Full mandatory parity corpus | PASS | all E2 mandatory scenarios |
| G16-11 Live provider compatibility L-2 | PASS | sanitized self-verifying live evidence |
| G16-12 Fast CI | PASS | exact candidate commit |
| G16-13 Full Browser CI | PASS | exact candidate commit |
| G16-14 Security/artifact sanitization | PASS | automated guards |
| G16-15 Evidence freshness | PASS | dependency/freshness guard |
| G16-16 No unresolved Unknown | PASS | evidence aggregation |
| G16-17 Documentation/contract consistency | PASS | planning/spec guards + final review |

Every row is mandatory.

---

# 4. Gate details

## G16-01 Collector characterization

Must prove the preserved provider/collector contract:

- dynamic MapHeat2 universe;
- sequential GetSecuritiesData behavior;
- canonical `String(PaperId or Key)`;
- requested/received/unique/duplicate/missing/unexpected accounting;
- raw MapHeat/Security preservation;
- null/zero/empty/missing distinctions;
- failed/partial cycle never becomes successful persistence input.

Failure means the migration baseline itself is not frozen.

## G16-02 L-1

Must be a machine-judged PASS on the authenticated target origin for the tested runtime premise.

Synthetic Chromium evidence alone is insufficient.

## G16-03 Persistence foundation

Must prove:

- atomic successful-cycle visibility;
- durable COMMIT/CHECKPOINT boundary;
- acknowledgement/retry idempotency;
- reopen/recovery;
- fault isolation;
- no silent destructive reset.

## G16-04 Runtime build reproducibility

The exact runtime tested by L-2 and Browser CI must be generated reproducibly and identify its pinned Worker/Wasm/runtime build.

Hand-edited release artifacts invalidate this gate.

## G16-05 Recorder→SQL

Must prove the existing collector feeds the SQL durable boundary without changing provider semantics.

Viewer refresh must not trigger provider fetching.

## G16-06 Trusted reads

Must prove committed-only reads and stable public semantics for:

- Current Universe;
- selected-security current state;
- bounded history paging;
- stable cursor/tie-breaker;
- health/read state.

Viewer code must not rely on arbitrary physical SQL tables.

## G16-07 Current Universe parity

Must prove preserved public behavior, including:

- membership;
- values;
- deterministic sorting;
- missing/zero display;
- refresh;
- navigation;
- RTL/accessibility contract.

## G16-08 Detail/History parity

Must prove:

- canonical SecurityId;
- current summary;
- newest-first history;
- bounded paging;
- equal-timestamp continuation;
- no duplicate/skip;
- live refresh;
- not-current semantics;
- return-state behavior.

## G16-09 Viewer lifecycle/recovery

Must include:

- open after existing data;
- missed notification;
- reload;
- close/reopen;
- runtime reconnect;
- localized surface failures;
- no duplicate Recorder caused by Viewer behavior.

## G16-10 Full parity corpus

Every mandatory E2 scenario must be PASS or explicitly NOT_APPLICABLE only for an individual contract area where E2 allows it.

A mandatory scenario itself may not be skipped.

## G16-11 L-2

Must prove one bounded production-shaped provider→validation→SQL durable path on the authenticated origin.

No human judgement substitutes for verifier assertions.

## G16-12 / G16-13 CI

Both must target the same candidate dependency surface.

A green Fast CI from one commit plus Browser CI from an older relevant runtime commit is not a checkpoint PASS.

## G16-14 Security

Public artifacts/logs/evidence must pass automated sanitization/redaction rules.

A functionally correct build with unsafe evidence is not releasable and does not pass ND-16.

## G16-15 Freshness

Every evidence item must still apply to the candidate being closed.

The checkpoint aggregator should reject stale evidence rather than relying on human memory.

## G16-16 Unknown

No mandatory contract area may remain Unknown.

Unknown is a blocker, not a warning.

## G16-17 Documentation consistency

Durable contracts must match the behavior actually accepted by the checkpoint.

Do not leave specs claiming IndexedDB authority after SQL-backed behavior is accepted.

Live progress still belongs only in STATUS.json.

---

# 5. Evidence freshness matrix

At minimum, these changes invalidate prior evidence:

| Changed area | Evidence to rerun |
|---|---|
| provider/collector logic | collector characterization, downstream parity, L-2 |
| runtime bootstrap/Worker/Wasm packaging | affected Browser runtime suite, L-1, L-2 |
| SQL schema/persistence/transaction logic | persistence checkpoint, read/parity suites, L-2 |
| CHECKPOINT/ack/recovery logic | persistence/recovery suites, L-2 |
| trusted Current read contract | Current parity, relevant Viewer lifecycle, Browser CI |
| history/cursor contract | Detail/History parity, paging scenarios, Browser CI |
| Current Viewer behavior | Current parity/UI tests |
| Detail Viewer behavior | Detail/History parity/UI tests |
| runtime reconnect/notification logic | Viewer lifecycle/recovery |
| parity fixture/oracle | every affected parity scenario; full corpus before closure |
| evidence sanitizer/export logic | sanitizer suite + affected live evidence export |
| build manifest/generated runtime | build guards + any live gate whose tested artifact changed |

A change outside an evidence item's dependency surface does not automatically invalidate it.

The final implementation should encode this mapping mechanically where practical.

---

# 6. Candidate identity rule

Checkpoint evidence must converge on one candidate identity.

Conceptually:

~~~text
repository commit
+ generated runtime build
+ schema version
+ engine asset identities
+ fixture/oracle versions
~~~

Live evidence may be produced later than CI, but it must identify the compatible candidate it verifies.

If implementation changes after L-2, the owner must determine mechanically whether L-2 is stale.

No "close enough" build matching.

---

# 7. Closure algorithm

The eventual checkpoint aggregator should behave conceptually as:

~~~text
collect mandatory evidence
→ validate schema
→ validate candidate identity
→ validate freshness
→ reject FAIL
→ reject UNKNOWN
→ reject missing evidence
→ reject stale evidence
→ require Fast CI PASS
→ require full Browser CI PASS
→ require L-1 PASS
→ require L-2 PASS
→ emit ND-16 PASS
~~~

The aggregator itself should have deterministic unit tests.

---

# 8. Failure routing

## Deterministic test failure

~~~text
classify owning contract
→ fix implementation or oracle/spec as E2 requires
→ retain useful regression
→ rerun affected evidence
~~~

## L-1 failure

~~~text
do not enter heavy SQL implementation
→ reopen Browser SQL runtime premise
~~~

## L-2 failure

~~~text
keep provider contract fixed
→ diagnose Recorder/runtime/SQL integration
→ rerun affected deterministic suites
→ rerun L-2
~~~

## Unknown

~~~text
create targeted evidence/decision work
→ remain verification-pending
~~~

## Stale evidence

~~~text
rerun only the evidence invalidated by the changed dependency surface
→ then reevaluate the whole checkpoint
~~~

---

# 9. Conditional shadow activation

CND-01 may activate only when:

- deterministic parity is otherwise green;
- L-2 can execute;
- one material migration uncertainty still cannot be resolved with existing deterministic/browser/live evidence.

Flow:

~~~text
ND-16 remains verification-pending
→ temporary shadow evidence
→ resolve uncertainty
→ remove/retire temporary shadow machinery
→ rerun affected ND-16 gates
~~~

Shadow is never accepted as a permanent dual-authority workaround.

---

# 10. Explicit non-gates

The following must not delay ND-16:

- enrichment horizon selection;
- predecessor links;
- derived metrics;
- Scanner SQL lifecycle;
- Scanner editor/grid;
- Scanner performance;
- cross-tab production ownership;
- archive/rollover;
- final capacity;
- L-3;
- production cutover.

These belong to later normalized-DAG nodes.

---

# 11. STATUS.json closure rule

During implementation:

~~~text
ND-16 implementation assembled
→ currentFocus.status = verification-pending
~~~

Only after G16-01..G16-17 are all fresh PASS:

~~~text
ND-16 = complete
→ currentFocus advances to ND-18 enrichment selection
~~~

If a later change invalidates an ND-16 guarantee before cutover, the affected evidence must be rerun; STATUS must not pretend the invalidated guarantee is still verified.

---

# 12. E4 exit criteria

Pass E4 planning is complete when another implementer can answer, without interpretation:

- exactly what ND-16 proves;
- exactly what it does not prove;
- every mandatory gate;
- what result each gate requires;
- how candidate identity is matched;
- which changes stale which evidence;
- what prevents completion;
- how failures route;
- when STATUS may advance.

E1, E2 and E3 remain the detailed execution authorities behind this matrix.
