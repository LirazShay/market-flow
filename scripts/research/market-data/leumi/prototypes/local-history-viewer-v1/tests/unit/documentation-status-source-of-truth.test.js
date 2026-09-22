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
        "local-history-viewer-v1"
    );

function collectReadmes(
    directory
) {
    const results = [];

    for (
        const entry of fs.readdirSync(
            directory,
            {
                withFileTypes:
                    true
            }
        )
    ) {
        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {
            if (
                fullPath.includes(
                    path.join(
                        "docs",
                        "history"
                    )
                )
            ) {
                continue;
            }

            results.push(
                ...collectReadmes(
                    fullPath
                )
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name ===
                "README.md"
        ) {
            results.push(
                fullPath
            );
        }
    }

    return results;
}

const protectedFiles = [
    path.join(
        repositoryRoot,
        "README.md"
    ),
    path.join(
        repositoryRoot,
        "PROJECT_CONTEXT.md"
    ),
    path.join(
        repositoryRoot,
        "docs",
        "project",
        "workstreams.md"
    ),
    path.join(
        repositoryRoot,
        "docs",
        "project",
        "current-state.md"
    ),
    path.join(
        workstreamRoot,
        "AI_CONTEXT.md"
    ),
    path.join(
        workstreamRoot,
        "HANDOFF.md"
    ),
    path.join(
        workstreamRoot,
        "NEXT_CHAT_PROMPT.md"
    ),
    ...collectReadmes(
        workstreamRoot
    )
];

const prohibitedPatterns = [
    {
        name:
            "numeric stage completion/progress snapshot",
        regex:
            /\bStages?\s+\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s+(?:complete|completed|verified|in-progress|not complete|ready-to-start|not started)\b/i
    },
    {
        name:
            "numeric stage status snapshot",
        regex:
            /\bStage\s+\d+(?:\.\d+)?\s*(?:—|-|:)?\s*(?:is\s+)?(?:complete|completed|verified|in-progress|not complete|ready-to-start|has not started|not started|remains open)\b/i
    },
    {
        name:
            "numeric next-stage pointer",
        regex:
            /\bNext(?:\s+planned\s+stage)?\s*:\s*(?:Stage\s+)?\d+(?:\.\d+)?/i
    },
    {
        name:
            "numeric resume-stage pointer",
        regex:
            /\bresume(?:s|d)?\s+(?:at|from|by)[^\n]*\bStage\s+\d+(?:\.\d+)?/i
    },
    {
        name:
            "milestone current pointer",
        regex:
            /Current pointer at this milestone/i
    },
    {
        name:
            "stale update snapshot intro",
        regex:
            /נכון לעדכון האחרון/i
    },
    {
        name:
            "live status heading",
        regex:
            /^#{1,6}\s+(?:Current status|מצב עדכני)\s*$/im
    },
    {
        name:
            "generic README status block",
        regex:
            /^Status:\s*$/im
    },
    {
        name:
            "latest verification snapshot",
        regex:
            /\bLatest verified checkpoint\b|\bLatest verification\b/i
    },
    {
        name:
            "duplicated active-workstream claim",
        regex:
            /Workstream פעיל כרגע|currently active workstream|כרגע הפיתוח הפעיל|ה-workstream הפעיל כרגע|כרגע יש workstream פעיל/i
    },
    {
        name:
            "project-status correction narrative",
        regex:
            /Project status correction/i
    },
    {
        name:
            "hard-coded fresh-chat work pointer",
        regex:
            /כרגע הדבר הראשון שצריך לעשות[^\n]*|plan Stage\s+\d+(?:\.\d+)?/i
    }
];

test(
    "operational stage status exists only in STATUS.json, not routing/context/README surfaces",
    () => {
        const violations = [];

        for (
            const filePath of
            [...new Set(
                protectedFiles
            )]
        ) {
            assert.equal(
                fs.existsSync(
                    filePath
                ),
                true,
                "Protected documentation file is missing: " +
                path.relative(
                    repositoryRoot,
                    filePath
                )
            );

            const content =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );

            for (
                const {
                    name,
                    regex
                } of
                prohibitedPatterns
            ) {
                const match =
                    content.match(
                        regex
                    );

                if (match) {
                    violations.push({
                        file:
                            path.relative(
                                repositoryRoot,
                                filePath
                            ),
                        rule:
                            name,
                        match:
                            match[0]
                    });
                }
            }
        }

        assert.deepEqual(
            violations,
            [],
            "Live operational status must remain only in STATUS.json. " +
            JSON.stringify(
                violations,
                null,
                2
            )
        );
    }
);
