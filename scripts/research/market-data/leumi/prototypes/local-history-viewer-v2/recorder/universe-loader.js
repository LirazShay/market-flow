(() => {
    "use strict";

    if (window.MarketFlowUniverseLoader) {
        console.warn(
            "MarketFlowUniverseLoader is already loaded."
        );
        return;
    }

    const recorderConfig =
        window.MarketFlowRecorderConfig;

    const universeLogic =
        window.MarketFlowUniverseLogic;

    if (!recorderConfig) {
        throw new Error(
            "MarketFlowRecorderConfig is not loaded. " +
            "Load recorder/config.js first."
        );
    }

    if (!universeLogic) {
        throw new Error(
            "MarketFlowUniverseLogic is not loaded. " +
            "Load recorder/pure/universe-logic.js first."
        );
    }

    async function fetchMapHeat(
        pageCount
    ) {
        const response = await fetch(
            universeLogic.buildMapHeatUrl(
                pageCount
            )
        );

        if (!response.ok) {
            throw new Error(
                "MapHeat2 failed: HTTP " +
                response.status
            );
        }

        const json =
            await response.json();

        const map =
            json?.data?.MapHeat;

        if (!map) {
            throw new Error(
                "MapHeat2 response structure is invalid."
            );
        }

        return map;
    }

    async function loadUniverse(
        configOverrides = {}
    ) {
        const config =
            recorderConfig.createConfig(
                configOverrides
            );

        const countMap =
            await fetchMapHeat(1);

        const recordCount =
            universeLogic.validateRecordCount(
                countMap.recordCount
            );

        const fullMap =
            universeLogic.validateFullMap(
                await fetchMapHeat(
                    recordCount
                ),
                recordCount
            );

        const {
            paperIds,
            securityIds
        } =
            universeLogic.validatePaperIds(
                fullMap.records
            );

        const chunks =
            universeLogic.createChunks(
                paperIds,
                config.chunkSize
            );

        return Object.freeze({
            loadedAtMs: Date.now(),
            recordCount,
            records: fullMap.records,
            paperIds,
            securityIds,
            chunks,
            chunkSizes:
                chunks.map(
                    chunk =>
                        chunk.length
                ),
            config
        });
    }

    window.MarketFlowUniverseLoader =
        Object.freeze({
            buildMapHeatUrl:
                universeLogic
                    .buildMapHeatUrl,
            loadUniverse
        });

    console.log(
        "Market Flow universe loader loaded."
    );
})();
