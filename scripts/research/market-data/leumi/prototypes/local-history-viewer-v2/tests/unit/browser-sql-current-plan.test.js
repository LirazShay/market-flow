"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const repositoryRoot =
    path.resolve(
        __dirname,
        ...Array(8).fill("..")
    );

const workstreamRoot =
    path.join(
        repositoryRoot,
        "scripts",
        "research",
        "market-data",
        "leumi",
        "prototypes",
        "local-history-viewer-v2"
    );

function readRepository(relativePath) {
    return fs.readFileSync(
        path.join(
            repositoryRoot,
            relativePath
        ),
        "utf8"
    );
}

function readWorkstream(relativePath) {
    return fs.readFileSync(
        path.join(
            workstreamRoot,
            relativePath
        ),
        "utf8"
    );
}

test(
    "D-044 is the current Browser SQL implementation baseline and old planning decisions are superseded",
    () => {
        const decisionIndex =
            readRepository(
                "docs/project/decisions.md"
            );

        const d044 =
            readRepository(
                "docs/project/decisions/D-044.md"
            );

        const d037 =
            readRepository(
                "docs/project/decisions/D-037.md"
            );

        const d042 =
            readRepository(
                "docs/project/decisions/D-042.md"
            );

        assert.match(
            decisionIndex,
            /D-044[\s\S]*Accepted/
        );

        assert.match(
            d044,
            /one Master plus C01\.\.C12 executable Issues/
        );

        assert.match(
            d037,
            /Status:\s*Superseded by D-044 for initial V2/i
        );

        assert.match(
            d042,
            /Status:\s*Superseded by D-044 for initial V2/i
        );
    }
);

test(
    "ROADMAP points to the materialized compact graph",
    () => {
        const roadmap =
            readWorkstream(
                "ROADMAP.md"
            );

        assert.match(
            roadmap,
            /Master #85/
        );

        const expected =
            new Map([
                ["C01", "#73"],
                ["C02", "#74"],
                ["C03", "#75"],
                ["C04", "#76"],
                ["C05", "#77"],
                ["C06", "#78"],
                ["C07", "#79"],
                ["C08", "#80"],
                ["C09", "#81"],
                ["C10", "#82"],
                ["C11", "#83"],
                ["C12", "#84"]
            ]);

        for (const [id, issue] of expected) {
            assert.match(
                roadmap,
                new RegExp(
                    id + "[\\s\\S]{0,80}" + issue.replace("#", "\\#")
                ),
                "ROADMAP lost materialized mapping " + id + " → " + issue
            );
        }

        assert.equal(
            /implementation entry\s*=\s*WP-|WP-01\.\.WP-42|8 implementation milestones\s*\n42 executable work packages/i.test(
                roadmap
            ),
            false,
            "ROADMAP must not present the historical 42-WP graph as current."
        );
    }
);

test(
    "current execution map contains the exact materialized graph and marks the old graph historical",
    () => {
        const executionMap =
            readWorkstream(
                "docs/browser-sql-github-execution-structure.md"
            );

        assert.match(
            executionMap,
            /#85 — \[Browser SQL\]\[V2\] Compact implementation master/
        );

        const rows = [
            ["C01", "73", "completed evidence #29, #30"],
            ["C02", "74", "#73"],
            ["C03", "75", "#74"],
            ["C04", "76", "#75"],
            ["C05", "77", "#76"],
            ["C06", "78", "#76"],
            ["C07", "79", "#77, #78"],
            ["C08", "80", "#77, #78"],
            ["C09", "81", "#80"],
            ["C10", "82", "#74"],
            ["C11", "83", "#79, #81, #82"],
            ["C12", "84", "#83"]
        ];

        for (const [id, issue, predecessorText] of rows) {
            const rowPattern =
                new RegExp(
                    "\\| " +
                    id +
                    " \\| #" +
                    issue +
                    " \\|[\\s\\S]{0,180}\\| " +
                    predecessorText
                        .replaceAll("#", "\\#")
                        .replaceAll(",", "\\,") +
                    " \\|"
                );

            assert.match(
                executionMap,
                rowPattern,
                "execution map lost direct dependency row for " + id
            );
        }

        assert.match(
            executionMap,
            /The pre-KISS Master #20 \/ Epics #21\.\.#28 \/ WP graph #29\.\.#71 is historical/
        );
    }
);

test(
    "conditional work is not a standing execution graph",
    () => {
        const roadmap =
            readWorkstream(
                "ROADMAP.md"
            );

        const executionMap =
            readWorkstream(
                "docs/browser-sql-github-execution-structure.md"
            );

        assert.match(
            roadmap,
            /No standing Issues exist for these paths/
        );

        assert.match(
            executionMap,
            /No placeholder Issues exist for O1\.\.O6/
        );
    }
);

