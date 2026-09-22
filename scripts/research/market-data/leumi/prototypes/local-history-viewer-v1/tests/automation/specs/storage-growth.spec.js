"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
    test,
    expect
} = require("@playwright/test");

const REPO_ROOT =
    path.resolve(
        __dirname,
        ...Array(9).fill("..")
    );

const SECURITY_SAMPLE =
    JSON.parse(
        fs.readFileSync(
            path.join(
                REPO_ROOT,
                "docs",
                "leumi-api",
                "samples",
                "get-securities-data-record.json"
            ),
            "utf8"
        )
    );

const BENCHMARK = Object.freeze({
    securityCount:
        561,
    measuredCycles:
        20,
    chunkSize:
        187,
    verifiedAverageCycleMs:
        4986
});

async function deleteDatabase(
    page
) {
    await page.evaluate(async () => {
        const databaseName =
            window
                .MarketFlowStorageSchema
                .databaseName;

        await new Promise(
            (resolve, reject) => {
                const request =
                    indexedDB.deleteDatabase(
                        databaseName
                    );

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject(
                        request.error ??
                        new Error(
                            "Failed to delete test database."
                        )
                    );

                request.onblocked =
                    () => reject(
                        new Error(
                            "Test database deletion was blocked."
                        )
                    );
            }
        );
    });
}

test.beforeEach(
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

        await deleteDatabase(
            page
        );

        await page.reload();
    }
);

test.afterEach(
    async ({ page }) => {
        await deleteDatabase(
            page
        );
    }
);

