"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
const crypto =
    require("node:crypto");
const {
    minify_sync
} =
    require("terser");

const sourceOrder =
    require("./source-order");

const workstreamRoot =
    path.resolve(
        __dirname,
        ".."
    );

const entryRelativePath =
    "runtime/entry.js";

const defaultOutputDirectory =
    path.join(
        __dirname,
        "dist"
    );

const runtimeFileName =
    "market-flow-v1.runtime.js";

const bookmarkletFileName =
    "market-flow-v1.bookmarklet.txt";

const manifestFileName =
    "market-flow-v1.manifest.json";

const loaderProbeFileName =
    "market-flow-loader-probe.bookmarklet.txt";

const loaderProbeSourceRelativePath =
    "runtime/loader-probe.js";

const stableReleaseBaseUrl =
    "https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest";

function resolveSourcePath(
    relativePath
) {
    const resolved =
        path.resolve(
            workstreamRoot,
            relativePath
        );

    if (
        resolved !==
            workstreamRoot &&
        !resolved.startsWith(
            workstreamRoot +
            path.sep
        )
    ) {
        throw new Error(
            "Runtime source path escapes the workstream root: " +
            relativePath
        );
    }

    return resolved;
}

function readSource(
    relativePath
) {
    const resolved =
        resolveSourcePath(
            relativePath
        );

    if (
        !fs.existsSync(
            resolved
        )
    ) {
        throw new Error(
            "Runtime source file is missing: " +
            relativePath
        );
    }

    return fs.readFileSync(
        resolved,
        "utf8"
    );
}

function buildRuntimeText() {
    const orderedPaths = [
        ...sourceOrder,
        entryRelativePath
    ];

    const sections =
        orderedPaths.map(
            relativePath => {
                const source =
                    readSource(
                        relativePath
                    ).trimEnd();

                return (
                    "/* Market Flow source: " +
                    relativePath +
                    " */\n" +
                    source
                );
            }
        );

    return (
        "/* Market Flow Local History Viewer V1 — generated runtime. */\n" +
        "/* Generated from repository sources by runtime/build-runtime.js. */\n\n" +
        sections.join(
            "\n\n"
        ) +
        "\n"
    );
}

function buildCompactRuntimeText(
    runtimeText
) {
    if (
        typeof runtimeText !==
            "string" ||
        runtimeText.length ===
            0
    ) {
        throw new TypeError(
            "runtimeText must be a non-empty string."
        );
    }

    const result =
        minify_sync(
            runtimeText,
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
        typeof result.code !==
            "string" ||
        result.code.length ===
            0
    ) {
        throw new Error(
            "Terser did not produce compact runtime code."
        );
    }

    if (
        /[\r\n\t]/.test(
            result.code
        )
    ) {
        throw new Error(
            "Compact runtime must be single-line JavaScript."
        );
    }

    return result.code;
}

function buildBookmarkletText(
    runtimeText
) {
    const compactRuntimeText =
        buildCompactRuntimeText(
            runtimeText
        );

    return (
        "javascript:" +
        compactRuntimeText
    );
}

function sha256Hex(
    text
) {
    if (
        typeof text !==
            "string"
    ) {
        throw new TypeError(
            "text must be a string."
        );
    }

    return crypto
        .createHash(
            "sha256"
        )
        .update(
            text,
            "utf8"
        )
        .digest(
            "hex"
        );
}

function buildRuntimeManifest(
    runtimeText
) {
    if (
        typeof runtimeText !==
            "string" ||
        runtimeText.length ===
            0
    ) {
        throw new TypeError(
            "runtimeText must be a non-empty string."
        );
    }

    const runtimeSha256 =
        sha256Hex(
            runtimeText
        );

    return Object.freeze({
        formatVersion: 1,
        buildId:
            "sha256:" +
            runtimeSha256,
        runtime:
            Object.freeze({
                fileName:
                    runtimeFileName,
                url:
                    stableReleaseBaseUrl +
                    "/" +
                    runtimeFileName,
                sha256:
                    runtimeSha256,
                bytes:
                    Buffer.byteLength(
                        runtimeText,
                        "utf8"
                    )
            })
    });
}

