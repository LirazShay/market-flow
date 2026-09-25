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

const probeBuilder =
    require(
        "../../runtime/build-browser-sql-probe"
    );

const engineManifest =
    require(
        "../../runtime/duckdb-engine-manifest"
    );

const workstreamRoot =
    path.resolve(
        __dirname,
        "../.."
    );

test(
    "WP-02 Browser SQL probe artifacts are deterministic, pinned and sanitized",
    async () => {
        const outputDirectory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-browser-sql-probe-"
                )
            );

        try {
            const first =
                await probeBuilder
                    .buildProbeArtifacts({
                        outputDirectory,
                        write:
                            false
                    });

            const second =
                await probeBuilder
                    .buildProbeArtifacts({
                        outputDirectory,
                        write:
                            false
                    });

            assert.equal(
                second.probeText,
                first.probeText
            );

            assert.equal(
                second.bookmarkletText,
                first.bookmarkletText
            );

            assert.deepEqual(
                second.probeConfig,
                first.probeConfig
            );

            const engine =
                engineManifest
                    .createEngineAssetManifest();

            assert.deepEqual(
                first.probeConfig.engine,
                engine
            );

            assert.equal(
                first.probeConfig
                    .databaseFileName,
                "market-flow-browser-sql-probe-v2.duckdb"
            );

            assert.equal(
                first.probeConfig
                    .databaseUrl,
                "opfs://market-flow-browser-sql-probe-v2.duckdb"
            );

            assert.equal(
                first.bookmarkletText
                    .startsWith(
                        "javascript:"
                    ),
                true
            );

            assert.equal(
                /[\r\n\t]/.test(
                    first.bookmarkletText
                ),
                false
            );

            for (
                const forbidden of [
                    "MapHeat2",
                    "GetSecuritiesData",
                    "hb2.leumi",
                    "market-flow-leumi-history-v2"
                ]
            ) {
                assert.equal(
                    first.probeText
                        .includes(
                            forbidden
                        ),
                    false,
                    "Probe must not contain provider/production identifier: " +
                    forbidden
                );
            }

            for (
                const stage of [
                    "bookmarklet-bootstrap",
                    "browser-capabilities",
                    "blob-worker-create",
                    "worker-asset-load",
                    "wasm-instantiate",
                    "opfs-open",
                    "write-commit-checkpoint",
                    "reopen-verify"
                ]
            ) {
                assert.equal(
                    first.probeConfig
                        .runStages
                        .includes(
                            stage
                        ),
                    true,
                    "Missing probe stage: " +
                    stage
                );
            }
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
    "WP-02 probe writer emits only repository-derived executable artifacts",
    async () => {
        const outputDirectory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-browser-sql-probe-write-"
                )
            );

        try {
            const artifacts =
                await probeBuilder
                    .buildProbeArtifacts({
                        outputDirectory
                    });

            assert.deepEqual(
                fs.readdirSync(
                    outputDirectory
                ).sort(),
                [
                    probeBuilder
                        .bookmarkletFileName,
                    probeBuilder
                        .probeFileName
                ].sort()
            );

            assert.equal(
                fs.readFileSync(
                    artifacts.probePath,
                    "utf8"
                ),
                artifacts.probeText
            );

            assert.equal(
                fs.readFileSync(
                    artifacts.bookmarkletPath,
                    "utf8"
                ),
                artifacts.bookmarkletText
            );

            const packageJson =
                JSON.parse(
                    fs.readFileSync(
                        path.join(
                            workstreamRoot,
                            "package.json"
                        ),
                        "utf8"
                    )
                );

            assert.equal(
                typeof packageJson
                    .scripts[
                        "build:browser-sql-probe"
                    ],
                "string"
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
