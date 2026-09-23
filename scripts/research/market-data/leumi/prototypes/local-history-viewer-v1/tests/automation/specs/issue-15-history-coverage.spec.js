"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const analyzerPath = path.resolve(
    process.cwd(),
    "../../../../momentum-ranking-v1/issue-15-history-coverage/history-coverage-analyzer.js"
);

const analyzerSource = fs.readFileSync(
    analyzerPath,
    "utf8"
);

async function createDatabase(
    page,
    dbName,
    rows
) {
    await page.evaluate(
        ({ dbName, rows }) =>
            new Promise(
                (resolve, reject) => {
                    const request =
                        indexedDB.open(
                            dbName,
                            1
                        );

                    request.onupgradeneeded =
                        () => {
                            const database =
                                request.result;

                            const history =
                                database.createObjectStore(
                                    "history",
                                    {
                                        keyPath: [
                                            "cycleId",
                                            "securityId"
                                        ]
                                    }
                                );

                            history.createIndex(
                                "bySecurityTime",
                                [
                                    "securityId",
                                    "collectedAtMs"
                                ],
                                {
                                    unique: false
                                }
                            );
                        };

                    request.onerror =
                        () =>
                            reject(
                                request.error
                            );

                    request.onsuccess =
                        () => {
                            const database =
                                request.result;

                            const transaction =
                                database.transaction(
                                    "history",
                                    "readwrite"
                                );

                            const store =
                                transaction.objectStore(
                                    "history"
                                );

                            for (
                                const row of rows
                            ) {
                                store.add(
                                    row
                                );
                            }

                            transaction.oncomplete =
                                () => {
                                    database.close();
                                    resolve();
                                };

                            transaction.onerror =
                                () =>
                                    reject(
                                        transaction.error
                                    );

                            transaction.onabort =
                                () =>
                                    reject(
                                        transaction.error
                                    );
                        };
                }
            ),
        {
            dbName,
            rows
        }
    );
}

async function readAllHistory(
    page,
    dbName
) {
    return page.evaluate(
        dbName =>
            new Promise(
                (resolve, reject) => {
                    const request =
                        indexedDB.open(
                            dbName
                        );

                    request.onerror =
                        () =>
                            reject(
                                request.error
                            );

                    request.onsuccess =
                        () => {
                            const database =
                                request.result;

                            const transaction =
                                database.transaction(
                                    "history",
                                    "readonly"
                                );

                            const getAll =
                                transaction
                                    .objectStore(
                                        "history"
                                    )
                                    .getAll();

                            let rows;

                            getAll.onsuccess =
                                () => {
                                    rows =
                                        getAll.result;
                                };

                            getAll.onerror =
                                () =>
                                    reject(
                                        getAll.error
                                    );

                            transaction.oncomplete =
                                () => {
                                    database.close();
                                    resolve(
                                        rows
                                    );
                                };

                            transaction.onerror =
                                () =>
                                    reject(
                                        transaction.error
                                    );
                        };
                }
            ),
        dbName
    );
}