function buildManifestText(
    runtimeText
) {
    return (
        JSON.stringify(
            buildRuntimeManifest(
                runtimeText
            ),
            null,
            2
        ) +
        "\n"
    );
}

function buildLoaderProbeBookmarkletText() {
    const source =
        readSource(
            loaderProbeSourceRelativePath
        );

    return (
        "javascript:" +
        buildCompactRuntimeText(
            source
        )
    );
}

function buildArtifacts(
    options = {}
) {
    const outputDirectory =
        options.outputDirectory ??
        defaultOutputDirectory;

    const write =
        options.write ??
        true;

    const runtimeText =
        buildRuntimeText();

    const compactRuntimeText =
        buildCompactRuntimeText(
            runtimeText
        );

    const bookmarkletText =
        "javascript:" +
        compactRuntimeText;

    const bookmarkletBytes =
        Buffer.byteLength(
            bookmarkletText,
            "utf8"
        );

    const manifest =
        buildRuntimeManifest(
            runtimeText
        );

    const manifestText =
        JSON.stringify(
            manifest,
            null,
            2
        ) +
        "\n";

    const loaderProbeText =
        buildLoaderProbeBookmarkletText();

    const runtimePath =
        path.join(
            outputDirectory,
            runtimeFileName
        );

    const bookmarkletPath =
        path.join(
            outputDirectory,
            bookmarkletFileName
        );

    const manifestPath =
        path.join(
            outputDirectory,
            manifestFileName
        );

    const loaderProbePath =
        path.join(
            outputDirectory,
            loaderProbeFileName
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
            runtimePath,
            runtimeText,
            "utf8"
        );

        fs.writeFileSync(
            bookmarkletPath,
            bookmarkletText,
            "utf8"
        );

        fs.writeFileSync(
            manifestPath,
            manifestText,
            "utf8"
        );

        fs.writeFileSync(
            loaderProbePath,
            loaderProbeText,
            "utf8"
        );
    }

    return Object.freeze({
        sourceOrder:
            Object.freeze([
                ...sourceOrder,
                entryRelativePath
            ]),
        runtimeText,
        compactRuntimeText,
        bookmarkletText,
        manifest,
        manifestText,
        loaderProbeText,
        runtimePath,
        bookmarkletPath,
        manifestPath,
        loaderProbePath,
        runtimeBytes:
            Buffer.byteLength(
                runtimeText,
                "utf8"
            ),
        compactRuntimeBytes:
            Buffer.byteLength(
                compactRuntimeText,
                "utf8"
            ),
        bookmarkletBytes,
        manifestBytes:
            Buffer.byteLength(
                manifestText,
                "utf8"
            ),
        loaderProbeBytes:
            Buffer.byteLength(
                loaderProbeText,
                "utf8"
            )
    });
}

if (
    require.main ===
    module
) {
    const artifacts =
        buildArtifacts();

    console.log(
        JSON.stringify(
            {
                runtimePath:
                    artifacts.runtimePath,
                bookmarkletPath:
                    artifacts
                        .bookmarkletPath,
                manifestPath:
                    artifacts
                        .manifestPath,
                loaderProbePath:
                    artifacts
                        .loaderProbePath,
                sourceCount:
                    artifacts
                        .sourceOrder
                        .length,
                runtimeBytes:
                    artifacts
                        .runtimeBytes,
                compactRuntimeBytes:
                    artifacts
                        .compactRuntimeBytes,
                bookmarkletBytes:
                    artifacts
                        .bookmarkletBytes,
                manifestBytes:
                    artifacts
                        .manifestBytes,
                loaderProbeBytes:
                    artifacts
                        .loaderProbeBytes,
                buildId:
                    artifacts
                        .manifest
                        .buildId
            },
            null,
            2
        )
    );
}

module.exports =
    Object.freeze({
        sourceOrder,
        entryRelativePath,
        runtimeFileName,
        bookmarkletFileName,
        manifestFileName,
        loaderProbeFileName,
        loaderProbeSourceRelativePath,
        stableReleaseBaseUrl,
        buildRuntimeText,
        buildCompactRuntimeText,
        buildBookmarkletText,
        buildRuntimeManifest,
        buildManifestText,
        buildLoaderProbeBookmarkletText,
        buildArtifacts
    });
