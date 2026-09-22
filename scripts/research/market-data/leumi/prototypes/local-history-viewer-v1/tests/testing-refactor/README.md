# Testing Refactor Mini-Project

Purpose:

Reduce development feedback time by moving most deterministic logic checks to fast unit tests and reserving Chromium/Playwright for real browser integration boundaries.

This mini-project temporarily pauses normal Local History Viewer feature work.

Resume point after completion:

~~~text
Stage 7.3 — Single chunk fetch
~~~

## Target testing pyramid

~~~text
                Live Leumi
              very few checks
                   ▲
                   │
          Playwright / Chromium
        checkpoint integration only
                   ▲
                   │
          lightweight integration
              selected cases
                   ▲
                   │
             fast unit tests
          many tests, every change
~~~

## Principles

- Fast tests should dominate test count.
- Browser tests should verify browser-only behavior and cross-component integration.
- Do not test private implementation details just because they are easy to reach.
- Prefer pure functions for deterministic logic.
- Keep browser adapters thin.
- CI should give fast feedback on ordinary implementation changes.
- Full Chromium should run at meaningful checkpoints, not every small push.
- Live Leumi verification remains a separate, rare provider-integration layer.

## Current baseline

Fast/unit layer:

~~~text
Not yet implemented
~~~

Browser layer:

~~~text
Playwright + Chromium
GitHub Actions
real IndexedDB
mocked Leumi endpoints
~~~

Current browser workflow runs for essentially every prototype JS/HTML/CSS change, which is too expensive for iterative development.

## Ownership

This folder owns the temporary testing-refactor plan/status only.

Durable testing rules that survive the mini-project will be folded into:

~~~text
tests/README.md
package.json
GitHub Actions workflows
AI_CONTEXT.md
~~~

when the mini-project is completed.
