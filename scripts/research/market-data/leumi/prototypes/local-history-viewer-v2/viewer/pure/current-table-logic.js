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
                    sortType: "time",
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

        const DEFAULT_SORT_STATE =
            Object.freeze({
                columnKey:
                    "DailyDealsQuantity",
                direction:
                    "desc"
            });

        function getColumnDefinition(
            columnKey
        ) {
            const column =
                COLUMN_DEFINITIONS.find(
                    candidate =>
                        candidate.key ===
                        columnKey
                );

            if (!column) {
                throw new RangeError(
                    "Unknown current-table column " +
                    columnKey +
                    "."
                );
            }

            return column;
        }

        function getColumnSortType(
            column
        ) {
            if (column.sortType) {
                return column.sortType;
            }

            if (
                column.type ===
                "string"
            ) {
                return "string";
            }

            return "number";
        }

        function createSortState(
            columnKey,
            direction
        ) {
            getColumnDefinition(
                columnKey
            );

            if (
                direction !== "asc" &&
                direction !== "desc"
            ) {
                throw new TypeError(
                    "sort direction must be asc or desc."
                );
            }

            return Object.freeze({
                columnKey,
                direction
            });
        }

        function createInitialSortState() {
            return DEFAULT_SORT_STATE;
        }

        function getNextSortState(
            currentSortState,
            columnKey
        ) {
            const column =
                getColumnDefinition(
                    columnKey
                );

            if (
                currentSortState !==
                    null &&
                currentSortState !==
                    undefined
            ) {
                assertObject(
                    currentSortState,
                    "currentSortState"
                );

                createSortState(
                    currentSortState
                        .columnKey,
                    currentSortState
                        .direction
                );

                if (
                    currentSortState
                        .columnKey ===
                    columnKey
                ) {
                    return createSortState(
                        columnKey,
                        currentSortState
                            .direction ===
                        "asc"
                            ? "desc"
                            : "asc"
                    );
                }
            }

            return createSortState(
                columnKey,
                getColumnSortType(
                    column
                ) === "string"
                    ? "asc"
                    : "desc"
            );
        }

        function getMissingSortRank(
            value
        ) {
            if (value === null) {
                return 1;
            }

            if (value === undefined) {
                return 2;
            }

            if (value === "") {
                return 3;
            }

            return 0;
        }

        function compareStrings(
            left,
            right
        ) {
            const leftText =
                String(left);

            const rightText =
                String(right);

            if (
                leftText <
                rightText
            ) {
                return -1;
            }

            if (
                leftText >
                rightText
            ) {
                return 1;
            }

            return 0;
        }

        function comparePresentValues(
            left,
            right,
            sortType
        ) {
            if (
                sortType ===
                "number"
            ) {
                const leftIsNumber =
                    Number.isFinite(
                        left
                    );

                const rightIsNumber =
                    Number.isFinite(
                        right
                    );

                if (
                    leftIsNumber &&
                    rightIsNumber
                ) {
                    return (
                        left -
                        right
                    );
                }

                if (leftIsNumber) {
                    return -1;
                }

                if (rightIsNumber) {
                    return 1;
                }
            }

            return compareStrings(
                left,
                right
            );
        }

        function compareColumnValues(
            left,
            right,
            sortType,
            direction
        ) {
            const leftMissingRank =
                getMissingSortRank(
                    left
                );

            const rightMissingRank =
                getMissingSortRank(
                    right
                );

            if (
                leftMissingRank ||
                rightMissingRank
            ) {
                if (
                    leftMissingRank ===
                    rightMissingRank
                ) {
                    return 0;
                }

                if (!leftMissingRank) {
                    return -1;
                }

                if (!rightMissingRank) {
                    return 1;
                }

                return (
                    leftMissingRank -
                    rightMissingRank
                );
            }

            const comparison =
                comparePresentValues(
                    left,
                    right,
                    sortType
                );

            return direction ===
                "desc"
                ? -comparison
                : comparison;
        }

        function comparePaperNames(
            leftRow,
            rightRow
        ) {
            return compareColumnValues(
                leftRow.paperName,
                rightRow.paperName,
                "string",
                "asc"
            );
        }

        function sortCurrentTableRows(
            rows,
            sortState =
                DEFAULT_SORT_STATE
        ) {
            assertArray(
                rows,
                "rows"
            );

            assertObject(
                sortState,
                "sortState"
            );

            const normalizedSortState =
                createSortState(
                    sortState.columnKey,
                    sortState.direction
                );

            const column =
                getColumnDefinition(
                    normalizedSortState
                        .columnKey
                );

            const sortType =
                getColumnSortType(
                    column
                );

            const sortedRows =
                rows.map(
                    (
                        row,
                        index
                    ) => {
                        assertObject(
                            row,
                            "rows[" +
                            index +
                            "]"
                        );

                        return row;
                    }
                );

            sortedRows.sort(
                (
                    leftRow,
                    rightRow
                ) => {
                    const primary =
                        compareColumnValues(
                            getColumnValue(
                                leftRow,
                                column
                            ),
                            getColumnValue(
                                rightRow,
                                column
                            ),
                            sortType,
                            normalizedSortState
                                .direction
                        );

                    if (primary !== 0) {
                        return primary;
                    }

                    const paperName =
                        comparePaperNames(
                            leftRow,
                            rightRow
                        );

                    if (
                        paperName !==
                        0
                    ) {
                        return paperName;
                    }

                    return compareStrings(
                        leftRow.securityId,
                        rightRow.securityId
                    );
                }
            );

            return Object.freeze(
                sortedRows
            );
        }

        return Object.freeze({
            COLUMN_DEFINITIONS,
            DEFAULT_SORT_STATE,
            buildCurrentTableModel,
            getColumnValue,
            formatCellValue,
            createInitialSortState,
            getNextSortState,
            sortCurrentTableRows
        });
    }
);
