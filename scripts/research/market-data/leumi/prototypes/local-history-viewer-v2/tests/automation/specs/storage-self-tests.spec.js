const {
    test,
    expect
} = require("@playwright/test");

async function deleteDatabase(page) {
    await page.evaluate(async () => {
        const databaseName =
            window.MarketFlowStorageSchema
                .databaseName;

        await new Promise(
            (resolve, reject) => {
                const request =
                    indexedDB.deleteDatabase(
                        databaseName
                    );

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject(
                        request.error ??
                        new Error(
                            "Failed to delete test database."
                        )
                    );
                };

                request.onblocked = () => {
                    reject(
                        new Error(
                            "Test database deletion was blocked."
                        )
                    );
                };
            }
        );
    });
}

test(
    "existing storage self-tests pass in real Chromium IndexedDB",
    async ({ page }) => {
        const pageErrors = [];

        page.on(
            "pageerror",
            error => {
                pageErrors.push(error.message);
            }
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        await expect(
            page.locator("#harness-ready")
        ).toHaveAttribute(
            "data-ready",
            "true"
        );

        await deleteDatabase(page);

        const results =
            await page.evaluate(async () => {
                const schemaResult =
                    await window
                        .MarketFlowStorageSchemaSelfTest
                        .run();

                const fixtureResult =
                    await window
                        .MarketFlowStorageFixtureSelfTest
                        .run();

                const cleanupResult =
                    await window
                        .MarketFlowStorageCleanupSelfTest
                        .run();

                return {
                    schemaResult,
                    fixtureResult,
                    cleanupResult
                };
            });

        expect(
            results.schemaResult.passed
        ).toBe(true);

        expect(
            results.schemaResult.checks.length
        ).toBeGreaterThan(0);

        expect(
            results.fixtureResult.passed
        ).toBe(true);

        expect(
            results.fixtureResult.countAfter
        ).toBe(
            results.fixtureResult.countBefore + 1
        );

        expect(
            results.fixtureResult.verified
        ).toEqual(
            expect.arrayContaining([
                "add",
                "put",
                "get",
                "getAll",
                "count",
                "null round-trip",
                "zero round-trip",
                "empty-string round-trip"
            ])
        );

        expect(
            results.fixtureResult.cleanupRequired
        ).toBe(true);

        expect(
            results.cleanupResult.passed
        ).toBe(true);

        expect(
            results.cleanupResult
                .deletedFixtureCount
        ).toBeGreaterThanOrEqual(1);

        expect(
            results.cleanupResult
                .fixturesRemainingAfterReopen
        ).toBe(0);

        expect(
            results.cleanupResult
                .reopenedSuccessfully
        ).toBe(true);

        expect(
            results.cleanupResult.schemaStillValid
        ).toBe(true);

        expect(pageErrors).toEqual([]);

        await deleteDatabase(page);
    }
);