test(
    "current Browser SQL navigation keeps old decomposition historical and freezes the post-KISS plan",
    () => {
        const decomposition =
            readWorkstream(
                "docs/browser-sql-implementation-decomposition.md"
            );

        const freeze =
            readWorkstream(
                "docs/browser-sql-final-planning-freeze.md"
            );

        const nextPrompt =
            readWorkstream(
                "NEXT_CHAT_PROMPT.md"
            );

        assert.match(
            decomposition,
            /Superseded for current initial V2 by D-044/i
        );

        assert.match(
            freeze,
            /Post-KISS Final Planning Freeze/i
        );

        assert.match(
            freeze,
            /Chat 01 ↔ C01\/#73[\s\S]*Chat 12 ↔ C12\/#84/i
        );

        assert.match(
            freeze,
            /planning Issue #72 is closed/i
        );

        assert.match(
            freeze,
            /STATUS\.json[\s\S]{0,80}points to Chat 01 \/ C01 \/ #73/i
        );

        assert.match(
            freeze,
            /Do not keep a bad plan merely because it was frozen/i
        );

        assert.match(
            nextPrompt,
            /Start \*\*Chat 01 of 12\*\*/i
        );

        assert.match(
            nextPrompt,
            /CHAT_PROMPTS\.md/
        );

        assert.match(
            nextPrompt,
            /planning Issue #72 is closed/i
        );

        assert.match(
            nextPrompt,
            /STATUS\.json[\s\S]{0,80}points to Chat 01 \/ C01 \/ #73/i
        );
    }
);

test(
    "Browser SQL testing policy uses the compact live-boundary semantics",
    () => {
        const policy =
            readWorkstream(
                "tests/TESTING_POLICY.md"
            );

        for (
            const requiredText of
            [
                "C01 — mandatory implementation-entry live premise",
                "Real-origin Web Lock proof is **not** an early C01 blocker",
                "C06 / L-2",
                "C12",
                "Integrated Daily Workload"
            ]
        ) {
            assert.equal(
                policy.includes(
                    requiredText
                ),
                true,
                "Testing policy lost compact Browser SQL rule: " +
                    requiredText
            );
        }

        for (
            const obsoleteText of
            [
                "Local History Viewer V2 WP-03 POC CI",
                "any numbered V2 Stage closure",
                "dedicated performance benchmark plan"
            ]
        ) {
            assert.equal(
                policy.includes(
                    obsoleteText
                ),
                false,
                "Testing policy still contains obsolete Browser SQL planning text: " +
                    obsoleteText
            );
        }
    }
);

test(
    "C01 live runbook excludes provider calls and early real-origin Web Lock proof",
    () => {
        const runbook =
            readWorkstream(
                "docs/browser-sql-live-gate-l1.md"
            );

        assert.match(
            runbook,
            /C01 \/ GitHub Issue #73/
        );

        assert.match(
            runbook,
            /does \*\*not\*\* call Leumi provider APIs/i
        );

        assert.match(
            runbook,
            /Cross-tab Web Locks are \*\*not\*\* part of C01/i
        );

        assert.match(
            runbook,
            /does \*\*not\*\* define production CHECKPOINT cadence/i
        );
    }
);


test(
    "HOT/WARM guidance preserves the audited post-KISS live and CI boundaries",
    () => {
        const agents =
            readRepository(
                "AGENTS.md"
            );

        const aiContext =
            readWorkstream(
                "AI_CONTEXT.md"
            );

        const testingPolicy =
            readWorkstream(
                "tests/TESTING_POLICY.md"
            );

        const specsIndex =
            readWorkstream(
                "specs/README.md"
            );

        const targetArchitecture =
            readWorkstream(
                "docs/browser-sql-target-architecture.md"
            );

        assert.equal(
            agents.includes(
                "every numbered Stage closure"
            ),
            false,
            "Repository guidance must not require Browser CI solely because a planning Stage is numbered."
        );

        assert.match(
            agents,
            /docs\/planning-only or pure Node-only work does not require Browser CI/i
        );

        assert.match(
            aiContext,
            /controlled single-tab real provider[\s\S]*not cross-tab production-ownership evidence/i
        );

        assert.match(
            aiContext,
            /one no-overlap authenticated release transition/i
        );

        assert.match(
            testingPolicy,
            /C06 \/ L-2[\s\S]*controlled single-tab real provider/i
        );

        assert.match(
            testingPolicy,
            /C12[\s\S]*old Recorder settled\/stopped[\s\S]*representative Scanner verification/i
        );

        assert.match(
            specsIndex,
            /D-044\.md/
        );

        assert.match(
            specsIndex,
            /browser-sql-compact-issue-specifications\.md/
        );

        assert.match(
            targetArchitecture,
            /normal transition has no old\/new production-authority overlap/i
        );
    }
);


