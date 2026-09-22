# Decision Log — Market Flow

מסמך זה מרכז החלטות שכבר התקבלו כדי שצ'אטים/agents חדשים לא יפתחו אותן מחדש בלי סיבה.

---

## D-001 — Evidence before architecture

Status: Accepted

Decision: קודם מוכיחים את ה-data flow בפועל, ורק אחר כך בונים architecture סביבו.

Why: ה-API הוא פנימי ולא מתועד ציבורית.

---

## D-002 — Repository is the project memory

Status: Accepted

Decision: כל ידע חשוב חייב להיכנס ל-repository ולא להישאר רק בצ'אט.

Why: הפרויקט אמור להמשיך בין chats ו-agents שונים.

---

## D-003 — Micro-step development

Status: Accepted

Decision: לבצע רק את השלב שהתבקש, לבדוק ולתעד לפני מעבר הלאה.

---

## D-004 — MapHeat2 role

Status: Accepted based on observed behavior

Decision:

~~~text
MapHeat2 = universe / discovery / metadata source
~~~

Evidence:

~~~text
docs/leumi-api/endpoints/mapheat2.md
docs/leumi-api/overview/api-flow.md
~~~

---

## D-005 — GetSecuritiesData role

Status: Accepted based on observed behavior

Decision:

~~~text
GetSecuritiesData = dynamic/detailed market snapshot source
~~~

Evidence:

~~~text
docs/leumi-api/endpoints/get-securities-data.md
docs/leumi-api/overview/api-flow.md
~~~

---

## D-006 — Join key

Status: Verified

Decision:

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

Evidence:

~~~text
561/561 matched
100%
~~~

Never join by array index.

---

## D-007 — Do not hardcode 561

Status: Accepted

Decision: read recordCount dynamically.

Why: 561 is a snapshot value, not an API contract.

---

## D-008 — Conservative GetSecuritiesData batching

Status: Accepted for current research flow

Decision:

~~~text
use batches around 187 IDs
~~~

Known evidence:

~~~text
187 → HTTP 200
200 → HTTP 200
250 → HTTP 200
400 → HTTP 403
561 → HTTP 403
~~~

Unknown: exact reason/threshold for 403.

---

## D-009 — Sequential batching is the proven baseline

Status: Accepted until measured otherwise

Decision: run chunks sequentially.

Why: sequential flow is verified; parallel stability has not been measured.

---

## D-010 — null != 0

Status: Accepted / required

Decision: preserve null, empty string and 0 as distinct states.

Never coerce market data using a generic falsy fallback.

---

## D-011 — Level 1 is nullable

Status: Verified

Evidence:

~~~text
BuyLimit1 96.79%
SellLimit1 98.04%
~~~

Decision: BID1/ASK1 price and volume fields must be nullable in future models.

---

## D-012 — Do not use order-book levels 2–5 from GetSecuritiesData

Status: Verified for tested Equity snapshot

Evidence:

~~~text
all level 2–5 price/volume/change fields:
null = 561/561
coverage = 0%
~~~

Decision: do not build features on those fields until another source/condition is verified.

---

## D-013 — Dynamic values from both endpoints are not atomic

Status: Verified

Decision: do not assert equivalent dynamic market fields in MapHeat2 and GetSecuritiesData are always equal.

Why: the two calls occur at different times.

---

## D-014 — Prefer GetSecuritiesData for live/dynamic values

Status: Accepted recommendation

Decision: for repeatedly refreshed market state, prefer GetSecuritiesData; use MapHeat2 primarily for universe/name/metadata.

---

## D-015 — Preserve raw payloads when production collection is designed

Status: Accepted design requirement

Suggested conceptual layers:

~~~text
RawMapHeatRecord
RawSecurityDataRecord
NormalizedSecuritySnapshot
~~~

This is a data-model requirement, not a language/framework decision.

---

## D-016 — No final technology stack yet

Status: Open / intentionally undecided

Decision: do not assume Node, C#, database or frontend stack.

Browser JavaScript research scripts are evidence tools only.

Revisit when the first production component is ready to be designed.

---

## D-017 — Separate research, production code and production tests

Status: Accepted

Decision:

~~~text
Research/browser probes:
scripts/research/<domain>/<provider>/

Production code:
src/

Production automated tests:
tests/
~~~

For Leumi market-data research:

~~~text
scripts/research/market-data/leumi/
├── capture/
├── collection/
├── demos/
└── tests/
~~~

Documentation is organized separately under:

~~~text
docs/
~~~

Why:

- research scripts have a different lifecycle from production code.
- manual API research tests are not the same thing as automated product tests.
- domain-first organization prevents one provider folder from becoming a mixed collection of market-data, execution and unrelated scripts.
- local README files make the repository navigable for new AI agents.

Details:

~~~text
docs/project/repository-structure.md
~~~

---

## D-018 — Documentation follows code ownership

Status: Accepted

Decision:

~~~text
Documentation that explains one concrete script/component
→ lives next to that code.

Run instructions, configuration, test procedure and raw reports
→ live next to the script/test suite.

Cross-cutting or durable domain knowledge
→ lives under docs/.
~~~

Why:

- code and its operational documentation change together.
- moving/renaming code should not leave a detached manual elsewhere.
- raw evidence belongs to the test that generated it.
- docs should remain a knowledge base rather than a second copy of code documentation.
