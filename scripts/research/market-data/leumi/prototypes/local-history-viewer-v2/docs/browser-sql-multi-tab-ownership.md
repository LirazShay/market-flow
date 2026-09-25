# Browser SQL — Multi-Tab Ownership and Split-Brain Prevention

This is the Phase U planning artifact added by the pre-implementation assurance review.

It defines how independent authenticated Leumi tabs coordinate one Market Flow V2 Recorder/SQL Authority over the same origin-scoped browser storage.

Durable decision: ../../../../../../../docs/project/decisions/D-040.md

## 1. Problem

A page-local singleton is insufficient.

Two independent Leumi tabs can each inject the Bookmarklet and each could otherwise create:

~~~text
Runtime Controller
→ Recorder
→ SQL Authority Worker
→ same origin-scoped OPFS production database
~~~

That risks duplicate provider collection, concurrent DuckDB ownership, conflicting recovery, and split-brain authority.

## 2. Browser-native ownership primitive

Use the Web Locks API as the **only ownership authority** across tabs/workers sharing the storage bucket.

Current web-platform evidence:

- Web Locks coordinates tabs and workers sharing an origin/storage bucket;
- an exclusive lock permits only one holder for a resource name;
- `ifAvailable` supports fail-fast acquisition;
- locks are released when their owning document/agent terminates;
- the specification explicitly describes the primary-tab/leader-election use case;
- `steal` is dangerous because code from the previous holder may continue executing.

Evidence:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
- https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
- https://developer.mozilla.org/en-US/docs/Web/API/LockManager/query
- https://w3c.github.io/web-locks/

## 3. Stable ownership lock name

The production owner lock is stable across builds, DuckDB versions and database epochs:

~~~text
market-flow:local-history-viewer-v2:runtime-owner
~~~

It represents the V2 **runtime/Recorder/storage authority**, not one physical DuckDB file.

Do not include:

- runtime version;
- DuckDB version;
- database_epoch_id;
- current OPFS filename.

Otherwise old/new releases or rollover epochs could accidentally use different locks while still representing one logical V2 authority.

## 4. Lock scope

Web Locks are scoped to contexts sharing the same browser storage bucket/origin.

For normal same-profile Leumi tabs sharing the same origin-scoped OPFS, they also share this owner lock.

Different origins/profiles/private sessions have separate browser storage and therefore do not share one physical OPFS authority.

Runtime diagnostics/database metadata must surface the current origin/storage environment sufficiently to make separate data silos visible.

## 5. Startup order — lock before storage

Mandatory startup sequence:

~~~text
same-tab local singleton check
→ verify Web Locks capability
→ request runtime-owner lock, exclusive + ifAvailable
→ only inside granted-lock callback:
   create Runtime Controller owner state
   → create SQL Authority Worker
   → open DuckDB/OPFS
   → readiness/recovery
   → start Recorder/scheduler
~~~

No production DuckDB/OPFS handle and no provider collection may start before ownership is granted.

## 6. Same-tab repeated launch

Before requesting Web Lock, inspect the page-local Runtime Controller singleton.

If the same tab already owns a healthy runtime:

~~~text
reuse/focus existing runtime
→ do not request the same exclusive lock again
~~~

This avoids self-queuing/deadlock and preserves the existing repeated-launch contract.

## 7. Second independent tab

Baseline behavior uses:

~~~text
navigator.locks.request(lockName,
  { mode: 'exclusive', ifAvailable: true }, ...)
~~~

If lock is unavailable:

~~~text
second tab = passive/non-owner
SQL Worker = not created
OPFS/DuckDB = not opened
Recorder = not started
provider requests = not started
~~~

The UI reports that Market Flow V2 is active in another same-storage context.

## 8. No automatic standby takeover in V2 baseline

The second tab does not queue indefinitely waiting to become owner and does not silently start recording later.

Reason:

- user may intentionally stop the active runtime;
- a queued standby could unexpectedly become active;
- fail-fast acquisition is simpler and auditable.

After owner termination, the user may explicitly invoke/start Market Flow in another tab; the new attempt can then acquire the released lock.

Automatic hot-standby takeover is a future product feature, not an implicit side effect.

## 9. Owner termination and stale-owner recovery

The Web Locks specification releases locks when unloading-document cleanup or agent termination occurs.

Therefore correctness does **not** use an application heartbeat/lease expiry.

On a later explicit launch after owner close/crash:

~~~text
acquire released owner lock
→ create new Worker
→ OPFS reopen/readiness
→ unclean-session/query/rollover reconciliation
→ only then Recorder readiness
~~~

Existing persistence/recovery contracts remain responsible for durable-state reconciliation.

## 10. No forced steal

`steal: true` is forbidden in normal Market Flow behavior.

The Web Locks API warns that the previous lock-holder's code may continue running even after its lock is stolen.

Therefore stealing can itself create split-brain.

If a page is hung but the browser still considers its lock held:

~~~text
new tab remains blocked/passive
→ user closes/terminates the old owner context
→ browser releases the lock
→ explicit new launch retries
~~~

No heartbeat timeout is allowed to override a still-held browser lock.

## 11. BroadcastChannel is transport/notification only

BroadcastChannel may communicate sanitized ephemeral information such as:

- `owner-present` hint;
- runtimeInstanceId;
- stateRevision/change hints;
- request to focus/open Viewer where a bridge exists.

