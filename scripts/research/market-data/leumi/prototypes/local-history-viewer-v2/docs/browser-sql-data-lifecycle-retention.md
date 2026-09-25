# Browser SQL — Data Lifecycle, Retention, Archive and Rollover

This is the Phase S planning artifact added by the post-Phase-R red-team planning assurance review.

It closes the previously deferred retention/export/backup policy before implementation begins.

Durable decision: ../../../../../../../docs/project/decisions/D-038.md

## 1. Problem

The Browser SQL target can retain multi-million-row history for repeated SQL analysis, but browser storage is finite and origin-scoped.

The earlier plan correctly defined quota observation and blocking behavior but deliberately deferred:

- retention policy;
- export/archive scope;
- backup semantics;
- safe space-recovery behavior.

Those are product/storage lifecycle decisions, not implementation details.

## 2. Selected baseline policy

Default:

~~~text
retention.mode = retain-all
automatic history deletion = disabled
~~~

The production runtime never deletes old market history merely because a percentage threshold was crossed.

Storage pressure becomes visible before exhaustion, but data loss requires an explicit user-initiated maintenance action.

## 3. Why partial automatic pruning is not the baseline

DuckDB's current official documentation states:

- DELETE marks rows deleted but physical space is reclaimed during CHECKPOINT only opportunistically/partially;
- VACUUM does not reclaim deleted-row disk space;
- full compaction can require copying the database.

Therefore:

~~~text
DELETE old rows
≠ guaranteed OPFS quota recovery
~~~

The initial Browser SQL lifecycle does not promise quota recovery by arbitrary row/session pruning.

Official evidence:
- https://duckdb.org/docs/current/sql/statements/checkpoint
- https://duckdb.org/docs/current/operations_manual/footprint_of_duckdb/reclaiming_space
- https://duckdb.org/docs/current/sql/statements/vacuum

## 4. Database epoch

Every freshly created production database has an opaque:

~~~text
database_epoch_id
~~~

stored in schema/runtime metadata and surfaced in diagnostics/archive manifests.

It identifies one continuous authoritative Browser SQL history epoch.

An explicit rollover creates a new epoch.

IDs such as cycle_id/snapshot_id are interpreted inside their database epoch and are never silently merged across epochs.

## 5. Storage-pressure model

Observable storage lifecycle states:

~~~text
normal
warning
blocked
~~~

`warning` is non-destructive and non-blocking.

`blocked` means a durable write cannot safely complete, including QuotaExceededError/storage-write failure.

Do not block successful recording solely because navigator.storage.estimate() predicts low space; quota values are estimates.

## 6. Warning threshold

No fixed percentage is hardcoded.

WP-35 performance/capacity evidence must produce a conservative:

~~~text
storage_warning_reserve_bytes
~~~

based on measured:

- bytes per representative session;
- growth variance;
- archive/export working-set overhead where used;
- fresh-rollover working-set overhead;
- target Chrome/Windows quota observations.

Warning condition conceptually:

~~~text
estimated_free_bytes < storage_warning_reserve_bytes
~~~

Because browser estimates are approximate, this is an early warning, not a correctness predicate.

## 7. Safe maintenance boundary

Archive/rollover is a maintenance operation.

Before it starts:

~~~text
pause Recorder
→ let in-flight cycle settle
→ stop starting analytical queries
→ let current query finish under the resource-isolation contract
→ CHECKPOINT
→ capture current database_epoch_id + active query/config state
~~~

No provider cycle or analytical mutation may run during authority replacement.

## 8. Archive export

The baseline provides an explicit **logical archive export**, not an automatic cloud backup.

Archive content should preserve the authoritative logical data needed for later offline inspection/future restore tooling:

- schema/runtime manifest;
- database_epoch_id;
- recording_session;
- cycle;
- snapshot including raw_security;
- security/raw MapHeat catalog;
- current_universe/latest_snapshot state where relevant;
- query definition/version/execution metadata when the user chooses to include query history.

Large archive generation must be bounded/streamed or session/table chunked rather than materializing the whole database in JavaScript memory.

DuckDB-Wasm officially documents query/Parquet export plus `copyFileToBuffer()` for browser-side download. Exact archive packaging is implementation work in WP-39 and must be proven with the pinned build. 

Official evidence:
- https://duckdb.org/docs/current/clients/wasm/query

## 9. Archive is not yet a restorable backup

Terminology is strict:

~~~text
archive export
!= verified full backup/restore system
~~~

Initial Browser SQL does not claim:

- automatic cloud backup;
- cross-device restore;
- automatic import of archived data;
- byte-for-byte database backup portability across future DuckDB versions.

A future restore/import feature requires its own schema/version compatibility contract.

## 10. Explicit rollover

When the user decides old active history may leave the live SQL surface:

