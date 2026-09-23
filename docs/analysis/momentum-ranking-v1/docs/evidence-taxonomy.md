# Evidence Taxonomy — Momentum Ranking V1

This document defines the shared vocabulary used by the Momentum Ranking research when classifying claims, candidate features and future validation results.

It is durable semantics, not live progress.

## Evidence status

| Code | Meaning | Allowed interpretation |
|---|---|---|
| `PV` | Project-verified | Verified directly by Market Flow repository evidence, provider probes, tests, captured field coverage or validated runtime behavior. |
| `TL` | TASE-specific support | Supported by TASE-specific official material or research, but not yet validated on Market Flow history. |
| `GL` | General market-microstructure support | Supported in other markets or general literature; useful as hypothesis support, not proof for TASE. |
| `PI` | Project inference | Logically derived from project constraints/data semantics, but predictive value is not yet demonstrated. |
| `H` | Hypothesis | Plausible candidate relationship that must be tested empirically on collected TASE history. |
| `U` | Unknown | Availability, semantics or predictive value is unresolved. |

A feature may carry several codes. Example:

~~~text
PV + GL + H
~~~

means the required inputs/derivation are available and literature-motivated, while the predictive claim is still only a hypothesis.

## Availability class

| Code | Meaning |
|---|---|
| `NOW` | Derivable from the currently validated L1 snapshot/history inputs. |
| `HISTORY` | Requires accumulated local history or segmented waves. |
| `L2` | Requires deeper order-book levels not currently available in validated project data. |
| `TAPE` | Requires transaction-by-transaction timestamp/price/quantity. |
| `EXEC` | Requires real or simulated execution/order state. |
| `FUTURE` | Requires future empirical validation/calibration rather than an additional raw field. |

Availability does not imply usefulness.

## Feature role

| Role | Meaning |
|---|---|
| `LEADING` | Candidate evidence that may change before a meaningful price move. |
| `CONFIRMING` | Evidence that a hypothesized move is becoming real. |
| `LAGGING_CONTEXT` | Describes what has already happened or broader recent context. |
| `PROTECTIVE` | Detects deterioration, exhaustion, bad path or another reason to reduce/veto opportunity. |
| `GATE` | Determines whether evidence/stock/cycle is valid, observable or tradable enough to use. |
| `CONTEXT` | Changes interpretation/normalization without being directional by itself. |
| `OUTCOME` | Future label used for validation; not an input feature. |

A feature may have more than one role.

## Feature kind

| Kind | Meaning |
|---|---|
| `RAW` | Direct provider field. |
| `DERIVED` | Deterministic transformation of current/recent observations. |
| `STATE` | Interpretable state produced from multiple observations or derived measures. |
| `CONTEXT` | Market/session/local context. |
| `GATE` | Validity or feasibility condition. |
| `LABEL` | Future outcome used for validation. |

## Confidence dimensions

Do not collapse these into one number prematurely:

~~~text
Strength
Confidence
Coverage
Freshness
EvidenceDiversity
~~~

- **Strength** — how strongly the evidence points toward the interpretation.
- **Confidence** — how trustworthy/sufficient the evidence is.
- **Coverage** — how much of the required evidence is actually available.
- **Freshness** — whether the evidence is still timely for the target horizon.
- **EvidenceDiversity** — how many independent-ish information families agree.

Example:

~~~text
Strength = 95
Confidence = 40
~~~

does not mean a weak signal. It means a potentially strong interpretation supported by insufficient evidence.

## Unknown / zero / neutral

Mandatory invariant:

~~~text
UNKNOWN != ZERO != NEUTRAL
~~~

Examples:

- no valid BID data → Book feature is `UNKNOWN`, not zero;
- valid trade counter unchanged across a valid interval → zero new trades;
- valid balanced pressure → neutral.

## Claim discipline

Every durable research claim must be expressible as one of:

~~~text
Verified
Supported externally
Inferred
Hypothesis
Unknown
~~~

Do not upgrade an intuitive hypothesis to verified merely because it sounds plausible.

## Validation-target classes

Every predictive candidate in the future registry should point to one or more explicit validation targets, for example:

- next MID/price direction;
- target-before-adverse barrier;
- TimeToTarget;
- MFE / MAE;
- low-adverse-path outcome;
- continuation vs exhaustion;
- breakout acceptance vs rejection;
- cross-sectional rank / top-K quality;
- executable opportunity after friction.

A feature can be useful for one horizon/target and useless for another.

## Source hierarchy

When evidence conflicts, prefer:

~~~text
verified Market Flow/TASE project evidence
→ TASE-specific official/research evidence
→ general microstructure evidence
→ project inference
→ unvalidated hypothesis
~~~

This hierarchy controls claim strength, not whether a hypothesis is allowed to remain in the research backlog.
