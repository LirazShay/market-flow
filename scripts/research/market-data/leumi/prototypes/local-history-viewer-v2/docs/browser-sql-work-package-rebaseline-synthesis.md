# Browser SQL V2 — Backlog-Wide Re-baseline Synthesis

## Role

This is Pass B6 of Issue #72.

It synthesizes the completed WP-01..WP-42 audit into one backlog-wide diagnosis before Pass C searches for missing work.

It is still planning-only:

- no product/runtime implementation;
- no canonical Issue mutation yet;
- no final replacement WP numbering yet.

Detailed rationale remains in:

`browser-sql-work-package-rebaseline-audit.md`

## 1. Full existing-WP classification matrix

| WP | Current Issue | Classification | Re-baseline disposition |
|---|---:|---|---|
| WP-01 | #29 | KEEP | preserve completed engine pin/manifest evidence |
| WP-02 | #30 | KEEP | preserve completed self-contained SQL feasibility probe |
| WP-03 | #31 | SPLIT | separate real-origin SQL feasibility from cross-tab ownership feasibility |
| WP-04 | #32 | SPLIT | early V1 fixtures/harness now; enrichment/Scanner fixtures later |
| WP-05 | #33 | KEEP | retain early SQL Authority Worker/minimal Controller foundation |
| WP-06 | #34 | KEEP | retain persistent OPFS open/reopen/durability |
| WP-07 | #35 | SPLIT | minimum V1 schema now; concrete schema evolution later |
| WP-08 | #36 | KEEP | startup readiness/recovery is early correctness |
| WP-09 | #37 | KEEP | immutable V1 validated-cycle handoff remains core |
| WP-10 | #38 | SPLIT | bulk staging now; typed projections/promotions need consumer evidence |
| WP-11 | #39 | KEEP | atomic raw/current/history persistence remains core |
| WP-12 | #40 | REORDER | move temporal/enrichment work after V1-on-SQL parity |
| WP-13 | #41 | KEEP + REORDER | durability/idempotency stays early; remove enrichment dependency |
| WP-14 | #42 | SPLIT | storage-foundation checkpoint separate from enrichment/product checkpoints |
| WP-15 | #43 | SPLIT + REORDER | Scanner lifecycle/config state later; rich version history only if justified |
| WP-16 | #44 | KEEP + REORDER | user-SQL safety stays, but only in Scanner mini-project |
| WP-17 | #45 | SPLIT + REORDER | core query semantics later; large-result mechanism benchmark-driven |
| WP-18 | #46 | SPLIT + REORDER | core repeat scheduler later; resource policy separate |
| WP-19 | #47 | MERGE + REORDER | merge Scanner persisted lifecycle with restart recovery |
| WP-20 | #48 | SPLIT + REORDER | Scanner engine checkpoint separate from Scanner product checkpoint |
| WP-21 | #49 | KEEP + REORDER | deterministic production bundling moves before V1-on-SQL live integration |
| WP-22 | #50 | SPLIT + MERGE + REORDER | merge Controller overlap with WP-05; ownership remains separate |
| WP-23 | #51 | KEEP + REORDER | inherited Recorder→SQL integration moves before enrichment/Scanner |
| WP-24 | #52 | KEEP + REORDER | self-verifying live provider compatibility moves before V1 parity closure |
| WP-25 | #53 | SPLIT + REORDER | early shared Viewer bridge; Scanner state delivery later |
| WP-26 | #54 | SPLIT + REORDER | Scanner editor/activation later; multi-editor OCC must be justified |
| WP-27 | #55 | SPLIT + REORDER | shared health early; Scanner result diagnostics later |
| WP-28 | #56 | SPLIT + REORDER | explicit read contracts + Current parity + Detail/History parity |
| WP-29 | #57 | SPLIT + REORDER | early V1 product checkpoint + later three-surface checkpoint |
| WP-30 | #58 | SPLIT + REORDER | minimum shared health early; richer incident/debug tooling later |
| WP-31 | #59 | SPLIT + REORDER | security guards become continuous CI; Scanner-specific hardening later |
| WP-32 | #60 | DEFER + REPLACE | shadow path becomes conditional fallback verification |
| WP-33 | #61 | DEFER + REPLACE | replace mandatory shadow comparison with parity/Chromium/live endurance |
| WP-34 | #62 | SPLIT + REORDER | benchmark support becomes incremental engineering infrastructure |
| WP-35 | #63 | SPLIT + REORDER | performance gates distributed; final representative capacity gate remains |
| WP-36 | #64 | KEEP + REORDER | explicit authority cutover remains required with corrected prerequisites |
| WP-37 | #66 | SPLIT + KEEP | keep initial rollback/roll-forward; separate live endurance/future upgrades |
| WP-38 | #67 | KEEP + NARROW | keep final cleanup, only for scaffolding actually used |
| WP-39 | #68 | SPLIT + DEFER | initial storage safety now; archive/rollover only if justified |
| WP-40 | #69 | SPLIT + REORDER | baseline resource safety later; advanced cancellation/preemption evidence-driven |
| WP-41 | #70 | KEEP + REORDER | cross-tab singleton required before cutover, not early single-runtime work |
| WP-42 | #71 | SPLIT + DEFER | minimum compatibility now; generalized future-upgrade lifecycle later |