It is never proof of ownership.

Rules:

~~~text
BroadcastChannel silence != owner dead
BroadcastChannel heartbeat != owner authority
Web Lock held/granted = ownership authority
~~~

This preserves the project's rule that messaging is not source of truth.

## 12. navigator.locks.query() is diagnostic only

`navigator.locks.query()` returns a snapshot that can be stale immediately.

It may be used in Debug Bundle/diagnostics to show held/pending lock information.

It must not be used to decide that a tab may open the production DB.

Only successful exclusive `request()` grant authorizes owner startup.

## 13. Viewer behavior

Viewer clients never acquire the runtime-owner lock merely to display state.

They never open DuckDB/OPFS.

A Viewer connected to the current owner continues through the existing Viewer bridge.

If the user invokes the full runtime Bookmarklet in a non-owner Leumi tab, that tab remains passive rather than becoming a second Viewer database owner.

Cross-tab owner discovery may improve UX, but the database/Recorder authority remains the Web Lock holder.

## 14. Shadow, migration and rollover

The same runtime-owner lock covers:

- IndexedDB-authoritative shadow phase;
- DuckDB production phase;
- database-epoch rollover maintenance;
- cutover/roll-forward sessions.

Rollover does not change the lock name.

Shadow mode uses one Controller that may write both candidate paths; it does not create a second runtime owner.

## 15. Rollback release

Production rollback is an explicit release transition.

Before an old IndexedDB rollback runtime is launched:

~~~text
stop SQL owner
→ settle/cancel work
→ close SQL Worker/DB
→ release runtime-owner lock
→ launch rollback through an owner-aware wrapper/launcher
~~~

Any rollback launcher retained for post-cutover use must participate in the same V2 runtime-owner lock contract before starting provider collection.

An immutable old payload may remain unchanged; the surrounding launcher/gate owns the lock.

## 16. Clean owner shutdown

Explicit stop while page remains alive releases ownership only after:

~~~text
stop new provider collection
→ settle or safely cancel pending analytical work
→ resolve waiting cycle if any
→ CHECKPOINT as required
→ close DB/Worker
→ mark session stop state
→ release Web Lock callback/lifetime promise
~~~

Do not release the ownership lock while the old Worker or Recorder can still mutate authoritative state.

## 17. Crash/unload shutdown

A crash/navigation may prevent clean shutdown.

The browser lock release only means the old agent no longer owns the coordination primitive; it does not prove the database was cleanly closed.

Every new owner must run Phase-I readiness/recovery before Recorder start.

## 18. Capability failure

If `navigator.locks` is unavailable, throws SecurityError, or cannot provide the required exclusive coordination:

~~~text
runtime health = blocked
Recorder = stopped
production DuckDB/OPFS = unopened
~~~

No fallback to:

- localStorage lease;
- IndexedDB heartbeat;
- BroadcastChannel election;
- timestamp-based owner guess.

The Browser-only architecture must be reopened if the required API is unavailable in the real target environment.

## 19. Live feasibility gate extension

WP-03 Live Gate L-1 must additionally verify on the authenticated Leumi origin:

1. `navigator.locks` is available;
2. an exclusive synthetic Market-Flow probe lock can be acquired;
3. a second same-origin authenticated tab cannot acquire the same probe lock with `ifAvailable:true` while the first holds it;
4. after closing/releasing the first probe owner, the second tab can acquire it;
5. no `steal` behavior is required.

The probe uses only a synthetic probe lock name and never opens production DuckDB/OPFS.

## 20. Chromium automated verification

Playwright must cover at least:

U-A1: two same-origin pages race startup; exactly one gets owner lock and only it creates Worker/opens production storage.

U-A2: second tab receives no lock and performs zero provider collection/production-DB open.

U-A3: repeated Bookmarklet launch in the owner tab reuses local Controller and does not self-deadlock.

U-A4: owner page closes; browser releases lock; a later explicit launch in another page acquires it and runs readiness before Recorder.

U-A5: owner page crashes during/near an unclean DB state; next owner acquires lock but stays blocked until recovery succeeds.

U-A6: hidden/background owner retains authority; no heartbeat expiry causes takeover.

U-A7: simulated BroadcastChannel loss does not transfer ownership.

U-A8: `navigator.locks.query()` diagnostics cannot authorize owner startup.

U-A9: Web Locks unavailable/SecurityError blocks runtime with no fallback election.

U-A10: normal runtime never uses `steal:true`.

U-A11: explicit stop releases lock only after Recorder/Worker/DB shutdown ordering is complete.

U-A12: shadow/rollover operations remain under the same stable runtime-owner lock.

## 21. Observability

Expose sanitized ownership state:

~~~text
ownershipState = owner | passive-other-owner | acquiring | blocked
ownerLockName
runtimeInstanceId if local owner
lockAcquiredAtMs if local owner
lockApiAvailable
lastOwnershipError?
~~~

Do not expose browser `clientId` as a durable identity or persist it as authority state.

## 22. Completion result

~~~text
one stable Web Lock
+ lock-before-storage startup
+ no steal
+ no heartbeat authority
+ passive second tab
+ browser-released crash ownership
+ readiness before takeover Recorder start
+ same lock across shadow/cutover/rollover
+ live two-tab feasibility proof
~~~