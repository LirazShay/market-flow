# Leumi API Research

תיעוד של ההתנהגות שנצפתה בפועל בדף המניות של לאומי טרייד.

## מסמכים

- [api-flow.md](api-flow.md) — איך שתי הקריאות משתלבות.
- [mapheat2.md](mapheat2.md) — תיעוד `MapHeat2`.
- [get-securities-data.md](get-securities-data.md) — תיעוד `GetSecuritiesData`.
- [field-reference-he.md](field-reference-he.md) — מילון שדות בעברית.
- [verified-tests.md](verified-tests.md) — תוצאות בדיקות שבוצעו בפועל.
- [samples/](samples/) — דוגמאות JSON מצומצמות מהתגובות שנצפו.

## קוד מחקר

- `scripts/research/leumi/api-recorder.js` — מקליט Fetch/XHR.
- `scripts/research/leumi/fetch-all-securities.js` — קורא את כל 561 הניירות ומאמת שלמות.

## גבול הידע הנוכחי

התיעוד מתאר תעבורת HTTP שנצפתה בפועל. לא בוצעה כרגע הנדסה לאחור של קוד ה-Angular לצורך אימות פונקציית המיזוג הפנימית של האתר.
