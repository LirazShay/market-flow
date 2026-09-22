# Local History Viewer V1

Status:

~~~text
Planning — Stage 2 complete
~~~

מטרת V1 היא לאפשר ניסוי מקומי מלא ב-browser בלבד:

~~~text
Leumi market-data recorder
→ IndexedDB
→ same-origin viewer tab
→ current market table
→ dynamic sorting
→ per-security history
~~~

## V1 scope

- הקלטת כל 561 הניירות בכל full cycle.
- שמירת כל היסטוריית ההקלטה ב-IndexedDB.
- latest state נפרד לכל נייר כדי להציג current table במהירות.
- viewer בטאב נוסף.
- עדכון viewer בזמן אמת.
- מיון עולה/יורד לפי עמודות.
- לחיצה על נייר ופתיחת history table עבורו.
- diagnostics בסיסיים: recorder alive, last cycle, counts, failures, storage estimate.
- ללא filtering ב-V1.

## V1 non-goals

- אין server.
- אין database חיצוני.
- אין production architecture.
- אין execution/trading.
- אין charts מתקדמים.
- אין filtering מורכב.
- אין derived momentum metrics חדשים בשלב הראשון.
- אין ניסיון לקבל snapshot מלא כל שנייה אם ה-flow המוכח כרגע לוקח בערך 5 שניות.

## Important browser constraint

IndexedDB, BroadcastChannel ו-storage הם origin-scoped.

לכן recorder וה-viewer צריכים לרוץ באותו origin של אתר לאומי.

ה-viewer יכול להיות tab חדש שנפתח מתוך tab של לאומי ומקבל את אותו origin context.

אין לתכנן V1 כ-localhost viewer שקורא ישירות את אותו IndexedDB, משום שזה origin אחר.

## Proposed V1 components

~~~text
recorder/
    polling + normalization + IndexedDB writes

storage/
    IndexedDB schema + transactions + queries

viewer/
    current table + sorting + history drill-down

shared/
    constants + field definitions + messages
~~~

בשלבי implementation נחליט אם כל אלה יהיו קבצים נפרדים או bundle browser-friendly קטן, בלי framework בשלב הראשון.

## Planning documents

- REQUIREMENTS.md
- ARCHITECTURE.md
- ROADMAP.md
- DATA_MODEL.md
- TEST_PLAN.md
