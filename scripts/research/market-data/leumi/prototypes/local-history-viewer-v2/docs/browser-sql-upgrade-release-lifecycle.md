# Browser SQL — Engine, Schema and Release Upgrade Lifecycle

This is the Phase V planning artifact added by the pre-implementation assurance review.

It defines how Market Flow upgrades runtime code, DuckDB-Wasm/core, storage format compatibility and application schema without making rollback depend on DuckDB forward compatibility.

Durable decision: ../../../../../../../docs/project/decisions/D-041.md

## 1. Why this needs an explicit lifecycle

The production Browser SQL database persists across releases.

At least four independent version axes can change:

~~~text
Market Flow runtime/build
DuckDB-Wasm package
embedded DuckDB core
DuckDB physical storage compatibility
Market Flow logical schema
~~~

A single `version` field cannot safely describe compatibility.

## 2. Current DuckDB compatibility evidence

Current official DuckDB documentation states:

- newer DuckDB releases are intended to read older database files from the backward-compatibility era;
- older DuckDB reading a file written by a newer version is only forward-compatible on a best-effort basis;
- an explicit storage version/compatibility target can constrain the minimum DuckDB release needed to read a written file;
- DuckDB supports exporting/importing a whole database and `COPY FROM DATABASE` as format-migration tools;
- DuckDB-Wasm can open OPFS databases in READ_ONLY or READ_WRITE mode.

Therefore:

~~~text
new runtime can often read old DB
does NOT imply
old runtime can safely read DB after new runtime wrote it
~~~

Official evidence:
- https://duckdb.org/docs/current/internals/storage
- https://duckdb.org/faq
- https://duckdb.org/docs/current/sql/statements/export
- https://duckdb.org/docs/lts/sql/statements/copy
- https://duckdb.org/docs/current/clients/wasm/instantiation

Exact feature behavior remains subject to the WP-01 pinned DuckDB-Wasm build and WP-42 Chromium verification.

## 3. Compatibility identity tuple

Generated release manifest records at least:

~~~text
market_flow_release_id
build_commit_sha
duckdb_wasm_package_version
duckdb_core_version
duckdb_bundle_kind
duckdb_worker_asset_identity
duckdb_wasm_asset_identity
storage_compatibility_target
market_flow_schema_version
supported_schema_min
supported_schema_max
migration_set_id
~~~

The production database/schema metadata records at least:

~~~text
database_epoch_id
market_flow_schema_version
created_by_release_id
last_writer_release_id
last_writer_duckdb_core_version
storage_compatibility_target
~~~

These values are diagnostics/compatibility evidence, not a replacement for opening/validating the real DB.

## 4. Storage compatibility target

Market Flow never requests DuckDB storage compatibility `latest` implicitly.

The initial target selects an explicit tested `storage_compatibility_target` compatible with the pinned production engine and records it in the release manifest/database metadata.

An engine upgrade must not raise that target merely because the newer engine supports a newer format.

Raising the target is a deliberate data-format migration requiring:

- a separate candidate DB;
- explicit compatibility evidence;
- rollback-snapshot preservation;
- full Browser verification.

The exact setting mechanism (`STORAGE_VERSION`, `storage_compatibility_version`, equivalent) must be proven in the pinned Wasm build.

## 5. Release classes

### Class A — runtime-only compatible release

All persistence tuple values are unchanged:

~~~text
same DuckDB-Wasm package/core
same storage_compatibility_target
same Market Flow schema version
same database format policy
~~~

Then the new runtime may use the existing production DB **after read-only compatibility preflight**.

### Class B — persistence-affecting release

Any change to:

- DuckDB-Wasm package/core;
- storage compatibility target;
- logical schema;
- migration set affecting persisted data/catalog;

requires the side-by-side candidate upgrade workflow.

No in-place production migration is the baseline.

## 6. Startup compatibility preflight

After acquiring the Phase-U runtime-owner lock and before any writable production open:

