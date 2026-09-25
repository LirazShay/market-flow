"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");

const packageName =
    "@duckdb/duckdb-wasm";
const packageVersion =
    "1.33.0";
const duckdbCoreVersion =
    "1.4.3";
const duckdbCoreCommit =
    "d1dc88f950d456d72493df452dabdcd13aa413dd";
const jsDelivrBaseUrl =
    "https://cdn.jsdelivr.net/npm";

const manifestFileName =
    "market-flow-v2.duckdb-engine-manifest.json";

const defaultOutputPath =
    path.join(
        __dirname,
        "dist",
        manifestFileName
    );

function assertExactSemanticVersion(
    value
) {
    if (
        typeof value !==
            "string" ||
        !/^\d+\.\d+\.\d+$/.test(
            value
        )
    ) {
        throw new Error(
            "DuckDB package version must be an exact semantic version."
        );
    }
}

function expectedDistBaseUrl(
    version
) {
    return (
        jsDelivrBaseUrl +
        "/" +
        packageName +
        "@" +
        version +
        "/dist/"
    );
}

function validateEngineAssetManifest(
    manifest
) {
    if (
        !manifest ||
        typeof manifest !==
            "object"
    ) {
        throw new TypeError(
            "Engine manifest must be an object."
        );
    }

    if (
        manifest.schemaVersion !==
            1
    ) {
        throw new Error(
            "Engine manifest schemaVersion must be 1."
        );
    }

    if (
        !manifest.package ||
        manifest.package.name !==
            packageName
    ) {
        throw new Error(
            "Engine manifest package name must be " +
            packageName +
            "."
        );
    }

    assertExactSemanticVersion(
        manifest.package.version
    );

    if (
        manifest.package.version !==
            packageVersion
    ) {
        throw new Error(
            "DuckDB package version must equal the reviewed package version " +
            packageVersion +
            "."
        );
    }

    if (
        !manifest.core ||
        manifest.core.version !==
            duckdbCoreVersion ||
        manifest.core.commit !==
            duckdbCoreCommit
    ) {
        throw new Error(
            "DuckDB core identity must match the reviewed embedded core."
        );
    }

    const distBaseUrl =
        expectedDistBaseUrl(
            manifest.package.version
        );

    for (
        const bundleName of [
            "mvp",
            "eh"
        ]
    ) {
        const bundle =
            manifest.bundles &&
            manifest.bundles[
                bundleName
            ];

        if (
            !bundle ||
            typeof bundle !==
                "object"
        ) {
            throw new Error(
                "DuckDB " +
                bundleName +
                " bundle is required."
            );
        }

        const expectedModule =
            distBaseUrl +
            "duckdb-" +
            bundleName +
            ".wasm";

        const expectedWorker =
            distBaseUrl +
            "duckdb-browser-" +
            bundleName +
            ".worker.js";

        if (
            bundle.mainModule !==
                expectedModule
        ) {
            throw new Error(
                "DuckDB " +
                bundleName +
                " mainModule must use package version " +
                manifest.package.version +
                " and the exact " +
                bundleName +
                " flavor asset."
            );
        }

        if (
            bundle.mainWorker !==
                expectedWorker
        ) {
            throw new Error(
                "DuckDB " +
                bundleName +
                " mainWorker must use package version " +
                manifest.package.version +
                " and the exact " +
                bundleName +
                " flavor asset."
            );
        }
    }

    return true;
}

function createEngineAssetManifest(
    options = {}
) {
    const selectedPackageVersion =
        options.packageVersion ??
        packageVersion;

    assertExactSemanticVersion(
        selectedPackageVersion
    );

    const distBaseUrl =
        expectedDistBaseUrl(
            selectedPackageVersion
        );

    const manifest = {
        schemaVersion:
            1,
        package: {
            name:
                packageName,
            version:
                selectedPackageVersion
        },
        core: {
            version:
                duckdbCoreVersion,
            commit:
                duckdbCoreCommit
        },
        bundles: {
            mvp: {
                mainModule:
                    distBaseUrl +
                    "duckdb-mvp.wasm",
                mainWorker:
                    distBaseUrl +
                    "duckdb-browser-mvp.worker.js"
            },
            eh: {
                mainModule:
                    distBaseUrl +
                    "duckdb-eh.wasm",
                mainWorker:
                    distBaseUrl +
                    "duckdb-browser-eh.worker.js"
            }
        }
    };

    validateEngineAssetManifest(
        manifest
    );

    return manifest;
}

function serializeEngineAssetManifest() {
    return (
        JSON.stringify(
            createEngineAssetManifest(),
            null,
            2
        ) +
        "\n"
    );
}

function writeEngineAssetManifest(
    options = {}
) {
    const outputPath =
        options.outputPath ??
        defaultOutputPath;

    const manifestText =
        serializeEngineAssetManifest();

    fs.mkdirSync(
        path.dirname(
            outputPath
        ),
        {
            recursive:
                true
        }
    );

    fs.writeFileSync(
        outputPath,
        manifestText,
        "utf8"
    );

    return Object.freeze({
        outputPath,
        manifestText
    });
}

if (
    require.main ===
    module
) {
    const result =
        writeEngineAssetManifest();

    console.log(
        JSON.stringify(
            {
                outputPath:
                    result.outputPath,
                package:
                    packageName +
                    "@" +
                    packageVersion,
                duckdbCore:
                    "v" +
                    duckdbCoreVersion,
                duckdbCoreCommit
            },
            null,
            2
        )
    );
}

module.exports =
    Object.freeze({
        packageName,
        packageVersion,
        duckdbCoreVersion,
        duckdbCoreCommit,
        jsDelivrBaseUrl,
        manifestFileName,
        defaultOutputPath,
        createEngineAssetManifest,
        validateEngineAssetManifest,
        serializeEngineAssetManifest,
        writeEngineAssetManifest
    });
