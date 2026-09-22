"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    VIEWER_STATES,
    RECORDER_HEALTH,
    createInitialViewerState
} = require(
    "../../viewer/pure/viewer-state"
);

test(
    "Stage 10 initial viewer state is BOOTING with unknown recorder health",
    () => {
        const state =
            createInitialViewerState(
                1234
            );

        assert.deepEqual(
            state,
            {
                viewState:
                    VIEWER_STATES
                        .BOOTING,
                recorderHealth:
                    RECORDER_HEALTH
                        .UNKNOWN,
                openedAtMs:
                    1234,
                selectedSecurityId:
                    null,
                latestError:
                    null
            }
        );
    }
);

test(
    "Stage 10 viewer state contract exposes all planned V1 states",
    () => {
        assert.deepEqual(
            Object.values(
                VIEWER_STATES
            ),
            [
                "BOOTING",
                "EMPTY",
                "MAIN",
                "DETAIL",
                "ERROR"
            ]
        );

        assert.deepEqual(
            Object.values(
                RECORDER_HEALTH
            ),
            [
                "UNKNOWN",
                "RUNNING",
                "STALE",
                "STOPPED",
                "ERROR"
            ]
        );
    }
);

test(
    "createInitialViewerState rejects invalid timestamps",
    () => {
        assert.throws(
            () =>
                createInitialViewerState(
                    -1
                ),
            /non-negative finite number/
        );

        assert.throws(
            () =>
                createInitialViewerState(
                    Number.NaN
                ),
            /non-negative finite number/
        );
    }
);
