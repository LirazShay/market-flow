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
        !cyclePersistence
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

        return committed;
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

        return controller.start(
            configOverrides
        );
    }

    function stop(
        reason = "manual"
    ) {
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
            getPersistenceState
        });

    console.log(
        "Market Flow persistent recorder loop loaded."
    );
})();
