# מדריך עבודה מומלץ עם Leumi Market APIs

מסמך זה מרכז את ההמלצות הטכניות הנוכחיות לעבודה עם ה-API כפי שנצפה ונבדק בפועל.

> חשוב: זהו API פנימי של אתר לאומי ולא API ציבורי מתועד. לכן כל מסקנה חייבת להישען על תצפית ובדיקה בפועל. אין להניח יציבות חוזית כמו ב-API ציבורי.

---

## 1. המודל הנכון: שתי קריאות עם שני תפקידים שונים

המערכת שנצפתה בנויה משני מקורות משלימים.

### MapHeat2 — Universe / Discovery / Metadata

תפקידו:

- לקבוע אילו ניירות נמצאים בקבוצה.
- לקבל את מספר הניירים הכולל.
- לקבל `PaperId`.
- לקבל `PaperName`.
- לקבל סדר, paging ו-filtering.
- לקבל snapshot כללי של נתונים מסוימים.

### GetSecuritiesData — Live / Detailed market state

תפקידו:

- לקבל רשימת IDs שכבר ידועה.
- להחזיר snapshot מפורט יותר של מצב השוק.
- להחזיר שער אחרון, BID/ASK, כמויות, נתונים יומיים וזמנים.

### מפתח החיבור

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

אין להסתמך על מיקום הרשומה במערך. תמיד יש לבצע join לפי המזהה.

---

## 2. Recommendation: MapHeat2 אינו מנוע polling ראשי

### Verified

בהקלטת הרשת נצפה ש-`GetSecuritiesData` נקרא שוב ושוב, בעוד `MapHeat2` הופיע סביב יצירת/שינוי רשימת התוצאות ומעברי עמודים.

### Recommendation

המודל המומלץ כרגע:

~~~text
1. MapHeat2
   ↓
   קבלת universe + metadata + IDs

2. GetSecuritiesData
   ↓
   polling של מצב השוק עבור אותם IDs
~~~

אין סיבה מוכחת לקרוא ל-`MapHeat2` בכל tick של הסורק.

כן צריך לרענן אותו כאשר יש סיבה לחשוד שה-universe השתנה, למשל:

- reload של האפליקציה.
- שינוי filters.
- שינוי סוג שוק/רשימה.
- שינוי במספר הניירות.
- מנגנון refresh תקופתי שנחליט עליו בעתיד לאחר מדידה.

---

## 3. אל תקבע 561 בקוד

### Verified בזמן הבדיקה

~~~text
recordCount = 561
~~~

אבל זה snapshot של זמן מסוים.

### Recommendation

תמיד:

~~~text
read recordCount
→ fetch full MapHeat2 using the current count
→ build IDs dynamically
~~~

אין לכתוב production logic שמניח שתמיד יהיו בדיוק 561 ניירות.

---

## 4. חלוקת GetSecuritiesData

### Verified

הבדיקות נתנו:

~~~text
100 IDs → 200 OK
187 IDs → 200 OK
200 IDs → 200 OK
250 IDs → 200 OK
400 IDs → 403
561 IDs → 403
~~~

והמסלול הבא נבדק במלואו:

~~~text
187 + 187 + 187
→ 561 requested
→ 561 received
→ 561 unique
→ 0 duplicates
→ 0 missing
~~~

### Recommendation

כרגע להשתמש בחלוקה שמרנית של כ-187 IDs לקריאה.

לא לנסות "לנצח" את מגבלת ה-403.

לא הוכח אם המגבלה נובעת מ:

- מספר IDs.
- אורך URL.
- WAF/security rule.
- מגבלת backend.
- שילוב של כמה גורמים.

הפתרון הנכון הוא batching, לא bypass.

---

## 5. Sequential לפני Parallel

### Verified

ה-flow של שלוש קריאות ברצף נבדק ועבד.

### Unknown

טרם נבדק בצורה מסודרת אם שלוש קריאות מקביליות הן יציבות ורצויות.

### Recommendation

עד שתהיה בדיקה אחרת, לשמור על:

~~~text
chunk 1
→ await
chunk 2
→ await
chunk 3
→ await
~~~

זה מעט איטי יותר אך כרגע הוא הנתיב המוכח.

