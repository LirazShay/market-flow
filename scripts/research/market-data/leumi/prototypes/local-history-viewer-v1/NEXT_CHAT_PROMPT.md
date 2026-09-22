# Market Flow — Next Chat Full Development Handoff

הדבק את כל הקובץ הזה כהודעה הראשונה בצ'אט החדש.

---

אתה ממשיך פיתוח קיים ב-GitHub repository:

~~~text
LirazShay/market-flow
branch: main
~~~

עבוד ישירות על ה-repository דרך GitHub tools. אל תסתפק בהסברים או snippets כאשר אפשר לבצע את העבודה בפועל.

ברירת המחדל לתשובות: עברית. קוד, identifiers ושמות files נשארים בצורה הטבעית שלהם.

# 1. מקור האמת

ה-repository הוא ה-source of truth.

לפני כל שינוי:

1. fetch את `main` הנוכחי.
2. קרא את `AGENTS.md`.
3. קרא את `STATUS.json` ו-`AI_CONTEXT.md` של ה-workstream הפעיל.
4. אם צריך handoff, קרא `HANDOFF.md`.
5. קרא רק את הקבצים שאתה עומד לשנות ואת הטסטים הרלוונטיים.
6. פתח design docs רחבים יותר רק אם אתה משנה architecture/schema/public behavior או פותר סתירה.

אל תסמוך על SHA שמופיע בפרומפט הזה; תמיד ה-repository גובר.

ה-workstream הפעיל:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

קבצי הניווט המרכזיים:

~~~text
README.md
    front door

ROADMAP.md
    כל שלבי V1 והסדר שלהם

STATUS.json
    מקור האמת היחיד למצב current/next/completed

AI_CONTEXT.md
    context טכני קצר להמשך פיתוח

HANDOFF.md
    boundary summary לצ'אט חדש

docs/
    design יציב

tests/TESTING_POLICY.md
    מדיניות tests/CI/checkpoints
~~~

אם README או prompt ישן סותרים את `STATUS.json`, סמוך על `STATUS.json` ותקן את הסתירה באותו batch אם היא רלוונטית.

# 2. מה הפרויקט הזה בכלל

זהו browser-only research prototype בשם:

~~~text
Local History Viewer V1
~~~

המטרה:

~~~text
Leumi browser tab
→ Recorder
→ market-data snapshots
→ validation
→ IndexedDB local history
→ same-origin Viewer
→ current table + history + diagnostics
~~~

המערכת היא כרגע market-data research/viewer בלבד.

V1 אינו production system, אינו server, אינו external DB, ואינו כולל order execution.

# 3. הארכיטקטורה הנוכחית

~~~text
MapHeat2
→ dynamic universe

PaperId[]
→ sequential GetSecuritiesData chunks
→ validated complete cycle

→ IndexedDB
   ├── meta
   ├── sessions
   ├── universe
   ├── cycles
   ├── latest
   └── history

→ BroadcastChannel metadata notification

→ same-origin Viewer
→ viewer re-reads IndexedDB
~~~

IndexedDB הוא תמיד source of truth.

BroadcastChannel הוא notification-only; אסור להעביר בו arrays של market rows במקום לקרוא מחדש IndexedDB.

# 4. עובדות API/data שאסור לשבור

Observed and verified בעבר:

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

נבדק ב-snapshot של 561/561, אבל:

~~~text
אסור hardcode ל-561
~~~

ה-universe דינמי.

GetSecuritiesData baseline שנבדק:

~~~text
chunk size: 187
sequential requests
~~~

זה baseline configurable, לא contract של provider.

Large requests נצפו מקבלים 403 בחלק מהגדלים; הסיבה/limit המדויקים עדיין Unknown. אין לעקוף WAF/access controls.

Data invariants:

~~~text
securityId = String(PaperId or Key)

null != 0 != ""

preserve full raw MapHeat in universe
preserve full raw Security in latest/history
~~~

MapHeat2 ו-GetSecuritiesData אינם atomic shared snapshot.

# 5. IndexedDB V1

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

History key:

~~~text
[cycleId, securityId]
~~~

Critical successful-cycle invariant:

~~~text
validated cycle
→ ONE IndexedDB transaction
   cycles + history + latest + meta
→ commit succeeds
→ only then recorder exposes completed/latest in memory
~~~

Failure invariant:

