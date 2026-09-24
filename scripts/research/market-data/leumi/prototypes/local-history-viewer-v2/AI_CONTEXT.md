# AI Context — Local History Viewer V2

Compact technical continuation context for V2.

Live progress / current work / exact next action live only in:

~~~text
STATUS.json
~~~

Default fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current scope / target files / direct tests / owning SPEC as needed
~~~

## Origin

V2 was created from an exact Git tree clone of the frozen V1 workstream. V1 is preserved unchanged in:

~~~text
../local-history-viewer-v1/
~~~

Treat inherited V1 code/tests/specs as the starting baseline. Do not assume the old V1 backlog defines V2 requirements.

Historical rationale remains discoverable from:

~~~text
docs/history/README.md
~~~

Read cold history only when the current task needs it.

## Baseline architecture

~~~text
authenticated Leumi browser tab
→ Recorder
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ same-origin Viewer
→ Viewer rereads IndexedDB
~~~

## V2 identity isolation

~~~text
database       market-flow-leumi-history-v2
channel        market-flow-leumi-v2
viewer window  market-flow-leumi-v2-viewer
viewer marker  market-flow-leumi-v2
runtime        market-flow-v2.runtime.js
bookmarklet    market-flow-v2.bookmarklet.txt
~~~

The internal browser globals are still inherited as `window.MarketFlow*`. V1 and V2 must not both be injected into the same browsing context without refresh. Concurrent use in separate tabs is compatible with the isolated persistent namespaces above.

## Inherited critical invariants

Until V2 deliberately changes a contract:

- never hardcode universe size;
- canonical security ID is `String(PaperId or Key)`;
- preserve full raw MapHeat and GetSecuritiesData Security objects;
- preserve `null != 0 != "" != undefined`;
- do not infer unknown provider field semantics;
- complete-cycle validation precedes persistence;
- successful cycle persistence is atomic across `cycles + history + latest + meta`;
- API / validation / DB failure must not leave partial `latest` or `history`;
- IndexedDB remains source of truth and BroadcastChannel remains notification-only.

## Implementation map

~~~text
recorder/   provider collection + cycle loop
storage/    IndexedDB schema/read/write + atomic persistence
messaging/  BroadcastChannel contract
viewer/     current/history UI + diagnostics
runtime/    generated runtime + Bookmarklet
debug/      sanitized Debug Bundle
specs/      durable contracts
tests/      unit + Playwright + fixtures
~~~

## V2 change rule

For each V2 behavior change:

~~~text
requirement / observable contract
→ affected SPEC review
→ tests first when practical
→ implementation
→ required verification
→ STATUS.json update
~~~

Do not modify frozen V1 merely to make V2 development easier.
