# Market Flow — Next Chat Prompt: Stage 8 Persistence Integration

הדבק את כל הקובץ הזה כהודעה הראשונה בצ'אט החדש.

---

אתה ממשיך פיתוח קיים ב-repository:

~~~text
LirazShay/market-flow
branch: main
~~~

עבוד ישירות על ה-repository דרך GitHub tools. אל תסתפק בהמלצות או snippets כאשר אפשר לבצע את העבודה בפועל.

## לפני כל שינוי

קודם fetch את `main` הנוכחי. ה-snapshot שמופיע כאן הוא handoff בלבד; אם ה-repository התקדם מאז, ה-repository גובר.

Snapshot בזמן הכנת handoff:

~~~text
main HEAD:
7662cec0cc77198a70eb8cff6ea344ce32a59ee6
~~~

## קריאה ראשונית — בסדר הזה

קרא:

~~~text
/AGENTS.md

scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
    README.md
    STATUS.json
    AI_CONTEXT.md
    HANDOFF.md
    ROADMAP.md              # קרא בעיקר את Stage 8

    docs/
        data-model.md        # stores + record shapes + T2/T3/T4/T5/T6
        architecture.md      # persistence success boundary

    storage/
        README.md
        schema.js
        connection.js
        upgrade.js
        read.js
        write.js

    recorder/
        pure/recorder-loop-logic.js
        recorder-loop.js
        universe-loader.js
        cycle-builder.js

    tests/
        TESTING_POLICY.md
        README.md
        unit/
        automation/
~~~

אל תקרא את כל ה-repository ללא צורך.

## מצב מאומת בזמן handoff

~~~text
Stages 1–7: complete
Stage 8: next — Persistence integration
~~~

Stage 7 עבר:

~~~text
Fast CI:
Run 35744733541
104 passed / 0 failed

Browser CI:
Run 35744806678
13 passed / 0 failed
Chromium
~~~

Stage 7 כבר מספק:

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ validated complete in-memory cycle
→ recorder start/stop loop
→ no-overlap scheduling
→ latest/error state in memory
~~~

אין עדיין חיבור מלא של recorder ל-persistence.

## Stage 8 — היעד

Stage 8 מוגדר ב-`ROADMAP.md` כך:

~~~text
8.1 Persistence record builders/contracts

8.2 Session + universe persistence

8.3 Atomic successful-cycle transaction

8.4 Recorder integration
    + persistence failure/rollback tests
~~~

המשתמש מעדיף להתקדם ביחידות עבודה **טבעיות**. אין חובה לסיים את כל Stage 8 בהודעה אחת. בחר boundary הנדסי/בדיקתי טוב, השלם אותו, אמת אותו, ועדכן `STATUS.json`.

## הדבר הראשון שכדאי לבצע

אם `STATUS.json` עדיין מצביע על Stage 8 בתחילתו, התחל ב-**8.1 — Persistence record builders/contracts**.

Tests First:

1. הגדר את ה-contracts החיצוניים של mapping מ:
   - loaded universe;
   - validated complete cycle;
   - recorder/session state;
   אל record shapes של IndexedDB.
2. כתוב fast unit tests קודם.
3. רק אז כתוב את pure deterministic record-building logic.
4. אל תפתח IndexedDB בשביל 8.1; זה צריך להיות logic שקל לבדוק ב-Node.
5. הרץ Fast CI.
6. אם ירוק, עדכן `STATUS.json` לנקודה המדויקת שאליה הגעת.

מיקום טבעי אפשרי:

~~~text
storage/pure/
    persistence-records.js
~~~

וטסטים:

~~~text
tests/unit/persistence-records.test.js
~~~

אבל אל תיצור abstraction רק בשביל השם; אם מבנה repository הנוכחי מצביע על מיקום פשוט יותר, השתמש בו.

## Contracts ש-8.1 צריך להגן עליהם

### Universe record

לכל MapHeat record:

~~~text
{
  securityId: String(PaperId),
  paperName,
  updatedAtMs,
  mapHeatDateChange,
  rawMapHeat
}
~~~

שמור את `rawMapHeat` המלא.

### Successful cycle record

לפי `docs/data-model.md`:

~~~text
{
  sessionId,
  status: "complete",
  startedAtMs,
  completedAtMs,
  durationMs,
  requested,
  received,
  unique,
  missing,
  duplicates,
  chunks
}
~~~

