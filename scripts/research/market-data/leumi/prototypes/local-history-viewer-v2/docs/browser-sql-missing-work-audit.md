# Browser SQL V2 — Missing-Work Audit

## Role

This document owns Pass C of Issue #72.

Pass B classified the old WP-01..WP-42 graph. Pass C ignores old package boundaries and asks:

~~~text
What executable work does the product actually require
that still has no clear owner?
~~~

This is still planning-only.

The old WP graph is historical evidence/input, not a structure that must be preserved.

---

# Pass C1 — Missing V1-on-SQL executable ownership

## C1-01 — V1 collector characterization contract

### Missing owner

The plan says "preserve the V1 collector", but there is no standalone executable owner whose job is to freeze and prove the **observable collector contract before storage replacement**.

### Required work

Create deterministic synthetic characterization for the inherited collector covering:

- MapHeat2-derived dynamic universe;
- canonical `String(PaperId or Key)`;
- sequential GetSecuritiesData chunk planning/order;
- no overlapping cycles;
- requested/received/unique counts;
- duplicate/missing/unexpected IDs;
- response-shape failure;
- source timing fields;
- full raw MapHeat + Security preservation;
- `null != 0 != "" != undefined`;
- failed provider/validation cycle does not become successful persistence input.

### Why separate ownership matters

WP-09/WP-23 preserve the handoff/integration, but without a characterization baseline they can accidentally preserve the *idea* of V1 while changing observable collection behavior.

### Verification

- Node deterministic collector tests where possible;
- Playwright mocked Leumi flow for browser/page-context behavior;
- sanitized fixtures only.

This should be completed before or alongside the first Recorder→SQL integration work.

---

## C1-02 — Cross-engine parity fixture contract

### Missing owner

There is no first-class owner for feeding the **same validated synthetic market cycles** through the V1 baseline and the V2 SQL path and comparing observable outcomes.

### Required work

Build a reusable parity corpus containing at least:

- normal dynamic-universe cycles;
- security enters universe;
- security leaves universe;
- missing optional MapHeat metadata;
- null/zero/empty/missing distinctions;
- equal timestamps;
- repeated cycles with changed market fields;
- failed/partial cycle;
- retry/idempotency scenario.

Expected comparison targets:

~~~text
validated cycle facts
current/latest membership
per-security history membership/order
raw source preservation
selected V1 display fields
failure/non-commit behavior
~~~

### Boundary

Do not compare private storage implementation details such as IndexedDB keys versus DuckDB physical layout.

Compare public/observable contracts.

### Verification

This becomes a durable automated parity harness because it protects the central storage-migration promise.

---

## C1-03 — Stable trusted SQL read-contract specification

### Missing owner

CAP-DB-07 exists, but the old graph has no explicit package that defines the application-owned SQL read API **before** Viewer adaptation.

The Viewer must not couple directly to arbitrary tables or user Scanner SQL.

### Required contract surface

At minimum:

~~~text
getCurrentUniverse()
getSecurityCurrent(SecurityId)
getSecurityHistoryPage(SecurityId, cursor, limit)
getMarketHealthSnapshot()
~~~

Exact names are implementation details; the semantic boundary is not.

Each contract must define:

- input validation;
- committed-state visibility;
- ordering;
- missing/not-found behavior;
- empty success versus read failure;
- null/zero/empty preservation;
- stable DTO/result shape;
- bounded result behavior;
- authority/readiness errors.

### Why this is first-class work

It creates a durable seam:

~~~text
SQL schema/storage
→ trusted read contract
→ Runtime Controller
→ Viewer
~~~

This makes schema evolution and Viewer changes less coupled.

---

## C1-04 — Current Universe SQL read semantics

### Missing owner

The old WP-28 bundled this with Viewer migration.

The SQL-side current read needs its own contract/proof.

### Required semantics

- exactly one current row for every security in the latest **complete committed** universe;
- no row dropped because optional universe metadata is missing;
- security leaving the current universe disappears from Current Universe while historical rows remain;
- all required V1 bank fields are representable;
- canonical SecurityId preserved;
- source collection timing preserved;
- read never observes half of a cycle;
- deterministic base ordering contract or explicitly unordered data contract with sorting owned by Viewer.

### Verification

Use transaction/failure injection and dynamic-universe fixtures.

---

## C1-05 — Security current/detail read semantics

### Missing owner

The product needs a stable current/detail result for one SecurityId independent of the history query.

### Required semantics

- canonical SecurityId lookup;
- current row from latest complete committed state;
- useful universe metadata joined by SecurityId, never array position;
- missing optional metadata does not fabricate/not-found the security;
- explicit not-in-current-universe behavior;
- preserved raw/source facts needed by the detail surface.

---

