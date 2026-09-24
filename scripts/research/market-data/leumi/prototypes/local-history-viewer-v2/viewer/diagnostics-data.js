(() => {
    "use strict";

    if (
        window
            .MarketFlowViewerDiagnosticsData
    ) {
        console.warn(
            "MarketFlowViewerDiagnosticsData is already loaded."
        );
        return;
    }

    const schema =
        window.MarketFlowStorageSchema;

    const connection =
        window.MarketFlowStorageConnection;

    const upgrade =
        window.MarketFlowStorageUpgrade;

    const read =
        window.MarketFlowStorageRead;

    const records =
        window.MarketFlowPersistenceRecords;

    const recorderDiagnostics =
        window.MarketFlowRecorderDiagnostics;

    if (
        !schema ||
        !connection ||
        !upgrade ||
        !read ||
        !records ||
        !recorderDiagnostics
    ) {
        throw new Error(
            "Viewer diagnostics-data dependencies are not loaded."
        );
    }

    async function loadDatabaseSnapshot() {
        const database =
            await connection
                .openDatabase({
                    onUpgradeNeeded:
                        upgrade
                            .upgradeDatabase
                });

        try {
            const storeDefinitions =
                Object.values(
                    schema.stores
                );

            const [
                recorderStateRecord,
                ...counts
            ] = await Promise.all([
                read.get(
                    database,
                    schema
                        .stores
                        .meta
                        .name,
                    records
                        .RECORDER_STATE_KEY
                ),
                ...storeDefinitions.map(
                    store =>
                        read.count(
                            database,
                            store.name
                        )
                )
            ]);

            let recorderState =
                null;

            if (
                recorderStateRecord !==
                undefined
            ) {
                if (
                    !recorderStateRecord ||
                    !Object.hasOwn(
                        recorderStateRecord,
                        "value"
                    )
                ) {
                    throw new Error(
                        "Persisted recorderState meta record is malformed."
                    );
                }

                recorderState =
                    recorderStateRecord
                        .value;
            }

            let lastCycle =
                null;

            const lastCompletedCycleId =
                recorderState
                    ?.lastCompletedCycleId ??
                null;

            if (
                lastCompletedCycleId !==
                null
            ) {
                lastCycle =
                    await read.get(
                        database,
                        schema
                            .stores
                            .cycles
                            .name,
                        lastCompletedCycleId
                    );

                if (!lastCycle) {
                    throw new Error(
                        "Persisted recorderState references missing lastCompletedCycleId " +
                        lastCompletedCycleId +
                        "."
                    );
                }
            }

            const rowCounts =
                Object.freeze(
                    Object.fromEntries(
                        storeDefinitions.map(
                            (
                                store,
                                index
                            ) => [
                                store.name,
                                counts[index]
                            ]
                        )
                    )
                );

            return Object.freeze({
                recorderState:
                    recorderState ??
                    null,
                lastCycle,
                rowCounts
            });
        } finally {
            connection
                .closeDatabase(
                    database
                );
        }
    }

    async function loadSnapshot() {
        const [
            databaseSnapshot,
            storage
        ] = await Promise.all([
            loadDatabaseSnapshot(),
            recorderDiagnostics
                .getStorageEstimate()
        ]);

        return Object.freeze({
            recorderState:
                databaseSnapshot
                    .recorderState,
            lastCycle:
                databaseSnapshot
                    .lastCycle,
            rowCounts:
                databaseSnapshot
                    .rowCounts,
            storage
        });
    }

    window
        .MarketFlowViewerDiagnosticsData =
        Object.freeze({
            loadSnapshot
        });

    console.log(
        "Market Flow viewer diagnostics data loaded."
    );
})();
