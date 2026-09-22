"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    COLUMN_DEFINITIONS,
    DEFAULT_SORT_STATE,
    buildCurrentTableModel,
    getColumnValue,
    formatCellValue,
    createInitialSortState,
    getNextSortState,
    sortCurrentTableRows
} = require(
    "../../viewer/pure/current-table-logic"
);

function createLatestRows() {
    return [
        {
            securityId: "1001",
            cycleId: 9,
            collectedAtMs: 2000,
            data: {
                LastKnownRate: 0,
                BaseRateChangePercentage:
                    1.25,
                BuyLimit1: null,
                BuyVolume1: 100,
                SellLimit1: 101,
                SellVolume1: 200,
                DailyDealsQuantity: 7,
                LastDealVolume: 10,
                DailyTurnover: 1000,
                DailyNISRevenue: 123456,
                DailyLowestRate: 95,
                DailyHighestRate: 105,
                LastDealTimeOnly: ""
            }
        },
        {
            securityId: "1002",
            cycleId: 9,
            collectedAtMs: 2100,
            data: {
                LastKnownRate: 2222,
                BaseRateChangePercentage:
                    -0.5,
                BuyLimit1: 2210,
                BuyVolume1: 0,
                SellLimit1: 2230,
                SellVolume1: 30,
                DailyDealsQuantity: 12,
                LastDealVolume: null,
                DailyTurnover: 3000,
                DailyNISRevenue: 987654,
                DailyLowestRate: 2100,
                DailyHighestRate: 2300,
                LastDealTimeOnly: "10:00"
            }
        }
    ];
}

function createUniverseRows() {
    return [
        {
            securityId: "1001",
            paperName: "Fixture Alpha",
            rawMapHeat: {
                PaperId: 1001
            }
        },
        {
            securityId: "1002",
            paperName: "Fixture Beta",
            rawMapHeat: {
                PaperId: 1002
            }
        }
    ];
}

test(
    "Stage 11 current-table contract has the 16 planned V1 columns",
    () => {
        assert.equal(
            COLUMN_DEFINITIONS.length,
            16
        );

        assert.deepEqual(
            COLUMN_DEFINITIONS.map(
                column =>
                    column.label
            ),
            [
                "שם נייר",
                "מספר נייר",
                "שער אחרון",
                "שינוי יומי %",
                "BID1",
                "כמות BID1",
                "ASK1",
                "כמות ASK1",
                "מס' עסקאות",
                "כמות עסקה אחרונה",
                "כמות יומית",
                "מחזור כספי",
                "נמוך יומי",
                "גבוה יומי",
                "עסקה אחרונה",
                "נאסף בשעה"
            ]
        );
    }
);

test(
    "Stage 11 joins latest with universe by canonical securityId without dropping latest rows",
    () => {
        const latest =
            createLatestRows();

        const universe =
            createUniverseRows();

        universe.pop();

        const model =
            buildCurrentTableModel(
                latest,
                universe
            );

        assert.equal(
            model.rows.length,
            2
        );

        assert.equal(
            model.rows[0]
                .paperName,
            "Fixture Alpha"
        );

        assert.equal(
            model.rows[1]
                .paperName,
            null
        );

        assert.equal(
            model.rows[1]
                .securityId,
            "1002"
        );
    }
);

test(
    "Stage 11 summary derives row count, latest cycle and latest collection time",
    () => {
        const model =
            buildCurrentTableModel(
                createLatestRows(),
                createUniverseRows()
            );

        assert.deepEqual(
            model.summary,
            {
                rowCount: 2,
                lastCycleId: 9,
                lastCollectedAtMs:
                    2100
            }
        );
    }
);

test(
    "Stage 11 preserves zero while displaying null and empty string as dash",
    () => {
        const model =
            buildCurrentTableModel(
                createLatestRows(),
                createUniverseRows()
            );

        const lastRate =
            COLUMN_DEFINITIONS.find(
                column =>
                    column.key ===
                    "LastKnownRate"
            );

        const bid =
            COLUMN_DEFINITIONS.find(
                column =>
                    column.key ===
                    "BuyLimit1"
            );

        const lastDealTime =
            COLUMN_DEFINITIONS.find(
                column =>
                    column.key ===
                    "LastDealTimeOnly"
            );

        assert.equal(
            formatCellValue(
                getColumnValue(
                    model.rows[0],
                    lastRate
                ),
                lastRate.type
            ),
            "0"
        );

        assert.equal(
            formatCellValue(
                getColumnValue(
                    model.rows[0],
                    bid
                ),
                bid.type
            ),
            "—"
        );

        assert.equal(
            formatCellValue(
                getColumnValue(
                    model.rows[0],
                    lastDealTime
                ),
                lastDealTime.type
            ),
            "—"
        );

        assert.equal(
            formatCellValue(
                1.25,
                "percentage"
            ),
            "1.25%"
        );
    }
);

test(
    "Stage 11 rejects duplicate latest or universe security IDs",
    () => {
        const latest =
            createLatestRows();

        latest.push({
            ...latest[0]
        });

        assert.throws(
            () =>
                buildCurrentTableModel(
                    latest,
                    createUniverseRows()
                ),
            /Duplicate latest securityId 1001/
        );

        const universe =
            createUniverseRows();

        universe.push({
            ...universe[0]
        });

        assert.throws(
            () =>
                buildCurrentTableModel(
                    createLatestRows(),
                    universe
                ),
            /Duplicate universe securityId 1001/
        );
    }
);


