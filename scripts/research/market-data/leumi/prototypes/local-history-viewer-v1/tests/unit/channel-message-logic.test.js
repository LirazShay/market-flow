"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    CHANNEL_NAME,
    MESSAGE_TYPES,
    createMessage,
    isRefreshMessage
} = require(
    "../../messaging/pure/channel-message-logic"
);

test(
    "Stage 12 channel contract uses the documented channel name and minimal message types",
    () => {
        assert.equal(
            CHANNEL_NAME,
            "market-flow-leumi-v1"
        );

        assert.deepEqual(
            Object.values(
                MESSAGE_TYPES
            ),
            [
                "RECORDER_STARTED",
                "RECORDER_HEARTBEAT",
                "CYCLE_COMMITTED",
                "RECORDER_STOPPED",
                "RECORDER_ERROR",
                "DATABASE_CLEARED"
            ]
        );
    }
);

test(
    "Stage 12 CYCLE_COMMITTED message contains metadata only",
    () => {
        const message =
            createMessage(
                MESSAGE_TYPES
                    .CYCLE_COMMITTED,
                {
                    atMs: 1200,
                    metadata: {
                        cycleId: 7,
                        completedAtMs:
                            1100
                    }
                }
            );

        assert.deepEqual(
            message,
            {
                type:
                    "CYCLE_COMMITTED",
                atMs:
                    1200,
                metadata: {
                    cycleId:
                        7,
                    completedAtMs:
                        1100
                }
            }
        );

        assert.equal(
            Object.hasOwn(
                message,
                "records"
            ),
            false
        );

        assert.equal(
            isRefreshMessage(
                message
            ),
            true
        );
    }
);

test(
    "Stage 12 message validation rejects unknown types and invalid committed-cycle metadata",
    () => {
        assert.throws(
            () =>
                createMessage(
                    "UNKNOWN",
                    {
                        atMs: 1
                    }
                ),
            /Unknown Market Flow/
        );

        assert.throws(
            () =>
                createMessage(
                    MESSAGE_TYPES
                        .CYCLE_COMMITTED,
                    {
                        atMs: 1,
                        metadata: {
                            cycleId: 0,
                            completedAtMs:
                                2
                        }
                    }
                ),
            /positive integer/
        );
    }
);

test(
    "Stage 12 non-cycle messages do not request current-table refresh",
    () => {
        const message =
            createMessage(
                MESSAGE_TYPES
                    .RECORDER_HEARTBEAT,
                {
                    atMs: 100,
                    metadata: {
                        sessionId: 4
                    }
                }
            );

        assert.equal(
            isRefreshMessage(
                message
            ),
            false
        );
    }
);
