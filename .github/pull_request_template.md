## Change summary

Describe the coherent behavior/design change.

## Verification

- [ ] Relevant tests were run after their final edit.
- [ ] Changed/new browser tests were verified with the smallest sufficient targeted Chromium run first.
- [ ] Expected TDD red was demonstrated with the targeted test, not an unnecessary full Browser suite.
- [ ] Required broader CI/checkpoint was run only when applicable (for example Stage closure, integration checkpoint, or broad shared-infrastructure risk).

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
