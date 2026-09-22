"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    RECORDER_STATE_KEY,
    UNIVERSE_STATE_KEY,
    buildUniverseRecords,
    buildUniverseStateMetaRecord,
    buildSessionStartRecord,
    buildSessionStopRecord,
    buildCompleteCycleRecord,
    buildSecurityRows,
    buildRecorderStateMetaRecord
} = require(
    "../../storage/pure/persistence-records"
);

function createUniverse() {
    return {
        loadedAtMs: 5000,
        recordCount: 2,
        records: [
            {
                PaperId: 1001,
                PaperName:
                    "Fixture Alpha",
                DateChange:
                    "2026-09-22 10:00:00",
                BuyRate: 0,
                Quantity: null,
                LastDealTime: ""
            },
            {
                PaperId: "1002",
                PaperName:
                    "Fixture Beta",
                DateChange:
                    null,
                BuyRate: 1234,
                Quantity: 0,
                LastDealTime:
                    "10:00"
            }
        ]
    };
}

function createCycle() {
    return {
        status: "complete",
        startedAtMs: 1000,
        completedAtMs: 1100,
        durationMs: 100,
        requested: 2,
        received: 2,
        unique: 2,
        missing: 0,
        duplicates: 0,
        chunks: [
            {
                chunkIndex: 0,
                requested: 2,
                received: 2,
                unique: 2,
                requestStartedAtMs: 1010,
                receivedAtMs: 1080,
                completedAtMs: 1085,
                durationMs: 75,
                serverAsOfDate:
                    "fixture-as-of",
                httpStatus: 200
            }
        ],
        securities: [
            {
                securityId:
                    "1001",
                chunkIndex: 0,
                chunkReceivedAtMs:
                    1080,
                collectedAtMs:
                    1085,
                serverAsOfDate:
                    "fixture-as-of",
                data: {
                    Key: 1001,
                    LastKnownRate: 0,
                    BuyLimit1: null,
                    LastDealTimeOnly: ""
                }
            },
            {
                securityId:
                    "1002",
                chunkIndex: 0,
                chunkReceivedAtMs:
                    1080,
                collectedAtMs:
                    1085,
                serverAsOfDate:
                    null,
                data: {
                    Key: "1002",
                    LastKnownRate: 2222,
                    BuyLimit1: 2210,
                    LastDealTimeOnly:
                        "10:00"
                }
            }
        ]
    };
}

test(
    "buildUniverseRecords maps canonical IDs and preserves the raw MapHeat object",
    () => {
        const universe =
            createUniverse();

        const records =
            buildUniverseRecords(
                universe
            );

        assert.equal(
            records.length,
            2
        );

        assert.deepEqual(
            records.map(
                record =>
                    record.securityId
            ),
            [
                "1001",
                "1002"
            ]
        );

        assert.equal(
            records[0].paperName,
            "Fixture Alpha"
        );

        assert.equal(
            records[0].updatedAtMs,
            5000
        );

        assert.equal(
            records[0]
                .mapHeatDateChange,
            "2026-09-22 10:00:00"
        );

        assert.equal(
            records[0].rawMapHeat,
            universe.records[0]
        );

        assert.equal(
            records[0]
                .rawMapHeat
                .BuyRate,
            0
        );

        assert.equal(
            records[0]
                .rawMapHeat
                .Quantity,
            null
        );

        assert.equal(
            records[0]
                .rawMapHeat
                .LastDealTime,
            ""
        );
    }
);

test(
    "buildUniverseRecords rejects count mismatch and duplicate canonical IDs",
    () => {
        assert.throws(
            () =>
                buildUniverseRecords({
                    ...createUniverse(),
                    recordCount: 3
                }),
            /count mismatch/
        );

        const universe =
            createUniverse();

        universe.records[1] = {
            ...universe.records[1],
            PaperId: "1001"
        };

        assert.throws(
            () =>
                buildUniverseRecords(
                    universe
                ),
            /duplicate securityId 1001/
        );
    }
);

