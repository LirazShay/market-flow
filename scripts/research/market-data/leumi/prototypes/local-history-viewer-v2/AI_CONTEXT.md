# AI Context — Local History Viewer V2

Compact technical continuation context only. Live current/next/completion state belongs only in `STATUS.json`.

Fresh chat:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ active GitHub Issue
→ only directly touched code/tests/specs
~~~

Do not preload historical Browser SQL planning unless the active Issue links a specific uncertainty to it.

## Product target

~~~text
authenticated Leumi page
→ preserved V1 collector/validation
→ one Runtime Controller / SQL Authority Worker
→ pinned DuckDB-Wasm + persistent OPFS
→ atomic raw/current/history SQL authority
→ trusted reads
→ Current Universe + Security Detail/History
→ simple read-only Dynamic SQL Scanner
~~~

D-043 owns provider/data continuity and the three product surfaces.
Preserve V1 provider/collection continuity; V2 changes persistence/analytics authority, not the proven provider contract.
D-044 owns the current post-KISS implementation baseline.

## Provider/data invariants

Preserve:

- authenticated page-context collection;
- MapHeat2 dynamic universe;
- sequential GetSecuritiesData baseline;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- exact requested/received/unique/duplicate/missing/unexpected validation;
- full raw MapHeat + Security preservation;
- `null != 0 != "" != undefined`;
- no guessed provider semantics;
- incomplete/corrupt cycles never advance authority.

## SQL/runtime invariants

- one SQL Authority Worker owns DuckDB-Wasm/OPFS;
- one validated complete cycle is the atomic persistence unit;
- Viewer never owns DuckDB/OPFS directly;
- notifications are hints; clients reread authoritative state;
- unsupported DB/schema blocks writable startup without destructive reset;
- retain committed history; no silent prune/reset;
- production durability/checkpoint/retry details are selected from evidence, not pre-fixed ceremony.

## Scanner baseline

Initial Scanner is intentionally small:

~~~text
draft SQL + interval
→ explicit Activate
→ one active config
→ read-only SQL
→ one execution at a time
→ no burst replay
→ truthful result/error grid
~~~

No mandatory immutable query history, anchored scheduler, streaming, collaboration or advanced cancellation/preemption.

Analytical optimization is evidence-driven:

~~~text
real SQL first
→ representative measurement
→ smallest targeted optimization only if needed
~~~

## Cross-tab ownership

Production ownership uses one stable exclusive Web Lock.

Chromium proves the mechanism in C10.
Authenticated-origin two-tab ownership proof belongs to C12 before cutover.

It is **not** part of the early C01 feasibility blocker.

## Live verification boundaries

- C01 / #73: authenticated-origin Worker + exact Worker/Wasm + OPFS + synthetic SQL write/COMMIT + close/reopen/read marker. Existing probe CHECKPOINT usage does not define production checkpoint cadence.
- C06 / #78: bounded real provider → validation → SQL → trusted-read L-2 proof.
- C12 / #84: final integrated authenticated run + real-origin ownership proof + explicit cutover.

## Current execution graph

~~~text
Master #85

C01 #73
C02 #74
C03 #75
C04 #76
C05 #77
C06 #78
C07 #79
C08 #80
C09 #81
C10 #82
C11 #83
C12 #84
~~~

Stable order/scope: `ROADMAP.md`.
Exact live pointer: `STATUS.json`.
Issue navigation: `docs/browser-sql-github-execution-structure.md`.

Completed reusable evidence:

~~~text
#29 engine pin/manifest
#30 deterministic Browser SQL probe
~~~

## Conditional/future scope

No standing Issues exist for:

- persisted analytical optimization unless C07 proves need;
- advanced Scanner resource hardening unless C11 proves need;
- streaming unless C09/C11 proves need;
- storage/export/fresh-DB workflow unless C11 proves need;
- target Windows evidence unless required by a material decision;
- shadow unless C06 leaves one material live ambiguity.

Generalized archive/rollover, schema/engine upgrade framework, multi-epoch history, collaboration and automated trading execution are not initial-V2 requirements.

## Verification

~~~text
Node
→ pure deterministic logic

Chromium
→ Worker/Wasm/OPFS/runtime/Viewer/Web Locks/Scanner integration

authenticated Leumi
→ real-origin/provider facts CI cannot prove
~~~

Permanent normal workflows remain Fast CI and Browser CI.

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

Provider auth remains inside the authenticated page context.

## History

Pre-KISS 42-WP planning and detailed mechanism research are COLD history under `docs/history/`.

Use them only when the active Issue needs historical rationale/evidence.
