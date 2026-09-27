# Browser SQL V2 — Shadow Verification Audit

## Role

This is Pass F1 of Issue #72.

It re-justifies the old mandatory SQL-shadow migration phase after the product-first re-baseline.

Conclusion:

~~~text
shadow is NOT a mandatory migration architecture
shadow is a conditional diagnostic verification fallback
~~~

The old WP-32/WP-33 design remains historical evidence. It must not remain on the mandatory execution path merely because it existed in the earlier 42-WP plan.

This document is planning-only. No product/runtime implementation and no canonical GitHub Issue mutation occurs here.

Authorities:
- D-043 product shape;
- Pass D3 normalized DAG;
- V1-on-SQL checkpoint matrix;
- V1↔V2 parity plan;
- self-verifying live-gates plan;
- migration/cutover strategy as historical durable input.

---

# 1. Why mandatory shadow is no longer justified

The old plan used shadow to reduce migration uncertainty:

~~~text
one live provider cycle
→ IndexedDB authority
→ SQL candidate shadow
→ compare both
~~~

After the re-baseline, the migration already has stronger and more targeted evidence:

~~~text
collector characterization
+ deterministic shared parity oracle
+ fault injection
+ Chromium SQL persistence/reopen
+ trusted-read parity
+ self-verifying L-2 on the real provider
+ ND-16 freshness/closure matrix
~~~

A permanent mandatory shadow phase would add:
- a second persistence path;
- extra orchestration;
- dual-state comparison machinery;
- extra failure modes;
- cleanup burden;
- risk that temporary migration code becomes permanent architecture.

Therefore shadow must earn its existence from a concrete unresolved uncertainty.

---

# 2. Default decision

Default state:

~~~text
CND-01 shadow = NOT ACTIVATED
~~~

ND-16 proceeds using deterministic parity + Chromium + L-2.

If those gates fully resolve the migration contract, no shadow code is written.

This is the preferred KISS outcome.

---

# 3. Activation gate

CND-01 may activate only when **all** are true:

1. the affected deterministic parity scenarios are green or cannot reproduce the uncertainty;
2. L-2 can execute far enough to expose the real-provider uncertainty;
3. the uncertainty is material to V1-on-SQL correctness/cutover confidence;
4. existing bounded live assertions cannot resolve it safely;
5. comparing the same validated live cycle across legacy V1 authority and SQL candidate is expected to resolve it;
6. an explicit shadow experiment contract is written before implementation.

If one of these is false, shadow is not the right tool.

---

# 4. Required activation record

Before implementing any shadow path, create a bounded activation record containing:

~~~text
uncertaintyId
contractArea
exact unresolved question
why deterministic parity is insufficient
why L-2 alone is insufficient
expected comparison facts
number/duration of required live cycles
legacy authority release identity
SQL candidate identity
shadow DB identity
PASS condition
FAIL/block condition
cleanup inventory
owner
~~~

No generic 'run shadow for confidence' activation is allowed.

---

# 5. Authority model while shadow is active

Exactly one authority remains user-visible and production-success-defining.

Before initial SQL cutover:

~~~text
IndexedDB legacy runtime = authority
SQL shadow DB = disposable verification candidate only
~~~

Rules:
- SQL shadow never drives Current/Detail/Scanner production surfaces;
- SQL shadow failure never changes legacy persistence success/failure semantics;
- SQL shadow never becomes fallback authority;
- legacy IndexedDB and shadow SQL are never merged;
- candidate data cannot be promoted by renaming a flag/file;
- shadow uses a distinct non-production DB identity.

Shadow is comparison instrumentation, not dual authority.

---

# 6. One provider collection only

If CND-01 activates, the comparison must not issue a second independent provider collection merely for SQL.

Required source flow:

~~~text
one normal authenticated provider collection
→ one exact validated complete-cycle payload
→ legacy authoritative persistence
→ shadow comparison handoff of the same validated facts
~~~

The shadow branch receives the same immutable validated-cycle facts rather than recollecting provider data.

This avoids comparing different market moments and avoids changing provider traffic.

---

# 7. Failure isolation ordering

Preferred pre-cutover diagnostic ordering:

~~~text
validated complete cycle
→ legacy authoritative persistence reaches its normal success boundary
→ shadow candidate consumes the same validated cycle
~~~

Reason:
- shadow failure cannot delay or redefine the authoritative legacy success path;
- authority semantics remain unchanged;
- comparison can still use the exact validated market facts.

If an experiment needs parallel fan-out for a specific timing question, that exception must be explicitly justified in the activation record and must still preserve legacy authority/failure isolation.

---

# 8. Shadow database isolation

Shadow DB must be unmistakably non-production.

