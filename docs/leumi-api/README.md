# Leumi Market Data API Research

תיעוד של ההתנהגות שנצפתה בפועל בדף המניות של לאומי.

## Start here

1. [Overview](overview/README.md)
2. [Endpoints](endpoints/README.md)
3. [Fields](fields/README.md)
4. [Testing](testing/README.md)

## מבנה

~~~text
docs/leumi-api/
├── README.md
├── overview/
│   ├── README.md
│   ├── api-flow.md
│   └── api-usage-guide.md
├── endpoints/
│   ├── README.md
│   ├── mapheat2.md
│   └── get-securities-data.md
├── fields/
│   ├── README.md
│   ├── field-reference-he.md
│   └── field-availability.md
├── testing/
│   ├── README.md
│   ├── verified-tests.md
│   └── polling-stability-test.md
├── reports/
│   ├── README.md
│   └── ...
└── samples/
    ├── README.md
    └── ...
~~~

## Code

Research scripts נמצאים תחת:

`scripts/research/market-data/leumi/`

ומחולקים ל:

- `capture/`
- `collection/`
- `demos/`
- `tests/`

## Report מאומת נוכחי

- [2026-09-22 14:51 — 561-security field coverage](reports/2026-09-22-1451-field-coverage.md)

## עקרון evidence

כל קביעה חייבת להיות מסומנת לפי אחת הרמות:

~~~text
Verified
Inferred
Unknown
~~~

אין להפוך snapshot חד-פעמי ל-contract רשמי של API פנימי.

## גבול הידע הנוכחי

עדיין לא הוכחו בין היתר:

- cadence מדויק של polling בכל מצב.
- הסיבה המדויקת ל-HTTP 403 בבקשות גדולות.
- availability בשעות/ימי מסחר שונים.
- מקור order-book depth 2–5.
- חוזה יציבות עתידי של ה-API.
