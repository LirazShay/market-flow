# Leumi API Research

תיעוד של ההתנהגות שנצפתה בפועל בדף המניות של לאומי טרייד.

## מסמכים

- [api-flow.md](api-flow.md) — איך שתי הקריאות משתלבות.
- [api-usage-guide.md](api-usage-guide.md) — מדריך עבודה מלא: flow מומלץ, batching, validation, NULL handling, schema drift והמלצות implementation.
- [mapheat2.md](mapheat2.md) — תיעוד `MapHeat2`.
- [get-securities-data.md](get-securities-data.md) — תיעוד `GetSecuritiesData`.
- [field-reference-he.md](field-reference-he.md) — מילון שדות בעברית.
- [field-availability.md](field-availability.md) — מתודולוגיית בדיקת זמינות/NULL לכל field ותוצאות המדידה לאחר הרצה.
- [verified-tests.md](verified-tests.md) — תוצאות בדיקות שבוצעו בפועל.
- [samples/](samples/) — דוגמאות JSON מצומצמות מהתגובות שנצפו.

## קוד מחקר

- `scripts/research/leumi/api-recorder.js` — מקליט Fetch/XHR.
- `scripts/research/leumi/fetch-all-securities.js` — קורא את כל הניירות ומאמת שלמות.
- `scripts/research/leumi/show-all-securities-table.js` — proof-of-concept מלא: שתי הקריאות, join והצגה בטבלה.
- `scripts/research/leumi/analyze-field-coverage.js` — מודד availability/NULL/type/sample עבור כל field ומשווה fields מקבילים בין שתי הקריאות.

## גבול הידע הנוכחי

התיעוד מתאר תעבורת HTTP שנצפתה בפועל. לא בוצעה כרגע הנדסה לאחור של קוד ה-Angular לצורך אימות פונקציית המיזוג הפנימית של האתר.

מידע שלא נמדד בפועל חייב להיות מסומן כ-`Inferred` או `Unknown`, בהתאם ל-`AGENTS.md`.
