(() => {
    "use strict";

    if (
        window
            .MarketFlowDebugBundle
    ) {
        console.warn(
            "MarketFlowDebugBundle is already loaded."
        );
        return;
    }

    const logic =
        window
            .MarketFlowDebugBundleLogic;

    const schema =
        window
            .MarketFlowStorageSchema;

    const connection =
        window
            .MarketFlowStorageConnection;

    const upgrade =
        window
            .MarketFlowStorageUpgrade;

    const read =
        window
            .MarketFlowStorageRead;

    const recorder =
        window
            .MarketFlowRecorderLoop;

    const recorderDiagnostics =
        window
            .MarketFlowRecorderDiagnostics;

    if (
        !logic ||
        !schema ||
        !connection ||
        !upgrade ||
        !read ||
        !recorder ||
        !recorderDiagnostics
    ) {
        throw new Error(
            "Debug Bundle dependencies are not loaded."
        );
    }

    const FORMAT_VERSION =
        1;

    const DEFAULT_RECENT_CYCLE_LIMIT =
        8;

    const MAX_RECENT_CYCLE_LIMIT =
        20;

    const MAX_ROWS_PER_CYCLE =
        5000;

    function normalizeOptions(
        options = {}
    ) {
        if (
            options === null ||
            typeof options !==
                "object" ||
            Array.isArray(
                options
            )
        ) {
            throw new TypeError(
                "Debug Bundle options must be an object."
            );
        }

        const recentCycleLimit =
            options
                .recentCycleLimit ??
            DEFAULT_RECENT_CYCLE_LIMIT;

        if (
            !Number.isInteger(
                recentCycleLimit
            ) ||
            recentCycleLimit <= 0 ||
            recentCycleLimit >
                MAX_RECENT_CYCLE_LIMIT
        ) {
            throw new TypeError(
                "recentCycleLimit must be an integer between 1 and " +
                MAX_RECENT_CYCLE_LIMIT +
                "."
            );
        }

        return Object.freeze({
            recentCycleLimit
        });
    }

    function sanitizeError(
        error
    ) {
        if (!error) {
            return null;
        }

        return Object.freeze({
            name:
                error.name ??
                "Error",
            message:
                error.message ??
                String(error)
        });
    }

    function sanitizeCycleSummary(
        cycle
    ) {
        if (!cycle) {
            return null;
        }

        return Object.freeze({
            cycleId:
                cycle.cycleId ??
                null,
            sessionId:
                cycle.sessionId ??
                null,
            status:
                cycle.status ??
                null,
            startedAtMs:
                cycle.startedAtMs ??
                null,
            completedAtMs:
                cycle.completedAtMs ??
                null,
            durationMs:
                cycle.durationMs ??
                null,
            requested:
                cycle.requested ??
                null,
            received:
                cycle.received ??
                null,
            unique:
                cycle.unique ??
                null,
            missing:
                cycle.missing ??
                null,
            duplicates:
                cycle.duplicates ??
                null,
            chunkCount:
                Array.isArray(
                    cycle.chunks
                )
                    ? cycle
                        .chunks
                        .length
                    : 0,
            error:
                sanitizeError(
                    cycle.error
                )
        });
    }

    function sanitizeRecorderState(
        state
    ) {
        return Object.freeze({
            status:
                state?.status ??
                null,
            isRunning:
                state?.isRunning ??
                false,
            cycleInFlight:
                state
                    ?.cycleInFlight ??
                false,
            startedAtMs:
                state?.startedAtMs ??
                null,
            stoppedAtMs:
                state?.stoppedAtMs ??
                null,
            stopReason:
                state?.stopReason ??
                null,
            lastCycleStartedAtMs:
                state
                    ?.lastCycleStartedAtMs ??
                null,
            lastCycleFinishedAtMs:
                state
                    ?.lastCycleFinishedAtMs ??
                null,
            nextScheduledAtMs:
                state
                    ?.nextScheduledAtMs ??
                null,
            completedCycles:
                state
                    ?.completedCycles ??
                0,
            failedCycles:
                state
                    ?.failedCycles ??
                0,
            latestCycle:
                sanitizeCycleSummary(
                    state
                        ?.latestCycle
                ),
            latestError:
                sanitizeError(
                    state
                        ?.latestError
                ),
            config:
                state?.config
                    ? Object.freeze({
                        snapshotIntervalMs:
                            state
                                .config
                                .snapshotIntervalMs ??
                            null,
                        chunkDelayMs:
                            state
                                .config
                                .chunkDelayMs ??
                            null,
                        chunkSize:
                            state
                                .config
                                .chunkSize ??
                            null,
                        refreshUniverseEveryCycle:
                            state
                                .config
                                .refreshUniverseEveryCycle ??
                            null
                    })
                    : null
        });
    }

    function sanitizePersistenceState(
        state
    ) {
        return Object.freeze({
            instanceId:
                state
                    ?.instanceId ??
                null,
            hasDatabase:
                state
                    ?.hasDatabase ??
                false,
            sessionId:
                state
                    ?.sessionId ??
                null,
            lastCompletedCycleId:
                state
                    ?.lastCompletedCycleId ??
                null,
            lastCompletedAtMs:
                state
                    ?.lastCompletedAtMs ??
                null,
            stopPersistencePending:
                state
                    ?.stopPersistencePending ??
                false
        });
    }

    function sanitizeViewerSnapshot() {
        const viewer =
            window
                .MarketFlowViewerBootstrap;

        if (
            !viewer ||
            typeof viewer
                .getViewerSnapshot !==
                "function"
        ) {
            return Object.freeze({
                available:
                    false,
                isOpen:
                    false
            });
        }

        const snapshot =
            viewer
                .getViewerSnapshot();

        const state =
            snapshot?.state;

        return Object.freeze({
            available:
                true,
            isOpen:
                snapshot?.isOpen ??
                false,
            windowName:
                snapshot
                    ?.windowName ??
                null,
            marker:
                snapshot?.marker ??
                null,
            title:
                snapshot?.title ??
                null,
            state:
                state
                    ? Object.freeze({
                        viewState:
                            state
                                .viewState ??
                            null,
                        selectedSecurityId:
                            state
                                .selectedSecurityId ??
                            null,
                        sortColumn:
                            state
                                .sortColumn ??
                            null,
                        sortDirection:
                            state
                                .sortDirection ??
                            null
                    })
                    : null
        });
    }

    async function loadStoreCounts(
        database
    ) {
        const stores =
            Object.values(
                schema.stores
            );

        const counts =
            await Promise.all(
                stores.map(
                    store =>
                        read.count(
                            database,
                            store.name
                        )
                )
            );

        return Object.freeze(
            Object.fromEntries(
                stores.map(
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
    }

    async function loadRecentCycles(
        database,
        recentCycleLimit
    ) {
        const page =
            await read
                .getIndexPage(
                    database,
                    schema
                        .stores
                        .cycles
                        .name,
                    schema
                        .stores
                        .cycles
                        .indexes
                        .byStartedAt
                        .name,
                    {
                        direction:
                            "prev",
                        limit:
                            recentCycleLimit
                    }
                );

        return page.rows;
    }

    async function loadCycleRows(
        database,
        cycle
    ) {
        if (
            cycle?.status !==
                "complete" ||
            cycle?.cycleId ===
                null ||
            cycle?.cycleId ===
                undefined
        ) {
            return Object.freeze({
                rows:
                    Object.freeze([]),
                truncated:
                    false
            });
        }

        const page =
            await read
                .getIndexPage(
                    database,
                    schema
                        .stores
                        .history
                        .name,
                    schema
                        .stores
                        .history
                        .indexes
                        .byCycle
                        .name,
                    {
                        range:
                            window
                                .IDBKeyRange
                                .only(
                                    cycle
                                        .cycleId
                                ),
                        direction:
                            "next",
                        limit:
                            MAX_ROWS_PER_CYCLE
                    }
                );

        return Object.freeze({
            rows:
                page.rows,
            truncated:
                page.hasMore
        });
    }

    function findPreviousCompleteRows(
        entries,
        currentIndex
    ) {
        for (
            let index =
                currentIndex + 1;
            index <
                entries.length;
            index++
        ) {
            const candidate =
                entries[index];

            if (
                candidate
                    .cycle
                    ?.status ===
                    "complete" &&
                !candidate
                    .truncated
            ) {
                return candidate.rows;
            }
        }

        return null;
    }

    function buildRecentCycleDiagnostics(
        entries
    ) {
        return Object.freeze(
            entries.map(
                (
                    entry,
                    index
                ) => {
                    if (
                        entry
                            .cycle
                            ?.status !==
                        "complete"
                    ) {
                        return Object.freeze({
                            ...sanitizeCycleSummary(
                                entry.cycle
                            ),
                            rowReadTruncated:
                                false,
                            marketDataFingerprint:
                                null,
                            providerTimeFingerprint:
                                null,
                            changedMarketSecuritiesVsPrevious:
                                null,
                            changedProviderTimeSecuritiesVsPrevious:
                                null
                        });
                    }

                    const previousRows =
                        entry.truncated
                            ? null
                            : findPreviousCompleteRows(
                                entries,
                                index
                            );

                    return Object.freeze({
                        ...logic
                            .buildCycleDiagnostics({
                                cycle:
                                    entry.cycle,
                                rows:
                                    entry.rows,
                                previousRows
                            }),
                        rowReadTruncated:
                            entry.truncated
                    });
                }
            )
        );
    }

    async function loadDatabaseEvidence(
        recentCycleLimit
    ) {
        const database =
            await connection
                .openDatabase({
                    onUpgradeNeeded:
                        upgrade
                            .upgradeDatabase
                });

        try {
            const rowCounts =
                await loadStoreCounts(
                    database
                );

            const cycles =
                await loadRecentCycles(
                    database,
                    recentCycleLimit
                );

            const entries = [];

            for (
                const cycle of
                cycles
            ) {
                const cycleRows =
                    await loadCycleRows(
                        database,
                        cycle
                    );

                entries.push(
                    Object.freeze({
                        cycle,
                        rows:
                            cycleRows.rows,
                        truncated:
                            cycleRows
                                .truncated
                    })
                );
            }

            const recentCycles =
                buildRecentCycleDiagnostics(
                    entries
                );

            const newestCompleteEntry =
                entries.find(
                    entry =>
                        entry
                            .cycle
                            ?.status ===
                        "complete"
                ) ??
                null;

            const latestCompleteCycle =
                newestCompleteEntry
                    ? Object.freeze({
                        cycle:
                            sanitizeCycleSummary(
                                newestCompleteEntry
                                    .cycle
                            ),
                        rowReadTruncated:
                            newestCompleteEntry
                                .truncated,
                        securitySummaries:
                            Object.freeze(
                                newestCompleteEntry
                                    .rows
                                    .map(
                                        logic
                                            .summarizeSecurityRow
                                    )
                            )
                    })
                    : null;

            return Object.freeze({
                name:
                    schema
                        .databaseName,
                version:
                    schema
                        .databaseVersion,
                rowCounts,
                recentCycleLimit,
                maxRowsPerCycle:
                    MAX_ROWS_PER_CYCLE,
                recentCycles,
                latestCompleteCycle
            });
        } finally {
            connection
                .closeDatabase(
                    database
                );
        }
    }

    async function create(
        options
    ) {
        const normalized =
            normalizeOptions(
                options
            );

        const generatedAtMs =
            Date.now();

        const [
            database,
            storage
        ] =
            await Promise.all([
                loadDatabaseEvidence(
                    normalized
                        .recentCycleLimit
                ),
                recorderDiagnostics
                    .getStorageEstimate()
            ]);

        const recorderState =
            recorder
                .getState();

        const persistenceState =
            recorder
                .getPersistenceState();

        return Object.freeze({
            formatVersion:
                FORMAT_VERSION,
            generatedAtMs,
            page:
                Object.freeze({
                    origin:
                        window
                            .location
                            .origin,
                    pathname:
                        window
                            .location
                            .pathname
                }),
            environment:
                Object.freeze({
                    timeZone:
                        Intl
                            .DateTimeFormat()
                            .resolvedOptions()
                            .timeZone ??
                        null,
                    language:
                        window
                            .navigator
                            ?.language ??
                        null,
                    userAgent:
                        window
                            .navigator
                            ?.userAgent ??
                        null
                }),
            runtime:
                Object.freeze({
                    recorder:
                        sanitizeRecorderState(
                            recorderState
                        ),
                    persistence:
                        sanitizePersistenceState(
                            persistenceState
                        ),
                    viewer:
                        sanitizeViewerSnapshot()
                }),
            storage,
            database:
                Object.freeze({
                    name:
                        database.name,
                    version:
                        database.version,
                    rowCounts:
                        database
                            .rowCounts,
                    recentCycleLimit:
                        database
                            .recentCycleLimit,
                    maxRowsPerCycle:
                        database
                            .maxRowsPerCycle
                }),
            recentCycles:
                database
                    .recentCycles,
            latestCompleteCycle:
                database
                    .latestCompleteCycle,
            safety:
                Object.freeze({
                    rawMarketPayloadsIncluded:
                        false,
                    cookiesIncluded:
                        false,
                    authorizationHeadersIncluded:
                        false,
                    browserStorageDumpIncluded:
                        false,
                    accountDataIntentionallyCollected:
                        false
                })
        });
    }

    window
        .MarketFlowDebugBundle =
        Object.freeze({
            FORMAT_VERSION,
            DEFAULT_RECENT_CYCLE_LIMIT,
            MAX_RECENT_CYCLE_LIMIT,
            MAX_ROWS_PER_CYCLE,
            create
        });

    console.log(
        "Market Flow Debug Bundle loaded."
    );
})();
