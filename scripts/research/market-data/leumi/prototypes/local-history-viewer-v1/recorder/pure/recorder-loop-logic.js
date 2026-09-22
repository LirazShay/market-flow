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
        root.MarketFlowRecorderLoopLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        function assertFunction(
            value,
            name
        ) {
            if (
                typeof value !==
                "function"
            ) {
                throw new TypeError(
                    name +
                    " must be a function."
                );
            }
        }

        function assertTime(
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

        function computeNextDelay(
            snapshotIntervalMs,
            cycleStartedAtMs,
            cycleFinishedAtMs
        ) {
            if (
                !Number.isInteger(
                    snapshotIntervalMs
                ) ||
                snapshotIntervalMs < 0
            ) {
                throw new TypeError(
                    "snapshotIntervalMs must be a non-negative integer."
                );
            }

            assertTime(
                cycleStartedAtMs,
                "cycleStartedAtMs"
            );

            assertTime(
                cycleFinishedAtMs,
                "cycleFinishedAtMs"
            );

            if (
                cycleFinishedAtMs <
                cycleStartedAtMs
            ) {
                throw new Error(
                    "cycleFinishedAtMs cannot be earlier than cycleStartedAtMs."
                );
            }

            return Math.max(
                0,
                snapshotIntervalMs -
                (
                    cycleFinishedAtMs -
                    cycleStartedAtMs
                )
            );
        }

        function createRecorderController({
            createConfig,
            loadUniverse,
            buildCompleteCycle,
            schedule,
            cancelSchedule,
            now
        }) {
            assertFunction(
                createConfig,
                "createConfig"
            );

            assertFunction(
                loadUniverse,
                "loadUniverse"
            );

            assertFunction(
                buildCompleteCycle,
                "buildCompleteCycle"
            );

            assertFunction(
                schedule,
                "schedule"
            );

            assertFunction(
                cancelSchedule,
                "cancelSchedule"
            );

            assertFunction(
                now,
                "now"
            );

            let config = null;
            let cachedUniverse = null;
            let timerHandle = null;
            let cycleInFlight = false;

            let state = {
                status:
                    "idle",
                isRunning:
                    false,
                cycleInFlight:
                    false,
                startedAtMs:
                    null,
                stoppedAtMs:
                    null,
                stopReason:
                    null,
                lastCycleStartedAtMs:
                    null,
                lastCycleFinishedAtMs:
                    null,
                nextScheduledAtMs:
                    null,
                completedCycles:
                    0,
                failedCycles:
                    0,
                latestCycle:
                    null,
                latestError:
                    null
            };

            function updateState(
                patch
            ) {
                state = {
                    ...state,
                    ...patch
                };
            }

            function snapshot() {
                return Object.freeze({
                    ...state,
                    config
                });
            }

            function scheduleNext(
                delayMs
            ) {
                if (!state.isRunning) {
                    return;
                }

                const currentTime =
                    now();

                assertTime(
                    currentTime,
                    "now()"
                );

                updateState({
                    status:
                        "waiting",
                    nextScheduledAtMs:
                        currentTime +
                        delayMs
                });

                timerHandle =
                    schedule(
                        () => {
                            timerHandle =
                                null;

                            updateState({
                                nextScheduledAtMs:
                                    null
                            });

                            return runOneCycle();
                        },
                        delayMs
                    );
            }

            async function runOneCycle() {
                if (
                    !state.isRunning ||
                    cycleInFlight
                ) {
                    return snapshot();
                }

                cycleInFlight = true;

                const cycleStartedAtMs =
                    now();

                assertTime(
                    cycleStartedAtMs,
                    "now()"
                );

                updateState({
                    status:
                        "running-cycle",
                    cycleInFlight:
                        true,
                    lastCycleStartedAtMs:
                        cycleStartedAtMs
                });

                try {
                    if (
                        cachedUniverse ===
                            null ||
                        config
                            .refreshUniverseEveryCycle
                    ) {
                        cachedUniverse =
                            await loadUniverse(
                                config
                            );
                    }

                    const cycle =
                        await buildCompleteCycle(
                            cachedUniverse
                        );

                    updateState({
                        completedCycles:
                            state
                                .completedCycles +
                            1,
                        latestCycle:
                            cycle,
                        latestError:
                            null
                    });
                } catch (error) {
                    const errorAtMs =
                        now();

                    assertTime(
                        errorAtMs,
                        "now()"
                    );

                    updateState({
                        failedCycles:
                            state
                                .failedCycles +
                            1,
                        latestError:
                            Object.freeze({
                                name:
                                    error
                                        ?.name ??
                                    "Error",
                                message:
                                    error
                                        ?.message ??
                                    String(error),
                                atMs:
                                    errorAtMs
                            })
                    });
                } finally {
                    const cycleFinishedAtMs =
                        now();

                    assertTime(
                        cycleFinishedAtMs,
                        "now()"
                    );

                    cycleInFlight =
                        false;

                    updateState({
                        cycleInFlight:
                            false,
                        lastCycleFinishedAtMs:
                            cycleFinishedAtMs
                    });

                    if (
                        state.isRunning
                    ) {
                        scheduleNext(
                            computeNextDelay(
                                config
                                    .snapshotIntervalMs,
                                cycleStartedAtMs,
                                cycleFinishedAtMs
                            )
                        );
                    } else {
                        updateState({
                            status:
                                "stopped",
                            nextScheduledAtMs:
                                null
                        });
                    }
                }

                return snapshot();
            }

            function start(
                configOverrides = {}
            ) {
                if (state.isRunning) {
                    throw new Error(
                        "Recorder is already running."
                    );
                }

                if (cycleInFlight) {
                    throw new Error(
                        "Recorder cannot start while a previous cycle is still in flight."
                    );
                }

                config =
                    createConfig(
                        configOverrides
                    );

                cachedUniverse =
                    null;

                const startedAtMs =
                    now();

                assertTime(
                    startedAtMs,
                    "now()"
                );

                state = {
                    status:
                        "waiting",
                    isRunning:
                        true,
                    cycleInFlight:
                        false,
                    startedAtMs,
                    stoppedAtMs:
                        null,
                    stopReason:
                        null,
                    lastCycleStartedAtMs:
                        null,
                    lastCycleFinishedAtMs:
                        null,
                    nextScheduledAtMs:
                        null,
                    completedCycles:
                        0,
                    failedCycles:
                        0,
                    latestCycle:
                        null,
                    latestError:
                        null
                };

                scheduleNext(0);

                return snapshot();
            }

            function stop(
                reason = "manual"
            ) {
                if (!state.isRunning) {
                    return snapshot();
                }

                const stoppedAtMs =
                    now();

                assertTime(
                    stoppedAtMs,
                    "now()"
                );

                updateState({
                    isRunning:
                        false,
                    status:
                        cycleInFlight
                            ? "stopping"
                            : "stopped",
                    stoppedAtMs,
                    stopReason:
                        reason,
                    nextScheduledAtMs:
                        null
                });

                if (
                    timerHandle !==
                    null
                ) {
                    cancelSchedule(
                        timerHandle
                    );

                    timerHandle =
                        null;
                }

                return snapshot();
            }

            return Object.freeze({
                start,
                stop,
                getState:
                    snapshot
            });
        }

        return Object.freeze({
            computeNextDelay,
            createRecorderController
        });
    }
);