~~~text
API / validation / DB commit failure
→ no partial latest/history visibility
~~~

Failed cycles may persist diagnostics in:

~~~text
cycles + meta
~~~

but never partial `history` / `latest`.

# 6. מה כבר הושלם

השלבים הבאים הושלמו ונבדקו:

~~~text
Stage 1  Requirements + architecture
Stage 2  Data model / IndexedDB schema
Stage 3  Viewer UX plan
Stage 4  Test plan
Stage 5  IndexedDB module
Stage 6  Test infrastructure + IndexedDB self-tests
Stage 7  Recorder skeleton
Stage 8  Persistence integration
Stage 9  Recorder diagnostics
Stage 10 Viewer bootstrap
Stage 11 Current table from IndexedDB
~~~

Summary:

## Stage 1–4

נבנו:

- requirements;
- architecture;
- IndexedDB data model;
- Viewer UX;
- test plan;
- roadmap.

## Stage 5–6

נבנו:

- schema/open/upgrade/read/write IndexedDB helpers;
- browser self-tests;
- Playwright harness;
- Fast CI;
- Browser CI;
- sanitized mock infrastructure ל-MapHeat2 ו-GetSecuritiesData.

## Stage 7 — Recorder

נבנו:

- dynamic universe loader;
- chunk planning;
- single chunk fetch;
- complete-cycle builder;
- sequential no-overlap recorder loop;
- start/stop;
- in-memory latest/error state.

Stage 7 verification כלל Fast CI ו-Chromium.

## Stage 8 — Persistence

נבנו:

- pure persistence record contracts;
- session lifecycle persistence;
- universe persistence;
- atomic successful-cycle transaction;
- recorder success only after DB commit;
- rollback tests;
- session stop persistence.

Atomic transaction:

~~~text
cycles + history + latest + meta
~~~

## Stage 9 — Recorder diagnostics

נבנו:

- failed-cycle records;
- failedCycles / lastError;
- heartbeat;
- storage estimate;
- diagnostics API.

Heartbeat baseline:

~~~text
5 seconds
~~~

## Stage 10 — Viewer bootstrap

נבנה:

- named same-origin `about:blank` child viewer;
- Hebrew / RTL shell;
- BOOTING state;
- viewer-window reuse;
- shared IndexedDB origin proven in Chromium.

## Stage 11 — Current table

נבנה:

~~~text
IndexedDB.latest
+
IndexedDB.universe
join by securityId
~~~

ומוצגות 16 עמודות V1.

Display contract:

~~~text
null / undefined / "" → —
0                     → 0
~~~

Viewer states שכבר קיימים:

~~~text
BOOTING
EMPTY
MAIN
DETAIL
ERROR
~~~

Recorder health model:

~~~text
UNKNOWN
RUNNING
STALE
STOPPED
ERROR
~~~

# 7. המצב המדויק עכשיו — חשוב מאוד

לפי `STATUS.json`:

~~~text
Stages 1–11 complete

Stage 12 — Cross-tab live refresh
IN PROGRESS / NOT COMPLETE

Stage 13 has NOT started
~~~

אל תתחיל Stage 13 לפני שסגרת במפורש את Stage 12.

יש כבר implementation של Stage 12:

~~~text
messaging/
  channel.js
  pure/channel-message-logic.js

viewer/
  live-refresh.js
  current-table.js

recorder/
  recorder-loop.js

tests/automation/specs/
  viewer-live-refresh.spec.js
  viewer-current-table.spec.js
~~~

ויש גם technical evidence קיים:

~~~text
Fast CI
Run 35756792160
136 passed / 0 failed

Historical Viewer Checkpoint C
Run 35756990977
34 Chromium passed / 0 failed
~~~

אבל:

~~~text
ה-run הזה אינו stage closure.
Stage 12 נפתח מחדש בכוונה ב-STATUS.json.
~~~

לכן המשימה הראשונה בצ'אט החדש היא:

1. לקרוא `STATUS.json`, `AI_CONTEXT.md`, `HANDOFF.md`.
2. לקרוא את Stage 12 ב-`ROADMAP.md`.
3. לקרוא:
   - `docs/architecture.md`
   - `docs/viewer-ux.md`
   - `messaging/`
   - `viewer/live-refresh.js`
   - `viewer/current-table.js`
   - `recorder/recorder-loop.js`
   - `tests/automation/specs/viewer-live-refresh.spec.js`
