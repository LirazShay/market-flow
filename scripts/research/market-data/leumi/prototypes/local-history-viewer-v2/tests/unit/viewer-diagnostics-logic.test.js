"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    STALE_AFTER_MS,
    HEALTH_LABELS,
    deriveRecorderHealth,
    createDiagnosticsModel
} = require(
    "../../viewer/pure/diagnostics-logic"
);

function createRunningState(
    overrides = {}
) {
    return {
        instanceId:
            "recorder-1",
        sessionId:
            7,
        status:
            "running",
        recordingStartedAtMs:
            1000,
        lastHeartbeatAtMs:
            20000,
        lastCompletedCycleId:
            42,
        lastCompletedAtMs:
            19000,
        completedCycles:
            5,
        failedCycles:
            2,
        lastError:
            null,
        config: {
            intervalMs:
                10000
        },
        ...overrides
    };
}

test(
    "Stage 15.2 recorder health uses the documented Hebrew labels and 15-second stale threshold",
    () => {
        assert.equal(
            STALE_AFTER_MS,
            15000
        );

        assert.deepEqual(
            HEALTH_LABELS,
            {
                UNKNOWN:
                    "לא ידוע",
                RUNNING:
                    "רץ",
                STALE:
                    "לא מעודכן",
                STOPPED:
                    "נעצר",
                ERROR:
                    "שגיאה"
            }
        );

        assert.deepEqual(
            deriveRecorderHealth(
                null,
                30000
            ),
            {
                code:
                    "UNKNOWN",
                label:
                    "לא ידוע",
                heartbeatAgeMs:
                    null
            }
        );

        assert.deepEqual(
            deriveRecorderHealth(
                createRunningState(),
                34999
            ),
            {
                code:
                    "RUNNING",
                label:
                    "רץ",
                heartbeatAgeMs:
                    14999
            }
        );

        assert.deepEqual(
            deriveRecorderHealth(
                createRunningState(),
                35000
            ),
            {
                code:
                    "STALE",
                label:
                    "לא מעודכן",
                heartbeatAgeMs:
                    15000
            }
        );
    }
);

test(
    "Stage 15.2 recorder health precedence is STOPPED then STALE then ERROR then RUNNING",
    () => {
        assert.equal(
            deriveRecorderHealth(
                createRunningState({
                    status:
                        "stopped",
                    lastError: {
                        message:
                            "previous failure"
                    },
                    lastHeartbeatAtMs:
                        1000
                }),
                999999
            ).code,
            "STOPPED"
        );

        assert.equal(
            deriveRecorderHealth(
                createRunningState({
                    lastError: {
                        message:
                            "latest cycle failed"
                    },
                    lastHeartbeatAtMs:
                        1000
                }),
                20000
            ).code,
            "STALE"
        );

        assert.equal(
            deriveRecorderHealth(
                createRunningState({
                    lastError: {
                        message:
                            "latest cycle failed"
                    }
                }),
                21000
            ).code,
            "ERROR"
        );

        assert.equal(
            deriveRecorderHealth(
                createRunningState(),
                21000
            ).code,
            "RUNNING"
        );
    }
);

test(
    "Stage 15.2 diagnostics model maps persisted metrics without collapsing zero into missing",
    () => {
        const model =
            createDiagnosticsModel(
                {
                    recorderState:
                        createRunningState({
                            completedCycles:
                                0,
                            failedCycles:
                                0
                        }),
                    lastCycle: {
                        cycleId:
                            42,
                        durationMs:
                            800,
                        status:
                            "complete"
                    },
                    rowCounts: {
                        meta:
                            2,
                        sessions:
                            1,
                        universe:
                            2,
                        cycles:
                            8,
                        latest:
                            0,
                        history:
                            0
                    },
                    storage: {
                        usageBytes:
                            4096,
                        quotaBytes:
                            10000,
                        freeBytes:
                            5904,
                        usageRatio:
                            0.4096
                    }
                },
                21000
            );

        assert.deepEqual(
            model,
            {
                recorderHealth: {
                    code:
                        "RUNNING",
                    label:
                        "רץ",
                    heartbeatAgeMs:
                        1000
                },
                lastCompletedAtMs:
                    19000,
                lastCompletedCycleId:
                    42,
                lastCycleDurationMs:
                    800,
                latestCount:
                    0,
                completedCycles:
                    0,
                failedCycles:
                    0,
                historyCount:
                    0,
                storage: {
                    usageBytes:
                        4096,
                    quotaBytes:
                        10000,
                    freeBytes:
                        5904,
                    usageRatio:
                        0.4096
                },
                lastError:
                    null
            }
        );
    }
);

test(
    "Stage 15.2 diagnostics model preserves unknown recorder metrics as null",
    () => {
        const model =
            createDiagnosticsModel(
                {
                    recorderState:
                        null,
                    lastCycle:
                        null,
                    rowCounts: {
                        meta:
                            0,
                        sessions:
                            0,
                        universe:
                            0,
                        cycles:
                            0,
                        latest:
                            0,
                        history:
                            0
                    },
                    storage: {
                        usageBytes:
                            null,
                        quotaBytes:
                            null,
                        freeBytes:
                            null,
                        usageRatio:
                            null
                    }
                },
                1000
            );

        assert.equal(
            model.recorderHealth.code,
            "UNKNOWN"
        );

        assert.equal(
            model.lastCompletedAtMs,
            null
        );

        assert.equal(
            model.lastCompletedCycleId,
            null
        );

        assert.equal(
            model.lastCycleDurationMs,
            null
        );

        assert.equal(
            model.completedCycles,
            null
        );

        assert.equal(
            model.failedCycles,
            null
        );

        assert.equal(
            model.latestCount,
            0
        );

        assert.equal(
            model.historyCount,
            0
        );
    }
);

test(
    "Stage 15.2 diagnostics logic rejects invalid persisted recorder status and invalid current time",
    () => {
        assert.throws(
            () =>
                deriveRecorderHealth(
                    createRunningState({
                        status:
                            "mystery"
                    }),
                    21000
                ),
            /unsupported recorder status/
        );

        assert.throws(
            () =>
                deriveRecorderHealth(
                    createRunningState(),
                    Number.NaN
                ),
            /nowMs/
        );
    }
);
