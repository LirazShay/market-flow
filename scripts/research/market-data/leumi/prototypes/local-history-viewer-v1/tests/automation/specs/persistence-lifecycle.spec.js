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

test.beforeEach(
    async ({ page }) => {
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
        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 8.2 starts a session and recorderState in one persisted lifecycle operation",
    async ({ page }) => {
        const result =
            await page.evaluate(
                async () => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
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

                    try {
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
                                            "browser-fixture-instance",
                                        startedAtMs:
                                            1000,
                                        config,
                                        initialUniverseCount:
                                            2
                                    }
                                );

                        const storedSession =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .sessions
                                    .name,
                                started
                                    .sessionId
                            );

                        const storedState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "recorderState"
                            );

                        return {
                            started,
                            storedSession,
                            storedState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                }
            );

        expect(
            result.started
                .sessionId
        ).toBeGreaterThan(0);

        expect(
            result.storedSession
        ).toEqual(
            result.started
                .sessionRecord
        );

        expect(
            result.storedSession
                .status
        ).toBe("running");

        expect(
            result.storedSession
                .initialUniverseCount
        ).toBe(2);

        expect(
            result.storedState
        ).toEqual(
            result.started
                .recorderStateRecord
        );

        expect(
            result.storedState
                .value
                .sessionId
        ).toBe(
            result.started
                .sessionId
        );
    }
);

test(
    "Stage 8.2 persists an exact universe snapshot and universeState metadata",
    async ({ page }) => {
        const result =
            await page.evaluate(
                async () => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
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

                    try {
                        const firstUniverse = {
                            loadedAtMs:
                                2000,
                            recordCount:
                                2,
                            records: [
                                {
                                    PaperId:
                                        1001,
                                    PaperName:
                                        "Fixture Alpha",
                                    DateChange:
                                        "first",
                                    ZeroValue:
                                        0,
                                    NullValue:
                                        null,
                                    EmptyValue:
                                        ""
                                },
                                {
                                    PaperId:
                                        1002,
                                    PaperName:
                                        "Fixture Beta",
                                    DateChange:
                                        null
                                }
                            ]
                        };

                        await lifecycle
                            .persistUniverse(
                                database,
                                firstUniverse
                            );

                        const firstRows =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .universe
                                    .name
                            );

                        const secondUniverse = {
                            loadedAtMs:
                                3000,
                            recordCount:
                                1,
                            records: [
                                {
                                    PaperId:
                                        1002,
                                    PaperName:
                                        "Fixture Beta Updated",
                                    DateChange:
                                        "second",
                                    ZeroValue:
                                        0,
                                    NullValue:
                                        null,
                                    EmptyValue:
                                        ""
                                }
                            ]
                        };

                        const persisted =
                            await lifecycle
                                .persistUniverse(
                                    database,
                                    secondUniverse
                                );

                        const secondRows =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .universe
                                    .name
                            );

                        const universeState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "universeState"
                            );

                        return {
                            firstRows,
                            persisted,
                            secondRows,
                            universeState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                }
            );

        expect(
            result.firstRows
        ).toHaveLength(2);

        expect(
            result.secondRows
        ).toHaveLength(1);

        expect(
            result.secondRows[0]
                .securityId
        ).toBe("1002");

        expect(
            result.secondRows[0]
                .paperName
        ).toBe(
            "Fixture Beta Updated"
        );

        expect(
            result.secondRows[0]
                .rawMapHeat
                .ZeroValue
        ).toBe(0);

        expect(
            result.secondRows[0]
                .rawMapHeat
                .NullValue
        ).toBeNull();

        expect(
            result.secondRows[0]
                .rawMapHeat
                .EmptyValue
        ).toBe("");

        expect(
            result.universeState
        ).toEqual({
            key:
                "universeState",
            value: {
                loadedAtMs:
                    3000,
                recordCount:
                    1
            }
        });

        expect(
            result.persisted
                .recordCount
        ).toBe(1);
    }
);

test(
    "Stage 8.2 rejects an invalid universe before replacing the persisted snapshot",
    async ({ page }) => {
        const result =
            await page.evaluate(
                async () => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
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

                    try {
                        await lifecycle
                            .persistUniverse(
                                database,
                                {
                                    loadedAtMs:
                                        100,
                                    recordCount:
                                        1,
                                    records: [
                                        {
                                            PaperId:
                                                1001,
                                            PaperName:
                                                "Stable"
                                        }
                                    ]
                                }
                            );

                        let errorMessage =
                            null;

                        try {
                            await lifecycle
                                .persistUniverse(
                                    database,
                                    {
                                        loadedAtMs:
                                            200,
                                        recordCount:
                                            2,
                                        records: [
                                            {
                                                PaperId:
                                                    1002
                                            },
                                            {
                                                PaperId:
                                                    "1002"
                                            }
                                        ]
                                    }
                                );
                        } catch (error) {
                            errorMessage =
                                error.message;
                        }

                        const rows =
                            await read.getAll(
                                database,
                                schema
                                    .stores
                                    .universe
                                    .name
                            );

                        const universeState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "universeState"
                            );

                        return {
                            errorMessage,
                            rows,
                            universeState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                }
            );

        expect(
            result.errorMessage
        ).toContain(
            "duplicate securityId"
        );

        expect(
            result.rows
        ).toHaveLength(1);

        expect(
            result.rows[0]
                .securityId
        ).toBe("1001");

        expect(
            result.universeState
                .value
                .loadedAtMs
        ).toBe(100);
    }
);

test(
    "Stage 8.2 stops the same session and recorderState with final counters",
    async ({ page }) => {
        const result =
            await page.evaluate(
                async () => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
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

                    try {
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
                                            "browser-fixture-instance",
                                        startedAtMs:
                                            1000,
                                        config,
                                        initialUniverseCount:
                                            2
                                    }
                                );

                        const stopped =
                            await lifecycle
                                .stopSession(
                                    database,
                                    {
                                        sessionRecord:
                                            started
                                                .sessionRecord,
                                        instanceId:
                                            "browser-fixture-instance",
                                        stoppedAtMs:
                                            5000,
                                        completedCycles:
                                            12,
                                        failedCycles:
                                            1,
                                        stopReason:
                                            "browser-test",
                                        lastHeartbeatAtMs:
                                            4900,
                                        lastCompletedCycleId:
                                            12,
                                        lastCompletedAtMs:
                                            4800,
                                        lastError:
                                            null
                                    }
                                );

                        const storedSession =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .sessions
                                    .name,
                                started
                                    .sessionId
                            );

                        const storedState =
                            await read.get(
                                database,
                                schema
                                    .stores
                                    .meta
                                    .name,
                                "recorderState"
                            );

                        return {
                            started,
                            stopped,
                            storedSession,
                            storedState
                        };
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }
                }
            );

        expect(
            result.storedSession
                .sessionId
        ).toBe(
            result.started
                .sessionId
        );

        expect(
            result.storedSession
        ).toEqual(
            result.stopped
                .sessionRecord
        );

        expect(
            result.storedSession
                .status
        ).toBe("stopped");

        expect(
            result.storedSession
                .completedCycles
        ).toBe(12);

        expect(
            result.storedSession
                .failedCycles
        ).toBe(1);

        expect(
            result.storedSession
                .stopReason
        ).toBe("browser-test");

        expect(
            result.storedState
        ).toEqual(
            result.stopped
                .recorderStateRecord
        );

        expect(
            result.storedState
                .value
                .status
        ).toBe("stopped");

        expect(
            result.storedState
                .value
                .lastCompletedCycleId
        ).toBe(12);
    }
);
