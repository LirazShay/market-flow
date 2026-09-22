# Leumi Market Data API Research

כאן נשמר הידע על ה-API עצמו, לא מדריכי הרצה של scripts ספציפיים.

## Start here

1. [Overview](overview/README.md)
2. [Endpoints](endpoints/README.md)
3. [Fields](fields/README.md)

## מבנה

~~~text
docs/leumi-api/
├── README.md
├── overview/
├── endpoints/
├── fields/
└── samples/
~~~

## Code-specific documentation

תיעוד שקשור ישירות ל-script נמצא ליד הקוד:

~~~text
scripts/research/market-data/leumi/
├── capture/
├── collection/
├── demos/
└── tests/
~~~

לדוגמה:

~~~text
tests/field-coverage/
├── README.md
├── analyze-field-coverage.js
└── reports/
~~~

## עקרון

~~~text
How this code works / how to run it / raw output
→ ליד הקוד

What we learned about the API
→ docs/leumi-api/
~~~

## Evidence levels

כל קביעה במסמכי ה-API צריכה להיות מסומנת כ:

~~~text
Verified
Inferred
Unknown
~~~

אין להפוך snapshot חד-פעמי ל-contract רשמי של API פנימי.
