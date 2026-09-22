(() => {
    "use strict";

    if (
        window
            .MarketFlowRecorderDiagnostics
    ) {
        console.warn(
            "MarketFlowRecorderDiagnostics is already loaded."
        );
        return;
    }

    const logic =
        window
            .MarketFlowRecorderDiagnosticsLogic;

    if (!logic) {
        throw new Error(
            "MarketFlowRecorderDiagnosticsLogic is not loaded."
        );
    }

    async function getStorageEstimate() {
        const estimateFunction =
            window.navigator
                ?.storage
                ?.estimate;

        if (
            typeof estimateFunction !==
            "function"
        ) {
            return logic
                .normalizeStorageEstimate(
                    null
                );
        }

        const estimate =
            await estimateFunction.call(
                window.navigator.storage
            );

        return logic
            .normalizeStorageEstimate(
                estimate
            );
    }

    window
        .MarketFlowRecorderDiagnostics =
        Object.freeze({
            getStorageEstimate
        });

    console.log(
        "Market Flow recorder diagnostics loaded."
    );
})();
