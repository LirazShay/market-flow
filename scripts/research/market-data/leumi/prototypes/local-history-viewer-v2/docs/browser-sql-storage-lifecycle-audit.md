# Browser SQL V2 — Storage Lifecycle / Archive / Rollover Audit

## Role

This is Pass F2 of Issue #72.

It re-justifies the old mandatory archive/export/database-rollover work after the product-first re-baseline.

Conclusion:

~~~text
mandatory initial V2:
  retain-all
  + no silent pruning
  + truthful storage-pressure/storage-blocked behavior
  + exact owned-storage safety

conditional CND-02:
  archive/export
  + fresh database-epoch rollover
  + rollover journal/recovery UI
~~~

Archive/rollover is promoted into the initial release only when measured capacity/storage evidence shows that the simpler retain-all design cannot safely satisfy the required operating horizon.

This document is planning-only. No product/runtime implementation and no canonical GitHub Issue mutation occurs here.

Authorities:
- Pass D3 normalized DAG;
- E6 enrichment benchmark plan;
- ND-30A/ND-30B capacity split;
- D-038 as historical durable input;
- old WP-39 / Issue #68 as historical execution input.

---

# 1. What survives from D-038 unconditionally

These principles remain mandatory even if CND-02 never activates:

1. default retention is retain-all;
2. no automatic age/session pruning;
3. no silent history deletion to recover quota;
4. no whole-origin OPFS clear;
5. Market Flow may delete only exact entries it owns;
6. storage pressure/failure is explicit health state, never silent data loss;
7. Recorder must not acknowledge persistence that did not durably succeed;
8. recovery never silently resets production storage;
9. any destructive maintenance requires an explicit deliberate boundary.

These are storage-integrity rules, not optional rollover features.

---

# 2. What becomes conditional

The following old WP-39 scope is **not** mandatory for initial V2 unless CND-02 activates:

- user-facing logical archive export;
- archive progress/cancellation UX;
- database_epoch_id solely for rollover lifecycle if no other shipped contract requires it;
- maintenance-mode rollover UI;
- candidate fresh-epoch creation specifically for storage pressure;
- rollover journal;
- old-epoch deletion workflow;
- preserved Scanner config reseeding across storage-pressure rollover;
- rollover-specific crash recovery;
- cross-epoch archive/restore concepts.

If a concept such as database/release identity is already required independently by cutover/recovery/upgrade work, that independent requirement remains owned there; F2 removes only rollover-driven mandatory scope.

---

# 3. Why rollover should not be built by default

Without measured need, rollover adds substantial complexity:

~~~text
storage-pressure policy
+ maintenance mode
+ export semantics
+ second DB creation
+ epoch switching
+ crash journal
+ configuration reseeding
+ cleanup/delete safety
+ extra Viewer states
+ recovery verification
~~~

The simpler safe initial design is:

~~~text
retain all committed SQL history
→ observe measured storage/headroom
→ warn/block truthfully before unsafe writes
→ never delete automatically
~~~

If this design satisfies representative and safety-margin operation, extra rollover machinery has no proven initial-release value.

---

# 4. CND-02 activation decision belongs to ND-30A

CND-02 is evaluated only on the integrated candidate at ND-30A.

Inputs must include the actual shipped shape:

~~~text
raw/current/history
+ selected enrichment
+ Current/Detail
+ shipped Scanner
+ real CHECKPOINT/reopen behavior
+ representative payload/storage growth
~~~

Do not activate rollover from an early schema-size estimate alone.

---

# 5. Required capacity evidence

ND-30A must measure at least:

- bytes per committed cycle;
- bytes per snapshot;
- growth slope over representative data;
- CHECKPOINT temporary/steady-state storage effect where observable;
- reopen/readiness as DB grows;
- memory impact if correlated with DB size;
- actual browser storage estimate/quota information where reliably exposed;
- successful-write headroom near the tested high-water mark;
- behavior when storage allocation/write/checkpoint fails;
- representative full-session projection;
- configured safety-margin/stress projection.

All measurements carry:
- exact build/schema identity;
- dataset/payload profile;
- cycle count;
- environment/browser class;
- correctness counters.

Unknown quota semantics remain Unknown; do not invent a percentage.

---

# 6. Evidence-derived reserve

Do not use a hardcoded rule such as:

~~~text
roll over at 80% quota
~~~

