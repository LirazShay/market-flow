"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    COLUMN_DEFINITIONS,
    buildCurrentTableModel,
    getColumnValue,
    formatCellValue
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
