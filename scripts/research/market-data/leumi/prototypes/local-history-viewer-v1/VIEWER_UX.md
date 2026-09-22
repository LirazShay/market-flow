# Viewer UX Plan — Local History Viewer V1

Status:

~~~text
Stage 3 complete — UX planned, no implementation yet
~~~

מטרת ה-viewer היא לתת מסך אחד פשוט ומהיר שמאפשר:

1. לראות את מצב השוק האחרון שנשמר.
2. למיין את כל הניירות לפי עמודה.
3. להיכנס לנייר מסוים.
4. לראות את ההיסטוריה שנשמרה עבורו.
5. להבין מיד אם ה-recorder חי ואם הנתונים טריים.

V1 נשאר בכוונה פשוט: ללא filtering, ללא charts וללא column customization.

---

# 1. Language and direction

~~~text
Language: Hebrew
Direction: RTL
Numbers: LTR inside numeric cells where appropriate
~~~

שמות fields פנימיים לא יוצגו כברירת מחדל למשתמש.

---

# 2. Main layout

~~~text
┌───────────────────────────────────────────────────────────┐
│ Status / Recorder / Storage                              │
├───────────────────────────────────────────────────────────┤
│ Current Market Table                                    │
│                                                         │
│ sticky header                                            │
│ sortable columns                                         │
│ latest rows                                              │
│                                                         │
├───────────────────────────────────────────────────────────┤
│ Footer / row count / last refresh                       │
└───────────────────────────────────────────────────────────┘
~~~

כאשר נכנסים לנייר:

~~~text
Main table
   ↓ click row
Security Detail View
   ├── Back
   ├── security summary
   └── history table
~~~

אין tab חדש לכל נייר.

---

# 3. Status header

מצבי recorder:

~~~text
רץ
לא מעודכן
נעצר
שגיאה
לא ידוע
~~~

ברירת מחדל מוצעת ל-stale:

~~~text
15 seconds without a fresh heartbeat
~~~

זהו UX threshold מקומי ולא כלל של ה-API.

---

# 4. Header metrics

יוצגו לפחות:

| Label | Source |
|---|---|
| מצב recorder | meta recorderState |
| עדכון אחרון | lastCompletedAtMs |
| cycle אחרון | lastCompletedCycleId |
| משך cycle | latest cycle durationMs |
| מספר ניירות | latest count |
| cycles מוצלחים | completedCycles |
| cycles שנכשלו | failedCycles |
| גודל history | DB count/estimate |
| אחסון | navigator.storage.estimate() |

Storage estimate לא חייב להתעדכן בכל cycle.

---

# 5. Main current table

Source:

~~~text
IndexedDB.latest
+
IndexedDB.universe joined by securityId
~~~

הטבלה הראשית אינה סורקת history.

---

# 6. Main table columns — V1

| Order | כותרת | Field/source | Type |
|---:|---|---|---|
| 1 | שם נייר | universe.paperName | string |
| 2 | מספר נייר | securityId | string |
| 3 | שער אחרון | data.LastKnownRate | number |
| 4 | שינוי יומי % | data.BaseRateChangePercentage | number |
| 5 | BID1 | data.BuyLimit1 | nullable number |
| 6 | כמות BID1 | data.BuyVolume1 | nullable number |
| 7 | ASK1 | data.SellLimit1 | nullable number |
| 8 | כמות ASK1 | data.SellVolume1 | nullable number |
| 9 | מס' עסקאות | data.DailyDealsQuantity | number |
| 10 | כמות עסקה אחרונה | data.LastDealVolume | nullable number |
| 11 | כמות יומית | data.DailyTurnover | number |
| 12 | מחזור כספי | data.DailyNISRevenue | number |
| 13 | נמוך יומי | data.DailyLowestRate | number |
| 14 | גבוה יומי | data.DailyHighestRate | number |
| 15 | עסקה אחרונה | data.LastDealTimeOnly | nullable/empty string |
| 16 | נאסף בשעה | collectedAtMs | timestamp |

Fields עם 0% availability לא נכנסים לטבלה הראשית.

