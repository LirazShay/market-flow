"use strict";

const fs = require("node:fs");
const path = require("node:path");

const unitDirectory = __dirname;

const testFiles = fs
    .readdirSync(unitDirectory)
    .filter(
        fileName =>
            fileName.endsWith(".test.js")
    )
    .sort();

if (testFiles.length === 0) {
    throw new Error(
        "No unit test files were found."
    );
}

for (const fileName of testFiles) {
    require(
        path.join(
            unitDirectory,
            fileName
        )
    );
}
