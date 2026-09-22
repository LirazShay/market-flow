# PROJECT_CONTEXT.md — Market Flow

זהו מסמך הכניסה הראשי לכל AI, agent או מפתח שמגיע לפרויקט.

נקודת הכניסה היא:

1. `AGENTS.md`
2. אם ממשיכים workstream פעיל שיש בו `AI_CONTEXT.md` ו-`STATUS.json` — קוראים אותם ואת הקבצים הרלוונטיים בלבד.
3. רק כאשר צריך context רוחבי/ארכיטקטוני/היסטורי — קוראים את `PROJECT_CONTEXT.md`, `docs/project/current-state.md` והתיעוד הרחב הרלוונטי.

ה-repository הוא ה-source of truth. אין להניח שזיכרון מצ'אט קודם מעודכן יותר מהתיעוד שב-Git.

---

## מהו Market Flow

Market Flow הוא פרויקט שמטרתו לבנות בהדרגה מערכת מלאה לעבודה עם נתוני שוק ומסחר.

הכוונה ארוכת הטווח היא לכסות את ה-flow הבא:

~~~text
Market Data
→ Collection
→ Storage / History
→ Scanner
→ Analysis / Signals
→ Trading Logic
→ Execution
→ Position / Order Management
→ UI / Monitoring
~~~

חשוב: זוהי מפת scope, לא טענה שכל הרכיבים כבר קיימים.

---

## עקרון הפיתוח

הפרויקט נבנה בהדרגה ביחידות עבודה קוהרנטיות וניתנות לאימות.

היקף יחידת העבודה נקבע לפי boundary הנדסי/בדיקתי אמיתי. גם כאשר המשתמש כותב `תמשיך לשלב הבא`, אין חובה לסיים stage שלם באותה הודעה; ממשיכים אל העבודה המתוכננת הבאה ועוצרים בנקודת implementation + verification טבעית, תוך שמירה על `STATUS.json` מדויק.

---

## מצב נוכחי

השלב הראשון של הפרויקט עוסק ב:

~~~text
01 – Market Data / Leumi API Research
~~~

בשלב זה נחקרו ונבדקו קריאות market data מתוך אתר לאומי.

הוכח בפועל:

- MapHeat2 מספק universe/metadata של ניירות.
- GetSecuritiesData מספק detailed/live-like market snapshot עבור רשימת IDs.
- MapHeat2.PaperId == GetSecuritiesData.Key הוא join key שנבדק ב-561/561.
- ניתן לקבל 561 ניירות מ-MapHeat2.
- ניתן לקבל את כל 561 הרשומות מ-GetSecuritiesData ב-3 batches של 187.
- בוצע field coverage מלא על 561 הרשומות.
- נבנה browser proof-of-concept שמציג את כל הנתונים בטבלה.
- נבנה long-running polling test ונבדקה בפועל ריצה של 40.03 דקות: 481 cycles הושלמו, 0 נכשלו.

לפרטים מלאים:

~~~text
docs/leumi-api/
~~~


Workstream פעיל נוסף בתוך Phase 01:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

ה-Local History Viewer V1 כבר נמצא ב-implementation. Stage 7 recorder הושלם ואומת; Stage 8 — persistence integration — הוא השלב הבא. IndexedDB schema/foundation קיים, אך atomic full-cycle persistence עדיין לא מחובר ל-recorder.

להמשך מהיר של workstream זה:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

---

## מה עדיין לא נבנה

נכון לעכשיו אין production implementation של:

- collector מתמשך.
- production database/persistence.
- production historical time-series store.
- production scanner.
- momentum ranking engine.
- signal engine.
- buy/sell execution engine.
- order management.
- position management.
- production UI.
- monitoring/alerting production stack.

אין להניח שאחד מהרכיבים האלה קיים רק בגלל שהוא נמצא ב-scope העתידי.

---

## מבנה ידע מרכזי

~~~text
AGENTS.md
    כללי העבודה הקבועים

PROJECT_CONTEXT.md
    הקשר עליון לפרויקט

docs/project/
    מצב הפרויקט, scope, decisions, חלוקת chats

docs/leumi-api/
    כל המחקר וה-evidence על Leumi market APIs

scripts/research/market-data/leumi/
    browser probes / PoCs / test scripts
~~~

---

## מסמכי project

- docs/project/current-state.md — מה קיים עכשיו ומה עדיין Pending.
- docs/project/system-scope.md — גבולות המערכת וה-flow העתידי ברמה גבוהה.
- docs/project/decisions.md — החלטות שכבר התקבלו והסיבות להן.
- docs/project/chat-map.md — חלוקת העבודה בין chats/streams.
- docs/project/repository-structure.md — איפה כל סוג קוד/בדיקה/תיעוד צריך לחיות.

---

## Source of truth לפי נושא

כללי עבודה:
AGENTS.md

מצב הפרויקט:
docs/project/current-state.md

Leumi market data:
docs/leumi-api/

API field semantics / availability:
docs/leumi-api/fields/field-reference-he.md
docs/leumi-api/fields/field-availability.md

Verified tests:
scripts/research/market-data/leumi/collection/README.md
scripts/research/market-data/leumi/tests/field-coverage/reports/

Browser research scripts:
scripts/research/market-data/leumi/

Project-level ChatGPT instructions:
docs/project/chatgpt-project-instructions.md

---

## כלל חשוב ל-AI חדש

אם המשתמש מבקש להמשיך עבודה קיימת:

1. קרא את ה-repo לפני שאתה שואל שאלות שכבר נענו בו.
2. אל תמציא architecture, technology או business rule שלא הוחלטו.
3. אל תבצע refactor רחב של script שעובד בלי צורך.
4. כאשר נלמד משהו חדש — תעד אותו ב-repo באותו שלב.
5. כאשר משהו לא הוכח — סמן אותו Unknown או Inferred.
6. בצ'אט חדש שנפתח בגבול workstream/stage, אם קיים `HANDOFF.md` מקומי — קרא אותו אחרי `AI_CONTEXT.md` ו-`STATUS.json`.

---

## Technology decisions

נכון לעכשיו לא נבחר stack סופי למערכת המלאה.

אין להניח Node, C#, SQL, NoSQL, Redis, React, Angular או כל stack אחר עד שתתקבל החלטה מפורשת ותירשם ב-docs/project/decisions.md.

קוד JavaScript הקיים כרגע הוא browser research code, לא הכרעה על stack עתידי.

---

## Naming

שם הפרויקט:

~~~text
Market Flow
~~~

שם מומלץ לצ'אט/stream הראשון:

~~~text
01 – Market Data / Leumi API Research
~~~
