(() => {
    "use strict";

    if (window.MarketFlowRecorderConfig) {
        console.warn(
            "MarketFlowRecorderConfig is already loaded."
        );
        return;
    }

    const logic =
        window.MarketFlowRecorderConfigLogic;

    if (!logic) {
        throw new Error(
            "MarketFlowRecorderConfigLogic is not loaded. " +
            "Load recorder/pure/config-logic.js first."
        );
    }

    window.MarketFlowRecorderConfig =
        Object.freeze({
            DEFAULT_CONFIG:
                logic.DEFAULT_CONFIG,
            createConfig:
                logic.createConfig
        });

    console.log(
        "Market Flow recorder configuration loaded."
    );
})();
