"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");

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

function buildBookmarkletText(
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

    return (
        "javascript:" +
        encodeURIComponent(
            runtimeText
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

    const bookmarkletText =
        buildBookmarkletText(
            runtimeText
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
        bookmarkletText,
        runtimePath,
        bookmarkletPath,
        runtimeBytes:
            Buffer.byteLength(
                runtimeText,
                "utf8"
            ),
        bookmarkletBytes:
            Buffer.byteLength(
                bookmarkletText,
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
                sourceCount:
                    artifacts
                        .sourceOrder
                        .length,
                runtimeBytes:
                    artifacts
                        .runtimeBytes,
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
        buildBookmarkletText,
        buildArtifacts
    });