test(
    "buildUniverseRecords rejects missing PaperId without inventing an ID",
    () => {
        const universe =
            createUniverse();

        delete universe.records[0]
            .PaperId;

        assert.throws(
            () =>
                buildUniverseRecords(
                    universe
                ),
            /PaperId is required/
        );
    }
);

test(
    "buildUniverseStateMetaRecord creates the minimal universe meta contract",
    () => {
        const universe =
            createUniverse();

        const record =
            buildUniverseStateMetaRecord(
                universe
            );

        assert.deepEqual(
            record,
            {
                key:
                    UNIVERSE_STATE_KEY,
                value: {
                    loadedAtMs:
                        5000,
                    recordCount:
                        2
                }
            }
        );
    }
);

test(
    "buildSessionStartRecord creates the documented running-session contract without inventing sessionId",
    () => {
        const config = {
            snapshotIntervalMs: 3000,
            chunkSize: 187
        };

        const record =
            buildSessionStartRecord({
                startedAtMs: 100,
                config,
                initialUniverseCount: 561
            });

        assert.deepEqual(
            record,
            {
                startedAtMs: 100,
                stoppedAtMs: null,
                status: "running",
                config,
                initialUniverseCount: 561,
                completedCycles: 0,
                failedCycles: 0,
                stopReason: null
            }
        );

        assert.equal(
            Object.hasOwn(
                record,
                "sessionId"
            ),
            false
        );
    }
);

test(
    "buildSessionStopRecord preserves session identity/config and writes final counters",
    () => {
        const session = {
            sessionId: 7,
            startedAtMs: 100,
            stoppedAtMs: null,
            status: "running",
            config: {
                chunkSize: 187
            },
            initialUniverseCount: 561,
            completedCycles: 0,
            failedCycles: 0,
            stopReason: null
        };

        const stopped =
            buildSessionStopRecord(
                session,
                {
                    stoppedAtMs: 900,
                    completedCycles: 12,
                    failedCycles: 1,
                    stopReason:
                        "manual"
                }
            );

        assert.deepEqual(
            stopped,
            {
                ...session,
                stoppedAtMs: 900,
                status: "stopped",
                completedCycles: 12,
                failedCycles: 1,
                stopReason: "manual"
            }
        );
    }
);

test(
    "buildCompleteCycleRecord maps only persisted cycle metadata and leaves cycleId for IndexedDB",
    () => {
        const cycle =
            createCycle();

        const record =
            buildCompleteCycleRecord({
                sessionId: 7,
                cycle
            });

        assert.deepEqual(
            record,
            {
                sessionId: 7,
                status: "complete",
                startedAtMs: 1000,
                completedAtMs: 1100,
                durationMs: 100,
                requested: 2,
                received: 2,
                unique: 2,
                missing: 0,
                duplicates: 0,
                chunks: [
                    {
                        chunkIndex: 0,
                        requested: 2,
                        received: 2,
                        requestStartedAtMs:
                            1010,
                        receivedAtMs:
                            1080,
                        durationMs: 75,
                        serverAsOfDate:
                            "fixture-as-of",
                        httpStatus: 200
                    }
                ]
            }
        );

        assert.equal(
            Object.hasOwn(
                record,
                "cycleId"
            ),
            false
        );

        assert.equal(
            Object.hasOwn(
                record,
                "securities"
            ),
            false
        );
    }
);

