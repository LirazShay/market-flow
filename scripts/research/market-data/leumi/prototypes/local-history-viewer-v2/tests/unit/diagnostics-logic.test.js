"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizeError,
    normalizeStorageEstimate
} = require(
    "../../recorder/pure/diagnostics-logic"
);

test(
    "normalizeError creates a stable serializable error contract",
    () => {
        const error =
            new TypeError(
                "fixture failure"
            );

        assert.deepEqual(
            normalizeError(
                error,
                1234
            ),
            {
                name:
                    "TypeError",
                message:
                    "fixture failure",
                atMs:
                    1234
            }
        );
    }
);

test(
    "normalizeStorageEstimate derives bytes and ratio without inventing unavailable values",
    () => {
        assert.deepEqual(
            normalizeStorageEstimate({
                usage: 40,
                quota: 100
            }),
            {
                usageBytes: 40,
                quotaBytes: 100,
                freeBytes: 60,
                usageRatio: 0.4
            }
        );

        assert.deepEqual(
            normalizeStorageEstimate(
                undefined
            ),
            {
                usageBytes: null,
                quotaBytes: null,
                freeBytes: null,
                usageRatio: null
            }
        );
    }
);
