# Market Flow

מאגר מרכזי למערכת Market Flow.

המטרה ארוכת הטווח של הפרויקט היא לבנות בהדרגה מערכת מלאה ל-market data, collection, scanning, analysis ובהמשך execution וניהול מסחר.

הפרויקט נבנה בהתקדמות הדרגתית וביחידות עבודה קוהרנטיות שניתנות לבדיקה. גבולות הנדסיים ובדיקתיים קודמים לחלוקה שרירותית לפי הודעות.

## Start here — AI / Developers

נקודת הכניסה הקבועה:

1. [AGENTS.md](AGENTS.md) — כללי העבודה הקצרים והמחייבים.
2. ב-workstream פעיל, אם קיימים `AI_CONTEXT.md` ו-`STATUS.json`, משתמשים בהם כ-fast continuation context.
3. קוראים מסמכי project/domain רחבים רק כאשר המשימה דורשת אותם.

ה-repository הוא ה-source of truth המשותף בין chats ו-agents.

המטרה היא להימנע מקריאה מחדש של כל ה-repository בכל שינוי קטן, בלי לוותר על durable documentation.

## Project map

- [Current State](docs/project/current-state.md)
- [System Scope](docs/project/system-scope.md)
- [Decision Index](docs/project/decisions.md)
- [Chat / Workstream Map](docs/project/chat-map.md)
- [Repository Structure](docs/project/repository-structure.md)
- [ChatGPT Project Instructions](docs/project/chatgpt-project-instructions.md)

## איפה כתובים כל השלבים

הפיתוח הפעיל כרגע הוא:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

שלושת קבצי הניווט המחייבים שם הם:

~~~text
ROADMAP.md
    כל שלבי V1, הסדר וה-scope שלהם

STATUS.json
    מה הושלם, מה נוכחי ומה הבא

AI_CONTEXT.md
    context טכני קצר להמשך עבודה
~~~

כלומר:

~~~text
רוצה לראות את כל התוכנית? → ROADMAP.md
רוצה לדעת איפה אנחנו עכשיו? → STATUS.json
רוצה להמשיך לפתח? → AI_CONTEXT.md + STATUS.json
~~~

אין לשכפל status לתוך ROADMAP; כך לא נוצרים שני מקורות אמת שסותרים זה את זה.

## Phase 01 — Market Data / Leumi API Research

ה-workstream הראשון:

~~~text
01 – Market Data / Leumi API Research
~~~

תיעוד:

~~~text
docs/leumi-api/
~~~

קוד מחקר:

~~~text
scripts/research/market-data/leumi/
~~~

### Verified foundation

- MapHeat2 מחזיר universe/metadata.
- snapshot שנבדק כלל 561 ניירות.
- GetSecuritiesData מחזיר detailed/dynamic market data לפי IDs.
- כל 561 הניירות התקבלו בהצלחה ב-3 batches של 187.
- PaperId == Key נבדק ב-561/561.
- בוצע field coverage מלא.
- browser table PoC עבד.
- long-running polling stability נבדק בפועל במשך 40.03 דקות: 481 cycles הושלמו ללא cycle failure.

לפרטים:

[Leumi API Research](docs/leumi-api/README.md)

### Active prototype — Local History Viewer V1

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Current fast context:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

ה-prototype כבר נמצא ב-implementation: IndexedDB foundation קיים, Stage 7 recorder הושלם ואומת ב-Fast CI וב-Chromium, והשלב הבא הוא Stage 8 — persistence integration.

## Important

הפרויקט עדיין לא כולל production collector, database, scanner, execution engine או production UI.

אין להסיק מקיומו של scope עתידי שרכיב כבר נבנה.

## Core principle

אין להניח משמעות לשדה, endpoint, behavior או architecture שלא נבדקו או הוחלטו.

יש לסמן ידע כ:

~~~text
Verified
Inferred
Unknown
~~~
