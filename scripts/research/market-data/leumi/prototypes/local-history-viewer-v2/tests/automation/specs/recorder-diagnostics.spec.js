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

async function readStore(
    page,
    storeName
) {
    return await page.evaluate(
        async storeName => {
            const {
                MarketFlowStorageConnection:
                    connection,
                MarketFlowStorageUpgrade:
                    upgrade,
                MarketFlowStorageRead:
                    read
            } = window;

            const database =
                await connection
                    .openDatabase({
                        onUpgradeNeeded:
                            upgrade
                                .upgradeDatabase
                    });

            try {
                return await read.getAll(
                    database,
                    storeName
                );
            } finally {
                connection
                    .closeDatabase(
                        database
                    );
            }
        },
        storeName
    );
}

test(
    "Stage 9 persists failed cycles and counters without touching history/latest",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "securitiesHttpFailure"
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

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .failedCycles ===
                1
        );

        await page.evaluate(
            async () => {
                const recorder =
                    window
                        .MarketFlowRecorderLoop;

                recorder.stop(
                    "diagnostics-test"
                );

                await recorder
                    .waitForStopPersistence();
            }
        );

        const cycles =
            await readStore(
                page,
                "cycles"
            );

        const history =
            await readStore(
                page,
                "history"
            );

        const latest =
            await readStore(
                page,
                "latest"
            );

        const sessions =
            await readStore(
                page,
                "sessions"
            );

        expect(cycles).toHaveLength(1);
        expect(cycles[0].status)
            .toBe("failed");
        expect(cycles[0].requested)
            .toBe(4);
        expect(cycles[0].received)
            .toBeNull();
        expect(cycles[0].error.message)
            .toContain("HTTP 500");

        expect(history).toHaveLength(0);
        expect(latest).toHaveLength(0);

        expect(sessions).toHaveLength(1);
        expect(sessions[0].failedCycles)
            .toBe(1);
    }
);

test(
    "Stage 9 heartbeat and storage estimate expose diagnostics without changing counters",
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

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .completedCycles ===
                1
        );

        const result =
            await page.evaluate(
                async () => {
                    const recorder =
                        window
                            .MarketFlowRecorderLoop;

                    const before =
                        await recorder
                            .getDiagnostics();

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                5
                            )
                    );

                    await recorder
                        .heartbeatNow();

                    const after =
                        await recorder
                            .getDiagnostics();

                    recorder.stop(
                        "diagnostics-success"
                    );

                    await recorder
                        .waitForStopPersistence();

                    return {
                        before,
                        after
                    };
                }
            );

        expect(
            result.after
                .persistence
                .sessionId
        ).toBeGreaterThan(0);

        expect(
            result.after
                .heartbeat
                .intervalMs
        ).toBe(5000);

        expect(
            result.after
                .heartbeat
                .lastError
        ).toBeNull();

        expect(
            result.after
                .recorder
                .completedCycles
        ).toBe(1);

        expect(
            result.after
                .recorder
                .failedCycles
        ).toBe(0);

        expect(
            result.after
                .storage
                .usageBytes
        ).toBeGreaterThanOrEqual(0);

        expect(
            result.after
                .storage
                .quotaBytes
        ).toBeGreaterThan(0);

        expect(
            result.after
                .storage
                .freeBytes
        ).toBeGreaterThanOrEqual(0);

        expect(
            result.before
                .storage
                .usageRatio
        ).toBeGreaterThanOrEqual(0);

        await deleteDatabase(
            page
        );
    }
);
