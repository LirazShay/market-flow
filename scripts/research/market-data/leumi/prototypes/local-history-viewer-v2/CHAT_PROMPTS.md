# Market Flow — Browser SQL V2 — Copy/Paste Prompts for 12 Serial Chats

These prompts are launchers, not live status. Before doing work, every prompt validates the current GitHub main + STATUS.json and defers to the live Issue.

Stable boundaries: CHAT_EXECUTION_PLAN.md
Live pointer: STATUS.json

Do not edit a prompt to force progress past a red/pending entry gate.

## Chat 01 — C01 / #73

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 01 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C01 / GitHub Issue #73 — Authenticated DuckDB feasibility.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #73 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
התכנון הסופי קפוא וירוק, Issue #72 סגור, ו-STATUS.json מצביע על C01/#73.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C01/#73, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
להוכיח L-1 על authenticated Leumi origin עם ה-runtime המדויק שכבר נבחר: Blob Worker, pinned Worker/Wasm, probe-only OPFS, synthetic write/COMMIT, close/reopen/readback ו-cleanup.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Fast/build/probe guards לפי ה-Issue; Chromium probe אם נגעת בו; authenticated sanitized L-1 PASS.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #73 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C02 / #74;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 01/12 + C01/#73;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 02 — C02 / #74

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 02 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C02 / GitHub Issue #74 — Minimum SQL runtime and schema.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #74 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C01/#73 סגור וירוק, ו-STATUS.json מצביע על C02/#74.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C02/#74, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לבנות את ה-production-shaped SQL authority המינימלי: Runtime Controller יחיד, SQL Worker יחיד, production OPFS DB identity, minimum schema, runtime/build identity נפרד מ-storage compatibility, readiness ו-incompatible-storage blocking ללא reset.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Node ללוגיקה טהורה + Chromium Worker/Wasm/OPFS + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #74 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C03 / #75;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 02/12 + C02/#74;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 03 — C03 / #75

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 03 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C03 / GitHub Issue #75 — Atomic persistence and durability.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #75 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C02/#74 סגור וירוק, ו-STATUS.json מצביע על C03/#75.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C03/#75, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לממש persistence אטומי של complete validated cycle, coherence של authority שנבחרה, raw fidelity, failure-before-commit semantics, reopen/durability boundary, ורק אם הראיות דורשות — retry/idempotency מינימלי.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Node deterministic pieces + Chromium transaction/fault/reopen + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #75 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C04 / #76;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 03/12 + C03/#75;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 04 — C04 / #76

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 04 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C04 / GitHub Issue #76 — Recorder integration and trusted reads.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #76 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C03/#75 סגור וירוק, ו-STATUS.json מצביע על C04/#76.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C04/#76, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לחבר את V1 provider/validation path ל-SQL authority ולחשוף trusted semantic reads קטנים ל-current universe/current security/bounded history/readiness, עם committed-only visibility ו-notification-as-hint.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Collector characterization רק אם חסר + Chromium Recorder→SQL→trusted-read + dropped-notification reread + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #76 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C05 / #77;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 04/12 + C04/#76;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 05 — C05 / #77

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 05 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C05 / GitHub Issue #77 — Current Universe on SQL.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #77 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C04/#76 סגור וירוק, ו-STATUS.json מצביע על C05/#77.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C05/#77, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
להעביר את Current Universe ל-trusted SQL reads תוך שמירת public V1 behavior הרלוונטי: membership, values, sort/ties, missing/empty/zero, EMPTY vs ERROR, reload/refresh, no provider call, canonical SecurityId navigation.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Chromium Current parity/public-behavior regressions + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #77 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C06 / #78;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 05/12 + C05/#77;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 06 — C06 / #78

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 06 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C06 / GitHub Issue #78 — Security Detail/History + L-2.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #78 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C05/#77 סגור וירוק, ו-STATUS.json מצביע על C06/#78.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C06/#78, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
להעביר Security Detail/History ל-SQL, לסגור paging/lifecycle/navigation parity, להריץ Current→Detail→Back regression, ואז bounded authenticated single-tab L-2: real provider→validation→SQL→trusted read.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

CONDITIONAL מיוחד לצ'אט הזה:
O6 בלבד אם נשארת אי-ודאות live מהותית ומוגדרת שלא נפתרה ע״י deterministic parity + L-2; הצ'אט נשאר פתוח עד rejoin ירוק.

