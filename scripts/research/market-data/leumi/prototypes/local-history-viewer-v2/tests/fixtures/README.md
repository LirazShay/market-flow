# Test Fixtures

Synthetic, sanitized fixtures for automated Local History Viewer tests.

Rules:

- no cookies.
- no session/auth headers.
- no account data.
- no private raw dumps.
- preserve important market-data distinctions such as `null` vs `0`.
- fixtures may model success and deterministic failure scenarios.

Primary fixture module:

~~~text
leumi-api-fixtures.js
~~~

Browser mocks consume these fixtures from:

~~~text
../automation/helpers/mock-leumi-api.js
~~~

