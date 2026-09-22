(() => {
    "use strict";

    if (window.MarketFlowUniverseLoader) {
        console.warn("MarketFlowUniverseLoader is already loaded.");
        return;
    }

    const recorderConfig = window.MarketFlowRecorderConfig;

    if (!recorderConfig) {
        throw new Error(
            "MarketFlowRecorderConfig is not loaded. Load recorder/config.js first."
        );
    }

    function buildMapHeatUrl(pageCount) {
        return (
            "/lti/lti-app/api/MarketFast/MapHeat2" +
            "?indexIdArray=0" +
            "&sectorIdAndTatSectorArray=0;0" +
            "&showOnlyDual=0" +
            "&lowChngPrcDay=-999999999" +
            "&highChngPrcDay=999999999" +
            "&lowChngPrcStartYear=-999999999" +
            "&highChngPrcStartYear=999999999" +
            "&highLow52=0" +
            "&lowDailyAverageVolume=-999999999" +
            "&highDailyAverageVolume=999999999" +
            "&lowDivYield=-999999999" +
            "&highDivYield=999999999" +
            "&lowMarketValue=-999999999999999" +
            "&highMarketValue=999999999999999" +
            "&esdRatingModeSelected=0" +
            "&EsdRatingModeValueSelected=0" +
            "&page=1" +
            "&pageCount=" + pageCount +
            "&orderFieldName=DailyNumDeals" +
            "&order=DESC" +
            "&rt=true"
        );
    }

    async function fetchMapHeat(pageCount) {
        const response = await fetch(
            buildMapHeatUrl(pageCount)
        );

        if (!response.ok) {
            throw new Error(
                "MapHeat2 failed: HTTP " +
                response.status
            );
        }

        const json = await response.json();
        const map = json?.data?.MapHeat;

        if (!map) {
            throw new Error(
                "MapHeat2 response structure is invalid."
            );
        }

        return map;
    }

    function createChunks(values, chunkSize) {
        const chunks = [];

        for (
            let start = 0;
            start < values.length;
            start += chunkSize
        ) {
            chunks.push(
                values.slice(
                    start,
                    start + chunkSize
                )
            );
        }

        return chunks;
    }

    function validatePaperIds(records) {
        const paperIds = records.map(
            record => record?.PaperId
        );

        const invalidIndexes = [];

        for (let index = 0; index < paperIds.length; index++) {
            const paperId = paperIds[index];

            if (
                paperId === null ||
                paperId === undefined ||
                paperId === ""
            ) {
                invalidIndexes.push(index);
            }
        }

        if (invalidIndexes.length > 0) {
            throw new Error(
                "MapHeat2 contains records without PaperId. " +
                "Invalid record indexes: " +
                invalidIndexes.join(", ")
            );
        }

        const securityIds = paperIds.map(
            paperId => String(paperId)
        );

        const uniqueSecurityIds = new Set(
            securityIds
        );

        if (uniqueSecurityIds.size !== securityIds.length) {
            throw new Error(
                "MapHeat2 contains duplicate PaperIds. " +
                "Total=" +
                securityIds.length +
                ", unique=" +
                uniqueSecurityIds.size +
                "."
            );
        }

        return {
            paperIds,
            securityIds
        };
    }

    async function loadUniverse(configOverrides = {}) {
        const config = recorderConfig.createConfig(
            configOverrides
        );

        const countMap = await fetchMapHeat(1);
        const recordCount = countMap.recordCount;

        if (
            !Number.isInteger(recordCount) ||
            recordCount <= 0
        ) {
            throw new Error(
                "MapHeat2 returned invalid recordCount: " +
                recordCount
            );
        }

        const fullMap = await fetchMapHeat(
            recordCount
        );

        if (!Array.isArray(fullMap.records)) {
            throw new Error(
                "MapHeat2 full response does not contain records[]."
            );
        }

        if (fullMap.recordCount !== recordCount) {
            throw new Error(
                "MapHeat2 recordCount changed during universe load. " +
                "Initial=" +
                recordCount +
                ", full=" +
                fullMap.recordCount +
                "."
            );
        }

        if (fullMap.records.length !== recordCount) {
            throw new Error(
                "MapHeat2 universe is incomplete. Expected " +
                recordCount +
                " records, received " +
                fullMap.records.length +
                "."
            );
        }

        const {
            paperIds,
            securityIds
        } = validatePaperIds(
            fullMap.records
        );

        const chunks = createChunks(
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
            chunkSizes: chunks.map(
                chunk => chunk.length
            ),
            config
        });
    }

    window.MarketFlowUniverseLoader = Object.freeze({
        buildMapHeatUrl,
        loadUniverse
    });

    console.log(
        "Market Flow universe loader loaded."
    );
})();
