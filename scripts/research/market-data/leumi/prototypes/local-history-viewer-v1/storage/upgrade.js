(() => {
    "use strict";

    if (window.MarketFlowStorageUpgrade) {
        console.warn("MarketFlowStorageUpgrade is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;

    if (!schema) {
        throw new Error(
            "MarketFlowStorageSchema is not loaded. Load storage/schema.js first."
        );
    }

    function createIndexes(store, indexDefinitions) {
        for (const indexDefinition of Object.values(indexDefinitions)) {
            store.createIndex(
                indexDefinition.name,
                indexDefinition.keyPath,
                {
                    unique: indexDefinition.unique
                }
            );
        }
    }

    function createVersion1Schema(database) {
        for (const storeDefinition of Object.values(schema.stores)) {
            const store = database.createObjectStore(
                storeDefinition.name,
                {
                    keyPath: storeDefinition.keyPath,
                    autoIncrement: storeDefinition.autoIncrement
                }
            );

            createIndexes(
                store,
                storeDefinition.indexes
            );
        }
    }

    function upgradeDatabase({ event, database }) {
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;

        if (newVersion !== schema.databaseVersion) {
            throw new Error(
                "Unexpected IndexedDB target version. Expected " +
                schema.databaseVersion +
                ", received " +
                newVersion +
                "."
            );
        }

        if (oldVersion !== 0) {
            throw new Error(
                "Unsupported IndexedDB upgrade path: " +
                oldVersion +
                " -> " +
                newVersion +
                "."
            );
        }

        createVersion1Schema(database);
    }

    window.MarketFlowStorageUpgrade = Object.freeze({
        upgradeDatabase
    });

    console.log(
        "Market Flow storage upgrade handler loaded for database version " +
        schema.databaseVersion +
        "."
    );
})();
