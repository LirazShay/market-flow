(() => {
    "use strict";

    if (window.MarketFlowStorageSchemaSelfTest) {
        console.warn("MarketFlowStorageSchemaSelfTest is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;
    const connection = window.MarketFlowStorageConnection;
    const upgrade = window.MarketFlowStorageUpgrade;

    if (!schema || !connection || !upgrade) {
        throw new Error(
            "Storage self-test dependencies are missing. " +
            "Load schema.js, connection.js and upgrade.js first."
        );
    }

    function normalizeKeyPath(keyPath) {
        if (Array.isArray(keyPath)) {
            return [...keyPath];
        }

        return keyPath;
    }

    function keyPathsEqual(actual, expected) {
        const normalizedActual = normalizeKeyPath(actual);
        const normalizedExpected = normalizeKeyPath(expected);

        if (
            Array.isArray(normalizedActual) &&
            Array.isArray(normalizedExpected)
        ) {
            return (
                normalizedActual.length === normalizedExpected.length &&
                normalizedActual.every(
                    (value, index) =>
                        value === normalizedExpected[index]
                )
            );
        }

        return normalizedActual === normalizedExpected;
    }

    function sortedNames(domStringList) {
        return Array.from(domStringList).sort();
    }

    function recordCheck(checks, name, passed, details) {
        checks.push({
            name,
            passed,
            details
        });

        if (!passed) {
            throw new Error(
                "Self-test failed: " +
                name +
                ". " +
                details
            );
        }
    }

    function inspectStore(database, storeDefinition, checks) {
        const transaction = database.transaction(
            storeDefinition.name,
            "readonly"
        );

        const store = transaction.objectStore(
            storeDefinition.name
        );

        recordCheck(
            checks,
            storeDefinition.name + ": keyPath",
            keyPathsEqual(
                store.keyPath,
                storeDefinition.keyPath
            ),
            "Expected " +
                JSON.stringify(storeDefinition.keyPath) +
                ", received " +
                JSON.stringify(store.keyPath)
        );

        recordCheck(
            checks,
            storeDefinition.name + ": autoIncrement",
            store.autoIncrement === storeDefinition.autoIncrement,
            "Expected " +
                storeDefinition.autoIncrement +
                ", received " +
                store.autoIncrement
        );

        const expectedIndexNames = Object.values(
            storeDefinition.indexes
        )
            .map(index => index.name)
            .sort();

        const actualIndexNames = sortedNames(
            store.indexNames
        );

        recordCheck(
            checks,
            storeDefinition.name + ": index names",
            JSON.stringify(actualIndexNames) ===
                JSON.stringify(expectedIndexNames),
            "Expected " +
                JSON.stringify(expectedIndexNames) +
                ", received " +
                JSON.stringify(actualIndexNames)
        );

        for (const indexDefinition of Object.values(
            storeDefinition.indexes
        )) {
            const index = store.index(
                indexDefinition.name
            );

            recordCheck(
                checks,
                storeDefinition.name +
                    "." +
                    indexDefinition.name +
                    ": keyPath",
                keyPathsEqual(
                    index.keyPath,
                    indexDefinition.keyPath
                ),
                "Expected " +
                    JSON.stringify(indexDefinition.keyPath) +
                    ", received " +
                    JSON.stringify(index.keyPath)
            );

            recordCheck(
                checks,
                storeDefinition.name +
                    "." +
                    indexDefinition.name +
                    ": unique",
                index.unique === indexDefinition.unique,
                "Expected " +
                    indexDefinition.unique +
                    ", received " +
                    index.unique
            );
        }
    }

    async function run() {
        const checks = [];
        let database;

        try {
            database = await connection.openDatabase({
                onUpgradeNeeded: upgrade.upgradeDatabase
            });

            recordCheck(
                checks,
                "database name",
                database.name === schema.databaseName,
                "Expected " +
                    schema.databaseName +
                    ", received " +
                    database.name
            );

            recordCheck(
                checks,
                "database version",
                database.version === schema.databaseVersion,
                "Expected " +
                    schema.databaseVersion +
                    ", received " +
                    database.version
            );

            const expectedStoreNames = Object.values(
                schema.stores
            )
                .map(store => store.name)
                .sort();

            const actualStoreNames = sortedNames(
                database.objectStoreNames
            );

            recordCheck(
                checks,
                "object store names",
                JSON.stringify(actualStoreNames) ===
                    JSON.stringify(expectedStoreNames),
                "Expected " +
                    JSON.stringify(expectedStoreNames) +
                    ", received " +
                    JSON.stringify(actualStoreNames)
            );

            for (const storeDefinition of Object.values(
                schema.stores
            )) {
                inspectStore(
                    database,
                    storeDefinition,
                    checks
                );
            }

            return {
                passed: true,
                databaseName: database.name,
                databaseVersion: database.version,
                checks
            };
        } finally {
            if (database) {
                connection.closeDatabase(database);
            }
        }
    }

    window.MarketFlowStorageSchemaSelfTest = Object.freeze({
        run
    });

    console.log(
        "Market Flow storage schema self-test loaded."
    );
})();
