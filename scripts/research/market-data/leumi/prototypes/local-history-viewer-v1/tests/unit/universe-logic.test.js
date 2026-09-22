"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildMapHeatUrl,
    createChunks,
    validatePaperIds,
    validateRecordCount,
    validateFullMap
} = require(
    "../../recorder/pure/universe-logic"
);

function parseRelativeUrl(value) {
    return new URL(
        value,
        "https://example.invalid"
    );
}

test(
    "buildMapHeatUrl uses the expected relative endpoint and requested pageCount",
    () => {
        const url = parseRelativeUrl(
            buildMapHeatUrl(321)
        );

        assert.equal(
            url.pathname,
            "/lti/lti-app/api/MarketFast/MapHeat2"
        );

        assert.equal(
            url.searchParams.get(
                "page"
            ),
            "1"
        );

        assert.equal(
            url.searchParams.get(
                "pageCount"
            ),
            "321"
        );

        assert.equal(
            url.searchParams.get(
                "orderFieldName"
            ),
            "DailyNumDeals"
        );

        assert.equal(
            url.searchParams.get(
                "order"
            ),
            "DESC"
        );

        assert.equal(
            url.searchParams.get(
                "rt"
            ),
            "true"
        );
    }
);

test(
    "buildMapHeatUrl does not hardcode the observed universe size",
    () => {
        const first = parseRelativeUrl(
            buildMapHeatUrl(4)
        );

        const second = parseRelativeUrl(
            buildMapHeatUrl(999)
        );

        assert.equal(
            first.searchParams.get(
                "pageCount"
            ),
            "4"
        );

        assert.equal(
            second.searchParams.get(
                "pageCount"
            ),
            "999"
        );
    }
);

test(
    "createChunks returns an empty list for an empty input",
    () => {
        assert.deepEqual(
            createChunks([], 3),
            []
        );
    }
);

test(
    "createChunks keeps an exact boundary in one chunk",
    () => {
        assert.deepEqual(
            createChunks(
                [1, 2, 3],
                3
            ),
            [
                [1, 2, 3]
            ]
        );
    }
);

test(
    "createChunks preserves order and remainder",
    () => {
        assert.deepEqual(
            createChunks(
                [1, 2, 3, 4, 5],
                2
            ),
            [
                [1, 2],
                [3, 4],
                [5]
            ]
        );
    }
);

test(
    "createChunks supports chunkSize larger than the input",
    () => {
        assert.deepEqual(
            createChunks(
                [10, 20],
                187
            ),
            [
                [10, 20]
            ]
        );
    }
);

test(
    "validatePaperIds preserves raw IDs and returns canonical string IDs",
    () => {
        const result =
            validatePaperIds([
                {
                    PaperId: 1001
                },
                {
                    PaperId: "1002"
                }
            ]);

        assert.deepEqual(
            result.paperIds,
            [
                1001,
                "1002"
            ]
        );

        assert.deepEqual(
            result.securityIds,
            [
                "1001",
                "1002"
            ]
        );
    }
);

test(
    "validatePaperIds preserves input order",
    () => {
        const result =
            validatePaperIds([
                {
                    PaperId: 30
                },
                {
                    PaperId: 10
                },
                {
                    PaperId: 20
                }
            ]);

        assert.deepEqual(
            result.securityIds,
            [
                "30",
                "10",
                "20"
            ]
        );
    }
);

for (const [
    badValue,
    expectedIndex
] of [
    [
        null,
        1
    ],
    [
        undefined,
        1
    ],
    [
        "",
        1
    ]
]) {
    test(
        "validatePaperIds rejects missing PaperId value: " +
        String(badValue),
        () => {
            assert.throws(
                () =>
                    validatePaperIds([
                        {
                            PaperId: 1001
                        },
                        {
                            PaperId: badValue
                        }
                    ]),
                error => {
                    assert.match(
                        error.message,
                        /without PaperId/
                    );

                    assert.match(
                        error.message,
                        new RegExp(
                            "Invalid record indexes: " +
                            expectedIndex
                        )
                    );

                    return true;
                }
            );
        }
    );
}

test(
    "validatePaperIds reports every invalid record index",
    () => {
        assert.throws(
            () =>
                validatePaperIds([
                    {
                        PaperId: null
                    },
                    {
                        PaperId: 1001
                    },
                    {},
                    {
                        PaperId: ""
                    }
                ]),
            {
                message:
                    "MapHeat2 contains records without PaperId. Invalid record indexes: 0, 2, 3"
            }
        );
    }
);

test(
    "validatePaperIds rejects duplicate numeric IDs",
    () => {
        assert.throws(
            () =>
                validatePaperIds([
                    {
                        PaperId: 1001
                    },
                    {
                        PaperId: 1001
                    }
                ]),
            {
                message:
                    "MapHeat2 contains duplicate PaperIds. Total=2, unique=1."
            }
        );
    }
);

test(
    "validatePaperIds rejects duplicates after canonical string conversion",
    () => {
        assert.throws(
            () =>
                validatePaperIds([
                    {
                        PaperId: 1001
                    },
                    {
                        PaperId: "1001"
                    }
                ]),
            {
                message:
                    "MapHeat2 contains duplicate PaperIds. Total=2, unique=1."
            }
        );
    }
);

for (const value of [
    1,
    561,
    9999
]) {
    test(
        "validateRecordCount accepts positive integer: " +
        value,
        () => {
            assert.equal(
                validateRecordCount(
                    value
                ),
                value
            );
        }
    );
}

for (const value of [
    0,
    -1,
    1.5,
    "561",
    null,
    undefined
]) {
    test(
        "validateRecordCount rejects invalid value: " +
        String(value),
        () => {
            assert.throws(
                () =>
                    validateRecordCount(
                        value
                    ),
                {
                    message:
                        "MapHeat2 returned invalid recordCount: " +
                        value
                }
            );
        }
    );
}

test(
    "validateFullMap accepts a complete matching universe",
    () => {
        const map = {
            recordCount: 2,
            records: [
                {
                    PaperId: 1
                },
                {
                    PaperId: 2
                }
            ]
        };

        assert.equal(
            validateFullMap(
                map,
                2
            ),
            map
        );
    }
);

for (const map of [
    {},
    {
        recordCount: 1
    },
    {
        recordCount: 1,
        records: null
    },
    {
        recordCount: 1,
        records: {}
    }
]) {
    test(
        "validateFullMap rejects missing/non-array records",
        () => {
            assert.throws(
                () =>
                    validateFullMap(
                        map,
                        1
                    ),
                {
                    message:
                        "MapHeat2 full response does not contain records[]."
                }
            );
        }
    );
}

test(
    "validateFullMap rejects recordCount changing between requests",
    () => {
        assert.throws(
            () =>
                validateFullMap(
                    {
                        recordCount: 3,
                        records: [
                            {},
                            {},
                            {}
                        ]
                    },
                    2
                ),
            {
                message:
                    "MapHeat2 recordCount changed during universe load. Initial=2, full=3."
            }
        );
    }
);

test(
    "validateFullMap rejects incomplete records array",
    () => {
        assert.throws(
            () =>
                validateFullMap(
                    {
                        recordCount: 3,
                        records: [
                            {},
                            {}
                        ]
                    },
                    3
                ),
            {
                message:
                    "MapHeat2 universe is incomplete. Expected 3 records, received 2."
            }
        );
    }
);