~~~text
1. enter maintenance boundary
2. CHECKPOINT old production DB
3. optionally generate/verify logical archive export
4. require explicit irreversible confirmation if proceeding without archive
5. capture active query + interval + user runtime configuration needed in the fresh epoch
6. build and verify a fresh candidate DB at a Market-Flow-only temporary OPFS name
7. seed schema + preserved active configuration
8. CHECKPOINT and readiness-check candidate
9. close all DuckDB handles
10. switch the fixed production path through a crash-recoverable rollover journal
11. reopen production path and verify new database_epoch_id
12. start a new recording_session
13. resume Recorder/scheduler
~~~

## 11. OPFS safety boundary

Market Flow runs under the Leumi origin and must assume that other site code may also use origin storage.

Never clear the entire origin OPFS.

Deletion/cleanup may target only exact Market Flow-owned names/prefixes documented by the runtime manifest.

At minimum the maintenance implementation must understand the production DB and its known DuckDB companion artifacts (e.g. WAL/temp paths where applicable) before deleting anything.

MDN documents file-level OPFS access and deletion through `navigator.storage.getDirectory()` and `removeEntry()`/handle removal.

Official browser evidence:
- https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
- https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/removeEntry

## 12. Crash-recoverable rollover journal

Rollover is not treated as one atomic filesystem rename.

The runtime uses a small Market-Flow-owned rollover journal containing only non-secret operational metadata such as:

~~~text
rollover_id
phase
old_database_epoch_id
new_database_epoch_id
production_path
candidate_path
started_at_ms
~~~

The journal never contains cookies/session tokens/account information.

Startup detects an unfinished rollover and resolves it before Recorder readiness.

Exact file-copy/promotion mechanics are implementation details but must be proven in Chromium before production cutover.

## 13. Configuration continuity

A rollover intentionally resets market history and query execution history, but should preserve the user's current analytical configuration:

- active SQL text/version content;
- configured query interval;
- retention/storage policy configuration;
- non-secret runtime preferences explicitly designated as persistent.

The fresh database receives a new immutable query version representing the preserved active SQL.

Old query execution IDs/history remain only in the old epoch/archive.

## 14. Post-rollover semantics

After rollover:

~~~text
market history = empty until first new successful cycle
current/latest = built from the new epoch only
core horizon links/derived values = NULL until new history exists
latest successful analytical result from old epoch = not presented as current
~~~

The Viewer clearly shows the new database_epoch_id/history epoch boundary.

## 15. No cross-epoch live query

The active Browser SQL runtime queries exactly one production database epoch.

It does not UNION current history with archived/old epochs.

Cross-epoch historical analysis is a future explicit feature, not hidden behavior.

## 16. No automatic rollover

Even when storage warning is active:

- do not delete old data automatically;
- do not create a fresh epoch automatically;
- do not silently export/download files;
- do not switch authority without explicit user action.

At actual storage failure the runtime remains `storage-blocked` until explicit recovery/rollover succeeds.

## 17. Partial pruning / compaction future path

Session/age-based partial retention may be added only if evidence proves a physical-space strategy that is worthwhile and safe.

If implemented later it must preserve temporal references and prove real quota reclamation.

It is not required for the initial Browser SQL production target.

## 18. Benchmark additions

WP-35 must measure:

- estimated bytes per representative session;
- variance across representative payloads;
- fresh rollover candidate size;
- archive/export peak working set at representative scale;
- storage-warning reserve recommendation;
- file-level rollover/reopen latency;
- resulting OPFS usage after a completed rollover.

## 19. Failure behavior

Archive generation failure:

~~~text
old production DB remains authoritative
rollover does not proceed unless user explicitly chooses no-archive destructive rollover
~~~

Candidate DB creation/readiness failure:

~~~text
old production DB remains authoritative
no authority switch
~~~

Failure after switch begins:

~~~text
startup/maintenance recovery follows rollover journal
Recorder remains stopped until one coherent production epoch is proven
~~~

## 20. Acceptance scenarios

S-A1: normal recording under retain-all never deletes old history automatically.

S-A2: low estimated free storage raises warning without changing authoritative data.

S-A3: QuotaExceeded/storage-write failure becomes storage-blocked; no successful cycle is falsely acknowledged.

S-A4: rollover cannot begin while a cycle transaction or analytical query is still active.

S-A5: archive failure leaves the old production epoch authoritative.

S-A6: proceeding without archive requires an explicit irreversible-data-loss confirmation.

S-A7: maintenance never clears the entire Leumi-origin OPFS and never deletes a non-Market-Flow entry.

S-A8: candidate DB is fully initialized/checkpointed/readiness-verified before authority promotion.

S-A9: crash at any modeled rollover phase leaves enough journal state for startup to prove old or new authority before Recorder starts.

S-A10: successful rollover creates a new database_epoch_id, preserves active SQL/interval configuration, and starts with no old market history.

S-A11: old latest-success result is not shown as current after a new epoch begins.

S-A12: horizon values naturally warm from NULL after rollover.

## 21. Completion result

~~~text
default = retain-all
+ measured storage-pressure warning
+ no automatic deletion
+ explicit logical archive export
+ explicit crash-recoverable database rollover
+ Market-Flow-only OPFS deletion boundary
+ database_epoch_id visibility
+ no false backup guarantee
~~~