## C1-06 — History ordering and cursor/continuation contract

### Missing owner

"load older" exists in V1 behavior, but SQL pagination correctness is not explicitly owned.

This is important because ordering only by timestamp is insufficient when multiple rows can share a timestamp.

### Required contract

Define a stable total order, for example conceptually:

~~~text
collectedAtMs DESC
+ stable snapshot/cycle identity tie-breaker
~~~

and a continuation cursor derived from that total order.

Must prove:

- newest-first;
- bounded first page;
- next page continues strictly after the prior boundary;
- no duplicate rows;
- no skipped rows;
- equal timestamps are safe;
- one SecurityId only;
- history remains available after security leaves current universe.

The exact cursor encoding is implementation detail.

### Verification

Permanent deterministic paging tests + Chromium SQL integration.

---

## C1-07 — Committed-read consistency contract

### Missing owner

Atomic writes are specified, but the read side also needs an explicit promise:

~~~text
trusted product reads observe only coherent committed state
~~~

### Required work

Prove that during a cycle transaction:

- Current Universe never sees a partial new universe;
- detail never points at a new row while history/current metadata is old;
- history continuation does not expose uncommitted rows;
- failed cycle leaves reads on the prior committed state.

This belongs with trusted SQL read contracts and atomicity integration.

---

## C1-08 — SQL-backed Viewer notification/resync contract

### Missing owner

V1 proves:

~~~text
notification is a hint
DB is truth
~~~

The SQL target needs the equivalent explicit behavior even though the Viewer no longer opens the DB directly.

### Required contract

~~~text
commit succeeds
→ runtime may emit metadata notification/state revision
→ Viewer requests authoritative state/read contract
→ notification payload is never market-data authority
~~~

Must cover:

- missed notification;
- Viewer opens after several cycles;
- Viewer reload;
- multiple Viewers;
- Viewer close does not stop Recorder;
- Runtime/Worker restart;
- manual refresh is runtime/DB-only, never provider fetch.

This is broader than transport mechanics; it is a product consistency contract.

---

## C1-09 — Automated V1 Current/Detail behavior-parity harness

### Missing owner

Existing tests describe V1 behavior, but the new plan needs a deliberate **migration parity suite** rather than merely rewriting tests against new internals.

### Required parity areas

Current Universe:

- row membership/count;
- relevant field values;
- default sort;
- numeric/string sort toggles;
- deterministic null ordering;
- null/empty/zero formatting;
- row→detail navigation;
- DB/runtime-only manual refresh;
- live committed-cycle refresh.

Detail/History:

- selected security identity;
- current summary;
- newest-first history;
- bounded initial page;
- load older;
- duplicate/skip-safe continuation;
- detail stays open on new cycle;
- return preserves main-table state where practical.

Viewer states:

- boot/loading;
- empty;
- stopped/stale/error with last valid data preserved;
- read failure != empty success;
- reload/reopen reconstruction.

### Test strategy

Prefer:

~~~text
same synthetic scenario
→ V1 expected observable model/fixture oracle
→ V2 SQL-backed Viewer
→ compare public behavior
~~~

Do not keep the old IndexedDB implementation running in production just to perform parity.

---

## C1-10 — V1-on-SQL product checkpoint owner

### Missing owner

Pass B identified the need, but it does not yet exist as a standalone execution unit.

### Required exit truth

The checkpoint must prove:

~~~text
same inherited collector contract
→ durable SQL authority
→ trusted read contracts
→ Current Universe
→ Security Detail/History
~~~

with:

- Fast CI green;
- full Browser CI green;
- parity suite green;
- fault-injection/reopen coverage green;
- self-verifying live provider compatibility status explicit;
- no enrichment/Scanner dependency unless proven necessary.

This checkpoint is the boundary after which the storage migration itself is considered product-proven.

---

# C1 findings

## Finding C1-01 — parity is work, not just a test checkbox

V1 parity requires explicit characterization data, expected observable semantics and a reusable comparison harness.

It deserves executable ownership.

## Finding C1-02 — trusted reads are a missing architectural seam

The corrected product should not jump directly from DuckDB schema to Viewer UI.

A stable application-owned read boundary is needed.

## Finding C1-03 — SQL paging requires stronger identity than timestamp alone

History continuation must use a deterministic total order and cursor semantics.

This must be decided before Viewer pagination is implemented.

## Finding C1-04 — read consistency is part of transaction correctness

Atomic persistence is incomplete as a product guarantee unless trusted reads are proven to observe only committed coherent state.

## Finding C1-05 — notification semantics survive the storage migration

The transport may change, but the durable principle remains:

~~~text
notification = hint
authority/read API = truth
~~~

## Finding C1-06 — the old plan is now explicitly replaceable

