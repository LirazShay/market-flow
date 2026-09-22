# Repository Structure — Market Flow

מסמך זה מסביר איפה כל סוג artifact צריך לחיות ולמה.

המטרה היא למנוע מצב שבו research scripts, production code, tests ותיעוד מתערבבים באותה תיקייה.

---

## Top-level structure

~~~text
/
├── README.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── docs/
├── scripts/
├── src/
└── tests/
~~~

---

## Root files

### README.md

עמוד ניווט ראשי לבני אדם ול-AI.

### AGENTS.md

כללי העבודה המחייבים לכל agent.

### PROJECT_CONTEXT.md

ה-context העליון של הפרויקט: מה המטרה, מה קיים ומה לא.

---

# docs/

תיעוד וידע שנועדו לשרוד מעבר לצ'אט או להרצת קוד בודדת.

~~~text
docs/
├── README.md
├── project/
└── leumi-api/
~~~

## docs/project/

תיעוד רוחבי של כל הפרויקט:

- current state.
- system scope.
- decisions.
- chat/workstream map.
- repository structure.

## docs/leumi-api/

קורפוס מחקר ה-API של Leumi market data.

הוא מחולק לפי סוג ידע:

~~~text
docs/leumi-api/
├── README.md
├── overview/
├── endpoints/
├── fields/
├── testing/
├── reports/
└── samples/
~~~

### overview/

התמונה הרחבה: flow והמלצות שימוש.

### endpoints/

מסמך נפרד לכל endpoint.

### fields/

semantics, nullability ו-coverage של fields.

### testing/

מתודולוגיית בדיקות ותוצאות מסוכמות.

### reports/

evidence היסטורי של runs. Report ישן לא משכתבים כדי להתאים לתוצאה חדשה.

### samples/

דוגמאות payload קטנות וללא מידע רגיש.

---

# scripts/

כלי עזר והרצות שאינם production application code.

~~~text
scripts/
└── research/
    └── market-data/
        └── leumi/
~~~

---

# scripts/research/

המקום ל-probes, recorders, demos ובדיקות מחקריות.

הקוד כאן נועד לענות על שאלות כמו:

- מה endpoint מחזיר?
- כמה IDs ניתן לשלוח?
- האם polling נשאר יציב?
- אילו fields הם null?
- האם flow שנצפה באמת עובד?

הוא אינו production code.

---

# Domain-first research organization

Research מסודר קודם לפי domain ורק אחר כך provider.

לדוגמה:

~~~text
scripts/research/
├── market-data/
│   └── leumi/
└── execution/
    └── leumi/      # רק אם וכאשר יהיה מחקר execution
~~~

הסיבה: "Leumi" הוא provider, אבל market-data ו-execution הן אחריות שונה לגמרי.

כך לא נגיע בעתיד לתיקייה אחת בשם leumi שמכילה recorder, scanner, buy flow, sell flow ו-DB scripts יחד.

---

# Leumi market-data research

~~~text
scripts/research/market-data/leumi/
├── README.md
├── capture/
├── collection/
├── demos/
└── tests/
~~~

## capture/

גילוי והקלטת traffic.

## collection/

probes שמוכיחים collection behavior.

## demos/

PoCs שקל לבדוק ידנית.

## tests/

בדיקות מחקריות, מחולקות לפי suite:

~~~text
tests/
├── field-coverage/
└── polling-stability/
~~~

חשוב: אלה אינם production automated tests.

---

# src/

מיועד אך ורק לקוד production עתידי.

כרגע:

~~~text
src/README.md
~~~

בלבד.

אין להעתיק research script ל-src בלי תכנון production מפורש.

---

# tests/

מיועד לבדיקות אוטומטיות של production code עתידי.

הבדיקות כאן צריכות להגן על public/observable behavior ולא על private internals.

Research tests של API חיצוני נשארים תחת:

~~~text
scripts/research/.../tests/
~~~

---

# README בכל תיקייה

כל תיקייה משמעותית צריכה README מקומי שמסביר לפחות:

1. למה התיקייה קיימת.
2. מה שייך אליה.
3. מה לא שייך אליה.
4. אילו files/suites קיימים.
5. איך מריצים, כאשר יש פעולה ידנית.
6. איפה נמצא התיעוד/evidence.

המטרה היא ש-AI חדש יוכל לנווט מלמעלה למטה בלי לקרוא את כל repository.

---

# Naming principles

- שמות תיקיות: lowercase + kebab-case.
- שם צריך לתאר responsibility, לא implementation מקרי.
- tests מחולקים לפי behavior/suite.
- reports כוללים timestamp/תאריך בשם כאשר הם point-in-time evidence.
- לא ליצור תיקייה כללית כמו `misc`, `temp`, `new` או `stuff`.

---

# When to add another folder

לא יוצרים hierarchy רק לשם hierarchy.

תת-תיקייה מוצדקת כאשר לפחות אחד מאלה מתקיים:

- יש responsibility שונה.
- יש lifecycle שונה.
- יש סוג artifact שונה.
- צפויים כמה files מאותו סוג.
- AI חדש ירוויח מגבול ברור בין הנושאים.

---

# Future provider note

כרגע תיעוד Leumi נמצא תחת:

~~~text
docs/leumi-api/
~~~

אם נוסף provider משמעותי נוסף ל-market data, יש לשקול decision נפרד האם להעביר provider docs למבנה:

~~~text
docs/market-data/<provider>/
~~~

לא מבצעים migration כזה לפני שיש צורך ממשי.
