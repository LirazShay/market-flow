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
    "WP-01 default DuckDB engine manifest is deterministic and pins one exact package/core identity",
    () => {
        const first =
            engineManifest
                .createEngineAssetManifest();

        const second =
            engineManifest
                .createEngineAssetManifest();

        assert.deepEqual(
            second,
            first
        );

        assert.deepEqual(
            first.package,
            {
                name:
                    "@duckdb/duckdb-wasm",
                version:
                    "1.33.0"
            }
        );

        assert.deepEqual(
            first.core,
            {
                version:
                    "1.4.3",
                commit:
                    "d1dc88f950d456d72493df452dabdcd13aa413dd"
            }
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
            packageJson
                .dependencies[
                    "@duckdb/duckdb-wasm"
                ],
            first.package.version
        );

        for (
            const bundleName of [
                "mvp",
                "eh"
            ]
        ) {
            const bundle =
                first.bundles[
                    bundleName
                ];

            assert.equal(
                bundle.mainModule.includes(
                    "@duckdb/duckdb-wasm@1.33.0/dist/"
                ),
                true
            );

            assert.equal(
                bundle.mainWorker.includes(
                    "@duckdb/duckdb-wasm@1.33.0/dist/"
                ),
                true
            );

            assert.equal(
                bundle.mainModule.endsWith(
                    "duckdb-" +
                    bundleName +
                    ".wasm"
                ),
                true
            );

            assert.equal(
                bundle.mainWorker.endsWith(
                    "duckdb-browser-" +
                    bundleName +
                    ".worker.js"
                ),
                true
            );
        }
    }
);

test(
    "WP-01 rejects floating DuckDB package versions",
    () => {
        for (
            const packageVersion of [
                "latest",
                "next",
                "^1.33.0",
                "~1.33.0",
                "1.33",
                "1.33.x"
            ]
        ) {
            assert.throws(
                () =>
                    engineManifest
                        .createEngineAssetManifest({
                            packageVersion
                        }),
                /exact semantic version/i
            );
        }
    }
);

test(
    "WP-01 rejects version-mismatched or flavor-mismatched Worker/Wasm configuration",
    () => {
        const valid =
            engineManifest
                .createEngineAssetManifest();

        const wrongVersion =
            JSON.parse(
                JSON.stringify(
                    valid
                )
            );

        wrongVersion
            .bundles
            .mvp
            .mainWorker =
            wrongVersion
                .bundles
                .mvp
                .mainWorker
                .replace(
                    "@1.33.0/",
                    "@1.32.0/"
                );

        assert.throws(
            () =>
                engineManifest
                    .validateEngineAssetManifest(
                        wrongVersion
                    ),
            /package version/i
        );

        const wrongFlavor =
            JSON.parse(
                JSON.stringify(
                    valid
                )
            );

        wrongFlavor
            .bundles
            .eh
            .mainModule =
            wrongFlavor
                .bundles
                .mvp
                .mainModule;

        assert.throws(
            () =>
                engineManifest
                    .validateEngineAssetManifest(
                        wrongFlavor
                    ),
            /eh.*mainModule/i
        );
    }
);

test(
    "WP-01 serialized engine manifest is stable and round-trips exactly",
    () => {
        const first =
            engineManifest
                .serializeEngineAssetManifest();

        const second =
            engineManifest
                .serializeEngineAssetManifest();

        assert.equal(
            second,
            first
        );

        assert.deepEqual(
            JSON.parse(
                first
            ),
            engineManifest
                .createEngineAssetManifest()
        );

        assert.equal(
            first.endsWith(
                "\n"
            ),
            true
        );
    }
);

test(
    "WP-01 writer emits only the requested deterministic manifest artifact",
    () => {
        const directory =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "market-flow-duckdb-manifest-"
                )
            );

        const outputPath =
            path.join(
                directory,
                "engine-manifest.json"
            );

        try {
            const result =
                engineManifest
                    .writeEngineAssetManifest({
                        outputPath
                    });

            assert.equal(
                result.outputPath,
                outputPath
            );

            assert.equal(
                fs.readFileSync(
                    outputPath,
                    "utf8"
                ),
                engineManifest
                    .serializeEngineAssetManifest()
            );

            assert.deepEqual(
                fs.readdirSync(
                    directory
                ),
                [
                    "engine-manifest.json"
                ]
            );
        } finally {
            fs.rmSync(
                directory,
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
