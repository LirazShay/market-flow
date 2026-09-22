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

async function seedDetailFixture(
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
                const universeRows = [
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
                    },
                    {
                        securityId:
                            "1002",
                        paperName:
                            "Fixture Beta",
                        updatedAtMs:
                            100,
                        mapHeatDateChange:
                            null,
                        rawMapHeat: {
                            PaperId:
                                1002
                        }
                    }
                ];

                for (
                    const row of
                    universeRows
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .universe
                            .name,
                        row
                    );
                }

                const latestRows = [
                    {
                        securityId:
                            "1001",
                        cycleId: 502,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            2000,
                        chunkReceivedAtMs:
                            2010,
                        collectedAtMs:
                            2020,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1001,
                            LastKnownRate:
                                3210,
                            BaseRateChangePercentage:
                                1.5,
                            BuyLimit1:
                                null,
                            BuyVolume1:
                                0,
                            SellLimit1:
                                3220,
                            SellVolume1:
                                20,
                            DailyDealsQuantity:
                                8,
                            LastDealVolume:
                                5,
                            DailyTurnover:
                                50,
                            DailyNISRevenue:
                                5000,
                            DailyLowestRate:
                                3100,
                            DailyHighestRate:
                                3250,
                            LastDealTimeOnly:
                                "10:15"
                        }
                    },
                    {
                        securityId:
                            "1002",
                        cycleId: 502,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            2000,
                        chunkReceivedAtMs:
                            2010,
                        collectedAtMs:
                            2021,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1002,
                            LastKnownRate:
                                4500,
                            BaseRateChangePercentage:
                                -0.2,
                            BuyLimit1:
                                4490,
                            BuyVolume1:
                                10,
                            SellLimit1:
                                4510,
                            SellVolume1:
                                12,
                            DailyDealsQuantity:
                                12,
                            LastDealVolume:
                                3,
                            DailyTurnover:
                                80,
                            DailyNISRevenue:
                                8000,
                            DailyLowestRate:
                                4400,
                            DailyHighestRate:
                                4600,
                            LastDealTimeOnly:
                                "10:16"
                        }
                    }
                ];

                for (
                    const row of
                    latestRows
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .latest
                            .name,
                        row
                    );
                }

                await new Promise(
                    (resolve, reject) => {
                        const transaction =
                            database.transaction(
                                schema
                                    .stores
                                    .history
                                    .name,
                                "readwrite"
                            );

                        const store =
                            transaction.objectStore(
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        for (
                            let cycleId = 1;
                            cycleId <= 502;
                            cycleId++
                        ) {
                            store.put({
                                cycleId,
                                sessionId: 1,
                                securityId:
                                    "1001",
                                chunkIndex:
                                    cycleId % 3,
                                cycleStartedAtMs:
                                    1000 +
                                    cycleId,
                                chunkReceivedAtMs:
                                    1010 +
                                    cycleId,
                                collectedAtMs:
                                    1000 +
                                    cycleId,
                                serverAsOfDate:
                                    "server-" +
                                    cycleId,
                                data: {
                                    Key:
                                        1001,
                                    LastKnownRate:
                                        3000 +
                                        cycleId,
                                    BaseRateChangePercentage:
                                        1,
                                    BuyLimit1:
                                        null,
                                    BuyVolume1:
                                        0,
                                    SellLimit1:
                                        3200,
                                    SellVolume1:
                                        20,
                                    DailyDealsQuantity:
                                        cycleId,
                                    LastDealVolume:
                                        5,
                                    DailyTurnover:
                                        50,
                                    DailyNISRevenue:
                                        5000,
                                    LastDealTimeOnly:
                                        "10:15"
                                }
                            });
                        }

                        transaction.oncomplete =
                            () => resolve();

                        transaction.onerror =
                            () => reject(
                                transaction.error ??
                                new Error(
                                    "History fixture write failed."
                                )
                            );

                        transaction.onabort =
                            () => reject(
                                transaction.error ??
                                new Error(
                                    "History fixture write aborted."
                                )
                            );
                    }
                );
            } finally {
                connection
                    .closeDatabase(
                        database
                    );
            }
        }
    );
}

