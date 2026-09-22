(function (root, factory) {
    "use strict";

    const api = factory();

    if (
        typeof module === "object" &&
        module.exports
    ) {
        module.exports = api;
    }

    if (root) {
        root.MarketFlowUniverseLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

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
                "&pageCount=" +
                pageCount +
                "&orderFieldName=DailyNumDeals" +
                "&order=DESC" +
                "&rt=true"
            );
        }

        function createChunks(
            values,
            chunkSize
        ) {
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

            for (
                let index = 0;
                index < paperIds.length;
                index++
            ) {
                const paperId =
                    paperIds[index];

                if (
                    paperId === null ||
                    paperId === undefined ||
                    paperId === ""
                ) {
                    invalidIndexes.push(
                        index
                    );
                }
            }

            if (
                invalidIndexes.length > 0
            ) {
                throw new Error(
                    "MapHeat2 contains records without PaperId. " +
                    "Invalid record indexes: " +
                    invalidIndexes.join(", ")
                );
            }

            const securityIds =
                paperIds.map(
                    paperId =>
                        String(paperId)
                );

            const uniqueSecurityIds =
                new Set(
                    securityIds
                );

            if (
                uniqueSecurityIds.size !==
                securityIds.length
            ) {
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

        function validateRecordCount(
            recordCount
        ) {
            if (
                !Number.isInteger(
                    recordCount
                ) ||
                recordCount <= 0
            ) {
                throw new Error(
                    "MapHeat2 returned invalid recordCount: " +
                    recordCount
                );
            }

            return recordCount;
        }

        function validateFullMap(
            fullMap,
            recordCount
        ) {
            if (
                !Array.isArray(
                    fullMap?.records
                )
            ) {
                throw new Error(
                    "MapHeat2 full response does not contain records[]."
                );
            }

            if (
                fullMap.recordCount !==
                recordCount
            ) {
                throw new Error(
                    "MapHeat2 recordCount changed during universe load. " +
                    "Initial=" +
                    recordCount +
                    ", full=" +
                    fullMap.recordCount +
                    "."
                );
            }

            if (
                fullMap.records.length !==
                recordCount
            ) {
                throw new Error(
                    "MapHeat2 universe is incomplete. Expected " +
                    recordCount +
                    " records, received " +
                    fullMap.records.length +
                    "."
                );
            }

            return fullMap;
        }

        return Object.freeze({
            buildMapHeatUrl,
            createChunks,
            validatePaperIds,
            validateRecordCount,
            validateFullMap
        });
    }
);
