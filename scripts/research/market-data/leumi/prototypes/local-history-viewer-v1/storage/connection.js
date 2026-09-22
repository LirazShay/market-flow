(() => {
    "use strict";

    if (window.MarketFlowStorageConnection) {
        console.warn("MarketFlowStorageConnection is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;

    if (!schema) {
        throw new Error(
            "MarketFlowStorageSchema is not loaded. Load storage/schema.js first."
        );
    }

    function openDatabase(options = {}) {
        const {
            onUpgradeNeeded = null
        } = options;

        return new Promise((resolve, reject) => {
            let settled = false;

            const request = indexedDB.open(
                schema.databaseName,
                schema.databaseVersion
            );

            request.onupgradeneeded = event => {
                if (typeof onUpgradeNeeded === "function") {
                    onUpgradeNeeded({
                        event,
                        database: request.result,
                        transaction: request.transaction
                    });
                    return;
                }

                request.transaction.abort();

                if (!settled) {
                    settled = true;
                    reject(
                        new Error(
                            "Database upgrade is required, but no upgrade handler was provided."
                        )
                    );
                }
            };

            request.onsuccess = () => {
                if (settled) {
                    request.result.close();
                    return;
                }

                settled = true;
                resolve(request.result);
            };

            request.onerror = () => {
                if (settled) {
                    return;
                }

                settled = true;

                reject(
                    request.error ??
                    new Error("Failed to open IndexedDB database.")
                );
            };

            request.onblocked = () => {
                console.warn(
                    "Market Flow IndexedDB open request is blocked by another connection."
                );
            };
        });
    }

    function closeDatabase(database) {
        if (!database) {
            return;
        }

        if (typeof database.close !== "function") {
            throw new TypeError(
                "closeDatabase expected an IDBDatabase-like object."
            );
        }

        database.close();
    }

    window.MarketFlowStorageConnection = Object.freeze({
        openDatabase,
        closeDatabase
    });

    console.log(
        "Market Flow storage connection helpers loaded."
    );
})();
