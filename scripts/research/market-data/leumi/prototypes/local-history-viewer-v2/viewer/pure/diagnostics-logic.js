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
        root.MarketFlowViewerDiagnosticsLogic =
            api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const STALE_AFTER_MS =
            15000;

        const HEALTH_LABELS =
            Object.freeze({
                UNKNOWN:
                    "לא ידוע",
                RUNNING:
                    "רץ",
                STALE:
                    "לא מעודכן",
                STOPPED:
                    "נעצר",
                ERROR:
                    "שגיאה"
            });

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

        function createHealth(
            code,
            heartbeatAgeMs
        ) {
            return Object.freeze({
                code,
                label:
                    HEALTH_LABELS[code],
                heartbeatAgeMs
            });
        }

        function deriveRecorderHealth(
            recorderState,
            nowMs
        ) {
            assertFiniteTime(
                nowMs,
                "nowMs"
            );

            if (
                recorderState === null ||
                recorderState === undefined
            ) {
                return createHealth(
                    "UNKNOWN",
                    null
                );
            }

            if (
                typeof recorderState !==
                    "object" ||
                Array.isArray(
                    recorderState
                )
            ) {
                throw new TypeError(
                    "recorderState must be null or an object."
                );
            }

            const status =
                recorderState.status;

            if (
                status !== "running" &&
                status !== "stopped"
            ) {
                throw new Error(
                    "unsupported recorder status: " +
                    String(status)
                );
            }

            assertFiniteTime(
                recorderState
                    .lastHeartbeatAtMs,
                "recorderState.lastHeartbeatAtMs"
            );

            const heartbeatAgeMs =
                Math.max(
                    0,
                    nowMs -
                    recorderState
                        .lastHeartbeatAtMs
                );

            if (
                status ===
                "stopped"
            ) {
                return createHealth(
                    "STOPPED",
                    heartbeatAgeMs
                );
            }

            if (
                heartbeatAgeMs >=
                STALE_AFTER_MS
            ) {
                return createHealth(
                    "STALE",
                    heartbeatAgeMs
                );
            }

            if (
                recorderState.lastError !==
                    null &&
                recorderState.lastError !==
                    undefined
            ) {
                return createHealth(
                    "ERROR",
                    heartbeatAgeMs
                );
            }

            return createHealth(
                "RUNNING",
                heartbeatAgeMs
            );
        }

        function assertSnapshot(
            snapshot
        ) {
            if (
                !snapshot ||
                typeof snapshot !==
                    "object" ||
                Array.isArray(
                    snapshot
                )
            ) {
                throw new TypeError(
                    "snapshot must be an object."
                );
            }

            if (
                !snapshot.rowCounts ||
                typeof snapshot.rowCounts !==
                    "object" ||
                Array.isArray(
                    snapshot.rowCounts
                )
            ) {
                throw new TypeError(
                    "snapshot.rowCounts must be an object."
                );
            }

            for (
                const name of [
                    "latest",
                    "history"
                ]
            ) {
                assertNonNegativeInteger(
                    snapshot
                        .rowCounts[name],
                    "snapshot.rowCounts." +
                    name
                );
            }

            if (
                !snapshot.storage ||
                typeof snapshot.storage !==
                    "object" ||
                Array.isArray(
                    snapshot.storage
                )
            ) {
                throw new TypeError(
                    "snapshot.storage must be an object."
                );
            }
        }

        function createDiagnosticsModel(
            snapshot,
            nowMs
        ) {
            assertSnapshot(
                snapshot
            );

            const recorderState =
                snapshot.recorderState ??
                null;

            const recorderHealth =
                deriveRecorderHealth(
                    recorderState,
                    nowMs
                );

            if (
                recorderState !==
                null
            ) {
                assertNonNegativeInteger(
                    recorderState
                        .completedCycles,
                    "recorderState.completedCycles"
                );

                assertNonNegativeInteger(
                    recorderState
                        .failedCycles,
                    "recorderState.failedCycles"
                );
            }

            const lastCycle =
                snapshot.lastCycle ??
                null;

            if (
                lastCycle !== null &&
                lastCycle.durationMs !==
                    null &&
                lastCycle.durationMs !==
                    undefined
            ) {
                assertFiniteTime(
                    lastCycle
                        .durationMs,
                    "lastCycle.durationMs"
                );
            }

            const storage =
                Object.freeze({
                    usageBytes:
                        snapshot
                            .storage
                            .usageBytes ??
                        null,
                    quotaBytes:
                        snapshot
                            .storage
                            .quotaBytes ??
                        null,
                    freeBytes:
                        snapshot
                            .storage
                            .freeBytes ??
                        null,
                    usageRatio:
                        snapshot
                            .storage
                            .usageRatio ??
                        null
                });

            return Object.freeze({
                recorderHealth,
                lastCompletedAtMs:
                    recorderState
                        ?.lastCompletedAtMs ??
                    null,
                lastCompletedCycleId:
                    recorderState
                        ?.lastCompletedCycleId ??
                    null,
                lastCycleDurationMs:
                    lastCycle
                        ?.durationMs ??
                    null,
                latestCount:
                    snapshot
                        .rowCounts
                        .latest,
                completedCycles:
                    recorderState
                        ?.completedCycles ??
                    null,
                failedCycles:
                    recorderState
                        ?.failedCycles ??
                    null,
                historyCount:
                    snapshot
                        .rowCounts
                        .history,
                storage,
                lastError:
                    recorderState
                        ?.lastError ??
                    null
            });
        }

        return Object.freeze({
            STALE_AFTER_MS,
            HEALTH_LABELS,
            deriveRecorderHealth,
            createDiagnosticsModel
        });
    }
);
