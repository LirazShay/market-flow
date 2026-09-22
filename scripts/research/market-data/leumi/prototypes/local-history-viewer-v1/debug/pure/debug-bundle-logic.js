(function (root, factory) {
    "use strict";

    const api =
        factory();

    if (
        typeof module === "object" &&
        module.exports
    ) {
        module.exports =
            api;
    }

    if (root) {
        root.MarketFlowDebugBundleLogic =
            api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const MARKET_FIELDS =
            Object.freeze([
                "LastKnownRate",
                "ContinuousLastDealRate",
                "BaseRateChangePercentage",
                "BuyLimit1",
                "BuyVolume1",
                "SellLimit1",
                "SellVolume1",
                "DailyDealsQuantity",
                "DailyTurnover",
                "DailyNISRevenue",
                "LastDealVolume"
            ]);

        const PROVIDER_TIME_FIELDS =
            Object.freeze([
                "LastKnownRateDate",
                "trade_time",
                "LastDealTimeOnly"
            ]);

        function stableScalar(
            value
        ) {
            if (
                value ===
                undefined
            ) {
                return Object.freeze({
                    type:
                        "undefined"
                });
            }

            if (
                Number.isNaN(
                    value
                )
            ) {
                return Object.freeze({
                    type:
                        "number",
                    value:
                        "NaN"
                });
            }

            if (
                value ===
                Infinity ||
                value ===
                -Infinity
            ) {
                return Object.freeze({
                    type:
                        "number",
                    value:
                        String(value)
                });
            }

            return value;
        }

        function pickFields(
            source,
            fieldNames
        ) {
            const result = {};

            for (
                const fieldName of
                fieldNames
            ) {
                result[fieldName] =
                    stableScalar(
                        source?.[
                            fieldName
                        ]
                    );
            }

            return Object.freeze(
                result
            );
        }

        function normalizeSecurityId(
            value
        ) {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                throw new TypeError(
                    "debug row securityId is required."
                );
            }

            return String(value);
        }

        function summarizeSecurityRow(
            row
        ) {
            if (
                !row ||
                typeof row !==
                    "object"
            ) {
                throw new TypeError(
                    "debug row must be an object."
                );
            }

            return Object.freeze({
                securityId:
                    normalizeSecurityId(
                        row.securityId
                    ),
                cycleId:
                    row.cycleId ??
                    null,
                collectedAtMs:
                    row.collectedAtMs ??
                    null,
                serverAsOfDate:
                    stableScalar(
                        row.serverAsOfDate
                    ),
                market:
                    pickFields(
                        row.data,
                        MARKET_FIELDS
                    ),
                providerTime:
                    pickFields(
                        row.data,
                        PROVIDER_TIME_FIELDS
                    )
            });
        }

        function stableJson(
            value
        ) {
            return JSON.stringify(
                value
            );
        }

        function fnv1a32(
            text
        ) {
            let hash =
                0x811c9dc5;

            for (
                let index = 0;
                index <
                text.length;
                index++
            ) {
                hash ^=
                    text.charCodeAt(
                        index
                    );

                hash =
                    Math.imul(
                        hash,
                        0x01000193
                    );
            }

            return (
                hash >>> 0
            )
                .toString(16)
                .padStart(
                    8,
                    "0"
                );
        }

        function createFingerprint(
            summaries,
            selector
        ) {
            const normalized =
                summaries
                    .map(
                        summary => ({
                            securityId:
                                summary
                                    .securityId,
                            value:
                                selector(
                                    summary
                                )
                        })
                    )
                    .sort(
                        (
                            left,
                            right
                        ) =>
                            left
                                .securityId
                                .localeCompare(
                                    right
                                        .securityId
                                )
                    );

            return (
                "fnv1a32:" +
                fnv1a32(
                    stableJson(
                        normalized
                    )
                )
            );
        }

        function countChanged(
            currentSummaries,
            previousSummaries,
            selector
        ) {
            if (
                previousSummaries ===
                null
            ) {
                return null;
            }

            const currentById =
                new Map(
                    currentSummaries
                        .map(
                            summary => [
                                summary
                                    .securityId,
                                stableJson(
                                    selector(
                                        summary
                                    )
                                )
                            ]
                        )
                );

            const previousById =
                new Map(
                    previousSummaries
                        .map(
                            summary => [
                                summary
                                    .securityId,
                                stableJson(
                                    selector(
                                        summary
                                    )
                                )
                            ]
                        )
                );

            const allIds =
                new Set([
                    ...currentById
                        .keys(),
                    ...previousById
                        .keys()
                ]);

            let changed = 0;

            for (
                const securityId of
                allIds
            ) {
                if (
                    currentById.get(
                        securityId
                    ) !==
                    previousById.get(
                        securityId
                    )
                ) {
                    changed++;
                }
            }

            return changed;
        }

        function summarizeDistinctValues(
            summaries,
            selector
        ) {
            const values =
                new Set();

            for (
                const summary of
                summaries
            ) {
                const value =
                    selector(
                        summary
                    );

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {
                    values.add(
                        String(value)
                    );
                }
            }

            const ordered = [
                ...values
            ].sort();

            return Object.freeze({
                distinctCount:
                    ordered.length,
                values:
                    Object.freeze(
                        ordered.slice(
                            0,
                            12
                        )
                    ),
                truncated:
                    ordered.length >
                    12
            });
        }

        function buildProviderTimeSummary(
            summaries
        ) {
            return Object.freeze({
                serverAsOfDate:
                    summarizeDistinctValues(
                        summaries,
                        summary =>
                            summary
                                .serverAsOfDate
                    ),
                LastKnownRateDate:
                    summarizeDistinctValues(
                        summaries,
                        summary =>
                            summary
                                .providerTime
                                .LastKnownRateDate
                    ),
                trade_time:
                    summarizeDistinctValues(
                        summaries,
                        summary =>
                            summary
                                .providerTime
                                .trade_time
                    ),
                LastDealTimeOnly:
                    summarizeDistinctValues(
                        summaries,
                        summary =>
                            summary
                                .providerTime
                                .LastDealTimeOnly
                    )
            });
        }

        function summarizeChunkProviderTimes(
            chunks
        ) {
            if (
                !Array.isArray(
                    chunks
                )
            ) {
                return Object.freeze([]);
            }

            return Object.freeze(
                chunks.map(
                    chunk =>
                        Object.freeze({
                            chunkIndex:
                                chunk
                                    ?.chunkIndex ??
                                null,
                            requested:
                                chunk
                                    ?.requested ??
                                null,
                            received:
                                chunk
                                    ?.received ??
                                null,
                            httpStatus:
                                chunk
                                    ?.httpStatus ??
                                null,
                            serverAsOfDate:
                                stableScalar(
                                    chunk
                                        ?.serverAsOfDate
                                )
                        })
                )
            );
        }

        function buildCycleDiagnostics({
            cycle,
            rows,
            previousRows =
                null
        }) {
            if (
                !cycle ||
                typeof cycle !==
                    "object"
            ) {
                throw new TypeError(
                    "cycle must be an object."
                );
            }

            if (
                !Array.isArray(
                    rows
                )
            ) {
                throw new TypeError(
                    "rows must be an array."
                );
            }

            if (
                previousRows !==
                    null &&
                !Array.isArray(
                    previousRows
                )
            ) {
                throw new TypeError(
                    "previousRows must be null or an array."
                );
            }

            const summaries =
                rows.map(
                    summarizeSecurityRow
                );

            const previousSummaries =
                previousRows ===
                    null
                    ? null
                    : previousRows
                        .map(
                            summarizeSecurityRow
                        );

            const marketSelector =
                summary =>
                    summary.market;

            const providerTimeSelector =
                summary => ({
                    serverAsOfDate:
                        summary
                            .serverAsOfDate,
                    ...summary
                        .providerTime
                });

            return Object.freeze({
                cycleId:
                    cycle.cycleId ??
                    null,
                sessionId:
                    cycle.sessionId ??
                    null,
                status:
                    cycle.status ??
                    null,
                startedAtMs:
                    cycle.startedAtMs ??
                    null,
                completedAtMs:
                    cycle.completedAtMs ??
                    null,
                durationMs:
                    cycle.durationMs ??
                    null,
                requested:
                    cycle.requested ??
                    null,
                received:
                    cycle.received ??
                    null,
                unique:
                    cycle.unique ??
                    null,
                missing:
                    cycle.missing ??
                    null,
                duplicates:
                    cycle.duplicates ??
                    null,
                chunkCount:
                    Array.isArray(
                        cycle.chunks
                    )
                        ? cycle
                            .chunks
                            .length
                        : 0,
                securityCount:
                    summaries.length,
                marketDataFingerprint:
                    createFingerprint(
                        summaries,
                        marketSelector
                    ),
                providerTimeFingerprint:
                    createFingerprint(
                        summaries,
                        providerTimeSelector
                    ),
                changedMarketSecuritiesVsPrevious:
                    countChanged(
                        summaries,
                        previousSummaries,
                        marketSelector
                    ),
                changedProviderTimeSecuritiesVsPrevious:
                    countChanged(
                        summaries,
                        previousSummaries,
                        providerTimeSelector
                    ),
                providerTimes:
                    buildProviderTimeSummary(
                        summaries
                    ),
                chunks:
                    summarizeChunkProviderTimes(
                        cycle.chunks
                    )
            });
        }

        return Object.freeze({
            MARKET_FIELDS,
            PROVIDER_TIME_FIELDS,
            summarizeSecurityRow,
            buildCycleDiagnostics
        });
    }
);