The replacement execution graph may be written from scratch after Pass C-F.

Old WP numbers/issues remain evidence/history and are not constraints on the final plan shape.


---

# Pass C2 — Missing Viewer/product executable ownership

## C2-01 — Three-surface application shell and navigation model

### Missing owner

D-043 defines three product capabilities, but the old execution graph never gives the shared application shell/navigation model its own clear owner.

The target needs an explicit user-facing structure for:

~~~text
Current Universe
Security Detail/History
Dynamic SQL Scanner
~~~

Security Detail may be a drill-down state rather than a permanent top-level tab, but the navigation rules must be deliberate.

### Required work

Define and verify:

- how the user moves between Current Universe and Scanner;
- how Current/Scanner rows carrying SecurityId open the same Detail/History surface;
- how Back returns to the correct originating surface;
- whether one primary named Viewer window is reused;
- navigation must not start another Recorder or DB authority;
- surface changes do not change collector cadence;
- runtime unavailable/disconnected state is shell-level, not fabricated as empty surface data.

### Verification

Playwright should exercise the complete navigation graph with public UI behavior only.

---

## C2-02 — Shared shell state versus per-surface state ownership

### Missing owner

The current Viewer plan mixes global runtime state, Current table state, Detail state and Scanner state into one broad snapshot concept.

The replacement plan needs explicit ownership boundaries.

### Required state separation

#### Shared shell/runtime state

- runtime connected/unavailable;
- SQL authority readiness;
- Recorder health/freshness;
- storage state;
- current navigation location;
- sanitized shared errors.

#### Current Universe state

- loaded rows;
- active sort column/direction;
- table scroll/viewport state;
- refresh/loading/read error.

#### Detail/History state

- selected SecurityId;
- selected-security current summary;
- loaded history pages/cursor;
- detail loading/read error;
- origin/return state.

#### Scanner state

- draft SQL;
- active SQL/config;
- interval;
- execution/result status;
- Scanner-specific errors/result grid state.

### Why

A Scanner parse error must not put Current Universe into ERROR.
A history-page failure must not erase healthy Current data.
A runtime disconnect is broader than a surface-local read failure.

---

## C2-03 — Explicit surface state machines

### Missing owner

V1 has a Viewer state model, but the three-surface V2 needs a clearer composition model.

### Required states

At minimum distinguish:

~~~text
Shell:
BOOTING
CONNECTED
DISCONNECTED / RUNTIME_UNAVAILABLE
RECOVERY_REQUIRED

Current:
LOADING
EMPTY_NO_COMMITTED_CYCLE
READY
READ_ERROR

Detail:
LOADING
READY
NOT_FOUND / NOT_CURRENT
HISTORY_EMPTY
HISTORY_READ_ERROR

Scanner:
EDITING / READY
ACTIVE
EXECUTING
SUCCESS_EMPTY
SUCCESS_ROWS
ERROR
SUSPENDED if that capability ships
~~~

Exact enum names are implementation details.

### Core rule

~~~text
empty success != loading != read failure != runtime failure
~~~

This must be testable from the UI.

---

## C2-04 — Current Universe presentation-parity owner

### Missing owner

C1 owns SQL read semantics and parity harness infrastructure, but a distinct UI work unit is still needed to adapt and prove the Current Universe surface itself.

### Required behavior

Preserve V1-derived behavior where still applicable:

- Hebrew/RTL;
- expected V1 columns/labels;
- all current securities;
- deterministic default sort;
- single-column interactive sorting;
- null/empty shown as missing while zero remains zero;
- deterministic null-safe ordering;
- percentage/number formatting without invented unit conversion;
- row activation;
- committed-cycle live refresh;
- DB/runtime-only manual refresh;
- loading/empty/read-error states;
- accessible sortable headers and keyboard-visible controls.

### Boundary

Do not add Scanner filtering/ranking semantics to this surface.

Current Universe remains a normal browsing table.

---

## C2-05 — Current Universe state preservation across refresh/navigation

### Missing owner

V1 states that sort/scroll should survive detail round-trips, but the V2 plan lacks explicit executable ownership for this behavior under Controller-driven refresh.

### Required work

Prove:

- sort survives committed-cycle refresh;
- sort survives manual refresh;
- sort and useful scroll/position survive Current→Detail→Back;
- opening Scanner and returning to Current does not unnecessarily reset Current state;
- a runtime reattach restores authoritative data while clearly defining which ephemeral UI state may or may not survive.

### Boundary

Do not persist ephemeral UI state into the market-history SQL authority unless a real product need is established.

---

## C2-06 — Detail/History navigation and lifecycle owner

### Missing owner

Detail behavior is currently distributed across WP-28, read contracts and generic Viewer bridge work.