test(
    "Stage 18 measures steady-state IndexedDB history growth in Chromium",
    async ({ page }) => {
        test.setTimeout(
            120000
        );

        const report =
            await page.evaluate(
                async ({
                    securitySample,
                    benchmark
                }) => {
                    const {
                        MarketFlowStorageConnection:
                            connection,
                        MarketFlowStorageUpgrade:
                            upgrade,
                        MarketFlowStorageRead:
                            read,
                        MarketFlowStorageSchema:
                            schema,
                        MarketFlowLifecyclePersistence:
                            lifecycle,
                        MarketFlowSuccessfulCyclePersistence:
                            successful
                    } = window;

                    function delay(
                        ms
                    ) {
                        return new Promise(
                            resolve =>
                                setTimeout(
                                    resolve,
                                    ms
                                )
                        );
                    }

                    async function readStorageEstimate() {
                        if (
                            !navigator.storage ||
                            typeof navigator
                                .storage
                                .estimate !==
                                "function"
                        ) {
                            throw new Error(
                                "navigator.storage.estimate() is unavailable."
                            );
                        }

                        let latest =
                            null;

                        for (
                            let index =
                                0;
                            index < 8;
                            index++
                        ) {
                            latest =
                                await navigator
                                    .storage
                                    .estimate();

                            if (
                                index < 7
                            ) {
                                await delay(
                                    100
                                );
                            }
                        }

                        if (
                            !Number.isFinite(
                                latest?.usage
                            ) ||
                            !Number.isFinite(
                                latest?.quota
                            )
                        ) {
                            throw new Error(
                                "Chromium storage estimate did not return finite usage/quota."
                            );
                        }

                        return {
                            usageBytes:
                                latest.usage,
                            quotaBytes:
                                latest.quota
                        };
                    }

                    function createCycle(
                        cycleNumber
                    ) {
                        const startedAtMs =
                            100000 +
                            cycleNumber *
                                benchmark
                                    .verifiedAverageCycleMs;

                        const completedAtMs =
                            startedAtMs +
                            1000;

                        const chunks =
                            [];

                        for (
                            let start =
                                0,
                                chunkIndex =
                                    0;
                            start <
                                benchmark
                                    .securityCount;
                            start +=
                                benchmark
                                    .chunkSize,
                                chunkIndex++
                        ) {
                            const requested =
                                Math.min(
                                    benchmark
                                        .chunkSize,
                                    benchmark
                                        .securityCount -
                                        start
                                );

                            chunks.push({
                                chunkIndex,
                                requested,
                                received:
                                    requested,
                                unique:
                                    requested,
                                requestStartedAtMs:
                                    startedAtMs +
                                    10 +
                                    chunkIndex,
                                receivedAtMs:
                                    completedAtMs -
                                    30 +
                                    chunkIndex,
                                completedAtMs:
                                    completedAtMs -
                                    20 +
                                    chunkIndex,
                                durationMs:
                                    completedAtMs -
                                    startedAtMs -
                                    40,
                                serverAsOfDate:
                                    "stage18-" +
                                    cycleNumber +
                                    "-" +
                                    chunkIndex,
                                httpStatus:
                                    200
                            });
                        }

                        const securities =
                            Array.from(
                                {
                                    length:
                                        benchmark
                                            .securityCount
                                },
                                (
                                    _,
                                    index
                                ) => {
                                    const securityId =
                                        String(
                                            700000 +
                                            index
                                        );

                                    const chunkIndex =
                                        Math.floor(
                                            index /
                                            benchmark
                                                .chunkSize
                                        );

                                    return {
                                        securityId,
                                        chunkIndex,
                                        chunkReceivedAtMs:
                                            completedAtMs -
                                            30 +
                                            chunkIndex,
                                        collectedAtMs:
                                            completedAtMs -
                                            10 +
                                            chunkIndex,
                                        serverAsOfDate:
                                            "stage18-" +
                                            cycleNumber +
                                            "-" +
                                            chunkIndex,
                                        data: {
                                            ...securitySample,
                                            Key:
                                                securityId,
                                            LastKnownRate:
                                                (
                                                    securitySample
                                                        .LastKnownRate ??
                                                    0
                                                ) +
                                                cycleNumber +
                                                index %
                                                    7
                                        }
                                    };
                                }
                            );

                        return {
                            status:
                                "complete",
                            startedAtMs,
                            completedAtMs,
                            durationMs:
                                completedAtMs -
                                startedAtMs,
                            requested:
                                benchmark
                                    .securityCount,
                            received:
                                benchmark
                                    .securityCount,
                            unique:
                                benchmark
                                    .securityCount,
                            missing:
                                0,
                            duplicates:
                                0,
                            chunks,
                            securities
                        };
                    }

                    async function commitCycle(
                        database,
                        cycleNumber
                    ) {
                        const cycle =
                            createCycle(
                                cycleNumber
                            );

                        return await successful
                            .commitSuccessfulCycle(
                                database,
                                {
                                    instanceId:
                                        "stage18-storage-growth",
                                    cycle,
                                    committedAtMs:
                                        cycle
                                            .completedAtMs +
                                        10
                                }
                            );
                    }

                    let database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    try {
                        await lifecycle
                            .startSession(
                                database,
                                {
                                    instanceId:
                                        "stage18-storage-growth",
                                    startedAtMs:
                                        1000,
                                    config: {
                                        snapshotIntervalMs:
                                            benchmark
                                                .verifiedAverageCycleMs,
                                        chunkDelayMs:
                                            0,
                                        chunkSize:
                                            benchmark
                                                .chunkSize,
                                        refreshUniverseEveryCycle:
                                            false
                                    },
                                    initialUniverseCount:
                                        benchmark
                                            .securityCount
                                }
                            );

                        await commitCycle(
                            database,
                            0
                        );
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }

                    const before =
                        await readStorageEstimate();

                    database =
                        await connection
                            .openDatabase({
                                onUpgradeNeeded:
                                    upgrade
                                        .upgradeDatabase
                            });

                    let historyBefore =
                        null;

                    let historyAfter =
                        null;

                    try {
                        historyBefore =
                            await read.count(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );

                        for (
                            let cycleNumber =
                                1;
                            cycleNumber <=
                                benchmark
                                    .measuredCycles;
                            cycleNumber++
                        ) {
                            await commitCycle(
                                database,
                                cycleNumber
                            );
                        }

                        historyAfter =
                            await read.count(
                                database,
                                schema
                                    .stores
                                    .history
                                    .name
                            );
                    } finally {
                        connection
                            .closeDatabase(
                                database
                            );
                    }

                    const after =
                        await readStorageEstimate();

                    const rowsAdded =
                        historyAfter -
                        historyBefore;

                    const storageDeltaBytes =
                        after.usageBytes -
                        before.usageBytes;

                    const bytesPerHistoryRow =
                        storageDeltaBytes /
                        rowsAdded;

                    const cyclesPerMinute =
                        60000 /
                        benchmark
                            .verifiedAverageCycleMs;

                    const rowsPerMinute =
                        benchmark
                            .securityCount *
                        cyclesPerMinute;

                    const bytesPerMinute =
                        rowsPerMinute *
                        bytesPerHistoryRow;

                    const mibPerMinute =
                        bytesPerMinute /
                        (
                            1024 *
                            1024
                        );

                    const freeBytes =
                        Math.max(
                            0,
                            after.quotaBytes -
                            after.usageBytes
                        );

                    const hoursUntilQuota =
                        freeBytes /
                        bytesPerMinute /
                        60;

                    return {
                        benchmark,
                        before,
                        after,
                        historyBefore,
                        historyAfter,
                        rowsAdded,
                        storageDeltaBytes,
                        bytesPerHistoryRow,
                        cyclesPerMinute,
                        rowsPerMinute,
                        bytesPerMinute,
                        mibPerMinute,
                        freeBytes,
                        hoursUntilQuota
                    };
                },
                {
                    securitySample:
                        SECURITY_SAMPLE,
                    benchmark:
                        BENCHMARK
                }
            );

        expect(
            report.historyBefore
        ).toBe(
            BENCHMARK.securityCount
        );

        expect(
            report.rowsAdded
        ).toBe(
            BENCHMARK.securityCount *
            BENCHMARK.measuredCycles
        );

        expect(
            report.historyAfter
        ).toBe(
            BENCHMARK.securityCount *
            (
                BENCHMARK.measuredCycles +
                1
            )
        );

        expect(
            report.storageDeltaBytes
        ).toBeGreaterThan(0);

        expect(
            report.bytesPerHistoryRow
        ).toBeGreaterThan(0);

        expect(
            report.rowsPerMinute
        ).toBeGreaterThan(0);

        expect(
            report.mibPerMinute
        ).toBeGreaterThan(0);

        expect(
            report.hoursUntilQuota
        ).toBeGreaterThan(0);

        console.log(
            "STAGE18_STORAGE_GROWTH " +
            JSON.stringify(
                report
            )
        );
    }
);