Instead derive a reserve from actual operations the system must still be able to complete safely.

Conceptually the reserve must cover the largest proven relevant combination of:

~~~text
one complete incoming cycle
+ transaction/COMMIT working space
+ CHECKPOINT/recovery working space
+ runtime metadata/journal safety
+ measurement uncertainty margin
~~~

If CND-02 itself is activated, its maintenance flow may require additional temporary space; that requirement is measured separately before rollover is allowed to start.

Exact formula/constant is implementation evidence, not frozen here.

---

# 7. Initial-release operating-horizon gate

Before CND-02 is promoted, define the operating horizon the initial release must safely support.

The horizon is evidence/product driven, for example:
- one representative trading session;
- multiple sessions if that is an explicit current product requirement;
- a stress multiple used only as safety evidence.

Do not convert a historical approximate universe size or one user's current quota into a product invariant.

CND-02 activates when the integrated retain-all candidate cannot meet the required operating horizon with the evidence-derived reserve and acceptable correctness/reopen behavior.

---

# 8. Exact activation conditions

CND-02 becomes mandatory before cutover if **any** of the following is proven on a supported target profile:

## A. Insufficient safe storage headroom

~~~text
projected required operating-horizon bytes
+ evidence-derived reserve
> safely available proven storage headroom
~~~

where safely available headroom is based on browser evidence, not a guessed quota percentage.

## B. Storage failure before required horizon

A representative/stress run reaches quota/allocation/write/CHECKPOINT failure before the required operating horizon.

## C. Retained-history growth causes unacceptable required-operation failure

DB growth alone causes required reopen/readiness/commit behavior to fail the later capacity gate, and fresh-epoch rollover is shown to be the simplest effective remedy.

Do not activate rollover merely because a query becomes slower if ordinary query/schema optimization can solve it more simply.

## D. New explicit product requirement

A real requirement appears for continued recording beyond the proven safe retain-all horizon, making an explicit history-epoch lifecycle necessary.

Product desire must still be translated into capacity evidence; it is not permission for arbitrary deletion.

---

# 9. Conditions that do NOT activate CND-02

Do not promote archive/rollover because:

- the database is 'getting big' without a failed gate;
- the old plan already had WP-39;
- a percentage of quota looks aesthetically high;
- history cleanup feels tidy;
- DuckDB supports DELETE;
- archive sounds useful;
- an isolated benchmark with an unrealistic payload is slow;
- one transient StorageManager estimate fluctuates;
- Scanner query performance can be fixed independently.

Complexity requires a concrete failing requirement.

---

# 10. Baseline storage-pressure behavior when CND-02 is NOT activated

The initial product still needs safe behavior near storage limits.

Required semantics:

~~~text
measured healthy
→ warning/headroom-low when evidence supports it
→ storage-blocked / persistence failure if a safe durable cycle cannot be guaranteed
~~~

Rules:
- warning does not delete data;
- storage-blocked does not delete data;
- Recorder does not continue pretending successful cycles;
- Current/Detail continue to expose the last committed coherent state where readable;
- health explains storage pressure/failure;
- recovery requires space/remediation, not silent reset.

A warning threshold, if implemented, is evidence-derived and environment-aware rather than a fixed universal percentage.

---

# 11. Optional user action without CND-02

If the project wants a manual 'clear/restart history' developer action before CND-02 exists, it must be treated as a separate explicit destructive maintenance/dev capability, not as automatic lifecycle policy.

It must:
- clearly identify the exact Market-Flow-owned database;
- require explicit action;
- never clear whole Leumi-origin storage;
- never masquerade as archive/rollover preservation.

This is not automatically part of initial product scope.

---

# 12. CND-02 selected lifecycle

If activated, the preferred safe model remains whole-database epoch rollover rather than partial history pruning.

Conceptually:

~~~text
current production epoch
→ enter maintenance boundary
→ optionally export logical archive
→ create verified fresh candidate epoch
→ seed only selected durable configuration
→ promote exactly one new production epoch
→ resume Recorder after readiness
~~~

No old market history is silently copied into the fresh live epoch unless a separate import requirement exists.

---

# 13. Why partial DELETE/VACUUM is not the default remedy

The durable concern from D-038 remains valid:

~~~text
row deletion semantics
!=
guaranteed browser quota recovery
~~~

Therefore CND-02 should not be implemented as arbitrary age/session pruning unless new pinned-build/browser evidence proves a safer simpler contract and a durable decision explicitly changes.