A coherent user-facing Detail lifecycle needs one owner.

### Required behavior

- open from Current Universe by canonical SecurityId;
- open from Scanner row only when canonical SecurityId is present;
- show selected-security current summary;
- show bounded newest-first history;
- load older without duplicate/skip;
- remain on the same Detail surface when a new committed cycle arrives;
- refresh the selected security without returning to Current;
- Back returns to the correct origin;
- one Detail implementation is reused by Current and Scanner.

---

## C2-07 — Security leaves current universe while Detail is open

### Missing owner

Dynamic universe changes create a real product edge case that the old Viewer plan does not own explicitly.

### Required semantics

If the selected SecurityId has historical data but is no longer in the latest committed universe:

- do not silently close Detail;
- do not fabricate a current row;
- clearly distinguish "not in current universe" from "unknown/no history";
- preserved historical rows remain viewable;
- returning to Current does not reinsert the removed security.

This behavior should be driven by trusted read contracts, not ad-hoc UI inference.

---

## C2-08 — Surface-local refresh semantics

### Missing owner

The product needs explicit behavior for manual refresh on each surface.

### Required semantics

Current refresh:

~~~text
trusted current read
→ no provider request
~~~

Detail refresh:

~~~text
trusted current + history-page reread for selected SecurityId
→ no provider request
~~~

Scanner refresh/resync:

~~~text
runtime/Scanner state reread
→ does not activate or execute a new query unless the explicit Scanner contract says so
~~~

A shell reconnect/resync is not equivalent to provider collection.

---

## C2-09 — Shared health/freshness presentation contract

### Missing owner

Pass B moved minimum health earlier, but the product still needs a UI contract for how shared health relates to the three surfaces.

### Required presentation

At minimum expose:

- Recorder running/stale/stopped/error;
- last durable cycle time/id;
- SQL authority/runtime readiness;
- storage blocked/recovery-required;
- freshness of currently displayed market data.

### Important separation

- shared market/runtime health is visible across surfaces;
- Scanner execution error is Scanner-local;
- Detail history read error is Detail-local;
- surface-local error must not overwrite unrelated healthy shared state.

---

## C2-10 — Runtime disconnect / reattach UX

### Missing owner

The bridge design describes reconnect mechanics, but there is no dedicated user-facing contract for the transition.

### Required behavior

When Runtime Controller disappears/restarts:

- Viewer marks runtime unavailable;
- old in-memory Scanner preview is not presented as current;
- existing market rows may remain visible only if clearly labeled as last known/stale according to the chosen UX;
- on new runtimeInstanceId, Viewer performs full resync;
- no direct DuckDB recovery from Viewer;
- reattach does not start another Recorder;
- a failed reattach remains explicit.

The exact retry/discovery mechanism is implementation detail; the observable state transition is not.

---

## C2-11 — Scanner isolation from V1 browsing surfaces

### Missing owner

D-043 says Scanner is additive, but the execution plan needs an explicit regression owner for that product boundary.

### Required invariants

- Scanner SQL/interval changes never alter provider collection cadence or request behavior;
- Scanner query failure does not break Current/Detail browsing;
- Current/Detail manual refresh does not execute Scanner SQL;
- Scanner result schema never redefines Current Universe columns;
- Scanner sorting/filtering is whatever the SQL returned, not a hidden global Viewer filter;
- Current/Detail sorting remains its own presentation behavior;
- no Scanner state is required to render Current/Detail.

---

## C2-12 — Scanner-to-Detail drill-down contract

### Missing owner

The old plan mentions SecurityId reuse, but the exact navigation contract is not independently owned.

### Required behavior

When Scanner result contains a canonical SecurityId:

- row/cell action may open the shared Detail/History surface;
- no trade/order workflow is started;
- Detail reads authoritative market data by SecurityId rather than trusting arbitrary Scanner result columns as current truth;
- Back returns to Scanner with the prior Scanner draft/result state preserved as defined;
- result rows without a valid SecurityId remain ordinary result rows.

### Security/correctness rule

Arbitrary user SQL output cannot impersonate authoritative Detail data merely by supplying similarly named columns.

Only canonical SecurityId is used as navigation identity.

---

## C2-13 — Accessibility and RTL parity owner

### Missing owner

V1 has explicit accessibility/RTL behavior, but this could be lost when Viewer architecture is replaced.

### Required baseline

- Hebrew/RTL shell for market browsing;
- numeric cells remain readable LTR where appropriate;
- real buttons/controls;
- keyboard-visible focus;
- sortable Current headers keyboard-operable;
- Detail navigation keyboard-operable;
- Scanner editor/control labels usable without hover-only affordances;
- error/health state not conveyed by color alone.

