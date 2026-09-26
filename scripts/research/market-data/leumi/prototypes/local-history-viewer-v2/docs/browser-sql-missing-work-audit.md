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
