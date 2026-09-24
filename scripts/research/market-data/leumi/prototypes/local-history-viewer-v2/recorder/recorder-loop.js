(() => {
    "use strict";

    if (window.MarketFlowRecorderLoop) {
        console.warn(
            "MarketFlowRecorderLoop is already loaded."
        );
        return;
    }

    const logic =
        window.MarketFlowRecorderLoopLogic;

    const recorderConfig =
        window.MarketFlowRecorderConfig;

    const universeLoader =
        window.MarketFlowUniverseLoader;

    const cycleBuilder =
        window.MarketFlowCycleBuilder;

    const storageConnection =
        window.MarketFlowStorageConnection;

    const storageUpgrade =
        window.MarketFlowStorageUpgrade;

    const lifecyclePersistence =
        window.MarketFlowLifecyclePersistence;

    const cyclePersistence =
        window.MarketFlowSuccessfulCyclePersistence;

    const diagnosticsLogic =
        window.MarketFlowRecorderDiagnosticsLogic;

    const diagnosticsPersistence =
        window.MarketFlowRecorderDiagnosticsPersistence;

    const recorderDiagnostics =
        window.MarketFlowRecorderDiagnostics;

    const marketChannel =
        window.MarketFlowChannel;

    if (!logic) {
        throw new Error(
            "MarketFlowRecorderLoopLogic is not loaded. " +
            "Load recorder/pure/recorder-loop-logic.js first."
        );
    }

    if (
        !recorderConfig ||
        !universeLoader ||
        !cycleBuilder ||
        !storageConnection ||
        !storageUpgrade ||
        !lifecyclePersistence ||
        !cyclePersistence ||
        !diagnosticsLogic ||
        !diagnosticsPersistence ||
        !recorderDiagnostics ||
        !marketChannel
    ) {
        throw new Error(
            "Persistent recorder loop dependencies are not loaded."
        );
    }

    let database =
        null;

    let sessionRecord =
        null;

    let instanceId =
        null;

    let recordingStartedAtMs =
        null;

    let lastCompletedCycleId =
        null;

    let lastCompletedAtMs =
        null;

    let stopPersistencePromise =
        Promise.resolve();

    let stopPersistencePending =
        false;

    const HEARTBEAT_INTERVAL_MS =
        5000;

    let heartbeatTimerHandle =
        null;

    let heartbeatWriteInFlight =
        false;

    let lastHeartbeatError =
        null;

    let fallbackInstanceCounter =
        0;

    function createInstanceId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
                "function"
        ) {
            return window.crypto
                .randomUUID();
        }

        fallbackInstanceCounter++;

        return (
            "market-flow-recorder-" +
            Date.now() +
            "-" +
            fallbackInstanceCounter
        );
    }

    async function ensureDatabase() {
        if (database) {
            return database;
        }

        database =
            await storageConnection
                .openDatabase({
                    onUpgradeNeeded:
                        storageUpgrade
                            .upgradeDatabase
                });

        return database;
    }

    async function ensureSession(
        config,
        universe
    ) {
        if (sessionRecord) {
            return sessionRecord;
        }

        const db =
            await ensureDatabase();

        const started =
            await lifecyclePersistence
                .startSession(
                    db,
                    {
                        instanceId,
                        startedAtMs:
                            recordingStartedAtMs,
                        config,
                        initialUniverseCount:
                            universe
                                .recordCount
                    }
                );

        sessionRecord =
            started.sessionRecord;

        marketChannel.publish(
            marketChannel
                .MESSAGE_TYPES
                .RECORDER_STARTED,
            {
                sessionId:
                    sessionRecord
                        .sessionId
            }
        );

        scheduleHeartbeat();

        return sessionRecord;
    }

    async function loadAndPersistUniverse(
        config
    ) {
        const universe =
            await universeLoader
                .loadUniverse(
                    config
                );

        const db =
            await ensureDatabase();

        await ensureSession(
            config,
            universe
        );

        await lifecyclePersistence
            .persistUniverse(
                db,
                universe
            );

        return universe;
    }

    async function commitCycle(
        cycle
    ) {
        if (!sessionRecord) {
            throw new Error(
                "Recorder session is not initialized."
            );
        }

        const db =
            await ensureDatabase();

        const committed =
            await cyclePersistence
                .commitSuccessfulCycle(
                    db,
                    {
                        instanceId,
                        cycle,
                        committedAtMs:
                            Date.now()
                    }
                );

        lastCompletedCycleId =
            committed.cycleId;

        lastCompletedAtMs =
            cycle.completedAtMs;

        marketChannel.publish(
            marketChannel
                .MESSAGE_TYPES
                .CYCLE_COMMITTED,
            {
                cycleId:
                    committed.cycleId,
                completedAtMs:
                    cycle.completedAtMs
            }
        );

        return committed;
    }

    async function heartbeatNow() {
        if (
            !database ||
            !sessionRecord ||
            heartbeatWriteInFlight
        ) {
            return null;
        }

        heartbeatWriteInFlight =
            true;

        try {
            const result =
                await diagnosticsPersistence
                    .recordHeartbeat(
                        database,
                        {
                            instanceId,
                            heartbeatAtMs:
                                Date.now()
                        }
                    );

            lastHeartbeatError =
                null;

            marketChannel.publish(
                marketChannel
                    .MESSAGE_TYPES
                    .RECORDER_HEARTBEAT,
                {
                    sessionId:
                        sessionRecord
                            ?.sessionId ??
                        null,
                    heartbeatAtMs:
                        Date.now()
                }
            );

            return result;
        } catch (error) {
            lastHeartbeatError =
                diagnosticsLogic
                    .normalizeError(
                        error,
                        Date.now()
                    );

            console.error(
                "Recorder heartbeat failed.",
                error
            );

            return null;
        } finally {
            heartbeatWriteInFlight =
                false;
        }
    }

    function scheduleHeartbeat() {
        if (
            heartbeatTimerHandle !==
            null
        ) {
            return;
        }

        heartbeatTimerHandle =
            window.setTimeout(
                async () => {
                    heartbeatTimerHandle =
                        null;

                    if (
                        controller
                            .getState()
                            .isRunning
                    ) {
                        await heartbeatNow();

                        scheduleHeartbeat();
                    }
                },
                HEARTBEAT_INTERVAL_MS
            );
    }

    function stopHeartbeat() {
        if (
            heartbeatTimerHandle !==
            null
        ) {
            window.clearTimeout(
                heartbeatTimerHandle
            );

            heartbeatTimerHandle =
                null;
        }
    }

    async function recordFailure(
        context
    ) {
        if (
            !database ||
            !sessionRecord
        ) {
            return null;
        }

        const error =
            diagnosticsLogic
                .normalizeError(
                    context.error,
                    context.failedAtMs
                );

        const cycle =
            context.cycle;

        const failure = {
            startedAtMs:
                cycle
                    ?.startedAtMs ??
                context
                    .cycleStartedAtMs,
            completedAtMs:
                context
                    .failedAtMs,
            requested:
                cycle
                    ?.requested ??
                context
                    .universe
                    ?.recordCount ??
                null,
            received:
                cycle
                    ?.received ??
                null,
            unique:
                cycle
                    ?.unique ??
                null,
            missing:
                cycle
                    ?.missing ??
                null,
            duplicates:
                cycle
                    ?.duplicates ??
                null,
            chunks:
                cycle
                    ?.chunks ??
                [],
            error
        };

        const persisted =
            await diagnosticsPersistence
                .recordFailedCycle(
                    database,
                    {
                        instanceId,
                        failure
                    }
                );

        lastHeartbeatError =
            null;

        marketChannel.publish(
            marketChannel
                .MESSAGE_TYPES
                .RECORDER_ERROR,
            {
                sessionId:
                    sessionRecord
                        ?.sessionId ??
                    null,
                errorName:
                    error.name,
                errorMessage:
                    error.message
            }
        );

        return persisted;
    }

    const controller =
        logic.createRecorderController({
            createConfig:
                recorderConfig
                    .createConfig,
            loadUniverse:
                loadAndPersistUniverse,
            buildCompleteCycle:
                cycleBuilder
                    .buildCompleteCycle,
            commitCycle,
            recordFailure,
            schedule:
                (
                    callback,
                    delayMs
                ) =>
                    window.setTimeout(
                        callback,
                        delayMs
                    ),
            cancelSchedule:
                handle =>
                    window.clearTimeout(
                        handle
                    ),
            now:
                () => Date.now()
        });

    async function waitUntilCycleSettles() {
        while (
            controller
                .getState()
                .cycleInFlight
        ) {
            await new Promise(
                resolve =>
                    window.setTimeout(
                        resolve,
                        0
                    )
            );
        }
    }

    async function persistStop() {
        stopHeartbeat();

        await waitUntilCycleSettles();

        const finalState =
            controller.getState();

        if (
            database &&
            sessionRecord
        ) {
            await lifecyclePersistence
                .stopSession(
                    database,
                    {
                        sessionRecord,
                        instanceId,
                        stoppedAtMs:
                            finalState
                                .stoppedAtMs ??
                            Date.now(),
                        completedCycles:
                            finalState
                                .completedCycles,
                        failedCycles:
                            finalState
                                .failedCycles,
                        stopReason:
                            finalState
                                .stopReason,
                        lastHeartbeatAtMs:
                            Date.now(),
                        lastCompletedCycleId,
                        lastCompletedAtMs,
                        lastError:
                            finalState
                                .latestError
                    }
                );
        }

        if (sessionRecord) {
            marketChannel.publish(
                marketChannel
                    .MESSAGE_TYPES
                    .RECORDER_STOPPED,
                {
                    sessionId:
                        sessionRecord
                            .sessionId,
                    reason:
                        finalState
                            .stopReason
                }
            );
        }

        if (database) {
            storageConnection
                .closeDatabase(
                    database
                );
        }

        database =
            null;

        sessionRecord =
            null;

        stopPersistencePending =
            false;

        return finalState;
    }

    function start(
        configOverrides = {}
    ) {
        if (stopPersistencePending) {
            throw new Error(
                "Recorder cannot start while previous stop persistence is pending."
            );
        }

        instanceId =
            createInstanceId();

        recordingStartedAtMs =
            Date.now();

        lastCompletedCycleId =
            null;

        lastCompletedAtMs =
            null;

        lastHeartbeatError =
            null;

        return controller.start(
            configOverrides
        );
    }

    function stop(
        reason = "manual"
    ) {
        stopHeartbeat();

        const state =
            controller.stop(
                reason
            );

        if (
            !stopPersistencePending
        ) {
            stopPersistencePending =
                true;

            stopPersistencePromise =
                persistStop();
        }

        return state;
    }

    function waitForStopPersistence() {
        return stopPersistencePromise;
    }

    async function getDiagnostics() {
        return Object.freeze({
            recorder:
                controller.getState(),
            persistence:
                getPersistenceState(),
            heartbeat:
                Object.freeze({
                    intervalMs:
                        HEARTBEAT_INTERVAL_MS,
                    writeInFlight:
                        heartbeatWriteInFlight,
                    lastError:
                        lastHeartbeatError
                }),
            storage:
                await recorderDiagnostics
                    .getStorageEstimate()
        });
    }

    function getPersistenceState() {
        return Object.freeze({
            instanceId,
            hasDatabase:
                database !== null,
            sessionId:
                sessionRecord
                    ?.sessionId ??
                null,
            lastCompletedCycleId,
            lastCompletedAtMs,
            stopPersistencePending
        });
    }

    window.MarketFlowRecorderLoop =
        Object.freeze({
            start,
            stop,
            getState:
                controller.getState,
            waitForStopPersistence,
            getPersistenceState,
            heartbeatNow,
            getDiagnostics
        });

    console.log(
        "Market Flow persistent recorder loop loaded."
    );
})();