`cycleId` מתקבל מ-IndexedDB autoIncrement ולכן לא מומצא ב-pure builder לפני ה-add transaction.

### History/latest rows

לכל security ב-cycle:

~~~text
{
  cycleId,
  sessionId,
  securityId,
  chunkIndex,
  cycleStartedAtMs,
  chunkReceivedAtMs,
  collectedAtMs,
  serverAsOfDate,
  data
}
~~~

`data` חייב להיות כל raw `Security` object.

`latest` משתמש באותו logical shape ונדרס לפי `securityId`.

### Session/meta

אל תמציא fields מעבר ל-`docs/data-model.md`. אם contract דורש החלטה לא מתועדת, עצור והעדכן decision/design בצורה מפורשת במקום לנחש.

## Stage 8 invariants קריטיים

### 1. Atomic full-cycle commit

Successful cycle חייב להיכתב ב-transaction אחד על:

~~~text
cycles
history
latest
meta
~~~

אסור לעשות:

~~~text
write.put(cycles)
await ...
write.put(history)
await ...
write.put(latest)
...
~~~

כי ה-generic helpers ב-`storage/write.js` פותחים transaction נפרד לכל call.

צריך Stage 8 transaction ייעודי multi-store.

### 2. DB commit לפני in-memory success

ה-boundary חייב להיות:

~~~text
validated complete cycle
→ IndexedDB transaction commits successfully
→ only then recorder increments completedCycles
→ only then recorder exposes latestCycle
→ later BroadcastChannel notification
~~~

DB failure צריך להיכנס למסלול recorder failure.

### 3. No partial visibility

אם API/validation/DB commit נכשל:

~~~text
no partial history
no partial latest
no complete cycle visible
~~~

### 4. Session first

לפני persisted cycles/history חייב להיות `sessionId` תקין.

Stage 8.2 אחראי ל-session start/stop persistence ול-universe persistence המינימלי שנדרש לפי data model.

### 5. Preserve data exactly

~~~text
null != 0 != ""
~~~

אין falsy normalization.

אין hardcode ל-561.

אין הנחה שיש בדיוק 3 chunks.

## Testing policy

Tests צריכים להגן על observable contracts, לא private implementation.

~~~text
8.1 pure mapping/contracts
→ Fast unit tests

8.2/8.3 IndexedDB transaction semantics
→ real Chromium tests

8.4 recorder↔DB integration / rollback
→ Playwright Chromium checkpoint
~~~

Stage 8 אינו complete עד ש-**Browser CI checkpoint** עובר.

אל תשתמש ב-live Leumi בשביל Stage 8 CI.

## Browser checkpoint של Stage 8 חייב להוכיח

- session creation/binding.
- universe persistence.
- successful atomic cycle commit.
- one cycleId used consistently in cycle/history/latest/meta.
- history grows while latest remains one row/security.
- second successful cycle replaces latest but preserves old history.
- injected transaction failure rolls everything back.
- DB commit failure is surfaced as recorder failure.
- failed API/validation cycle does not modify latest/history.
- raw Security fields survive round-trip.
- raw MapHeat fields survive round-trip.
- `null`, `0`, `""` survive correctly.

## Existing schema

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

Canonical security ID:

~~~text
String(PaperId or Key)
~~~

## Development rules

- tests first whenever practical;
- preserve verified Stage 7 behavior;
- prefer small coherent changes over rewrite;
- Fast CI on normal deterministic changes;
- Chromium only when browser semantics/checkpoint require it;
- inspect failure logs and fix before reporting success;
- update `STATUS.json` every meaningful implementation batch;
- update `AI_CONTEXT.md` only if focus/invariants/working set materially change;
- update `ROADMAP.md` only if plan/scope/order change;
- no credentials/session/private data in the public repo.

## Reporting

בסוף כל יחידת עבודה כתוב:

- מה יושם;
- אילו tests נוספו;
- Fast/Browser CI result;
- מה עדיין נשאר ב-Stage 8;
- מה ה-pointer הנוכחי ב-`STATUS.json`.

אל תתחיל Stage 9 לפני ש-Stage 8 כולו הושלם ו-Browser CI checkpoint שלו ירוק.

המילה `סיימתי` שמורה רק לסיום כל V1/process המתוכנן, לא לסיום יחידת עבודה או Stage 8.
