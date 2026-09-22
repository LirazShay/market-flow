(() => {
    "use strict";

    if (window.MarketFlowRuntime) {
        window.MarketFlowRuntime.launch();
        return;
    }

    const recorder =
        window.MarketFlowRecorderLoop;

    const viewer =
        window.MarketFlowViewerBootstrap;

    const debugBundle =
        window.MarketFlowDebugBundle;

    if (!recorder) {
        throw new Error(
            "MarketFlowRecorderLoop is not loaded."
        );
    }

    if (!viewer) {
        throw new Error(
            "MarketFlowViewerBootstrap is not loaded."
        );
    }

    if (!debugBundle) {
        throw new Error(
            "MarketFlowDebugBundle is not loaded."
        );
    }

    function normalizeLaunchOptions(
        options
    ) {
        if (
            options === undefined
        ) {
            return {
                recorderConfig: {}
            };
        }

        if (
            options === null ||
            typeof options !==
                "object" ||
            Array.isArray(options)
        ) {
            throw new TypeError(
                "Runtime launch options must be an object."
            );
        }

        const recorderConfig =
            options.recorderConfig ??
            {};

        if (
            recorderConfig === null ||
            typeof recorderConfig !==
                "object" ||
            Array.isArray(
                recorderConfig
            )
        ) {
            throw new TypeError(
                "recorderConfig must be an object."
            );
        }

        return {
            recorderConfig
        };
    }

    function getSnapshot() {
        return Object.freeze({
            recorder:
                recorder.getState(),
            persistence:
                recorder
                    .getPersistenceState(),
            viewer:
                viewer
                    .getViewerSnapshot()
        });
    }

    function launch(
        options
    ) {
        const {
            recorderConfig
        } =
            normalizeLaunchOptions(
                options
            );

        const before =
            recorder.getState();

        const persistence =
            recorder
                .getPersistenceState();

        let recorderStarted =
            false;

        if (
            !before.isRunning &&
            before.status !==
                "stopping"
        ) {
            if (
                persistence
                    .stopPersistencePending
            ) {
                throw new Error(
                    "Recorder stop persistence is still pending. Retry launch after it completes."
                );
            }

            recorder.start(
                recorderConfig
            );

            recorderStarted =
                true;
        }

        viewer.openViewer();

        return Object.freeze({
            recorderStarted,
            snapshot:
                getSnapshot()
        });
    }

    async function stop(
        reason = "manual"
    ) {
        recorder.stop(
            reason
        );

        await recorder
            .waitForStopPersistence();

        return getSnapshot();
    }

    function closeViewer() {
        viewer.closeViewer();

        return getSnapshot();
    }

    async function createDebugBundle(
        options
    ) {
        return await debugBundle
            .create(
                options
            );
    }

    async function downloadDebugBundle(
        options
    ) {
        return await debugBundle
            .download(
                options
            );
    }

    window.MarketFlowRuntime =
        Object.freeze({
            launch,
            stop,
            closeViewer,
            getSnapshot,
            createDebugBundle,
            downloadDebugBundle
        });

    window.MarketFlowRuntime
        .launch();
})();
