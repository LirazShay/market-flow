const {
    test,
    expect
} = require("@playwright/test");

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

function createCycle({
    startedAtMs = 1000,
    completedAtMs = 1100,
    firstRate = 0,
    secondRate = 2222,
    marker = "first"
} = {}) {
    return {
        status: "complete",
        startedAtMs,
        completedAtMs,
        durationMs:
            completedAtMs -
            startedAtMs,
        requested: 2,
        received: 2,
        unique: 2,
        missing: 0,
        duplicates: 0,
        chunks: [
            {
                chunkIndex: 0,
                requested: 2,
                received: 2,
                unique: 2,
                requestStartedAtMs:
                    startedAtMs + 10,
                receivedAtMs:
                    completedAtMs - 20,
                completedAtMs:
                    completedAtMs - 10,
                durationMs:
                    completedAtMs -
                    startedAtMs -
                    20,
                serverAsOfDate:
                    "fixture-" +
                    marker,
                httpStatus: 200
            }
        ],
        securities: [
            {
                securityId:
                    "1001",
                chunkIndex: 0,
                chunkReceivedAtMs:
                    completedAtMs - 20,
                collectedAtMs:
                    completedAtMs - 10,
                serverAsOfDate:
                    "fixture-" +
                    marker,
                data: {
                    Key: 1001,
                    LastKnownRate:
                        firstRate,
                    BuyLimit1:
                        null,
                    ZeroValue: 0,
                    NullValue: null,
                    EmptyValue: "",
                    Marker:
                        marker
                }
            },
            {
                securityId:
                    "1002",
                chunkIndex: 0,
                chunkReceivedAtMs:
                    completedAtMs - 20,
                collectedAtMs:
                    completedAtMs - 10,
                serverAsOfDate:
                    null,
                data: {
                    Key: "1002",
                    LastKnownRate:
                        secondRate,
                    BuyLimit1:
                        2210,
                    Marker:
                        marker
                }
            }
        ]
    };
}

async function openAndStartSession(
    page
) {
    return await page.evaluate(
        async () => {
            const {
                MarketFlowStorageConnection:
                    connection,
                MarketFlowStorageUpgrade:
                    upgrade,
                MarketFlowLifecyclePersistence:
                    lifecycle
            } = window;

            const database =
                await connection
                    .openDatabase({
                        onUpgradeNeeded:
                            upgrade
                                .upgradeDatabase
                    });

            const config = {
                snapshotIntervalMs:
                    3000,
                chunkDelayMs:
                    1000,
                chunkSize:
                    187,
                refreshUniverseEveryCycle:
                    false
            };

            const started =
                await lifecycle
                    .startSession(
                        database,
                        {
                            instanceId:
                                "stage-8-3-instance",
                            startedAtMs:
                                100,
                            config,
                            initialUniverseCount:
                                2
                        }
                    );

            connection
                .closeDatabase(
                    database
                );

            return started;
        }
    );
}

test.beforeEach(
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

        await deleteDatabase(
            page
        );

        await openAndStartSession(
            page
        );
    }
);

