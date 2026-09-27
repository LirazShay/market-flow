# Market Flow — Browser SQL V2 Planning Continuation

Continue:

~~~text
LirazShay/market-flow
branch: main
~~~

Default response language: Hebrew. Code/identifiers/technical terms may remain English.

GitHub main is the source of truth.

## Startup

Read only the HOT path first:

~~~text
AGENTS.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
~~~

Then follow the exact current pointer from `STATUS.json`.

If planning is still open, also read GitHub Issue #72 and only the current planning authorities it links.

Do not preload the old 42-WP/ND/Phase planning unless a current Issue links a specific historical uncertainty.

## Boundary

While `STATUS.json` still points to Browser SQL planning finalization:

- remain planning-only;
- do not implement C01 or downstream product/runtime/browser behavior;
- repair any discovered contradiction in the owning GitHub Issue/decision/doc/guard;
- keep live progress only in `STATUS.json`;
- run the verification required by the current pointer.

The current executable candidate is Master #85 with C01..C12 #73..#84. Stable scope/order belongs in `ROADMAP.md`; the exact live next step does not belong in this file.

When planning is formally frozen and `STATUS.json` moves to implementation entry, replace this file with the implementation-chat handoff required by that final planning step.
