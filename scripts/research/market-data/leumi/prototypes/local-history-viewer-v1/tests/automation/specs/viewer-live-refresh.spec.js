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

async function seedSingleCurrentRow(
    page,
    {
        cycleId,
        rate
    }
) {
    await page.evaluate(
        async ({
            cycleId,
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
                        .universe
                        .name,
                    {
                        securityId:
                            "1001",
                        paperName:
                            "Fixture Alpha",
                        updatedAtMs:
                            100,
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
                            1000,
                        chunkReceivedAtMs:
                            1010,
                        collectedAtMs:
                            1020 +
                            cycleId,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1001,
                            LastKnownRate:
                                rate,
                            BaseRateChangePercentage:
                                0,
                            BuyLimit1:
                                null,
                            BuyVolume1:
                                null,
                            SellLimit1:
                                null,
                            SellVolume1:
                                null,
                            DailyDealsQuantity:
                                1,
                            LastDealVolume:
                                null,
                            DailyTurnover:
                                1,
                            DailyNISRevenue:
                                1,
                            DailyLowestRate:
                                rate,
                            DailyHighestRate:
                                rate,
                            LastDealTimeOnly:
                                ""
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
            rate
        }
    );
}

async function seedSortableCurrentRows(
    page,
    {
        cycleId,
        alphaRate,
        betaRate
    }
) {
    await page.evaluate(
        async ({
            cycleId,
            alphaRate,
            betaRate
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
                const securities = [
                    {
                        securityId:
                            "2001",
                        paperName:
                            "Alpha",
                        rate:
                            alphaRate
                    },
                    {
                        securityId:
                            "2002",
                        paperName:
                            "Beta",
                        rate:
                            betaRate
                    }
                ];

                for (
                    const security of
                    securities
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .universe
                            .name,
                        {
                            securityId:
                                security
                                    .securityId,
                            paperName:
                                security
                                    .paperName,
                            updatedAtMs:
                                100 +
                                cycleId,
                            mapHeatDateChange:
                                null,
                            rawMapHeat: {
                                PaperId:
                                    Number(
                                        security
                                            .securityId
                                    )
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
                                security
                                    .securityId,
                            cycleId,
                            sessionId:
                                1,
                            chunkIndex:
                                0,
                            cycleStartedAtMs:
                                1000,
                            chunkReceivedAtMs:
                                1010,
                            collectedAtMs:
                                2000 +
                                cycleId,
                            serverAsOfDate:
                                null,
                            data: {
                                Key:
                                    Number(
                                        security
                                            .securityId
                                    ),
                                LastKnownRate:
                                    security
                                        .rate,
                                BaseRateChangePercentage:
                                    0,
                                BuyLimit1:
                                    null,
                                BuyVolume1:
                                    null,
                                SellLimit1:
                                    null,
                                SellVolume1:
                                    null,
                                DailyDealsQuantity:
                                    1,
                                LastDealVolume:
                                    null,
                                DailyTurnover:
                                    1,
                                DailyNISRevenue:
                                    1,
                                DailyLowestRate:
                                    security
                                        .rate,
                                DailyHighestRate:
                                    security
                                        .rate,
                                LastDealTimeOnly:
                                    ""
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
        },
        {
            cycleId,
            alphaRate,
            betaRate
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
                    recorder
                        .getState()
                        .isRunning
                ) {
                    recorder.stop(
                        "stage-12-cleanup"
                    );

                    await recorder
                        .waitForStopPersistence();
                }

                window
                    .MarketFlowViewerBootstrap
                    .closeViewer();

                window
                    .MarketFlowChannel
                    .closePublisher();
            }
        );

        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 12 recorder commit notifies the viewer which reloads IndexedDB",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "success"
        );

        await page.reload();

        await deleteDatabase(
            page
        );

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
                "EMPTY"
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

        await viewer.waitForFunction(
            () =>
                document
                    .querySelector(
                        "[data-role='security-count']"
                    )
                    ?.textContent ===
                "4"
        );

        const result =
            await viewer.evaluate(
                () => ({
                    count:
                        document
                            .querySelector(
                                "[data-role='security-count']"
                            )
                            ?.textContent,
                    cycle:
                        document
                            .querySelector(
                                "[data-role='last-cycle']"
                            )
                            ?.textContent,
                    mode:
                        document
                            .querySelector(
                                "[data-role='live-refresh-status']"
                            )
                            ?.textContent,
                    refreshState:
                        window.opener
                            .MarketFlowViewerLiveRefresh
                            .getState(
                                window
                            )
                })
            );

        expect(
            result.count
        ).toBe("4");

        expect(
            Number(
                result.cycle
            )
        ).toBeGreaterThan(0);

        expect(
            result.mode
        ).toBe(
            "עדכון חי פעיל"
        );

        expect(
            result.refreshState
                .refreshCount
        ).toBeGreaterThanOrEqual(
            1
        );
    }
);

test(
    "Stage 12 manual refresh reloads IndexedDB without calling the market API",
    async ({ page }) => {
        await seedSingleCurrentRow(
            page,
            {
                cycleId: 1,
                rate: 100
            }
        );

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
                        "[data-role='last-cycle']"
                    )
                    ?.textContent ===
                "1"
        );

        await seedSingleCurrentRow(
            page,
            {
                cycleId: 2,
                rate: 200
            }
        );

        await viewer.click(
            "[data-role='manual-refresh']"
        );

        await viewer.waitForFunction(
            () =>
                document
                    .querySelector(
                        "[data-role='last-cycle']"
                    )
                    ?.textContent ===
                "2"
        );

        const result =
            await viewer.evaluate(
                () => ({
                    rate:
                        document
                            .querySelector(
                                "tr[data-security-id='1001'] td[data-column='LastKnownRate']"
                            )
                            ?.textContent,
                    cycle:
                        document
                            .querySelector(
                                "[data-role='last-cycle']"
                            )
                            ?.textContent
                })
            );

        expect(
            result.rate
        ).toBe("200");

        expect(
            result.cycle
        ).toBe("2");
    }
);

test(
    "Stage 12 BroadcastChannel-unavailable fallback keeps startup and manual refresh usable",
    async ({ browser }) => {
        const context =
            await browser.newContext();

        await context.addInitScript(
            () => {
                Object.defineProperty(
                    window,
                    "BroadcastChannel",
                    {
                        configurable:
                            true,
                        value:
                            undefined
                    }
                );
            }
        );

        const page =
            await context.newPage();

        try {
            await page.goto(
                "/tests/automation/harness.html"
            );

            await deleteDatabase(
                page
            );

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
                    "EMPTY"
            );

            const degraded =
                await viewer.evaluate(
                    () => ({
                        live:
                            document
                                .querySelector(
                                    "[data-role='live-refresh-status']"
                                )
                                ?.textContent,
                        available:
                            window.opener
                                .MarketFlowViewerLiveRefresh
                                .getState(
                                    window
                                )
                                .available
                    })
                );

            expect(
                degraded.available
            ).toBe(false);

            expect(
                degraded.live
            ).toContain(
                "רענן ידנית"
            );

            await seedSingleCurrentRow(
                page,
                {
                    cycleId:
                        3,
                    rate:
                        300
                }
            );

            await viewer.click(
                "[data-role='manual-refresh']"
            );

            await viewer.waitForFunction(
                () =>
                    document
                        .querySelector(
                            "[data-role='last-cycle']"
                        )
                        ?.textContent ===
                    "3"
            );

            expect(
                await viewer
                    .locator(
                        "tr[data-security-id='1001'] td[data-column='LastKnownRate']"
                    )
                    .textContent()
            ).toBe("300");
        } finally {
            await context.close();
        }
    }
);


test(
    "Stage 13.3 preserves selected sort across BroadcastChannel live refresh",
    async ({ page }) => {
        await seedSortableCurrentRows(
            page,
            {
                cycleId: 1,
                alphaRate: 100,
                betaRate: 200
            }
        );

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
                        "[data-role='last-cycle']"
                    )
                    ?.textContent ===
                "1"
        );

        const lastRateButton =
            viewer.locator(
                "button[data-sort-column='LastKnownRate']"
            );

        await lastRateButton.click();
        await viewer
            .locator(
                "button[data-sort-column='LastKnownRate']"
            )
            .click();

        await expect(
            viewer.locator(
                "th[data-column='LastKnownRate']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "ascending"
        );

        const initialOrder =
            await viewer.evaluate(
                () =>
                    Array.from(
                        document
                            .querySelectorAll(
                                "[data-role='current-market-table'] tbody tr"
                            )
                    ).map(
                        row =>
                            row.dataset
                                .securityId
                    )
            );

        expect(
            initialOrder
        ).toEqual([
            "2001",
            "2002"
        ]);

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

        await seedSortableCurrentRows(
            page,
            {
                cycleId: 2,
                alphaRate: 300,
                betaRate: 50
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
                                2,
                            completedAtMs:
                                now
                        },
                        now
                    );
            }
        );

        await viewer.waitForFunction(
            () =>
                document
                    .querySelector(
                        "[data-role='last-cycle']"
                    )
                    ?.textContent ===
                "2"
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
                "th[data-column='LastKnownRate']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "ascending"
        );

        await expect(
            viewer.locator(
                "button[data-sort-column='LastKnownRate']"
            )
        ).toContainText(
            "▲"
        );

        await expect(
            viewer.locator(
                "th[data-column='DailyDealsQuantity']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "none"
        );

        const refreshedOrder =
            await viewer.evaluate(
                () =>
                    Array.from(
                        document
                            .querySelectorAll(
                                "[data-role='current-market-table'] tbody tr"
                            )
                    ).map(
                        row =>
                            row.dataset
                                .securityId
                    )
            );

        expect(
            refreshedOrder
        ).toEqual([
            "2002",
            "2001"
        ]);
    }
);
