"use strict";

const fs = require("node:fs");
const path = require("node:path");

const analyzerPath =
    path.join(
        __dirname,
        "history-coverage-analyzer.js"
    );

const bookmarkletPath =
    path.join(
        __dirname,
        "run-history-coverage.bookmarklet.txt"
    );

function normalizeToSingleLine(
    source
) {
    if (
        typeof source !== "string" ||
        source.length === 0
    ) {
        throw new TypeError(
            "source must be a non-empty string."
        );
    }

    if (
        /(^|\n)\s*\/\//.test(
            source
        )
    ) {
        throw new Error(
            "Analyzer source contains line comments; " +
            "single-line conversion would be unsafe."
        );
    }

    return source
        .replace(
            /\r\n?/g,
            "\n"
        )
        .trim()
        .replace(
            /\n/g,
            " "
        );
}

function buildBookmarkletText(
    analyzerSource
) {
    const analyzer =
        normalizeToSingleLine(
            analyzerSource
        );

    const runner =
        ";window.__marketFlowIssue15CoverageRunPromise=" +
        "(async()=>{" +
        "try{" +
        "const report=await window.MarketFlowIssue15HistoryCoverage.run({download:true});" +
        "console.log('[Issue #15] real-history coverage report downloaded',report);" +
        "return report;" +
        "}catch(error){" +
        "console.error('[Issue #15] history coverage measurement failed',error);" +
        "alert('Market Flow Issue #15 measurement failed: '+(error?.message??String(error)));" +
        "throw error;" +
        "}" +
        "})();";

    return (
        "javascript:" +
        analyzer +
        runner
    );
}

function buildArtifact(
    options = {}
) {
    const source =
        fs.readFileSync(
            options.analyzerPath ??
                analyzerPath,
            "utf8"
        );

    const bookmarklet =
        buildBookmarkletText(
            source
        );

    const outputPath =
        options.outputPath ??
        bookmarkletPath;

    if (
        options.write !==
        false
    ) {
        fs.writeFileSync(
            outputPath,
            bookmarklet,
            "utf8"
        );
    }

    return Object.freeze({
        analyzerPath:
            options.analyzerPath ??
            analyzerPath,
        outputPath,
        bookmarklet,
        byteLength:
            Buffer.byteLength(
                bookmarklet,
                "utf8"
            )
    });
}

if (
    require.main ===
    module
) {
    const result =
        buildArtifact();

    console.log(
        JSON.stringify(
            {
                outputPath:
                    result.outputPath,
                byteLength:
                    result.byteLength
            },
            null,
            2
        )
    );
}

module.exports =
    Object.freeze({
        analyzerPath,
        bookmarkletPath,
        normalizeToSingleLine,
        buildBookmarkletText,
        buildArtifact
    });