---

# 7. Data preserved but not shown by default

~~~text
MarketValue
ESG
ReturnStartYear
ReturnStartMonths
DailyAverageVolume
Logo
raw MapHeat fields
all raw Security fields
~~~

אין column chooser ב-V1.

---

# 8. Default sort

~~~text
Primary:
DailyDealsQuantity DESC

Tie-breaker:
paperName ASC
~~~

זהו UX default בלבד ולא המלצת מסחר.

---

# 9. Sorting behavior

V1 תומך ב-single-column sort.

Numeric/time fields:

~~~text
first click  → descending
second click → ascending
then toggle
~~~

String fields:

~~~text
first click  → ascending
second click → descending
then toggle
~~~

Indicator:

~~~text
▲ ascending
▼ descending
~~~

אם values שווים, paperName ASC משמש tie-breaker סופי.

---

# 10. Null / empty / zero display

~~~text
null / undefined → —
empty string      → —
zero              → 0
~~~

פנימית הערכים נשארים שונים.

אסור להפוך zero ל-dash.

---

# 11. Number formatting

- thousands separators: yes.
- percentages: suffix של %.
- prices: נשמרים ומוצגים ביחידות שה-API מחזיר.
- volume/count: separators.
- אין conversion אוטומטי לשקלים/אגורות בלי evidence.

---

# 12. Daily change display

BaseRateChangePercentage:

~~~text
positive → positive visual class
negative → negative visual class
zero     → neutral
~~~

המספר עצמו תמיד מוצג; צבע הוא רק עזר ויזואלי.

---

# 13. Freshness display

עמודת "נאסף בשעה":

~~~text
HH:mm:ss
~~~

Tooltip יכול להציג timestamp מלא.

ב-header:

~~~text
עודכן לפני X שניות
~~~

מחושב מ-lastCompletedAtMs.

---

# 14. Row interaction

כל row ניתן לפתיחה.

Click:

~~~text
open Security Detail View
~~~

ה-viewer צריך לשמר:

~~~text
current sort column
current sort direction
main-table scroll position
~~~

בעת חזרה מה-detail נשאף להחזיר את המשתמש לאותו מקום.

---

# 15. Security Detail View

Header:

~~~text
← חזרה לטבלה

שם נייר
מספר נייר
שער אחרון
שינוי יומי
BID1 / ASK1
עסקה אחרונה
~~~

מתחת:

~~~text
History Table
~~~

V1 ללא chart.

---

# 16. History table columns

| Order | כותרת | Field |
|---:|---|---|
| 1 | זמן איסוף | collectedAtMs |
| 2 | Cycle | cycleId |
| 3 | Chunk | chunkIndex |
| 4 | שער אחרון | data.LastKnownRate |
| 5 | שינוי יומי % | data.BaseRateChangePercentage |
| 6 | BID1 | data.BuyLimit1 |
| 7 | כמות BID1 | data.BuyVolume1 |
| 8 | ASK1 | data.SellLimit1 |
| 9 | כמות ASK1 | data.SellVolume1 |
| 10 | מס' עסקאות | data.DailyDealsQuantity |
| 11 | כמות עסקה אחרונה | data.LastDealVolume |
| 12 | כמות יומית | data.DailyTurnover |
| 13 | מחזור כספי | data.DailyNISRevenue |
| 14 | עסקה אחרונה | data.LastDealTimeOnly |
| 15 | זמן שרת | serverAsOfDate |

ברירת המחדל:

~~~text
newest first
~~~

---

# 17. History loading strategy

לא נטען history בלתי מוגבלת ל-DOM בבת אחת.

V1:

~~~text
initial page: 500 rows
~~~

כפתור:

~~~text
טען ישנים יותר
~~~

כל לחיצה טוענת batch נוסף דרך index bySecurityTime.

אין infinite scroll ב-V1.

---

# 18. Live behavior

## Main view

כאשר מתקבל CYCLE_COMMITTED:

~~~text
reload latest
→ preserve sort
→ rerender
~~~

## Detail view

כאשר אותו security מקבל נתון חדש:

