"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateUniverseForCycle,
    finalizeCompleteCycle,
    runCompleteCycle
} = require(
    "../../recorder/pure/cycle-logic"
);

function createUniverse(
    overrides = {}
) {
    return {
        recordCount: 4,
        securityIds: [
            "1001",
            "1002",
            "1003",
            "1004"
        ],
        chunks: [
            [
                1001,
                1002
            ],
            [
                1003,
                1004
            ]
        ],
        config: {
            chunkDelayMs: 1000
        },
        ...overrides
    };
}

function createChunkResult({
    requestedIds,
    records,
    startedAtMs,
    responseReceivedAtMs,
    completedAtMs,
    serverAsOfDate = null
}) {
    const responseIds =
        records.map(
            record =>
                String(record.Key)
        );

    return {
        requestedIds:
            requestedIds.map(String),
        requestedCount:
            requestedIds.length,
        responseIds,
        receivedCount:
            records.length,
        uniqueCount:
            new Set(
                responseIds
            ).size,
        records,
        serverAsOfDate,
        httpStatus: 200,
        timing: {
            startedAtMs,
            responseReceivedAtMs,
            completedAtMs,
            requestDurationMs:
                responseReceivedAtMs -
                startedAtMs,
            parseDurationMs:
                completedAtMs -
                responseReceivedAtMs,
            durationMs:
                completedAtMs -
                startedAtMs
        }
    };
}

test(
    "validateUniverseForCycle canonicalizes chunks and verifies exact coverage",
    () => {
        const result =
            validateUniverseForCycle(
                createUniverse()
            );

        assert.deepEqual(
            result.securityIds,
            [
                "1001",
                "1002",
                "1003",
                "1004"
            ]
        );

        assert.deepEqual(
            result.chunks,
            [
                [
                    "1001",
                    "1002"
                ],
                [
                    "1003",
                    "1004"
                ]
            ]
        );

        assert.equal(
            result.chunkDelayMs,
            1000
        );
    }
);

test(
    "validateUniverseForCycle rejects universe count mismatch",
    () => {
        assert.throws(
            () =>
                validateUniverseForCycle(
                    createUniverse({
                        recordCount: 5
                    })
                ),
            /recordCount does not match securityIds/
        );
    }
);

test(
    "validateUniverseForCycle rejects duplicate IDs across chunks",
    () => {
        assert.throws(
            () =>
                validateUniverseForCycle(
                    createUniverse({
                        chunks: [
                            [
                                1001,
                                1002
                            ],
                            [
                                1002,
                                1004
                            ]
                        ]
                    })
                ),
            /chunks do not match universe securityIds/
        );
    }
);

test(
    "validateUniverseForCycle rejects a missing chunk",
    () => {
        assert.throws(
            () =>
                validateUniverseForCycle(
                    createUniverse({
                        chunks: [
                            [
                                1001,
                                1002
                            ]
                        ]
                    })
                ),
            /chunks do not match universe securityIds/
        );
    }
);

