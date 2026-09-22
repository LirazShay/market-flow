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

async function seedHistory(
    page
) {
    await page.evaluate(
        async () => {
            const {
                MarketFlowStorageConnection:
                    connection,
                MarketFlowStorageUpgrade:
                    upgrade,
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
                                    "A",
                                chunkIndex: 0,
                                cycleStartedAtMs:
                                    1000 +
                                    cycleId,
                                chunkReceivedAtMs:
                                    1000 +
                                    cycleId,
                                collectedAtMs:
                                    1000 +
                                    cycleId,
                                serverAsOfDate:
                                    null,
                                data: {
                                    Key: "A",
                                    LastKnownRate:
                                        cycleId
                                }
                            });
                        }

                        for (
                            let cycleId = 1;
                            cycleId <= 7;
                            cycleId++
                        ) {
                            store.put({
                                cycleId:
                                    1000 +
                                    cycleId,
                                sessionId: 1,
                                securityId:
                                    "B",
                                chunkIndex: 0,
                                cycleStartedAtMs:
                                    5000 +
                                    cycleId,
                                chunkReceivedAtMs:
                                    5000 +
                                    cycleId,
                                collectedAtMs:
                                    5000 +
                                    cycleId,
                                serverAsOfDate:
                                    null,
                                data: {
                                    Key: "B",
                                    LastKnownRate:
                                        cycleId
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
        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 14.1 loads only one security newest-first with the 500-row initial-page contract",
    async ({ page }) => {
        await seedHistory(
            page
        );

        const result =
            await page.evaluate(
                async () =>
                    window
                        .MarketFlowViewerHistoryData
                        .loadInitialPage(
                            "A"
                        )
            );

        expect(
            result.securityId
        ).toBe("A");

        expect(
            result.rows
        ).toHaveLength(500);

        expect(
            result.hasMore
        ).toBe(true);

        expect(
            result.pageSize
        ).toBe(500);

        expect(
            result.rows.every(
                row =>
                    row.securityId ===
                    "A"
            )
        ).toBe(true);

        expect(
            result.rows[0]
                .cycleId
        ).toBe(502);

        expect(
            result.rows[0]
                .collectedAtMs
        ).toBe(1502);

        expect(
            result.rows[499]
                .cycleId
        ).toBe(3);

        expect(
            result.rows.some(
                row =>
                    row.securityId ===
                    "B"
            )
        ).toBe(false);
    }
);

test(
    "Stage 14.1 returns an empty page for a security with no history",
    async ({ page }) => {
        await seedHistory(
            page
        );

        const result =
            await page.evaluate(
                async () =>
                    window
                        .MarketFlowViewerHistoryData
                        .loadInitialPage(
                            "missing"
                        )
            );

        expect(
            result.rows
        ).toEqual([]);

        expect(
            result.hasMore
        ).toBe(false);

        expect(
            result.pageSize
        ).toBe(500);
    }
);
