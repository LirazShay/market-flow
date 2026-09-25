"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
const {
    minify_sync
} =
    require("terser");

const engineManifest =
    require(
        "./duckdb-engine-manifest"
    );

const sourcePath =
    path.join(
        __dirname,
        "browser-sql-probe.js"
    );

const defaultOutputDirectory =
    path.join(
        __dirname,
        "dist"
    );

const probeFileName =
    "market-flow-v2.browser-sql-probe.js";

const bookmarkletFileName =
    "market-flow-v2.browser-sql-probe.bookmarklet.txt";

const configToken =
    "__MARKET_FLOW_BROWSER_SQL_PROBE_CONFIG__";

function createProbeConfig() {
    return {
        schemaVersion:
            1,
        engine:
            engineManifest
                .createEngineAssetManifest(),
        databaseFileName:
            "market-flow-browser-sql-probe-v2.duckdb",
        databaseWalFileName:
            "market-flow-browser-sql-probe-v2.duckdb.wal",
        databaseUrl:
            "opfs://market-flow-browser-sql-probe-v2.duckdb",
        syntheticMarker:
            "market-flow-browser-sql-probe-synthetic-v1",
        runStages: [
            "bookmarklet-bootstrap",
            "browser-capabilities",
            "blob-worker-create",
            "worker-asset-load",
            "wasm-instantiate",
            "opfs-open",
            "write-commit-checkpoint",
            "reopen-verify"
        ]
    };
}

function readProbeSource() {
    if (
        !fs.existsSync(
            sourcePath
        )
    ) {
        throw new Error(
            "Browser SQL probe source is missing."
        );
    }

    return fs.readFileSync(
        sourcePath,
        "utf8"
    );
}

function buildProbeText(
    probeConfig
) {
    const source =
        readProbeSource();

    const firstIndex =
        source.indexOf(
            configToken
        );

    if (
        firstIndex <
            0 ||
        source.indexOf(
            configToken,
            firstIndex +
                configToken.length
        ) >=
            0
    ) {
        throw new Error(
            "Browser SQL probe source must contain exactly one config token."
        );
    }

    return source.replace(
        configToken,
        JSON.stringify(
            probeConfig
        )
    );
}

function buildBookmarkletText(
    probeText
) {
    const result =
        minify_sync(
            probeText,
            {
                compress:
                    false,
                mangle:
                    false,
                format: {
                    ascii_only:
                        true,
                    comments:
                        false,
                    semicolons:
                        true
                }
            }
        );

    if (
        !result ||
        typeof result.code !==
            "string" ||
        result.code.length ===
            0
    ) {
        throw new Error(
            "Terser did not produce Browser SQL probe code."
        );
    }

    if (
        /[\r\n\t]/.test(
            result.code
        )
    ) {
        throw new Error(
            "Browser SQL probe Bookmarklet body must be single-line JavaScript."
        );
    }

    return (
        "javascript:" +
        result.code
    );
}

async function buildProbeArtifacts(
    options = {}
) {
    const outputDirectory =
        options.outputDirectory ??
        defaultOutputDirectory;

    const write =
        options.write ??
        true;

    const probeConfig =
        createProbeConfig();

    const probeText =
        buildProbeText(
            probeConfig
        );

    const bookmarkletText =
        buildBookmarkletText(
            probeText
        );

    const probePath =
        path.join(
            outputDirectory,
            probeFileName
        );

    const bookmarkletPath =
        path.join(
            outputDirectory,
            bookmarkletFileName
        );

    if (write) {
        fs.mkdirSync(
            outputDirectory,
            {
                recursive:
                    true
            }
        );

        fs.writeFileSync(
            probePath,
            probeText,
            "utf8"
        );

        fs.writeFileSync(
            bookmarkletPath,
            bookmarkletText,
            "utf8"
        );
    }

    return Object.freeze({
        probeConfig,
        probeText,
        bookmarkletText,
        probePath,
        bookmarkletPath
    });
}

if (
    require.main ===
    module
) {
    buildProbeArtifacts()
        .then(
            artifacts => {
                console.log(
                    JSON.stringify(
                        {
                            probePath:
                                artifacts
                                    .probePath,
                            bookmarkletPath:
                                artifacts
                                    .bookmarkletPath,
                            databaseUrl:
                                artifacts
                                    .probeConfig
                                    .databaseUrl,
                            enginePackage:
                                artifacts
                                    .probeConfig
                                    .engine
                                    .package
                        },
                        null,
                        2
                    )
                );
            }
        )
        .catch(
            error => {
                console.error(
                    error
                );

                process.exitCode =
                    1;
            }
        );
}

module.exports =
    Object.freeze({
        probeFileName,
        bookmarkletFileName,
        createProbeConfig,
        buildProbeText,
        buildBookmarkletText,
        buildProbeArtifacts
    });
