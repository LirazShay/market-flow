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
        root.MarketFlowPersistenceRecords = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const RECORDER_STATE_KEY =
            "recorderState";

        const UNIVERSE_STATE_KEY =
            "universeState";

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

        function assertFiniteTime(
            value,
            name
        ) {
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

        function assertNonNegativeInteger(
            value,
            name
        ) {
            if (
                !Number.isInteger(value) ||
                value < 0
            ) {
                throw new TypeError(
                    name +
                    " must be a non-negative integer."
                );
            }
        }

        function assertPositiveInteger(
            value,
            name
        ) {
            if (
                !Number.isInteger(value) ||
                value <= 0
            ) {
                throw new TypeError(
                    name +
                    " must be a positive integer."
                );
            }
        }

        function assertOptionalPositiveInteger(
            value,
            name
        ) {
            if (
                value === null ||
                value === undefined
            ) {
                return;
            }

            assertPositiveInteger(
                value,
                name
            );
        }

        function canonicalizeSecurityId(
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

        function buildUniverseRecords(
            universe
        ) {
            assertObject(
                universe,
                "universe"
            );

            assertFiniteTime(
                universe.loadedAtMs,
                "universe.loadedAtMs"
            );

            if (
                !Number.isInteger(
                    universe.recordCount
                ) ||
                universe.recordCount <= 0
            ) {
                throw new TypeError(
                    "universe.recordCount must be a positive integer."
                );
            }

            if (
                !Array.isArray(
                    universe.records
                )
            ) {
                throw new TypeError(
                    "universe.records must be an array."
                );
            }

            if (
                universe.records.length !==
                universe.recordCount
            ) {
                throw new Error(
                    "Universe persistence count mismatch. " +
                    "recordCount=" +
                    universe.recordCount +
                    ", records=" +
                    universe.records.length +
                    "."
                );
            }

            const seenSecurityIds =
                new Set();

            const records =
                universe.records.map(
                    (rawMapHeat, index) => {
                        assertObject(
                            rawMapHeat,
                            "universe.records[" +
                            index +
                            "]"
                        );

                        const securityId =
                            canonicalizeSecurityId(
                                rawMapHeat.PaperId,
                                "universe.records[" +
                                index +
                                "].PaperId"
                            );

                        if (
                            seenSecurityIds.has(
                                securityId
                            )
                        ) {
                            throw new Error(
                                "Universe persistence contains duplicate securityId " +
                                securityId +
                                "."
                            );
                        }

                        seenSecurityIds.add(
                            securityId
                        );

                        return Object.freeze({
                            securityId,
                            paperName:
                                rawMapHeat
                                    .PaperName ??
                                null,
                            updatedAtMs:
                                universe
                                    .loadedAtMs,
                            mapHeatDateChange:
                                rawMapHeat
                                    .DateChange ??
                                null,
                            rawMapHeat
                        });
                    }
                );

            return Object.freeze(
                records
            );
        }

        function buildUniverseStateMetaRecord(
            universe
        ) {
            assertObject(
                universe,
                "universe"
            );

            assertFiniteTime(
                universe.loadedAtMs,
                "universe.loadedAtMs"
            );

            if (
                !Number.isInteger(
                    universe.recordCount
                ) ||
                universe.recordCount <= 0
            ) {
                throw new TypeError(
                    "universe.recordCount must be a positive integer."
                );
            }

            return Object.freeze({
                key:
                    UNIVERSE_STATE_KEY,
                value:
                    Object.freeze({
                        loadedAtMs:
                            universe.loadedAtMs,
                        recordCount:
                            universe.recordCount
                    })
            });
        }

        function buildSessionStartRecord({
            startedAtMs,
            config,
            initialUniverseCount
        }) {
            assertFiniteTime(
                startedAtMs,
                "startedAtMs"
            );

            assertObject(
                config,
                "config"
            );

            assertNonNegativeInteger(
                initialUniverseCount,
                "initialUniverseCount"
            );

            return Object.freeze({
                startedAtMs,
                stoppedAtMs:
                    null,
                status:
                    "running",
                config,
                initialUniverseCount,
                completedCycles:
                    0,
                failedCycles:
                    0,
                stopReason:
                    null
            });
        }

        function buildSessionStopRecord(
            sessionRecord,
            {
                stoppedAtMs,
                completedCycles,
                failedCycles,
                stopReason
            }
        ) {
            assertObject(
                sessionRecord,
                "sessionRecord"
            );

            assertPositiveInteger(
                sessionRecord.sessionId,
                "sessionRecord.sessionId"
            );

            assertFiniteTime(
                sessionRecord.startedAtMs,
                "sessionRecord.startedAtMs"
            );

            assertFiniteTime(
                stoppedAtMs,
                "stoppedAtMs"
            );

            if (
                stoppedAtMs <
                sessionRecord.startedAtMs
            ) {
                throw new Error(
                    "stoppedAtMs cannot be earlier than session startedAtMs."
                );
            }

            assertNonNegativeInteger(
                completedCycles,
                "completedCycles"
            );

            assertNonNegativeInteger(
                failedCycles,
                "failedCycles"
            );

            return Object.freeze({
                ...sessionRecord,
                stoppedAtMs,
                status:
                    "stopped",
                completedCycles,
                failedCycles,
                stopReason:
                    stopReason ??
                    null
            });
        }

        function assertCompleteCycle(
            cycle
        ) {
            assertObject(
                cycle,
                "cycle"
            );

            if (
                cycle.status !==
                "complete"
            ) {
                throw new Error(
                    "Only complete cycles can be mapped for successful persistence."
                );
            }

            assertFiniteTime(
                cycle.startedAtMs,
                "cycle.startedAtMs"
            );

            assertFiniteTime(
                cycle.completedAtMs,
                "cycle.completedAtMs"
            );

            if (
                cycle.completedAtMs <
                cycle.startedAtMs
            ) {
                throw new Error(
                    "cycle.completedAtMs cannot be earlier than cycle.startedAtMs."
                );
            }

            for (const name of [
                "requested",
                "received",
                "unique",
                "missing",
                "duplicates"
            ]) {
                assertNonNegativeInteger(
                    cycle[name],
                    "cycle." + name
                );
            }

            if (
                cycle.requested !==
                    cycle.received ||
                cycle.requested !==
                    cycle.unique ||
                cycle.missing !== 0 ||
                cycle.duplicates !== 0
            ) {
                throw new Error(
                    "Cycle is not complete enough for persistence. " +
                    "requested=" +
                    cycle.requested +
                    ", received=" +
                    cycle.received +
                    ", unique=" +
                    cycle.unique +
                    ", missing=" +
                    cycle.missing +
                    ", duplicates=" +
                    cycle.duplicates +
                    "."
                );
            }

            if (
                !Array.isArray(
                    cycle.chunks
                )
            ) {
                throw new TypeError(
                    "cycle.chunks must be an array."
                );
            }

            if (
                !Array.isArray(
                    cycle.securities
                )
            ) {
                throw new TypeError(
                    "cycle.securities must be an array."
                );
            }

            if (
                cycle.securities.length !==
                cycle.requested
            ) {
                throw new Error(
                    "Cycle securities count does not match requested count."
                );
            }
        }

        function buildCompleteCycleRecord({
            sessionId,
            cycle
        }) {
            assertPositiveInteger(
                sessionId,
                "sessionId"
            );

            assertCompleteCycle(
                cycle
            );

            const chunks =
                cycle.chunks.map(
                    chunk => {
                        assertObject(
                            chunk,
                            "cycle chunk"
                        );

                        return Object.freeze({
                            chunkIndex:
                                chunk.chunkIndex,
                            requested:
                                chunk.requested,
                            received:
                                chunk.received,
                            requestStartedAtMs:
                                chunk.requestStartedAtMs,
                            receivedAtMs:
                                chunk.receivedAtMs,
                            durationMs:
                                chunk.durationMs,
                            serverAsOfDate:
                                chunk
                                    .serverAsOfDate ??
                                null,
                            httpStatus:
                                chunk.httpStatus
                        });
                    }
                );

            return Object.freeze({
                sessionId,
                status:
                    "complete",
                startedAtMs:
                    cycle.startedAtMs,
                completedAtMs:
                    cycle.completedAtMs,
                durationMs:
                    cycle.durationMs,
                requested:
                    cycle.requested,
                received:
                    cycle.received,
                unique:
                    cycle.unique,
                missing:
                    cycle.missing,
                duplicates:
                    cycle.duplicates,
                chunks:
                    Object.freeze(
                        chunks
                    )
            });
        }

        function buildFailedCycleRecord({
            sessionId,
            startedAtMs,
            completedAtMs,
            requested = null,
            received = null,
            unique = null,
            missing = null,
            duplicates = null,
            chunks = [],
            error
        }) {
            assertPositiveInteger(
                sessionId,
                "sessionId"
            );

            assertFiniteTime(
                startedAtMs,
                "startedAtMs"
            );

            assertFiniteTime(
                completedAtMs,
                "completedAtMs"
            );

            if (
                completedAtMs <
                startedAtMs
            ) {
                throw new Error(
                    "completedAtMs cannot be earlier than startedAtMs."
                );
            }

            for (const [
                name,
                value
            ] of [
                ["requested", requested],
                ["received", received],
                ["unique", unique],
                ["missing", missing],
                ["duplicates", duplicates]
            ]) {
                if (
                    value !== null &&
                    value !== undefined
                ) {
                    assertNonNegativeInteger(
                        value,
                        name
                    );
                }
            }

            if (!Array.isArray(chunks)) {
                throw new TypeError(
                    "chunks must be an array."
                );
            }

            assertObject(
                error,
                "error"
            );

            return Object.freeze({
                sessionId,
                status:
                    "failed",
                startedAtMs,
                completedAtMs,
                durationMs:
                    completedAtMs -
                    startedAtMs,
                requested:
                    requested ?? null,
                received:
                    received ?? null,
                unique:
                    unique ?? null,
                missing:
                    missing ?? null,
                duplicates:
                    duplicates ?? null,
                chunks:
                    Object.freeze([
                        ...chunks
                    ]),
                error
            });
        }

        function buildSecurityRows({
            sessionId,
            cycleId,
            cycle
        }) {
            assertPositiveInteger(
                sessionId,
                "sessionId"
            );

            assertPositiveInteger(
                cycleId,
                "cycleId"
            );

            assertCompleteCycle(
                cycle
            );

            const seenSecurityIds =
                new Set();

            const historyRows = [];
            const latestRows = [];

            for (
                let index = 0;
                index <
                cycle.securities.length;
                index++
            ) {
                const item =
                    cycle.securities[index];

                assertObject(
                    item,
                    "cycle.securities[" +
                    index +
                    "]"
                );

                const securityId =
                    canonicalizeSecurityId(
                        item.securityId,
                        "cycle.securities[" +
                        index +
                        "].securityId"
                    );

                if (
                    seenSecurityIds.has(
                        securityId
                    )
                ) {
                    throw new Error(
                        "Cycle persistence contains duplicate securityId " +
                        securityId +
                        "."
                    );
                }

                seenSecurityIds.add(
                    securityId
                );

                assertObject(
                    item.data,
                    "cycle.securities[" +
                    index +
                    "].data"
                );

                const dataKey =
                    canonicalizeSecurityId(
                        item.data.Key,
                        "cycle.securities[" +
                        index +
                        "].data.Key"
                    );

                if (
                    dataKey !==
                    securityId
                ) {
                    throw new Error(
                        "Cycle persistence securityId/data.Key mismatch at index " +
                        index +
                        "."
                    );
                }

                assertFiniteTime(
                    item.chunkReceivedAtMs,
                    "cycle.securities[" +
                    index +
                    "].chunkReceivedAtMs"
                );

                assertFiniteTime(
                    item.collectedAtMs,
                    "cycle.securities[" +
                    index +
                    "].collectedAtMs"
                );

                const baseRecord = {
                    cycleId,
                    sessionId,
                    securityId,
                    chunkIndex:
                        item.chunkIndex,
                    cycleStartedAtMs:
                        cycle.startedAtMs,
                    chunkReceivedAtMs:
                        item.chunkReceivedAtMs,
                    collectedAtMs:
                        item.collectedAtMs,
                    serverAsOfDate:
                        item.serverAsOfDate ??
                        null,
                    data:
                        item.data
                };

                historyRows.push(
                    Object.freeze({
                        ...baseRecord
                    })
                );

                latestRows.push(
                    Object.freeze({
                        ...baseRecord
                    })
                );
            }

            return Object.freeze({
                historyRows:
                    Object.freeze(
                        historyRows
                    ),
                latestRows:
                    Object.freeze(
                        latestRows
                    )
            });
        }

        function buildRecorderStateMetaRecord({
            instanceId,
            sessionId,
            status,
            recordingStartedAtMs,
            lastHeartbeatAtMs,
            lastCompletedCycleId = null,
            lastCompletedAtMs = null,
            completedCycles,
            failedCycles,
            lastError = null,
            config
        }) {
            if (
                typeof instanceId !==
                    "string" ||
                instanceId.length === 0
            ) {
                throw new TypeError(
                    "instanceId must be a non-empty string."
                );
            }

            assertPositiveInteger(
                sessionId,
                "sessionId"
            );

            if (
                typeof status !==
                    "string" ||
                status.length === 0
            ) {
                throw new TypeError(
                    "status must be a non-empty string."
                );
            }

            assertFiniteTime(
                recordingStartedAtMs,
                "recordingStartedAtMs"
            );

            assertFiniteTime(
                lastHeartbeatAtMs,
                "lastHeartbeatAtMs"
            );

            assertOptionalPositiveInteger(
                lastCompletedCycleId,
                "lastCompletedCycleId"
            );

            if (
                lastCompletedAtMs !==
                    null &&
                lastCompletedAtMs !==
                    undefined
            ) {
                assertFiniteTime(
                    lastCompletedAtMs,
                    "lastCompletedAtMs"
                );
            }

            assertNonNegativeInteger(
                completedCycles,
                "completedCycles"
            );

            assertNonNegativeInteger(
                failedCycles,
                "failedCycles"
            );

            assertObject(
                config,
                "config"
            );

            return Object.freeze({
                key:
                    RECORDER_STATE_KEY,
                value:
                    Object.freeze({
                        instanceId,
                        sessionId,
                        status,
                        recordingStartedAtMs,
                        lastHeartbeatAtMs,
                        lastCompletedCycleId:
                            lastCompletedCycleId ??
                            null,
                        lastCompletedAtMs:
                            lastCompletedAtMs ??
                            null,
                        completedCycles,
                        failedCycles,
                        lastError,
                        config
                    })
            });
        }

        return Object.freeze({
            RECORDER_STATE_KEY,
            UNIVERSE_STATE_KEY,
            buildUniverseRecords,
            buildUniverseStateMetaRecord,
            buildSessionStartRecord,
            buildSessionStopRecord,
            buildCompleteCycleRecord,
            buildFailedCycleRecord,
            buildSecurityRows,
            buildRecorderStateMetaRecord
        });
    }
);
