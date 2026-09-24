# AI Context — Momentum Ranking Replacement

## Current rule

The prior `momentum-ranking-v1` research was explicitly abandoned by the user and archived.

The next ranking method must be treated as a **fresh design from user input**.

Do not infer or reuse old V1 concepts merely because they exist in repository history.

## What remains valid independently

Only project-wide infrastructure/invariants that are not ranking-method-specific remain available, for example:

- GitHub `main` is source of truth;
- dynamic universe; no hardcoded security count;
- canonical security id remains `String(PaperId or Key)` where applicable to market-data infrastructure;
- preserve data integrity and `null != 0 != ""`;
- IndexedDB/local-history infrastructure remains an independent source of recorded data.

Any ranking-specific semantics must come from the replacement method.

## Historical recovery

Only if the user explicitly requests old material:

~~~text
docs/analysis/archive/momentum-ranking-v1/
scripts/research/archive/momentum-ranking-v1/
~~~
