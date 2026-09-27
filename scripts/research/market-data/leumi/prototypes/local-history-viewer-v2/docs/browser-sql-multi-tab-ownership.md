# Browser SQL V2 — Multi-Tab Ownership

## Role

This document describes the current compact cross-tab ownership contract for Local History Viewer V2.

Durable decision:
`../../../../../../../docs/project/decisions/D-040.md`

Post-KISS implementation baseline:
`../../../../../../../docs/project/decisions/D-044.md`

Executable ownership work:
C10 / Issue #82.

Final authenticated-origin proof:
C12 / Issue #84.

Live progress remains only in `../STATUS.json`.

## Problem

Two independent same-origin Leumi tabs must never become competing production Recorder/DuckDB owners over the same browser-local authority.

A page-local singleton alone is insufficient.

## Sole ownership authority

Use one stable exclusive Web Lock:

~~~text
market-flow:local-history-viewer-v2:runtime-owner
~~~

The name is stable across runtime builds and storage/schema revisions because it represents the logical V2 production runtime authority.

Web Locks are the only cross-tab ownership authority.

Do not add:

- heartbeat/lease authority;
- localStorage election;
- IndexedDB election;
- BroadcastChannel election;
- timestamp ownership guesses;
- `steal:true`;
- a second fallback lock protocol.

## Startup order

Same-tab repeated launch first reuses the page-local Runtime Controller singleton when present.

An independent tab uses fail-fast exclusive acquisition:

~~~text
navigator.locks.request(
  "market-flow:local-history-viewer-v2:runtime-owner",
  { mode: "exclusive", ifAvailable: true },
  ...
)
~~~

Only inside the granted-lock lifetime may production startup proceed:

~~~text
lock granted
→ create/start Runtime Controller owner state
→ create SQL Worker
→ open production DuckDB/OPFS
→ normal compatibility/readiness
→ start Recorder when the owning implementation stage permits it
~~~

A losing tab remains passive:

~~~text
no production Worker
no production DB open
no provider collection
~~~

## Same-tab relaunch

The owner tab must not request the same exclusive lock again merely because the Bookmarklet/runtime launcher is invoked again.

It reuses/focuses its local runtime.

This avoids self-queueing/deadlock and preserves one runtime per owner tab.

## Lock lifetime and release

The owner holds the lock for the full period in which its local production runtime can mutate authority.

For explicit stop:

~~~text
stop new mutation-producing work
→ complete the runtime's normal teardown/no-further-mutation boundary
→ close owned Worker/DB resources as defined by the implemented lifecycle
→ only then finish the lock lifetime/release ownership
~~~

The ownership layer does not invent a second shutdown protocol. It encloses the normal runtime teardown contract implemented by the owning components.

A later owner must not be authorized while the previous explicit owner can still mutate the production authority.

On page/agent termination, browser lock release is used. A later explicit launch may acquire the released lock but must still perform normal DB/readiness/reopen checks before recording.

## No forced or timeout takeover

A hidden/background owner remains owner.

Do not displace a valid lock holder because:

- a heartbeat is old;
- BroadcastChannel is silent;
- the tab is hidden;
- a timer expired;
- another tab appears healthier.

If the browser still considers the lock held, another tab remains passive.

`steal:true` is not used because the displaced holder's code may still execute and create split-brain.

## Messaging and diagnostics

BroadcastChannel may carry presence/change hints only.

`navigator.locks.query()` may be used for diagnostics only.

Neither can authorize startup:

~~~text
BroadcastChannel silence != permission to become owner
locks.query() snapshot != permission to become owner
exclusive request grant = ownership authority
~~~

Ownership diagnostics must remain sanitized and must not contain session/auth/account data.

## Capability failure

If Web Locks are unavailable or required acquisition fails with a capability/security error:

~~~text
production ownership = blocked
production Worker/DB = unopened
Recorder = not started
~~~

Do not silently fall back to a weaker authority mechanism.

## Chromium verification — C10

C10 proves at minimum:

1. two same-origin pages racing startup produce exactly one owner;
2. the loser opens no production Worker/DB and performs no provider collection;
3. repeated launch in the owner tab reuses the singleton without self-deadlock;
4. a hidden/background owner is not displaced;
5. BroadcastChannel loss and `locks.query()` cannot create ownership;
6. Web Locks unavailable/SecurityError blocks startup with no fallback;
7. explicit stop does not release ownership before the local runtime teardown boundary;
8. after release/termination, a later explicit owner can acquire and runs normal readiness/reopen first.

These are browser/runtime behavior tests and belong in Chromium.

## Authenticated-origin verification — C12

Real Leumi verification is intentionally deferred until final cutover readiness.

C12 proves with two authenticated same-origin tabs that the same canonical lock contract works on the actual target origin:

~~~text
first tab owns
→ second tab cannot become production owner
→ first owner releases/closes
→ later explicit second-tab launch can acquire
→ normal readiness precedes Recorder work
~~~

No separate early live ownership gate is required.

## Explicit non-goals

Initial V2 does not add:

- automatic hot-standby takeover;
- distributed lease protocol;
- heartbeat failover;
- lock stealing;
- shadow-mode ownership machinery;
- rollover-specific ownership protocols;
- alternate rollback-election systems.

If future storage lifecycle features are added, they remain inside the same logical production-owner boundary unless a new architecture decision explicitly changes it.
