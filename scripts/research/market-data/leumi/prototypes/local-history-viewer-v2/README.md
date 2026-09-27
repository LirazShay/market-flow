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

## Implementation across fresh chats

Browser SQL V2 implementation is intentionally partitioned into **12 planned fresh chats: one chat per executable C01..C12 Issue, executed strictly serially**. Chat N+1 starts only after Chat N has closed its Issue, completed required verification and advanced `STATUS.json`.

Stable chat boundaries, entry/exit gates, verification ownership and conditional rejoin rules:

~~~text
CHAT_EXECUTION_PLAN.md
~~~

Ready-to-copy prompt for each Chat 01..12:

~~~text
CHAT_PROMPTS.md
~~~

These files do not own live progress. Always use `STATUS.json` to determine which chat/Issue is actually current.

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

## V2 product continuity

V2 preserves the V1-proven Leumi provider/data acquisition contract; it does not redesign that collector merely because storage changes. The authenticated MapHeat2 → sequential GetSecuritiesData → exact complete-cycle validation contract and full raw data semantics remain the collection baseline.

The target change is:

~~~text
same validated complete cycle
→ DuckDB-Wasm / OPFS SQL authority instead of IndexedDB
→ preserve Current Universe + Security Detail/History
→ add a separate Dynamic SQL Scanner
~~~

The product authority is `../../../../../../../docs/product/local-history-viewer-v2-product-shape.md`; D-043 owns the provider/product boundary and D-044 owns the current post-KISS Browser SQL implementation baseline.

## V1 / V2 isolation

V2 has its own browser data/runtime identities:

~~~text
IndexedDB:       market-flow-leumi-history-v2
BroadcastChannel: market-flow-leumi-v2
Viewer window:   market-flow-leumi-v2-viewer
Runtime files:   market-flow-v2.*
~~~

The internal `window.MarketFlow*` globals are intentionally still inherited. Do not inject V1 and V2 into the same page context without a refresh. V1 and V2 keep separate persistent data/channel/window identities. Within the V2 SQL target itself, production Recorder/DB ownership is singular: C10 uses one stable exclusive Web Lock so independent V2 tabs cannot become competing production owners.

## Where to look

| Need | File |
|---|---|
| version | `VERSION` |
| progress / next | `STATUS.json` |
| technical continuation context | `AI_CONTEXT.md` |
| plan / scope | `ROADMAP.md` |
| 12-chat implementation boundaries | `CHAT_EXECUTION_PLAN.md` |
| copy/paste prompt for each chat | `CHAT_PROMPTS.md` |
| normative contracts | `specs/README.md` |
| inherited design/history | `docs/README.md` |
| runtime usage | `runtime/README.md` |
| testing policy | `tests/TESTING_POLICY.md` |
| optional human fresh-chat helper | `HANDOFF.md` |
| optional copy/paste continuation prompt | `NEXT_CHAT_PROMPT.md` |

Prototype code remains research code. Promotion to `src/` requires a separate production decision.