## 2. Classification-level conclusion

The old 42-WP graph is **not suitable for preservation with a few dependency edits**.

Most packages are not wrong in intent; the dominant failure mode is that multiple valid concerns were grouped at the wrong time or at the wrong abstraction level.

The corrected plan therefore needs:

- substantial splitting;
- several merges;
- major reorder;
- conditionalization/deferment of operational mechanisms;
- new explicit owners for missing product contracts.

Completed WP-01/WP-02 remain reusable evidence and should not be redone.

## 3. Old milestone assumptions that no longer hold

### Old M1 — feasibility

**Partially valid.**

Keep:

- exact engine pinning;
- minimal Browser SQL probe;
- early real-origin Worker/Wasm/OPFS feasibility.

Change:

- cross-tab ownership is not the same gate as SQL feasibility;
- test harness grows with product slices instead of front-loading every fixture.

### Old M2 — SQL authority + enrichment

**Invalid as one milestone.**

It currently mixes:

- minimum persistent authority;
- atomic V1-cycle storage;
- durability/idempotency;
- temporal enrichment.

Correct split:

~~~text
M2A-like responsibility:
minimum trustworthy SQL persistence

later enrichment mini-project:
temporal links + derived metrics + performance proof
~~~

Temporal enrichment must not block durable V1 storage.

### Old M3 — analytical SQL runtime

**Valid feature set, invalid placement.**

It belongs after V1-on-SQL product parity rather than before runtime/Viewer product integration.

Dynamic SQL Scanner is a separate mini-project.

### Old M4 — runtime + Viewer

**Contains the actual first product vertical slice and therefore belongs much earlier.**

Its current scope is also too broad because it mixes:

- production runtime/controller;
- Recorder→SQL;
- Viewer bridge;
- Current/Detail parity;
- Scanner editor/results;
- one giant checkpoint.

Corrected structure pulls the V1-derived pieces forward and leaves Scanner UI for later.

### Old M5 — health/security

**Invalid as a late milestone.**

Health and security are cross-cutting concerns.

Minimum health and secret guards must appear as soon as the relevant component/artifact exists.

Richer diagnostics can grow later.

### Old M6 — shadow migration

**Invalid as mandatory architecture.**

Shadow is one possible verification technique.

It should exist only if deterministic parity + Chromium + live candidate evidence leaves an unresolved migration risk.

### Old M7 — benchmark/capacity

**Invalid as primarily a late phase.**

Performance evidence must be used while choosing:

- projections;
- enrichment;
- query result delivery;
- resource isolation.

A final full-system capacity gate still belongs before cutover.

### Old M8 — cutover/lifecycle/upgrade

**Over-coupled.**

Initial cutover requires:

- explicit authority switch;
- single owner;
- security;
- capacity;
- rollback/roll-forward;
- live/endurance evidence.

It does not automatically require:

