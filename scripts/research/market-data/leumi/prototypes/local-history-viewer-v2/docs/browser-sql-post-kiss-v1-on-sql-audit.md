# Browser SQL V2 — Post-KISS V1-on-SQL Planning Audit

## Role

This is the second post-KISS consistency audit under Issue #72.

Scope:
- V1-on-SQL implementation manual;
- V1↔V2 parity plan;
- self-verifying live-gates plan;
- V1-on-SQL checkpoint matrix.

Goal:

~~~text
preserve strong correctness
while
removing duplicated verification machinery and over-decomposition
~~~

This audit does not implement runtime/product code and does not yet mutate canonical GitHub execution Issues.

Current scope authority: browser-sql-kiss-scope-reset.md.

---

# 1. Overall conclusion

The V1-on-SQL planning is technically strong but operationally over-specified for the daily local product.

The core proof can be reduced to:

~~~text
A. real-site DuckDB feasibility
→ B. minimum SQL storage core
→ C. Recorder + trusted reads + Current/Detail
→ D. parity + one bounded live provider proof
→ V1-on-SQL checkpoint
~~~

The detailed E1/E2/E3/E4 documents remain useful reference/edge-case material, but must not become the normal implementation checklist.

---

# 2. What remains mandatory

Keep these invariants unchanged:

- inherited V1 provider contract;
- dynamic universe;
- canonical SecurityId;
- exact complete-cycle validation;
- raw MapHeat/Security preservation;
- null/zero/empty/missing distinction;
- one complete cycle becomes visible atomically;
- failed cycle does not partially advance Current/History;
- reopen same SQL DB without silent reset;
- Current/Detail use trusted application reads;
- stable history order/paging with equal timestamps;
- Viewer notifications are hints, authority is reread state;
- Current/Detail parity with V1 public behavior;
- live authenticated origin proves what mocks cannot;
- no credentials/session material in evidence;
- Fast CI + Browser CI at the meaningful checkpoint.

These remain high-value initial-V2 work.

---

# 3. Implementation manual classification

## KEEP

From E1 retain the substance of:

- collector characterization;
- L-1 real-origin SQL feasibility;
- minimum SQL Authority/Worker;
- atomic raw/current/history persistence;
- reopen/recovery;
- trusted read contracts;
- Current Universe migration;
- Detail/History migration;
- Recorder→SQL integration;
- L-2 bounded live provider verification;
- V1-on-SQL checkpoint.

## SIMPLIFY / MERGE

The old A..Q sequence is too granular.

Recommended compact grouping:

### K2A — collector contract + minimum SQL authority

~~~text
characterize preserved collector
+ one SQL Worker
+ minimum schema
+ generated runtime identity
~~~

Packaging/build reproducibility is part of the runtime work, not a separate mini-project.

### K2B — atomic persistence + reopen

~~~text
validated complete cycle
→ one bulk/transactional SQL persistence path
→ reopen/recovery
→ no silent reset
~~~

Durability/retry mechanisms are implemented only to the extent needed by the proven browser behavior.

### K3A — trusted reads + Viewer bridge

~~~text
small trusted read API
+ authoritative reread/resync
~~~

Do not create a large generic ViewerState framework.

### K3B — Current + Detail/History + Recorder integration

One coherent product migration slice:

~~~text
normal Recorder
→ SQL
→ Current
→ Detail/History
~~~

### K3C — parity + L-2 + checkpoint

One final migration proof rather than several nested checkpoints.

---

# 4. Verification-core infrastructure is overbuilt

E1-A proposed a generic verification core with:
- evidence schemas;
- classification metadata;
- temporary-POC disposition metadata;
- fault-injection registration conventions.

Classification: SIMPLIFY.

Initial V2 only needs:

~~~text
normal test output
+ generated live verifier PASS/FAIL
+ exact build/commit identity
+ sanitized failure stage
~~~

Use ordinary test fixtures and GitHub Actions as the evidence system.

Do not build a bespoke verification platform unless actual implementation demonstrates repeated pain.

Verified/Inferred/Unknown remains a reasoning/documentation convention, not a runtime framework requirement.

---

# 5. Collector characterization stays small

E1-B is KEEP but should mostly reuse existing V1 tests.

Do not rebuild a second full collector test suite.

Add only missing characterization/regressions required to freeze:

~~~text
dynamic universe
sequential chunks
canonical IDs
exact completeness checks
raw preservation
value distinctions
failed cycle does not persist
~~~

If existing V1 tests already prove a behavior at the public boundary, reference/reuse them.

---

# 6. L-1 becomes one minimal early live probe

