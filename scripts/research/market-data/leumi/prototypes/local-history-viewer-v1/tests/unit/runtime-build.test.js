"use strict";

const fs =
    require("node:fs");
const os =
    require("node:os");
const path =
    require("node:path");
const test =
    require("node:test");
const assert =
    require("node:assert/strict");

const runtimeBuilder =
    require(
        "../../runtime/build-runtime"
    );

const workstreamRoot =
    path.resolve(
        __dirname,
        "../.."
    );

test(
    "Stage 19.2 runtime source order is unique and references only repository browser source files",
    () => {
        const orderedSources = [
            ...runtimeBuilder
                .sourceOrder,
            runtimeBuilder
                .entryRelativePath
        ];

        assert.equal(
            new Set(
                orderedSources
            ).size,
            orderedSources.length
        );

        for (
            const relativePath of
            orderedSources
        ) {
            assert.equal(
                relativePath
                    .endsWith(
                        ".js"
                    ),
                true
            );

            assert.equal(
                relativePath
                    .includes(
                        "/tests/"
                    ),
                false
            );

            assert.equal(
                relativePath
                    .includes(
                        "/docs/"
                    ),
                false
            );

            assert.equal(
                fs.existsSync(
                    path.join(
                        workstreamRoot,
                        relativePath
                    )
                ),
                true,
                "Missing runtime source: " +
                relativePath
            );
        }
    }
);

test(
    "Stage 19.2 runtime build is deterministic and preserves declared dependency order",
    () => {
        const first =
            runtimeBuilder
                .buildRuntimeText();

        const second =
            runtimeBuilder
                .buildRuntimeText();

        assert.equal(
            second,
            first
        );

        let previousIndex =
            -1;

        for (
            const relativePath of [
                ...runtimeBuilder
                    .sourceOrder,
                runtimeBuilder
                    .entryRelativePath
            ]
        ) {
            const marker =
                "/* Market Flow source: " +
                relativePath +
                " */";

            const markerIndex =
                first.indexOf(
                    marker
                );

            assert.equal(
                markerIndex >
                    previousIndex,
                true,
                "Runtime source order is wrong at " +
                relativePath
            );

            previousIndex =
                markerIndex;
        }

        assert.equal(
            first.includes(
                "window.MarketFlowRuntime"
            ),
            true
        );
    }
);

test(
    "Stage 19.2 Bookmarklet decodes to the exact generated runtime payload",
    () => {
        const runtimeText =
            runtimeBuilder
                .buildRuntimeText();

        const bookmarklet =
            runtimeBuilder
                .buildBookmarkletText(
                    runtimeText
                );

        assert.equal(
            bookmarklet.startsWith(
                "javascript:"
            ),
            true
        );

        assert.equal(
            decodeURIComponent(
                bookmarklet.slice(
                    "javascript:"
                        .length
                )
            ),
            runtimeText
        );

        assert.equal(
            bookmarklet.includes(
                "\n"
            ),
            false
        );
    }
);

test(
    "Stage 19.2 builder writes the two reproducible delivery artifacts",
    () => {
        const outputDirectory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-runtime-"
                )
            );

        try {
            const artifacts =
                runtimeBuilder
                    .buildArtifacts({
                        outputDirectory
                    });

            assert.equal(
                path.basename(
                    artifacts
                        .runtimePath
                ),
                runtimeBuilder
                    .runtimeFileName
            );

            assert.equal(
                path.basename(
                    artifacts
                        .bookmarkletPath
                ),
                runtimeBuilder
                    .bookmarkletFileName
            );

            assert.equal(
                fs.readFileSync(
                    artifacts
                        .runtimePath,
                    "utf8"
                ),
                artifacts
                    .runtimeText
            );

            assert.equal(
                fs.readFileSync(
                    artifacts
                        .bookmarkletPath,
                    "utf8"
                ),
                artifacts
                    .bookmarkletText
            );
        } finally {
            fs.rmSync(
                outputDirectory,
                {
                    recursive:
                        true,
                    force:
                        true
                }
            );
        }
    }
);
