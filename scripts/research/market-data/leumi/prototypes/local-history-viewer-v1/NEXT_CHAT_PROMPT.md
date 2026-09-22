# Market Flow — Fresh Chat Continuation Prompt

אתה ממשיך פיתוח קיים ב-GitHub repository:

~~~text
LirazShay/market-flow
branch: main
~~~

ברירת המחדל לתשובות היא עברית. קוד, identifiers ומונחים טכניים יכולים להישאר באנגלית.

## מקור האמת

GitHub הוא מקור האמת.

בתחילת הצ'אט:

1. fetch את `main`;
2. קרא `AGENTS.md`;
3. קרא:
   - `scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/README.md`
   - `scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json`
   - `scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/AI_CONTEXT.md`
   - `scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/HANDOFF.md`
4. קרא את ה-stage שעליו מצביע `STATUS.json` בתוך `ROADMAP.md`;
5. רק אז קרא את הקוד והטסטים הרלוונטיים.

אל תסמוך על snapshot של מצב שמופיע בפרומפט הזה אם הוא סותר את GitHub. `STATUS.json` גובר תמיד.

## כלל קריטי חדש לפני live verification

זוהה פער delivery/assembly משמעותי:

המערכת בנויה ומאומתת כיום כמודולים רבים דרך test harness, אבל עדיין אין מנגנון מאומת שמחבר את הכל ליחידת הרצה אחת שאפשר להפעיל בפועל באתר לאומי.

לכן לפני **כל** Live Leumi verification חייבים להשלים את stage שעליו מצביע `STATUS.json` עבור:

~~~text
Runtime assembly
+
single browser payload
+
Bookmarklet-compatible launcher
~~~

אל תדלג ישירות ל-live provider testing.

## מטרת מנגנון ה-assembly

צריך להגיע מ:

~~~text
recorder/
storage/
messaging/
viewer/
~~~

אל:

~~~text
deterministic build/assembly
→ one runnable browser payload
→ Bookmarklet-compatible launcher
→ launch on Leumi page
~~~

דרישות:

- source modules נשארים source of truth;
- לא להעתיק ידנית את כל הלוגיקה לגרסת Bookmarklet שנייה;
- dependency order חייב להיות deterministic;
- repeated launch צריך להיות idempotent/recoverable;
- IndexedDB נשאר source of truth;
- BroadcastChannel נשאר notification-only;
- same-origin viewer behavior חייב להישמר;
- אסור להכניס generated artifacts עם cookies/tokens/auth headers/account data/session dumps;
- צריך build/package verification אוטומטי;
- צריך browser smoke test של ה-output המורכב;
- צריך תיעוד ברור איך מייצרים ואיך מפעילים;
- רק אחרי זה עוברים ל-live Leumi verification.

## Testing / engineering discipline

פעל לפי:

~~~text
tests/TESTING_POLICY.md
tests/E2E_DEBUGGING.md
docs/project/engineering-practices.md
~~~

חובה:

~~~text
changed test
→ run immediately in its real layer
→ green before continuing

browser behavior/test changed
→ Chromium immediately

numbered Stage closure
→ Fast CI green
→ full Browser CI green
→ only then Stage complete
~~~

ב-E2E debugging:

~~~text
evidence
→ classify
→ hypothesis
→ smallest experiment
→ targeted rerun
→ RCA
→ minimal fix
→ targeted green
→ broader regression
~~~

אל תריץ full suite אחרי כל ניסוי קטן אם targeted test יכול להכריע את ההשערה.

## Data integrity invariants

אסור לשבור:

~~~text
securityId = String(PaperId or Key)
null != 0 != ""
no hardcoded universe size
full raw MapHeat preserved
full raw Security preserved
successful cycle atomic:
cycles + history + latest + meta
~~~

Failed API / validation / DB work לעולם לא משאיר partial `latest/history`.

## Security

ה-repository ציבורי.

לעולם אל תכניס:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- private browser/session data;
- sensitive raw dumps.

אל תנסה לעקוף WAF/access controls.

## איך להמשיך

כאשר המשתמש כותב:

~~~text
תמשיך לשלב הבא
~~~

התקדם יחידת עבודה טבעית אחת לפי `STATUS.json`.

כרגע הדבר הראשון שצריך לעשות בצ'אט החדש הוא:

~~~text
read current STATUS/ROADMAP
→ plan Stage 19.2 runtime assembly/bookmarklet architecture
→ tests/build contract first
→ implement generated single-payload mechanism
→ generate Bookmarklet-compatible launcher
→ Chromium smoke test assembled output
→ Fast CI + full Browser CI at Stage closure
→ update STATUS.json
~~~

אל תתחיל live Leumi verification עד ש-Stage 19.2 complete ומאומת.

## דיווח בסוף כל יחידת עבודה

כתוב בקצרה:

- מה יושם;
- files changed;
- tests added/changed;
- Fast CI;
- Browser CI אם רלוונטי;
- מה pending;
- מה ה-next pointer ב-`STATUS.json`.

המילה `סיימתי` מותרת רק כאשר כל V1 כולל Stage 20 הושלם לחלוטין.
