# Market Flow — Fresh Chat Continuation Prompt

Repository:

~~~text
LirazShay/market-flow
branch: main
~~~

Default response language for this project: Hebrew. Code/identifiers may remain English.

Work from GitHub as the source of truth.

Start with:

~~~text
fetch main
→ AGENTS.md
→ scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/README.md
→ .../STATUS.json
→ .../AI_CONTEXT.md
~~~

Then read only the current Stage scope, target implementation files, direct tests and owning SPEC(s) needed for the next work unit.

Do not preload all ROADMAP/history/policies/specs.

If current compact context is insufficient to explain an existing design or past decision:

~~~text
.../docs/history/README.md
docs/project/decisions.md
~~~

and read only the relevant entry.

Follow `AGENTS.md` for KISS, testing, Chromium verification, SPEC impact, security, continuous improvement and completion/reporting rules.

When the user says:

~~~text
תמשיך לשלב הבא
~~~

continue from the exact pointer in `STATUS.json` using a natural engineering + verification boundary.

Do not duplicate the new current/next state into this prompt; update only `STATUS.json`.
