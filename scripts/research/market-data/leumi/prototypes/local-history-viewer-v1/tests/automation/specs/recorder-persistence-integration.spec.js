const {
    test,
    expect
} = require("@playwright/test");

const {
    installLeumiApiMocks
} = require("../helpers/mock-leumi-api");

async function deleteDatabase(
    page
) {
    await page.evaluate(async () => {
        const databaseName =
            window
                .MarketFlowStorageSchema
                .databaseName;

        await new Promise(
            (resolve, reject) => {
                const request =
                    indexedDB.deleteDatabase(
                        databaseName
                    );

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject(
                        request.error ??
                        new Error(
                            "Failed to delete test database."
                        )
                    );

                request.onblocked =
                    () => reject(
                        new Error(
                            "Test database deletion was blocked."
                        )
                    );
            }
        );
    });
}

async function readPersistenceSnapshot(
    page
) {
    return await page.evaluate(
        async () => {
            const {
                MarketFlowStorageConnection:
                    connection,
                MarketFlowStorageUpgrade:
                    upgrade,
                MarketFlowStorageRead:
                    read,
                MarketFlowStorageSchema:
                    schema
            } = window;

            const database =
                await connection
                    .openDatabase({
                        onUpgradeNeeded:
                            upgrade
                                .upgradeDatabase
                    });

            try {
                return {
                    sessions:
                        await read.getAll(
                            database,
                            schema
                                .stores
                                .sessions
                                .name
                        ),
                    cycles:
                        await read.getAll(
                            database,
                            schema
                                .stores
                                .cycles
                                .name
                        ),
                    history:
                        await read.getAll(
                            database,
                            schema
                                .stores
                                .history
                                .name
                        ),
                    latest:
                        await read.getAll(
                            database,
                            schema
                                .stores
                                .latest
                                .name
                        ),
                    recorderState:
                        await read.get(
                            database,
                            schema
                                .stores
                                .meta
                                .name,
                            "recorderState"
                        ),
                    universeState:
                        await read.get(
                            database,
                            schema
                                .stores
                                .meta
                                .name,
                            "universeState"
                        )
                };
            } finally {
                connection
                    .closeDatabase(
                        database
                    );
            }
        }
    );
}

test.beforeEach(
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        await deleteDatabase(
            page
        );
    }
);

test.afterEach(
    async ({ page }) => {
        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                if (
                    recorder &&
                    recorder
                        .getState()
                        .isRunning
                ) {
                    recorder.stop(
                        "test-cleanup"
                    );

                    await recorder
                        .waitForStopPersistence();
                }
            }
        );

        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 8.4 exposes recorder success only after cycle persistence and persists stop state",
    async ({ page }) => {
        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            100000,
                        chunkDelayMs:
                            0,
                        chunkSize:
                            2,
                        refreshUniverseEveryCycle:
                            false
                    });
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .completedCycles ===
                1
        );

        const running =
            await page.evaluate(
                () => ({
                    state:
                        window
                            .MarketFlowRecorderLoop
                            .getState(),
                    persistence:
                        window
                            .MarketFlowRecorderLoop
                            .getPersistenceState()
                })
            );

        const persistedWhileRunning =
            await readPersistenceSnapshot(
                page
            );

        expect(
            running.state
                .completedCycles
        ).toBe(1);

        expect(
            running.state
                .latestCycle
                .status
        ).toBe("complete");

        expect(
            running.persistence
                .lastCompletedCycleId
        ).toBeGreaterThan(0);

        expect(
            persistedWhileRunning
                .cycles
        ).toHaveLength(1);

        expect(
            persistedWhileRunning
                .history
        ).toHaveLength(4);

        expect(
            persistedWhileRunning
                .latest
        ).toHaveLength(4);

        expect(
            persistedWhileRunning
                .recorderState
                .value
                .completedCycles
        ).toBe(1);

        expect(
            persistedWhileRunning
                .recorderState
                .value
                .lastCompletedCycleId
        ).toBe(
            running.persistence
                .lastCompletedCycleId
        );

        expect(
            persistedWhileRunning
                .universeState
                .value
                .recordCount
        ).toBe(4);

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "stage-8-4-success"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        const stopped =
            await readPersistenceSnapshot(
                page
            );

        expect(
            stopped.sessions
        ).toHaveLength(1);

        expect(
            stopped.sessions[0]
                .status
        ).toBe("stopped");

        expect(
            stopped.sessions[0]
                .completedCycles
        ).toBe(1);

        expect(
            stopped.recorderState
                .value
                .status
        ).toBe("stopped");

        expect(
            stopped.recorderState
                .value
                .completedCycles
        ).toBe(1);
    }
);

