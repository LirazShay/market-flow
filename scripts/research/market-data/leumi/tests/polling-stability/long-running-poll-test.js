(() => {
    if (window.__marketFlowPolling?.running) {
        console.warn("Market Flow polling test is already running.");
        return window.__marketFlowPolling;
    }

    const CONFIG = {
        // Full snapshot target cadence, measured from the start of one cycle
        // to the desired start of the next cycle.
        SNAPSHOT_INTERVAL_MS: 3000,

        // Delay between GetSecuritiesData chunks inside one snapshot cycle.
        CHUNK_DELAY_MS: 1000,

        // Proven-safe batch size from previous tests.
        CHUNK_SIZE: 187,

        // 0 = run until manually stopped.
        MAX_RUN_MINUTES: 0,

        // Stop automatically after this many consecutive failed cycles.
        // Set 0 to never auto-stop on failures.
        STOP_AFTER_CONSECUTIVE_FAILURES: 3,

        // Refresh MapHeat only once at startup for this stability test.
        REFRESH_MAP_EVERY_CYCLE: false,

        // Log each chunk request.
        LOG_EACH_REQUEST: true
    };

    const state = {
        running: true,
        startedAt: new Date(),
        stoppedAt: null,
        securitiesUniverse: [],
        chunks: [],
        latestSnapshot: null,
        cyclesStarted: 0,
        cyclesCompleted: 0,
        cyclesFailed: 0,
        consecutiveFailures: 0,
        totalRequests: 0,
        statusCounts: {},
        requestDurationsMs: [],
        cycleDurationsMs: [],
        lastError: null,
        timerId: null,
        abortController: new AbortController()
    };

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    const nowIso = () => new Date().toISOString();

    const elapsedMs = () =>
        Date.now() - state.startedAt.getTime();

    const average = values => {
        if (values.length === 0) {
            return 0;
        }

        return values.reduce((sum, value) => sum + value, 0) /
            values.length;
    };

    const buildMapUrl = pageCount => {
        return (
            "/lti/lti-app/api/MarketFast/MapHeat2" +
            "?indexIdArray=0" +
            "&sectorIdAndTatSectorArray=0;0" +
            "&showOnlyDual=0" +
            "&lowChngPrcDay=-999999999" +
            "&highChngPrcDay=999999999" +
            "&lowChngPrcStartYear=-999999999" +
            "&highChngPrcStartYear=999999999" +
            "&highLow52=0" +
            "&lowDailyAverageVolume=-999999999" +
            "&highDailyAverageVolume=999999999" +
            "&lowDivYield=-999999999" +
            "&highDivYield=999999999" +
            "&lowMarketValue=-999999999999999" +
            "&highMarketValue=999999999999999" +
            "&esdRatingModeSelected=0" +
            "&EsdRatingModeValueSelected=0" +
            "&page=1" +
            "&pageCount=" + pageCount +
            "&orderFieldName=DailyNumDeals" +
            "&order=DESC" +
            "&rt=true"
        );
    };

    const recordStatus = status => {
        const key = String(status);
        state.statusCounts[key] =
            (state.statusCounts[key] ?? 0) + 1;
    };

    const fetchJsonMeasured = async (url, label) => {
        const started = performance.now();
        state.totalRequests++;

        try {
            const response = await fetch(url, {
                signal: state.abortController.signal
            });

            const durationMs = Math.round(
                performance.now() - started
            );

            state.requestDurationsMs.push(durationMs);
            recordStatus(response.status);

            if (CONFIG.LOG_EACH_REQUEST) {
                console.log(
                    `[${nowIso()}] ${label} → HTTP ${response.status} in ${durationMs}ms`
                );
            }

            if (!response.ok) {
                throw new Error(
                    `${label} failed: HTTP ${response.status}`
                );
            }

            const json = await response.json();

            return {
                json,
                status: response.status,
                durationMs
            };
        } catch (error) {
            if (
                error?.name === "AbortError" &&
                !state.running
            ) {
                throw error;
            }

            throw error;
        }
    };

    const loadUniverse = async () => {
        console.log(
            `[${nowIso()}] Loading MapHeat universe...`
        );

        const initial = await fetchJsonMeasured(
            buildMapUrl(1),
            "MapHeat2 count"
        );

        const recordCount =
            initial.json?.data?.MapHeat?.recordCount;

        if (!Number.isInteger(recordCount) || recordCount <= 0) {
            throw new Error(
                `Invalid MapHeat2 recordCount: ${recordCount}`
            );
        }

        const full = await fetchJsonMeasured(
            buildMapUrl(recordCount),
            "MapHeat2 full"
        );

        const records =
            full.json?.data?.MapHeat?.records;

        if (!Array.isArray(records)) {
            throw new Error(
                "MapHeat2 full response structure is invalid"
            );
        }

        if (records.length !== recordCount) {
            throw new Error(
                `MapHeat2 expected ${recordCount}, received ${records.length}`
            );
        }

        const ids = records.map(x => x.PaperId);
        const uniqueIds = new Set(ids.map(String));

        if (uniqueIds.size !== ids.length) {
            throw new Error(
                `MapHeat2 contains duplicate PaperIds: total=${ids.length}, unique=${uniqueIds.size}`
            );
        }

        const chunks = [];

        for (
            let start = 0;
            start < ids.length;
            start += CONFIG.CHUNK_SIZE
        ) {
            chunks.push(
                ids.slice(
                    start,
                    start + CONFIG.CHUNK_SIZE
                )
            );
        }

        state.securitiesUniverse = records;
        state.chunks = chunks;

        console.log(
            `[${nowIso()}] Universe loaded: ${records.length} securities, ${chunks.length} chunks: [${chunks
                .map(x => x.length)
                .join(", ")}]`
        );

        return records;
    };

    const fetchChunk = async (ids, chunkIndex, cycleNumber) => {
        const url =
            "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData" +
            "?securityIds=" + ids.join(",") +
            "&responseType=1" +
            "&is_gto=true" +
            "&force=false";

        const result = await fetchJsonMeasured(
            url,
            `Cycle ${cycleNumber} chunk ${chunkIndex + 1}/${state.chunks.length}`
        );

        const securities =
            result.json?.data?.SecuritiesData?.Table?.Security;

        if (!Array.isArray(securities)) {
            throw new Error(
                `Cycle ${cycleNumber} chunk ${chunkIndex + 1}: invalid response structure`
            );
        }

        if (securities.length !== ids.length) {
            throw new Error(
                `Cycle ${cycleNumber} chunk ${chunkIndex + 1}: expected ${ids.length}, received ${securities.length}`
            );
        }

        return {
            securities,
            asOfDate:
                result.json?.data?.SecuritiesData?.Table?.AsOfDate ??
                null,
            durationMs: result.durationMs
        };
    };

    const runCycle = async () => {
        if (!state.running) {
            return;
        }

        state.cyclesStarted++;
        const cycleNumber = state.cyclesStarted;
        const cycleStartedAt = performance.now();
        const cycleWallClockStartedAt = new Date();

        console.log(
            `\n=== Market Flow cycle ${cycleNumber} started at ${cycleWallClockStartedAt.toISOString()} ===`
        );

        try {
            if (CONFIG.REFRESH_MAP_EVERY_CYCLE) {
                await loadUniverse();
            }

            const allSecurities = [];
            const chunkResults = [];

            for (let i = 0; i < state.chunks.length; i++) {
                if (!state.running) {
                    return;
                }

                const chunkResult = await fetchChunk(
                    state.chunks[i],
                    i,
                    cycleNumber
                );

                chunkResults.push({
                    chunkIndex: i,
                    requested: state.chunks[i].length,
                    received: chunkResult.securities.length,
                    asOfDate: chunkResult.asOfDate,
                    durationMs: chunkResult.durationMs
                });

                allSecurities.push(
                    ...chunkResult.securities
                );

                if (
                    i < state.chunks.length - 1 &&
                    CONFIG.CHUNK_DELAY_MS > 0
                ) {
                    await sleep(
                        CONFIG.CHUNK_DELAY_MS
                    );
                }
            }

            const uniqueKeys = new Set(
                allSecurities.map(x => String(x.Key))
            );

            const requestedIds = new Set(
                state.securitiesUniverse.map(
                    x => String(x.PaperId)
                )
            );

            const missingIds = [...requestedIds].filter(
                id => !uniqueKeys.has(id)
            );

            const duplicateCount =
                allSecurities.length - uniqueKeys.size;

            if (
                allSecurities.length !==
                    state.securitiesUniverse.length ||
                uniqueKeys.size !==
                    state.securitiesUniverse.length ||
                missingIds.length !== 0 ||
                duplicateCount !== 0
            ) {
                throw new Error(
                    `Cycle ${cycleNumber} validation failed: requested=${state.securitiesUniverse.length}, received=${allSecurities.length}, unique=${uniqueKeys.size}, missing=${missingIds.length}, duplicates=${duplicateCount}`
                );
            }

            const durationMs = Math.round(
                performance.now() - cycleStartedAt
            );

            state.cycleDurationsMs.push(durationMs);
            state.cyclesCompleted++;
            state.consecutiveFailures = 0;
            state.lastError = null;

            state.latestSnapshot = {
                cycleNumber,
                collectedAt:
                    new Date().toISOString(),
                durationMs,
                totalSecurities:
                    allSecurities.length,
                uniqueKeys: uniqueKeys.size,
                missingIds,
                duplicateCount,
                chunkResults,
                securities: allSecurities
            };

            console.log(
                `✅ Cycle ${cycleNumber} complete: ${allSecurities.length} securities, ${durationMs}ms, missing=0, duplicates=0`
            );
        } catch (error) {
            if (
                error?.name === "AbortError" &&
                !state.running
            ) {
                return;
            }

            const durationMs = Math.round(
                performance.now() - cycleStartedAt
            );

            state.cycleDurationsMs.push(durationMs);
            state.cyclesFailed++;
            state.consecutiveFailures++;
            state.lastError = {
                time: nowIso(),
                cycleNumber,
                message:
                    error?.message ?? String(error)
            };

            console.error(
                `❌ Cycle ${cycleNumber} failed after ${durationMs}ms:`,
                error
            );

            if (
                CONFIG.STOP_AFTER_CONSECUTIVE_FAILURES > 0 &&
                state.consecutiveFailures >=
                    CONFIG.STOP_AFTER_CONSECUTIVE_FAILURES
            ) {
                console.error(
                    `Stopping after ${state.consecutiveFailures} consecutive failed cycles.`
                );

                window.__marketFlowPolling.stop();
                return;
            }
        }

        if (!state.running) {
            return;
        }

        if (
            CONFIG.MAX_RUN_MINUTES > 0 &&
            elapsedMs() >=
                CONFIG.MAX_RUN_MINUTES * 60 * 1000
        ) {
            console.log(
                `Reached MAX_RUN_MINUTES=${CONFIG.MAX_RUN_MINUTES}. Stopping.`
            );

            window.__marketFlowPolling.stop();
            return;
        }

        const cycleElapsedMs =
            performance.now() - cycleStartedAt;

        const waitMs = Math.max(
            0,
            CONFIG.SNAPSHOT_INTERVAL_MS -
                cycleElapsedMs
        );

        if (waitMs > 0) {
            await sleep(waitMs);
        }

        if (state.running) {
            state.timerId = setTimeout(
                runCycle,
                0
            );
        }
    };

    const report = () => {
        const uptimeMs = elapsedMs();

        const summary = {
            running: state.running,
            startedAt: state.startedAt.toISOString(),
            stoppedAt:
                state.stoppedAt?.toISOString() ?? null,
            uptimeMinutes:
                Number(
                    (uptimeMs / 60000).toFixed(2)
                ),
            universeSize:
                state.securitiesUniverse.length,
            chunkSizes:
                state.chunks.map(x => x.length),
            cyclesStarted: state.cyclesStarted,
            cyclesCompleted:
                state.cyclesCompleted,
            cyclesFailed: state.cyclesFailed,
            consecutiveFailures:
                state.consecutiveFailures,
            totalRequests: state.totalRequests,
            statusCounts: {
                ...state.statusCounts
            },
            averageRequestDurationMs:
                Math.round(
                    average(
                        state.requestDurationsMs
                    )
                ),
            averageCycleDurationMs:
                Math.round(
                    average(
                        state.cycleDurationsMs
                    )
                ),
            lastError: state.lastError,
            latestSnapshot:
                state.latestSnapshot
                    ? {
                          cycleNumber:
                              state.latestSnapshot
                                  .cycleNumber,
                          collectedAt:
                              state.latestSnapshot
                                  .collectedAt,
                          durationMs:
                              state.latestSnapshot
                                  .durationMs,
                          totalSecurities:
                              state.latestSnapshot
                                  .totalSecurities,
                          missing:
                              state.latestSnapshot
                                  .missingIds.length,
                          duplicates:
                              state.latestSnapshot
                                  .duplicateCount,
                          chunkResults:
                              state.latestSnapshot
                                  .chunkResults
                      }
                    : null,
            config: {
                ...CONFIG
            }
        };

        console.table({
            running: summary.running,
            uptimeMinutes:
                summary.uptimeMinutes,
            universeSize:
                summary.universeSize,
            cyclesCompleted:
                summary.cyclesCompleted,
            cyclesFailed:
                summary.cyclesFailed,
            totalRequests:
                summary.totalRequests,
            averageRequestDurationMs:
                summary.averageRequestDurationMs,
            averageCycleDurationMs:
                summary.averageCycleDurationMs
        });

        console.log(
            "HTTP status counts:",
            summary.statusCounts
        );

        console.log(
            "Full report:",
            summary
        );

        return summary;
    };

    const stop = () => {
        if (!state.running) {
            return report();
        }

        state.running = false;
        state.stoppedAt = new Date();

        if (state.timerId) {
            clearTimeout(state.timerId);
            state.timerId = null;
        }

        state.abortController.abort();

        console.log(
            `Market Flow polling stopped at ${state.stoppedAt.toISOString()}`
        );

        return report();
    };

    window.__marketFlowPolling = {
        CONFIG,
        state,
        get running() {
            return state.running;
        },
        stop,
        report
    };

    console.log(
        "Market Flow long-running polling test starting."
    );
    console.log("Configuration:", CONFIG);
    console.log(
        "Use __marketFlowPolling.report() for statistics."
    );
    console.log(
        "Use __marketFlowPolling.stop() to stop."
    );

    (async () => {
        try {
            await loadUniverse();

            if (state.running) {
                runCycle();
            }
        } catch (error) {
            state.lastError = {
                time: nowIso(),
                cycleNumber: 0,
                message:
                    error?.message ?? String(error)
            };

            console.error(
                "Failed to initialize Market Flow polling test:",
                error
            );

            stop();
        }
    })();

    return window.__marketFlowPolling;
})();