VERIFICATION הצפוי:
Chromium Detail/history/lifecycle + shared navigation regression + full Browser CI + sanitized authenticated L-2 PASS.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #78 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C07 / #79;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 06/12 + C06/#78;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 07 — C07 / #79

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 07 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C07 / GitHub Issue #79 — Real analytical SQL evidence.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #79 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C05/#77 ו-C06/#78 סגורים וירוקים, ו-STATUS.json מצביע על C07/#79.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C07/#79, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לקבע מראש representative query corpus + day-sized workload, להוכיח correctness, למדוד באותו workload, ולהחליט evidence-first האם dynamic SQL מספיק או שנדרש optimization ממוקד. אין להמציא final trading formula.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

CONDITIONAL מיוחד לצ'אט הזה:
O1 רק אם query חשוב הוכח material slow/awkward; בצע את האופטימיזציה הקטנה ביותר, remeasure, rerun affected contracts, ורק אז סגור.

VERIFICATION הצפוי:
Deterministic query correctness + focused Chromium/DuckDB measurement + Fast CI; Browser CI רק אם surface browser/SQL השתנה.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #79 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C08 / #80;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 07/12 + C07/#79;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 08 — C08 / #80

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 08 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C08 / GitHub Issue #80 — Safe Scanner core.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #80 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C05/C06 סגורים; בסדר הסדרתי גם C07 סגור; STATUS.json מצביע על C08/#80.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C08/#80, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לבנות Scanner core מינימלי ובטוח: draft לא מריץ, validated Activate, failed Activate שומר active קודם, exact-engine read-only safety, committed reads, one execution at a time, no burst replay, attribution, isolated errors, restart פשוט, collector cadence בלתי תלוי.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Node pure state logic לפי צורך + Chromium exact-engine safety corpus/hardening + timing/no-overlap/race/restart + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #80 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C09 / #81;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 08/12 + C08/#80;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 09 — C09 / #81

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 09 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C09 / GitHub Issue #81 — Scanner UI and truthful results.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #81 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C08/#80 סגור וירוק, ו-STATUS.json מצביע על C09/#81.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C09/#81, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לבנות את Scanner כ-surface שלישי: editor/interval/Activate, runtime-authoritative active state, dynamic truthful result grid, type fidelity, zero rows vs error, truthful truncation, result/config attribution, isolation מ-provider/Recorder/Current/Detail.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

CONDITIONAL מיוחד לצ'אט הזה:
O3 רק אם representative materialization הוכח unsafe/unusable; הצ'אט נשאר owner עד streaming/chunking מינימלי ו-regressions ירוקים.

VERIFICATION הצפוי:
Chromium UI/result/type/resync/attribution/result-size/isolation + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #81 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C10 / #82;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 09/12 + C09/#81;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 10 — C10 / #82

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 10 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C10 / GitHub Issue #82 — One production owner.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #82 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C02 כבר סגור; בסדר הסדרתי C03-C09 גם סגורים; STATUS.json מצביע על C10/#82.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C10/#82, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לעטוף את runtime הסופי ב-canonical exclusive Web Lock: same-tab singleton reuse, fail-fast independent-tab acquisition, passive loser, teardown-before-release, reacquire/readiness, בלי heartbeat/election/steal/fallback.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Chromium multi-page race/passive loser/relaunch/hidden owner/capability failure/diagnostic-only/teardown/reacquire + Fast CI + full Browser CI.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #82 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C11 / #83;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 10/12 + C10/#82;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 11 — C11 / #83

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 11 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C11 / GitHub Issue #83 — Representative daily mixed workload.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #83 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C07/#79, C09/#81 ו-C10/#82 סגורים; כל conditional מוקדם חזר לבעלים; STATUS.json מצביע על C11/#83.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C11/#83, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לקבע workload parameters מראש ואז להריץ collection + SQL persistence + Current/Detail + representative Scanner + one-owner runtime יחד; למדוד integrity/backlog/overlap/memory/storage/reopen בלי post-hoc thresholds.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

CONDITIONAL מיוחד לצ'אט הזה:
O2/O3/O4/O5 רק לפי trigger מתועד. כולם נשארים תחת Chat 11 עד affected regressions + C11 rerun ירוקים.

VERIFICATION הצפוי:
Deterministic integrated Chromium workload + exact cycle counters + Fast CI + full Browser CI; target Windows/Chrome רק אם O5 מופעל.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #83 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- STATUS.json עודכן ומצביע על C12 / #84;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 11/12 + C11/#83;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

## Chat 12 — C12 / #84

Copy everything inside the block into a new fresh chat.

~~~text
אני Chat 12 מתוך 12 של Browser SQL V2 ב-repository:

LirazShay/market-flow
branch: main

ה-owner שלי הוא C12 / GitHub Issue #84 — Authenticated production transition.

עבוד ישירות על ה-repository. ברירת המחדל לתשובות היא עברית; code/identifiers יכולים להישאר באנגלית.

לפני כל שינוי:
1. Fetch את main.
2. קרא AGENTS.md.
3. קרא:
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
   scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/CHAT_EXECUTION_PLAN.md