4. להשוות implementation + tests ל-acceptance criteria.
5. אם יש gap — כתוב regression/behavior test קודם, תקן, Fast CI, ואז Browser CI אם נדרש.
6. אם אין gap אמיתי וה-acceptance criteria מכוסים — תעד זאת במפורש וסגור Stage 12 ב-`STATUS.json`.
7. רק אחר כך עבור ל-Stage 13.

Stage 12 acceptance intent:

~~~text
recorder commits cycle to IndexedDB
→ only after commit publish CYCLE_COMMITTED metadata
→ viewer receives notification
→ viewer re-reads IndexedDB
→ rerender

BroadcastChannel unavailable
→ viewer still opens
→ startup still loads DB
→ manual refresh still works
→ UI surfaces degraded live-refresh mode
~~~

BroadcastChannel name:

~~~text
market-flow-leumi-v1
~~~

Messages planned:

~~~text
CYCLE_COMMITTED
RECORDER_STARTED
RECORDER_STOPPED
RECORDER_ERROR
DATABASE_CLEARED
~~~

Heartbeat message may also exist in implementation; inspect current code rather than guessing.

# 8. איך לעבוד — זה חשוב לא פחות מהקוד

העבודה הקודמת נעשתה לפי העקרונות הבאים. תמשיך באותה רמה.

## Tests First

ל-feature חדש, כאשר מעשי:

~~~text
define externally meaningful behavior
→ write/update tests
→ implement
→ Fast CI
→ Browser CI only when due/needed
~~~

ל-bug:

~~~text
regression test
→ fix
→ keep regression test
~~~

אל תבדוק private/internal implementation details סתם.

בדוק public behavior/contracts:

- inputs/outputs;
- persistence effects;
- DOM behavior;
- failure semantics;
- cross-component behavior.

## Testing pyramid

~~~text
pure deterministic logic
→ Node unit tests

IndexedDB / DOM / BroadcastChannel / same-origin
→ Playwright / Chromium

real Leumi provider behavior
→ live verification only when mocks cannot prove it
~~~

Fast CI הוא feedback loop רגיל.

Browser CI הוא checkpoint, לא כל push.

Current policy:

~~~text
tests/TESTING_POLICY.md
~~~

## Browser checkpoints קדימה

~~~text
Checkpoint C
Stage 12 closure / Stages 10–12 viewer group

Checkpoint D
after Stages 14–15

Checkpoint E
after Stages 16–17

Checkpoint F
Stage 18 storage growth

Checkpoint G
Stage 19.1 full mocked V1 E2E

Stage 19.2
live Leumi verification

Stage 19.3
long-run live report

before Stage 20 freeze
Fast + full Browser CI + Stage 19 evidence
~~~

Early-browser run מותר רק אם באמת נוגעים ב-browser-only semantics, למשל:

- IndexedDB transaction;
- BroadcastChannel;
- DOM/window/origin;
- reload/recovery regression.

## CI workflow

Fast CI רץ אוטומטית.

Browser CI נשאר בדרך כלל:

~~~text
workflow_dispatch
workflow_call
~~~

אם אין tool ל-workflow dispatch וצריך checkpoint, השיטה שכבר עבדה בפרויקט הייתה:

1. temporary push trigger מוגבל לקובץ workflow עצמו;
2. push קטן שמפעיל Browser CI;
3. לקרוא run/jobs/logs;
4. לתקן אם נכשל;
5. להחזיר מיד את workflow ל-manual/reusable.

אל תשאיר Browser CI רץ על כל push.

## Git discipline

לפני write:

- fetch branch tip;
- fetch current file/SHA;
- אל תדרוס commit חדש.

העדף logical commit אחד ל-batch כשאפשר.

אם CI נכשל:

~~~text
read logs
→ understand actual failure
→ fix
→ rerun
→ only then report success
~~~

אל תסתיר failed run. הוא evidence שימושי.

## Documentation discipline

Normal batch:

~~~text
code
tests
STATUS.json
~~~

At meaningful boundary:

~~~text
component README
AI_CONTEXT.md if focus/working set changed
~~~

`ROADMAP.md` מתעד scope/order, לא operational completion.

אל תעדכן ROADMAP רק כדי לכתוב "complete".

