(() => {
    "use strict";

    if (window.MarketFlowStorageRead) {
        console.warn("MarketFlowStorageRead is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;

    if (!schema) {
        throw new Error(
            "MarketFlowStorageSchema is not loaded. Load storage/schema.js first."
        );
    }

    const validStoreNames = new Set(
        Object.values(schema.stores).map(store => store.name)
    );

    function assertDatabase(database) {
        if (!database || typeof database.transaction !== "function") {
            throw new TypeError(
                "A valid IDBDatabase instance is required."
            );
        }
    }

    function assertStoreName(storeName) {
        if (!validStoreNames.has(storeName)) {
            throw new Error(
                "Unknown Market Flow object store: " + storeName
            );
        }
    }

    function runReadonlyRequest(database, storeName, createRequest) {
        assertDatabase(database);
        assertStoreName(storeName);

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                storeName,
                "readonly"
            );

            const store = transaction.objectStore(storeName);
            let result;

            let request;

            try {
                request = createRequest(store);
            } catch (error) {
                reject(error);
                return;
            }

            request.onsuccess = () => {
                result = request.result;
            };

            request.onerror = () => {
                reject(
                    request.error ??
                    new Error(
                        "IndexedDB read request failed for store " +
                        storeName +
                        "."
                    )
                );
            };

            transaction.oncomplete = () => {
                resolve(result);
            };

            transaction.onerror = () => {
                reject(
                    transaction.error ??
                    new Error(
                        "IndexedDB read transaction failed for store " +
                        storeName +
                        "."
                    )
                );
            };

            transaction.onabort = () => {
                reject(
                    transaction.error ??
                    new Error(
                        "IndexedDB read transaction was aborted for store " +
                        storeName +
                        "."
                    )
                );
            };
        });
    }

    function get(database, storeName, key) {
        return runReadonlyRequest(
            database,
            storeName,
            store => store.get(key)
        );
    }

    function getAll(database, storeName) {
        return runReadonlyRequest(
            database,
            storeName,
            store => store.getAll()
        );
    }

    function count(database, storeName) {
        return runReadonlyRequest(
            database,
            storeName,
            store => store.count()
        );
    }

    window.MarketFlowStorageRead = Object.freeze({
        get,
        getAll,
        count
    });

    console.log(
        "Market Flow storage read helpers loaded."
    );
})();