- נשארים באותו detail view.
- מוסיפים/מרעננים את הרשומה החדשה בראש.
- לא מחזירים את המשתמש אוטומטית למסך הראשי.

---

# 19. BroadcastChannel behavior

BroadcastChannel הוא notification בלבד.

Messages:

~~~text
CYCLE_COMMITTED
RECORDER_STARTED
RECORDER_STOPPED
RECORDER_ERROR
DATABASE_CLEARED
~~~

כל message גורם ל-viewer לקרוא state מתאים מה-IndexedDB.

אם viewer נפתח לאחר שה-recorder כבר רץ, הוא נטען מה-DB ואינו תלוי ב-message היסטורי.

---

# 20. Viewer startup states

## DB exists + recorder running

~~~text
show current table
status = Running
~~~

## DB exists + recorder stopped

~~~text
show last data
status = Stopped
~~~

## DB exists + stale heartbeat

~~~text
show last data
status = Stale
~~~

## Empty DB

~~~text
עדיין אין נתוני Market Flow.
הפעל את ה-recorder בטאב של לאומי.
~~~

## DB open error

~~~text
לא ניתן לפתוח את IndexedDB
~~~

Technical details נשארים ב-console.

---

# 21. Loading states

~~~text
פותח מסד נתונים...
טוען נתונים אחרונים...
טוען היסטוריה...
~~~

לא מציגים table ריקה כאילו query הסתיים בהצלחה.

---

# 22. Empty states

~~~text
אין עדיין snapshot מלא.
לא נמצאה היסטוריה לנייר הזה.
~~~

BID/ASK חסר:

~~~text
—
~~~

זה אינו error.

---

# 23. Error surface

Header יכול להציג banner עבור:

- recorder error.
- DB read failure.
- refresh failure.

ה-banner כולל הודעה ידידותית בעברית ו-timestamp.

Technical details ב-console.

אין alert חוסם עבור background errors.

---

# 24. Clear database action

V1 יכלול action מפורש:

~~~text
נקה את נתוני Market Flow מהמכשיר הזה
~~~

מיקום:

~~~text
Diagnostics / Storage
~~~

הפעולה דורשת confirmation.

אין auto-clear.

---

# 25. Manual refresh

כפתור:

~~~text
רענן תצוגה
~~~

הוא:

- לא מפעיל API.
- לא משפיע על recorder.
- קורא מחדש את IndexedDB.

---

# 26. No filtering in V1

אין:

~~~text
search
numeric filters
multi-column filters
saved presets
~~~

V1 בודק קודם:

~~~text
API
→ persistence
→ current table
→ live update
→ sorting
→ history
~~~

Filtering נשאר ל-V2.

---

# 27. Responsive target

Target:

~~~text
Desktop browser
~~~

נדרש:

- horizontal table scroll.
- sticky header.
- status area that can wrap.
- usable detail view on normal desktop widths.

Mobile אינו target של V1.

---

# 28. Accessibility baseline

- buttons אמיתיים.
- visible keyboard focus.
- sortable headers נגישים גם במקלדת.
- text indicator בנוסף לצבע.
- row detail action נגיש גם בלי hover.

---

# 29. UX state model

Viewer state:

~~~text
BOOTING
EMPTY
MAIN
DETAIL
ERROR
~~~

Recorder health:

~~~text
UNKNOWN
RUNNING
STALE
STOPPED
ERROR
~~~

אלה שני state machines נפרדים.

---

# 30. Final V1 UX decisions

~~~text
Language:
Hebrew / RTL

Main view:
latest table

Default sort:
DailyDealsQuantity DESC
paperName ASC tie-breaker

Sorting:
single-column

Filtering:
none in V1

Row click:
detail view in same viewer tab

History:
newest first
500 rows initially
explicit "load older"

Null:
—

Zero:
0

Live updates:
BroadcastChannel notification
IndexedDB remains source of truth

Manual refresh:
DB-only

Recorder diagnostics:
always visible

DB clear:
diagnostics section + confirmation

Target:
desktop browser
~~~