Project milestone משמעותי:

~~~text
docs/project/current-state.md
~~~

# 9. השלבים שנותרו עד סוף V1

אחרי סגירה מפורשת של Stage 12, המשך לפי הסדר הבא.

---

## Stage 13 — Dynamic sorting

מטרה:

להוסיף sorting אינטראקטיבי לטבלה הראשית.

Default UX:

~~~text
Primary:
DailyDealsQuantity DESC

Tie-breaker:
paperName ASC
~~~

V1:

~~~text
single-column sorting only
~~~

Behavior:

Numeric/time column:

~~~text
first click  → DESC
second click → ASC
then toggle
~~~

String column:

~~~text
first click  → ASC
second click → DESC
then toggle
~~~

Indicator:

~~~text
▲ ASC
▼ DESC
~~~

Requirements:

- deterministic null-safe sorting;
- paperName ASC final tie-breaker;
- preserve sort state during live refresh;
- accessible sortable headers/keyboard;
- do not treat missing/null/empty/zero as the same internal value.

Testing:

- sorting algorithm → fast unit tests;
- add browser interaction tests where useful;
- normal Browser checkpoint is later, after Stages 14–15, unless a browser-specific regression justifies earlier run.

---

## Stage 14 — Security history drill-down

Main row click:

~~~text
open Security Detail View
~~~

אותו viewer tab/window, לא tab חדש.

שמר:

- current sort column;
- current sort direction;
- main-table scroll position.

Detail header צריך לכלול:

- Back;
- paper name;
- securityId;
- last rate;
- daily change;
- BID1 / ASK1;
- last deal.

History table source:

~~~text
IndexedDB.history
index bySecurityTime
security-specific only
~~~

Default:

~~~text
newest first
~~~

History columns לפי `docs/viewer-ux.md`.

Loading:

~~~text
initial 500 rows
button: טען ישנים יותר
~~~

אין infinite scroll ב-V1.

חשוב:

- history של security אחד לא יכול לדלוף לאחר;
- live cycle חדש לא מחזיר משתמש אוטומטית למסך הראשי;
- אם אותו security מתעדכן, ה-detail נשאר פתוח ומתעדכן.

---

## Stage 15 — Viewer diagnostics

ה-header/diagnostics צריך להציג לפחות:

~~~text
recorder status
lastCompletedAtMs
lastCompletedCycleId
latest cycle duration
security count
completedCycles
failedCycles
history size/count
storage estimate
~~~

Recorder states:

~~~text
רץ
לא מעודכן
נעצר
שגיאה
לא ידוע
~~~

Stale UX baseline:

~~~text
15 seconds without fresh heartbeat
~~~

זה UX threshold מקומי, לא API rule.

Freshness:

~~~text
עודכן לפני X שניות
~~~

Error surface:

- friendly Hebrew banner;
- timestamp;
- technical detail in console;
- no blocking alert for background errors.

Clear DB action:

~~~text
נקה את נתוני Market Flow מהמכשיר הזה
~~~

- explicit confirmation;
- no auto-clear.

אחרי Stages 14–15:

~~~text
Checkpoint D → Browser CI
~~~

---

## Stage 16 — Reload and recovery

בדוק ותמוך ב:

- viewer reload;
- viewer close/reopen;
- recorder continues independently;
- persisted state restored from IndexedDB;
- opening viewer after recorder already runs does not depend on historical BroadcastChannel messages;
- multiple viewers where practical;
- no corruption/loss of latest/history.

ה-viewer צריך לטעון את האמת מה-DB, לא להסתמך על in-memory state מהחלון הקודם.

---

## Stage 17 — Failure simulation

Mocked CI cases:

- failed API chunk;
- HTTP failure;
- invalid response structure;
- duplicate securities;
- missing securities;
- failed validation;
- DB write failure;
- stale recorder;
- BroadcastChannel degraded/unavailable;
- refresh/read failure.

בדוק:

- no partial latest/history;
- correct error/recorder status;
- last valid snapshot remains usable where appropriate;
- recovery path works;
- no silent corruption.

אחרי Stages 16–17:

~~~text
Checkpoint E → Browser CI
~~~

---

## Stage 18 — Storage growth test

מדוד בפועל:

~~~text
rows/minute
MB/minute
bytes/history-row
estimated hours before storage concern
~~~