- shadow mode;
- archive/rollover product;
- generalized future DuckDB/schema upgrade framework.

## 4. Repeated structural defects found across the old graph

### DEFECT-01 — architecture-first instead of product-first sequencing

The graph optimized for completing a generic analytical platform before proving the inherited user product on SQL.

Correction:

~~~text
first prove V1-on-SQL product
then add analytics
then add Scanner
~~~

### DEFECT-02 — mechanism treated as requirement

Examples:

- immutable query-version history;
- mandatory Arrow streaming;
- activation-anchored scheduler;
- advanced cancellation/preemption;
- shadow migration;
- archive/rollover;
- generalized future-upgrade framework.

Correction:

~~~text
observable contract
→ POC/benchmark
→ simplest mechanism that satisfies evidence
~~~

### DEFECT-03 — unrelated concerns bundled into one WP

Examples:

- WP-03 SQL feasibility + ownership;
- WP-07 minimum schema + generic migrations;
- WP-10 staging + analytical promotion;
- WP-14 persistence + enrichment checkpoint;
- WP-25 V1 bridge + Scanner state;
- WP-27 shared health + Scanner results;
- WP-28 read contracts + two UIs + Scanner drill-down;
- WP-29 V1 parity + final Scanner integration;
- WP-39 storage safety + full archive/rollover;
- WP-42 minimum compatibility + generalized future upgrades.

Correction: one natural engineering/verification boundary per replacement work unit.

### DEFECT-04 — one responsibility split across multiple WPs

Examples:

- WP-05 + WP-22 share Controller/Worker lifecycle ownership;
- WP-15 + WP-19 split Scanner durable lifecycle/recovery;
- health responsibility is spread between Viewer, runtime and late WP-30.

Correction: one explicit state/contract owner with consumers around it.

### DEFECT-05 — checkpoints do not correspond to useful product truths

Old checkpoints prove internal architecture layers, but not the earliest useful user-visible result.

Required checkpoint ladder is closer to:

~~~text
engine feasibility
→ SQL persistence foundation
→ V1-on-SQL product parity
→ enrichment correctness/performance
→ Scanner engine
→ Scanner product
→ final three-surface integration/capacity
→ cutover
~~~

### DEFECT-06 — verification arrives too late

Benchmarking, security and parity should influence design while work is being done.

Correction:

- temporary POCs allowed;
- GitHub Actions used as an engineering lab;
- permanent tests only for durable contracts/regressions;
- full checkpoint suites at natural boundaries.

### DEFECT-07 — trusted application reads were implicit

Current Universe and Detail/History need stable application-owned SQL read contracts.

They must not be:

- arbitrary raw table coupling inside UI;
- user Scanner SQL;
- an accidental implementation detail.

This missing boundary becomes explicit work in Pass C.

### DEFECT-08 — V1 parity was implicit instead of independently provable

The old graph had Viewer integration tests, but no first-class V1→V2 parity workstream.

The corrected plan needs shared synthetic inputs and observable contract comparison for:

- Current Universe;
- Detail/History;
- dynamic universe;
- null/zero/empty/missing;
- sorting;
- paging;
- refresh/live update;
- failure behavior.

### DEFECT-09 — operational future work blocks first delivery

The old plan treats long-term lifecycle systems as if they are prerequisites for first product proof.

Correction: distinguish:

~~~text
initial-V2 correctness
vs
conditional hardening
vs
future release lifecycle
~~~

## 5. Old-WP groups that naturally collapse or split

### Natural merge candidates

- WP-05 + relevant WP-22 Controller/Worker foundation;
- WP-15 + WP-19 Scanner durable lifecycle/recovery;
- shared health pieces from WP-27 + WP-30;
- security guards from WP-31 into normal CI owners rather than one isolated late package.

### Natural split candidates

