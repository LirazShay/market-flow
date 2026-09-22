# MF-LHV-PROVIDER-001 — Provider and Market-Data Contract

## Purpose

This spec defines the provider-facing assumptions that Local History Viewer V1 is allowed to rely on when collecting Leumi market data.

It deliberately separates:

~~~text
what the tool requires
from
what the provider may happen to return today
~~~

Detailed endpoint/field research belongs in repository-level `docs/leumi-api/`.

Operational progress is tracked only in `../STATUS.json`.

## Scope

This contract covers the Local History Viewer dependency on:

- `MapHeat2`;
- `GetSecuritiesData`;
- universe discovery;
- identity/join rules;
- response-shape validation;
- collection membership/completeness;
- preservation of raw provider payloads;
- evidence boundaries.

It does not define business meaning for every provider field.

Unknown field semantics remain unknown until supported by evidence.

## Contract

### Universe discovery

The recorder first obtains a dynamic universe through `MapHeat2`.

The implementation may probe for count and then request the full set.

The universe size is provider-derived and must never be assumed from a historical observation.

Each usable MapHeat record requires a non-empty `PaperId`.

### Security collection

The current V1 provider adapter requests security data from:

~~~text
/lti/lti-app/api/SecuritiesFast/GetSecuritiesData
~~~

using the planned security IDs.

The expected security collection resides in:

~~~text
data.SecuritiesData.Table.Security[]
~~~

Each usable returned security requires a non-empty `Key`.

### Identity

The canonical join boundary is:

~~~text
securityId = String(PaperId or Key)
~~~

Verified join relation used by this tool:

~~~text
String(MapHeat2.PaperId)
==
String(GetSecuritiesData.Key)
~~~

Identifiers are not treated as quantities.

### Snapshot timing

MapHeat2 and GetSecuritiesData are separate provider calls.

The tool must not claim they are an atomic shared provider snapshot.

Per-chunk timing/server-as-of information should be preserved where available.

## Invariants

1. Universe size is dynamic.
2. MapHeat Paper IDs must be present and unique after canonicalization.
3. GetSecuritiesData keys must be present and unique per response.
4. Requested membership and response membership must match exactly for a successful chunk.
5. Across a successful complete cycle there are no missing, duplicate or unexpected canonical IDs.
6. Response shape failures are explicit failures, not empty-success cases.
7. Full raw MapHeat records are preserved in the universe store.
8. Full raw GetSecuritiesData Security objects are preserved in current/history records.
9. Field values are preserved without collapsing `null`, `0`, empty string, or missing.
10. Provider field semantics are never guessed.
11. A one-time live observation is evidence, not proof of an eternal private API contract.

## Failure semantics

Any of these fail the affected collection boundary:

- HTTP failure;
- invalid JSON;
- missing required response structure;
- missing/empty `PaperId` or `Key`;
- duplicate IDs;
- missing requested IDs;
- unexpected IDs;
- changed count during full-universe load that makes completeness uncertain.

A failed or uncertain provider response must not be converted into a complete market snapshot.

If a live provider behavior changes, record the observation safely, classify the evidence, and revise adapter/spec/test fixtures deliberately.

Do not attempt to bypass access controls or provider protections.

## Extension and reuse

Future provider adapters should implement the same conceptual boundary:

~~~text
discover universe
→ canonicalize identity
→ fetch member data
→ validate exact membership/completeness
→ produce provider-neutral complete-cycle inputs
~~~

A future tool may use a different provider or streaming model. It should preserve the integrity contract even if endpoint shapes change.

Provider-specific details should remain at the adapter/evidence edge so research logic above it does not depend on accidental field layout.

## Verification mapping

Deterministic response validation is covered by:

- unit tests under `../tests/unit/`;
- sanitized provider fixtures under `../tests/fixtures/`;
- mocked Playwright endpoint coverage.

Real current response shape/session behavior requires live verification.

Repository-level evidence:

~~~text
../../../../../../../docs/leumi-api/
~~~

No authenticated HAR, cookie, authorization header, token, account number, or private session dump belongs in repository evidence.

## Change triggers

Review this spec whenever:

- provider endpoint paths/parameters change;
- MapHeat2 or GetSecuritiesData response shape assumptions change;
- canonical identity/join logic changes;
- chunk membership/completeness rules change;
- new provider fields become required;
- raw-payload preservation changes;
- collection switches from polling/sequential calls to another model;
- live evidence contradicts an existing assumption.

## References

- `../../../../../../../docs/leumi-api/README.md`
- `../docs/requirements.md`
- `../docs/architecture.md`
- `../recorder/pure/universe-logic.js`
- `../recorder/pure/securities-chunk-logic.js`
- `../recorder/universe-loader.js`
- `../recorder/securities-chunk-fetcher.js`
- `../tests/fixtures/`
