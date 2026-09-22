# Leumi Market Data Research Tests

בדיקות מחקריות של API behavior.

אלה אינן unit/integration tests של production code.

## Suites

- [field-coverage/](field-coverage/) — schema/availability/null/type coverage.
- [polling-stability/](polling-stability/) — יציבות polling לאורך זמן.

## Documentation ownership

כל test suite שומר לידו:

~~~text
README.md
test script(s)
reports/      כאשר יש raw run evidence
fixtures/     אם יהיה צורך בעתיד
~~~

תוצאות שהן ידע כללי על ה-API יכולות להיכנס גם ל-`docs/leumi-api/`, אבל אין לשכפל שם את הוראות ההרצה או את raw reports.
