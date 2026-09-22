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
        root.MarketFlowCycleLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        function canonicalizeIds(
            values,
            name
        ) {
            if (
                !Array.isArray(values) ||
                values.length === 0
            ) {
                throw new TypeError(
                    name +
                    " must be a non-empty array."
                );
            }

            return values.map(
                (value, index) => {
                    if (
                        value === null ||
                        value === undefined ||
                        value === ""
                    ) {
                        throw new TypeError(
                            name +
                            " contains an invalid value at index " +
                            index +
                            "."
                        );
                    }

                    return String(value);
                }
            );
        }

        function arraysEqual(
            left,
            right
        ) {
            if (
                left.length !==
                right.length
            ) {
                return false;
            }

            for (
                let index = 0;
                index < left.length;
                index++
            ) {
                if (
                    left[index] !==
                    right[index]
                ) {
                    return false;
                }
            }

            return true;
        }

        function validateUniverseForCycle(
            universe
        ) {
            const securityIds =
                canonicalizeIds(
                    universe?.securityIds,
                    "universe.securityIds"
                );

            if (
                !Number.isInteger(
                    universe?.recordCount
                ) ||
                universe.recordCount <= 0
            ) {
                throw new Error(
                    "Universe recordCount must be a positive integer."
                );
            }

            if (
                universe.recordCount !==
                securityIds.length
            ) {
                throw new Error(
                    "Universe recordCount does not match securityIds. " +
                    "recordCount=" +
                    universe.recordCount +
                    ", securityIds=" +
                    securityIds.length +
                    "."
                );
            }

            const uniqueSecurityIds =
                new Set(
                    securityIds
                );

            if (
                uniqueSecurityIds.size !==
                securityIds.length
            ) {
                throw new Error(
                    "Universe securityIds contains duplicates."
                );
            }

            if (
                !Array.isArray(
                    universe?.chunks
                ) ||
                universe.chunks.length === 0
            ) {
                throw new Error(
                    "Universe chunks must be a non-empty array."
                );
            }

            const chunks =
                universe.chunks.map(
                    (chunk, chunkIndex) =>
                        canonicalizeIds(
                            chunk,
                            "universe.chunks[" +
                            chunkIndex +
                            "]"
                        )
                );

            const flattenedChunkIds =
                chunks.flat();

            if (
                !arraysEqual(
                    flattenedChunkIds,
                    securityIds
                )
            ) {
                throw new Error(
                    "Universe chunks do not match universe securityIds exactly."
                );
            }

            const chunkDelayMs =
                universe
                    ?.config
                    ?.chunkDelayMs;

            if (
                !Number.isInteger(
                    chunkDelayMs
                ) ||
                chunkDelayMs < 0
            ) {
                throw new Error(
                    "Universe config.chunkDelayMs must be a non-negative integer."
                );
            }

            return Object.freeze({
                recordCount:
                    universe.recordCount,
                securityIds:
                    Object.freeze([
                        ...securityIds
                    ]),
                chunks:
                    Object.freeze(
                        chunks.map(
                            chunk =>
                                Object.freeze([
                                    ...chunk
                                ])
                        )
                    ),
                chunkDelayMs
            });
        }

        function validateCycleTimes(
            startedAtMs,
            completedAtMs
        ) {
            if (
                !Number.isFinite(
                    startedAtMs
                ) ||
                startedAtMs < 0
            ) {
                throw new TypeError(
                    "Cycle startedAtMs must be a non-negative finite number."
                );
            }

            if (
                !Number.isFinite(
                    completedAtMs
                ) ||
                completedAtMs < 0
            ) {
                throw new TypeError(
                    "Cycle completedAtMs must be a non-negative finite number."
                );
            }

            if (
                completedAtMs <
                startedAtMs
            ) {
                throw new Error(
                    "Cycle completedAtMs cannot be earlier than startedAtMs."
                );
            }
        }

        function finalizeCompleteCycle({
            universe,
            chunkResults,
            startedAtMs,
            completedAtMs
        }) {
            const validatedUniverse =
                validateUniverseForCycle(
                    universe
                );

            validateCycleTimes(
                startedAtMs,
                completedAtMs
            );

            if (
                !Array.isArray(
                    chunkResults
                )
            ) {
                throw new TypeError(
                    "chunkResults must be an array."
                );
            }

            if (
                chunkResults.length !==
                validatedUniverse
                    .chunks
                    .length
            ) {
                throw new Error(
                    "Cycle chunk count mismatch. Expected " +
                    validatedUniverse
                        .chunks
                        .length +
                    ", received " +
                    chunkResults.length +
                    "."
                );
            }

            const cycleChunks = [];
            const securities = [];
            const receivedIds = [];

            for (
                let chunkIndex = 0;
                chunkIndex <
                chunkResults.length;
                chunkIndex++
            ) {
                const result =
                    chunkResults[
                        chunkIndex
                    ];

                const expectedChunk =
                    validatedUniverse
                        .chunks[
                            chunkIndex
                        ];

                const requestedIds =
                    canonicalizeIds(
                        result?.requestedIds,
                        "chunkResults[" +
                        chunkIndex +
                        "].requestedIds"
                    );

                if (
                    !arraysEqual(
                        requestedIds,
                        expectedChunk
                    )
                ) {
                    throw new Error(
                        "Chunk " +
                        chunkIndex +
                        " requested IDs do not match expected chunk."
                    );
                }

                if (
                    !Array.isArray(
                        result?.records
                    )
                ) {
                    throw new Error(
                        "Chunk " +
                        chunkIndex +
                        " records must be an array."
                    );
                }

                if (
                    result.records.length !==
                    expectedChunk.length
                ) {
                    throw new Error(
                        "Chunk " +
                        chunkIndex +
                        " record count mismatch. Expected " +
                        expectedChunk.length +
                        ", received " +
                        result.records.length +
                        "."
                    );
                }

                const chunkResponseIds = [];

                for (
                    let recordIndex = 0;
                    recordIndex <
                    result.records.length;
                    recordIndex++
                ) {
                    const record =
                        result.records[
                            recordIndex
                        ];

                    const key =
                        record?.Key;

                    if (
                        key === null ||
                        key === undefined ||
                        key === ""
                    ) {
                        throw new Error(
                            "Chunk " +
                            chunkIndex +
                            " contains a record without Key at index " +
                            recordIndex +
                            "."
                        );
                    }

                    const securityId =
                        String(key);

                    chunkResponseIds.push(
                        securityId
                    );

                    receivedIds.push(
                        securityId
                    );

                    securities.push(
                        Object.freeze({
                            securityId,
                            chunkIndex,
                            chunkReceivedAtMs:
                                result
                                    .timing
                                    ?.responseReceivedAtMs,
                            collectedAtMs:
                                result
                                    .timing
                                    ?.completedAtMs,
                            serverAsOfDate:
                                result
                                    .serverAsOfDate ??
                                null,
                            data:
                                record
                        })
                    );
                }

                const chunkUnique =
                    new Set(
                        chunkResponseIds
                    );

                if (
                    chunkUnique.size !==
                    chunkResponseIds.length
                ) {
                    throw new Error(
                        "Chunk " +
                        chunkIndex +
                        " contains duplicate security Keys."
                    );
                }

                const expectedSet =
                    new Set(
                        expectedChunk
                    );

                if (
                    chunkResponseIds.some(
                        securityId =>
                            !expectedSet.has(
                                securityId
                            )
                    ) ||
                    expectedChunk.some(
                        securityId =>
                            !chunkUnique.has(
                                securityId
                            )
                    )
                ) {
                    throw new Error(
                        "Chunk " +
                        chunkIndex +
                        " response membership does not match requested IDs."
                    );
                }

                cycleChunks.push(
                    Object.freeze({
                        chunkIndex,
                        requested:
                            expectedChunk
                                .length,
                        received:
                            result.records
                                .length,
                        unique:
                            chunkUnique
                                .size,
                        requestStartedAtMs:
                            result
                                .timing
                                ?.startedAtMs,
                        receivedAtMs:
                            result
                                .timing
                                ?.responseReceivedAtMs,
                        completedAtMs:
                            result
                                .timing
                                ?.completedAtMs,
                        durationMs:
                            result
                                .timing
                                ?.durationMs,
                        serverAsOfDate:
                            result
                                .serverAsOfDate ??
                            null,
                        httpStatus:
                            result
                                .httpStatus
                    })
                );
            }

            const uniqueReceived =
                new Set(
                    receivedIds
                );

            if (
                uniqueReceived.size !==
                receivedIds.length
            ) {
                throw new Error(
                    "Cycle contains duplicate security Keys across chunks."
                );
            }

            const expectedIds =
                validatedUniverse
                    .securityIds;

            const expectedSet =
                new Set(
                    expectedIds
                );

            const missingIds =
                expectedIds.filter(
                    securityId =>
                        !uniqueReceived.has(
                            securityId
                        )
                );

            const unexpectedIds =
                receivedIds.filter(
                    securityId =>
                        !expectedSet.has(
                            securityId
                        )
                );

            if (
                missingIds.length > 0 ||
                unexpectedIds.length > 0
            ) {
                throw new Error(
                    "Cycle membership mismatch. " +
                    "missing=[" +
                    missingIds.join(",") +
                    "], unexpected=[" +
                    unexpectedIds.join(",") +
                    "]."
                );
            }

            return Object.freeze({
                status:
                    "complete",
                startedAtMs,
                completedAtMs,
                durationMs:
                    completedAtMs -
                    startedAtMs,
                requested:
                    expectedIds.length,
                received:
                    receivedIds.length,
                unique:
                    uniqueReceived.size,
                missing: 0,
                duplicates: 0,
                chunks:
                    Object.freeze([
                        ...cycleChunks
                    ]),
                securities:
                    Object.freeze([
                        ...securities
                    ])
            });
        }

        async function runCompleteCycle({
            universe,
            fetchChunk,
            sleep,
            now
        }) {
            const validatedUniverse =
                validateUniverseForCycle(
                    universe
                );

            if (
                typeof fetchChunk !==
                "function"
            ) {
                throw new TypeError(
                    "fetchChunk must be a function."
                );
            }

            if (
                typeof sleep !==
                "function"
            ) {
                throw new TypeError(
                    "sleep must be a function."
                );
            }

            if (
                typeof now !==
                "function"
            ) {
                throw new TypeError(
                    "now must be a function."
                );
            }

            const startedAtMs =
                now();

            const chunkResults = [];

            for (
                let chunkIndex = 0;
                chunkIndex <
                validatedUniverse
                    .chunks
                    .length;
                chunkIndex++
            ) {
                const chunk =
                    validatedUniverse
                        .chunks[
                            chunkIndex
                        ];

                const result =
                    await fetchChunk(
                        chunk
                    );

                chunkResults.push(
                    result
                );

                const isLastChunk =
                    chunkIndex ===
                    validatedUniverse
                        .chunks
                        .length -
                    1;

                if (
                    !isLastChunk &&
                    validatedUniverse
                        .chunkDelayMs >
                        0
                ) {
                    await sleep(
                        validatedUniverse
                            .chunkDelayMs
                    );
                }
            }

            const completedAtMs =
                now();

            return finalizeCompleteCycle({
                universe,
                chunkResults,
                startedAtMs,
                completedAtMs
            });
        }

        return Object.freeze({
            validateUniverseForCycle,
            finalizeCompleteCycle,
            runCompleteCycle
        });
    }
);