E1-C / E3 L-1 is KEEP + SIMPLIFY.

L-1 needs to answer only:

~~~text
Does pinned DuckDB-Wasm work on the authenticated Leumi origin with the persistence primitive we need?
~~~

Minimum automatic checks:
- injected runtime starts;
- Blob Worker works;
- pinned Worker/Wasm load;
- OPFS DB opens;
- synthetic write + COMMIT;
- required durability action for the chosen design succeeds;
- Worker/runtime reopen reads the marker;
- probe-owned cleanup;
- sanitized PASS/FAIL.

Remove from L-1:
- production Web Lock ownership proof;
- generic multi-context framework unless needed for the persistence check;
- large failure taxonomy;
- generic L1/L2/L3 verifier platform;
- elaborate evidence schema.

Cross-tab ownership belongs near final single-owner integration.

---

# 7. Minimum SQL schema is much smaller

E1-D is KEEP but remove assumptions inherited from the old wide analytical schema.

Initial schema needs only enough to support V1-on-SQL:

~~~text
cycle/session identity as needed
current universe
history snapshots
raw MapHeat
raw Security
stable snapshot/cycle ordering identity
latest/current lookup
minimal schema/build identity
~~~

An idempotency token is added only if the chosen handoff/acknowledgement design creates a real retry ambiguity that needs it.

No horizon links, derived metrics or Scanner tables.

---

# 8. Durability should be proven, not ritualized

E1-G and the current ND-16 wording hardcode:

~~~text
COMMIT
→ CHECKPOINT
→ acknowledgement
for every successful cycle
~~~

Classification: RE-EVALUATE / SIMPLIFY.

Initial contract should be:

~~~text
the runtime must not acknowledge a cycle as safely persisted unless the pinned browser/DB behavior proves it can survive the supported reopen/restart boundary
~~~

Implementation should experimentally verify the minimum mechanism.

If explicit CHECKPOINT per cycle is required, keep it.

If DuckDB/OPFS provides the required durability with a cheaper safe cadence, use the simpler proven cadence.

Likewise, retain ingest-token reconciliation only if the selected message/durability boundary can produce committed-but-unacknowledged ambiguity.

Atomicity remains non-negotiable; a particular durability ritual is not.

---

# 9. Remove the separate persistence checkpoint

E1-H / ND-08 duplicates evidence already required to build the storage core.

Classification: MERGE.

Instead:

~~~text
finish K2B atomic persistence/reopen
→ run its Node/Chromium tests
→ if green, proceed to trusted reads
~~~

No separate named persistence checkpoint Issue is required.

Full Browser CI remains appropriate after the coherent storage/runtime slice.

---

# 10. Trusted reads remain, but keep the API tiny

E1-J is KEEP.

Minimal semantic surface:

~~~text
getCurrentUniverse()
getSecurityCurrent(SecurityId)
getSecurityHistoryPage(SecurityId, cursor, limit)
getHealth/readiness()
~~~

Do not introduce repository/service layers beyond what makes the Viewer independent from physical DuckDB tables.

Keep:
- committed-only visibility;
- exact current membership;
- not-current vs unknown;
- bounded history;
- stable total ordering;
- equal-timestamp continuation;
- no duplicate/skip.

---

# 11. Viewer bridge/health is over-generalized

E1-K is KEEP + SIMPLIFY.

Needed:

~~~text
Viewer requests current authoritative state
→ runtime answers
→ later commit notification says 'reread'
~~~

Needed states can stay close to existing V1 behavior.

Do not build a generic shared shell state framework before the Scanner exists.

At V1-on-SQL stage, only Current/Detail attachment, reload, missed notification and runtime-unavailable/read-error behavior are necessary.

Scanner-specific shell state waits for Scanner work.

---

# 12. Current and Detail remain the key product proof

E1-L/E1-M are KEEP.

These are not overengineering because they are the actual existing product.

Preserve V1-observable behavior where still intentional:

### Current
- membership;
- relevant values;
- deterministic default/user sort;
- zero/missing rendering;
- live committed-cycle refresh;
- manual DB/runtime reread;
- row→Detail navigation.

### Detail/History
- canonical selected SecurityId;
- current summary;
- newest-first history;
- bounded load-older;
- equal-timestamp-safe continuation;
- no duplicate/skip;
- live refresh while Detail remains open;
- history after leaving current universe;
- Back state where practical.

Do not add Scanner concepts here.

---

# 13. Recorder→SQL integration should occur before UI polishing is declared complete

The old manual placed Recorder integration after Current/Detail units.

Classification: REORDER slightly.

More natural compact slice:

