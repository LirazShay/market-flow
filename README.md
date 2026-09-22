# Market Flow

מאגר מרכזי למערכת Market Flow.

המטרה ארוכת הטווח של הפרויקט היא לבנות בהדרגה מערכת מלאה ל-market data, collection, scanning, analysis ובהמשך execution וניהול מסחר.

הפרויקט נבנה בכוונה micro-step by micro-step, כאשר כל שלב נבדק ומתועד לפני שמתקדמים.

## Start here — AI / Developers

לפני כל שינוי בפרויקט יש לקרוא:

1. [AGENTS.md](AGENTS.md) — כללי העבודה המחייבים.
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — ההקשר הכולל של הפרויקט.
3. [docs/project/current-state.md](docs/project/current-state.md) — מה קיים עכשיו ומה עדיין לא.
4. [docs/project/decisions.md](docs/project/decisions.md) — החלטות שכבר התקבלו.
5. את התיעוד הספציפי ל-domain שעליו עובדים.

ה-repository הוא ה-source of truth המשותף בין chats ו-agents.

## Project map

- [Current State](docs/project/current-state.md)
- [System Scope](docs/project/system-scope.md)
- [Decision Log](docs/project/decisions.md)
- [Chat / Workstream Map](docs/project/chat-map.md)
- [Repository Structure](docs/project/repository-structure.md)

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
- long-running polling test נכתב, אך ריצת stability ממושכת עדיין Pending verification.

לפרטים:

[Leumi API Research](docs/leumi-api/README.md)

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