function createSortingRows() {
    return [
        {
            securityId: "2001",
            paperName: "Beta",
            collectedAtMs: 1000,
            data: {
                DailyDealsQuantity: 12,
                LastKnownRate: 5,
                LastDealTimeOnly: "10:00"
            }
        },
        {
            securityId: "2002",
            paperName: "Alpha",
            collectedAtMs: 1100,
            data: {
                DailyDealsQuantity: 12,
                LastKnownRate: 0,
                LastDealTimeOnly: "09:30"
            }
        },
        {
            securityId: "2003",
            paperName: "Gamma",
            collectedAtMs: 1200,
            data: {
                DailyDealsQuantity: 7,
                LastKnownRate: -1,
                LastDealTimeOnly: "11:15"
            }
        },
        {
            securityId: "2004",
            paperName: "Null",
            collectedAtMs: 1300,
            data: {
                DailyDealsQuantity: 1,
                LastKnownRate: null,
                LastDealTimeOnly: null
            }
        },
        {
            securityId: "2005",
            paperName: "Undefined",
            collectedAtMs: 1400,
            data: {
                DailyDealsQuantity: 1,
                LastKnownRate: undefined,
                LastDealTimeOnly: undefined
            }
        },
        {
            securityId: "2006",
            paperName: "Empty",
            collectedAtMs: 1500,
            data: {
                DailyDealsQuantity: 1,
                LastKnownRate: "",
                LastDealTimeOnly: ""
            }
        }
    ];
}

test(
    "Stage 13.1 default sort is DailyDealsQuantity DESC",
    () => {
        assert.deepEqual(
            createInitialSortState(),
            {
                columnKey:
                    "DailyDealsQuantity",
                direction:
                    "desc"
            }
        );

        assert.strictEqual(
            createInitialSortState(),
            DEFAULT_SORT_STATE
        );

        const sorted =
            sortCurrentTableRows(
                createSortingRows()
            );

        assert.deepEqual(
            sorted.map(
                row =>
                    row.securityId
            ),
            [
                "2002",
                "2001",
                "2006",
                "2004",
                "2005",
                "2003"
            ]
        );
    }
);

test(
    "Stage 13.1 chooses first-click direction by column semantics and toggles the selected column",
    () => {
        assert.deepEqual(
            getNextSortState(
                null,
                "paperName"
            ),
            {
                columnKey:
                    "paperName",
                direction:
                    "asc"
            }
        );

        assert.deepEqual(
            getNextSortState(
                null,
                "DailyDealsQuantity"
            ),
            {
                columnKey:
                    "DailyDealsQuantity",
                direction:
                    "desc"
            }
        );

        assert.deepEqual(
            getNextSortState(
                null,
                "LastDealTimeOnly"
            ),
            {
                columnKey:
                    "LastDealTimeOnly",
                direction:
                    "desc"
            }
        );

        assert.deepEqual(
            getNextSortState(
                {
                    columnKey:
                        "paperName",
                    direction:
                        "asc"
                },
                "paperName"
            ),
            {
                columnKey:
                    "paperName",
                direction:
                    "desc"
            }
        );
    }
);

test(
    "Stage 13.1 uses paperName ASC as the equal-value tie-breaker",
    () => {
        const sorted =
            sortCurrentTableRows(
                createSortingRows(),
                {
                    columnKey:
                        "DailyDealsQuantity",
                    direction:
                        "desc"
                }
            );

        assert.deepEqual(
            sorted
                .slice(0, 2)
                .map(
                    row =>
                        row.paperName
                ),
            [
                "Alpha",
                "Beta"
            ]
        );
    }
);

test(
    "Stage 13.1 numeric sorting preserves zero and keeps null undefined and empty distinct from data values",
    () => {
        const sorted =
            sortCurrentTableRows(
                createSortingRows(),
                {
                    columnKey:
                        "LastKnownRate",
                    direction:
                        "asc"
                }
            );

        assert.deepEqual(
            sorted.map(
                row =>
                    row.securityId
            ),
            [
                "2003",
                "2002",
                "2001",
                "2004",
                "2005",
                "2006"
            ]
        );

        assert.equal(
            sorted[1]
                .data
                .LastKnownRate,
            0
        );

        assert.equal(
            sorted[3]
                .data
                .LastKnownRate,
            null
        );

        assert.equal(
            sorted[4]
                .data
                .LastKnownRate,
            undefined
        );

        assert.equal(
            sorted[5]
                .data
                .LastKnownRate,
            ""
        );
    }
);

test(
    "Stage 13.1 time values sort descending while missing values remain last",
    () => {
        const sorted =
            sortCurrentTableRows(
                createSortingRows(),
                getNextSortState(
                    null,
                    "LastDealTimeOnly"
                )
            );

        assert.deepEqual(
            sorted.map(
                row =>
                    row.securityId
            ),
            [
                "2003",
                "2001",
                "2002",
                "2004",
                "2005",
                "2006"
            ]
        );
    }
);

test(
    "Stage 13.1 sorting does not mutate the source row array",
    () => {
        const source =
            createSortingRows();

        const originalOrder =
            source.map(
                row =>
                    row.securityId
            );

        const sorted =
            sortCurrentTableRows(
                source
            );

        assert.deepEqual(
            source.map(
                row =>
                    row.securityId
            ),
            originalOrder
        );

        assert.notStrictEqual(
            sorted,
            source
        );
    }
);

test(
    "Stage 13.1 rejects unknown columns and invalid directions",
    () => {
        assert.throws(
            () =>
                getNextSortState(
                    null,
                    "NotAColumn"
                ),
            /Unknown current-table column NotAColumn/
        );

        assert.throws(
            () =>
                sortCurrentTableRows(
                    createSortingRows(),
                    {
                        columnKey:
                            "paperName",
                        direction:
                            "sideways"
                    }
                ),
            /sort direction must be asc or desc/
        );
    }
);
