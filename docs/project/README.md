# Project Documentation

מסמכי context שחלים על כל Market Flow.

## Files

- `current-state.md` — milestones ומצב רוחבי של הפרויקט; לא pointer לכל micro-step.
- `system-scope.md` — scope ארוך טווח ללא קיבוע architecture.
- `decisions.md` — compact decision index.
- `decisions/D-NNN.md` — התוכן המלא של כל החלטה.
- `chat-map.md` — workstreams/chats.
- `repository-structure.md` — מבנה התיקיות והאחריות של כל אזור.
- `ai-engineering-guidelines.md` — כללים מפורטים שנקראים רק לפי צורך.
- `chatgpt-project-instructions.md` — Project Instructions יציבים, מוכנים להדבקה ב-ChatGPT Project.

## AI navigation

הכניסה המחייבת היא:

~~~text
AGENTS.md
~~~

ב-workstream פעיל עם fast context:

~~~text
AGENTS.md
→ AI_CONTEXT.md
→ STATUS.json
→ target files
→ relevant tests
~~~

אין חובה לקרוא את `current-state.md` או את כל ההחלטות לפני כל שינוי קטן.

כאשר נדרשת החלטה קיימת:

~~~text
decisions.md
→ identify relevant ID/tag
→ decisions/D-NNN.md
~~~

קוראים context רחב רק כאשר המשימה משנה architecture/schema/decision, עוברת workstream, מזהה סתירה או דורשת evidence נוסף.
