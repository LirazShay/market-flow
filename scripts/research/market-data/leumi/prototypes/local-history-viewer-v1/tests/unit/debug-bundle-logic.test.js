"use strict";

const test =
    require("node:test");
const assert =
    require("node:assert/strict");

const {
    summarizeSecurityRow,
    buildCycleDiagnostics
} =
    require("../../debug/pure/debug-bundle-logic");

function row(
    securityId,
    overrides = {}
) {
    return {
        securityId,
        cycleId: 10,
        collectedAtMs: 1000,
        serverAsOfDate: "2026-09-23 17:25",
        data: {
            LastKnownRate: 100,
            BuyLimit1: 99,
            BuyVolume1: 10,
            SellLimit1: 101,
            SellVolume1: 12,
            DailyDealsQuantity: 50,
            DailyTurnover: 1000,
            DailyNISRevenue: 2000,
            LastKnownRateDate:
                "2026-09-23 17:24",
            trade_time:
                "2026-09-23 17:24",
            LastDealTimeOnly:
                "17:24",
            ...overrides
        }
    };
}

test(
    "security debug summary preserves zero/null distinctions and excludes raw payload",
    () => {
        const summary =
            summarizeSecurityRow(
                row(
                    "1001",
                    {
                        BuyLimit1: 0,
                        SellLimit1: null
                    }
                )
            );

        assert.equal(
            summary.securityId,
            "1001"
        );

        assert.equal(
            summary.market.BuyLimit1,
            0
        );

        assert.equal(
            summary.market.SellLimit1,
            null
        );

        assert.equal(
            Object.hasOwn(
                summary,
                "data"
            ),
            false
        );
    }
);

test(
    "cycle diagnostics distinguishes static market data from provider timestamp movement",
    () => {
        const previousRows = [
            row("1001"),
            row("1002")
        ];

        const currentRows = [
            row(
                "1001",
                {
                    LastKnownRateDate:
                        "2026-09-23 17:30",
                    trade_time:
                        "2026-09-23 17:30"
                }
            ),
            row(
                "1002",
                {
                    LastKnownRateDate:
                        "2026-09-23 17:30",
                    trade_time:
                        "2026-09-23 17:30"
                }
            )
        ];

        const diagnostics =
            buildCycleDiagnostics({
                cycle: {
                    cycleId: 11,
                    status: "complete",
                    requested: 2,
                    received: 2,
                    unique: 2,
                    missing: 0,
                    duplicates: 0,
                    startedAtMs: 2000,
                    completedAtMs: 2100,
                    chunks: []
                },
                rows:
                    currentRows,
                previousRows
            });

        assert.equal(
            diagnostics
                .changedMarketSecuritiesVsPrevious,
            0
        );

        assert.equal(
            diagnostics
                .changedProviderTimeSecuritiesVsPrevious,
            2
        );

        assert.equal(
            typeof diagnostics
                .marketDataFingerprint,
            "string"
        );

        assert.equal(
            typeof diagnostics
                .providerTimeFingerprint,
            "string"
        );
    }
);

test(
    "cycle diagnostics detects one actual market-data change",
    () => {
        const previousRows = [
            row("1001"),
            row("1002")
        ];

        const currentRows = [
            row(
                "1001",
                {
                    LastKnownRate:
                        101
                }
            ),
            row("1002")
        ];

        const diagnostics =
            buildCycleDiagnostics({
                cycle: {
                    cycleId: 12,
                    status: "complete",
                    requested: 2,
                    received: 2,
                    unique: 2,
                    missing: 0,
                    duplicates: 0,
                    startedAtMs: 3000,
                    completedAtMs: 3100,
                    chunks: []
                },
                rows:
                    currentRows,
                previousRows
            });

        assert.equal(
            diagnostics
                .changedMarketSecuritiesVsPrevious,
            1
        );
    }
);


test(
    "fingerprints are deterministic regardless of row order",
    () => {
        const cycle = {
            cycleId: 20,
            status: "complete",
            requested: 2,
            received: 2,
            unique: 2,
            missing: 0,
            duplicates: 0,
            startedAtMs: 4000,
            completedAtMs: 4100,
            chunks: []
        };

        const ordered =
            buildCycleDiagnostics({
                cycle,
                rows: [
                    row("1001"),
                    row(
                        "1002",
                        {
                            LastKnownRate:
                                222
                        }
                    )
                ]
            });

        const reversed =
            buildCycleDiagnostics({
                cycle,
                rows: [
                    row(
                        "1002",
                        {
                            LastKnownRate:
                                222
                        }
                    ),
                    row("1001")
                ]
            });

        assert.equal(
            ordered
                .marketDataFingerprint,
            reversed
                .marketDataFingerprint
        );

        assert.equal(
            ordered
                .providerTimeFingerprint,
            reversed
                .providerTimeFingerprint
        );
    }
);

test(
    "missing provider timestamps remain unavailable instead of becoming fake values",
    () => {
        const diagnostics =
            buildCycleDiagnostics({
                cycle: {
                    cycleId: 21,
                    status: "complete",
                    requested: 1,
                    received: 1,
                    unique: 1,
                    missing: 0,
                    duplicates: 0,
                    startedAtMs: 5000,
                    completedAtMs: 5100,
                    chunks: []
                },
                rows: [
                    {
                        securityId:
                            "1001",
                        data: {
                            LastKnownRate:
                                100
                        }
                    }
                ]
            });

        assert.deepEqual(
            diagnostics
                .providerTimes
                .serverAsOfDate
                .values,
            []
        );

        assert.deepEqual(
            diagnostics
                .providerTimes
                .LastKnownRateDate
                .values,
            []
        );
    }
);
