# AGENTS.md — הוראות קבועות ל-AI שעובד על Market Flow

מסמך זה הוא **חובה** לכל AI, agent או מפתח שעובד על המאגר.

המטרה היא שהפרויקט יוכל להמשיך לאורך זמן ובצ'אטים שונים בלי להסתמך על זיכרון של שיחה קודמת.

---

## 1. לפני כל שינוי

לפני כתיבת קוד:

1. קרא את `AGENTS.md` במלואו.
2. קרא את `PROJECT_CONTEXT.md`.
3. קרא את `docs/project/current-state.md`.
4. קרא את `README.md`.
5. קרא את התיעוד הרלוונטי תחת `docs/`.
6. בדוק את הקוד הקיים הקשור למשימה.
7. בדוק את `docs/project/decisions.md` כדי לא לפתוח מחדש החלטה קיימת בלי סיבה.
8. בדוק מה כבר הוכח בפועל ומה עדיין בגדר השערה.
9. אל תשכתב פתרון קיים שעובד בלי סיבה ברורה.

המאגר עצמו הוא ה-source of truth. אין להסתמך על זיכרון משיחה קודמת כאשר המידע נמצא בפרויקט.

---

## 2. עובדים בצעדים קטנים מאוד

הפרויקט נבנה **micro-step by micro-step**.

כלל עבודה:

> לבצע רק את השלב שהתבקש כרגע, להוכיח שהוא עובד, לתעד אותו, ורק אחר כך להתקדם.

אין:

- לקפוץ כמה שלבים קדימה.
- להוסיף שרת, DB, framework או abstraction לפני שיש בהם צורך.
- לבנות architecture גדולה מראש.
- להוסיף "שיפורים" שלא התבקשו רק כי הם עשויים להיות שימושיים בעתיד.

אם יש רעיון לשלב עתידי, אפשר לתעד אותו כ-`TODO` או `Future`, אבל לא לממש אותו בלי בקשה.

---

## 3. כל דבר חדש חייב להיות מתועד

כל שינוי משמעותי חייב להשאיר אחריו תיעוד בתוך ה-repository.

כאשר מתגלה מידע חדש על API, flow, field, limitation או behavior:

- עדכן את המסמך הרלוונטי תחת `docs/`.
- אם אין מסמך מתאים, צור מסמך חדש.
- ציין מה **Verified**, מה **Inferred**, ומה **Unknown**.
- שמור דוגמת response מצומצמת כאשר היא מועילה להבנת ה-schema.
- תעד תוצאות בדיקה בפועל, כולל ערכים ומספרים חשובים.

אין להשאיר ידע חשוב רק בתוך chat, console output או בראש של ה-AI.

---

## 4. הבחנה מחייבת: Verified / Inferred / Unknown

אסור להציג הנחה כאילו היא עובדה.

השתמש בשלוש רמות:

### Verified

משהו שנבדק בפועל ונצפה עובד.

דוגמה:

~~~text
GetSecuritiesData with 187 IDs → HTTP 200 → 187 records
~~~

### Inferred

מסקנה הגיונית מהתנהגות שנצפתה, אבל לא אומתה ישירות.

דוגמה:

~~~text
MapHeat2 appears to define the current result set and ordering.
~~~

### Unknown

משהו שעדיין לא הוכח.

דוגמה:

~~~text
The exact reason for HTTP 403 above a certain request size is unknown.
~~~

כאשר ניתן, יש לכתוב במפורש מה נדרש כדי להפוך Inferred ל-Verified.

---

## 5. קוד מחקר מול קוד מוצר

יש להפריד בין:

~~~text
scripts/research/
~~~

לבין קוד מוצר עתידי.

קוד תחת `scripts/research/` יכול להיות probe, recorder או proof-of-concept.

קוד מוצר צריך להגיע רק לאחר שה-flow הוכח והוגדר.

אין להפוך script ניסויי ל-production code בלי refactor, tests ותיעוד מתאים.

---

## 6. מדיניות בדיקות

הבדיקות צריכות להגן על **behavior חשוב מבחוץ**, ולא על implementation details.

העדפה:

- Public behavior
- Inputs / outputs
- HTTP contracts
- Integration boundaries
- Observable results

להימנע ככל האפשר מ:

- בדיקת private methods
- coupling למימוש פנימי
- tests שנשברים בגלל refactor שאינו משנה behavior

כאשר מתגלה bug:

1. קודם ליצור test שמדגים את הבעיה, כאשר הדבר מעשי.
2. לוודא שה-test נכשל.
3. לתקן את הקוד.
4. לוודא שה-test עובר.
5. לתעד את ה-bug ואת הפתרון אם הוא מהותי.

---

## 7. שגיאות חייבות להיות ברורות

אין להסתיר תקלות.

אסור:

~~~js
try {
    // ...
} catch {
}
~~~

ללא סיבה מתועדת היטב.

כאשר פעולה נכשלת, יש לספק מידע שימושי:

- איזה שלב נכשל.
- איזה endpoint / component נכשל.
- HTTP status כאשר רלוונטי.
- expected vs actual.
- exception/message המקורי כאשר הוא בטוח להצגה.

