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

async function seedDiagnosticsFixture(
    page
) {
    await page.evaluate(
        async () => {
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
                        .meta
                        .name,
                    {
                        key:
                            "recorderState",
                        value: {
                            instanceId:
                                "stage15-recorder",
                            sessionId:
                                1,
                            status:
                                "running",
                            recordingStartedAtMs:
                                1000,
                            lastHeartbeatAtMs:
                                9000,
                            lastCompletedCycleId:
                                42,
                            lastCompletedAtMs:
                                8800,
                            completedCycles:
                                7,
                            failedCycles:
                                2,
                            lastError:
                                null,
                            config: {
                                intervalMs:
                                    10000
                            }
                        }
                    }
                );

                await write.put(
                    database,
                    schema
                        .stores
                        .meta
                        .name,
                    {
                        key:
                            "universeState",
                        value: {
                            loadedAtMs:
                                900,
                            recordCount:
                                2
                        }
                    }
                );

                await write.put(
                    database,
                    schema
                        .stores
                        .sessions
                        .name,
                    {
                        sessionId:
                            1,
                        startedAtMs:
                            1000,
                        stoppedAtMs:
                            null,
                        status:
                            "running"
                    }
                );

                for (
                    const security of
                    [
                        ["1001", "Alpha"],
                        ["1002", "Beta"]
                    ]
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .universe
                            .name,
                        {
                            securityId:
                                security[0],
                            paperName:
                                security[1],
                            updatedAtMs:
                                900,
                            mapHeatDateChange:
                                null,
                            rawMapHeat: {
                                PaperId:
                                    security[0]
                            }
                        }
                    );

                    await write.put(
                        database,
                        schema
                            .stores
                            .latest
                            .name,
                        {
                            securityId:
                                security[0],
                            cycleId:
                                42,
                            sessionId:
                                1,
                            chunkIndex:
                                0,
                            cycleStartedAtMs:
                                8000,
                            chunkReceivedAtMs:
                                8500,
                            collectedAtMs:
                                8700,
                            serverAsOfDate:
                                null,
                            data: {
                                Key:
                                    security[0]
                            }
                        }
                    );
                }

                await write.put(
                    database,
                    schema
                        .stores
                        .cycles
                        .name,
                    {
                        cycleId:
                            41,
                        sessionId:
                            1,
                        startedAtMs:
                            7000,
                        completedAtMs:
                            7600,
                        durationMs:
                            600,
                        status:
                            "failed",
                        requested:
                            2,
                        received:
                            1,
                        unique:
                            1,
                        missing:
                            1,
                        duplicates:
                            0
                    }
                );

                await write.put(
                    database,
                    schema
                        .stores
                        .cycles
                        .name,
                    {
                        cycleId:
                            42,
                        sessionId:
                            1,
                        startedAtMs:
                            8000,
                        completedAtMs:
                            8800,
                        durationMs:
                            800,
                        status:
                            "complete",
                        requested:
                            2,
                        received:
                            2,
                        unique:
                            2,
                        missing:
                            0,
                        duplicates:
                            0
                    }
                );

                const historyRows = [
                    [42, "1001", 8700],
                    [42, "1002", 8701],
                    [40, "1001", 6500]
                ];

                for (
                    const [
                        cycleId,
                        securityId,
                        collectedAtMs
                    ] of historyRows
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .history
                            .name,
                        {
                            cycleId,
                            sessionId:
                                1,
                            securityId,
                            chunkIndex:
                                0,
                            cycleStartedAtMs:
                                collectedAtMs -
                                100,
                            chunkReceivedAtMs:
                                collectedAtMs -
                                50,
                            collectedAtMs,
                            serverAsOfDate:
                                null,
                            data: {
                                Key:
                                    securityId
                            }
                        }
                    );
                }
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
        await page.goto(
            "/tests/automation/harness.html"
        );

        await deleteDatabase(
            page
        );

        await page.reload();
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
    "Stage 15.1 reads raw viewer diagnostics from IndexedDB without scanning history",
    async ({ page }) => {
        await seedDiagnosticsFixture(
            page
        );

        const snapshot =
            await page.evaluate(
                async () =>
                    window
                        .MarketFlowViewerDiagnosticsData
                        .loadSnapshot()
            );

        expect(
            snapshot.recorderState
        ).toMatchObject({
            instanceId:
                "stage15-recorder",
            sessionId:
                1,
            status:
                "running",
            lastHeartbeatAtMs:
                9000,
            lastCompletedCycleId:
                42,
            lastCompletedAtMs:
                8800,
            completedCycles:
                7,
            failedCycles:
                2,
            lastError:
                null
        });

        expect(
            snapshot.lastCycle
        ).toMatchObject({
            cycleId:
                42,
            status:
                "complete",
            durationMs:
                800
        });

        expect(
            snapshot.rowCounts
        ).toEqual({
            meta:
                2,
            sessions:
                1,
            universe:
                2,
            cycles:
                2,
            latest:
                2,
            history:
                3
        });

        expect(
            Object.keys(
                snapshot.storage
            )
        ).toEqual([
            "usageBytes",
            "quotaBytes",
            "freeBytes",
            "usageRatio"
        ]);

        for (
            const key of
            [
                "usageBytes",
                "quotaBytes",
                "freeBytes",
                "usageRatio"
            ]
        ) {
            expect(
                snapshot.storage[key] ===
                    null ||
                Number.isFinite(
                    snapshot.storage[key]
                )
            ).toBe(true);
        }
    }
);

test(
    "Stage 15.1 returns null recorder/last-cycle diagnostics for a fresh database",
    async ({ page }) => {
        const snapshot =
            await page.evaluate(
                async () =>
                    window
                        .MarketFlowViewerDiagnosticsData
                        .loadSnapshot()
            );

        expect(
            snapshot.recorderState
        ).toBeNull();

        expect(
            snapshot.lastCycle
        ).toBeNull();

        expect(
            snapshot.rowCounts
        ).toEqual({
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
        });
    }
);
