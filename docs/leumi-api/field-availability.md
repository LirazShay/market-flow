# Field Availability / NULL Coverage

## מטרה

לפני שבונים scanner, persistence או execution logic על field כלשהו, צריך לדעת אם הוא באמת זמין ובאיזו תדירות.

לא מספיק לראות field בדוגמת JSON אחת.

---

## כלי הבדיקה

~~~text
scripts/research/leumi/analyze-field-coverage.js
~~~

הסקריפט משתמש ב-snapshot שנוצר על ידי:

~~~text
scripts/research/leumi/show-all-securities-table.js
~~~

ולכן סדר ההרצה הוא:

~~~text
1. run show-all-securities-table.js
2. verify that all securities were loaded
3. in the same Leumi tab run analyze-field-coverage.js
~~~

---

## מה נמדד

לכל field, בנפרד עבור:

- MapHeat2
- GetSecuritiesData

נמדדים:

| Metric | משמעות |
|---|---|
| totalRecords | מספר הרשומות שנבדקו |
| presentCount | בכמה objects המפתח קיים |
| missingCount | בכמה objects המפתח לא קיים בכלל |
| nullCount | בכמה רשומות הערך הוא null |
| undefinedCount | בכמה רשומות הערך undefined |
| emptyStringCount | בכמה רשומות יש מחרוזת ריקה |
| usableCount | מספר הרשומות עם ערך שאינו missing/null/undefined/empty |
| coveragePercent | usableCount / totalRecords |
| zeroCount | כמה ערכים הם בדיוק 0 |
| distinctCount | כמה ערכים שונים הופיעו |
| types | התפלגות types |
| min/max | עבור numeric values |
| samples | עד 5 דוגמאות לערכים |

---

## Classification

### ALWAYS_VALUE

~~~text
coverage = 100%
~~~

ב-snapshot הנוכחי היה ערך שימושי בכל הרשומות.

### PARTIAL_VALUE

יש ערך רק בחלק מהניירות.

שדה כזה דורש nullable handling ואסור להניח שהוא תמיד זמין.

### NO_USABLE_VALUE

לא הופיע ערך שימושי באף רשומה בסנאפשוט.

שדה כזה **לא צריך לשמש כרגע כתלות בסורק**, עד שנוכיח שהוא מתמלא במצב אחר.

---

## חשוב: NULL מול 0

`null` ו-`0` נמדדים בנפרד.

לעולם אין להסיק ש-null הוא zero.

לדוגמה:

~~~text
BuyVolume1 = 0
~~~

ו:

~~~text
BuyVolume1 = null
~~~

הם שני מצבים שונים לחלוטין מבחינת איכות הנתונים.

---

## השוואת שתי הקריאות

הבדיקה משווה גם זוגות fields שנראים מקבילים:

- PaperId ↔ Key
- PaperRate ↔ LastKnownRate
- ChangeRate ↔ BaseRateChangePercentage
- BuyRate ↔ BuyLimit1
- SellRate ↔ SellLimit1
- DailyVolume ↔ DailyTurnover
- DailyTmura ↔ DailyNISRevenue
- DailyNumDeals ↔ DailyDealsQuantity
- LastDealTime ↔ LastDealTimeOnly

לכל זוג נמדד:

- comparableCount
- equalCount
- differentCount
- equalPercent
- missing on either side
- samples of differences

זה יעזור לנו להחליט בעתיד איזה endpoint הוא ה-source המועדף לכל field.

---

## מגבלה מתודולוגית

הדוח הוא **point-in-time snapshot**.

אם field הוא 100% non-null היום ב-14:45, זה לא חוזה שהוא 100%:

- בפתיחה.
- בנעילה.
- אחרי המסחר.
- ביום אחר.
- בנייר מסוג אחר.

לכן תוצאות שמתווספות למסמך הזה חייבות לכלול:

~~~text
date
local time
market phase if known
record counts
script version/commit
~~~

---

## תוצאות בפועל

**Pending run.**

אין להכניס לטבלה זו מספרים שלא הופקו מהסקריפט בזמן אמת.

לאחר הרצה יש לשמור כאן:

1. summary מלא.
2. fields עם 0% coverage.
3. fields עם partial coverage.
4. fields עם 100% coverage.
5. type inconsistencies.
6. cross-endpoint differences.
7. קישור/commit ל-raw Markdown report אם נשמר בפרויקט.

---

## כלל לשימוש עתידי

לפני הוספת field ל-domain model כ-required:

~~~text
Field must have measured evidence that supports required semantics.
~~~

אם אין evidence כזה, ברירת המחדל היא nullable.