---

## 6. Source of truth לכל סוג מידע

אין כרגע סיבה לבחור endpoint יחיד לכל השדות.

### Recommendation

שמור raw data משני המקורות בנפרד:

~~~text
RawMapHeatRecord
RawSecurityDataRecord
~~~

ובנה שכבה מנורמלת:

~~~text
NormalizedSecuritySnapshot
~~~

שמאחדת אותם לפי ID.

הסיבה:

- יש שדות שקיימים רק ב-`MapHeat2`.
- יש שדות שקיימים רק ב-`GetSecuritiesData`.
- יש שדות שנראים מקבילים בשניהם.
- ייתכנו הפרשי זמן בין snapshots.
- API פנימי עשוי להשתנות.

לא כדאי לאבד את ה-payload המקורי בזמן normalization.

---

## 7. שדות מקבילים שחייבים למדוד

נמצאו זוגות שנראים מקבילים:

| MapHeat2 | GetSecuritiesData | משמעות |
|---|---|---|
| PaperId | Key | מזהה נייר |
| PaperRate | LastKnownRate | שער אחרון |
| ChangeRate | BaseRateChangePercentage | שינוי יומי |
| BuyRate | BuyLimit1 | BID1 |
| SellRate | SellLimit1 | ASK1 |
| DailyVolume | DailyTurnover | כמות יומית |
| DailyTmura | DailyNISRevenue | מחזור כספי |
| DailyNumDeals | DailyDealsQuantity | מספר עסקאות |
| LastDealTime | LastDealTimeOnly | שעת עסקה אחרונה |

אין להניח שהם תמיד זהים.

הסקריפט `analyze-field-coverage.js` מודד:

- כמה פעמים שני הצדדים קיימים.
- כמה פעמים הם זהים.
- כמה פעמים הם שונים.
- דוגמאות להבדלים.

הבדלים יכולים לנבוע גם מהפרש זמן קטן בין שתי הקריאות, ולא בהכרח ממשמעות שדה שונה.

---

## 8. NULL אינו שווה ל-0

זה כלל חשוב למודל הנתונים.

~~~text
null
~~~

משמעותו: אין לנו ערך זמין בתגובה הזו.

~~~text
0
~~~

יכול להיות ערך פיננסי אמיתי ולגיטימי.

לכן אסור לעשות:

~~~js
value || 0
~~~

עבור שדות שוק.

יש לשמור `null` כ-`null` ולתת ללוגיקה העסקית להחליט מה לעשות.

---

## 9. שדות חלקיים

שדה יכול להיות:

- קיים לכל הניירות.
- קיים רק לחלק מהניירות.
- קיים במבנה אבל תמיד null בסנאפשוט מסוים.
- חסר לחלוטין בחלק מהרשומות.

לכן המודל העתידי חייב לתמוך ב-nullable fields.

אין לבנות scanner rule על שדה לפני שיודעים את availability שלו בפועל.

---

## 10. בדיקת Field Coverage

הסקריפט:

~~~text
scripts/research/leumi/analyze-field-coverage.js
~~~

רץ על snapshot מלא שכבר נאסף ומחשב לכל field:

- total records
- present
- missing
- null
- undefined
- empty string
- usable values
- coverage %
- zero count
- distinct count
- type distribution
- numeric min/max
- sample values

בנוסף הוא משווה שדות שנראים מקבילים בין שני ה-endpoints.

התוצאה נשמרת גם ב:

~~~js
window.__marketFlowFieldCoverageReport
~~~

וניתן להוריד אותה כ-JSON או Markdown.

---

## 11. Snapshot אינו חוזה

בדיקת coverage אחת בזמן מסחר פעיל אינה מוכיחה ששדה יהיה זמין תמיד.

יש להבחין בין:

### Snapshot coverage

מה קרה ברגע המדידה.

### Contract confidence

כמה פעמים מדדנו את אותו field בזמנים/מצבים שונים.

בעתיד כדאי להריץ את אותה בדיקה:

- בזמן מסחר רציף.
- סמוך לפתיחה.
- סמוך לנעילה.
- לאחר המסחר.
- ביום אחר.
- על סוגי ניירות שונים.

