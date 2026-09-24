"use strict";

const {
    test,
    expect
} =
    require(
        "@playwright/test"
    );

const {
    installLeumiApiMocks
} =
    require(
        "../helpers/mock-leumi-api"
    );

async function deleteDatabase(
    page
) {
    await page.evaluate(
        async () => {
            const databaseName =
                window
                    .MarketFlowStorageSchema
                    .databaseName;

            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const request =
                        indexedDB
                            .deleteDatabase(
                                databaseName
                            );

                    request.onsuccess =
                        () =>
                            resolve();

                    request.onerror =
                        () =>
                            reject(
                                request.error ??
                                new Error(
                                    "Failed to delete debug-bundle test database."
                                )
                            );

                    request.onblocked =
                        () =>
                            reject(
                                new Error(
                                    "Debug-bundle test database deletion was blocked."
                                )
                            );
                }
            );
        }
    );
}

test(
    "Debug Bundle captures bounded sanitized evidence from the normal running recorder",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        await deleteDatabase(
            page
        );

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            1,
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
                3
        );

        const bundle =
            await page.evaluate(
                async () =>
                    await window
                        .MarketFlowDebugBundle
                        .create({
                            recentCycleLimit:
                                3
                        })
            );

        expect(
            bundle.formatVersion
        ).toBe(1);

        expect(
            bundle.database
                .name
        ).toBe(
            "market-flow-leumi-history-v1"
        );

        expect(
            bundle.database
                .rowCounts
                .latest
        ).toBe(4);

        expect(
            bundle.database
                .rowCounts
                .cycles
        ).toBeGreaterThanOrEqual(
            3
        );

        expect(
            bundle.database
                .rowCounts
                .history
        ).toBeGreaterThanOrEqual(
            12
        );

        expect(
            bundle.recentCycles
        ).toHaveLength(3);

        expect(
            bundle.recentCycles[0]
                .securityCount
        ).toBe(4);

        expect(
            bundle.recentCycles[0]
                .changedMarketSecuritiesVsPrevious
        ).toBe(0);

        expect(
            bundle.recentCycles[0]
                .changedProviderTimeSecuritiesVsPrevious
        ).toBe(0);

        expect(
            bundle.latestCompleteCycle
                .securitySummaries
        ).toHaveLength(4);

        expect(
            bundle.runtime
                .recorder
                .completedCycles
        ).toBeGreaterThanOrEqual(
            3
        );

        expect(
            bundle.page
                .origin
        ).toBe(
            new URL(
                page.url()
            ).origin
        );

        const serialized =
            JSON.stringify(
                bundle
            );

        expect(
            serialized
        ).not.toContain(
            "\"rawMapHeat\""
        );

        expect(
            serialized
        ).not.toContain(
            "\"data\":"
        );

        expect(
            bundle.safety
                .authorizationHeadersIncluded
        ).toBe(false);

        expect(
            bundle.safety
                .cookiesIncluded
        ).toBe(false);

        expect(
            bundle.safety
                .browserStorageDumpIncluded
        ).toBe(false);

        expect(
            serialized
        ).not.toMatch(
            /"authorization"\s*:/i
        );

        expect(
            serialized
        ).not.toMatch(
            /"cookie"\s*:/i
        );

        expect(
            serialized
        ).not.toMatch(
            /"accountNumber"\s*:/i
        );

        expect(
            serialized
        ).not.toMatch(
            /"sessionStorage"\s*:/i
        );

        expect(
            serialized
        ).not.toMatch(
            /"localStorage"\s*:/i
        );

        const popupPromise =
            page.waitForEvent(
                "popup"
            );

        await page.evaluate(
            () =>
                window
                    .MarketFlowViewerBootstrap
                    .openViewer()
        );

        const viewer =
            await popupPromise;

        const exportButton =
            viewer.locator(
                "[data-role='export-debug']"
            );

        await expect(
            exportButton
        ).toBeVisible();

        await expect(
            exportButton
        ).toHaveText(
            "הורד קובץ Debug"
        );

        const downloadPromise =
            page.waitForEvent(
                "download"
            );

        await exportButton.click();

        const debugDownload =
            await downloadPromise;

        expect(
            debugDownload
                .suggestedFilename()
        ).toMatch(
            /^market-flow-debug-\d{8}-\d{6}\.json$/
        );

        await expect(
            viewer.locator(
                "[data-role='debug-export-status']"
            )
        ).toContainText(
            debugDownload
                .suggestedFilename()
        );

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "debug-bundle-test"
                );

                await recorder
                    .waitForStopPersistence();

                window
                    .MarketFlowViewerBootstrap
                    .closeViewer();

                window
                    .MarketFlowChannel
                    .closePublisher();
            }
        );
    }
);
