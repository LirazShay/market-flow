"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    computeNextDelay,
    createRecorderController
} = require(
    "../../recorder/pure/recorder-loop-logic"
);

function createFakeScheduler() {
    let nextId = 1;
    const tasks = [];

    return {
        tasks,

        schedule(callback, delayMs) {
            const task = {
                id: nextId++,
                callback,
                delayMs,
                cancelled: false
            };

            tasks.push(task);

            return task.id;
        },

        cancel(taskId) {
            const task =
                tasks.find(
                    item =>
                        item.id === taskId
                );

            if (task) {
                task.cancelled = true;
            }
        },

        async runNext() {
            const task =
                tasks.find(
                    item =>
                        !item.cancelled &&
                        !item.executed
                );

            if (!task) {
                throw new Error(
                    "No runnable scheduled task."
                );
            }

            task.executed = true;

            return await task.callback();
        },

        pending() {
            return tasks.filter(
                item =>
                    !item.cancelled &&
                    !item.executed
            );
        }
    };
}

function createConfig(
    overrides = {}
) {
    return Object.freeze({
        snapshotIntervalMs: 100,
        chunkDelayMs: 0,
        chunkSize: 2,
        refreshUniverseEveryCycle: false,
        ...overrides
    });
}

function createUniverse(
    config
) {
    return Object.freeze({
        recordCount: 2,
        securityIds:
            Object.freeze([
                "1001",
                "1002"
            ]),
        chunks:
            Object.freeze([
                Object.freeze([
                    1001,
                    1002
                ])
            ]),
        config
    });
}

test(
    "computeNextDelay waits only for the remaining target cadence",
    () => {
        assert.equal(
            computeNextDelay(
                100,
                1000,
                1040
            ),
            60
        );

        assert.equal(
            computeNextDelay(
                100,
                1000,
                1100
            ),
            0
        );

        assert.equal(
            computeNextDelay(
                100,
                1000,
                1250
            ),
            0
        );
    }
);

test(
    "start schedules the first cycle immediately and exposes running state",
    () => {
        const scheduler =
            createFakeScheduler();

        let clock = 10;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () => ({
                        status:
                            "complete"
                    }),
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        const state =
            controller.start({
                snapshotIntervalMs:
                    250
            });

        assert.equal(
            state.isRunning,
            true
        );

        assert.equal(
            state.status,
            "waiting"
        );

        assert.equal(
            state.config
                .snapshotIntervalMs,
            250
        );

        assert.equal(
            scheduler.pending()
                .length,
            1
        );

        assert.equal(
            scheduler.pending()[0]
                .delayMs,
            0
        );

        assert.equal(
            state.nextScheduledAtMs,
            10
        );
    }
);

test(
    "successful cycle updates latest state and schedules from cycle start cadence",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 1000;
        let loadCalls = 0;
        let buildCalls = 0;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config => {
                        loadCalls++;
                        clock += 10;

                        return createUniverse(
                            config
                        );
                    },
                buildCompleteCycle:
                    async () => {
                        buildCalls++;
                        clock += 30;

                        return {
                            status:
                                "complete",
                            marker:
                                buildCalls
                        };
                    },
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start({
            snapshotIntervalMs:
                100
        });

        await scheduler.runNext();

        const state =
            controller.getState();

        assert.equal(
            loadCalls,
            1
        );

        assert.equal(
            buildCalls,
            1
        );

        assert.equal(
            state.completedCycles,
            1
        );

        assert.equal(
            state.failedCycles,
            0
        );

        assert.equal(
            state.latestCycle.marker,
            1
        );

        assert.equal(
            state.latestError,
            null
        );

        assert.equal(
            state.status,
            "waiting"
        );

        assert.equal(
            scheduler.pending()[0]
                .delayMs,
            60
        );
    }
);

test(
    "cycle longer than target cadence schedules the next cycle immediately without overlap",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 0;
        let activeCycles = 0;
        let maxActiveCycles = 0;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () => {
                        activeCycles++;

                        maxActiveCycles =
                            Math.max(
                                maxActiveCycles,
                                activeCycles
                            );

                        clock += 150;
                        activeCycles--;

                        return {
                            status:
                                "complete"
                        };
                    },
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start({
            snapshotIntervalMs:
                100
        });

        await scheduler.runNext();

        assert.equal(
            maxActiveCycles,
            1
        );

        assert.equal(
            scheduler.pending()[0]
                .delayMs,
            0
        );

        await scheduler.runNext();

        assert.equal(
            maxActiveCycles,
            1
        );
    }
);

test(
    "universe is reused when refreshUniverseEveryCycle is false",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 0;
        let loadCalls = 0;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config => {
                        loadCalls++;

                        return createUniverse(
                            config
                        );
                    },
                buildCompleteCycle:
                    async () => {
                        clock += 100;

                        return {
                            status:
                                "complete"
                        };
                    },
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start();

        await scheduler.runNext();
        await scheduler.runNext();

        assert.equal(
            loadCalls,
            1
        );
    }
);

