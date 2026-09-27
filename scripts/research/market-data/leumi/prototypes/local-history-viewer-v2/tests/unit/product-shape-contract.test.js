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
                "docs/project/decisions/D-044.md",
                "browser-sql-compact-execution-dag.md",
                "C01..C12"
            ]
        ) {
            assert.equal(
                decision.includes(
                    requiredText
                ),
                true,
                "D-043 lost current compact implementation traceability: " +
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
    "Browser SQL contracts trace D-043 through ingest, Viewer integration and cutover",
    () => {
        const requirements =
            readWorkstream(
                "docs/browser-sql-requirements-and-acceptance.md"
            );

        for (
            const id of
            [
                "DR-67",
                "DR-68",
                "DR-69",
                "DR-70",
                "DR-71",
                "DR-72",
                "AB-33",
                "AB-34",
                "AB-35",
                "AB-36"
            ]
        ) {
            assert.equal(
                requirements.includes(
                    id
                ),
                true,
                "Missing D-043 requirement/acceptance ID: " +
                    id
            );
        }

        const decomposition =
            readWorkstream(
                "docs/browser-sql-implementation-decomposition.md"
            );

        for (
            const requiredText of
            [
                "same validated complete-cycle market facts produced by the V1-proven collector",
                "preserve the proven V1 page-context provider/data acquisition contract",
                "support a separate Dynamic SQL Scanner client surface",
                "preserve the V1-derived Current Universe surface",
                "all three D-043 Viewer surfaces use the production SQL authority",
                "final runtime preserves D-043 provider/data continuity"
            ]
        ) {
            assert.equal(
                decomposition.includes(
                    requiredText
                ),
                true,
                "Implementation decomposition lost D-043 behavior: " +
                    requiredText
            );
        }

        const finalFreeze =
            readWorkstream(
                "docs/browser-sql-final-planning-freeze.md"
            );

        assert.match(
            finalFreeze,
            /DR-68[\s\S]*WP-09\.\.WP-14/
        );

        assert.match(
            finalFreeze,
            /DR-71[\s\S]*WP-36\.\.WP-38/
        );
    }
);

test(
    "Viewer architecture keeps SQL Scanner additive rather than replacing V1-derived browsing",
    () => {
        const architecture =
            readWorkstream(
                "docs/browser-sql-target-architecture.md"
            );

        const viewer =
            readWorkstream(
                "docs/browser-sql-viewer-result-delivery.md"
            );

        assert.equal(
            architecture.includes(
                "Viewer / future SQL editor"
            ),
            false,
            "Target architecture still contains the pre-D-043 future-editor ambiguity."
        );

        for (
            const content of
            [
                architecture,
                viewer
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
    "V2 design navigation exposes the D-043 decision and product authority",
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
            /local-history-viewer-v2-product-shape\.md/
        );
    }
);