test(
    "buildSecurityRows creates consistent history/latest rows and preserves raw Security values",
    () => {
        const cycle =
            createCycle();

        const {
            historyRows,
            latestRows
        } =
            buildSecurityRows({
                sessionId: 7,
                cycleId: 42,
                cycle
            });

        assert.equal(
            historyRows.length,
            2
        );

        assert.equal(
            latestRows.length,
            2
        );

        for (const rows of [
            historyRows,
            latestRows
        ]) {
            assert.equal(
                rows[0].cycleId,
                42
            );

            assert.equal(
                rows[0].sessionId,
                7
            );

            assert.equal(
                rows[0].securityId,
                "1001"
            );

            assert.equal(
                rows[0]
                    .cycleStartedAtMs,
                1000
            );

            assert.equal(
                rows[0]
                    .chunkReceivedAtMs,
                1080
            );

            assert.equal(
                rows[0]
                    .collectedAtMs,
                1085
            );

            assert.equal(
                rows[0]
                    .data,
                cycle
                    .securities[0]
                    .data
            );

            assert.equal(
                rows[0]
                    .data
                    .LastKnownRate,
                0
            );

            assert.equal(
                rows[0]
                    .data
                    .BuyLimit1,
                null
            );

            assert.equal(
                rows[0]
                    .data
                    .LastDealTimeOnly,
                ""
            );
        }

        assert.notEqual(
            historyRows[0],
            latestRows[0]
        );
    }
);

test(
    "successful persistence mapping rejects an incomplete cycle",
    () => {
        const cycle = {
            ...createCycle(),
            received: 1
        };

        assert.throws(
            () =>
                buildCompleteCycleRecord({
                    sessionId: 7,
                    cycle
                }),
            /not complete enough/
        );

        assert.throws(
            () =>
                buildSecurityRows({
                    sessionId: 7,
                    cycleId: 42,
                    cycle
                }),
            /not complete enough/
        );
    }
);

test(
    "buildSecurityRows rejects duplicate IDs and securityId/data.Key mismatch",
    () => {
        const duplicateCycle =
            createCycle();

        duplicateCycle
            .securities[1]
            .securityId =
            "1001";

        duplicateCycle
            .securities[1]
            .data.Key =
            "1001";

        assert.throws(
            () =>
                buildSecurityRows({
                    sessionId: 7,
                    cycleId: 42,
                    cycle:
                        duplicateCycle
                }),
            /duplicate securityId 1001/
        );

        const mismatchCycle =
            createCycle();

        mismatchCycle
            .securities[0]
            .data.Key =
            "9999";

        assert.throws(
            () =>
                buildSecurityRows({
                    sessionId: 7,
                    cycleId: 42,
                    cycle:
                        mismatchCycle
                }),
            /securityId\/data.Key mismatch/
        );
    }
);

test(
    "buildRecorderStateMetaRecord creates the documented meta key/value contract",
    () => {
        const config = {
            snapshotIntervalMs: 3000
        };

        const record =
            buildRecorderStateMetaRecord({
                instanceId:
                    "instance-fixture",
                sessionId: 7,
                status: "running",
                recordingStartedAtMs: 100,
                lastHeartbeatAtMs: 150,
                lastCompletedCycleId:
                    null,
                lastCompletedAtMs:
                    null,
                completedCycles: 0,
                failedCycles: 0,
                lastError: null,
                config
            });

        assert.equal(
            record.key,
            RECORDER_STATE_KEY
        );

        assert.deepEqual(
            record.value,
            {
                instanceId:
                    "instance-fixture",
                sessionId: 7,
                status: "running",
                recordingStartedAtMs: 100,
                lastHeartbeatAtMs: 150,
                lastCompletedCycleId:
                    null,
                lastCompletedAtMs:
                    null,
                completedCycles: 0,
                failedCycles: 0,
                lastError: null,
                config
            }
        );
    }
);

test(
    "persistence builders reject invalid generated IDs instead of coercing them",
    () => {
        assert.throws(
            () =>
                buildCompleteCycleRecord({
                    sessionId: 0,
                    cycle:
                        createCycle()
                }),
            /sessionId must be a positive integer/
        );

        assert.throws(
            () =>
                buildSecurityRows({
                    sessionId: 7,
                    cycleId: 0,
                    cycle:
                        createCycle()
                }),
            /cycleId must be a positive integer/
        );
    }
);
