(() => {
    "use strict";

    async function runLiveVerificationCheck() {
        const runtime =
            window.MarketFlowRuntime;

        if (
            !runtime ||
            typeof runtime.createDebugBundle !== "function"
        ) {
            throw new Error(
                "MarketFlowRuntime is not loaded. Run the verified Market Flow Bookmarklet first."
            );
        }

        const debugBundle =
            await runtime.createDebugBundle({
                recentCycleLimit: 8
            });

        const recorder =
            debugBundle.runtime?.recorder ??
            null;

        const persistence =
            debugBundle.runtime?.persistence ??
            null;

        const viewer =
            debugBundle.runtime?.viewer ??
            null;

        const rowCounts =
            debugBundle.database?.rowCounts ??
            {};

        const recentCycles =
            Array.isArray(
                debugBundle.recentCycles
            )
                ? debugBundle.recentCycles
                : [];

        const completeCycles =
            recentCycles.filter(
                cycle =>
                    cycle?.status === "complete"
            );

        const failedCycles =
            recentCycles.filter(
                cycle =>
                    cycle?.status !== "complete"
            );

        const newestCompleteCycle =
            completeCycles[0] ??
            null;

        const completeCycleIntegrity =
            completeCycles.map(
                cycle => ({
                    cycleId:
                        cycle.cycleId ??
                        null,
                    requested:
                        cycle.requested ??
                        null,
                    received:
                        cycle.received ??
                        null,
                    unique:
                        cycle.unique ??
                        null,
                    missing:
                        cycle.missing ??
                        null,
                    duplicates:
                        cycle.duplicates ??
                        null,
                    rowReadTruncated:
                        cycle.rowReadTruncated ??
                        null,
                    countsMatch:
                        cycle.requested !== null &&
                        cycle.requested ===
                            cycle.received &&
                        cycle.received ===
                            cycle.unique,
                    noMissing:
                        cycle.missing === 0,
                    noDuplicates:
                        cycle.duplicates === 0
                })
            );

        const allCompleteCyclesValid =
            completeCycleIntegrity.length > 0 &&
            completeCycleIntegrity.every(
                cycle =>
                    cycle.countsMatch &&
                    cycle.noMissing &&
                    cycle.noDuplicates
            );

        const checks = {
            runtimeLoaded:
                true,
            recorderRunning:
                recorder?.isRunning === true,
            hasCompletedCycle:
                Number(
                    recorder?.completedCycles ??
                    0
                ) >= 1,
            noRecorderFailures:
                Number(
                    recorder?.failedCycles ??
                    0
                ) === 0,
            noLatestRecorderError:
                recorder?.latestError === null,
            persistenceDatabaseOpen:
                persistence?.hasDatabase === true,
            viewerAvailable:
                viewer?.available === true,
            viewerOpen:
                viewer?.isOpen === true,
            hasPersistedCycles:
                Number(
                    rowCounts.cycles ??
                    0
                ) >= 1,
            hasPersistedLatest:
                Number(
                    rowCounts.latest ??
                    0
                ) >= 1,
            hasPersistedHistory:
                Number(
                    rowCounts.history ??
                    0
                ) >= 1,
            completeCycleIntegrity:
                allCompleteCyclesValid
        };

        const failedCheckNames =
            Object.entries(
                checks
            )
                .filter(
                    ([, value]) =>
                        value !== true
                )
                .map(
                    ([name]) =>
                        name
                );

        const status =
            failedCheckNames.length === 0
                ? "PASS"
                : "NEEDS_REVIEW";

        const providerEvidence =
            newestCompleteCycle
                ? {
                    cycleId:
                        newestCompleteCycle
                            .cycleId ??
                        null,
                    securityCount:
                        newestCompleteCycle
                            .securityCount ??
                        null,
                    marketDataFingerprint:
                        newestCompleteCycle
                            .marketDataFingerprint ??
                        null,
                    providerTimeFingerprint:
                        newestCompleteCycle
                            .providerTimeFingerprint ??
                        null,
                    changedMarketSecuritiesVsPrevious:
                        newestCompleteCycle
                            .changedMarketSecuritiesVsPrevious ??
                        null,
                    changedProviderTimeSecuritiesVsPrevious:
                        newestCompleteCycle
                            .changedProviderTimeSecuritiesVsPrevious ??
                        null,
                    providerTimes:
                        newestCompleteCycle
                            .providerTimes ??
                        null,
                    chunks:
                        newestCompleteCycle
                            .chunks ??
                        null
                }
                : null;

        const report = {
            reportVersion: 1,
            generatedAtMs:
                Date.now(),
            status,
            failedCheckNames,
            checks,
            recorderSummary: {
                status:
                    recorder?.status ??
                    null,
                isRunning:
                    recorder?.isRunning ??
                    null,
                cycleInFlight:
                    recorder?.cycleInFlight ??
                    null,
                completedCycles:
                    recorder?.completedCycles ??
                    null,
                failedCycles:
                    recorder?.failedCycles ??
                    null,
                latestError:
                    recorder?.latestError ??
                    null,
                latestCycle:
                    recorder?.latestCycle ??
                    null
            },
            persistenceSummary:
                persistence,
            viewerSummary:
                viewer,
            rowCounts,
            completeCycleIntegrity,
            recentFailedCycles:
                failedCycles.map(
                    cycle => ({
                        cycleId:
                            cycle?.cycleId ??
                            null,
                        status:
                            cycle?.status ??
                            null,
                        requested:
                            cycle?.requested ??
                            null,
                        received:
                            cycle?.received ??
                            null,
                        unique:
                            cycle?.unique ??
                            null,
                        missing:
                            cycle?.missing ??
                            null,
                        duplicates:
                            cycle?.duplicates ??
                            null,
                        error:
                            cycle?.error ??
                            null
                    })
                ),
            providerEvidence,
            interpretation: {
                unchangedMarketDataIsNotAutomaticallyFailure:
                    true,
                note:
                    "After market hours, zero changed securities between complete cycles can be valid. This report records evidence; it does not infer exchange-open/closed state."
            },
            debugBundle
        };

        const json =
            JSON.stringify(
                report,
                null,
                2
            ) +
            "\n";

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );

        const objectUrl =
            URL.createObjectURL(
                blob
            );

        const date =
            new Date(
                report.generatedAtMs
            )
                .toISOString()
                .replace(
                    /[-:]/g,
                    ""
                )
                .replace(
                    /\.\d{3}Z$/,
                    "Z"
                );

        const fileName =
            "market-flow-live-verification-" +
            date +
            ".json";

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href =
            objectUrl;

        anchor.download =
            fileName;

        anchor.hidden =
            true;

        (
            document.body ??
            document.documentElement
        ).appendChild(
            anchor
        );

        try {
            anchor.click();
        } finally {
            anchor.remove();

            setTimeout(
                () =>
                    URL.revokeObjectURL(
                        objectUrl
                    ),
                0
            );
        }

        console.log(
            "Market Flow live verification:",
            {
                status:
                    report.status,
                failedCheckNames:
                    report.failedCheckNames,
                recorderSummary:
                    report.recorderSummary,
                rowCounts:
                    report.rowCounts,
                providerEvidence:
                    report.providerEvidence,
                fileName
            }
        );

        return report;
    }

    runLiveVerificationCheck()
        .then(
            report => {
                window.MarketFlowLiveVerificationReport =
                    report;
            }
        )
        .catch(
            error => {
                console.error(
                    "Market Flow live verification failed.",
                    error
                );
            }
        );
})();
