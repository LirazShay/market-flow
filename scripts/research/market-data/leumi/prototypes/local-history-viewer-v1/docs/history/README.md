# Historical Work Notes

Historical evidence, completed temporary plans, old status snapshots and investigation context live here so the normal AI continuation path stays small.

These files are **cold context**:

- they are preserved for fresh chats that need to understand how/why the current state was reached;
- they are not read on every normal continuation;
- they are not the current operational source of truth;
- they may contain rules/status that were correct at that historical moment but were later superseded.

Current `AGENTS.md`, current policy/spec/decision docs and current `STATUS.json` always win over archived instructions/status.

Current V1 status:

~~~text
../../STATUS.json
~~~

Current technical continuation context:

~~~text
../../AI_CONTEXT.md
~~~

## When to read history

Read this history index, then only the relevant entry, when:

- the user asks how/why a past decision was made;
- current evidence conflicts with a previous assumption;
- an unexpected failure may repeat an older failure class;
- a durable decision/spec references historical evidence;
- resuming or comparing with a completed mini-project;
- the current compact context is insufficient to explain an existing design.

Do **not** preload all history in a fresh chat.

## Status snapshots

### 2026-09-23 — pre context-compaction snapshot

~~~text
status-snapshots/2026-09-23-pre-context-compaction.json
~~~

Full historical snapshot of the former large `STATUS.json`, including accumulated Stage/CI/verification history before the hot-context compaction.

Use it only when a past Stage/run/verification detail is actually needed.

## Live verification

### 2026-09-23 — Stage 19 live verification and long-run report

~~~text
live-verification/2026-09-23-stage-19-live-report.md
~~~

Sanitized Stage 19.3/19.4 evidence covering the real Leumi browser run, long-run recorder/persistence results, Verified/Inferred/Unknown classification, repeated-launch contract clarification and automated closure verification.

## Completed mini-projects

### Browser CI runtime optimization

~~~text
test-runtime-optimization/2026-09-23-browser-ci-optimization.md
~~~

Historical Stage 20 optimization plan, timing measurements, flaky-test RCA and final verification evidence. Durable test/checkpoint rules remain in `../../tests/TESTING_POLICY.md`.

### Testing refactor

~~~text
testing-refactor/
~~~

Historical testing-pyramid refactor plan, status and verification evidence.

Durable current testing rules live in:

~~~text
../../tests/TESTING_POLICY.md
~~~
