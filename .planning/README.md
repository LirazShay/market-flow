# Project S&T State

This directory contains the durable planning state and the minimal post-freeze execution allocation.

## Planner read order

1. `FRAMEWORK.md`
2. `STATUS.yaml`
3. `GOAL.md`
4. relevant `TREE.yaml` nodes
5. `DECISIONS.md` when needed
6. `REVIEWS.md` when needed

## Executor read order

1. project `AGENTS.md`
2. `STATUS.yaml`
3. `EXECUTION.yaml`
4. only assigned `TREE.yaml` nodes
5. referenced decisions/context when needed

## Ownership

- GOAL — stable goal boundary.
- TREE — S&T logic, planning status, dependencies, success evidence.
- DECISIONS — material open questions and decisions.
- REVIEWS — planning review history.
- STATUS — small planning resume pointer and active/frozen state.
- EXECUTION — after freeze only: numbered chat allocation + execution state/result for leaf node IDs.

## Important

- One planning chat is preferred.
- Do not implement while `plan_state: active`.
- The whole intended plan must pass Final Planning Review before `plan_state: frozen`.
- After freeze, assign every implementation-ready leaf exactly once in EXECUTION.
- Execution dependencies remain in TREE -> depends_on.