This belongs to public product parity, not optional visual polish.

---

## C2-14 — Viewer-level automated product matrix

### Missing owner

C1 defines V1 parity infrastructure. C2 needs a specific end-to-end Viewer matrix across the new shell.

### Required browser scenarios

At minimum:

~~~text
boot with no committed data
boot with existing committed data
Current → Detail → Back
Current → Scanner → Current
Scanner SecurityId → Detail → Back to Scanner
new committed cycle while on Current
new committed cycle while on Detail
Viewer reload
Viewer close/reopen
Runtime restart/re-attach
surface-local read failure
Scanner query failure while Current remains healthy
security removed from current universe while Detail is open
manual refresh on each surface
multiple Viewer clients observing one runtime where supported
~~~

These should be automated in Playwright with mocked/synthetic provider/runtime state.

---

# C2 findings

## Finding C2-01 — "three surfaces" needs an application-shell owner

Three capabilities written in a product document are not enough.

The replacement plan needs explicit navigation and shell state ownership.

## Finding C2-02 — one giant ViewerStateSnapshot is not a sufficient product decomposition

A transport snapshot may be useful, but implementation ownership should separate:

~~~text
shared runtime state
Current state
Detail state
Scanner state
~~~

This prevents unrelated failures from contaminating other surfaces.

## Finding C2-03 — Detail is shared product infrastructure

Current Universe and Scanner should both navigate into one authoritative Detail/History capability.

Do not create a Scanner-specific detail implementation.

## Finding C2-04 — dynamic-universe removal needs explicit UX

A security can leave the current universe while historical data still exists.

That must be represented truthfully.

## Finding C2-05 — Scanner isolation deserves permanent regression coverage

Because Scanner is powerful and arbitrary, the plan must explicitly prove that adding it cannot redefine or destabilize the V1-derived browsing surfaces.

## Finding C2-06 — V1 usability parity includes accessibility/state behavior

Storage migration should not silently regress RTL, deterministic sorting, null/zero display, keyboard controls or Current↔Detail continuity.

## Finding C2-07 — Viewer work is larger than old WP-25..29 decomposition suggested

A clean rewrite should likely create separate execution owners for:

~~~text
application shell/navigation
shared runtime/health bridge
Current Universe UI
Detail/History UI
Viewer parity matrix
Scanner UI
Scanner→Detail integration
~~~

rather than reconstructing the old M4 package boundaries.


---

# Pass C3 — Missing verification executable ownership

## C3-01 — Verification ownership and evidence traceability

Missing owner: the strategy describes many checks, but the rewritten graph still needs one rule that every work unit names its observable contract, verification layer, durable regression coverage, temporary evidence if any, live-only evidence if any, and exact commit/runtime identity.

Required trace:

~~~text
capability / contract
→ verification owner
→ environment
→ commit/runtime identity
→ PASS / FAIL / Unknown
~~~

This should become mechanically guardable when the new GitHub graph is materialized.

## C3-02 — Versioned sanitized fixture/oracle corpus

Own one reusable corpus for provider, parity, history-cursor, failure and later Scanner scenarios. It must use deterministic seeds/versioning, validate fixture shape, preserve null/zero/empty/missing distinctions, and prove no private authenticated data entered the fixtures.

## C3-03 — Reusable public-boundary fault-injection harness

Create sanctioned test seams for provider failure, validated-cycle rejection, staging/transaction failure, lost acknowledgement after commit, CHECKPOINT/storage failure where injectable, Worker/runtime loss, notification drop, trusted-read failure, Scanner execution failure and asset/capability failure.

Fault injection belongs in test adapters/harness construction, not hidden production backdoors.

## C3-04 — Atomicity crash-point matrix

Permanent Chromium coverage must exercise failure before transaction, during staging, after partial history work, after partial current/latest work, before COMMIT, after COMMIT before acknowledgement, and CHECKPOINT-uncertain branches.

Every case must prove prior committed state remains coherent, no partial success becomes visible, retry semantics are correct, and no false durable-success acknowledgement occurs.

## C3-05 — Restart/reopen recovery matrix

Own the full restart state-space: Viewer reload, Viewer close/reopen, Worker recreation, Runtime Controller restart, page relaunch, supported browser reopen, committed-but-unacknowledged ingest, failed operation, and incompatible/readiness-failure fixtures.

Recovery must distinguish persisted authority from ephemeral runtime state and may never pass by silently resetting the DB.

## C3-06 — Browser capability and negative-delivery matrix

Turn the useful WP-03 POC ideas into reusable Chromium coverage for Blob Worker allowed/blocked, Wasm allowed/blocked, pinned asset success/404/mismatch, OPFS available/unavailable/failing, required API unavailable, repeated runtime launch and test-owned cleanup.