test.afterEach(
    async ({ page }) => {
        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 8.3 commits cycle history latest and recorderState atomically with one generated cycleId",
    async ({ page }) => {
        const cycle =
            createCycle();

        const result =
            await page.evaluate(
                async ({ cycle }) => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
                        MarketFlowSuccessfulCyclePersistence:
                            persistence
                    } = window;

                    const database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    try {
                        const committed =
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "stage-8-3-instance",
                                        cycle,
                                        committedAtMs:
                                            1200
                                    }
                                );

                        const storedCycle =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .cycles
                                    .name,
                                committed
                                    .cycleId
                            );

                        const history =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        const latest =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .latest
                                    .name
                            );

                        const recorderState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "recorderState"
                            );

                        return {
                            committed,
                            storedCycle,
                            history,
                            latest,
                            recorderState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                },
                {
                    cycle
                }
            );

        expect(
            result.committed
                .cycleId
        ).toBeGreaterThan(0);

        expect(
            result.storedCycle
        ).toEqual(
            result.committed
                .cycleRecord
        );

        expect(
            result.history
        ).toHaveLength(2);

        expect(
            result.latest
        ).toHaveLength(2);

        for (
            const row of
            result.history
        ) {
            expect(
                row.cycleId
            ).toBe(
                result.committed
                    .cycleId
            );
        }

        for (
            const row of
            result.latest
        ) {
            expect(
                row.cycleId
            ).toBe(
                result.committed
                    .cycleId
            );
        }

        expect(
            result.recorderState
                .value
                .lastCompletedCycleId
        ).toBe(
            result.committed
                .cycleId
        );

        expect(
            result.recorderState
                .value
                .lastCompletedAtMs
        ).toBe(1100);

        expect(
            result.recorderState
                .value
                .lastHeartbeatAtMs
        ).toBe(1200);

        expect(
            result.recorderState
                .value
                .completedCycles
        ).toBe(1);

        const first =
            result.history.find(
                row =>
                    row.securityId ===
                    "1001"
            );

        expect(
            first.data
                .LastKnownRate
        ).toBe(0);

        expect(
            first.data
                .NullValue
        ).toBeNull();

        expect(
            first.data
                .EmptyValue
        ).toBe("");
    }
);

test(
    "Stage 8.3 preserves history while second cycle replaces latest",
    async ({ page }) => {
        const firstCycle =
            createCycle();

        const secondCycle =
            createCycle({
                startedAtMs: 2000,
                completedAtMs: 2100,
                firstRate: 1111,
                secondRate: 3333,
                marker: "second"
            });

        const result =
            await page.evaluate(
                async ({
                    firstCycle,
                    secondCycle
                }) => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
                        MarketFlowSuccessfulCyclePersistence:
                            persistence
                    } = window;

                    const database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    try {
                        const first =
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "stage-8-3-instance",
                                        cycle:
                                            firstCycle,
                                        committedAtMs:
                                            1200
                                    }
                                );

                        const second =
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "stage-8-3-instance",
                                        cycle:
                                            secondCycle,
                                        committedAtMs:
                                            2200
                                    }
                                );

                        const cycles =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .cycles
                                    .name
                            );

                        const history =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        const latest =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .latest
                                    .name
                            );

                        const recorderState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "recorderState"
                            );

                        return {
                            first,
                            second,
                            cycles,
                            history,
                            latest,
                            recorderState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                },
                {
                    firstCycle,
                    secondCycle
                }
            );

        expect(
            result.cycles
        ).toHaveLength(2);

        expect(
            result.history
        ).toHaveLength(4);

        expect(
            result.latest
        ).toHaveLength(2);

        expect(
            new Set(
                result.history.map(
                    row =>
                        row.cycleId
                )
            ).size
        ).toBe(2);

        for (
            const row of
            result.latest
        ) {
            expect(
                row.cycleId
            ).toBe(
                result.second.cycleId
            );

            expect(
                row.data.Marker
            ).toBe("second");
        }

        const oldFirstSecurity =
            result.history.find(
                row =>
                    row.cycleId ===
                        result.first
                            .cycleId &&
                    row.securityId ===
                        "1001"
            );

        expect(
            oldFirstSecurity
                .data
                .Marker
        ).toBe("first");

        expect(
            result.recorderState
                .value
                .completedCycles
        ).toBe(2);

        expect(
            result.recorderState
                .value
                .lastCompletedCycleId
        ).toBe(
            result.second.cycleId
        );
    }
);