test(
    "finalizeCompleteCycle creates one validated in-memory cycle",
    () => {
        const universe =
            createUniverse();

        const chunkResults = [
            createChunkResult({
                requestedIds: [
                    1001,
                    1002
                ],
                records: [
                    {
                        Key: 1002,
                        LastKnownRate: 0,
                        BuyLimit1: null
                    },
                    {
                        Key: 1001,
                        LastKnownRate: 1234
                    }
                ],
                startedAtMs: 110,
                responseReceivedAtMs: 140,
                completedAtMs: 145,
                serverAsOfDate:
                    "server-1"
            }),
            createChunkResult({
                requestedIds: [
                    1003,
                    1004
                ],
                records: [
                    {
                        Key: 1004,
                        LastKnownRate: 4567
                    },
                    {
                        Key: 1003,
                        LastKnownRate: null
                    }
                ],
                startedAtMs: 1145,
                responseReceivedAtMs: 1180,
                completedAtMs: 1185,
                serverAsOfDate:
                    "server-2"
            })
        ];

        const cycle =
            finalizeCompleteCycle({
                universe,
                chunkResults,
                startedAtMs: 100,
                completedAtMs: 1190
            });

        assert.equal(
            cycle.status,
            "complete"
        );

        assert.equal(
            cycle.requested,
            4
        );

        assert.equal(
            cycle.received,
            4
        );

        assert.equal(
            cycle.unique,
            4
        );

        assert.equal(
            cycle.missing,
            0
        );

        assert.equal(
            cycle.duplicates,
            0
        );

        assert.equal(
            cycle.durationMs,
            1090
        );

        assert.equal(
            cycle.chunks.length,
            2
        );

        assert.equal(
            cycle.securities.length,
            4
        );

        assert.deepEqual(
            cycle.securities.map(
                item =>
                    item.securityId
            ),
            [
                "1002",
                "1001",
                "1004",
                "1003"
            ]
        );

        assert.equal(
            cycle.securities[0]
                .data
                .LastKnownRate,
            0
        );

        assert.equal(
            cycle.securities[0]
                .data
                .BuyLimit1,
            null
        );

        assert.equal(
            cycle.securities[3]
                .data
                .LastKnownRate,
            null
        );

        assert.equal(
            cycle.securities[0]
                .chunkReceivedAtMs,
            140
        );

        assert.equal(
            cycle.securities[0]
                .collectedAtMs,
            145
        );

        assert.equal(
            cycle.securities[0]
                .serverAsOfDate,
            "server-1"
        );

        assert.equal(
            cycle.securities[2]
                .chunkIndex,
            1
        );
    }
);

test(
    "finalizeCompleteCycle rejects a result bound to the wrong requested chunk",
    () => {
        const universe =
            createUniverse();

        const chunkResults = [
            createChunkResult({
                requestedIds: [
                    1001,
                    1003
                ],
                records: [
                    {
                        Key: 1001
                    },
                    {
                        Key: 1003
                    }
                ],
                startedAtMs: 1,
                responseReceivedAtMs: 2,
                completedAtMs: 3
            }),
            createChunkResult({
                requestedIds: [
                    1002,
                    1004
                ],
                records: [
                    {
                        Key: 1002
                    },
                    {
                        Key: 1004
                    }
                ],
                startedAtMs: 4,
                responseReceivedAtMs: 5,
                completedAtMs: 6
            })
        ];

        assert.throws(
            () =>
                finalizeCompleteCycle({
                    universe,
                    chunkResults,
                    startedAtMs: 0,
                    completedAtMs: 10
                }),
            /requested IDs do not match expected chunk/
        );
    }
);

test(
    "finalizeCompleteCycle rejects a cross-chunk duplicate attempt at the affected chunk boundary",
    () => {
        const universe =
            createUniverse();

        const chunkResults = [
            createChunkResult({
                requestedIds: [
                    1001,
                    1002
                ],
                records: [
                    {
                        Key: 1001
                    },
                    {
                        Key: 1002
                    }
                ],
                startedAtMs: 1,
                responseReceivedAtMs: 2,
                completedAtMs: 3
            }),
            createChunkResult({
                requestedIds: [
                    1003,
                    1004
                ],
                records: [
                    {
                        Key: 1003
                    },
                    {
                        Key: 1002
                    }
                ],
                startedAtMs: 4,
                responseReceivedAtMs: 5,
                completedAtMs: 6
            })
        ];

        assert.throws(
            () =>
                finalizeCompleteCycle({
                    universe,
                    chunkResults,
                    startedAtMs: 0,
                    completedAtMs: 10
                }),
            /response membership does not match requested IDs/
        );
    }
);

