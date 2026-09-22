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

async function seedPersistedSnapshot(
    page,
    {
        cycleId,
        rate,
        completedCycles =
            cycleId,
        failedCycles =
            0
    }
) {
    await page.evaluate(
        async ({
            cycleId,
            rate,
            completedCycles,
            failedCycles
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

            const now =
                Date.now();

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
                                "stage16-persisted",
                            sessionId:
                                1,
                            status:
                                "stopped",
                            recordingStartedAtMs:
                                now - 60000,
                            lastHeartbeatAtMs:
                                now - 5000,
                            lastCompletedCycleId:
                                cycleId,
                            lastCompletedAtMs:
                                now - 2000,
                            completedCycles,
                            failedCycles,
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
                        .universe
                        .name,
                    {
                        securityId:
                            "1001",
                        paperName:
                            "Recovery Alpha",
                        updatedAtMs:
                            now,
                        mapHeatDateChange:
                            null,
                        rawMapHeat: {
                            PaperId:
                                1001
                        }
                    }
                );

                await write.put(
                    database,
                    schema
                        .stores
                        .cycles
                        .name,
                    {
                        cycleId,
                        sessionId:
                            1,
                        startedAtMs:
                            now - 3000,
                        completedAtMs:
                            now - 2000,
                        durationMs:
                            700,
                        status:
                            "complete",
                        requested:
                            1,
                        received:
                            1,
                        unique:
                            1,
                        missing:
                            0,
                        duplicates:
                            0
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
                            "1001",
                        cycleId,
                        sessionId:
                            1,
                        chunkIndex:
                            0,
                        cycleStartedAtMs:
                            now - 3000,
                        chunkReceivedAtMs:
                            now - 2100,
                        collectedAtMs:
                            now - 2000,
                        serverAsOfDate:
                            null,
                        data: {
                            Key:
                                1001,
                            LastKnownRate:
                                rate,
                            BaseRateChangePercentage:
                                0.5,
                            BuyLimit1:
                                rate - 1,
                            BuyVolume1:
                                10,
                            SellLimit1:
                                rate + 1,
                            SellVolume1:
                                12,
                            DailyDealsQuantity:
                                20,
                            LastDealVolume:
                                2,
                            DailyTurnover:
                                100,
                            DailyNISRevenue:
                                10000,
                            DailyLowestRate:
                                rate - 10,
                            DailyHighestRate:
                                rate + 10,
                            LastDealTimeOnly:
                                "10:15"
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
            cycleId,
            rate,
            completedCycles,
            failedCycles
        }
    );
}

async function openViewer(
    page
) {
    const popupPromise =
        page.waitForEvent(
            "popup"
        );

    await page.evaluate(
        () => {
            window
                .MarketFlowViewerBootstrap
                .openViewer();
        }
    );

    const viewer =
        await popupPromise;

    await expect(
        viewer.locator(
            "[data-role='viewer-status']"
        )
    ).toHaveAttribute(
        "data-view-state",
        "MAIN"
    );

    return viewer;
}

async function expectSnapshot(
    viewer,
    {
        rate,
        cycleId
    }
) {
    await expect(
        viewer.locator(
            "tr[data-security-id='1001'] td[data-column='LastKnownRate']"
        )
    ).toHaveText(
        String(rate)
    );

    await expect(
        viewer.locator(
            "[data-role='last-cycle']"
        )
    ).toHaveText(
        String(cycleId)
    );

    await expect(
        viewer.locator(
            "[data-role='recorder-health']"
        )
    ).toHaveText(
        "נעצר"
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
        await page.evaluate(
            () => {
                window
                    .MarketFlowViewerBootstrap
                    .closeViewer();
            }
        );

        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 16 viewer reload rebuilds the shell and restores persisted IndexedDB state",
    async ({ page }) => {
        await seedPersistedSnapshot(
            page,
            {
                cycleId:
                    16,
                rate:
                    1600
            }
        );

        const viewer =
            await openViewer(
                page
            );

        await expectSnapshot(
            viewer,
            {
                cycleId:
                    16,
                rate:
                    1600
            }
        );

        await viewer.reload();

        await expect(
            viewer.locator(
                "html"
            )
        ).toHaveAttribute(
            "data-market-flow-viewer",
            "market-flow-leumi-v1"
        );

        await expectSnapshot(
            viewer,
            {
                cycleId:
                    16,
                rate:
                    1600
            }
        );

        const snapshot =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowViewerBootstrap
                        .getViewerSnapshot()
            );

        expect(
            snapshot.isOpen
        ).toBe(true);

        expect(
            snapshot.state
                .viewState
        ).toBe(
            "MAIN"
        );
    }
);

test(
    "Stage 16 close and reopen restores the newest persisted snapshot",
    async ({ page }) => {
        await seedPersistedSnapshot(
            page,
            {
                cycleId:
                    1,
                rate:
                    100
            }
        );

        const firstViewer =
            await openViewer(
                page
            );

        await expectSnapshot(
            firstViewer,
            {
                cycleId:
                    1,
                rate:
                    100
            }
        );

        await page.evaluate(
            () => {
                window
                    .MarketFlowViewerBootstrap
                    .closeViewer();
            }
        );

        await expect
            .poll(
                () =>
                    firstViewer
                        .isClosed()
            )
            .toBe(true);

        await seedPersistedSnapshot(
            page,
            {
                cycleId:
                    2,
                rate:
                    200,
                completedCycles:
                    2
            }
        );

        const reopened =
            await openViewer(
                page
            );

        await expectSnapshot(
            reopened,
            {
                cycleId:
                    2,
                rate:
                    200
            }
        );

        expect(
            page
                .context()
                .pages()
                .length
        ).toBe(2);
    }
);

test(
    "Stage 16 viewer recovery is independent of recorder or market API availability",
    async ({ page }) => {
        await seedPersistedSnapshot(
            page,
            {
                cycleId:
                    7,
                rate:
                    700
            }
        );

        await page.evaluate(
            () => {
                window
                    .__stage16FetchCalls =
                    0;

                window.fetch =
                    async () => {
                        window
                            .__stage16FetchCalls++;

                        throw new Error(
                            "Stage 16 market API must not be called by viewer recovery."
                        );
                    };
            }
        );

        const viewer =
            await openViewer(
                page
            );

        await expectSnapshot(
            viewer,
            {
                cycleId:
                    7,
                rate:
                    700
            }
        );

        const result =
            await page.evaluate(
                () => ({
                    fetchCalls:
                        window
                            .__stage16FetchCalls,
                    recorderRunning:
                        Boolean(
                            window
                                .MarketFlowRecorderLoop
                                ?.getState?.()
                                ?.isRunning
                        )
                })
            );

        expect(
            result.fetchCalls
        ).toBe(0);

        expect(
            result.recorderRunning
        ).toBe(false);
    }
);
