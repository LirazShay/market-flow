(() => {
    "use strict";

    if (
        window.MarketFlowViewerDiagnostics
    ) {
        console.warn(
            "MarketFlowViewerDiagnostics is already loaded."
        );
        return;
    }

    const data =
        window.MarketFlowViewerDiagnosticsData;

    const logic =
        window.MarketFlowViewerDiagnosticsLogic;

    if (
        !data ||
        !logic
    ) {
        throw new Error(
            "Viewer diagnostics dependencies are not loaded."
        );
    }

    const sessions =
        new WeakMap();

    function formatNumber(
        value
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        return Number(value)
            .toLocaleString(
                "en-US"
            );
    }

    function formatDuration(
        value
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        return (
            formatNumber(
                value
            ) +
            " ms"
        );
    }

    function formatAge(
        atMs,
        nowMs
    ) {
        if (
            atMs === null ||
            atMs === undefined
        ) {
            return "—";
        }

        const ageMs =
            Math.max(
                0,
                nowMs - atMs
            );

        if (
            ageMs < 1000
        ) {
            return "לפני פחות משנייה";
        }

        return (
            "לפני " +
            Math.floor(
                ageMs / 1000
            ).toLocaleString(
                "en-US"
            ) +
            " שניות"
        );
    }

    function formatBytes(
        value
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return null;
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB",
            "TB"
        ];

        let amount =
            value;

        let unitIndex =
            0;

        while (
            amount >= 1024 &&
            unitIndex <
                units.length - 1
        ) {
            amount /=
                1024;

            unitIndex++;
        }

        const digits =
            unitIndex === 0
                ? 0
                : 1;

        return (
            amount.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits:
                        digits
                }
            ) +
            " " +
            units[unitIndex]
        );
    }

    function formatStorage(
        storage
    ) {
        const usage =
            formatBytes(
                storage
                    .usageBytes
            );

        const quota =
            formatBytes(
                storage
                    .quotaBytes
            );

        if (
            usage === null &&
            quota === null
        ) {
            return "—";
        }

        if (
            usage !== null &&
            quota !== null
        ) {
            return (
                usage +
                " / " +
                quota
            );
        }

        return (
            usage ??
            quota
        );
    }

    function setText(
        targetWindow,
        role,
        value
    ) {
        const element =
            targetWindow
                .document
                .querySelector(
                    "[data-role='" +
                    role +
                    "']"
                );

        if (!element) {
            throw new Error(
                "Viewer diagnostics metric is missing: " +
                role +
                "."
            );
        }

        element.textContent =
            value;
    }

    function render(
        targetWindow,
        model,
        nowMs
    ) {
        setText(
            targetWindow,
            "recorder-health",
            model
                .recorderHealth
                .label
        );

        setText(
            targetWindow,
            "last-update",
            formatAge(
                model
                    .lastCompletedAtMs,
                nowMs
            )
        );

        setText(
            targetWindow,
            "last-cycle",
            formatNumber(
                model
                    .lastCompletedCycleId
            )
        );

        setText(
            targetWindow,
            "cycle-duration",
            formatDuration(
                model
                    .lastCycleDurationMs
            )
        );

        setText(
            targetWindow,
            "security-count",
            formatNumber(
                model
                    .latestCount
            )
        );

        setText(
            targetWindow,
            "completed-cycles",
            formatNumber(
                model
                    .completedCycles
            )
        );

        setText(
            targetWindow,
            "failed-cycles",
            formatNumber(
                model
                    .failedCycles
            )
        );

        setText(
            targetWindow,
            "history-count",
            formatNumber(
                model
                    .historyCount
            )
        );

        setText(
            targetWindow,
            "storage-usage",
            formatStorage(
                model.storage
            )
        );

        targetWindow
            .MarketFlowViewerShell
            ?.setState?.({
                recorderHealth:
                    model
                        .recorderHealth
                        .code
            });
    }

    async function refresh(
        targetWindow
    ) {
        const session =
            sessions.get(
                targetWindow
            );

        if (!session) {
            throw new Error(
                "Viewer diagnostics is not attached."
            );
        }

        const snapshot =
            await data
                .loadSnapshot();

        const nowMs =
            Date.now();

        const model =
            logic
                .createDiagnosticsModel(
                    snapshot,
                    nowMs
                );

        render(
            targetWindow,
            model,
            nowMs
        );

        session.model =
            model;

        session.refreshCount++;

        return model;
    }

    function attach(
        targetWindow
    ) {
        const existing =
            sessions.get(
                targetWindow
            );

        if (existing) {
            return existing.publicState;
        }

        const session = {
            model:
                null,
            refreshCount:
                0,
            publicState:
                null
        };

        const publicState =
            Object.freeze({
                refresh:
                    () =>
                        refresh(
                            targetWindow
                        ),
                getState:
                    () =>
                        Object.freeze({
                            refreshCount:
                                session
                                    .refreshCount,
                            model:
                                session
                                    .model
                        }),
                close:
                    () => {
                        sessions.delete(
                            targetWindow
                        );
                    }
            });

        session.publicState =
            publicState;

        sessions.set(
            targetWindow,
            session
        );

        return publicState;
    }

    function detach(
        targetWindow
    ) {
        sessions
            .get(
                targetWindow
            )
            ?.publicState
            .close();
    }

    function getState(
        targetWindow
    ) {
        return (
            sessions
                .get(
                    targetWindow
                )
                ?.publicState
                .getState() ??
            null
        );
    }

    window.MarketFlowViewerDiagnostics =
        Object.freeze({
            attach,
            detach,
            refresh,
            getState
        });

    console.log(
        "Market Flow viewer diagnostics loaded."
    );
})();