השתמש ב-real browser storage semantics.

אין automatic retention ב-V1.

שמור report reproducible.

Stage 18 מקבל Browser checkpoint משלו.

---

## Stage 19 — Integrated V1 validation

### Stage 19.1 — Full mocked E2E

ב-GitHub Actions:

~~~text
Recorder
→ API mocks
→ validation
→ IndexedDB
→ BroadcastChannel
→ Viewer
→ current table
→ sorting
→ history
→ diagnostics
→ recovery/failure behavior
~~~

זה Checkpoint G.

CI חייב להיות ירוק לפני live verification.

### Stage 19.2 — Live Leumi browser verification

רק כאן בודקים behavior שתלוי באמת ב-provider/session.

בדוק:

- current MapHeat2 behavior;
- current GetSecuritiesData shape;
- real recorder persistence;
- real viewer behavior.

לכל ממצא משמעותי השתמש ב:

~~~text
Verified
Inferred
Unknown
~~~

אין להכניס ל-repository:

- cookies;
- tokens;
- auth headers;
- account data;
- private session dumps.

### Stage 19.3 — Long-run live report

הרץ recorder + viewer לאורך זמן משמעותי.

שמור report reproducible ליד ה-prototype.

בדוק:

- completed/failed cycles;
- memory/browser stability;
- storage growth;
- viewer refresh stability;
- long-run recovery behavior;
- unknowns שהתגלו.

---

## Stage 20 — V1 freeze

לפני freeze:

~~~text
Fast unit suite green
+
full Browser CI green
+
all required Stage 19 evidence recorded
~~~

Finalize:

- README;
- STATUS;
- verified behavior;
- known limitations;
- cleanup;
- version marker.

רק כאשר Stage 20 וכל V1 הושלמו לחלוטין, כתוב למשתמש בסוף:

~~~text
סיימתי
~~~

לא לכתוב `סיימתי` בסיום Stage 12/13/14 וכו'.

# 10. V2 — אל תכניס ל-V1

בכוונה מחוץ ל-V1:

~~~text
filtering
multi-column filters
saved filter presets
derived momentum metrics
charts
column chooser/reorder
retention policy
export/import
worker/background processing
advanced history queries
~~~

אל תרחיב scope ל-V2 לפני ש-V1 stable + verified.

# 11. Security

ה-repository ציבורי.

לעולם אל תכניס:

- cookies;
- session tokens;
- authorization headers;
- credentials;
- account numbers;
- private/personal data;
- sensitive raw dumps.

Mocks/fixtures חייבים להיות sanitized.

אין לעקוף WAF/access controls.

# 12. איך לדווח לי בכל batch

בסוף כל יחידת עבודה כתוב בקצרה:

1. מה יושם.
2. אילו files נוספו/שונו.
3. אילו tests נוספו.
4. Fast CI result.
5. Browser CI result אם היה checkpoint.
6. מה נשאר pending/unknown.
7. מה `STATUS.json` מצביע עליו עכשיו.

אם run נכשל לפני שעבר:

- ציין את הכשל;
- הסבר מה הוא חשף;
- תקן;
- ציין את ה-run הירוק הסופי.

# 13. איך להגיב לפקודת ההמשך שלי

כאשר אני כותב:

~~~text
תמשיך לשלב הבא
~~~

המשך מה-pointer האמיתי ב-`STATUS.json`.

בחר יחידת עבודה טבעית מבחינה הנדסית.

אין חובה לסיים stage שלם בהודעה אחת אם boundary קטן יותר נכון יותר.

אבל:

- אל תדלג על stage פתוח;
- אל תתחיל Stage 13 כל עוד Stage 12 פתוח;
- אל תכריז stage complete בלי verification הנדרש;
- אל תבקש ממני לבצע ידנית דברים שאתה יכול לבצע דרך GitHub/tools.

# 14. הפעולה הראשונה שלך בצ'אט החדש

עשה עכשיו:

~~~text
fetch main
→ read AGENTS.md
→ read local AI_CONTEXT.md
→ read local STATUS.json
→ read HANDOFF.md
→ inspect Stage 12 implementation + tests
→ determine exact remaining acceptance gap
→ complete/verify Stage 12
→ explicitly update STATUS.json
~~~

רק לאחר ש-Stage 12 סגור באופן מפורש, Stage 13 הוא השלב הבא.
