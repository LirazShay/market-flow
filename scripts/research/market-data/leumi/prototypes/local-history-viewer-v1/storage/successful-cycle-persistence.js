(() => {
    "use strict";

    if (
        window
            .MarketFlowSuccessfulCyclePersistence
    ) {
        console.warn(
            "MarketFlowSuccessfulCyclePersistence is already loaded."
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

    const CYCLE_STORE =
        schema.stores.cycles.name;

    const HISTORY_STORE =
        schema.stores.history.name;

    const LATEST_STORE =
        schema.stores.latest.name;

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

    function assertNonEmptyString(
        value,
        name
    ) {
        if (
            typeof value !==
                "string" ||
            value.length === 0
        ) {
            throw new TypeError(
                name +
                " must be a non-empty string."
            );
        }
    }

    function assertFiniteTime(
        value,
        name
    ) {
        if (
            !Number.isFinite(value) ||
            value < 0
        ) {
            throw new TypeError(
                name +
                " must be a non-negative finite number."
            );
        }
    }

    function commitSuccessfulCycle(
        database,
        {
            instanceId,
            cycle,
            committedAtMs
        }
    ) {
        assertDatabase(
            database
        );

        assertNonEmptyString(
            instanceId,
            "instanceId"
        );

        assertFiniteTime(
            committedAtMs,
            "committedAtMs"
        );

        const transaction =
            database.transaction(
                [
                    CYCLE_STORE,
                    HISTORY_STORE,
                    LATEST_STORE,
                    META_STORE
                ],
                "readwrite"
            );

        const cycleStore =
            transaction.objectStore(
                CYCLE_STORE
            );

        const historyStore =
            transaction.objectStore(
                HISTORY_STORE
            );

        const latestStore =
            transaction.objectStore(
                LATEST_STORE
            );

        const metaStore =
            transaction.objectStore(
                META_STORE
            );

        let result =
            null;

        let operationError =
            null;

        let settled =
            false;

        function rememberError(
            error
        ) {
            if (!operationError) {
                operationError =
                    error;
            }
        }

        function abortWithError(
            error
        ) {
            rememberError(
                error
            );

            try {
                transaction.abort();
            } catch {
                // Transaction may already be inactive.
            }
        }

        function observeRequest(
            request,
            context
        ) {
            request.onerror =
                () => {
                    rememberError(
                        request.error ??
                        new Error(
                            context +
                            " failed."
                        )
                    );
                };

            return request;
        }

        const completion =
            new Promise(
                (resolve, reject) => {
                    transaction.oncomplete =
                        () => {
                            if (settled) {
                                return;
                            }

                            settled = true;
                            resolve(result);
                        };

                    transaction.onerror =
                        () => {
                            if (settled) {
                                return;
                            }

                            settled = true;
                            reject(
                                operationError ??
                                transaction.error ??
                                new Error(
                                    "Successful-cycle IndexedDB transaction failed."
                                )
                            );
                        };

                    transaction.onabort =
                        () => {
                            if (settled) {
                                return;
                            }

                            settled = true;
                            reject(
                                operationError ??
                                transaction.error ??
                                new Error(
                                    "Successful-cycle IndexedDB transaction was aborted."
                                )
                            );
                        };
                }
            );

        let recorderStateRequest;

        try {
            recorderStateRequest =
                observeRequest(
                    metaStore.get(
                        records
                            .RECORDER_STATE_KEY
                    ),
                    "Read recorderState"
                );
        } catch (error) {
            abortWithError(
                error
            );
            return completion;
        }

        recorderStateRequest.onsuccess =
            () => {
                try {
                    const currentMetaRecord =
                        recorderStateRequest
                            .result;

                    const currentState =
                        currentMetaRecord
                            ?.value;

                    if (!currentState) {
                        throw new Error(
                            "Cannot commit cycle without persisted recorderState."
                        );
                    }

                    if (
                        currentState.status !==
                        "running"
                    ) {
                        throw new Error(
                            "Cannot commit cycle when recorderState is not running."
                        );
                    }

                    if (
                        currentState.instanceId !==
                        instanceId
                    ) {
                        throw new Error(
                            "Recorder instanceId does not own the persisted session."
                        );
                    }

                    const cycleDraft =
                        records
                            .buildCompleteCycleRecord({
                                sessionId:
                                    currentState
                                        .sessionId,
                                cycle
                            });

                    const cycleRequest =
                        observeRequest(
                            cycleStore.add(
                                cycleDraft
                            ),
                            "Add complete cycle"
                        );

                    cycleRequest.onsuccess =
                        () => {
                            try {
                                const cycleId =
                                    cycleRequest
                                        .result;

                                const {
                                    historyRows,
                                    latestRows
                                } =
                                    records
                                        .buildSecurityRows({
                                            sessionId:
                                                currentState
                                                    .sessionId,
                                            cycleId,
                                            cycle
                                        });

                                for (
                                    const row of
                                    historyRows
                                ) {
                                    observeRequest(
                                        historyStore.add(
                                            row
                                        ),
                                        "Add history row"
                                    );
                                }

                                for (
                                    const row of
                                    latestRows
                                ) {
                                    observeRequest(
                                        latestStore.put(
                                            row
                                        ),
                                        "Upsert latest row"
                                    );
                                }

                                const nextRecorderStateRecord =
                                    records
                                        .buildRecorderStateMetaRecord({
                                            instanceId:
                                                currentState
                                                    .instanceId,
                                            sessionId:
                                                currentState
                                                    .sessionId,
                                            status:
                                                "running",
                                            recordingStartedAtMs:
                                                currentState
                                                    .recordingStartedAtMs,
                                            lastHeartbeatAtMs:
                                                committedAtMs,
                                            lastCompletedCycleId:
                                                cycleId,
                                            lastCompletedAtMs:
                                                cycle
                                                    .completedAtMs,
                                            completedCycles:
                                                currentState
                                                    .completedCycles +
                                                1,
                                            failedCycles:
                                                currentState
                                                    .failedCycles,
                                            lastError:
                                                null,
                                            config:
                                                currentState
                                                    .config
                                        });

                                observeRequest(
                                    metaStore.put(
                                        nextRecorderStateRecord
                                    ),
                                    "Update recorderState"
                                );

                                result =
                                    Object.freeze({
                                        cycleId,
                                        cycleRecord:
                                            Object.freeze({
                                                ...cycleDraft,
                                                cycleId
                                            }),
                                        historyCount:
                                            historyRows
                                                .length,
                                        latestCount:
                                            latestRows
                                                .length,
                                        recorderStateRecord:
                                            nextRecorderStateRecord
                                    });
                            } catch (error) {
                                abortWithError(
                                    error
                                );
                            }
                        };
                } catch (error) {
                    abortWithError(
                        error
                    );
                }
            };

        return completion;
    }

    window
        .MarketFlowSuccessfulCyclePersistence =
        Object.freeze({
            commitSuccessfulCycle
        });

    console.log(
        "Market Flow atomic successful-cycle persistence loaded."
    );
})();