test(
    "universe is refreshed for every cycle when configured",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 0;
        let loadCalls = 0;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config => {
                        loadCalls++;

                        return createUniverse(
                            config
                        );
                    },
                buildCompleteCycle:
                    async () => {
                        clock += 100;

                        return {
                            status:
                                "complete"
                        };
                    },
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start({
            refreshUniverseEveryCycle:
                true
        });

        await scheduler.runNext();
        await scheduler.runNext();

        assert.equal(
            loadCalls,
            2
        );
    }
);

test(
    "failed cycle is recorded in memory and loop continues",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 0;
        let buildCalls = 0;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () => {
                        buildCalls++;
                        clock += 20;

                        if (
                            buildCalls === 1
                        ) {
                            throw new Error(
                                "synthetic failure"
                            );
                        }

                        return {
                            status:
                                "complete",
                            marker:
                                "recovered"
                        };
                    },
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start();

        await scheduler.runNext();

        let state =
            controller.getState();

        assert.equal(
            state.failedCycles,
            1
        );

        assert.equal(
            state.completedCycles,
            0
        );

        assert.equal(
            state.latestError.message,
            "synthetic failure"
        );

        assert.equal(
            scheduler.pending()
                .length,
            1
        );

        clock +=
            scheduler.pending()[0]
                .delayMs;

        await scheduler.runNext();

        state =
            controller.getState();

        assert.equal(
            state.failedCycles,
            1
        );

        assert.equal(
            state.completedCycles,
            1
        );

        assert.equal(
            state.latestCycle.marker,
            "recovered"
        );

        assert.equal(
            state.latestError,
            null
        );
    }
);

test(
    "stop cancels a pending cycle and is idempotent",
    () => {
        const scheduler =
            createFakeScheduler();

        let clock = 50;

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () => ({
                        status:
                            "complete"
                    }),
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start();

        const first =
            controller.stop(
                "manual-test"
            );

        const second =
            controller.stop(
                "ignored-second-stop"
            );

        assert.equal(
            first.status,
            "stopped"
        );

        assert.equal(
            first.isRunning,
            false
        );

        assert.equal(
            first.stopReason,
            "manual-test"
        );

        assert.equal(
            scheduler.pending()
                .length,
            0
        );

        assert.deepEqual(
            second,
            first
        );
    }
);

test(
    "stop during an in-flight cycle prevents rescheduling and finishes as stopped",
    async () => {
        const scheduler =
            createFakeScheduler();

        let clock = 0;
        let resolveCycle;

        const cyclePromise =
            new Promise(
                resolve => {
                    resolveCycle =
                        resolve;
                }
            );

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () =>
                        await cyclePromise,
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => clock
            });

        controller.start();

        const runningTask =
            scheduler.runNext();

        await Promise.resolve();
        await Promise.resolve();

        const stopping =
            controller.stop();

        assert.equal(
            stopping.status,
            "stopping"
        );

        assert.equal(
            stopping.cycleInFlight,
            true
        );

        clock = 40;

        resolveCycle({
            status:
                "complete",
            marker:
                "finished-after-stop"
        });

        await runningTask;

        const stopped =
            controller.getState();

        assert.equal(
            stopped.status,
            "stopped"
        );

        assert.equal(
            stopped.isRunning,
            false
        );

        assert.equal(
            stopped.cycleInFlight,
            false
        );

        assert.equal(
            stopped.latestCycle.marker,
            "finished-after-stop"
        );

        assert.equal(
            scheduler.pending()
                .length,
            0
        );
    }
);

test(
    "start rejects duplicate starts and restart while an old cycle is stopping",
    async () => {
        const scheduler =
            createFakeScheduler();

        let resolveCycle;

        const cyclePromise =
            new Promise(
                resolve => {
                    resolveCycle =
                        resolve;
                }
            );

        const controller =
            createRecorderController({
                createConfig,
                loadUniverse:
                    async config =>
                        createUniverse(
                            config
                        ),
                buildCompleteCycle:
                    async () =>
                        await cyclePromise,
                schedule:
                    scheduler.schedule,
                cancelSchedule:
                    scheduler.cancel,
                now:
                    () => 0
            });

        controller.start();

        assert.throws(
            () =>
                controller.start(),
            /already running/
        );

        const runningTask =
            scheduler.runNext();

        await Promise.resolve();
        await Promise.resolve();

        controller.stop();

        assert.throws(
            () =>
                controller.start(),
            /still in flight/
        );

        resolveCycle({
            status:
                "complete"
        });

        await runningTask;

        assert.doesNotThrow(
            () =>
                controller.start()
        );
    }
);
