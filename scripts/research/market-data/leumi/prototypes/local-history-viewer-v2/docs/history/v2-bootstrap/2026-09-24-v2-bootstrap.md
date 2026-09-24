# V2 bootstrap — 2026-09-24

Historical evidence for the creation of Local History Viewer V2.

## Provenance

V2 was created from the frozen V1 tree on `main` at:

~~~text
source main commit:
044546a18e79ac820a246d477340bad8424cab64

exact clone commit:
d0b09913ef6d49359f7560b801cced7af53534a5
~~~

The first commit attached the exact V1 subtree at the sibling V2 path before any V2-specific edit. Frozen V1 was not modified.

## Isolation applied

The V2 adaptation separated the browser/runtime identities that would otherwise collide with V1:

~~~text
IndexedDB        market-flow-leumi-history-v2
BroadcastChannel market-flow-leumi-v2
Viewer window    market-flow-leumi-v2-viewer
Viewer marker    market-flow-leumi-v2
Runtime          market-flow-v2.runtime.js
Bookmarklet      market-flow-v2.bookmarklet.txt
~~~

Internal `window.MarketFlow*` globals intentionally remain inherited. Therefore V1 and V2 are suitable for concurrent separate-tab use, but should not both be injected into one page context without refresh.

## Verification

Final verified implementation commit:

~~~text
408ff912ed6e1c80c6476a50e39798434d5d5060
~~~

Fast CI:

~~~text
run 35991326398
success
~~~

Browser CI:

~~~text
run 35991326361
success
56/56 Chromium tests passed
Playwright: 28.0s
~~~

## Failure review

The first isolation attempt produced two useful guard failures:

- Fast CI run `35991077053`: two context-architecture tests caught missing cold-history discoverability and optional helper labels.
- Browser CI run `35991076953`: 55/56 passed; the remaining viewer-recovery assertion still expected the V1 marker after reload.

Root cause: the V2 identity/documentation adaptation did not initially preserve every inherited guard contract.

Resolution: restore the context contract and update the stale recovery expectation to the V2 marker. The existing tests were kept unchanged where they represented valid architecture rules.

Prevention decision: no new repository-wide policy was added. The existing unit/context guards and Playwright recovery regression already provide the correct prevention and should remain part of future fork/version migrations.

## Spec impact

No product behavior was intentionally changed during bootstrap. V2 inherited the V1 specs as its starting contract set; future V2 requirements may deliberately replace or remove those contracts.