test(
    "legacy-looking Browser SQL manuals are visibly reference-only and current runbooks use audited ownership timing",
    () => {
        const referenceOnlyDocs = [
            "docs/browser-sql-rebaseline-dependency-dag.md",
            "docs/browser-sql-self-verifying-live-gates-plan.md",
            "docs/browser-sql-v1-on-sql-implementation-manual.md",
            "docs/browser-sql-v1-parity-verification-plan.md",
            "docs/browser-sql-v1-on-sql-checkpoint.md",
            "docs/browser-sql-enrichment-implementation-manual.md",
            "docs/browser-sql-enrichment-benchmark-plan.md",
            "docs/browser-sql-enrichment-integration-plan.md",
            "docs/browser-sql-scanner-implementation-manual.md",
            "docs/browser-sql-scanner-verification-plan.md"
        ];

        for (const relativePath of referenceOnlyDocs) {
            const content =
                readWorkstream(
                    relativePath
                );

            assert.match(
                content,
                /Reference-only \/ superseded/i,
                relativePath +
                    " must not look like current executable guidance."
            );
        }

        const docsIndex =
            readWorkstream(
                "docs/README.md"
            );

        assert.match(
            docsIndex,
            /Current Browser SQL authorities table/i
        );

        assert.match(
            docsIndex,
            /reference\/evidence only/i
        );

        const c01Runbook =
            readWorkstream(
                "docs/browser-sql-live-gate-l1.md"
            );

        assert.match(
            c01Runbook,
            /C12 \/ #84 no-overlap release transition[\s\S]*old IndexedDB Recorder is settled\/stopped[\s\S]*before SQL production recording is accepted/i
        );
    }
);


test(
    "12 serial chat prompts map exactly to C01-C12 and cannot self-advance stale STATUS",
    () => {
        const prompts =
            readWorkstream(
                "CHAT_PROMPTS.md"
            );

        const plan =
            readWorkstream(
                "CHAT_EXECUTION_PLAN.md"
            );

        const readme =
            readWorkstream(
                "README.md"
            );

        const headings =
            Array.from(
                prompts.matchAll(
                    /^## Chat (\d{2}) — (C\d{2}) \/ #(\d+)$/gm
                )
            );

        assert.equal(
            headings.length,
            12,
            "CHAT_PROMPTS.md must contain exactly 12 planned chat prompts."
        );

        for (let index = 0; index < 12; index += 1) {
            const chatNumber =
                String(index + 1)
                    .padStart(2, "0");

            const cId =
                "C" +
                chatNumber;

            const issue =
                String(73 + index);

            const heading =
                headings[index];

            assert.deepEqual(
                [
                    heading[1],
                    heading[2],
                    heading[3]
                ],
                [
                    chatNumber,
                    cId,
                    issue
                ],
                "Unexpected Chat/Cxx/Issue mapping at position " +
                    String(index + 1)
            );

            const start =
                heading.index;

            const end =
                index + 1 < headings.length
                    ? headings[index + 1].index
                    : prompts.length;

            const block =
                prompts.slice(
                    start,
                    end
                );

            assert.match(
                block,
                new RegExp(
                    "אני Chat " +
                    chatNumber +
                    " מתוך 12"
                )
            );

            assert.match(
                block,
                new RegExp(
                    "ה-owner שלי הוא " +
                    cId +
                    " \/ GitHub Issue #" +
                    issue
                )
            );

            assert.match(
                block,
                /Fetch את main/
            );

            assert.match(
                block,
                /STATUS\.json הוא מקור האמת היחיד ל-live progress\/current\/next/
            );

            assert.match(
                block,
                /פרומפט stale לעולם לא גובר על STATUS\.json/
            );

            assert.match(
                block,
                /אל תשנה STATUS רק כדי להפוך את הפרומפט ל-eligible/
            );

            assert.match(
                block,
                /ה-Issue החי הוא executable authority לפרטים/
            );

            assert.match(
                block,
                /DISCOVERY PROTOCOL/
            );

            assert.match(
                block,
                new RegExp(
                    "Issue #" +
                    issue +
                    " סגור"
                )
            );

            assert.match(
                block,
                /אין verification-pending/
            );

            assert.match(
                block,
                /רק אם כל ה-EXIT GATE אמיתי בגיטהאב/
            );

            if (index < 11) {
                const nextC =
                    "C" +
                    String(index + 2)
                        .padStart(2, "0");

                const nextIssue =
                    String(74 + index);

                assert.match(
                    block,
                    new RegExp(
                        "STATUS\\.json עודכן ומצביע על " +
                        nextC +
                        " \\/ #" +
                        nextIssue
                    )
                );
            }
        }

        const chat12Start =
            headings[11].index;

        const chat12Block =
            prompts.slice(
                chat12Start
            );

        assert.match(
            chat12Block,
            /אל תמציא Chat 13/
        );

        assert.match(
            chat12Block,
            /post-release\/normal-operation pointer/
        );

        assert.match(
            plan,
            /CHAT_PROMPTS\.md = copy\/paste launcher for each planned chat/
        );

        assert.match(
            plan,
            /Only one planned implementation chat is active at a time/
        );

        assert.match(
            plan,
            /The previous chat's prose is never an entry gate\. GitHub is\./
        );

        assert.match(
            plan,
            /Necessary plan correction/
        );

        assert.match(
            readme,
            /CHAT_EXECUTION_PLAN\.md/
        );

        assert.match(
            readme,
            /CHAT_PROMPTS\.md/
        );
    }
);