async function seedDetailRefreshCycle(
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
                const updatedLatest = [
                    {
                        securityId:
                            "1001",
                        cycleId: 503,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            3000,
                        chunkReceivedAtMs:
                            3010,
                        collectedAtMs:
                            3020,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1001,
                            LastKnownRate:
                                9000,
                            BaseRateChangePercentage:
                                2.25,
                            BuyLimit1:
                                8990,
                            BuyVolume1:
                                30,
                            SellLimit1:
                                9010,
                            SellVolume1:
                                40,
                            DailyDealsQuantity:
                                15,
                            LastDealVolume:
                                7,
                            DailyTurnover:
                                90,
                            DailyNISRevenue:
                                9000,
                            DailyLowestRate:
                                8800,
                            DailyHighestRate:
                                9050,
                            LastDealTimeOnly:
                                "10:17"
                        }
                    },
                    {
                        securityId:
                            "1002",
                        cycleId: 503,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            3000,
                        chunkReceivedAtMs:
                            3010,
                        collectedAtMs:
                            3021,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1002,
                            LastKnownRate:
                                1000,
                            BaseRateChangePercentage:
                                -0.5,
                            BuyLimit1:
                                990,
                            BuyVolume1:
                                20,
                            SellLimit1:
                                1010,
                            SellVolume1:
                                25,
                            DailyDealsQuantity:
                                20,
                            LastDealVolume:
                                4,
                            DailyTurnover:
                                100,
                            DailyNISRevenue:
                                10000,
                            DailyLowestRate:
                                950,
                            DailyHighestRate:
                                1100,
                            LastDealTimeOnly:
                                "10:17"
                        }
                    }
                ];

                for (
                    const row of
                    updatedLatest
                ) {
                    await write.put(
                        database,
                        schema
                            .stores
                            .latest
                            .name,
                        row
                    );
                }

                await write.put(
                    database,
                    schema
                        .stores
                        .history
                        .name,
                    {
                        cycleId: 503,
                        sessionId: 1,
                        securityId:
                            "1001",
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            3000,
                        chunkReceivedAtMs:
                            3010,
                        collectedAtMs:
                            3020,
                        serverAsOfDate:
                            "server-503",
                        data: {
                            Key: 1001,
                            LastKnownRate:
                                9000,
                            BaseRateChangePercentage:
                                2.25,
                            BuyLimit1:
                                8990,
                            BuyVolume1:
                                30,
                            SellLimit1:
                                9010,
                            SellVolume1:
                                40,
                            DailyDealsQuantity:
                                15,
                            LastDealVolume:
                                7,
                            DailyTurnover:
                                90,
                            DailyNISRevenue:
                                9000,
                            LastDealTimeOnly:
                                "10:17"
                        }
                    }
                );
            } finally {
                connection
                    .closeDatabase(
                        database
                    );
            }
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

        await seedDetailFixture(
            page
        );
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
    "Stage 14.3 keyboard row activation opens the correct detail summary and paged history UI",
    async ({ page }) => {
        const viewer =
            await openViewer(
                page
            );

        const alphaRow =
            viewer.locator(
                "tr[data-security-id='1001']"
            );

        await expect(
            alphaRow
        ).toHaveAttribute(
            "tabindex",
            "0"
        );

        await alphaRow.focus();
        await alphaRow.press(
            "Enter"
        );

        await viewer.waitForFunction(
            () =>
                document
                    .querySelector(
                        "[data-role='viewer-status']"
                    )
                    ?.dataset
                    .viewState ===
                "DETAIL"
        );

        await expect(
            viewer.locator(
                "[data-role='current-market-panel']"
            )
        ).toBeHidden();

        await expect(
            viewer.locator(
                "[data-role='security-detail-panel']"
            )
        ).toBeVisible();

        await expect(
            viewer.locator(
                "[data-role='detail-title']"
            )
        ).toHaveText(
            "Fixture Alpha"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-security-id']"
            )
        ).toHaveText(
            "1001"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-last-rate']"
            )
        ).toHaveText(
            "3,210"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-daily-change']"
            )
        ).toHaveText(
            "1.5%"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-bid-ask']"
            )
        ).toHaveText(
            "— / 3,220"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-last-deal-time']"
            )
        ).toHaveText(
            "10:15"
        );

        const historyRows =
            viewer.locator(
                "[data-role='security-history-table'] tbody tr"
            );

        await expect(
            historyRows
        ).toHaveCount(
            500
        );

        await expect(
            historyRows
                .first()
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "502"
        );

        await expect(
            historyRows
                .last()
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "3"
        );

        const loadOlder =
            viewer.locator(
                "[data-role='history-load-older']"
            );

        await expect(
            loadOlder
        ).toBeVisible();

        await loadOlder.click();

        await expect(
            historyRows
        ).toHaveCount(
            502
        );

        await expect(
            historyRows
                .nth(500)
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "2"
        );

        await expect(
            historyRows
                .nth(501)
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "1"
        );

        await expect(
            viewer.locator(
                "[data-role='history-load-older']"
            )
        ).toHaveCount(
            0
        );

        await viewer
            .locator(
                "[data-role='detail-back']"
            )
            .click();

        await expect(
            viewer.locator(
                "[data-role='current-market-panel']"
            )
        ).toBeVisible();

        await expect(
            viewer.locator(
                "[data-role='security-detail-panel']"
            )
        ).toBeHidden();

        await expect(
            viewer.locator(
                "[data-role='viewer-status']"
            )
        ).toHaveAttribute(
            "data-view-state",
            "MAIN"
        );
    }
);

