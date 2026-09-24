(() => {
    "use strict";

    if (
        window
            .MarketFlowRecorderDiagnosticsPersistence
    ) {
        console.warn(
            "MarketFlowRecorderDiagnosticsPersistence is already loaded."
        );
        return;
    }

    const schema =
        window.MarketFlowStorageSchema;

    const records =
        window.MarketFlowPersistenceRecords;

    if (!schema || !records) {
        throw new Error(
            "Recorder diagnostics persistence dependencies are not loaded."
        );
    }

    const CYCLE_STORE =
        schema.stores.cycles.name;

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

    function assertInstanceId(
        instanceId
    ) {
        if (
            typeof instanceId !==
                "string" ||
            instanceId.length === 0
        ) {
            throw new TypeError(
                "instanceId must be a non-empty string."
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

    function createTransactionPromise(
        transaction,
        getResult
    ) {
        return new Promise(
            (resolve, reject) => {
                let operationError =
                    null;

                function rememberError(
                    error
                ) {
                    if (!operationError) {
                        operationError =
                            error;
                    }
                }

                transaction.__marketFlowRememberError =
                    rememberError;

                transaction.oncomplete =
                    () =>
                        resolve(
                            getResult()
                        );

                transaction.onerror =
                    () =>
                        reject(
                            operationError ??
                            transaction.error ??
                            new Error(
                                "Recorder diagnostics transaction failed."
                            )
                        );

                transaction.onabort =
                    () =>
                        reject(
                            operationError ??
                            transaction.error ??
                            new Error(
                                "Recorder diagnostics transaction was aborted."
                            )
                        );
            }
        );
    }

    function abortWithError(
        transaction,
        error
    ) {
        transaction
            .__marketFlowRememberError?.(
                error
            );

        try {
            transaction.abort();
        } catch {
            // Transaction may already be inactive.
        }
    }

    function validateRecorderState(
        metaRecord,
        instanceId
    ) {
        const state =
            metaRecord?.value;

        if (!state) {
            throw new Error(
                "Persisted recorderState is missing."
            );
        }

        if (
            state.instanceId !==
            instanceId
        ) {
            throw new Error(
                "Recorder instanceId does not own the persisted session."
            );
        }

        if (
            state.status !==
            "running"
        ) {
            throw new Error(
                "Recorder diagnostics require running recorderState."
            );
        }

        return state;
    }

    function recordHeartbeat(
        database,
        {
            instanceId,
            heartbeatAtMs
        }
    ) {
        assertDatabase(
            database
        );

        assertInstanceId(
            instanceId
        );

        assertFiniteTime(
            heartbeatAtMs,
            "heartbeatAtMs"
        );

        const transaction =
            database.transaction(
                [
                    META_STORE
                ],
                "readwrite"
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

        const request =
            metaStore.get(
                records.RECORDER_STATE_KEY
            );

        request.onerror =
            () =>
                transaction
                    .__marketFlowRememberError?.(
                        request.error
                    );

        request.onsuccess =
            () => {
                try {
                    const current =
                        validateRecorderState(
                            request.result,
                            instanceId
                        );

                    if (
                        heartbeatAtMs <
                        current
                            .lastHeartbeatAtMs
                    ) {
                        throw new Error(
                            "heartbeatAtMs cannot move backwards."
                        );
                    }

                    const next =
                        records
                            .buildRecorderStateMetaRecord({
                                ...current,
                                lastHeartbeatAtMs:
                                    heartbeatAtMs
                            });

                    metaStore.put(
                        next
                    );

                    result =
                        next;
                } catch (error) {
                    abortWithError(
                        transaction,
                        error
                    );
                }
            };

        return completion;
    }

    function recordFailedCycle(
        database,
        {
            instanceId,
            failure
        }
    ) {
        assertDatabase(
            database
        );

        assertInstanceId(
            instanceId
        );

        if (
            !failure ||
            typeof failure !==
                "object"
        ) {
            throw new TypeError(
                "failure must be an object."
            );
        }

        const transaction =
            database.transaction(
                [
                    CYCLE_STORE,
                    META_STORE
                ],
                "readwrite"
            );

        const cycleStore =
            transaction.objectStore(
                CYCLE_STORE
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

        const request =
            metaStore.get(
                records.RECORDER_STATE_KEY
            );

        request.onerror =
            () =>
                transaction
                    .__marketFlowRememberError?.(
                        request.error
                    );

        request.onsuccess =
            () => {
                try {
                    const current =
                        validateRecorderState(
                            request.result,
                            instanceId
                        );

                    const cycleDraft =
                        records
                            .buildFailedCycleRecord({
                                sessionId:
                                    current
                                        .sessionId,
                                ...failure
                            });

                    const cycleRequest =
                        cycleStore.add(
                            cycleDraft
                        );

                    cycleRequest.onerror =
                        () =>
                            transaction
                                .__marketFlowRememberError?.(
                                    cycleRequest
                                        .error
                                );

                    cycleRequest.onsuccess =
                        () => {
                            try {
                                const cycleId =
                                    cycleRequest
                                        .result;

                                const nextState =
                                    records
                                        .buildRecorderStateMetaRecord({
                                            ...current,
                                            lastHeartbeatAtMs:
                                                failure
                                                    .completedAtMs,
                                            failedCycles:
                                                current
                                                    .failedCycles +
                                                1,
                                            lastError:
                                                failure
                                                    .error
                                        });

                                metaStore.put(
                                    nextState
                                );

                                result =
                                    Object.freeze({
                                        cycleId,
                                        cycleRecord:
                                            Object.freeze({
                                                ...cycleDraft,
                                                cycleId
                                            }),
                                        recorderStateRecord:
                                            nextState
                                    });
                            } catch (error) {
                                abortWithError(
                                    transaction,
                                    error
                                );
                            }
                        };
                } catch (error) {
                    abortWithError(
                        transaction,
                        error
                    );
                }
            };

        return completion;
    }

    window
        .MarketFlowRecorderDiagnosticsPersistence =
        Object.freeze({
            recordHeartbeat,
            recordFailedCycle
        });

    console.log(
        "Market Flow recorder diagnostics persistence loaded."
    );
})();
