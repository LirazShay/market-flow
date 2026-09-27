# AI Context — Local History Viewer V2

Compact technical continuation context only. Live current/next/completion state belongs only in `STATUS.json`.

Fresh chat:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ active GitHub Issue
→ only directly touched current code/tests/specs
~~~

## Current product/runtime target

~~~text
authenticated Leumi page
→ preserved V1 provider acquisition
→ exact complete-cycle validation
→ ws://127.0.0.1 loopback transport
→ one localhost Node.js service
→ native DuckDB authority
→ trusted local reads
→ Current Universe + Security Detail/History
→ simple Dynamic SQL Scanner
~~~

D-043 owns provider/data continuity and the three product surfaces.
D-045 owns the current Node.js localhost authority boundary.

The former Browser-SQL C01-C12 graph is frozen and must not be executed forward during the 100-stage replacement re-plan.

## Evidence that changed the architecture

Authenticated C01 result:

~~~text
Worker load       = Verified
Wasm instantiate  = failed / Unknown
failedStage       = wasm-instantiate
cleanup           = Verified
~~~

Separate real-origin bridge smoke test:

~~~text
Leumi page
→ ws://127.0.0.1:8765
→ local Node.js server
→ message received
~~~

Classification:

- Browser-side DuckDB-Wasm candidate on Leumi = failed at required runtime gate.
- Browser→localhost WebSocket feasibility = Verified.
- Production Node protocol/native DuckDB package/schema/lifecycle = planning in progress.

## Provider/data invariants

Preserve:

- authentication and provider calls stay in the Leumi page;
- MapHeat2 dynamic universe;
- sequential GetSecuritiesData baseline;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- exact requested/received/unique/duplicate/missing/unexpected validation;
- full raw MapHeat + Security preservation;
- `null != 0 != "" != undefined`;
- no guessed provider semantics;
- incomplete/corrupt cycles never advance authority.

## Authority model

Authenticated browser page:
- owns provider/session access;
- produces validated complete-cycle market data;
- does not own durable SQL history.

Loopback WebSocket:
- transport only;
- never source of truth;
- never transports copied credentials/session material.

Local Node.js service:
- sole target owner of V2 DuckDB persistence and SQL execution after cutover;
- owns commit/readiness/read APIs and Scanner execution;
- binds to loopback unless a later explicit decision changes that boundary.

DuckDB:
- database handle/file belongs only to Node;
- browser/Viewer clients never open independent DB authority.

Viewer/Scanner:
- local clients of trusted Node service APIs;
- no direct authoritative DB writes.

## Scanner baseline

Keep it simple:

~~~text
draft SQL + interval
→ explicit Activate
→ one active config
→ read-only SQL
→ one execution at a time
→ truthful result/error grid
~~~

Optimization, streaming, cancellation and resource controls remain evidence-driven.

## Verification direction

~~~text
Node
→ protocol/service/database/pure logic

Chromium + local test service
→ browser↔localhost transport and Viewer integration

authenticated Leumi
→ only real provider/origin facts CI cannot prove
~~~

The replacement verification matrix is owned by the active S&T tree, including unit, real service/DuckDB integration, Fake-Leumi Chromium E2E, local demo, workload and final live-cutover proof.

## Security

The repository is public.

Never commit/copy:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- private browser/session data;
- raw authenticated dumps not strictly sanitized.

Provider auth remains inside the authenticated page context. Node receives market data plus minimal non-sensitive protocol metadata only.

## Current planning protocol

S&T Planner is active.

~~~text
.planning/GOAL.md    = stable migration boundary
.planning/TREE.yaml  = plan logic
.planning/DECISIONS.md = material choices/questions
.planning/STATUS.yaml  = planning resume pointer
.planning/EXECUTION.yaml = executor-chat allocation after freeze
~~~

The former fixed 100-stage sequence is superseded. The user-requested conversation pacing may still be one planning unit per message, but decomposition and executor-chat count come from the S&T tree.

Workstream operational current/next remains in `STATUS.json`.

## History

Browser-SQL decisions/plans/probes remain evidence/reference, not current executable architecture.

Cold-history index:

`docs/history/README.md`
