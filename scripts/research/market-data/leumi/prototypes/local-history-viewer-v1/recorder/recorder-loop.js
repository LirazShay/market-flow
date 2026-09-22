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

    if (!logic) {
        throw new Error(
            "MarketFlowRecorderLoopLogic is not loaded. " +
            "Load recorder/pure/recorder-loop-logic.js first."
        );
    }

    if (
        !recorderConfig ||
        !universeLoader ||
        !cycleBuilder
    ) {
        throw new Error(
            "Recorder loop dependencies are not loaded."
        );
    }

    const controller =
        logic.createRecorderController({
            createConfig:
                recorderConfig
                    .createConfig,
            loadUniverse:
                universeLoader
                    .loadUniverse,
            buildCompleteCycle:
                cycleBuilder
                    .buildCompleteCycle,
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

    window.MarketFlowRecorderLoop =
        controller;

    console.log(
        "Market Flow recorder loop loaded."
    );
})();
