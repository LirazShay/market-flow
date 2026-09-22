(() => {
    "use strict";

    if (window.MarketFlowCycleBuilder) {
        console.warn(
            "MarketFlowCycleBuilder is already loaded."
        );
        return;
    }

    const logic =
        window.MarketFlowCycleLogic;

    const chunkFetcher =
        window.MarketFlowSecuritiesChunkFetcher;

    if (!logic) {
        throw new Error(
            "MarketFlowCycleLogic is not loaded. " +
            "Load recorder/pure/cycle-logic.js first."
        );
    }

    if (!chunkFetcher) {
        throw new Error(
            "MarketFlowSecuritiesChunkFetcher is not loaded. " +
            "Load recorder/securities-chunk-fetcher.js first."
        );
    }

    function sleep(ms) {
        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }

    async function buildCompleteCycle(
        universe
    ) {
        return logic.runCompleteCycle({
            universe,
            fetchChunk:
                chunkFetcher.fetchChunk,
            sleep,
            now:
                () => Date.now()
        });
    }

    window.MarketFlowCycleBuilder =
        Object.freeze({
            buildCompleteCycle
        });

    console.log(
        "Market Flow complete-cycle builder loaded."
    );
})();
