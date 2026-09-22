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

    const storeDefinitionsByName =
        new Map(
            Object.values(
                schema.stores
            ).map(
                store => [
                    store.name,
                    store
                ]
            )
        );

    const validStoreNames =
        new Set(
            storeDefinitionsByName
                .keys()
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

    function assertIndexName(
        storeName,
        indexName
    ) {
        const storeDefinition =
            storeDefinitionsByName.get(
                storeName
            );

        const validIndexNames =
            new Set(
                Object.values(
                    storeDefinition
                        ?.indexes ??
                    {}
                ).map(
                    index =>
                        index.name
                )
            );

        if (
            !validIndexNames.has(
                indexName
            )
        ) {
            throw new Error(
                "Unknown Market Flow index " +
                indexName +
                " for store " +
                storeName +
                "."
            );
        }
    }

    function assertDirection(
        direction
    ) {
        if (
            direction !== "next" &&
            direction !== "nextunique" &&
            direction !== "prev" &&
            direction !== "prevunique"
        ) {
            throw new TypeError(
                "direction must be a valid IDB cursor direction."
            );
        }
    }

    function assertLimit(
        limit
    ) {
        if (
            !Number.isInteger(limit) ||
            limit <= 0
        ) {
            throw new TypeError(
                "limit must be a positive integer."
            );
        }
    }

    function getIndexPage(
        database,
        storeName,
        indexName,
        {
            range = null,
            direction = "next",
            limit,
            after = null
        }
    ) {
        assertDatabase(
            database
        );

        assertStoreName(
            storeName
        );

        assertIndexName(
            storeName,
            indexName
        );

        assertDirection(
            direction
        );

        assertLimit(
            limit
        );

        if (
            after !== null &&
            (
                typeof after !==
                    "object" ||
                after === null ||
                !Object.hasOwn(
                    after,
                    "key"
                ) ||
                !Object.hasOwn(
                    after,
                    "primaryKey"
                )
            )
        ) {
            throw new TypeError(
                "after must be null or an index continuation token."
            );
        }

        return new Promise(
            (resolve, reject) => {
                const transaction =
                    database.transaction(
                        storeName,
                        "readonly"
                    );

                const store =
                    transaction
                        .objectStore(
                            storeName
                        );

                const index =
                    store.index(
                        indexName
                    );

                const rows = [];
                let hasMore =
                    false;
                let settled =
                    false;
                let continuationMatched =
                    after === null;
                let lastKey =
                    null;
                let lastPrimaryKey =
                    null;

                function rejectOnce(
                    error
                ) {
                    if (settled) {
                        return;
                    }

                    settled =
                        true;

                    reject(
                        error
                    );
                }

                let request;

                try {
                    request =
                        index.openCursor(
                            range,
                            direction
                        );
                } catch (error) {
                    try {
                        transaction.abort();
                    } catch {
                        // Transaction may already be inactive.
                    }

                    rejectOnce(
                        error
                    );

                    return;
                }

                request.onsuccess =
                    () => {
                        const cursor =
                            request.result;

                        if (!cursor) {
                            if (
                                !continuationMatched
                            ) {
                                rejectOnce(
                                    new Error(
                                        "IndexedDB continuation token was not found for " +
                                        storeName +
                                        "." +
                                        indexName +
                                        "."
                                    )
                                );
                            }

                            return;
                        }

                        if (
                            !continuationMatched
                        ) {
                            const keyMatches =
                                window
                                    .indexedDB
                                    .cmp(
                                        cursor.key,
                                        after.key
                                    ) === 0;

                            const primaryKeyMatches =
                                window
                                    .indexedDB
                                    .cmp(
                                        cursor.primaryKey,
                                        after.primaryKey
                                    ) === 0;

                            if (
                                keyMatches &&
                                primaryKeyMatches
                            ) {
                                continuationMatched =
                                    true;
                            }

                            cursor.continue();
                            return;
                        }

                        if (
                            rows.length >=
                            limit
                        ) {
                            hasMore =
                                true;

                            return;
                        }

                        rows.push(
                            cursor.value
                        );

                        lastKey =
                            cursor.key;

                        lastPrimaryKey =
                            cursor.primaryKey;

                        cursor.continue();
                    };

                request.onerror =
                    () => {
                        rejectOnce(
                            request.error ??
                            new Error(
                                "IndexedDB index read failed for " +
                                storeName +
                                "." +
                                indexName +
                                "."
                            )
                        );
                    };

                transaction.oncomplete =
                    () => {
                        if (settled) {
                            return;
                        }

                        settled =
                            true;

                        resolve(
                            Object.freeze({
                                rows:
                                    Object.freeze([
                                        ...rows
                                    ]),
                                hasMore,
                                continuation:
                                    hasMore
                                        ? Object.freeze({
                                            key:
                                                lastKey,
                                            primaryKey:
                                                lastPrimaryKey
                                        })
                                        : null
                            })
                        );
                    };

                transaction.onerror =
                    () => {
                        rejectOnce(
                            transaction.error ??
                            new Error(
                                "IndexedDB index read transaction failed for " +
                                storeName +
                                "." +
                                indexName +
                                "."
                            )
                        );
                    };

                transaction.onabort =
                    () => {
                        rejectOnce(
                            transaction.error ??
                            new Error(
                                "IndexedDB index read transaction was aborted for " +
                                storeName +
                                "." +
                                indexName +
                                "."
                            )
                        );
                    };
            }
        );
    }

    window.MarketFlowStorageRead = Object.freeze({
        get,
        getAll,
        count,
        getIndexPage
    });

    console.log(
        "Market Flow storage read helpers loaded."
    );
})();
