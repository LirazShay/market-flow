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
        root.MarketFlowChannelMessageLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const CHANNEL_NAME =
            "market-flow-leumi-v2";

        const MESSAGE_TYPES =
            Object.freeze({
                RECORDER_STARTED:
                    "RECORDER_STARTED",
                RECORDER_HEARTBEAT:
                    "RECORDER_HEARTBEAT",
                CYCLE_COMMITTED:
                    "CYCLE_COMMITTED",
                RECORDER_STOPPED:
                    "RECORDER_STOPPED",
                RECORDER_ERROR:
                    "RECORDER_ERROR",
                DATABASE_CLEARED:
                    "DATABASE_CLEARED"
            });

        const VALID_TYPES =
            new Set(
                Object.values(
                    MESSAGE_TYPES
                )
            );

        function assertFiniteTime(
            value,
            name
        ) {
            if (
                !Number.isFinite(value) ||
                value < 0
            ) {
                throw new TypeError(
                    name +
                    " must be a non-negative finite number."
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

        function createMessage(
            type,
            {
                atMs,
                metadata = {}
            }
        ) {
            if (!VALID_TYPES.has(type)) {
                throw new Error(
                    "Unknown Market Flow channel message type: " +
                    type
                );
            }

            assertFiniteTime(
                atMs,
                "atMs"
            );

            if (
                !metadata ||
                typeof metadata !==
                    "object" ||
                Array.isArray(metadata)
            ) {
                throw new TypeError(
                    "metadata must be an object."
                );
            }

            if (
                type ===
                MESSAGE_TYPES
                    .CYCLE_COMMITTED
            ) {
                assertPositiveInteger(
                    metadata.cycleId,
                    "metadata.cycleId"
                );

                assertFiniteTime(
                    metadata.completedAtMs,
                    "metadata.completedAtMs"
                );
            }

            return Object.freeze({
                type,
                atMs,
                metadata:
                    Object.freeze({
                        ...metadata
                    })
            });
        }

        function isRefreshMessage(
            message
        ) {
            return Boolean(
                message &&
                message.type ===
                    MESSAGE_TYPES
                        .CYCLE_COMMITTED
            );
        }

        return Object.freeze({
            CHANNEL_NAME,
            MESSAGE_TYPES,
            createMessage,
            isRefreshMessage
        });
    }
);