עדיף לעצור עם שגיאה ברורה מאשר להמשיך עם data חלקי כאילו הכול תקין.

---

## 8. Assertions ובדיקות שלמות ל-data

בכל collection או ingestion משמעותי יש לבדוק, כאשר אפשר:

- מספר requested.
- מספר received.
- unique count.
- duplicates.
- missing IDs.
- response structure.

אין להסתפק ב-"נראה שעבד".

---

## 9. ניווט בפרויקט

מסמכי ה-context המשותפים לכל ה-workstreams:

~~~text
PROJECT_CONTEXT.md
docs/project/current-state.md
docs/project/system-scope.md
docs/project/decisions.md
docs/project/chat-map.md
docs/project/repository-structure.md
~~~

כאשר מצב הפרויקט משתנה באופן מהותי, יש לעדכן את `current-state.md`.

כאשר מתקבלת החלטה ארכיטקטונית/טכנית/התנהגותית שחשוב לא לפתוח מחדש, יש להוסיף אותה ל-`decisions.md`.

כאשר נפתח workstream/chat משמעותי חדש, יש לעדכן את `chat-map.md`.

---

## 10. תיעוד API של לאומי

ה-source of truth הנוכחי נמצא תחת:

~~~text
docs/leumi-api/
~~~

כאשר משנים או לומדים משהו חדש על לאומי:

- `overview/api-flow.md` — flow בין endpoints.
- `overview/api-usage-guide.md` — המלצות עבודה.
- `endpoints/mapheat2.md` — MapHeat2.
- `endpoints/get-securities-data.md` — GetSecuritiesData.
- `fields/field-reference-he.md` — פירוש שדות.
- `fields/field-availability.md` — coverage/nullability.
- `samples/` — דוגמאות response מצומצמות.

תיעוד שמסביר script מסוים, איך מריצים אותו, configuration שלו ותוצאות raw של הרצה נשמר ליד הקוד עצמו תחת `scripts/research/...`. אין לשכפל אותו תחת `docs/`.

קוד מחקר:

~~~text
scripts/research/market-data/leumi/
~~~

---

## 11. אין לשמור secrets

אין להכניס ל-Git:

- Cookies
- Session tokens
- Authorization headers
- מספרי חשבון
- credentials
- מידע אישי שלא נדרש
- dumps מלאים שעלולים להכיל מידע רגיש

דוגמאות API צריכות להיות מצומצמות וללא authentication/session data.

---

## 12. אל תנחש schema

כאשר API משתנה או מופיע שדה חדש:

- אל תמציא type או משמעות.
- תעד raw example.
- בדוק כמה דוגמאות אם צריך.
- סמן משמעות לא ודאית כ-`Unknown` או `Inferred`.

אם שם השדה נראה ברור אבל אין אימות מלא, ציין זאת.

---

## 13. אל תשבור flow שעובד

לפני שינוי script שכבר הוכח:

1. להבין מה הוא עושה.
2. לשמור את ה-behavior הקיים.
3. להוסיף validation לפני refactor כאשר אפשר.
4. לא לשנות naming/structure ללא צורך אם הדבר מקשה להשוות לגרסה שעבדה.

במיוחד בקוד browser/research, עדיף שינוי קטן וברור על rewrite מלא.

---

## 14. Logging

כאשר נבנים רכיבים מתמשכים, ה-logging צריך לאפשר להבין מה קרה בלי debugging אקראי.

מינימום שימושי:

- timestamp
- component/step
- operation
- result
- duration כאשר רלוונטי
- error details כאשר יש כשל

אין להציף את הלוג ללא צורך; המטרה היא traceability.

---

## 15. Definition of Done לכל micro-step

שלב נחשב גמור רק כאשר כל מה שרלוונטי ממנו מתקיים:

- [ ] הקוד רץ.
- [ ] התוצאה נבדקה בפועל או באמצעות test.
- [ ] אין שגיאה ידועה שמוסתרת.
- [ ] נוספו validations מתאימים.
- [ ] עודכן התיעוד.
- [ ] עובדות חדשות מסומנות כ-Verified/Inferred/Unknown.
- [ ] אין secrets בקוד או בתיעוד.
- [ ] ה-repository נשאר בנקודת מצב מובנת ויציבה.

---

## 16. מה לכתוב בסיום כל משימה

בסיום שינוי, ה-AI צריך לדווח בקצרה:

1. מה השתנה.
2. אילו קבצים נוספו/שונו.
3. מה נבדק בפועל.
4. האם יש משהו שעדיין Unknown.
5. לא להציע או לבצע את השלב הבא אלא אם המשתמש ביקש.

---

## 17. עקרון עליון

העדיפות בפרויקט היא:

~~~text
Correctness
→ Observability
→ Testability
→ Documentation
→ Simplicity
→ Speed of adding features
~~~

עדיף שלב קטן, ברור, מתועד ומוכח מאשר הרבה קוד שקשה לדעת אם הוא באמת עובד.
