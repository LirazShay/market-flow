(() => {
    "use strict";

    if (window.MarketFlowSecuritiesChunkFetcher) {
        console.warn(
            "MarketFlowSecuritiesChunkFetcher is already loaded."
        );
        return;
    }

    const logic =
        window.MarketFlowSecuritiesChunkLogic;

    if (!logic) {
        throw new Error(
            "MarketFlowSecuritiesChunkLogic is not loaded. " +
            "Load recorder/pure/securities-chunk-logic.js first."
        );
    }

    async function fetchChunk(
        securityIds
    ) {
        const normalizedIds =
            logic.normalizeSecurityIds(
                securityIds
            );

        const url =
            logic.buildGetSecuritiesDataUrl(
                normalizedIds
            );

        const startedAtMs =
            Date.now();

        const response =
            await fetch(url);

        const responseReceivedAtMs =
            Date.now();

        if (!response.ok) {
            throw new Error(
                "GetSecuritiesData failed: HTTP " +
                response.status +
                ". Requested=" +
                normalizedIds.length +
                "."
            );
        }

        let responseJson;

        try {
            responseJson =
                await response.json();
        } catch (error) {
            throw new Error(
                "GetSecuritiesData returned invalid JSON. " +
                "Requested=" +
                normalizedIds.length +
                ".",
                {
                    cause: error
                }
            );
        }

        const completedAtMs =
            Date.now();

        return logic.buildChunkResult({
            securityIds:
                normalizedIds,
            responseJson,
            httpStatus:
                response.status,
            timing: {
                startedAtMs,
                responseReceivedAtMs,
                completedAtMs
            }
        });
    }

    window.MarketFlowSecuritiesChunkFetcher =
        Object.freeze({
            buildGetSecuritiesDataUrl:
                logic.buildGetSecuritiesDataUrl,
            fetchChunk
        });

    console.log(
        "Market Flow securities chunk fetcher loaded."
    );
})();