~~~text
trusted reads exist
→ normal Recorder writes SQL
→ Current/Detail consume those SQL reads
→ integrated parity
~~~

UI can be developed against fixtures first, but the V1-on-SQL product checkpoint must exercise the normal Recorder→SQL→Viewer path.

---

# 14. Parity plan: keep the oracle, reduce ceremony

E2 contains valuable correctness thinking.

KEEP:
- compare public behavior, not DB internals;
- durable contract outranks accidental legacy behavior;
- synthetic deterministic fixtures;
- same scenario can verify collector/storage/Viewer effects;
- null/zero/empty/missing must remain distinct;
- legacy bug is not automatically a requirement;
- unresolved material ambiguity blocks the affected claim.

SIMPLIFY:
- no mandatory oracleVersion metadata system;
- no special parity result artifact for every scenario;
- no standalone mismatch-classification subsystem;
- no elaborate source-area freshness engine.

Ordinary test files, fixture versions in source control, failure diffs and Git history are sufficient unless implementation proves otherwise.

---

# 15. Replace 23 numbered parity scenarios with six scenario families

The 23 scenarios are useful edge cases but should not become 23 planning/checkpoint entities.

Use six coherent families:

## P1 — normal and changing universe

Covers:
- normal complete cycles;
- universe grows/shrinks;
- security enters/leaves/returns;
- missing optional universe metadata.

## P2 — source-value truthfulness

Covers:
- null;
- zero;
- empty string;
- missing;
- changed raw fields across cycles.

## P3 — invalid/partial provider cycles

Covers:
- duplicate ID;
- missing requested ID;
- unexpected ID;
- malformed response;
- provider failure mid-cycle.

Expected common rule:

~~~text
no successful SQL state advancement
~~~

## P4 — persistence/reopen integrity

Covers:
- failure before commit;
- retry ambiguity if the chosen design can produce it;
- reopen after committed data;
- no duplicate committed cycle.

## P5 — Current/Detail/history behavior

Covers:
- Current sort/display;
- equal timestamps;
- newest-first paging;
- no duplicate/skip;
- Current→Detail→Back;
- live Detail refresh;
- security no longer current.

## P6 — Viewer lifecycle

Covers:
- Viewer opens after existing data;
- missed notification;
- reload/reopen;
- runtime unavailable/reconnect;
- localized read failure.

This preserves all meaningful edge cases while making the plan readable.

---

# 16. Do not require running legacy V1 on every parity test

KEEP the E2 independent-oracle idea, but implement it simply.

Preferred:

~~~text
sanitized deterministic fixture
+ expected observable values derived from current contract/V1 characterization
→ run SQL-backed product
→ assert
~~~

Use V1 itself only while characterizing an unclear behavior or when an existing V1 test is the easiest trusted oracle.

No permanent dual test runtime is required.

---

# 17. Live verification plan is over-frameworked

E3 proposes one reusable verifier framework for L-1/L-2/L-3, assertion schemas, broad taxonomies, cleanup registries and evidence freshness machinery.

Classification: SIMPLIFY strongly.

Initial V2 needs three different things, not a platform:

## Live probe A — early L-1

Small synthetic origin/Worker/Wasm/OPFS/reopen probe.

## Live probe B — V1-on-SQL L-2

One bounded production-shaped cycle proving:
- real provider path still works;
- exact validation succeeds;
- same validated data reaches SQL;
- committed SQL state can be read back;
- no auth/session material is exported.

## Final live run

Later, after Scanner/single-owner/day-workload verification, run the actual candidate for a representative real session and inspect machine-collected correctness/health summaries.

These may share small helper functions, but there is no requirement for a generalized gate-profile framework.

---

# 18. Live evidence format becomes minimal

Each live artifact only needs enough safe evidence to answer its question.

Minimum common fields:

~~~text
probe/run kind
candidate build/commit identity
browser version
PASS / FAIL
failed stage when any
safe aggregate counters needed by that probe
~~~

Keep strict sanitization:
- no cookies/tokens/auth headers;
- no account identifiers;
- no raw authenticated response dumps.

Do not build a universal failure taxonomy before real failures demand one.

---

# 19. L-2 should be one small bounded real-provider proof

KEEP + SIMPLIFY.

L-2 should prove:

~~~text
real MapHeat2 + GetSecuritiesData
→ exact complete-cycle validation
→ same validated handoff
→ SQL commit/durable-success boundary
→ trusted read smoke
~~~

Useful safe counters:
- requested;
- received;
- unique;
- duplicate/missing/unexpected count;
- chunk count/order summary;
- committed cycle identity/count;
- safe raw-preservation fingerprint where useful.