~~~text
instantiate pinned engine
→ open production DB READ_ONLY
→ verify it opens
→ read schema_meta/runtime compatibility metadata
→ inspect DuckDB storage-version evidence where supported
→ compare against release manifest
→ close READ_ONLY preflight
~~~

Outcomes:

### Compatible / no migration

~~~text
reopen READ_WRITE
→ normal readiness/recovery
~~~

### Database schema older and migration required

~~~text
do not mutate production in place
→ enter explicit upgrade maintenance workflow
~~~

### Database schema newer than runtime supports

~~~text
blocked
→ no write
→ no automatic downgrade
~~~

### Storage/engine open incompatible

~~~text
blocked
→ preserve DB unchanged
→ require compatible release or explicit upgrade/recovery path
~~~

## 7. No write before compatibility decision

Normal startup must not:

- run schema migrations;
- update `last_writer_release_id`;
- start Recorder;
- start scheduler;
- write query/session metadata;

until compatibility preflight has selected the writable path.

Read-only preflight support is itself a pinned-build verification requirement.

## 8. Side-by-side upgrade workflow

For a Class-B release:

~~~text
1. acquire stable runtime-owner Web Lock
2. enter maintenance mode
3. stop Recorder/new analytical starts
4. settle/cancel current work using Phase-T contract
5. CHECKPOINT current production DB
6. close all DB handles
7. create upgrade journal
8. preserve old production DB as rollback snapshot
9. build a Market-Flow-owned candidate DB from that snapshot
10. open candidate with new pinned engine
11. apply ordered forward schema migrations to candidate
12. CHECKPOINT candidate
13. close/reopen candidate
14. run full candidate readiness + invariant verification
15. promote candidate through crash-recoverable journal mechanics
16. reopen promoted production DB
17. verify release/schema/storage tuple
18. start new recording_session
19. resume Recorder/scheduler
~~~

The old production snapshot remains untouched until stabilization/explicit cleanup.

## 9. Candidate creation

The implementation may choose the simplest proven bounded mechanism in the exact browser build:

- chunked OPFS file clone after clean CHECKPOINT/close;
- or a DuckDB-supported database-copy/export-import mechanism.

The selected path must:

- avoid materializing the entire DB in JS memory;
- leave the old production snapshot unmodified;
- work under expected quota/headroom;
- be crash-recoverable;
- be verified with real OPFS in Chromium.

Planning does not assume that generic DuckDB native filesystem tooling automatically works in Wasm/OPFS.

## 10. Schema migrations

Schema migrations are ordered and forward-only:

~~~text
schema N
→ migration N_to_N+1
→ schema N+1
~~~

Rules:

- migration is applied to candidate DB, not the authoritative old snapshot;
- one upgrade may cross multiple ordered steps;
- each step has preconditions/postconditions;
- schema_meta version advances only after that step's data/catalog changes succeed;
- failure discards/rebuilds candidate rather than down-migrating production;
- no automatic `N+1 → N` schema downgrade path is required.

## 11. Candidate verification

Before promotion, verify at least:

- candidate database_epoch_id policy is correct (same history epoch for release upgrade unless lifecycle rollover intentionally creates a new one);
- expected schema version;
- expected storage compatibility target;
- engine/package/build identity metadata;
- table/schema presence;
- cycle/snapshot/current/latest integrity;
- unique ingest_token and `(cycle_id, security_id)` invariants;
- raw JSON preservation;
- active query/config preservation;
- latest successful query/result semantics;
- representative analytical query execution;
- CHECKPOINT + close + reopen;
- storage usage/headroom.

An upgrade candidate is never promoted based only on 'open succeeded'.

## 12. database_epoch_id during software upgrade

A normal software/schema/engine upgrade preserves the existing `database_epoch_id` because it is the same continuous market-history epoch.

A Phase-S retention/history rollover creates a new `database_epoch_id`.

Thus:

~~~text
release upgrade != history rollover
~~~

unless an explicit migration plan intentionally combines them.

## 13. Promotion

Candidate promotion reuses the Phase-S crash-recoverable authority-switch journal principles.

Journal metadata additionally records:

