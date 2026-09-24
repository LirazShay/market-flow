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
            }
        );
    });
}

async function seedCurrentRows(
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
                        .universe
                        .name,
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
                );

                const rows = [
                    {
                        securityId:
                            "1001",
                        cycleId: 7,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            1000,
                        chunkReceivedAtMs:
                            1050,
                        collectedAtMs:
                            1060,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1001,
                            LastKnownRate:
                                0,
                            BaseRateChangePercentage:
                                1.5,
                            BuyLimit1:
                                null,
                            BuyVolume1:
                                0,
                            SellLimit1:
                                101,
                            SellVolume1:
                                20,
                            DailyDealsQuantity:
                                3,
                            LastDealVolume:
                                null,
                            DailyTurnover:
                                50,
                            DailyNISRevenue:
                                5000,
                            DailyLowestRate:
                                95,
                            DailyHighestRate:
                                105,
                            LastDealTimeOnly:
                                ""
                        }
                    },
                    {
                        securityId:
                            "1002",
                        cycleId: 7,
                        sessionId: 1,
                        chunkIndex: 0,
                        cycleStartedAtMs:
                            1000,
                        chunkReceivedAtMs:
                            1050,
                        collectedAtMs:
                            1070,
                        serverAsOfDate:
                            null,
                        data: {
                            Key: 1002,
                            LastKnownRate:
                                2222,
                            BaseRateChangePercentage:
                                -0.25,
                            BuyLimit1:
                                2210,
                            BuyVolume1:
                                40,
                            SellLimit1:
                                2230,
                            SellVolume1:
                                30,
                            DailyDealsQuantity:
                                12,
                            LastDealVolume:
                                5,
                            DailyTurnover:
                                300,
                            DailyNISRevenue:
                                9000,
                            DailyLowestRate:
                                2100,
                            DailyHighestRate:
                                2300,
                            LastDealTimeOnly:
                                "10:00"
                        }
                    }
                ];

                for (
                    const row of
                    rows
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
    "Stage 11 loads latest + universe from IndexedDB and renders the current table",
    async ({ page }) => {
        await seedCurrentRows(
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
                "MAIN"
        );

        const rendered =
            await viewer.evaluate(
                () => ({
                    headers:
                        Array.from(
                            document
                                .querySelectorAll(
                                    "[data-role='current-market-table'] thead th"
                                )
                        ).map(
                            element =>
                                element
                                    .textContent
                        ),
                    rows:
                        document
                            .querySelectorAll(
                                "[data-role='current-market-table'] tbody tr"
                            )
                            .length,
                    firstName:
                        document
                            .querySelector(
                                "tr[data-security-id='1001'] td[data-column='paperName']"
                            )
                            ?.textContent,
                    zeroRate:
                        document
                            .querySelector(
                                "tr[data-security-id='1001'] td[data-column='LastKnownRate']"
                            )
                            ?.textContent,
                    nullBid:
                        document
                            .querySelector(
                                "tr[data-security-id='1001'] td[data-column='BuyLimit1']"
                            )
                            ?.textContent,
                    emptyTime:
                        document
                            .querySelector(
                                "tr[data-security-id='1001'] td[data-column='LastDealTimeOnly']"
                            )
                            ?.textContent,
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
                            ?.textContent
                })
            );

        expect(
            rendered.headers
        ).toHaveLength(16);

        expect(
            rendered.rows
        ).toBe(2);

        expect(
            rendered.firstName
        ).toBe(
            "Fixture Alpha"
        );

        expect(
            rendered.zeroRate
        ).toBe("0");

        expect(
            rendered.nullBid
        ).toBe("—");

        expect(
            rendered.emptyTime
        ).toBe("—");

        expect(
            rendered.count
        ).toBe("2");

        expect(
            rendered.cycle
        ).toBe("7");
    }
);

test(
    "Stage 11 renders EMPTY when IndexedDB has no latest snapshot",
    async ({ page }) => {
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

        const result =
            await viewer.evaluate(
                () => ({
                    message:
                        document
                            .querySelector(
                                "[data-role='current-market-empty']"
                            )
                            ?.textContent,
                    rows:
                        document
                            .querySelectorAll(
                                "[data-role='current-market-table'] tbody tr"
                            )
                            .length,
                    count:
                        document
                            .querySelector(
                                "[data-role='security-count']"
                            )
                            ?.textContent,
                    currentState:
                        window
                            .MarketFlowViewerShell
                            .getState()
                            .viewState
                })
            );

        expect(
            result.message
        ).toBe(
            "אין עדיין snapshot מלא."
        );

        expect(
            result.rows
        ).toBe(0);

        expect(
            result.count
        ).toBe("0");

        expect(
            result.currentState
        ).toBe("EMPTY");
    }
);


test(
    "Stage 13.2 renders sortable accessible headers and applies interactive sort order",
    async ({ page }) => {
        await seedCurrentRows(
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
                "MAIN"
        );

        const rowOrder =
            () =>
                viewer.evaluate(
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

        await expect(
            viewer.locator(
                "th[data-column='DailyDealsQuantity']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "descending"
        );

        await expect(
            viewer.locator(
                "button[data-sort-column='DailyDealsQuantity']"
            )
        ).toContainText(
            "▼"
        );

        expect(
            await rowOrder()
        ).toEqual([
            "1002",
            "1001"
        ]);

        const paperNameButton =
            viewer.locator(
                "button[data-sort-column='paperName']"
            );

        await paperNameButton.focus();
        await paperNameButton.press(
            "Enter"
        );

        await expect(
            viewer.locator(
                "th[data-column='paperName']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "ascending"
        );

        await expect(
            viewer.locator(
                "th[data-column='DailyDealsQuantity']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "none"
        );

        await expect(
            viewer.locator(
                "button[data-sort-column='paperName']"
            )
        ).toContainText(
            "▲"
        );

        expect(
            await rowOrder()
        ).toEqual([
            "1001",
            "1002"
        ]);

        await viewer
            .locator(
                "button[data-sort-column='paperName']"
            )
            .click();

        await expect(
            viewer.locator(
                "th[data-column='paperName']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "descending"
        );

        await expect(
            viewer.locator(
                "button[data-sort-column='paperName']"
            )
        ).toContainText(
            "▼"
        );

        expect(
            await rowOrder()
        ).toEqual([
            "1002",
            "1001"
        ]);

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
            "descending"
        );

        expect(
            await rowOrder()
        ).toEqual([
            "1002",
            "1001"
        ]);
    }
);
