(function (root, factory) {
    "use strict";

    const api = factory();

    if (
        typeof module === "object" &&
        module.exports
    ) {
        module.exports = api;
    }

    if (root) {
        root.MarketFlowRecorderConfigLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const DEFAULT_CONFIG = Object.freeze({
            snapshotIntervalMs: 3000,
            chunkDelayMs: 1000,
            chunkSize: 187,
            refreshUniverseEveryCycle: false
        });

        function assertNonNegativeInteger(
            value,
            name
        ) {
            if (
                !Number.isInteger(value) ||
                value < 0
            ) {
                throw new TypeError(
                    name +
                    " must be a non-negative integer."
                );
            }
        }

        function assertPositiveInteger(
            value,
            name
        ) {
            if (
                !Number.isInteger(value) ||
                value <= 0
            ) {
                throw new TypeError(
                    name +
                    " must be a positive integer."
                );
            }
        }

        function createConfig(
            overrides = {}
        ) {
            const config = {
                ...DEFAULT_CONFIG,
                ...overrides
            };

            assertNonNegativeInteger(
                config.snapshotIntervalMs,
                "snapshotIntervalMs"
            );

            assertNonNegativeInteger(
                config.chunkDelayMs,
                "chunkDelayMs"
            );

            assertPositiveInteger(
                config.chunkSize,
                "chunkSize"
            );

            if (
                typeof config
                    .refreshUniverseEveryCycle !==
                "boolean"
            ) {
                throw new TypeError(
                    "refreshUniverseEveryCycle must be a boolean."
                );
            }

            return Object.freeze(config);
        }

        return Object.freeze({
            DEFAULT_CONFIG,
            createConfig
        });
    }
);
