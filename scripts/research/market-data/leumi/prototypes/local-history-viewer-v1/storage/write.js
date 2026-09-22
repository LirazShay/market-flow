(() => {
    "use strict";

    if (window.MarketFlowStorageWrite) {
        console.warn("MarketFlowStorageWrite is already loaded.");
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

    function runReadwriteRequest(database, storeName, createRequest) {
        assertDatabase(database);
        assertStoreName(storeName);

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                storeName,
                "readwrite"
            );

            const store = transaction.objectStore(storeName);
            let requestResult;
            let settled = false;

            function rejectOnce(error) {
                if (settled) {
                    return;
                }

                settled = true;
                reject(error);
            }

            let request;

            try {
                request = createRequest(store);
            } catch (error) {
                try {
                    transaction.abort();
                } catch {
                    // The transaction may already be inactive.
                }

                rejectOnce(error);
                return;
            }

            request.onsuccess = () => {
                requestResult = request.result;
            };

            request.onerror = () => {
                rejectOnce(
                    request.error ??
                    new Error(
                        "IndexedDB write request failed for store " +
                        storeName +
                        "."
                    )
                );
            };

            transaction.oncomplete = () => {
                if (settled) {
                    return;
                }

                settled = true;
                resolve(requestResult);
            };

            transaction.onerror = () => {
                rejectOnce(
                    transaction.error ??
                    new Error(
                        "IndexedDB write transaction failed for store " +
                        storeName +
                        "."
                    )
                );
            };

            transaction.onabort = () => {
                rejectOnce(
                    transaction.error ??
                    new Error(
                        "IndexedDB write transaction was aborted for store " +
                        storeName +
                        "."
                    )
                );
            };
        });
    }

    function put(database, storeName, value) {
        return runReadwriteRequest(
            database,
            storeName,
            store => store.put(value)
        );
    }

    function add(database, storeName, value) {
        return runReadwriteRequest(
            database,
            storeName,
            store => store.add(value)
        );
    }

    function deleteRecord(database, storeName, key) {
        return runReadwriteRequest(
            database,
            storeName,
            store => store.delete(key)
        );
    }

    function clear(database, storeName) {
        return runReadwriteRequest(
            database,
            storeName,
            store => store.clear()
        );
    }

    window.MarketFlowStorageWrite = Object.freeze({
        put,
        add,
        deleteRecord,
        clear
    });

    console.log(
        "Market Flow storage write helpers loaded."
    );
})();
