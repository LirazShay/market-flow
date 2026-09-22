# Handoff — Local History Viewer V1

Use this when entering this workstream in a fresh chat.

It is not the operational status source; STATUS.json is authoritative.

## Current boundary

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

Latest verified checkpoint:

~~~text
Fast CI
Run 35756792160
136 passed / 0 failed

Viewer Checkpoint C
Run 35756990977
34 Chromium tests passed / 0 failed
~~~

Verified viewer foundation:

~~~text
same-origin viewer
→ IndexedDB current table
→ BroadcastChannel notification
→ IndexedDB reread
→ manual refresh fallback
~~~

## Read in this order

~~~text
/AGENTS.md
AI_CONTEXT.md
STATUS.json
ROADMAP.md          # Stage 13 section
docs/viewer-ux.md   # sorting behavior
viewer/pure/current-table-logic.js
viewer/current-table.js
relevant unit/browser tests
~~~

Do not reconstruct current state from old chat history.

## Next implementation: Stage 13

~~~text
Dynamic sorting
- clickable headers
- single-column sort
- numeric/time first click DESC
- string first click ASC
- toggle ASC/DESC
- deterministic null-safe sorting
- equal values → paperName ASC tie-breaker
- visual indicator ▲ / ▼
~~~

Default V1 sort:

~~~text
DailyDealsQuantity DESC
tie-breaker: paperName ASC
~~~

This is a UX default, not a trading recommendation.

## Invariants to preserve

- IndexedDB remains source of truth.
- BroadcastChannel carries notifications, not market row payloads.
- null != 0 != "" internally.
- display: null/undefined/empty → —, zero → 0.
- never hardcode universe size 561.
- current-table rows must not be dropped because universe metadata is missing.
- tests protect behavior, not private implementation details.

## Verification rule

Stage 13 should use fast deterministic tests for sorting logic.

The next planned Chromium checkpoint is after Stages 14–15 unless a real browser-only regression justifies the early-browser exception.