~~~text
upgrade_id
from_release_id
to_release_id
from_schema_version
to_schema_version
from_duckdb_core_version
to_duckdb_core_version
storage_compatibility_target
old_snapshot_path
candidate_path
phase
~~~

No secrets/session data are recorded.

## 14. Rollback semantics

Rollback never depends on an older DuckDB engine opening a DB that a newer engine has already written.

Instead:

~~~text
stop new runtime
→ preserve upgraded DB unchanged for diagnosis/roll-forward
→ restore/reselect preserved pre-upgrade DB snapshot
→ launch retained old release
→ old release opens its own compatible snapshot
~~~

This may create an explicit market-history gap for the period written only by the upgraded release.

Upgraded-period data remains preserved separately and is never silently merged into the rollback snapshot.

## 15. Why no automatic down migration

Application schema reversal and DuckDB physical forward compatibility are separate problems.

Even if SQL DDL could theoretically be reversed, an older engine may not understand physical/catalog changes written by a newer engine.

Therefore baseline rollback is snapshot/release rollback, not in-place database downgrade.

## 16. Old release startup protection

An older retained runtime encountering a newer production DB must:

~~~text
READ_ONLY preflight if possible
→ detect unsupported schema/storage/release state
→ block
~~~

It must never 'try migrations backwards', reset the DB, or write compatibility metadata just to make startup succeed.

## 17. Release manifest compatibility gate

Generated runtime artifacts are one compatibility unit.

Do not mix:

- runtime JS from release A;
- Worker/Wasm assets from release B;
- migration manifest from release C.

Artifact generation/tests must prove all identities derive from one exact release manifest.

## 18. Extension/configuration compatibility

Required DuckDB extensions and hardening settings are part of the release compatibility surface.

An upgrade candidate must prove:

- required extensions exist for the new Wasm core/build;
- extension autoload/install remains disabled as required;
- security configuration can be established before user SQL;
- no new extension requirement is silently introduced by schema/query implementation.

## 19. Upgrade policy for storage format features

Do not opt into newer storage-format-only optimizations without a demonstrated product requirement and evidence.

KISS preference:

~~~text
keep the existing tested storage_compatibility_target
while it satisfies required features/performance
~~~

This reduces accidental incompatibility without pretending old releases can always open newer files.

## 20. Verification matrix

WP-42 must test at least:

V-A1: runtime-only release with identical persistence tuple passes read-only preflight and reopens existing DB read-write.

V-A2: newer runtime opens an older compatible DB copy and upgrades only the candidate, never original snapshot.

V-A3: migration failure leaves old production snapshot authoritative and candidate disposable.

V-A4: candidate CHECKPOINT/reopen/invariant failure blocks promotion.

V-A5: older runtime sees newer unsupported schema and blocks without write/reset.

V-A6: release manifest with mismatched Worker/Wasm/package/schema identity is rejected before Recorder.

V-A7: storage compatibility target does not change merely because engine package changes.

V-A8: explicit storage-target increase is treated as a Class-B migration and verified.

V-A9: rollback after promoted upgrade restores old release + old snapshot; old release never opens the newer DB.

V-A10: upgraded-period DB remains preserved during rollback.

V-A11: crash at each modeled upgrade-journal phase recovers to one provable authority before Recorder.

V-A12: database_epoch_id is preserved across normal software/schema upgrade and changes only for explicit history rollover.

V-A13: candidate creation/copy stays within measured storage headroom and bounded memory.

V-A14: multi-tab owner lock remains held across maintenance/upgrade promotion.

## 21. Live/cutover gate

Initial production cutover must not occur until the upgrade/rollback lifecycle itself has Browser verification.

Reason: after cutover the OPFS database becomes durable user state that future releases must preserve.

## 22. Completion result

~~~text
explicit compatibility tuple
+ read-only preflight before write
+ side-by-side persistence-affecting upgrades
+ forward-only candidate migrations
+ stable storage compatibility target
+ old DB snapshot rollback
+ no forward-compatibility assumption
+ crash-recoverable promotion
+ release-manifest integrity
~~~