test(
    "Stage 8.3 rolls back cycle latest and recorderState when a history write fails",
    async ({ page }) => {
        const firstCycle =
            createCycle();

        const secondCycle =
            createCycle({
                startedAtMs: 2000,
                completedAtMs: 2100,
                firstRate: 9999,
                secondRate: 8888,
                marker: "must-rollback"
            });

        const result =
            await page.evaluate(
                async ({
                    firstCycle,
                    secondCycle
                }) => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageWrite:
                            write,
                        MarketFlowStorageSchema:
                            schema,
                        MarketFlowSuccessfulCyclePersistence:
                            persistence
                    } = window;

                    const database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    try {
                        const first =
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "stage-8-3-instance",
                                        cycle:
                                            firstCycle,
                                        committedAtMs:
                                            1200
                                    }
                                );

                        await write.put(
                            database,
                            schema
                                .stores
                                .history
                                .name,
                            {
                                cycleId:
                                    first
                                        .cycleId +
                                    1,
                                sessionId:
                                    first
                                        .cycleRecord
                                        .sessionId,
                                securityId:
                                    "1001",
                                chunkIndex:
                                    0,
                                cycleStartedAtMs:
                                    1900,
                                chunkReceivedAtMs:
                                    1950,
                                collectedAtMs:
                                    1960,
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

                        let errorName =
                            null;

                        let errorMessage =
                            null;

                        try {
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "stage-8-3-instance",
                                        cycle:
                                            secondCycle,
                                        committedAtMs:
                                            2200
                                    }
                                );
                        } catch (error) {
                            errorName =
                                error.name;

                            errorMessage =
                                error.message;
                        }

                        const cycles =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .cycles
                                    .name
                            );

                        const history =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        const latest =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .latest
                                    .name
                            );

                        const recorderState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "recorderState"
                            );

                        return {
                            first,
                            errorName,
                            errorMessage,
                            cycles,
                            history,
                            latest,
                            recorderState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                },
                {
                    firstCycle,
                    secondCycle
                }
            );

        expect(
            result.errorName
        ).toBe("ConstraintError");

        expect(
            result.cycles
        ).toHaveLength(1);

        expect(
            result.cycles[0]
                .cycleId
        ).toBe(
            result.first.cycleId
        );

        expect(
            result.history
        ).toHaveLength(3);

        const seededCollision =
            result.history.find(
                row =>
                    row.data
                        ?.Marker ===
                    "seeded-collision"
            );

        expect(
            seededCollision
        ).toBeTruthy();

        expect(
            result.latest
        ).toHaveLength(2);

        for (
            const row of
            result.latest
        ) {
            expect(
                row.cycleId
            ).toBe(
                result.first.cycleId
            );

            expect(
                row.data.Marker
            ).toBe("first");
        }

        expect(
            result.recorderState
                .value
                .completedCycles
        ).toBe(1);

        expect(
            result.recorderState
                .value
                .lastCompletedCycleId
        ).toBe(
            result.first.cycleId
        );
    }
);

test(
    "Stage 8.3 rejects a different recorder instance before writing a cycle",
    async ({ page }) => {
        const cycle =
            createCycle();

        const result =
            await page.evaluate(
                async ({ cycle }) => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
                        MarketFlowSuccessfulCyclePersistence:
                            persistence
                    } = window;

                    const database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    try {
                        let message =
                            null;

                        try {
                            await persistence
                                .commitSuccessfulCycle(
                                    database,
                                    {
                                        instanceId:
                                            "wrong-instance",
                                        cycle,
                                        committedAtMs:
                                            1200
                                    }
                                );
                        } catch (error) {
                            message =
                                error.message;
                        }

                        const cycleCount =
                            await read.count(
                                database,
                                schema
                                    .stores
                                    .cycles
                                    .name
                            );

                        const historyCount =
                            await read.count(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        const latestCount =
                            await read.count(
                                database,
                                schema
                                    .stores
                                    .latest
                                    .name
                            );

                        return {
                            message,
                            cycleCount,
                            historyCount,
                            latestCount
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                },
                {
                    cycle
                }
            );

        expect(
            result.message
        ).toContain(
            "does not own"
        );

        expect(
            result.cycleCount
        ).toBe(0);

        expect(
            result.historyCount
        ).toBe(0);

        expect(
            result.latestCount
        ).toBe(0);
    }
);
