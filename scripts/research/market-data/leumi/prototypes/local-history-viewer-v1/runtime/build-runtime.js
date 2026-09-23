"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
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
        runtimePath,
        bookmarkletPath,
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
        bookmarkletBytes
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
                        .bookmarkletBytes
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
        buildRuntimeText,
        buildCompactRuntimeText,
        buildBookmarkletText,
        buildArtifacts
    });