4. Fetch וקרא את Issue #84 העדכני.
5. קרא רק את הקוד, specs וה-tests שנוגעים ישירות לעבודה שלי.

GitHub main הוא מקור האמת. STATUS.json הוא מקור האמת היחיד ל-live progress/current/next.

ENTRY GATE שלי:
C11 סגור על final candidate; Fast + full Browser CI ירוקים; L-1/L-2 עדיין תקפים; old IndexedDB rollback release מזוהה; STATUS.json מצביע על C12/#84.

לפני implementation אמת את ה-entry gate מול GitHub. אם STATUS.json לא מצביע על C12/#84, אל תנחש ואל תתחיל implementation מהפרומפט הזה. פרומפט stale לעולם לא גובר על STATUS.json. אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible. בדוק האם יש עבודה קודמת פעילה/pending, prompt לא נכון, או סתירה אמיתית בריפו. רק אם GitHub עצמו סותר את כללי ה-source-of-truth, תקן את הסתירה לפי ownership; אחרת עצור ודווח מה חוסם.

המטרה המרכזית של הצ'אט:
לבצע no-overlap authenticated production transition: stop/settle old Recorder, preserve legacy IndexedDB, real-origin two-tab canonical Web Lock, fresh production OPFS/readiness, begin SQL recording, bounded provider verification, Current/Detail + representative Scanner, first production cycles/readback, accept cutover או explicit rollback.

ה-Issue החי הוא executable authority לפרטים. אל תחליף אותו בניסוח המקוצר שבפרומפט הזה.

עבוד לפי:
observable contract → tests/proof first כאשר מעשי → implementation → focused verification → required CI/live proof.

אל תבדוק private implementation details ללא צורך. שמור על KISS, data integrity, security וכל invariants ב-AGENTS/AI_CONTEXT.

DISCOVERY PROTOCOL:
אם מתגלה משהו תוך כדי, אל תדחוף אותו אוטומטית לצ'אט הבא.
- defect שחוסם correctness/integrity/security/acceptance/verification → נשאר אצלי; regression/proof כשמעשי; תקן; rerun affected verification.
- O1..O6 → רק אם trigger המדויק בתכנון הופעל; נשאר באותו chat עד rejoin ירוק.
- plan/design שגוי שהראיות מפריכות → עצור coding forward, תקן Issue/Decision/ROADMAP/CHAT_EXECUTION_PLAN/STATUS לפי ownership, ואז המשך באותו chat.
- improvement עתידי שאינו חוסם באמת → תעד במקום durable מתאים בלי לשנות live pointer.
- debug observation ללא משמעות durable → אל תזהם STATUS/HOT context.

VERIFICATION הצפוי:
Fast + full Browser CI + C11 evidence + authenticated no-overlap self-verifier + real two-tab ownership + exact first-cycle integrity + final security/static/docs checks.

STATUS FLOW:
- בתחילת יחידת עבודה משמעותית: in-progress.
- implementation complete אבל verification חסר: verification-pending.
- רק אחרי verification ירוק: complete/close Issue והעבר current pointer.

אל תפתח/תתחיל את הצ'אט הבא בעצמך. אני אפתח אותו בנפרד.

EXIT GATE:
לפני שאתה רשאי לסגור את הצ'אט:
- Issue #84 סגור;
- כל required verification ירוק;
- כל blocking discovery/conditional חזר ל-owner ונסגר;
- C12 ו-Master #85 נסגרו, ו-STATUS.json עבר ל-post-release/normal-operation pointer שמוגדר ע"י מצב הריפו לאחר הקאטאובר; אל תמציא Chat 13, feature חדש או Issue חדש רק כדי למלא next pointer. אם אין עבודה מתוכננת נוספת, רשום state תפעולי יציב ואמיתי במקום להמציא המשך;
- אין verification-pending;
- אין החלטה מהותית שנשארה רק בטקסט של הצ'אט;
- נוקה scaffolding זמני שאין לו תפקיד durable.

בדיווח הסופי כתוב בקצרה:
- Chat 12/12 + C12/#84;
- מה יושם;
- files ששונו;
- tests שנוספו/שונו;
- Fast CI;
- Browser CI אם רלוונטי;
- live verification אם רלוונטי;
- disposition של discoveries/conditionals;
- Issue שנסגר;
- ה-next pointer ב-STATUS.json.

רק אם כל ה-EXIT GATE אמיתי בגיטהאב, כתוב בשורה האחרונה בדיוק:
סיימתי

אם משהו עדיין pending/failed/blocked — אל תכתוב את מילת הסיום, השאר את STATUS אמיתי והמשך לטפל בזה באותו chat.
~~~

