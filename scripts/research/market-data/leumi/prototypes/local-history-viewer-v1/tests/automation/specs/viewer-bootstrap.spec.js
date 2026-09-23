const {
    test,
    expect
} = require("@playwright/test");

test(
    "Stage 10 opens a Hebrew RTL same-origin viewer shell with BOOTING state",
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
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

        await viewer.waitForLoadState(
            "domcontentloaded"
        );

        const contract =
            await viewer.evaluate(
                () => ({
                    lang:
                        document
                            .documentElement
                            .lang,
                    dir:
                        document
                            .documentElement
                            .dir,
                    marker:
                        document
                            .documentElement
                            .dataset
                            .marketFlowViewer,
                    title:
                        document.title,
                    initialState:
                        window
                            .MarketFlowViewerShell
                            .initialState,
                    hasCurrentPanel:
                        Boolean(
                            document
                                .querySelector(
                                    "[data-role='current-market-panel']"
                                )
                        ),
                    detailHidden:
                        document
                            .querySelector(
                                "[data-role='security-detail-panel']"
                            )
                            ?.hidden,
                    shell:
                        window
                            .MarketFlowViewerShell
                })
            );

        expect(
            contract.lang
        ).toBe("he");

        expect(
            contract.dir
        ).toBe("rtl");

        expect(
            contract.marker
        ).toBe(
            "market-flow-leumi-v1"
        );

        expect(
            contract.title
        ).toBe(
            "Market Flow — תצוגת שוק"
        );

        expect(
            contract.initialState
                .viewState
        ).toBe("BOOTING");

        expect(
            contract.hasCurrentPanel
        ).toBe(true);

        expect(
            contract.detailHidden
        ).toBe(true);

        expect(
            contract.shell
                .initialState
                .recorderHealth
        ).toBe("UNKNOWN");

        await viewer.close();
    }
);

test(
    "Stage 10 viewer shares the opener IndexedDB origin",
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

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
                                "stage10SameOriginProof",
                            value:
                                "visible-from-viewer"
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

        const value =
            await viewer.evaluate(
                async () => {
                    const databaseName =
                        "market-flow-leumi-history-v1";

                    const database =
                        await new Promise(
                            (
                                resolve,
                                reject
                            ) => {
                                const request =
                                    indexedDB.open(
                                        databaseName,
                                        1
                                    );

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

                    try {
                        return await new Promise(
                            (
                                resolve,
                                reject
                            ) => {
                                const transaction =
                                    database
                                        .transaction(
                                            [
                                                "meta"
                                            ],
                                            "readonly"
                                        );

                                const request =
                                    transaction
                                        .objectStore(
                                            "meta"
                                        )
                                        .get(
                                            "stage10SameOriginProof"
                                        );

                                request.onsuccess =
                                    () =>
                                        resolve(
                                            request
                                                .result
                                                ?.value ??
                                            null
                                        );

                                request.onerror =
                                    () =>
                                        reject(
                                            request.error
                                        );
                            }
                        );
                    } finally {
                        database.close();
                    }
                }
            );

        expect(
            value
        ).toBe(
            "visible-from-viewer"
        );

        await viewer.close();
    }
);

test(
    "Stage 10 keeps repeated viewer opens usable without changing the data authority",
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

        const popupPromise =
            page.waitForEvent(
                "popup"
            );

        const first =
            await page.evaluate(
                () => {
                    window
                        .MarketFlowViewerBootstrap
                        .openViewer();

                    return window
                        .MarketFlowViewerBootstrap
                        .getViewerSnapshot();
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

        const second =
            await page.evaluate(
                () => {
                    window
                        .MarketFlowViewerBootstrap
                        .openViewer();

                    return window
                        .MarketFlowViewerBootstrap
                        .getViewerSnapshot();
                }
            );

        expect(
            first.isOpen
        ).toBe(true);

        expect(
            second.isOpen
        ).toBe(true);

        expect(
            second.windowName
        ).toBe(
            "market-flow-leumi-v1-viewer"
        );

        expect(
            second.marker
        ).toBe(
            "market-flow-leumi-v1"
        );

        expect(
            second.state
                .viewState
        ).toBe("EMPTY");

        await expect(
            viewer.locator(
                "[data-role='viewer-status']"
            )
        ).toHaveAttribute(
            "data-view-state",
            "EMPTY"
        );

        await viewer.close();
    }
);
