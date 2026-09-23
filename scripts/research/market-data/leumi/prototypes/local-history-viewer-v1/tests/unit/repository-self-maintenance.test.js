"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
const test =
    require("node:test");
const assert =
    require("node:assert/strict");

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
        "local-history-viewer-v1"
    );

function read(
    relativePath
) {
    return fs.readFileSync(
        path.join(
            repositoryRoot,
            relativePath
        ),
        "utf8"
    );
}

test(
    "repository self-maintenance policy is part of the mandatory AI entry path",
    () => {
        const agents =
            read(
                "AGENTS.md"
            );

        assert.match(
            agents,
            /Repository self-maintenance/i
        );

        assert.match(
            agents,
            /same coherent batch/i
        );

        assert.match(
            agents,
            /no-cleanup debt/i
        );

        assert.equal(
            fs.existsSync(
                path.join(
                    repositoryRoot,
                    "docs",
                    "project",
                    "decisions",
                    "D-024.md"
                )
            ),
            true,
            "Missing durable repository self-maintenance decision."
        );
    }
);

test(
    "STATUS top-level ownership stays explicit instead of growing ad-hoc history buckets",
    () => {
        const status =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        workstreamRoot,
                        "STATUS.json"
                    ),
                    "utf8"
                )
            );

        const allowedKeys =
            [
                "schemaVersion",
                "workstream",
                "updatedAt",
                "overallStatus",
                "authority",
                "currentFocus",
                "stageSummary",
                "currentStage",
                "activeMiniProject",
                "verification",
                "next",
                "history"
            ];

        assert.deepEqual(
            Object.keys(
                status
            ).sort(),
            [...allowedKeys]
                .sort(),
            "STATUS.json top-level shape changed. Review whether the new field is truly live operational state or belongs in history/specs/decisions, then update this guard deliberately only if needed."
        );
    }
);

test(
    "Fast CI continues protecting context, policy and status surfaces",
    () => {
        const workflow =
            read(
                ".github/workflows/local-history-viewer-v1-fast-ci.yml"
            );

        const requiredPaths =
            [
                "AGENTS.md",
                "README.md",
                "PROJECT_CONTEXT.md",
                "docs/project/**/*.md",
                "scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/**/*.md",
                "scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json",
                "scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/**/*.js"
            ];

        for (
            const requiredPath of
            requiredPaths
        ) {
            assert.equal(
                workflow.includes(
                    requiredPath
                ),
                true,
                "Fast CI no longer watches required repository-maintenance surface: " +
                    requiredPath
            );
        }
    }
);

test(
    "durable maintenance policies remain discoverable without entering the default HOT context",
    () => {
        const contextPolicy =
            read(
                "docs/project/context-loading.md"
            );

        assert.match(
            contextPolicy,
            /self-maintenance/i
        );

        const engineeringPractices =
            read(
                "docs/project/engineering-practices.md"
            );

        assert.match(
            engineeringPractices,
            /no-cleanup debt/i
        );

        const workstreamReadme =
            fs.readFileSync(
                path.join(
                    workstreamRoot,
                    "README.md"
                ),
                "utf8"
            );

        assert.equal(
            workstreamReadme.includes(
                "D-024"
            ),
            false,
            "Deep maintenance decisions must stay out of the default workstream HOT context."
        );
    }
);
