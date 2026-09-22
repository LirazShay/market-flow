# Handoff — Local History Viewer V1

Use this file when entering the workstream in a fresh chat.

This file intentionally contains **no live stage/completion snapshot**.

The only authoritative source for current progress, verification state and the next pointer is:

~~~text
STATUS.json
~~~

## Fresh-chat read order

~~~text
/AGENTS.md
AI_CONTEXT.md
STATUS.json
ROADMAP.md          # read only the stage selected by STATUS.json
target implementation files
directly relevant tests
tests/TESTING_POLICY.md when verification/checkpoint rules matter
~~~

Read broader design docs only when changing architecture/schema/public behavior or resolving a contradiction.

Do not reconstruct current state from old chat history or from this handoff.

## Core architecture

~~~text
Leumi browser tab
→ Recorder
→ validated complete cycle
→ atomic IndexedDB persistence
→ BroadcastChannel metadata notification
→ same-origin Viewer
→ viewer re-reads IndexedDB
~~~

## Invariants to preserve

- IndexedDB remains source of truth.
- BroadcastChannel carries notifications, not market row payloads.
- successful-cycle persistence is atomic across cycles/history/latest/meta.
- notification happens only after the successful DB commit.
- failed API/validation/DB work must not expose partial latest/history.
- null != 0 != "" internally.
- display: null/undefined/empty → —, zero → 0.
- never hardcode universe size 561.
- current-table rows must not be dropped because universe metadata is missing.
- tests protect behavior/public contracts, not private implementation details.
- repository is public: never commit credentials, cookies, tokens, account data or sensitive session dumps.

## Continuation rule

When asked to continue:

1. read the exact pointer in `STATUS.json`;
2. read that stage in `ROADMAP.md`;
3. inspect only its relevant implementation/tests;
4. define behavior/tests first when practical;
5. implement a coherent engineering boundary;
6. run the required verification;
7. update `STATUS.json` in the same batch.

Do not mark a stage complete while required verification is pending.

Do not copy the resulting current/next state back into this file.
