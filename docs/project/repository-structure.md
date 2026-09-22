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
- compact decision index + individual durable decisions.
- chat/workstream map.
- repository structure.

Decision navigation:

~~~text
docs/project/decisions.md
    compact index

docs/project/decisions/D-NNN.md
    full individual decision
~~~

AI should scan the compact index first and read only relevant decision files.

## docs/leumi-api/

קורפוס מחקר ה-API של Leumi market data.

הוא מחולק לפי סוג ידע:

~~~text
docs/leumi-api/
├── README.md
├── overview/
├── endpoints/
├── fields/
└── samples/
~~~

### overview/

התמונה הרחבה: flow והמלצות שימוש.

### endpoints/

מסמך נפרד לכל endpoint.

### fields/

semantics, nullability ו-coverage של fields.

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
│   ├── README.md
│   ├── analyze-field-coverage.js
│   └── reports/
└── polling-stability/
    ├── README.md
    └── long-running-poll-test.js
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

---

# Documentation ownership

כלל ברירת המחדל:

~~~text
Code-specific documentation → next to code
Cross-cutting/domain knowledge → docs/
~~~

README שמסביר script, configuration, run procedure או test output שייך לתיקיית הקוד.

Raw reports של test suite נשמרים ליד אותו test suite.

`docs/` נשאר בסיס הידע של הפרויקט: API semantics, architecture/context, decisions ומסקנות שאינן שייכות לקובץ קוד יחיד.

---

# Fast AI context for active workstreams

A long-running workstream may include:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

These files are operational navigation aids.

## AI_CONTEXT.md

Purpose:

- compact current architecture/invariants.
- current focus.
- relevant working-set files.
- rules for when broader documentation must be consulted.

It does **not** replace durable design, API evidence or decision documents.

## STATUS.json

Purpose:

- machine-readable current stage.
- next work item.
- verification state.
- compact progress pointer.

For a normal continuation inside that workstream, the preferred read path is:

~~~text
AGENTS.md
→ AI_CONTEXT.md
→ STATUS.json
→ target files
→ directly relevant tests
~~~

Do not require a full-repository documentation scan unless the task crosses a boundary, changes architecture/schema, finds a conflict, or requires evidence re-verification.

## Update cadence

~~~text
normal implementation:
  code + tests + STATUS.json

meaningful stage boundary:
  ROADMAP + local README
  AI_CONTEXT only when focus/invariants change

durable decision:
  docs/project/decisions.md

project/workstream milestone:
  docs/project/current-state.md
~~~

This reduces duplicate reads and documentation churn while preserving durable sources of truth.
