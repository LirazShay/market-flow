# Handoff — Local History Viewer V1

This file is a compact boundary summary for a fresh chat/agent. It is not the operational status source.

Copy-ready prompt for the next development chat:

~~~text
NEXT_CHAT_PROMPT.md
~~~

Authoritative progress:

~~~text
STATUS.json
~~~

Complete plan:

~~~text
ROADMAP.md
~~~

## Current boundary

~~~text
Stages 1–7 complete
Stage 7 browser checkpoint green
Stage 8 persistence integration next
~~~

Latest verified checkpoints:

~~~text
Fast CI
Run 35744733541
104 passed / 0 failed

Browser CI
Run 35744806678
13 passed / 0 failed
~~~

## Stage 8 reading order

~~~text
AI_CONTEXT.md
STATUS.json
ROADMAP.md — Stage 8 only
docs/data-model.md — stores + transaction boundaries
docs/architecture.md — write/success boundary
storage/README.md
storage/schema.js
storage/connection.js
storage/write.js
recorder/pure/recorder-loop-logic.js
recorder/recorder-loop.js
tests/TESTING_POLICY.md
relevant tests
~~~

## Stage 8 scope

~~~text
8.1 persistence record builders/contracts
8.2 session + universe persistence
8.3 atomic successful-cycle transaction
8.4 recorder integration + rollback/failure tests
~~~

## Critical traps

1. Do not hardcode 561 or exactly three chunks.
2. Preserve canonical `securityId = String(...)`.
3. Preserve raw GetSecuritiesData Security fields.
4. Preserve raw MapHeat record in universe storage.
5. Preserve `null != 0 != ""`.
6. Do not compose single-store write helpers to simulate atomicity.
7. Successful cycle persistence must use one transaction across:

~~~text
cycles + history + latest + meta
~~~

8. Recorder completed/latest in-memory state must advance only after DB commit succeeds.
9. Failed API/validation/DB commit must not partially update latest/history.
10. Browser CI is required at the end of Stage 8 because IndexedDB transaction semantics are part of the contract.

## Testing rule

~~~text
tests/behavior first where practical
→ implementation
→ Fast CI
→ Stage 8 Browser CI checkpoint
~~~

Tests should protect observable contracts, not private implementation details.
