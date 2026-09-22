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

async function seedDiagnosticsState(
    page,
    {
        cycleId,
        completedCycles,
        failedCycles,
        historyCount,
        rate
    }
) {
    await page.evaluate(
        async ({
            cycleId,
            completedCycles,
            failedCycles,
            historyCount,
            rate
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
                                "stage15-ui",
                            sessionId:
                                1,
                            status:
                                "running",
                            recordingStartedAtMs:
                                now - 60000,
                            lastHeartbeatAtMs:
                                now,
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
                            "Diagnostics Alpha",
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
                            1000 + cycleId,
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
                                1,
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

                const existingHistory =
                    await new Promise(
                        (resolve, reject) => {
                            const transaction =
                                database.transaction(
                                    schema
                                        .stores
                                        .history
                                        .name,
                                    "readonly"
                                );

                            const request =
                                transaction
                                    .objectStore(
                                        schema
                                            .stores
                                            .history
                                            .name
                                    )
                                    .getAllKeys();

                            request.onsuccess =
                                () =>
                                    resolve(
                                        request.result
                                    );

                            request.onerror =
                                () =>
                                    reject(
                                        request.error
                                    );
                        }
                    );

                if (
                    existingHistory
                        .length <
                    historyCount
                ) {
                    for (
                        let index =
                            existingHistory
                                .length;
                        index <
                            historyCount;
                        index++
                    ) {
                        await write.put(
                            database,
                            schema
                                .stores
                                .history
                                .name,
                            {
                                cycleId:
                                    index +
                                    1,
                                sessionId:
                                    1,
                                securityId:
                                    "1001",
                                chunkIndex:
                                    0,
                                cycleStartedAtMs:
                                    now -
                                    5000 -
                                    index,
                                chunkReceivedAtMs:
                                    now -
                                    4000 -
                                    index,
                                collectedAtMs:
                                    now -
                                    3000 -
                                    index,
                                serverAsOfDate:
                                    null,
                                data: {
                                    Key:
                                        1001,
                                    LastKnownRate:
                                        rate
                                }
                            }
                        );
                    }
                }
            } finally {
                connection
                    .closeDatabase(
                        database
                    );
            }
        },
        {
            cycleId,
            completedCycles,
            failedCycles,
            historyCount,
            rate
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

    await viewer.waitForFunction(
        () =>
            document
                .querySelector(
                    "[data-role='viewer-status']"
                )
                ?.dataset
                .viewState ===
            "MAIN"
    );

    return viewer;
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
    "Stage 15.3 shows always-visible diagnostics from IndexedDB in MAIN and DETAIL",
    async ({ page }) => {
        await seedDiagnosticsState(
            page,
            {
                cycleId: 42,
                completedCycles: 7,
                failedCycles: 2,
                historyCount: 3,
                rate: 3200
            }
        );

        const viewer =
            await openViewer(
                page
            );

        await expect(
            viewer.locator(
                "[data-role='recorder-health']"
            )
        ).toHaveText(
            "רץ"
        );

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "42"
        );

        await expect(
            viewer.locator(
                "[data-role='cycle-duration']"
            )
        ).toHaveText(
            "1,042 ms"
        );

        await expect(
            viewer.locator(
                "[data-role='security-count']"
            )
        ).toHaveText(
            "1"
        );

        await expect(
            viewer.locator(
                "[data-role='completed-cycles']"
            )
        ).toHaveText(
            "7"
        );

        await expect(
            viewer.locator(
                "[data-role='failed-cycles']"
            )
        ).toHaveText(
            "2"
        );

        await expect(
            viewer.locator(
                "[data-role='history-count']"
            )
        ).toHaveText(
            "3"
        );

        await expect(
            viewer.locator(
                "[data-role='last-update']"
            )
        ).toContainText(
            "לפני"
        );

        await expect(
            viewer.locator(
                "[data-role='storage-usage']"
            )
        ).not.toHaveText(
            ""
        );

        const shellState =
            await viewer.evaluate(
                () =>
                    window
                        .MarketFlowViewerShell
                        .getState()
            );

        expect(
            shellState
                .recorderHealth
        ).toBe(
            "RUNNING"
        );

        await viewer.evaluate(
            () => {
                document
                    .querySelector(
                        "tr[data-security-id='1001']"
                    )
                    .dispatchEvent(
                        new MouseEvent(
                            "click",
                            {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }
                        )
                    );
            }
        );

        await expect(
            viewer.locator(
                "[data-role='viewer-status']"
            )
        ).toHaveAttribute(
            "data-view-state",
            "DETAIL"
        );

        await expect(
            viewer.locator(
                ".metrics"
            )
        ).toBeVisible();

        await expect(
            viewer.locator(
                "[data-role='recorder-health']"
            )
        ).toHaveText(
            "רץ"
        );
    }
);

test(
    "Stage 15.3 manual and BroadcastChannel refresh reread diagnostics from IndexedDB",
    async ({ page }) => {
        await seedDiagnosticsState(
            page,
            {
                cycleId: 1,
                completedCycles: 1,
                failedCycles: 0,
                historyCount: 1,
                rate: 100
            }
        );

        const viewer =
            await openViewer(
                page
            );

        await expect(
            viewer.locator(
                "[data-role='completed-cycles']"
            )
        ).toHaveText(
            "1"
        );

        await seedDiagnosticsState(
            page,
            {
                cycleId: 2,
                completedCycles: 2,
                failedCycles: 1,
                historyCount: 2,
                rate: 200
            }
        );

        await viewer
            .locator(
                "[data-role='manual-refresh']"
            )
            .click();

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "2"
        );

        await expect(
            viewer.locator(
                "[data-role='completed-cycles']"
            )
        ).toHaveText(
            "2"
        );

        await expect(
            viewer.locator(
                "[data-role='failed-cycles']"
            )
        ).toHaveText(
            "1"
        );

        await expect(
            viewer.locator(
                "[data-role='history-count']"
            )
        ).toHaveText(
            "2"
        );

        const refreshCountBefore =
            await viewer.evaluate(
                () =>
                    window.opener
                        .MarketFlowViewerLiveRefresh
                        .getState(
                            window
                        )
                        .refreshCount
            );

        await seedDiagnosticsState(
            page,
            {
                cycleId: 3,
                completedCycles: 3,
                failedCycles: 1,
                historyCount: 3,
                rate: 300
            }
        );

        await page.evaluate(
            () => {
                const now =
                    Date.now();

                window
                    .MarketFlowChannel
                    .publish(
                        window
                            .MarketFlowChannel
                            .MESSAGE_TYPES
                            .CYCLE_COMMITTED,
                        {
                            cycleId:
                                3,
                            completedAtMs:
                                now
                        },
                        now
                    );
            }
        );

        await viewer.waitForFunction(
            refreshCountBefore =>
                window.opener
                    .MarketFlowViewerLiveRefresh
                    .getState(
                        window
                    )
                    .refreshCount >
                refreshCountBefore,
            refreshCountBefore
        );

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "3"
        );

        await expect(
            viewer.locator(
                "[data-role='completed-cycles']"
            )
        ).toHaveText(
            "3"
        );

        await expect(
            viewer.locator(
                "[data-role='history-count']"
            )
        ).toHaveText(
            "3"
        );
    }
);