test(
    "Stage 8.4 DB commit failure is a recorder failure and preserves the prior latest snapshot",
    async ({ page }) => {
        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            100000,
                        chunkDelayMs:
                            0,
                        chunkSize:
                            2,
                        refreshUniverseEveryCycle:
                            false
                    });
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .completedCycles ===
                1
        );

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "first-session"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        const beforeFailure =
            await readPersistenceSnapshot(
                page
            );

        const firstCycleId =
            beforeFailure
                .cycles[0]
                .cycleId;

        await page.evaluate(
            async ({
                collisionCycleId
            }) => {
                const {
                    MarketFlowStorageConnection:
                        connection,
                    MarketFlowStorageUpgrade:
                        upgrade,
                    MarketFlowStorageWrite:
                        write,
                    MarketFlowStorageSchema:
                        schema
                } = window;

                const database =
                    await connection
                        .openDatabase({
                            onUpgradeNeeded:
                                upgrade
                                    .upgradeDatabase
                        });

                try {
                    await write.put(
                        database,
                        schema
                            .stores
                            .history
                            .name,
                        {
                            cycleId:
                                collisionCycleId,
                            sessionId:
                                999,
                            securityId:
                                "1001",
                            chunkIndex:
                                0,
                            cycleStartedAtMs:
                                1,
                            chunkReceivedAtMs:
                                1,
                            collectedAtMs:
                                1,
                            serverAsOfDate:
                                "collision",
                            data: {
                                Key:
                                    1001,
                                Marker:
                                    "seeded-collision"
                            }
                        }
                    );
                } finally {
                    connection
                        .closeDatabase(
                            database
                        );
                }
            },
            {
                collisionCycleId:
                    firstCycleId + 1
            }
        );

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            100000,
                        chunkDelayMs:
                            0,
                        chunkSize:
                            2,
                        refreshUniverseEveryCycle:
                            false
                    });
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .failedCycles ===
                1
        );

        const failedState =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowRecorderLoop
                        .getState()
            );

        expect(
            failedState
                .completedCycles
        ).toBe(0);

        expect(
            failedState
                .latestCycle
        ).toBeNull();

        expect(
            failedState
                .latestError
                .name
        ).toBe("ConstraintError");

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "after-db-failure"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        const afterFailure =
            await readPersistenceSnapshot(
                page
            );

        expect(
            afterFailure.cycles
        ).toHaveLength(2);

        const persistedFailure =
            afterFailure.cycles.find(
                cycle =>
                    cycle.status ===
                    "failed"
            );

        expect(
            persistedFailure
        ).toBeTruthy();

        expect(
            persistedFailure
                .error
                .name
        ).toBe("ConstraintError");

        expect(
            afterFailure.latest
        ).toHaveLength(4);

        for (
            const row of
            afterFailure.latest
        ) {
            expect(
                row.cycleId
            ).toBe(
                firstCycleId
            );
        }

        expect(
            afterFailure
                .recorderState
                .value
                .status
        ).toBe("stopped");

        expect(
            afterFailure
                .recorderState
                .value
                .completedCycles
        ).toBe(0);

        expect(
            afterFailure
                .recorderState
                .value
                .failedCycles
        ).toBe(1);
    }
);

test(
    "Stage 9 API failure records diagnostics but never writes history or latest rows",
    async ({ page }) => {
        await page.unrouteAll();

        await installLeumiApiMocks(
            page,
            "securitiesHttpFailure"
        );

        await page.reload();

        await deleteDatabase(
            page
        );

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            100000,
                        chunkDelayMs:
                            0,
                        chunkSize:
                            2,
                        refreshUniverseEveryCycle:
                            false
                    });
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .failedCycles ===
                1
        );

        const state =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowRecorderLoop
                        .getState()
            );

        expect(
            state.completedCycles
        ).toBe(0);

        expect(
            state.latestCycle
        ).toBeNull();

        expect(
            state.latestError
                .message
        ).toContain("HTTP 500");

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "api-failure"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        const persisted =
            await readPersistenceSnapshot(
                page
            );

        expect(
            persisted.cycles
        ).toHaveLength(1);

        expect(
            persisted.cycles[0]
                .status
        ).toBe("failed");

        expect(
            persisted.cycles[0]
                .error
                .message
        ).toContain("HTTP 500");

        expect(
            persisted.history
        ).toHaveLength(0);

        expect(
            persisted.latest
        ).toHaveLength(0);

        expect(
            persisted.sessions
        ).toHaveLength(1);

        expect(
            persisted.sessions[0]
                .failedCycles
        ).toBe(1);
    }
);
