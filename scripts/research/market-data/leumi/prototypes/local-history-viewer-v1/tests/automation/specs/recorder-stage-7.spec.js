const {
    test,
    expect
} = require("@playwright/test");

const {
    installLeumiApiMocks
} = require("../helpers/mock-leumi-api");

test(
    "Stage 7 builds a complete sequential mocked recorder cycle",
    async ({ page }) => {
        const mock =
            await installLeumiApiMocks(
                page,
                "success"
            );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const result =
            await page.evaluate(
                async () => {
                    const universe =
                        await window
                            .MarketFlowUniverseLoader
                            .loadUniverse({
                                chunkSize: 2,
                                chunkDelayMs: 1
                            });

                    const cycle =
                        await window
                            .MarketFlowCycleBuilder
                            .buildCompleteCycle(
                                universe
                            );

                    return {
                        universe: {
                            recordCount:
                                universe
                                    .recordCount,
                            chunkSizes:
                                universe
                                    .chunkSizes
                        },
                        cycle: {
                            status:
                                cycle.status,
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
                            securities:
                                cycle
                                    .securities
                                    .map(
                                        item => ({
                                            securityId:
                                                item
                                                    .securityId,
                                            chunkIndex:
                                                item
                                                    .chunkIndex,
                                            lastKnownRate:
                                                item
                                                    .data
                                                    .LastKnownRate
                                        })
                                    )
                        }
                    };
                }
            );

        expect(
            result.universe
                .recordCount
        ).toBe(4);

        expect(
            result.universe
                .chunkSizes
        ).toEqual([
            2,
            2
        ]);

        expect(
            result.cycle
        ).toMatchObject({
            status: "complete",
            requested: 4,
            received: 4,
            unique: 4,
            missing: 0,
            duplicates: 0
        });

        expect(
            result.cycle
                .securities
                .find(
                    item =>
                        item.securityId ===
                        "1002"
                )
                .lastKnownRate
        ).toBe(0);

        expect(
            result.cycle
                .securities
                .find(
                    item =>
                        item.securityId ===
                        "1003"
                )
                .lastKnownRate
        ).toBeNull();

        const securitiesCalls =
            mock.calls.filter(
                call =>
                    call.endpoint ===
                    "GetSecuritiesData"
            );

        expect(
            securitiesCalls.map(
                call =>
                    call.securityIds
            )
        ).toEqual([
            "1001,1002",
            "1003,1004"
        ]);

        for (
            const call of
            securitiesCalls
        ) {
            expect(
                call.responseType
            ).toBe("1");

            expect(
                call.isGto
            ).toBe("true");

            expect(
                call.force
            ).toBe("false");
        }

        expect(
            mock.stats
                .maxActiveSecuritiesRequests
        ).toBe(1);
    }
);

test(
    "Stage 7 propagates mocked securities HTTP failure",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "securitiesHttpFailure"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const message =
            await page.evaluate(
                async () => {
                    try {
                        const universe =
                            await window
                                .MarketFlowUniverseLoader
                                .loadUniverse({
                                    chunkSize:
                                        2,
                                    chunkDelayMs:
                                        0
                                });

                        await window
                            .MarketFlowCycleBuilder
                            .buildCompleteCycle(
                                universe
                            );

                        return null;
                    } catch (error) {
                        return error.message;
                    }
                }
            );

        expect(message).toContain(
            "HTTP 500"
        );
    }
);

test(
    "Stage 7 rejects missing and duplicate securities from mocked responses",
    async ({ browser }) => {
        for (const [
            scenario,
            expected
        ] of [
            [
                "securitiesMissingRecord",
                "chunk mismatch"
            ],
            [
                "securitiesDuplicateKey",
                "duplicate Keys"
            ]
        ]) {
            const page =
                await browser.newPage();

            await installLeumiApiMocks(
                page,
                scenario
            );

            await page.goto(
                "/tests/automation/harness.html"
            );

            const message =
                await page.evaluate(
                    async () => {
                        try {
                            const universe =
                                await window
                                    .MarketFlowUniverseLoader
                                    .loadUniverse({
                                        chunkSize:
                                            2,
                                        chunkDelayMs:
                                            0
                                    });

                            await window
                                .MarketFlowCycleBuilder
                                .buildCompleteCycle(
                                    universe
                                );

                            return null;
                        } catch (error) {
                            return error.message;
                        }
                    }
                );

            expect(message).toContain(
                expected
            );

            await page.close();
        }
    }
);

test(
    "recorder loop starts, avoids overlap, keeps latest state and stops cleanly",
    async ({ page }) => {
        const mock =
            await installLeumiApiMocks(
                page,
                "success",
                {
                    securitiesDelayMs:
                        15
                }
            );

        await page.goto(
            "/tests/automation/harness.html"
        );

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .start({
                        snapshotIntervalMs:
                            5,
                        chunkDelayMs:
                            0,
                        chunkSize:
                            2,
                        refreshUniverseEveryCycle:
                            false
                    });
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .completedCycles >=
                2
        );

        const runningState =
            await page.evaluate(
                () => {
                    const state =
                        window
                            .MarketFlowRecorderLoop
                            .getState();

                    return {
                        isRunning:
                            state.isRunning,
                        completedCycles:
                            state.completedCycles,
                        failedCycles:
                            state.failedCycles,
                        latestRequested:
                            state
                                .latestCycle
                                ?.requested
                    };
                }
            );

        expect(
            runningState.isRunning
        ).toBe(true);

        expect(
            runningState
                .completedCycles
        ).toBeGreaterThanOrEqual(2);

        expect(
            runningState.failedCycles
        ).toBe(0);

        expect(
            runningState
                .latestRequested
        ).toBe(4);

        await page.evaluate(
            () => {
                window
                    .MarketFlowRecorderLoop
                    .stop(
                        "browser-test"
                    );
            }
        );

        await page.waitForFunction(
            () =>
                window
                    .MarketFlowRecorderLoop
                    .getState()
                    .status ===
                "stopped"
        );

        const callsAtStop =
            mock.calls.length;

        await page.waitForTimeout(80);

        const stoppedState =
            await page.evaluate(
                () => {
                    const state =
                        window
                            .MarketFlowRecorderLoop
                            .getState();

                    return {
                        status:
                            state.status,
                        isRunning:
                            state.isRunning,
                        stopReason:
                            state.stopReason,
                        cycleInFlight:
                            state
                                .cycleInFlight
                    };
                }
            );

        expect(
            stoppedState
        ).toEqual({
            status: "stopped",
            isRunning: false,
            stopReason:
                "browser-test",
            cycleInFlight: false
        });

        expect(
            mock.calls.length
        ).toBe(callsAtStop);

        expect(
            mock.stats
                .maxActiveSecuritiesRequests
        ).toBe(1);

        expect(
            mock.calls.filter(
                call =>
                    call.endpoint ===
                    "MapHeat2"
            )
        ).toHaveLength(2);
    }
);