- WP-03 → SQL live feasibility / ownership live feasibility;
- WP-04 → base harness / enrichment fixtures / Scanner fixtures;
- WP-07 → minimum schema / concrete evolution;
- WP-10 → bulk staging / consumer-driven projections;
- WP-14 → persistence checkpoint / enrichment checkpoint;
- WP-17 → query semantics / large-result strategy;
- WP-18 → repeat scheduler / resource policy;
- WP-20 → Scanner-engine / Scanner-product checkpoint;
- WP-25 → base Viewer bridge / Scanner state transport;
- WP-26 → core editor activation / optional multi-editor concurrency;
- WP-27 → shared health / Scanner result UI;
- WP-28 → read contracts / Current / Detail-History / Scanner drill-down;
- WP-29 → V1 parity / final three-surface checkpoint;
- WP-30 → minimum health / richer diagnostics;
- WP-31 → baseline security CI / Scanner-specific security;
- WP-34/35 → incremental benchmarks / final capacity gate;
- WP-37 → initial rollback / live endurance;
- WP-39 → storage safety / conditional archive-rollover;
- WP-40 → baseline resource safety / advanced contention hardening;
- WP-42 → minimum compatibility / future upgrade framework.

## 6. Emerging product-driven execution bands

These are not final replacement WPs yet.

### Band A — feasibility and automated test foundation

Goal:

~~~text
prove Browser SQL can run safely on the target origin
+ establish the smallest deterministic Node/Chromium test base
~~~

Reuse WP-01/WP-02 evidence.

### Band B — trustworthy SQL persistence replacement

Goal:

~~~text
same validated V1 cycle
→ durable atomic SQL current/history
→ reopen/retry/recovery
~~~

No temporal enrichment.

### Band C — V1-on-SQL user product

Goal:

~~~text
production-shaped runtime
+ inherited Recorder→SQL
+ trusted read contracts
+ Current Universe
+ Security Detail/History
+ health
+ automated V1 parity
~~~

This is the first major product checkpoint.

### Band D — analytical data/enrichment

Goal:

~~~text
design from query needs
→ POC/benchmark
→ selected horizons/projections/metrics
→ correctness/performance checkpoint
~~~

### Band E — Dynamic SQL Scanner

Goal:

~~~text
durable Scanner lifecycle
+ read-only SQL safety
+ execution/result semantics
+ repeat scheduler
+ resource safety
+ editor/interval
+ dynamic result grid
+ drill-down
~~~

### Band F — production hardening and final integration

Goal:

~~~text
cross-tab single owner
+ final security/capacity
+ three-surface integration
+ self-verifying live/endurance
+ explicit cutover
+ initial rollback/roll-forward
+ cleanup
~~~

Conditional lifecycle mechanisms are added only if evidence requires them.

## 7. Initial V2 versus later/conditional ownership

### Initial V2 non-negotiable

- exact pinned/reproducible runtime;
- real-origin engine/storage feasibility;
- V1 provider continuity;
- atomic durable SQL persistence;
- reopen/recovery/idempotency;
- trusted Current/Detail read contracts;
- Current Universe;
- Security Detail/History;
- health/error visibility;
- secret/security guards;
- enrichment capabilities that remain explicit V2 product requirements after Pass C/E validation;
- Dynamic SQL Scanner;
- single production owner;
- representative capacity;
- explicit cutover;
- initial rollback/roll-forward;
- self-verifying live evidence.

### Conditional/later unless evidence promotes it

- dual live shadow path;
- archive export;
- fresh-epoch rollover UI/workflow;
- generalized future engine/schema upgrade platform;
- sophisticated multi-editor Scanner optimistic concurrency;
- advanced cancellation/preemption mechanisms beyond minimum resource safety;
- persistent immutable query-edit history beyond what recovery/traceability actually needs.

## 8. Pass-B conclusion

The correct action is **not** to preserve the old 42-WP graph and merely renumber dependencies.

The correct action is:

~~~text
old WPs = evidence + requirement inventory
→ Pass C identify missing work
→ Pass D redesign dependency DAG
→ Pass E define vertical mini-projects/checkpoints
→ Pass F re-justify migration/operational scope
→ Pass G materialize a new canonical GitHub execution graph
~~~

The existing graph remains untouched until those passes complete.

Pass C begins from the capability map and this structural diagnosis, not from the old milestone boundaries.