Whole-epoch replacement keeps authority/recovery easier to reason about.

---

# 14. Archive is not automatically a backup

If CND-02 activates, logical archive export may be offered before destructive rollover.

Terminology must remain explicit:

~~~text
archive export
!= verified restorable backup
~~~

Until restore/import is specified and tested:
- archive may preserve data for external/future analysis;
- product must not promise one-click restoration;
- archive success must not be described as disaster-recovery proof.

Proceeding without archive may require explicit irreversible confirmation if the old epoch will be deleted.

---

# 15. Export boundedness and security

If archive export ships:
- stream/chunk rather than require unbounded JS memory;
- export only user market-history/config data intentionally included;
- never export cookies/tokens/auth headers/session storage;
- identify source schema/epoch/build;
- include integrity metadata/checksum where practical;
- export failure leaves old production authority untouched;
- cancellation leaves old production authority untouched.

Archive generation is maintenance work and must not race active Recorder writes.

---

# 16. Maintenance entry boundary

Rollover may begin only after:

~~~text
stop new provider-cycle starts
→ settle/abort according to contract any in-flight collection before persistence handoff
→ no pending validated cycle
→ no active SQL write
→ Scanner execution reaches selected safe maintenance boundary
→ current DB CHECKPOINT/readiness confirmed
~~~

Exact Scanner cancellation behavior uses the shipped Scanner resource policy; rollover does not invent a second cancellation system.

---

# 17. Fresh epoch semantics

On successful rollover:
- new epoch has a new explicit identity if epoch identity is part of the selected lifecycle;
- raw/history/current from old epoch are not live-query merged;
- Current becomes available from new committed cycles;
- enrichment horizons warm from actual new-epoch history;
- selected active Scanner SQL/config may be reseeded if explicitly chosen;
- latest old Scanner result/preview does not masquerade as current new-epoch result;
- runtime/health clearly identify the new epoch.

No synthetic predecessor bridges epochs.

---

# 18. What configuration may cross epochs

Configuration preservation must be allowlisted.

Candidate preserved items:
- active Scanner SQL text/config;
- interval;
- user UI preferences that are not market-history state;
- release/runtime configuration required for startup.

Do not carry:
- old market history;
- current/latest market rows;
- old execution preview/result as if current;
- old ingestion token state;
- old recovery/error state that belongs to the previous epoch.

Each preserved item needs an explicit reason.

---

# 19. Rollover authority journal

If CND-02 activates, use a small non-secret maintenance journal/state sufficient to recover from crashes between:

~~~text
old epoch authoritative
candidate created
candidate verified
promotion started
new epoch authoritative
old epoch cleanup optional
~~~

Requirements:
- exactly one provable authority before Recorder restarts;
- journal contains no private session/auth data;
- stale/incomplete journal is recoverable;
- startup never guesses which DB is production;
- ambiguous authority blocks Recorder.

Do not generalize this into the full future engine-upgrade framework unless F3 later proves that is necessary.

---

# 20. Candidate DB space preflight

Rollover itself may require temporary space.

Before starting:
- estimate/measure required candidate DB startup footprint;
- preserve enough reserve for current DB integrity/checkpoint/recovery;
- ensure candidate creation cannot consume the last safe bytes needed to preserve old authority.

If insufficient headroom exists to perform rollover safely:

~~~text
do not start destructive maintenance
→ remain storage-blocked/recovery-required
→ require explicit external/user remediation path
~~~

Do not delete the old epoch first merely to make room for the new one.

---

# 21. Failure matrix if CND-02 activates

Permanent Chromium tests must cover:
- archive fails before rollover;
- archive cancelled;
- maintenance entry fails;
- candidate DB creation fails;
- config reseed fails;
- candidate verification fails;
- promotion crashes before switch;
- promotion crashes after switch metadata but before cleanup;
- old DB cleanup fails;
- browser reload at each journal phase;
- unexpected production-named DB exists;
- insufficient space for safe candidate creation;
- cleanup attempts to address non-owned OPFS entry.

In every case:

~~~text
Recorder remains stopped while authority is ambiguous
and
no unrelated origin storage is deleted
~~~

---

# 22. Old epoch deletion policy

Successful promotion does not require immediate deletion of the old epoch.

Safer default:

