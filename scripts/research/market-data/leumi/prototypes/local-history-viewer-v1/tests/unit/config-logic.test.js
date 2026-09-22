"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    DEFAULT_CONFIG,
    createConfig
} = require(
    "../../recorder/pure/config-logic"
);

test(
    "default config exposes the verified recorder defaults",
    () => {
        assert.deepEqual(
            DEFAULT_CONFIG,
            {
                snapshotIntervalMs: 3000,
                chunkDelayMs: 1000,
                chunkSize: 187,
                refreshUniverseEveryCycle: false
            }
        );
    }
);

test(
    "default config is frozen",
    () => {
        assert.equal(
            Object.isFrozen(DEFAULT_CONFIG),
            true
        );
    }
);

test(
    "createConfig returns defaults when no overrides are supplied",
    () => {
        assert.deepEqual(
            createConfig(),
            DEFAULT_CONFIG
        );
    }
);

test(
    "createConfig applies valid overrides without mutating defaults",
    () => {
        const config = createConfig({
            snapshotIntervalMs: 0,
            chunkDelayMs: 0,
            chunkSize: 25,
            refreshUniverseEveryCycle: true
        });

        assert.deepEqual(
            config,
            {
                snapshotIntervalMs: 0,
                chunkDelayMs: 0,
                chunkSize: 25,
                refreshUniverseEveryCycle: true
            }
        );

        assert.equal(
            DEFAULT_CONFIG.chunkSize,
            187
        );
    }
);

test(
    "created config is frozen",
    () => {
        assert.equal(
            Object.isFrozen(
                createConfig()
            ),
            true
        );
    }
);

for (const value of [
    -1,
    1.5,
    "3000",
    NaN
]) {
    test(
        "snapshotIntervalMs rejects invalid value: " +
        String(value),
        () => {
            assert.throws(
                () => createConfig({
                    snapshotIntervalMs: value
                }),
                {
                    name: "TypeError",
                    message:
                        "snapshotIntervalMs must be a non-negative integer."
                }
            );
        }
    );
}

for (const value of [
    -1,
    1.5,
    "1000",
    NaN
]) {
    test(
        "chunkDelayMs rejects invalid value: " +
        String(value),
        () => {
            assert.throws(
                () => createConfig({
                    chunkDelayMs: value
                }),
                {
                    name: "TypeError",
                    message:
                        "chunkDelayMs must be a non-negative integer."
                }
            );
        }
    );
}

for (const value of [
    0,
    -1,
    1.5,
    "187",
    NaN
]) {
    test(
        "chunkSize rejects invalid value: " +
        String(value),
        () => {
            assert.throws(
                () => createConfig({
                    chunkSize: value
                }),
                {
                    name: "TypeError",
                    message:
                        "chunkSize must be a positive integer."
                }
            );
        }
    );
}

for (const value of [
    0,
    1,
    "false",
    null,
    undefined
]) {
    test(
        "refreshUniverseEveryCycle rejects non-boolean value: " +
        String(value),
        () => {
            assert.throws(
                () => createConfig({
                    refreshUniverseEveryCycle: value
                }),
                {
                    name: "TypeError",
                    message:
                        "refreshUniverseEveryCycle must be a boolean."
                }
            );
        }
    );
}

test(
    "minimum valid positive chunkSize is accepted",
    () => {
        assert.equal(
            createConfig({
                chunkSize: 1
            }).chunkSize,
            1
        );
    }
);
