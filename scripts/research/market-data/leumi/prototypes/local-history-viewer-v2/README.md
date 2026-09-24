# Local History Viewer V2

Independent V2 workstream derived from the frozen Local History Viewer V1 baseline.

V1 remains intact at the sibling path:

~~~text
../local-history-viewer-v1/
~~~

V2 begins from an exact source snapshot of V1, then evolves independently. Operational progress belongs only in `STATUS.json`.

## Fresh-chat HOT path

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
~~~

After HOT context, read only the current task scope, target code/tests and owning SPEC(s).

## Baseline architecture

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ Viewer rereads IndexedDB
~~~

This architecture is inherited as the starting baseline, not a restriction on future V2 design.

## V1 / V2 isolation

V2 has its own browser data/runtime identities:

~~~text
IndexedDB:       market-flow-leumi-history-v2
BroadcastChannel: market-flow-leumi-v2
Viewer window:   market-flow-leumi-v2-viewer
Runtime files:   market-flow-v2.*
~~~

The internal `window.MarketFlow*` globals are intentionally still inherited. Do not inject V1 and V2 into the same page context without a refresh. Separate tabs can run independently because their persistent data/channel/window identities are separated.

## Where to look

| Need | File |
|---|---|
| version | `VERSION` |
| progress / next | `STATUS.json` |
| technical continuation context | `AI_CONTEXT.md` |
| plan / scope | `ROADMAP.md` |
| normative contracts | `specs/README.md` |
| inherited design/history | `docs/README.md` |
| runtime usage | `runtime/README.md` |
| testing policy | `tests/TESTING_POLICY.md` |
| optional human fresh-chat helper | `HANDOFF.md` |
| optional copy/paste continuation prompt | `NEXT_CHAT_PROMPT.md` |

Prototype code remains research code. Promotion to `src/` requires a separate production decision.
