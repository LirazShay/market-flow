"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    ENDPOINT,
    normalizeSecurityIds,
    buildGetSecuritiesDataUrl,
    extractSecuritiesTable,
    validateResponseKeys,
    validateTiming,
    buildChunkResult
} = require(
    "../../recorder/pure/securities-chunk-logic"
);

function createResponse(
    securities,
    asOfDate = "fixture-as-of-date"
) {
    return {
        data: {
            SecuritiesData: {
                Table: {
                    AsOfDate: asOfDate,
                    Security: securities
                }
            }
        }
    };
}

test(
    "GetSecuritiesData endpoint remains relative and same-origin",
    () => {
        assert.equal(
            ENDPOINT,
            "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData"
        );
    }
);

test(
    "normalizeSecurityIds canonicalizes values to strings and preserves order",
    () => {
        assert.deepEqual(
            [
                ...normalizeSecurityIds(
                    [
                        1001,
                        "1002",
                        1003
                    ]
                )
            ],
            [
                "1001",
                "1002",
                "1003"
            ]
        );
    }
);

for (const value of [
    null,
    undefined,
    ""
]) {
    test(
        "normalizeSecurityIds rejects invalid item: " +
        String(value),
        () => {
            assert.throws(
                () =>
                    normalizeSecurityIds([
                        1001,
                        value
                    ]),
                /invalid value at index 1/
            );
        }
    );
}

test(
    "normalizeSecurityIds rejects an empty chunk",
    () => {
        assert.throws(
            () =>
                normalizeSecurityIds([]),
            {
                name: "TypeError",
                message:
                    "securityIds must be a non-empty array."
            }
        );
    }
);

test(
    "normalizeSecurityIds rejects duplicates after canonicalization",
    () => {
        assert.throws(
            () =>
                normalizeSecurityIds([
                    1001,
                    "1001"
                ]),
            {
                message:
                    "securityIds contains duplicates after canonicalization. Total=2, unique=1."
            }
        );
    }
);

test(
    "buildGetSecuritiesDataUrl uses observed query contract",
    () => {
        const url =
            new URL(
                buildGetSecuritiesDataUrl([
                    1001,
                    1002,
                    1003
                ]),
                "https://example.invalid"
            );

        assert.equal(
            url.pathname,
            ENDPOINT
        );

        assert.equal(
            url.searchParams.get(
                "securityIds"
            ),
            "1001,1002,1003"
        );

        assert.equal(
            url.searchParams.get(
                "responseType"
            ),
            "1"
        );

        assert.equal(
            url.searchParams.get(
                "is_gto"
            ),
            "true"
        );

        assert.equal(
            url.searchParams.get(
                "force"
            ),
            "false"
        );
    }
);

test(
    "extractSecuritiesTable returns the documented table",
    () => {
        const table =
            extractSecuritiesTable(
                createResponse([
                    {
                        Key: 1001
                    }
                ])
            );

        assert.equal(
            table.AsOfDate,
            "fixture-as-of-date"
        );

        assert.equal(
            table.Security.length,
            1
        );
    }
);

for (const response of [
    null,
    {},
    {
        data: {}
    },
    {
        data: {
            SecuritiesData: {}
        }
    }
]) {
    test(
        "extractSecuritiesTable rejects a missing table",
        () => {
            assert.throws(
                () =>
                    extractSecuritiesTable(
                        response
                    ),
                /missing data\.SecuritiesData\.Table/
            );
        }
    );
}

test(
    "extractSecuritiesTable rejects non-array Security",
    () => {
        assert.throws(
            () =>
                extractSecuritiesTable({
                    data: {
                        SecuritiesData: {
                            Table: {
                                Security: {}
                            }
                        }
                    }
                }),
            /Security must be an array/
        );
    }
);

test(
    "validateResponseKeys accepts response order that differs from request order",
    () => {
        const result =
            validateResponseKeys(
                [
                    "1001",
                    "1002"
                ],
                [
                    {
                        Key: 1002
                    },
                    {
                        Key: 1001
                    }
                ]
            );

        assert.deepEqual(
            [
                ...result.responseIds
            ],
            [
                "1002",
                "1001"
            ]
        );

        assert.equal(
            result.uniqueCount,
            2
        );
    }
);

