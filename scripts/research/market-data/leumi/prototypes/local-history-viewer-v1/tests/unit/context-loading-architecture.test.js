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

const routerFile =
    path.join(
        repositoryRoot,
        "docs",
        "project",
        "workstreams.md"
    );

const hotFiles = [
    path.join(
        repositoryRoot,
        "AGENTS.md"
    ),
    path.join(
        workstreamRoot,
        "README.md"
    ),
    path.join(
        workstreamRoot,
        "STATUS.json"
    ),
    path.join(
        workstreamRoot,
        "AI_CONTEXT.md"
    )
];

const limits = {
    "AGENTS.md":
        10000,
    "README.md":
        3500,
    "STATUS.json":
        8000,
    "AI_CONTEXT.md":
        5000,
    total:
        24000,
    router:
        3000,
    worstCaseWithRouter:
        27000
};

function read(
    filePath
) {
    return fs.readFileSync(
        filePath,
        "utf8"
    );
}

test(
    "fresh-chat hot context stays bounded and history is not loaded by default",
    () => {
        let total = 0;

        for (
            const filePath of
            hotFiles
        ) {
            assert.equal(
                fs.existsSync(
                    filePath
                ),
                true,
                "Missing hot-context file: " +
                filePath
            );

            const content =
                read(
                    filePath
                );

            const fileName =
                path.basename(
                    filePath
                );

            total +=
                content.length;

            assert.ok(
                content.length <=
                    limits[fileName],
                fileName +
                    " exceeds hot-context budget: " +
                    content.length +
                    " > " +
                    limits[fileName]
            );
        }

        assert.ok(
            total <=
                limits.total,
            "Fresh-chat hot context exceeds total budget: " +
                total +
                " > " +
                limits.total
        );

        const routerContent =
            read(
                routerFile
            );

        assert.ok(
            routerContent.length <=
                limits.router,
            "Workstream router exceeds context budget: " +
                routerContent.length +
                " > " +
                limits.router
        );

        assert.ok(
            total +
                routerContent.length <=
                limits.worstCaseWithRouter,
            "Worst-case fresh-chat context with workstream routing exceeds budget: " +
                (
                    total +
                    routerContent.length
                ) +
                " > " +
                limits.worstCaseWithRouter
        );
    }
);

test(
    "STATUS.json contains live state rather than accumulated implementation history",
    () => {
        const status =
            JSON.parse(
                read(
                    path.join(
                        workstreamRoot,
                        "STATUS.json"
                    )
                )
            );

        for (
            const historicalKey of
            [
                "stages",
                "stabilizationPlan",
                "lastCompletedMiniProject"
            ]
        ) {
            assert.equal(
                Object.hasOwn(
                    status,
                    historicalKey
                ),
                false,
                "STATUS.json must not accumulate historical field: " +
                    historicalKey
            );
        }

        assert.equal(
            typeof status
                .history
                ?.index,
            "string",
            "STATUS.json must point to the cold-history index."
        );

        assert.equal(
            typeof status
                .history
                ?.latestArchive,
            "string",
            "STATUS.json must point to the latest archived full status snapshot."
        );
    }
);

test(
    "cold history is preserved and discoverable for fresh chats that need rationale",
    () => {
        const policyPath =
            path.join(
                repositoryRoot,
                "docs",
                "project",
                "context-loading.md"
            );

        assert.equal(
            fs.existsSync(
                policyPath
            ),
            true,
            "Missing context-loading policy."
        );

        const historyIndexPath =
            path.join(
                workstreamRoot,
                "docs",
                "history",
                "README.md"
            );

        const historyIndex =
            read(
                historyIndexPath
            );

        assert.match(
            historyIndex,
            /status-snapshots/i
        );

        const status =
            JSON.parse(
                read(
                    path.join(
                        workstreamRoot,
                        "STATUS.json"
                    )
                )
            );

        const archivePath =
            path.join(
                workstreamRoot,
                status
                    .history
                    .latestArchive
            );

        assert.equal(
            fs.existsSync(
                archivePath
            ),
            true,
            "Referenced status archive does not exist."
        );

        const aiContext =
            read(
                path.join(
                    workstreamRoot,
                    "AI_CONTEXT.md"
                )
            );

        assert.match(
            aiContext,
            /docs\/history\/README\.md/
        );
    }
);
