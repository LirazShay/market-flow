# Handoff — Local History Viewer V1

Use this when entering this workstream in a fresh chat.

It is not the operational status source; STATUS.json is authoritative.

## Current boundary

~~~text
Stages 1–11 complete
Stage 12 — Cross-tab live refresh: IN PROGRESS / NOT COMPLETE
Do not start Stage 13
~~~

Latest verified checkpoint:

~~~text
Fast CI
Run 35756792160
136 passed / 0 failed

Historical technical evidence:
Viewer Checkpoint C
Run 35756990977
34 Chromium tests passed / 0 failed

This run does not mark Stage 12 complete.
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
ROADMAP.md          # Stage 12 section
STATUS.json
docs/architecture.md
docs/viewer-ux.md
messaging/
viewer/live-refresh.js
viewer/current-table.js
recorder/recorder-loop.js
tests/automation/specs/viewer-live-refresh.spec.js
relevant unit/browser tests
~~~

Do not reconstruct current state from old chat history.

## Current implementation boundary: Stage 12

~~~text
Cross-tab live refresh is not yet accepted as complete.

Review the existing Stage 12 implementation and tests, identify any missing acceptance criteria or integration gaps, complete them, then explicitly close Stage 12 in STATUS.json.

Do not begin Stage 13 until that is done.
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

Stage 12 is still active. Reuse the existing Stage 12 Fast/Chromium evidence where valid, but do not treat it as stage closure. Run any additional verification required by the actual remaining gap before marking Stage 12 complete.