These tests prove our failure handling, not the real Leumi origin.

## C3-07 — Automated cross-tab ownership harness

Two same-origin pages must automatically prove one owner, no DB/provider startup in the loser, same-tab reuse, owner-close release, readiness before takeover, hidden-tab lock retention, notification-loss non-takeover, blocked behavior when Web Locks are unavailable, and absence of steal/fallback election paths.

## C3-08 — Browser lifecycle Viewer matrix

Own Playwright scenarios for Viewer open-after-data, missed notification, reload, close/reopen, two viewers, runtime restart, Current/Detail state preservation where promised, Scanner-local failure isolation, and security removal from current universe while Detail is open.

Tests should use public UI/runtime contracts rather than brittle private DOM hooks.

## C3-09 — Self-verifying Live Gate L-1 runner

Current defect: the live runbook still requires manual Tab A / Tab B Web Locks interpretation.

Replacement requirement: one live probe launched from the authenticated page automatically checks injection, Blob Worker, exact Worker/Wasm, OPFS probe DB, write/COMMIT/CHECKPOINT, reopen, runtime relaunch where automatable, competing same-origin Web Lock behavior, safe cleanup, and emits one sanitized machine-readable PASS/FAIL artifact.

The user's unavoidable role is only entering the authenticated session and launching the probe. The user should not switch tabs, inspect console/DB state, or decide whether assertions passed.

## C3-10 — Self-verifying Live Gate L-2 provider runner

Create one live candidate verifier that automatically checks MapHeat2 success, universe accounting, sequential GetSecuritiesData behavior, requested/received/unique/missing/unexpected validation, raw handoff preservation, canonical IDs, source-value distinctions where observed, SQL durable acknowledgement, and absence of copied auth/session material.

It emits per-check and overall sanitized PASS/FAIL without retaining private raw dumps.

## C3-11 — Self-verifying Live Gate L-3 endurance runner

The production-shaped runtime should collect machine-evaluable evidence over the configured live endurance window: cycle counts, integrity counters, durable SQL commits, reopen/recovery, Current/Detail reads, shipped Scanner scheduling, runtime/storage/query errors and bounded health/timing evidence.

At completion it emits a sanitized PASS/FAIL summary tied to the exact commit/build. The user does not manually inspect every surface.

## C3-12 — Verification evidence artifact schema and freshness gate

Standardize machine-readable evidence identity:

~~~text
repository commit
runtime/release identity
engine/Worker/Wasm identity where relevant
workflow/probe version
browser + OS
fixture/dataset version
test class
timestamps
individual assertions
overall result
Verified / Inferred / Unknown
sanitization declaration
~~~

A previous green run must not silently count for a changed dependent surface. Stale evidence must be mechanically visible.

## C3-13 — Security/redaction verification for emitted artifacts

Automated scanning/allowlisting must cover Playwright traces, screenshots, HTML reports, benchmark artifacts, live-gate JSON, Debug Bundle, workflow logs and generated fixtures before upload/publication.

Forbidden material includes cookies, tokens, Authorization headers, account/private session data, authenticated raw dumps, and arbitrary Scanner rows or full SQL where the diagnostics contract excludes them.

## C3-14 — Target Windows/Chromium automated verification lane

Current Browser CI is Ubuntu. Add a Windows GitHub Actions lane at relevant checkpoints for generated runtime startup, Worker/Wasm loading, OPFS reopen, storage/runtime integration, selected full-system smoke and benchmark sanity/trend runs.

Hosted Windows evidence automates target-OS coverage; it does not replace authenticated-Leumi origin facts. Absolute performance claims remain environment-qualified.

## C3-15 — CI topology and change-impact ownership

The rewritten plan should explicitly own when each layer runs:

~~~text
Fast Node → normal push/PR
targeted Chromium → relevant browser/storage/runtime work
full Browser → coherent checkpoint/final browser state
Windows browser lane → target-OS checkpoints
targeted benchmark → performance-sensitive decisions
heavy/capacity → major checkpoints/pre-cutover
live → only real-origin/provider facts
~~~

Path filters/guards must not accidentally skip a changed contract owner.

## C3-16 — Temporary POC lifecycle/disposition guard

Every temporary POC, fault-injection workflow or benchmark gets an explicit closure disposition:

~~~text
promote to permanent regression
or
remove after evidence is captured
~~~

A work unit cannot close with abandoned temporary runtime hooks/workflows/fixtures unless a later owner is explicit.

## C3-17 — Verification failure review and prevention retention

For meaningful unexpected failures, require:

~~~text
failure
→ root cause
→ fix
→ prevention decision
→ smallest useful public-contract regression/guard
→ rerun required layer
~~~

Do not retain brittle tests merely to memorialize an incident.