test(
    "validateResponseKeys rejects records without Key",
    () => {
        assert.throws(
            () =>
                validateResponseKeys(
                    [
                        "1001",
                        "1002"
                    ],
                    [
                        {
                            Key: 1001
                        },
                        {}
                    ]
                ),
            /records without Key/
        );
    }
);

test(
    "validateResponseKeys rejects duplicate Keys",
    () => {
        assert.throws(
            () =>
                validateResponseKeys(
                    [
                        "1001",
                        "1002"
                    ],
                    [
                        {
                            Key: 1001
                        },
                        {
                            Key: 1001
                        }
                    ]
                ),
            /duplicate Keys/
        );
    }
);

test(
    "validateResponseKeys reports missing IDs",
    () => {
        assert.throws(
            () =>
                validateResponseKeys(
                    [
                        "1001",
                        "1002"
                    ],
                    [
                        {
                            Key: 1001
                        }
                    ]
                ),
            /missing=\[1002\]/
        );
    }
);

test(
    "validateResponseKeys reports unexpected IDs",
    () => {
        assert.throws(
            () =>
                validateResponseKeys(
                    [
                        "1001"
                    ],
                    [
                        {
                            Key: 1001
                        },
                        {
                            Key: 9999
                        }
                    ]
                ),
            /unexpected=\[9999\]/
        );
    }
);

test(
    "validateTiming derives request parse and total durations",
    () => {
        assert.deepEqual(
            validateTiming({
                startedAtMs: 100,
                responseReceivedAtMs: 140,
                completedAtMs: 150
            }),
            {
                startedAtMs: 100,
                responseReceivedAtMs: 140,
                completedAtMs: 150,
                requestDurationMs: 40,
                parseDurationMs: 10,
                durationMs: 50
            }
        );
    }
);

test(
    "validateTiming rejects timestamps out of order",
    () => {
        assert.throws(
            () =>
                validateTiming({
                    startedAtMs: 100,
                    responseReceivedAtMs: 90,
                    completedAtMs: 110
                }),
            /cannot be earlier/
        );

        assert.throws(
            () =>
                validateTiming({
                    startedAtMs: 100,
                    responseReceivedAtMs: 110,
                    completedAtMs: 109
                }),
            /cannot be earlier/
        );
    }
);

test(
    "buildChunkResult validates completeness and preserves raw null and zero values",
    () => {
        const responseJson =
            createResponse([
                {
                    Key: 1002,
                    LastKnownRate: 0,
                    BuyLimit1: null
                },
                {
                    Key: 1001,
                    LastKnownRate: 1234,
                    BuyLimit1: 1230
                }
            ]);

        const result =
            buildChunkResult({
                securityIds: [
                    1001,
                    1002
                ],
                responseJson,
                httpStatus: 200,
                timing: {
                    startedAtMs: 1000,
                    responseReceivedAtMs: 1050,
                    completedAtMs: 1055
                }
            });

        assert.equal(
            result.requestedCount,
            2
        );

        assert.equal(
            result.receivedCount,
            2
        );

        assert.equal(
            result.uniqueCount,
            2
        );

        assert.equal(
            result.serverAsOfDate,
            "fixture-as-of-date"
        );

        assert.equal(
            result.httpStatus,
            200
        );

        assert.equal(
            result.records[0]
                .LastKnownRate,
            0
        );

        assert.equal(
            result.records[0]
                .BuyLimit1,
            null
        );

        assert.equal(
            result.timing.durationMs,
            55
        );
    }
);

test(
    "buildChunkResult preserves a missing AsOfDate as null",
    () => {
        const result =
            buildChunkResult({
                securityIds: [
                    1001
                ],
                responseJson: {
                    data: {
                        SecuritiesData: {
                            Table: {
                                Security: [
                                    {
                                        Key: 1001
                                    }
                                ]
                            }
                        }
                    }
                },
                timing: {
                    startedAtMs: 1,
                    responseReceivedAtMs: 2,
                    completedAtMs: 3
                }
            });

        assert.equal(
            result.serverAsOfDate,
            null
        );
    }
);
