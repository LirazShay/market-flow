(() => {
    return (async () => {
        try {
            console.log("=== STEP 1: Load all securities from MapHeat2 ===");

            const mapUrl =
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
                "&pageCount=1000" +
                "&orderFieldName=DailyNumDeals" +
                "&order=DESC" +
                "&rt=true";

            const mapResponse = await fetch(mapUrl);

            if (!mapResponse.ok) {
                throw new Error(`MapHeat2 failed: HTTP ${mapResponse.status}`);
            }

            const mapJson = await mapResponse.json();
            const map = mapJson?.data?.MapHeat;

            if (!map || !Array.isArray(map.records)) {
                throw new Error("MapHeat2 response structure is invalid");
            }

            const records = map.records;
            const ids = records.map(x => x.PaperId);

            console.log("recordCount:", map.recordCount);
            console.log("records received:", records.length);
            console.log("PaperIds:", ids.length);

            if (ids.length === 0) {
                throw new Error("No PaperIds received");
            }

            console.log("=== STEP 2: Split into 3 requests ===");

            const chunkSize = Math.ceil(ids.length / 3);
            const chunks = [
                ids.slice(0, chunkSize),
                ids.slice(chunkSize, chunkSize * 2),
                ids.slice(chunkSize * 2)
            ];

            console.log("Chunk sizes:", chunks.map(x => x.length));

            const allSecurities = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];

                console.log(
                    `=== GetSecuritiesData ${i + 1}/3: ${chunk.length} IDs ===`
                );

                const securitiesUrl =
                    "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData" +
                    "?securityIds=" + chunk.join(",") +
                    "&responseType=1" +
                    "&is_gto=true" +
                    "&force=false";

                const response = await fetch(securitiesUrl);

                console.log(
                    `Request ${i + 1} HTTP status:`,
                    response.status
                );

                if (!response.ok) {
                    throw new Error(
                        `GetSecuritiesData request ${i + 1} failed: HTTP ${response.status}`
                    );
                }

                const json = await response.json();
                const securities =
                    json?.data?.SecuritiesData?.Table?.Security;

                if (!Array.isArray(securities)) {
                    throw new Error(
                        `GetSecuritiesData request ${i + 1}: invalid response structure`
                    );
                }

                console.log(
                    `Request ${i + 1} received:`,
                    securities.length
                );

                if (securities.length !== chunk.length) {
                    console.warn(
                        `Request ${i + 1}: expected ${chunk.length}, received ${securities.length}`
                    );
                }

                allSecurities.push(...securities);
            }

            console.log("=== FINAL CHECK ===");

            const uniqueKeys = new Set(
                allSecurities.map(x => String(x.Key))
            );

            const requestedIds = new Set(
                ids.map(x => String(x))
            );

            const missingIds = [...requestedIds].filter(
                id => !uniqueKeys.has(id)
            );

            const duplicateCount =
                allSecurities.length - uniqueKeys.size;

            console.log("Requested total:", ids.length);
            console.log("Received total:", allSecurities.length);
            console.log("Unique securities:", uniqueKeys.size);
            console.log("Duplicates:", duplicateCount);
            console.log("Missing:", missingIds.length);

            if (missingIds.length > 0) {
                console.warn("Missing IDs:", missingIds);
            }

            window.__allSecurities = allSecurities;
            window.__mapHeatRecords = records;

            if (
                allSecurities.length === ids.length &&
                uniqueKeys.size === ids.length &&
                missingIds.length === 0
            ) {
                console.log(
                    `✅ SUCCESS: received all ${ids.length} securities`
                );
            } else {
                console.error("❌ VALIDATION FAILED");
            }

            console.log(
                "Full data available in window.__allSecurities"
            );

            return {
                mapHeatRecords: records,
                securities: allSecurities,
                missingIds,
                duplicateCount
            };
        } catch (error) {
            console.error("❌ SCRIPT FAILED");
            console.error(error);
            throw error;
        }
    })();
})();
