(() => {
    "use strict";

    if (window.MarketFlowStorageCleanupSelfTest) {
        console.warn("MarketFlowStorageCleanupSelfTest is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;
    const connection = window.MarketFlowStorageConnection;
    const upgrade = window.MarketFlowStorageUpgrade;
    const read = window.MarketFlowStorageRead;
    const write = window.MarketFlowStorageWrite;
    const schemaSelfTest = window.MarketFlowStorageSchemaSelfTest;
    const fixtureSelfTest = window.MarketFlowStorageFixtureSelfTest;

    if (
        !schema ||
        !connection ||
        !upgrade ||
        !read ||
        !write ||
        !schemaSelfTest ||
        !fixtureSelfTest
    ) {
        throw new Error(
            "Storage cleanup self-test dependencies are missing. " +
            "Load schema.js, connection.js, upgrade.js, read.js, write.js, " +
            "storage-schema-self-test.js and storage-fixture-roundtrip-self-test.js first."
        );
    }

    function getFixtureRecords(records, fixturePrefix) {
        return records.filter(
            record =>
                typeof record?.key === "string" &&
                record.key.startsWith(fixturePrefix)
        );
    }

    async function run() {
        const fixturePrefix = fixtureSelfTest.fixturePrefix;
        const metaStoreName = schema.stores.meta.name;
        let database;

        try {
            database = await connection.openDatabase({
                onUpgradeNeeded: upgrade.upgradeDatabase
            });

            const metaBeforeCleanup = await read.getAll(
                database,
                metaStoreName
            );

            const fixturesBeforeCleanup = getFixtureRecords(
                metaBeforeCleanup,
                fixturePrefix
            );

            if (fixturesBeforeCleanup.length === 0) {
                throw new Error(
                    "No Stage 6.2 fixture was found. Run " +
                    "MarketFlowStorageFixtureSelfTest.run() first."
                );
            }

            const deletedKeys = [];

            for (const fixture of fixturesBeforeCleanup) {
                await write.deleteRecord(
                    database,
                    metaStoreName,
                    fixture.key
                );

                deletedKeys.push(fixture.key);
            }

            for (const deletedKey of deletedKeys) {
                const deletedRecord = await read.get(
                    database,
                    metaStoreName,
                    deletedKey
                );

                if (deletedRecord !== undefined) {
                    throw new Error(
                        "Fixture cleanup failed for key " +
                        deletedKey +
                        "."
                    );
                }
            }
        } finally {
            if (database) {
                connection.closeDatabase(database);
                database = null;
            }
        }

        database = await connection.openDatabase({
            onUpgradeNeeded: upgrade.upgradeDatabase
        });

        try {
            const metaAfterReopen = await read.getAll(
                database,
                metaStoreName
            );

            const fixturesAfterReopen = getFixtureRecords(
                metaAfterReopen,
                fixturePrefix
            );

            if (fixturesAfterReopen.length !== 0) {
                throw new Error(
                    "Stage 6.2 fixture data reappeared after reopen."
                );
            }
        } finally {
            connection.closeDatabase(database);
        }

        const schemaResult = await schemaSelfTest.run();

        if (!schemaResult.passed) {
            throw new Error(
                "Schema self-test failed after cleanup/reopen."
            );
        }

        return {
            passed: true,
            fixturePrefix,
            deletedFixtureCount: deletedKeys.length,
            deletedKeys,
            reopenedSuccessfully: true,
            fixturesRemainingAfterReopen: 0,
            schemaStillValid: true,
            schemaChecks: schemaResult.checks.length
        };
    }

    window.MarketFlowStorageCleanupSelfTest = Object.freeze({
        run
    });

    console.log(
        "Market Flow storage cleanup/reopen self-test loaded."
    );
})();