Requirements:
- separate logical database/OPFS identity;
- probe/shadow namespace includes experiment/run identity;
- never equal production SQL DB identity;
- never equal legacy IndexedDB identity;
- cleanup can address it exactly;
- startup cannot auto-promote it;
- normal Viewer runtime does not discover/use it.

Cleanup must never clear unrelated origin storage.

---

# 9. Comparison surface

Compare only facts relevant to the activation uncertainty.

Potential comparison dimensions:
- canonical current membership;
- requested/received/unique counts;
- raw source preservation fingerprints;
- null/zero/empty/missing distinctions;
- current/latest selected values;
- history membership/order;
- trusted-read outputs;
- selected enrichment facts only if the uncertainty occurs after ND-20;
- timing/source mapping if that is the unresolved contract.

Do not compare private implementation IDs such as:
- IndexedDB auto-increment IDs;
- DuckDB SnapshotIds when only identity invariants matter;
- transaction IDs;
- physical row order;
- index names;
- internal table layout.

---

# 10. Use normalized fingerprints, not authenticated raw dumps

Live shadow evidence must not persist raw authenticated payloads.

Preferred evidence:

~~~text
safe counts
canonical SecurityId membership hashes where needed
canonicalized raw-object hashes
field-presence summaries
normalized value tuples for explicitly allowlisted synthetic/safe fields
comparison status
sanitized mismatch category
~~~

Raw objects may exist transiently in the authenticated runtime because the product already processes them, but they are not committed to GitHub evidence.

---

# 11. Shadow comparison oracle

Shadow is not simply:

~~~text
IndexedDB value == SQL value
~~~

The comparison still obeys the E2 oracle hierarchy.

If V1 legacy behavior conflicts with the current durable contract:

~~~text
do not force SQL to copy a legacy bug
~~~

Each discrepancy is classified using the parity taxonomy:
- IMPLEMENTATION_DEFECT;
- ORACLE_DEFECT;
- SPEC_DEFECT;
- LEGACY_BUG;
- UNKNOWN.

---

# 12. Bounded experiment rule

Every activated shadow experiment is bounded before it starts.

Bound may be:
- N complete cycles;
- a defined time window;
- one targeted event/state transition;
- a small representative endurance period when the uncertainty is temporal.

Unbounded 'leave both running for a while' is prohibited.

At the bound:

~~~text
PASS
or
FAIL
or
UNKNOWN / insufficient evidence
~~~

UNKNOWN does not authorize cutover.

---

# 13. Shadow is not the endurance strategy

The old WP-33 coupled shadow comparison and endurance.

Re-baselined separation:

~~~text
CND-01 shadow
= targeted migration uncertainty resolver

L-3
= final production-shaped live endurance gate
~~~

Do not retain dual persistence just to perform final endurance.

L-3 exercises the final single-SQL-authority candidate after capacity verification.

---

# 14. Activation examples

## Valid activation example

Deterministic fixtures and L-2 are green, but one real provider field appears with a shape/value pattern not represented in synthetic fixtures, and it is unclear whether the legacy V1 path and SQL handoff preserve it identically.

Shadow may compare the exact same validated live cycle on that allowlisted contract dimension.

## Valid activation example

A real-origin timing/order interaction appears only under live provider cadence, and deterministic reproduction cannot establish whether SQL current/history visibility matches the intended legacy product boundary.

A bounded same-cycle shadow experiment may resolve it.

## Invalid activation example

'We want extra confidence before cutover.'

Use the existing ND-16/L-3 gates instead.

## Invalid activation example

'We need performance numbers.'

Use benchmark/capacity plans, not shadow.

## Invalid activation example

'We want old and new systems available forever.'

That violates the one-authority target.

---

# 15. Implementation constraints if activated

Temporary shadow code should be isolated behind an explicit verification-only owner/path.

Requirements:
- no production feature flag that silently selects between authorities;
- no normal Viewer read path to shadow DB;
- no permanent dual-write abstraction introduced 'for reuse';
- no provider API changes;
- no V1 production code rewrite beyond the smallest safe comparison seam;
- generated artifacts clearly identify shadow-verification mode;
- runtime diagnostics clearly state legacy authority + shadow candidate.

Temporary code should optimize for deletion, not extensibility.

---

# 16. Test-first requirements if activated

Before live use, deterministic tests prove:
- one validated fixture feeds both comparison paths;
- legacy authoritative success remains unchanged if shadow throws;
- shadow DB identity cannot equal production identity;
- shadow never drives Viewer data;
- comparison normalizer preserves null/zero/empty/missing;
- mismatch classification works;
- evidence sanitizer rejects raw/auth/session data;
- cleanup deletes only owned shadow state;
- activation bound stops further shadow writes;
- disabling/removing shadow restores the normal single-path legacy candidate behavior.

Chromium runs every modified/added Playwright shadow test after final edit.

---

# 17. Live execution flow if activated

