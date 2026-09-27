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
    "ROADMAP exposes the compact C01-C12 order without reviving the 42-WP handoff",
    () => {
        const roadmap =
            readWorkstream(
                "ROADMAP.md"
            );

        for (
            let index = 1;
            index <= 12;
            index += 1
        ) {
            const id =
                "C" +
                String(index)
                    .padStart(
                        2,
                        "0"
                    );

            assert.equal(
                roadmap.includes(
                    id
                ),
                true,
                "ROADMAP lost compact executable node: " +
                    id
            );
        }

        assert.equal(
            /implementation entry\s*=\s*WP-|WP-01\.\.WP-42|8 implementation milestones\s*\n42 executable work packages/i.test(
                roadmap
            ),
            false,
            "ROADMAP must not present the historical 42-WP handoff as current."
        );

        assert.match(
            roadmap,
            /After materialization, GitHub Master \+ C01\.\.C12 own executable work/
        );
    }
);

test(
    "current Browser SQL navigation marks the old execution graph and freeze as historical",
    () => {
        const executionMap =
            readWorkstream(
                "docs/browser-sql-github-execution-structure.md"
            );

        const decomposition =
            readWorkstream(
                "docs/browser-sql-implementation-decomposition.md"
            );

        const freeze =
            readWorkstream(
                "docs/browser-sql-final-planning-freeze.md"
            );

        assert.match(
            executionMap,
            /historical and superseded[\s\S]*D-044/i
        );

        assert.match(
            executionMap,
            /one compact Master[\s\S]*C01\.\.C12 executable Issues/i
        );

        assert.match(
            decomposition,
            /Superseded for current initial V2 by D-044/i
        );

        assert.match(
            freeze,
            /old Phase-W \/ 42-WP planning freeze is historical/i
        );

        assert.match(
            freeze,
            /D-044/
        );
    }
);

test(
    "Browser SQL testing policy uses C01-C12 semantics instead of the old WP and Stage gate model",
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
