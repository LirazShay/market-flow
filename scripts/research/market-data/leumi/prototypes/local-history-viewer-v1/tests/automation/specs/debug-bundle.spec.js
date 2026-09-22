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
            serialized
                .toLowerCase()
        ).not.toContain(
            "authorization"
        );

        expect(
            serialized
                .toLowerCase()
        ).not.toContain(
            "cookie"
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
                    .MarketFlowChannel
                    .closePublisher();
            }
        );

        await deleteDatabase(
            page
        );
    }
);
