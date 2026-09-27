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

function read(relativePath) {
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
    "D-043 keeps V2 collection continuity and the three Viewer surfaces mechanically traceable",
    () => {
        const product =
            read(
                "docs/product/local-history-viewer-v2-product-shape.md"
            );

        const decision =
            read(
                "docs/project/decisions/D-043.md"
            );

        for (
            const requiredText of
            [
                "MapHeat2",
                "sequential GetSecuritiesData",
                "exact completeness validation",
                "Current Universe",
                "Security Detail/History",
                "Dynamic SQL Scanner",
                "user-selectable repeat interval"
            ]
        ) {
            assert.equal(
                product.includes(
                    requiredText
                ),
                true,
                "Product shape lost required D-043 contract: " +
                    requiredText
            );
        }

        for (
            const requiredText of
            [
                "docs/project/decisions/D-045.md",
                "localhost Node.js service",
                "native DuckDB",
                "frozen reference planning"
            ]
        ) {
            assert.equal(
                decision.includes(
                    requiredText
                ),
                true,
                "D-043 lost current Node-SQL implementation traceability: " +
                    requiredText
            );
        }

        assert.equal(
            /WP-09\.\.WP-14|WP-23\.\.WP-24|WP-25\.\.WP-29|WP-36\.\.WP-38/.test(
                decision
            ),
            false,
            "D-043 must not retain superseded 42-WP ownership ranges."
        );
    }
);

test(
    "HOT and planning surfaces keep D-043 product meaning explicit",
    () => {
        const files = [
            "README.md",
            "AI_CONTEXT.md",
            "ROADMAP.md"
        ];

        for (
            const fileName of files
        ) {
            const content =
                readWorkstream(
                    fileName
                );

            assert.match(
                content,
                /V1.*(provider|collection)|provider.*V1|collection.*V1/i,
                fileName +
                    " must preserve V1 collection/provider continuity."
            );

            assert.match(
                content,
                /Current Universe/i,
                fileName +
                    " must preserve Current Universe."
            );

            assert.match(
                content,
                /Security Detail\/History/i,
                fileName +
                    " must preserve Security Detail/History."
            );

            assert.match(
                content,
                /Dynamic SQL Scanner/i,
                fileName +
                    " must keep the SQL Scanner as a separate surface."
            );
        }
    }
);

test(
    "current Browser SQL contracts trace D-043 through the compact D-044 execution baseline",
    () => {
        const d044 =
            read(
                "docs/project/decisions/D-044.md"
            );

        for (
            const requiredText of
            [
                "existing authenticated V1 provider flow",
                "atomic raw/current/history SQL authority",
                "Current Universe + Security Detail/History",
                "simple read-only Dynamic SQL Scanner",
                "explicit cutover",
                "C01..C12"
            ]
        ) {
            assert.equal(
                d044.includes(
                    requiredText
                ),
                true,
                "D-044 lost compact implementation contract: " +
                    requiredText
            );
        }

        const dag =
            readWorkstream(
                "docs/browser-sql-compact-execution-dag.md"
            );

        const specs =
            readWorkstream(
                "docs/browser-sql-compact-issue-specifications.md"
            );

        for (
            const requiredText of
            [
                "C04 — Recorder integration + trusted reads",
                "C05 — Current Universe SQL parity",
                "C06 — Detail/History SQL parity + bounded L-2",
                "C08 — Scanner core",
                "C12 — Final live verification + cutover/rollback/cleanup"
            ]
        ) {
            assert.equal(
                dag.includes(
                    requiredText
                ),
                true,
                "Compact DAG lost product-flow owner: " +
                    requiredText
            );
        }

        for (
            const requiredText of
            [
                "C04 — Integrate the Recorder and expose trusted SQL reads",
                "C05 — Move Current Universe to trusted SQL reads",
                "C06 — Move Detail/History to SQL and run bounded L-2",
                "C08 — Implement the simple safe Scanner core",
                "C12 — Run final live verification and perform explicit SQL cutover"
            ]
        ) {
            assert.equal(
                specs.includes(
                    requiredText
                ),
                true,
                "Compact Issue specifications lost product-flow owner: " +
                    requiredText
            );
        }

        for (
            const historicalPath of
            [
                "docs/browser-sql-requirements-and-acceptance.md",
                "docs/browser-sql-implementation-decomposition.md",
                "docs/browser-sql-final-planning-freeze.md"
            ]
        ) {
            const content =
                readWorkstream(
                    historicalPath
                );

            assert.match(
                content,
                /(superseded|historical)/i,
                historicalPath +
                    " must not present the old 42-WP plan as current authority."
            );

            assert.match(
                content,
                /D-044/
            );
        }
    }
);

test(
    "Viewer architecture keeps SQL Scanner additive rather than replacing V1-derived browsing",
    () => {
        const architecture =
            readWorkstream(
                "docs/browser-sql-target-architecture.md"
            );

        const product =
            read(
                "docs/product/local-history-viewer-v2-product-shape.md"
            );

        for (
            const content of
            [
                architecture,
                product
            ]
        ) {
            assert.match(
                content,
                /Current Universe/
            );

            assert.match(
                content,
                /Security Detail\/History/
            );

            assert.match(
                content,
                /Dynamic SQL Scanner/
            );

            assert.match(
                content,
                /(additive|does not replace)/i
            );
        }
    }
);

test(
    "inherited specs explicitly route V2 evolution to D-043 without pretending target behavior is already implemented",
    () => {
        const specFiles = [
            "specs/system.spec.md",
            "specs/provider-data-contract.spec.md",
            "specs/recorder.spec.md",
            "specs/viewer.spec.md",
            "specs/README.md"
        ];

        for (
            const fileName of specFiles
        ) {
            const content =
                readWorkstream(
                    fileName
                );

            assert.equal(
                content.includes(
                    "D-043"
                ),
                true,
                fileName +
                    " must make the D-043 evolution boundary discoverable."
            );
        }

        const specIndex =
            readWorkstream(
                "specs/README.md"
            );

        assert.match(
            specIndex,
            /not a claim.*already implement/i
        );
    }
);

test(
    "V2 design navigation exposes current D-043/D-044 authorities and cold history",
    () => {
        const docsIndex =
            readWorkstream(
                "docs/README.md"
            );

        assert.match(
            docsIndex,
            /D-043/
        );

        assert.match(
            docsIndex,
            /D-044/
        );

        assert.match(
            docsIndex,
            /local-history-viewer-v2-product-shape\.md/
        );

        assert.match(
            docsIndex,
            /history\/README\.md/
        );
    }
);
