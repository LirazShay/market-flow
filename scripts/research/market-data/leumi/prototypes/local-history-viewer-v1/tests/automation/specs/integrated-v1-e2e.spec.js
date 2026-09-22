"use strict";

const {
    test,
    expect
} = require("@playwright/test");

const {
    installLeumiApiMocks
} = require(
    "../helpers/mock-leumi-api"
);

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

async function readPersistedCounts(
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
                    cycles:
                        await read.count(
                            database,
                            schema
                                .stores
                                .cycles
                                .name
                        ),
                    latest:
                        await read.count(
                            database,
                            schema
                                .stores
                                .latest
                                .name
                        ),
                    history:
                        await read.count(
                            database,
                            schema
                                .stores
                                .history
                                .name
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
        "EMPTY"
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
                        "stage19-e2e-cleanup"
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
    "Stage 19.1 full mocked E2E covers recorder IndexedDB BroadcastChannel viewer sorting and history",
    async ({ page }) => {
        test.setTimeout(
            60000
        );

        const mock =
            await installLeumiApiMocks(
                page,
                "success"
            );

        await page.reload();

        await deleteDatabase(
            page
        );

        const viewer =
            await openViewer(
                page
            );

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            2000,
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
                    .completedCycles >=
                1
        );

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
                "[data-role='security-count']"
            )
        ).toHaveText(
            "4"
        );

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "1"
        );

        expect(
            await readPersistedCounts(
                page
            )
        ).toEqual({
            cycles:
                1,
            latest:
                4,
            history:
                4
        });

        const firstRefreshCount =
            await viewer.evaluate(
                () =>
                    window.opener
                        .MarketFlowViewerLiveRefresh
                        .getState(
                            window
                        )
                        .refreshCount
            );

        expect(
            firstRefreshCount
        ).toBeGreaterThanOrEqual(
            1
        );

        const paperNameButton =
            viewer.locator(
                "button[data-sort-column='paperName']"
            );

        await paperNameButton.click();

        await expect(
            viewer.locator(
                "th[data-column='paperName']"
            )
        ).toHaveAttribute(
            "aria-sort",
            "ascending"
        );

        const sortedSecurityIds =
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
            sortedSecurityIds
        ).toEqual([
            "1001",
            "1002",
            "1004",
            "1003"
        ]);

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .completedCycles >=
                2
        );

        await expect(
            viewer.locator(
                "[data-role='last-cycle']"
            )
        ).toHaveText(
            "2"
        );

        await expect
            .poll(
                () =>
                    viewer.evaluate(
                        () =>
                            window.opener
                                .MarketFlowViewerLiveRefresh
                                .getState(
                                    window
                                )
                                .refreshCount
                    )
            )
            .toBeGreaterThan(
                firstRefreshCount
            );

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "stage19-e2e-complete"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        expect(
            await readPersistedCounts(
                page
            )
        ).toEqual({
            cycles:
                2,
            latest:
                4,
            history:
                8
        });

        const mapHeatCalls =
            mock.calls.filter(
                call =>
                    call.endpoint ===
                    "MapHeat2"
            );

        expect(
            mapHeatCalls
        ).toHaveLength(2);

        expect(
            mapHeatCalls.map(
                call =>
                    call.pageCount
            )
        ).toEqual([
            "1",
            "4"
        ]);

        expect(
            mock.calls.filter(
                call =>
                    call.endpoint ===
                    "GetSecuritiesData"
            )
        ).toHaveLength(4);

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
                                bubbles:
                                    true,
                                cancelable:
                                    true,
                                view:
                                    window
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
                "[data-role='detail-title']"
            )
        ).toHaveText(
            "Fixture Alpha"
        );

        const historyRows =
            viewer.locator(
                "[data-role='security-history-table'] tbody tr"
            );

        await expect(
            historyRows
        ).toHaveCount(
            2
        );

        await expect(
            historyRows
                .first()
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "2"
        );

        await expect(
            historyRows
                .last()
                .locator(
                    "td[data-column='cycleId']"
                )
        ).toHaveText(
            "1"
        );
    }
);
