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
        root.MarketFlowViewerStateLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const VIEWER_STATES =
            Object.freeze({
                BOOTING: "BOOTING",
                EMPTY: "EMPTY",
                MAIN: "MAIN",
                DETAIL: "DETAIL",
                ERROR: "ERROR"
            });

        const RECORDER_HEALTH =
            Object.freeze({
                UNKNOWN: "UNKNOWN",
                RUNNING: "RUNNING",
                STALE: "STALE",
                STOPPED: "STOPPED",
                ERROR: "ERROR"
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

        function createInitialViewerState(
            openedAtMs
        ) {
            assertFiniteTime(
                openedAtMs,
                "openedAtMs"
            );

            return Object.freeze({
                viewState:
                    VIEWER_STATES
                        .BOOTING,
                recorderHealth:
                    RECORDER_HEALTH
                        .UNKNOWN,
                openedAtMs,
                selectedSecurityId:
                    null,
                latestError:
                    null
            });
        }

        return Object.freeze({
            VIEWER_STATES,
            RECORDER_HEALTH,
            createInitialViewerState
        });
    }
);
