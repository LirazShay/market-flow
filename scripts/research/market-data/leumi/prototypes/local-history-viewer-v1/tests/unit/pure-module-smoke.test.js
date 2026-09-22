"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const configLogic = require(
    "../../recorder/pure/config-logic"
);
const universeLogic = require(
    "../../recorder/pure/universe-logic"
);

test(
    "pure recorder logic loads in Node without browser globals",
    () => {
        assert.equal(
            typeof window,
            "undefined"
        );

        assert.equal(
            configLogic.DEFAULT_CONFIG
                .chunkSize,
            187
        );

        assert.equal(
            typeof configLogic.createConfig,
            "function"
        );

        assert.equal(
            typeof universeLogic.createChunks,
            "function"
        );

        assert.equal(
            typeof universeLogic
                .validatePaperIds,
            "function"
        );

        assert.equal(
            typeof universeLogic
                .validateFullMap,
            "function"
        );
    }
);
