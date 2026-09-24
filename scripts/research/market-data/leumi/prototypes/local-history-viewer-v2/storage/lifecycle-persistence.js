(() => {
    "use strict";

    if (window.MarketFlowLifecyclePersistence) {
        console.warn(
            "MarketFlowLifecyclePersistence is already loaded."
        );
        return;
    }

    const schema =
        window.MarketFlowStorageSchema;

    const records =
        window.MarketFlowPersistenceRecords;

    if (!schema) {
        throw new Error(
            "MarketFlowStorageSchema is not loaded. " +
            "Load storage/schema.js first."
        );
    }

    if (!records) {
        throw new Error(
            "MarketFlowPersistenceRecords is not loaded. " +
            "Load storage/pure/persistence-records.js first."
        );
    }

    const SESSION_STORE =
        schema.stores.sessions.name;

    const UNIVERSE_STORE =
        schema.stores.universe.name;

    const META_STORE =
        schema.stores.meta.name;

    function assertDatabase(
        database
    ) {
        if (
            !database ||
            typeof database.transaction !==
                "function"
        ) {
            throw new TypeError(
                "A valid IDBDatabase instance is required."
            );
        }
    }

    function createTransactionPromise(
        transaction,
        getResult
    ) {
        return new Promise(
            (resolve, reject) => {
                let settled = false;
                let operationError =
                    null;

                function rejectOnce(
                    error
                ) {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    reject(error);
                }

                transaction.oncomplete =
                    () => {
                        if (settled) {
                            return;
                        }

                        settled = true;
                        resolve(
                            getResult()
                        );
                    };

                transaction.onerror =
                    () => {
                        rejectOnce(
                            operationError ??
                            transaction.error ??
                            new Error(
                                "IndexedDB lifecycle transaction failed."
                            )
                        );
                    };

                transaction.onabort =
                    () => {
                        rejectOnce(
                            operationError ??
                            transaction.error ??
                            new Error(
                                "IndexedDB lifecycle transaction was aborted."
                            )
                        );
                    };

                transaction.__marketFlowSetOperationError =
                    error => {
                        operationError =
                            error;
                    };
            }
        );
    }

    function abortWithError(
        transaction,
        error
    ) {
        transaction
            .__marketFlowSetOperationError?.(
                error
            );

        try {
            transaction.abort();
        } catch {
            // The transaction may already be inactive.
        }
    }

    function startSession(
        database,
        {
            instanceId,
            startedAtMs,
            config,
            initialUniverseCount
        }
    ) {
        assertDatabase(
            database
        );

        const sessionDraft =
            records.buildSessionStartRecord({
                startedAtMs,
                config,
                initialUniverseCount
            });

        const transaction =
            database.transaction(
                [
                    SESSION_STORE,
                    META_STORE
                ],
                "readwrite"
            );

        const sessionStore =
            transaction.objectStore(
                SESSION_STORE
            );

        const metaStore =
            transaction.objectStore(
                META_STORE
            );

        let result = null;

        const completion =
            createTransactionPromise(
                transaction,
                () => result
            );

        let addRequest;

        try {
            addRequest =
                sessionStore.add(
                    sessionDraft
                );
        } catch (error) {
            abortWithError(
                transaction,
                error
            );
            return completion;
        }

        addRequest.onsuccess =
            () => {
                try {
                    const sessionId =
                        addRequest.result;

                    const sessionRecord =
                        Object.freeze({
                            ...sessionDraft,
                            sessionId
                        });

                    const recorderStateRecord =
                        records
                            .buildRecorderStateMetaRecord({
                                instanceId,
                                sessionId,
                                status:
                                    "running",
                                recordingStartedAtMs:
                                    startedAtMs,
                                lastHeartbeatAtMs:
                                    startedAtMs,
                                completedCycles:
                                    0,
                                failedCycles:
                                    0,
                                lastError:
                                    null,
                                config
                            });

                    metaStore.put(
                        recorderStateRecord
                    );

                    result =
                        Object.freeze({
                            sessionId,
                            sessionRecord,
                            recorderStateRecord
                        });
                } catch (error) {
                    abortWithError(
                        transaction,
                        error
                    );
                }
            };

        return completion;
    }

    function persistUniverse(
        database,
        universe
    ) {
        assertDatabase(
            database
        );

        const universeRecords =
            records.buildUniverseRecords(
                universe
            );

        const universeStateRecord =
            records
                .buildUniverseStateMetaRecord(
                    universe
                );

        const transaction =
            database.transaction(
                [
                    UNIVERSE_STORE,
                    META_STORE
                ],
                "readwrite"
            );

        const universeStore =
            transaction.objectStore(
                UNIVERSE_STORE
            );

        const metaStore =
            transaction.objectStore(
                META_STORE
            );

        const result =
            Object.freeze({
                recordCount:
                    universeRecords.length,
                universeStateRecord
            });

        const completion =
            createTransactionPromise(
                transaction,
                () => result
            );

        try {
            universeStore.clear();

            for (
                const record of
                universeRecords
            ) {
                universeStore.put(
                    record
                );
            }

            metaStore.put(
                universeStateRecord
            );
        } catch (error) {
            abortWithError(
                transaction,
                error
            );
        }

        return completion;
    }

    function stopSession(
        database,
        {
            sessionRecord,
            instanceId,
            stoppedAtMs,
            completedCycles,
            failedCycles,
            stopReason,
            lastHeartbeatAtMs,
            lastCompletedCycleId =
                null,
            lastCompletedAtMs =
                null,
            lastError =
                null
        }
    ) {
        assertDatabase(
            database
        );

        const stoppedSessionRecord =
            records.buildSessionStopRecord(
                sessionRecord,
                {
                    stoppedAtMs,
                    completedCycles,
                    failedCycles,
                    stopReason
                }
            );

        const recorderStateRecord =
            records
                .buildRecorderStateMetaRecord({
                    instanceId,
                    sessionId:
                        sessionRecord
                            .sessionId,
                    status:
                        "stopped",
                    recordingStartedAtMs:
                        sessionRecord
                            .startedAtMs,
                    lastHeartbeatAtMs,
                    lastCompletedCycleId,
                    lastCompletedAtMs,
                    completedCycles,
                    failedCycles,
                    lastError,
                    config:
                        sessionRecord.config
                });

        const transaction =
            database.transaction(
                [
                    SESSION_STORE,
                    META_STORE
                ],
                "readwrite"
            );

        const sessionStore =
            transaction.objectStore(
                SESSION_STORE
            );

        const metaStore =
            transaction.objectStore(
                META_STORE
            );

        const result =
            Object.freeze({
                sessionRecord:
                    stoppedSessionRecord,
                recorderStateRecord
            });

        const completion =
            createTransactionPromise(
                transaction,
                () => result
            );

        try {
            sessionStore.put(
                stoppedSessionRecord
            );

            metaStore.put(
                recorderStateRecord
            );
        } catch (error) {
            abortWithError(
                transaction,
                error
            );
        }

        return completion;
    }

    window.MarketFlowLifecyclePersistence =
        Object.freeze({
            startSession,
            persistUniverse,
            stopSession
        });

    console.log(
        "Market Flow lifecycle persistence loaded."
    );
})();