~~~text
new epoch authoritative
→ retain old epoch until explicit cleanup/stabilization decision
~~~

This may temporarily consume more storage, so ND-30A must model the maintenance-space requirement if CND-02 is activated.

If capacity is so tight that old+new cannot coexist safely even briefly, the design needs an explicit alternative; silent destructive-first rollover is not acceptable.

---

# 23. Relationship to initial cutover

Initial IndexedDB→SQL cutover remains separate from storage-pressure rollover.

Do not combine:

~~~text
legacy authority migration
and
future SQL epoch rollover
~~~

into one generic complex mechanism unless F3/implementation evidence proves real reuse value.

For initial cutover, the fresh SQL production DB already begins a new SQL history era.

CND-02 is about future SQL storage pressure after/around normal SQL operation, not about importing legacy IndexedDB history.

---

# 24. Relationship to Scanner

Rollover is not a Scanner feature.

If active Scanner configuration is preserved:
- preserve config only;
- no old result rows become new-epoch results;
- scheduler resumes only after new authority READY;
- warm-up/analytical NULLs reflect new history honestly.

Scanner SQL must never silently query multiple live epochs.

---

# 25. Relationship to final capacity

D3 already established:

~~~text
ND-30A integrated capacity assessment
→ if needed CND-02
→ ND-30B final capacity verification
→ L-3
~~~

F2 strengthens this rule:

Any activated CND-02 code invalidates capacity evidence that depended on:
- storage growth;
- CHECKPOINT/reopen;
- maintenance resource use;
- runtime readiness;
- Viewer/Scanner epoch behavior.

ND-30B must test the **post-rollover-capable candidate**, not reuse ND-30A numbers.

---

# 26. ND-30B verification if CND-02 activates

Final capacity must include:
- normal operation before maintenance;
- trigger/warning behavior;
- safe maintenance entry;
- archive path if shipped;
- fresh candidate creation;
- promotion/reopen;
- post-rollover recording;
- Current/Detail/Scanner behavior in new epoch;
- expected warm-up NULLs;
- storage high-water mark during maintenance;
- old/new DB coexistence requirement;
- failure/recovery cases relevant to capacity.

Only then may L-3 begin.

---

# 27. If CND-02 does not activate

Then initial V2 ships without archive/rollover product complexity.

Required retained behavior is simply:

~~~text
retain-all
+ measured storage visibility
+ truthful low-headroom/storage-blocked health
+ no silent deletion/reset
+ exact owned-storage safety
~~~

Pass G should remove WP-39 as a mandatory blocker and represent CND-02 as an evidence-triggered conditional task.

---

# 28. Old WP-39 / Issue #68 disposition

Re-baseline classification:

~~~text
old WP-39 mandatory archive/export/rollover
→ SPLIT

mandatory baseline:
  storage safety / retain-all / explicit failure / owned-OPFS protection

conditional CND-02:
  archive/export
  fresh-epoch rollover
  rollover journal/recovery
  rollover UI
~~~

Issue #68 should not remain a mandatory initial-V2 dependency after Pass G.

If CND-02 is triggered later, create/activate a focused executable Issue from the audited conditional scope rather than reopening the whole old WP unchanged.

---

# 29. D-038 disposition

D-038 currently accepts archive-and-rollover as part of the initial Browser SQL lifecycle.

The re-baseline preserves its integrity principles but narrows its implementation commitment.

Pass G must supersede or amend D-038 so the durable decision reads effectively:

~~~text
default = retain-all
no silent pruning/deletion
storage safety/blocked state mandatory
archive + fresh-epoch rollover = conditional on measured capacity evidence
~~~

If activated, the existing D-038 archive/epoch/recovery safety principles remain strong defaults unless later evidence changes them explicitly.

---

# 30. F2 exit criteria

Pass F2 planning is complete when the future execution graph can answer without guessing:
- what storage behavior is mandatory even without rollover;
- what exact work is conditional;
- which measurements feed the decision;
- what operating-horizon failure activates CND-02;
- why no fixed quota percentage is used;
- what does not activate rollover;
- how storage pressure behaves when CND-02 is absent;
- how archive is distinguished from backup;
- how safe maintenance/epoch promotion works if activated;
- how candidate-space and crash recovery are protected;
- why old/new epochs are never silently merged;
- why capacity must be rerun after CND-02 implementation;
- how Issue #68 and D-038 must be reconciled in Pass G.