עד שזה יקרה, תוצאות coverage הן Verified עבור snapshot שנמדד בלבד.

---

## 12. Timestamps ו-stale data

יש כמה שדות זמן:

- `LastDealTime`
- `LastKnownRateDate`
- `trade_time`
- `LastDealTimeOnly`
- `DateChange`
- `AsOfDate`

Recommendation:

אל תניח שכל refresh כולל עסקה חדשה.

שמור גם:

~~~text
collectedAt
~~~

שהוא זמן האיסוף המקומי שלנו.

כך בעתיד נוכל להבדיל בין:

- זמן שבו אנחנו דגמנו.
- זמן שבו השרת עדכן snapshot.
- זמן העסקה האחרונה בנייר.

---

## 13. Validation חובה בכל מחזור איסוף

לכל full snapshot מומלץ לבדוק:

~~~text
requested IDs
received records
unique Keys
duplicates
missing IDs
unknown/new fields
schema/type changes
~~~

אם חסר נייר, לא כדאי להמשיך כאילו קיבלנו snapshot מלא.

יש לסמן את ה-snapshot כ-partial או להיכשל בהתאם לצורך.

---

## 14. Schema drift

זה API פנימי ולכן schema יכול להשתנות ללא הודעה.

Recommendation:

בעתיד ה-collector צריך לזהות:

- field חדש.
- field שנעלם.
- type שהשתנה.
- array/object structure שהשתנה.
- nullable field שהפך לערך או להפך.

לא להתעלם משינוי כזה בשקט.

---

## 15. Polling frequency

### Unknown

עדיין לא תועדה אצלנו תדירות polling מדויקת ומוכחת לכל המצבים.

### Recommendation

לא לקבוע קצב אגרסיבי שרירותי.

השלב הנכון הוא למדוד את cadence של האתר עצמו, ואז להתחיל בקצב דומה או שמרני יותר.

אין צורך לייצר עומס גבוה יותר מהאתר המקורי רק כדי לקבל "יותר realtime".

---

## 16. Authentication / Browser context

הקריאות הנוכחיות עובדות מתוך session קיים של האתר ובאותו origin.

Recommendation:

- לא לשמור cookies בקוד.
- לא להעתיק session tokens ל-Git.
- לא להכניס Authorization/session data ל-samples.
- research scripts צריכים להשתמש ב-session הקיים בדפדפן בלבד.

אם בעתיד נעביר collector לשרת מקומי, authentication יהיה נושא נפרד שדורש מחקר ותכנון.

---

## 17. Error policy

HTTP לא תקין, response structure שונה או count mismatch אינם "warning קטן".

יש לתעד לפחות:

~~~text
endpoint
chunk
HTTP status
expected count
actual count
error message
timestamp
~~~

אין להחזיר snapshot מלא כאשר בפועל אחד משלושת ה-chunks נכשל.

---

## 18. ההמלצה הנוכחית ל-flow

~~~text
START

MapHeat2
→ read current recordCount
→ fetch full universe
→ validate unique PaperId
→ retain metadata

split PaperIds into conservative chunks

for each chunk sequentially:
    GetSecuritiesData
    → validate HTTP 200
    → validate response structure
    → validate expected count

combine details
→ validate unique Key
→ detect missing IDs
→ join by PaperId == Key

produce normalized snapshot
+ retain raw source records
+ collectedAt

END
~~~

זהו flow מומלץ על סמך מה שהוכח עד עכשיו, לא על סמך ניחוש של API ציבורי.

---

## 19. מה עדיין Unknown

נכון לעכשיו לא הוכחו:

- סיבת ה-403 המדויקת בבקשות הגדולות.
- מגבלת IDs/URL המדויקת.
- האם parallel batching יציב ורצוי.
- cadence המדויק שהאתר משתמש בו בכל מצב.
- semantics רשמי של כל field פנימי.
- availability של כל field על כל 561 הניירות.
- availability של fields בזמני מסחר שונים.
- האם levels 2–5 של ספר הפקודות מתמלאים דרך endpoint זה בתנאים מסוימים.
- חוזה יציבות כלשהו של ה-API.

לכל אחד מהנושאים האלה צריך להוסיף Verified evidence לפני בניית תלות חזקה עליו.
