## Change summary

Describe the coherent behavior/design change.

## KISS / complexity review

- [ ] This is the simplest coherent solution that satisfies the current verified requirement.
- [ ] I did not add speculative abstraction, lifecycle, framework, loader/updater, cache, concurrency, retry machinery, compatibility layer, or extension points only for hypothetical future use.
- [ ] If I added meaningful complexity, there is a concrete present-day requirement/evidence showing why the simpler approach is insufficient.
- [ ] Simplicity did not remove required correctness, data-integrity, security, observability, recovery, or verification guarantees.

## Verification

- [ ] Relevant tests were run after their final edit.
- [ ] Changed/new browser tests were verified with the smallest sufficient targeted Chromium run first.
- [ ] Expected TDD red was demonstrated with the targeted test, not an unnecessary full Browser suite.
- [ ] Any production/runtime/browser code change was verified in Chromium on its final state, even if no Playwright test file changed.
- [ ] Full Browser CI was run for shared runtime/harness/storage/messaging/viewer integration, cross-component/multi-area code changes, and required Stage/checkpoint boundaries.

## Failure learning / continuous improvement

If this work encountered a meaningful unexpected failure, regression, CI issue, live surprise, or avoidable rework:

- [ ] Technical root cause is understood.
- [ ] I asked what reasoning/process choice led to the condition.
- [ ] I identified why existing tests/review/specs/verification did not catch it earlier.
- [ ] I identified the smallest prevention.
- [ ] I evaluated whether the lesson is local, workstream-wide, or repository-wide.
- [ ] Generalizable lessons were promoted to the narrowest correct owner; one-off lessons were not turned into global process.
- [ ] The prevention still passes the KISS/complexity gate.

If no meaningful unexpected failure occurred, this section is not applicable.

## SPEC impact review

Repository policy: `docs/project/specification-policy.md`

- [ ] I reviewed the specs affected by this change.
- [ ] Either **No spec impact** applies, or affected specs were updated/added/removed in this same change.
- [ ] New durable responsibilities have an owning spec when warranted.
- [ ] I did not copy live stage/status/next-pointer/CI snapshot data into specs.
- [ ] I reconciled any code/test/spec disagreement instead of knowingly leaving spec drift.

## Data integrity / security

- [ ] No secrets, cookies, tokens, authorization headers, account numbers, or private session data were added.
- [ ] Relevant identity/count/null-vs-zero/atomicity invariants remain explicit.