test(
    "Issue #15 history coverage analyzer scans IndexedDB read-only with session-aware horizon semantics",
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

        const dbName =
            "market-flow-issue15-browser-" +
            Date.now();

        const rows = [
            {
                cycleId: 1,
                securityId: "A",
                sessionId: 1,
                collectedAtMs: 0,
                data: {
                    marker: "unchanged-a1"
                }
            },
            {
                cycleId: 2,
                securityId: "A",
                sessionId: 1,
                collectedAtMs: 4900,
                data: {
                    marker: "unchanged-a2"
                }
            },
            {
                cycleId: 3,
                securityId: "A",
                sessionId: 1,
                collectedAtMs: 10100,
                data: {
                    marker: "unchanged-a3"
                }
            },
            {
                cycleId: 4,
                securityId: "A",
                sessionId: 1,
                collectedAtMs: 15000,
                data: {
                    marker: "unchanged-a4"
                }
            },
            {
                cycleId: 5,
                securityId: "A",
                sessionId: 2,
                collectedAtMs: 100000,
                data: {
                    marker: "unchanged-a5"
                }
            },
            {
                cycleId: 6,
                securityId: "A",
                sessionId: 2,
                collectedAtMs: 104000,
                data: {
                    marker: "unchanged-a6"
                }
            },
            {
                cycleId: 7,
                securityId: "B",
                sessionId: 3,
                collectedAtMs: 200000,
                data: {
                    marker: "unchanged-b1"
                }
            },
            {
                cycleId: 8,
                securityId: "B",
                sessionId: 3,
                collectedAtMs: 202000,
                data: {
                    marker: "unchanged-b2"
                }
            },
            {
                cycleId: 9,
                securityId: "B",
                sessionId: 3,
                collectedAtMs: 205000,
                data: {
                    marker: "unchanged-b3"
                }
            }
        ];

        await createDatabase(
            page,
            dbName,
            rows
        );

        const before =
            await readAllHistory(
                page,
                dbName
            );

        await page.addScriptTag({
            content:
                analyzerSource
        });

        const report =
            await page.evaluate(
                async dbName =>
                    window
                        .MarketFlowIssue15HistoryCoverage
                        .run({
                            dbName,
                            horizonsSec: [
                                5,
                                10
                            ],
                            onProgress: null
                        }),
                dbName
            );

        expect(
            report.integrity
                .historyStoreRowCount
        ).toBe(
            rows.length
        );

        expect(
            report.integrity
                .indexedHistoryRowCount
        ).toBe(
            rows.length
        );

        expect(
            report.integrity
                .indexCoverageExact
        ).toBe(
            true
        );

        expect(
            report.integrity
                .securityCount
        ).toBe(
            2
        );

        expect(
            report.integrity
                .sessionGroupCount
        ).toBe(
            3
        );

        expect(
            report.semantics
                .toleranceApplied
        ).toBe(
            false
        );

        expect(
            report.horizons["5"]
                .strictEvaluableCount
        ).toBe(
            2
        );

        expect(
            report.horizons["5"]
                .sessionEdgeCensoredCount
        ).toBe(
            5
        );

        expect(
            report.horizons["10"]
                .strictEvaluableCount
        ).toBe(
            2
        );

        expect(
            report.cadence
                .interObservationDeltaMs
                .count
        ).toBe(
            6
        );

        const after =
            await readAllHistory(
                page,
                dbName
            );

        expect(
            after
        ).toEqual(
            before
        );

        await page.evaluate(
            dbName =>
                new Promise(
                    (resolve, reject) => {
                        const request =
                            indexedDB.deleteDatabase(
                                dbName
                            );

                        request.onsuccess =
                            () =>
                                resolve();

                        request.onerror =
                            () =>
                                reject(
                                    request.error
                                );

                        request.onblocked =
                            () =>
                                reject(
                                    new Error(
                                        "Synthetic database cleanup was blocked."
                                    )
                                );
                    }
                ),
            dbName
        );
    }
);

test(
    "Issue #15 analyzer refuses to create a missing database",
    async ({ page }) => {
        await page.goto(
            "/tests/automation/harness.html"
        );

        await page.addScriptTag({
            content:
                analyzerSource
        });

        const dbName =
            "market-flow-issue15-missing-" +
            Date.now();

        const result =
            await page.evaluate(
                async dbName => {
                    try {
                        await window
                            .MarketFlowIssue15HistoryCoverage
                            .run({
                                dbName,
                                horizonsSec: [
                                    5
                                ]
                            });

                        return {
                            message: null
                        };
                    } catch (error) {
                        return {
                            message:
                                error?.message ??
                                String(error)
                        };
                    }
                },
                dbName
            );

        expect(
            result.message
        ).toContain(
            "refuses to create/upgrade"
        );

        const databases =
            await page.evaluate(
                () =>
                    indexedDB.databases()
            );

        expect(
            databases.some(
                database =>
                    database.name ===
                    dbName
            )
        ).toBe(
            false
        );
    }
);
