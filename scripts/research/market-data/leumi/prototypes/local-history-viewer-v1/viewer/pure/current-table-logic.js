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
        root.MarketFlowCurrentTableLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const COLUMN_DEFINITIONS =
            Object.freeze([
                Object.freeze({
                    key: "paperName",
                    label: "שם נייר",
                    type: "string",
                    path: Object.freeze([
                        "paperName"
                    ])
                }),
                Object.freeze({
                    key: "securityId",
                    label: "מספר נייר",
                    type: "string",
                    path: Object.freeze([
                        "securityId"
                    ])
                }),
                Object.freeze({
                    key: "LastKnownRate",
                    label: "שער אחרון",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "LastKnownRate"
                    ])
                }),
                Object.freeze({
                    key: "BaseRateChangePercentage",
                    label: "שינוי יומי %",
                    type: "percentage",
                    path: Object.freeze([
                        "data",
                        "BaseRateChangePercentage"
                    ])
                }),
                Object.freeze({
                    key: "BuyLimit1",
                    label: "BID1",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "BuyLimit1"
                    ])
                }),
                Object.freeze({
                    key: "BuyVolume1",
                    label: "כמות BID1",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "BuyVolume1"
                    ])
                }),
                Object.freeze({
                    key: "SellLimit1",
                    label: "ASK1",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "SellLimit1"
                    ])
                }),
                Object.freeze({
                    key: "SellVolume1",
                    label: "כמות ASK1",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "SellVolume1"
                    ])
                }),
                Object.freeze({
                    key: "DailyDealsQuantity",
                    label: "מס' עסקאות",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "DailyDealsQuantity"
                    ])
                }),
                Object.freeze({
                    key: "LastDealVolume",
                    label: "כמות עסקה אחרונה",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "LastDealVolume"
                    ])
                }),
                Object.freeze({
                    key: "DailyTurnover",
                    label: "כמות יומית",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "DailyTurnover"
                    ])
                }),
                Object.freeze({
                    key: "DailyNISRevenue",
                    label: "מחזור כספי",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "DailyNISRevenue"
                    ])
                }),
                Object.freeze({
                    key: "DailyLowestRate",
                    label: "נמוך יומי",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "DailyLowestRate"
                    ])
                }),
                Object.freeze({
                    key: "DailyHighestRate",
                    label: "גבוה יומי",
                    type: "number",
                    path: Object.freeze([
                        "data",
                        "DailyHighestRate"
                    ])
                }),
                Object.freeze({
                    key: "LastDealTimeOnly",
                    label: "עסקה אחרונה",
                    type: "string",
                    path: Object.freeze([
                        "data",
                        "LastDealTimeOnly"
                    ])
                }),
                Object.freeze({
                    key: "collectedAtMs",
                    label: "נאסף בשעה",
                    type: "timestamp",
                    path: Object.freeze([
                        "collectedAtMs"
                    ])
                })
            ]);

        function assertArray(
            value,
            name
        ) {
            if (!Array.isArray(value)) {
                throw new TypeError(
                    name +
                    " must be an array."
                );
            }
        }

        function assertObject(
            value,
            name
        ) {
            if (
                !value ||
                typeof value !== "object" ||
                Array.isArray(value)
            ) {
                throw new TypeError(
                    name +
                    " must be an object."
                );
            }
        }

        function canonicalSecurityId(
            value,
            name
        ) {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                throw new TypeError(
                    name +
                    " is required."
                );
            }

            return String(value);
        }

        function getColumnValue(
            row,
            column
        ) {
            let value =
                row;

            for (
                const segment of
                column.path
            ) {
                if (
                    value === null ||
                    value === undefined
                ) {
                    return undefined;
                }

                value =
                    value[segment];
            }

            return value;
        }

        function formatNumber(
            value
        ) {
            if (!Number.isFinite(value)) {
                return String(value);
            }

            return new Intl.NumberFormat(
                "he-IL",
                {
                    maximumFractionDigits:
                        6
                }
            ).format(value);
        }

        function formatTimestamp(
            value
        ) {
            if (!Number.isFinite(value)) {
                return String(value);
            }

            return new Date(
                value
            ).toLocaleTimeString(
                "he-IL",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );
        }

        function formatCellValue(
            value,
            type
        ) {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return "—";
            }

            if (
                type === "number"
            ) {
                return formatNumber(
                    value
                );
            }

            if (
                type === "percentage"
            ) {
                return (
                    formatNumber(
                        value
                    ) +
                    "%"
                );
            }

            if (
                type === "timestamp"
            ) {
                return formatTimestamp(
                    value
                );
            }

            return String(value);
        }

        function buildCurrentTableModel(
            latestRows,
            universeRows
        ) {
            assertArray(
                latestRows,
                "latestRows"
            );

            assertArray(
                universeRows,
                "universeRows"
            );

            const universeById =
                new Map();

            for (
                let index = 0;
                index <
                universeRows.length;
                index++
            ) {
                const record =
                    universeRows[index];

                assertObject(
                    record,
                    "universeRows[" +
                    index +
                    "]"
                );

                const securityId =
                    canonicalSecurityId(
                        record.securityId,
                        "universeRows[" +
                        index +
                        "].securityId"
                    );

                if (
                    universeById.has(
                        securityId
                    )
                ) {
                    throw new Error(
                        "Duplicate universe securityId " +
                        securityId +
                        "."
                    );
                }

                universeById.set(
                    securityId,
                    record
                );
            }

            const seenLatest =
                new Set();

            let lastCycleId =
                null;

            let lastCollectedAtMs =
                null;

            const rows =
                latestRows.map(
                    (
                        latest,
                        index
                    ) => {
                        assertObject(
                            latest,
                            "latestRows[" +
                            index +
                            "]"
                        );

                        assertObject(
                            latest.data,
                            "latestRows[" +
                            index +
                            "].data"
                        );

                        const securityId =
                            canonicalSecurityId(
                                latest.securityId,
                                "latestRows[" +
                                index +
                                "].securityId"
                            );

                        if (
                            seenLatest.has(
                                securityId
                            )
                        ) {
                            throw new Error(
                                "Duplicate latest securityId " +
                                securityId +
                                "."
                            );
                        }

                        seenLatest.add(
                            securityId
                        );

                        const universe =
                            universeById.get(
                                securityId
                            ) ??
                            null;

                        if (
                            Number.isInteger(
                                latest.cycleId
                            ) &&
                            (
                                lastCycleId ===
                                    null ||
                                latest.cycleId >
                                    lastCycleId
                            )
                        ) {
                            lastCycleId =
                                latest.cycleId;
                        }

                        if (
                            Number.isFinite(
                                latest.collectedAtMs
                            ) &&
                            (
                                lastCollectedAtMs ===
                                    null ||
                                latest
                                    .collectedAtMs >
                                    lastCollectedAtMs
                            )
                        ) {
                            lastCollectedAtMs =
                                latest
                                    .collectedAtMs;
                        }

                        return Object.freeze({
                            securityId,
                            paperName:
                                universe
                                    ?.paperName ??
                                null,
                            cycleId:
                                latest
                                    .cycleId ??
                                null,
                            collectedAtMs:
                                latest
                                    .collectedAtMs ??
                                null,
                            data:
                                latest.data,
                            latest,
                            universe
                        });
                    }
                );

            return Object.freeze({
                columns:
                    COLUMN_DEFINITIONS,
                rows:
                    Object.freeze(
                        rows
                    ),
                summary:
                    Object.freeze({
                        rowCount:
                            rows.length,
                        lastCycleId,
                        lastCollectedAtMs
                    })
            });
        }

        return Object.freeze({
            COLUMN_DEFINITIONS,
            buildCurrentTableModel,
            getColumnValue,
            formatCellValue
        });
    }
);
