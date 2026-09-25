"use strict";

// Temporary WP-01 diagnostic. It is removed after the CI-generated lockfile is captured.
const fs =
    require("node:fs");
const path =
    require("node:path");
const zlib =
    require("node:zlib");
const test =
    require("node:test");
const assert =
    require("node:assert/strict");

test(
    "WP-01 temporary lockfile capture",
    () => {
        const lockPath =
            path.resolve(
                __dirname,
                "../..",
                "package-lock.json"
            );

        const lockText =
            fs.readFileSync(
                lockPath,
                "utf8"
            );

        const lock =
            JSON.parse(
                lockText
            );

        assert.equal(
            lock.packages[""]
                .dependencies[
                    "@duckdb/duckdb-wasm"
                ],
            "1.33.0"
        );

        assert.equal(
            lock.packages[
                "node_modules/@duckdb/duckdb-wasm"
            ].version,
            "1.33.0"
        );

        console.log(
            "MARKET_FLOW_WP01_LOCKFILE_GZIP_BASE64=" +
            zlib
                .gzipSync(
                    Buffer.from(
                        lockText,
                        "utf8"
                    )
                )
                .toString(
                    "base64"
                )
        );
    }
);