test(
    "finalizeCompleteCycle rejects a missing or unexpected ID at the affected chunk boundary",
    () => {
        const universe =
            createUniverse();

        const chunkResults = [
            createChunkResult({
                requestedIds: [
                    1001,
                    1002
                ],
                records: [
                    {
                        Key: 1001
                    },
                    {
                        Key: 1002
                    }
                ],
                startedAtMs: 1,
                responseReceivedAtMs: 2,
                completedAtMs: 3
            }),
            createChunkResult({
                requestedIds: [
                    1003,
                    1004
                ],
                records: [
                    {
                        Key: 1003
                    },
                    {
                        Key: 9999
                    }
                ],
                startedAtMs: 4,
                responseReceivedAtMs: 5,
                completedAtMs: 6
            })
        ];

        assert.throws(
            () =>
                finalizeCompleteCycle({
                    universe,
                    chunkResults,
                    startedAtMs: 0,
                    completedAtMs: 10
                }),
            /response membership does not match requested IDs/
        );
    }
);

test(
    "runCompleteCycle fetches sequentially and delays only between chunks",
    async () => {
        const universe =
            createUniverse();

        const events = [];
        let activeFetches = 0;
        let maxActiveFetches = 0;
        let clock = 100;

        async function fetchChunk(
            requestedIds
        ) {
            activeFetches++;

            maxActiveFetches =
                Math.max(
                    maxActiveFetches,
                    activeFetches
                );

            events.push(
                "fetch:" +
                requestedIds.join(",")
            );

            const startedAtMs =
                clock;

            clock += 10;

            const result =
                createChunkResult({
                    requestedIds,
                    records:
                        requestedIds.map(
                            securityId => ({
                                Key:
                                    Number(
                                        securityId
                                    )
                            })
                        ),
                    startedAtMs,
                    responseReceivedAtMs:
                        clock,
                    completedAtMs:
                        clock + 1
                });

            clock += 1;
            activeFetches--;

            return result;
        }

        async function sleep(ms) {
            events.push(
                "sleep:" + ms
            );

            clock += ms;
        }

        const cycle =
            await runCompleteCycle({
                universe,
                fetchChunk,
                sleep,
                now: () => clock
            });

        assert.equal(
            maxActiveFetches,
            1
        );

        assert.deepEqual(
            events,
            [
                "fetch:1001,1002",
                "sleep:1000",
                "fetch:1003,1004"
            ]
        );

        assert.equal(
            cycle.requested,
            4
        );

        assert.equal(
            cycle.received,
            4
        );
    }
);

test(
    "runCompleteCycle does not sleep when chunkDelayMs is zero",
    async () => {
        const universe =
            createUniverse({
                config: {
                    chunkDelayMs: 0
                }
            });

        let sleepCalls = 0;
        let clock = 0;

        await runCompleteCycle({
            universe,
            fetchChunk:
                async requestedIds => {
                    const startedAtMs =
                        clock++;

                    return createChunkResult({
                        requestedIds,
                        records:
                            requestedIds.map(
                                securityId => ({
                                    Key:
                                        Number(
                                            securityId
                                        )
                                })
                            ),
                        startedAtMs,
                        responseReceivedAtMs:
                            clock++,
                        completedAtMs:
                            clock++
                    });
                },
            sleep: async () => {
                sleepCalls++;
            },
            now: () => clock
        });

        assert.equal(
            sleepCalls,
            0
        );
    }
);

test(
    "runCompleteCycle stops immediately when a chunk fetch fails",
    async () => {
        const universe =
            createUniverse();

        const calls = [];

        await assert.rejects(
            () =>
                runCompleteCycle({
                    universe,
                    fetchChunk:
                        async requestedIds => {
                            calls.push(
                                requestedIds
                                    .join(",")
                            );

                            throw new Error(
                                "synthetic chunk failure"
                            );
                        },
                    sleep:
                        async () => {
                            throw new Error(
                                "sleep must not run after failed first chunk"
                            );
                        },
                    now: () => 100
                }),
            /synthetic chunk failure/
        );

        assert.deepEqual(
            calls,
            [
                "1001,1002"
            ]
        );
    }
);