Target flow:

~~~text
user launches generated self-verifying shadow verifier in authenticated session
→ verifier confirms exact legacy + candidate identities
→ normal provider collection runs once
→ legacy authority persists normally
→ candidate shadow receives same validated cycle
→ machine compares only activation-record facts
→ repeat only to configured bound
→ machine emits PASS/FAIL/UNKNOWN
→ machine performs bounded cleanup or marks cleanup-required safely
~~~

The user does not manually compare screens/tables.

---

# 18. Exit conditions

## PASS

All targeted uncertainty assertions are resolved consistently with the durable contract.

Then:

~~~text
record sanitized evidence
→ retain only durable regression/oracle improvements
→ remove shadow scaffolding
→ rerun affected ND-16 evidence
~~~

Shadow PASS itself does not directly mark ND-16 complete.

## FAIL

A material discrepancy is confirmed.

Then:

~~~text
classify discrepancy
→ fix owning layer/spec/oracle
→ retain regression
→ rerun deterministic evidence
→ rerun shadow only if the original live uncertainty still requires it
~~~

## UNKNOWN

Evidence remained insufficient.

Then:

~~~text
ND-16 remains verification-pending
→ explicitly decide next evidence path
~~~

Do not extend the shadow indefinitely by default.

---

# 19. Mandatory cleanup/disposition

Every shadow-owned artifact is inventoried before activation.

Examples:
- shadow DB naming/config;
- validated-cycle fan-out hook;
- comparison module;
- temporary diagnostics;
- shadow UI/status indicator;
- special build profile;
- test-only runtime branch;
- live evidence runner profile.

At experiment closure, each item gets:

~~~text
REMOVE
PROMOTE_TO_GENERIC_TEST_INFRASTRUCTURE
PROMOTE_TO_PERMANENT_PUBLIC_REGRESSION
~~~

No item gets 'leave it around just in case'.

---

# 20. What may remain after shadow removal

Durable outputs may include:
- sanitized evidence summary;
- new synthetic fixture reproducing discovered edge case;
- public-contract regression;
- corrected oracle/spec;
- generic comparison helper that has value outside dual persistence and does not retain authority coupling.

Must not remain in final production path:
- dual-write fan-out;
- shadow DB startup;
- runtime authority-mode switch between IndexedDB and SQL;
- Viewer fallback/read merge;
- permanent migration comparison polling.

---

# 21. Relationship to cutover

CND-01 is not an ordinary prerequisite for ND-32.

Default:

~~~text
ND-16 passes without shadow
→ later normal DAG continues
~~~

If shadow is activated:

~~~text
ND-16 evidence gap
→ CND-01
→ resolve uncertainty
→ remove shadow
→ rerun affected ND-16 gates
→ ND-16 PASS
~~~

By final integration/cutover there should be no active shadow migration path.

---

# 22. Relationship to rollback

Shadow is unrelated to post-cutover rollback authority.

Rollback uses an explicit retained legacy release/data snapshot strategy as defined by the cutover/upgrade plan.

Do not keep dual-write shadow alive as a rollback mechanism.

That would create permanent dual authority and ambiguous history.

---

# 23. Old WP-32/WP-33 disposition

Re-baseline classification:

~~~text
old WP-32 mandatory shadow implementation
→ REMOVE from mandatory initial-V2 graph
→ REPLACE by conditional CND-01 activation task only if evidence triggers it

old WP-33 mandatory shadow comparison/endurance
→ SPLIT
  shadow comparison → conditional CND-01 only
  endurance → final L-3 gate on single SQL authority
~~~

Pass G should materialize this disposition in the canonical GitHub graph and retire/replace the old Issues rather than leaving them as mandatory blockers.

---

# 24. Decision audit

Existing migration/cutover documentation that states temporary coexistence as a baseline must be reconciled in Pass G.

The preserved truths are:
- exactly one authority at a time;
- no legacy-history import for initial cutover unless separately required;
- candidate/probe DB isolation;
- no permanent compatibility layer;
- explicit cutover/rollback.

The revised truth is:

~~~text
temporary shadow coexistence is optional and evidence-triggered, not baseline mandatory migration work
~~~

If D-035 wording implies mandatory shadow, Pass G must supersede/clarify it.

---

# 25. F1 exit criteria

Pass F1 planning is complete when the future implementation graph can answer without guessing:
- whether shadow is mandatory;
- exactly what activates it;
- what evidence must exist before activation;
- what authority remains authoritative;
- how one provider collection feeds comparison;
- what may be compared;
- what may not be compared;
- how authenticated data is kept out of evidence;
- how long the experiment runs;
- what PASS/FAIL/UNKNOWN mean;
- how shadow results feed back into ND-16;
- what must be removed afterward;
- why final endurance and rollback do not require permanent dual persistence.