Do not try to prove every null/zero/empty edge case live; deterministic fixtures own those.

---

# 20. L-3 is not part of the V1-on-SQL checkpoint

The detailed L-3 endurance design remains later reference.

After KISS reset the final proof is better phrased as:

~~~text
representative daily workload in Chromium
+ bounded final authenticated live run
~~~

Do not build an L-3 framework now while implementing V1-on-SQL.

Final live behavior will be audited later with performance/cutover scope.

---

# 21. ND-16 17-gate matrix is too bureaucratic

The current checkpoint has 17 mandatory named gates, several of which are duplicate labels for evidence already produced by one test suite.

SUPERSEDE the 17-gate presentation.

Replace it with six closure checks:

## C1 — Real-origin premise

Early L-1 PASS for the exact pinned runtime approach.

## C2 — SQL storage core

Node/Chromium prove:
- complete-cycle atomicity;
- raw/current/history correctness;
- reopen/recovery;
- no silent reset/data loss;
- chosen durable-success behavior.

## C3 — Integrated V1 path

Mocked Chromium proves:

~~~text
normal collector
→ validation
→ SQL
→ trusted reads
→ Current/Detail
~~~

## C4 — V1 public-behavior parity

Six parity scenario families green.

## C5 — Bounded live provider proof

L-2 PASS on the exact candidate.

## C6 — Closure verification

~~~text
Fast CI green
+ full Browser CI green
+ security/sanitization guards green
+ relevant specs/docs consistent
~~~

If any of these six fails or contains a material unresolved Unknown, the checkpoint remains verification-pending.

---

# 22. Remove the checkpoint aggregator/freshness engine

E4 proposed a dedicated checkpoint aggregator and mechanical evidence-freshness system.

Classification: REMOVE-FROM-INITIAL-V2.

Use normal engineering discipline:

- CI is tied to commits;
- live probe embeds candidate identity;
- changing affected runtime code requires rerunning affected browser/live evidence;
- STATUS records current verification state;
- final checkpoint review verifies the evidence is for the current candidate.

A bespoke evidence dependency engine is not justified for one local product.

If stale-evidence mistakes actually become recurring, add the smallest guard then.

---

# 23. Candidate identity remains simple and useful

KEEP the idea, simplify fields.

For V1-on-SQL closure it is enough to know:

~~~text
repository commit
generated runtime/build identity
pinned DuckDB Worker/Wasm identity
schema version
~~~

Fixture/oracle versions are normal source-controlled test inputs and do not need a separate release identity tuple.

---

# 24. Shadow remains conditional

KEEP F1 conclusion:

~~~text
no shadow by default
~~~

Only if C1-C5 leave one specific material live migration ambiguity should a bounded temporary comparison be created.

Shadow is not a seventh normal closure check.

---

# 25. Proposed compact V1-on-SQL execution shape

After Pass G, this area should likely become about five executable units:

~~~text
1. L-1 real-site DuckDB feasibility

2. collector characterization + minimum SQL authority

3. atomic SQL persistence + reopen/recovery

4. Recorder/trusted reads + Current/Detail migration

5. parity + L-2 + V1-on-SQL checkpoint
~~~

Exact Issue boundaries may move slightly, but do not recreate E1-A..E1-Q as separate Issues.

---

# 26. Detailed-doc disposition

## browser-sql-v1-on-sql-implementation-manual.md

Classification: SUPERSEDE as canonical implementation sequence; KEEP as cold detailed reference.

Pass G should create a compact successor implementation plan and mark this document as historical/reference.

## browser-sql-v1-parity-verification-plan.md

Classification: SIMPLIFY.

Keep its oracle principles and edge-case inventory, but replace 23 mandatory numbered scenarios/metadata machinery with compact scenario families.

## browser-sql-self-verifying-live-gates-plan.md

Classification: SUPERSEDE as generalized verifier architecture; KEEP useful live-security/automation rules.

Use small purpose-built generated probes.

## browser-sql-v1-on-sql-checkpoint.md

Classification: SUPERSEDE 17-gate matrix with six closure checks.

---

# 27. Post-KISS V1-on-SQL acceptance test

The implementation plan is simple enough when a fresh engineer can explain this phase as:

~~~text
prove DuckDB works on Leumi
→ store the same complete V1 cycle atomically in SQL
→ reopen it
→ make Current/Detail read SQL
→ prove the same public behavior
→ prove one real provider cycle end-to-end
~~~

If implementation requires understanding evidence registries, 17 gates, 23 named parity scenarios or a generic live-gate framework before writing the storage core, this area is still over-planned.
