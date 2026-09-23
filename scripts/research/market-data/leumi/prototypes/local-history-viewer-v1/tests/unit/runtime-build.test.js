"use strict";

const fs =
    require("node:fs");
const os =
    require("node:os");
const path =
    require("node:path");
const crypto =
    require("node:crypto");
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
    "Stage 19.2 Bookmarklet is compact readable JavaScript rather than whole-runtime percent encoding",
    () => {
        const runtimeText =
            runtimeBuilder
                .buildRuntimeText();

        const compactRuntimeText =
            runtimeBuilder
                .buildCompactRuntimeText(
                    runtimeText
                );

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
            bookmarklet.includes(
                "\n"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "%0A"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "%20"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "window.MarketFlowRuntime"
            ),
            true
        );

        assert.equal(
            bookmarklet.slice(
                "javascript:"
                    .length
            ),
            compactRuntimeText
        );

        assert.equal(
            Buffer.byteLength(
                bookmarklet,
                "utf8"
            ),
            Buffer.byteLength(
                compactRuntimeText,
                "utf8"
            ) +
                Buffer.byteLength(
                    "javascript:",
                    "utf8"
                )
        );

        assert.equal(
            compactRuntimeText.length <
                runtimeText.length,
            true
        );
    }
);

test(
    "Stage 19.2 Bookmarklet packaging has no arbitrary absolute size ceiling",
    () => {
        const largeRuntimeText =
            "(()=>{const payload=\"" +
            "x".repeat(
                300 * 1024
            ) +
            "\";window.__marketFlowLargePayload=payload.length;})();";

        const bookmarklet =
            runtimeBuilder
                .buildBookmarkletText(
                    largeRuntimeText
                );

        assert.equal(
            bookmarklet.startsWith(
                "javascript:"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "%20"
            ),
            false
        );

        assert.equal(
            Buffer.byteLength(
                bookmarklet,
                "utf8"
            ) >
                256 * 1024,
            true
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


test(
    "Loader probe build emits a deterministic manifest tied to the runtime SHA-256",
    () => {
        const runtimeText =
            runtimeBuilder
                .buildRuntimeText();

        const manifest =
            runtimeBuilder
                .buildRuntimeManifest(
                    runtimeText
                );

        const expectedSha256 =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    runtimeText,
                    "utf8"
                )
                .digest(
                    "hex"
                );

        assert.equal(
            manifest.formatVersion,
            1
        );

        assert.equal(
            manifest.buildId,
            "sha256:" +
                expectedSha256
        );

        assert.equal(
            manifest.runtime
                .sha256,
            expectedSha256
        );

        assert.equal(
            manifest.runtime
                .bytes,
            Buffer.byteLength(
                runtimeText,
                "utf8"
            )
        );

        assert.equal(
            manifest.runtime
                .fileName,
            runtimeBuilder
                .runtimeFileName
        );

        assert.match(
            manifest.runtime
                .url,
            /local-history-viewer-v1-runtime-latest\/market-flow-v1\.runtime\.js$/
        );
    }
);

test(
    "Loader probe Bookmarklet is compact, non-invasive and points at the stable manifest",
    () => {
        const bookmarklet =
            runtimeBuilder
                .buildLoaderProbeBookmarkletText();

        assert.equal(
            bookmarklet.startsWith(
                "javascript:"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "\n"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "%20"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "MarketFlowLoaderProbeLastResult"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "market-flow-v1.manifest.json"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "MarketFlowRuntime.stop"
            ),
            false,
            "Probe must not stop or replace the currently running runtime."
        );
    }
);

test(
    "Runtime build writes manifest and loader-probe artifacts alongside existing delivery files",
    () => {
        const outputDirectory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-loader-probe-"
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
                        .manifestPath
                ),
                runtimeBuilder
                    .manifestFileName
            );

            assert.equal(
                path.basename(
                    artifacts
                        .loaderProbePath
                ),
                runtimeBuilder
                    .loaderProbeFileName
            );

            const manifestOnDisk =
                JSON.parse(
                    fs.readFileSync(
                        artifacts
                            .manifestPath,
                        "utf8"
                    )
                );

            assert.equal(
                manifestOnDisk
                    .buildId,
                artifacts
                    .manifest
                    .buildId
            );

            assert.equal(
                fs.readFileSync(
                    artifacts
                        .loaderProbePath,
                    "utf8"
                ),
                artifacts
                    .loaderProbeText
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


test(
    "Transport probe Bookmarklet is compact and tests raw, API and local compilation independently",
    () => {
        const bookmarklet =
            runtimeBuilder
                .buildTransportProbeBookmarkletText();

        assert.equal(
            bookmarklet.startsWith(
                "javascript:"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "\n"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "%20"
            ),
            false
        );

        assert.equal(
            bookmarklet.includes(
                "raw.githubusercontent.com"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "api.github.com"
            ),
            true
        );

        assert.equal(
            bookmarklet.includes(
                "MarketFlowTransportProbeLastResult"
            ),
            true
        );
    }
);

test(
    "Runtime build writes the transport-probe Bookmarklet artifact",
    () => {
        const outputDirectory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-transport-probe-"
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
                        .transportProbePath
                ),
                runtimeBuilder
                    .transportProbeFileName
            );

            assert.equal(
                fs.readFileSync(
                    artifacts
                        .transportProbePath,
                    "utf8"
                ),
                artifacts
                    .transportProbeText
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
