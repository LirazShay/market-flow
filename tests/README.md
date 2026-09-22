# tests

מיקום שמור לבדיקות אוטומטיות של קוד production עתידי.

## עיקרון

בדיקות כאן צריכות להגן על behavior ציבורי:

- inputs / outputs.
- contracts.
- integration boundaries.
- observable behavior.

אין לבדוק private implementation ללא צורך.

בדיקות API מחקריות שכרגע רצות ידנית בדפדפן נשארות תחת `scripts/research/.../tests/`.
