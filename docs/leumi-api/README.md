# Leumi API Research

תיעוד של ההתנהגות שנצפתה בפועל בדף המניות של לאומי טרייד.

## מסמכים

- [api-flow.md](api-flow.md) — איך שתי הקריאות משתלבות.
- [api-usage-guide.md](api-usage-guide.md) — מדריך עבודה מלא: flow מומלץ, batching, source-of-truth, validation, NULL handling, schema drift והמלצות implementation.
- [mapheat2.md](mapheat2.md) — תיעוד `MapHeat2`.
- [get-securities-data.md](get-securities-data.md) — תיעוד `GetSecuritiesData`, batching ו-coverage שנמדד בפועל.
- [field-reference-he.md](field-reference-he.md) — מילון שדות בעברית + availability שנמדדה.
- [field-availability.md](field-availability.md) — ניתוח מפורט של NULL/empty/zero/coverage והמלצות שימוש.
- [verified-tests.md](verified-tests.md) — תוצאות בדיקות שבוצעו בפועל.
- [reports/](reports/) — raw reports שנשמרים מכל snapshot בדיקה.
- [samples/](samples/) — דוגמאות JSON מצומצמות מהתגובות שנצפו.

## Report מאומת נוכחי

- [2026-09-22 14:51 — 561-security field coverage](reports/2026-09-22-1451-field-coverage.md)

ב-report הזה נבדקו 561 רשומות מ-`MapHeat2` ו-561 רשומות מ-`GetSecuritiesData`.

הוא משמש evidence ל:

- availability של כל field.
- null / empty / zero counts.
- Book Level 1 availability.
- העובדה ש-Book Levels 2–5 היו null ב-561/561.
- cross-endpoint comparison.
- join key `PaperId == Key` ב-561/561.

## קוד מחקר

- `scripts/research/leumi/api-recorder.js` — מקליט Fetch/XHR.
- `scripts/research/leumi/fetch-all-securities.js` — קורא את כל הניירות ומאמת שלמות.
- `scripts/research/leumi/show-all-securities-table.js` — proof-of-concept מלא: שתי הקריאות, join והצגה בטבלה.
- `scripts/research/leumi/analyze-field-coverage.js` — מודד availability/NULL/type/sample עבור כל field ומשווה fields מקבילים בין שתי הקריאות.

## עקרון evidence

התיעוד מתאר תעבורת HTTP שנצפתה בפועל.

כל קביעה חייבת להיות אחת מ:

~~~text
Verified
Inferred
Unknown
~~~

לפי `AGENTS.md`.

אין להפוך snapshot חד-פעמי ל-contract רשמי של API פנימי.

## גבול הידע הנוכחי

לא בוצעה כרגע הנדסה לאחור של קוד ה-Angular לצורך אימות פונקציית המיזוג הפנימית של האתר.

בנוסף, עדיין לא הוכחו:

- cadence מדויק של polling בכל מצב.
- הסיבה המדויקת ל-HTTP 403 בבקשות גדולות.
- availability בשעות/ימי מסחר שונים.
- מקור order-book depth 2–5.
- חוזה יציבות עתידי של ה-API.