# C3 findings

## Finding C3-01 — verification infrastructure needs explicit work owners

Fixtures, fault injection, evidence schemas, sanitization and CI topology are shared engineering assets, not incidental per-feature test details.

## Finding C3-02 — current L-1 is not automation-first enough

Manual two-tab Web Locks judgement must be replaced by a self-verifying live runner. Human involvement may remain only at the authenticated-session launch boundary.

## Finding C3-03 — live gates are executable products

L-1, L-2 and L-3 each need a maintained automated assertion runner, not prose instructions plus human interpretation.

## Finding C3-04 — Linux Chromium, Windows CI and live Leumi prove different facts

Linux Chromium remains the deterministic workhorse. Windows Actions adds target-OS evidence. Only the authenticated page proves live origin/provider facts.

## Finding C3-05 — fault injection should be designed once and reused

Atomicity, acknowledgement ambiguity, Worker loss, notification loss and read/query failures should use sanctioned public-boundary seams rather than ad-hoc private mutations.

## Finding C3-06 — evidence has integrity and freshness requirements

A green result proves only the commit/runtime/environment/fixture dependency set it exercised.

## Finding C3-07 — artifact security includes test output

Traces, screenshots, live evidence and benchmark output are part of the public-repository security boundary.

## Finding C3-08 — user involvement should be reduced to unavoidable authentication boundaries

~~~text
user launches self-verifying artifact
→ machine performs assertions
→ machine emits sanitized PASS/FAIL
~~~

The user is not the manual QA engine.


---

# Pass C4 — Missing analytical enrichment executable ownership

## C4-01 — Enrichment requirement-selection matrix

Create an explicit decision owner for every candidate persisted relationship/metric. Record: analytical question enabled, consumers, reuse frequency, dynamic-query feasibility/cost, ingest cost, storage cost, semantic certainty, correctness risk, and decision = persist / query-time / defer / reject.

Candidates include SnapshotId, predecessor links, LAST-change horizons, DealsDelta horizons, MID and promoted BID/ASK/LAST/deal-count fields. Nothing is persisted merely because it appeared in the old schema draft.

## C4-02 — Provider-field semantic evidence gates

Every promoted/derived source field needs Verified / Inferred / Unknown semantics evidence. At minimum cover LastKnownRate, DailyDealsQuantity, BuyLimit1, SellLimit1 and later promoted fields.

DailyDealsQuantity availability does not prove reset/session semantics. DealsDelta remains disabled/NULL until reset behavior is Verified.

## C4-03 — Canonical horizon-set decision owner

Deliberately decide the initial V2 core horizon set from the current candidates: 10s, 20s, 30s, 60s, 90s, 120s, 300s, 600s.

Decide which horizons need persistent predecessor links, which need persisted metrics, and keep one canonical definition used by schema, ingest, tests and SQL examples.

## C4-04 — Temporal predecessor-selection semantics owner

Explicitly confirm or replace the old at-or-before rule before permanent encoding.

Resolve: at-or-before vs nearest, strict older-than-current rule, irregular gaps, cross-session boundaries, possible maximum-gap policy, equal-timestamp tie-breaking, and index/query strategy.

No predecessor is fabricated when no acceptable historical row exists.

## C4-05 — Persist-vs-query-time decision per enrichment

Persist when a fact is frequently reused, cheap to compute, semantically stable, and its query-time cost justifies storage/write cost.

Prefer dynamic SQL for uncommon/experimental comparisons that are easy to express through full historical rows and links.

## C4-06 — Minimum typed-promotion decision

Re-evaluate the old promoted set: last_rate, daily_deals_quantity, bid1, ask1, mid.

For each field define provider mapping, SQL type, invalid source behavior, raw-presence semantics, query/read consumer, and benchmark evidence that promotion is worthwhile. Raw Security JSON remains preserved.

## C4-07 — Derived-metric formula contract

For LAST change define unit, formula, source fields, NULL conditions, zero-denominator behavior and precision expectations.

For DealsDelta define formula only after reset/day semantics are Verified, including cross-session/day behavior.

For MID verify whether positive bid/ask is an actual product/data rule or merely an old implementation assumption. Never reinterpret zero/null without evidence.

## C4-08 — Horizon warm-up and missing-history contract

Unavailable history means predecessor NULL and derived metric NULL. Prove partial warm-up cases explicitly so Scanner/Viewer can distinguish missing analytical history from numeric zero.

## C4-09 — Concrete enrichment schema evolution

After choices are proven, create a deliberate schema evolution from the already-working V1-on-SQL schema. Add only selected predecessor structures, selected derived metrics, justified promoted fields, required indexes and one schema-version bump.

Do not build the generalized future-upgrade platform here.

