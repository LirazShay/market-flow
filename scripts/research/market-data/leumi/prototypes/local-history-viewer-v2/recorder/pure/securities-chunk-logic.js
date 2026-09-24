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
        root.MarketFlowSecuritiesChunkLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const ENDPOINT =
            "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData";

        function normalizeSecurityIds(
            securityIds
        ) {
            if (
                !Array.isArray(securityIds) ||
                securityIds.length === 0
            ) {
                throw new TypeError(
                    "securityIds must be a non-empty array."
                );
            }

            const normalized =
                securityIds.map(
                    (securityId, index) => {
                        if (
                            securityId === null ||
                            securityId === undefined ||
                            securityId === ""
                        ) {
                            throw new TypeError(
                                "securityIds contains an invalid value at index " +
                                index +
                                "."
                            );
                        }

                        return String(
                            securityId
                        );
                    }
                );

            const unique =
                new Set(normalized);

            if (
                unique.size !==
                normalized.length
            ) {
                throw new Error(
                    "securityIds contains duplicates after canonicalization. " +
                    "Total=" +
                    normalized.length +
                    ", unique=" +
                    unique.size +
                    "."
                );
            }

            return Object.freeze(
                normalized
            );
        }

        function buildGetSecuritiesDataUrl(
            securityIds
        ) {
            const normalized =
                normalizeSecurityIds(
                    securityIds
                );

            const encodedIds =
                normalized.map(
                    securityId =>
                        encodeURIComponent(
                            securityId
                        )
                );

            return (
                ENDPOINT +
                "?securityIds=" +
                encodedIds.join(",") +
                "&responseType=1" +
                "&is_gto=true" +
                "&force=false"
            );
        }

        function extractSecuritiesTable(
            responseJson
        ) {
            const table =
                responseJson
                    ?.data
                    ?.SecuritiesData
                    ?.Table;

            if (!table) {
                throw new Error(
                    "GetSecuritiesData response structure is invalid: missing data.SecuritiesData.Table."
                );
            }

            if (
                !Array.isArray(
                    table.Security
                )
            ) {
                throw new Error(
                    "GetSecuritiesData response structure is invalid: Security must be an array."
                );
            }

            return table;
        }

        function validateResponseKeys(
            requestedIds,
            records
        ) {
            const responseIds = [];
            const invalidIndexes = [];

            for (
                let index = 0;
                index < records.length;
                index++
            ) {
                const key =
                    records[index]?.Key;

                if (
                    key === null ||
                    key === undefined ||
                    key === ""
                ) {
                    invalidIndexes.push(
                        index
                    );
                    continue;
                }

                responseIds.push(
                    String(key)
                );
            }

            if (
                invalidIndexes.length > 0
            ) {
                throw new Error(
                    "GetSecuritiesData contains records without Key. " +
                    "Invalid record indexes: " +
                    invalidIndexes.join(", ")
                );
            }

            const uniqueResponseIds =
                new Set(responseIds);

            if (
                uniqueResponseIds.size !==
                responseIds.length
            ) {
                throw new Error(
                    "GetSecuritiesData contains duplicate Keys. " +
                    "Received=" +
                    responseIds.length +
                    ", unique=" +
                    uniqueResponseIds.size +
                    "."
                );
            }

            const requestedSet =
                new Set(requestedIds);

            const missingIds =
                requestedIds.filter(
                    securityId =>
                        !uniqueResponseIds.has(
                            securityId
                        )
                );

            const unexpectedIds =
                responseIds.filter(
                    securityId =>
                        !requestedSet.has(
                            securityId
                        )
                );

            if (
                missingIds.length > 0 ||
                unexpectedIds.length > 0
            ) {
                throw new Error(
                    "GetSecuritiesData chunk mismatch. " +
                    "Requested=" +
                    requestedIds.length +
                    ", received=" +
                    responseIds.length +
                    ", missing=[" +
                    missingIds.join(",") +
                    "], unexpected=[" +
                    unexpectedIds.join(",") +
                    "]."
                );
            }

            return Object.freeze({
                responseIds:
                    Object.freeze(
                        responseIds
                    ),
                uniqueCount:
                    uniqueResponseIds.size
            });
        }

        function validateTiming(
            timing
        ) {
            const values = [
                [
                    "startedAtMs",
                    timing?.startedAtMs
                ],
                [
                    "responseReceivedAtMs",
                    timing?.responseReceivedAtMs
                ],
                [
                    "completedAtMs",
                    timing?.completedAtMs
                ]
            ];

            for (const [
                name,
                value
            ] of values) {
                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {
                    throw new TypeError(
                        name +
                        " must be a non-negative finite number."
                    );
                }
            }

            if (
                timing.responseReceivedAtMs <
                timing.startedAtMs
            ) {
                throw new Error(
                    "responseReceivedAtMs cannot be earlier than startedAtMs."
                );
            }

            if (
                timing.completedAtMs <
                timing.responseReceivedAtMs
            ) {
                throw new Error(
                    "completedAtMs cannot be earlier than responseReceivedAtMs."
                );
            }

            return Object.freeze({
                startedAtMs:
                    timing.startedAtMs,
                responseReceivedAtMs:
                    timing.responseReceivedAtMs,
                completedAtMs:
                    timing.completedAtMs,
                requestDurationMs:
                    timing.responseReceivedAtMs -
                    timing.startedAtMs,
                parseDurationMs:
                    timing.completedAtMs -
                    timing.responseReceivedAtMs,
                durationMs:
                    timing.completedAtMs -
                    timing.startedAtMs
            });
        }

        function buildChunkResult({
            securityIds,
            responseJson,
            timing,
            httpStatus = 200
        }) {
            const requestedIds =
                normalizeSecurityIds(
                    securityIds
                );

            const table =
                extractSecuritiesTable(
                    responseJson
                );

            const records =
                Object.freeze([
                    ...table.Security
                ]);

            const responseValidation =
                validateResponseKeys(
                    requestedIds,
                    records
                );

            const validatedTiming =
                validateTiming(
                    timing
                );

            return Object.freeze({
                requestedIds,
                requestedCount:
                    requestedIds.length,
                responseIds:
                    responseValidation
                        .responseIds,
                receivedCount:
                    records.length,
                uniqueCount:
                    responseValidation
                        .uniqueCount,
                records,
                serverAsOfDate:
                    table.AsOfDate ??
                    null,
                httpStatus,
                timing:
                    validatedTiming
            });
        }

        return Object.freeze({
            ENDPOINT,
            normalizeSecurityIds,
            buildGetSecuritiesDataUrl,
            extractSecuritiesTable,
            validateResponseKeys,
            validateTiming,
            buildChunkResult
        });
    }
);