test(
    "Stage 14.3 mouse row activation opens the selected security and renders explicit empty history",
    async ({ page }) => {
        const viewer =
            await openViewer(
                page
            );

        await viewer
            .locator(
                "tr[data-security-id='1002']"
            )
            .click();

        await expect(
            viewer.locator(
                "[data-role='detail-title']"
            )
        ).toHaveText(
            "Fixture Beta"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-security-id']"
            )
        ).toHaveText(
            "1002"
        );

        await expect(
            viewer.locator(
                "[data-role='history-empty']"
            )
        ).toHaveText(
            "לא נמצאה היסטוריה לנייר הזה."
        );

        await expect(
            viewer.locator(
                "[data-role='security-history-table']"
            )
        ).toHaveCount(
            0
        );
    }
);


test(
    "Stage 14.4 live refresh keeps DETAIL active, refreshes selected history and restores main sort plus scroll",
    async ({ page }) => {
        const viewer =
            await openViewer(
                page
            );

        const rateSort =
            viewer.locator(
                "button[data-sort-column='LastKnownRate']"
            );

        await rateSort.click();
        await rateSort.click();

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
            "1001",
            "1002"
        ]);

        const savedScrollLeft =
            await viewer.evaluate(
                () => {
                    const panel =
                        document
                            .querySelector(
                                "[data-role='current-market-panel']"
                            );

                    const wrapper =
                        document
                            .querySelector(
                                "[data-role='current-market-table-wrap']"
                            );

                    panel.style.width =
                        "360px";

                    const distance =
                        Math.min(
                            180,
                            Math.max(
                                1,
                                wrapper.scrollWidth -
                                wrapper.clientWidth
                            )
                        );

                    wrapper.scrollLeft =
                        -distance;

                    return wrapper
                        .scrollLeft;
                }
            );

        expect(
            savedScrollLeft
        ).not.toBe(0);

        await viewer.evaluate(
            () => {
                const row =
                    document.querySelector(
                        "tr[data-security-id='1001']"
                    );

                const wrapper =
                    document.querySelector(
                        "[data-role='current-market-table-wrap']"
                    );

                window
                    .__marketFlowStage144ScrollDiagnostic =
                    {
                        beforeClick:
                            wrapper.scrollLeft,
                        atClickCapture:
                            null
                    };

                row.addEventListener(
                    "click",
                    () => {
                        window
                            .__marketFlowStage144ScrollDiagnostic
                            .atClickCapture =
                            wrapper.scrollLeft;
                    },
                    {
                        capture: true,
                        once: true
                    }
                );
            }
        );

        await viewer
            .locator(
                "tr[data-security-id='1001']"
            )
            .click();

        const clickScrollDiagnostic =
            await viewer.evaluate(
                () =>
                    window
                        .__marketFlowStage144ScrollDiagnostic
            );

        expect(
            clickScrollDiagnostic
        ).toEqual({
            beforeClick:
                savedScrollLeft,
            atClickCapture:
                savedScrollLeft
        });

        await viewer.waitForFunction(
            () =>
                document
                    .querySelector(
                        "[data-role='viewer-status']"
                    )
                    ?.dataset
                    .viewState ===
                "DETAIL"
        );

        await viewer
            .locator(
                "[data-role='history-load-older']"
            )
            .click();

        await expect(
            viewer.locator(
                "[data-role='security-history-table'] tbody tr"
            )
        ).toHaveCount(
            502
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

        await seedDetailRefreshCycle(
            page
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
                                503,
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
                "[data-role='viewer-status']"
            )
        ).toHaveAttribute(
            "data-view-state",
            "DETAIL"
        );

        await expect(
            viewer.locator(
                "[data-role='security-detail-panel']"
            )
        ).toBeVisible();

        await expect(
            viewer.locator(
                "[data-role='detail-security-id']"
            )
        ).toHaveText(
            "1001"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-last-rate']"
            )
        ).toHaveText(
            "9,000"
        );

        await expect(
            viewer.locator(
                "[data-role='detail-daily-change']"
            )
        ).toHaveText(
            "2.25%"
        );

        const refreshedHistoryRows =
            viewer.locator(
                "[data-role='security-history-table'] tbody tr"
            );

        await expect(
            refreshedHistoryRows
        ).toHaveCount(
            503
        );

        await expect(
            refreshedHistoryRows
                .first()
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "503"
        );

        await expect(
            viewer.locator(
                "[data-role='history-load-older']"
            )
        ).toHaveCount(
            0
        );

        const detailState =
            await viewer.evaluate(
                () =>
                    window.opener
                        .MarketFlowViewerSecurityDetail
                        .getState(
                            window
                        )
            );

        expect(
            detailState.securityId
        ).toBe("1001");

        expect(
            detailState.loadedCount
        ).toBe(503);

        await viewer
            .locator(
                "[data-role='detail-back']"
            )
            .click();

        await expect(
            viewer.locator(
                "[data-role='viewer-status']"
            )
        ).toHaveAttribute(
            "data-view-state",
            "MAIN"
        );

        await expect(
            viewer.locator(
                "[data-role='current-market-table'] th[data-column='LastKnownRate']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "ascending"
        );

        const returnedOrder =
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
            returnedOrder
        ).toEqual([
            "1002",
            "1001"
        ]);

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "503"
        );

        const returnedViewport =
            await viewer.evaluate(
                async () => {
                    await new Promise(
                        resolve =>
                            requestAnimationFrame(
                                () =>
                                    resolve()
                            )
                    );

                    const panel =
                        document.querySelector(
                            "[data-role='current-market-panel']"
                        );

                    const wrapper =
                        document.querySelector(
                            "[data-role='current-market-table-wrap']"
                        );

                    return {
                        panelHidden:
                            panel.hidden,
                        panelWidth:
                            panel
                                .getBoundingClientRect()
                                .width,
                        scrollLeft:
                            wrapper.scrollLeft,
                        scrollWidth:
                            wrapper.scrollWidth,
                        clientWidth:
                            wrapper.clientWidth,
                        direction:
                            getComputedStyle(
                                wrapper
                            ).direction
                    };
                }
            );

        expect(
            returnedViewport
        ).toMatchObject({
            panelHidden:
                false,
            scrollLeft:
                savedScrollLeft
        });
    }
);