## C4-10 — Existing SQL-history backfill/rebuild decision

By enrichment time, V1-on-SQL may already contain raw history. Choose explicitly among: backfill old SQL rows, enrich only post-upgrade rows, or rebuild a fresh development/test DB before production cutover.

Never silently present raw-only historical rows as fully enriched.

## C4-11 — Enrichment rebuildability contract

Guarantee that raw snapshots + SecurityId + SnapshotId + collection timestamps + verified promoted values are enough to rebuild selected predecessor links and metrics.

Derived values remain rebuildable performance aids, not irrecoverable source facts.

## C4-12 — Enrichment atomicity integration

Extend the already-proven raw persistence foundation. Any selected enrichment declared part of the committed analytical snapshot must commit atomically with the cycle/current/latest state or not appear at all.

Enrichment failure must not create a partially enriched successful cycle.

## C4-13 — Set-based enrichment implementation proof

Use focused Chromium POCs to compare simple set-based approaches for predecessor resolution, selected metric calculation and latest/current synchronization while avoiding per-security JS-to-SQL round trips.

Choose the simplest approach with adequate measured headroom.

## C4-14 — Enrichment benchmark decision gate

Before schema freeze compare at least: baseline raw persistence; raw + predecessor links; raw + predecessor links + selected metrics.

Measure ingest latency, CHECKPOINT impact, DB growth, reopen impact, projected session storage, representative query benefit and mixed-load headroom.

Persist only enrichments whose benefit justifies their cost.

## C4-15 — Analytical SQL ergonomics contract

Define stable SQL-facing names, types and units for selected promoted fields, predecessor references, derived metrics and any convenience views exposed to Scanner users.

Do not hide semantics. Example: if 0.5 means +0.5%, document it explicitly. Full raw-row access remains available.

## C4-16 — Enrichment exposure to Current/Detail

After correctness/performance is green, decide per selected metric whether it is Scanner-only, Current Universe, Detail/History or diagnostics-only.

Do not dump every derived column into the browsing UI. Surfaced fields need formatting/null semantics and UI/public-contract tests.

## C4-17 — Cross-time arbitrary-comparison capability proof

Prove representative SQL such as current ASK1 vs historical BID1, current BID1 vs historical ASK1, and historical MID vs current LAST. The physical model must preserve analytical freedom beyond precomputed metrics.

## C4-18 — Historical aggregation capability proof

Prove recent-window filtering, per-security aggregation, GROUP BY/HAVING, cross-security ranking and window functions needed for product-level analytical capability. These are capability tests, not a frozen trading formula.

## C4-19 — Qualifying-window versus distinct-wave boundary

Keep distinct-wave detection out of initial enrichment until a durable wave definition exists. Qualifying snapshots/windows are not the same as distinct events.

## C4-20 — Enrichment checkpoint owner

Create a standalone checkpoint proving selected semantics, schema evolution, historical/backfill decision, atomic integration, deterministic correctness, SQL usability and measured performance/storage headroom.

Evidence should include Node formula/policy tests, Chromium DuckDB integration, warm-up/NULL cases, predecessor correctness, arbitrary cross-time queries, benchmark artifacts and full Browser CI.

# C4 findings

## Finding C4-01 — enrichment is a decision pipeline, not a predefined column list

Analytical need → semantic proof → dynamic SQL experiment → benchmark → persist/query decision → concrete schema evolution → correctness/performance checkpoint.

## Finding C4-02 — the old eight-horizon wide schema is a candidate, not an entitlement

The current horizon list is strong product input, but the persisted subset/shape must be deliberately selected.

## Finding C4-03 — stable SnapshotId is more foundational than any derived metric

Snapshot identity/history ordering can exist in the minimum SQL model; temporal links and derived metrics are later analytical additions.

## Finding C4-04 — DealsDelta requires a separate provider-semantics gate

Availability is not semantic proof. Reset/session/day behavior must be Verified before subtraction is durable.

## Finding C4-05 — benchmark precedes enrichment schema freeze

Measure write/storage/query tradeoffs before committing millions of rows to a physical design.

## Finding C4-06 — earlier SQL history needs an explicit enrichment-state story

Backfill, raw-only, or deliberate pre-production rebuild must be explicit. No silent mixed semantics.

## Finding C4-07 — enrichment remains rebuildable derived state

Raw source facts remain the durable foundation.

## Finding C4-08 — Viewer exposure is selective

Persistence does not automatically imply a Current Universe column.

## Finding C4-09 — analytical flexibility must survive precomputation

Arbitrary joins across full historical rows and aggregation/ranking must remain possible.

## Finding C4-10 — distinct-wave detection stays out until semantics exist

Do not encode an undefined analytical concept into persistence.
