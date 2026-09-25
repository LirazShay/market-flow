"use strict";

(function bootstrapBrowserSqlProbe(
    windowObject
) {
    const config =
        __MARKET_FLOW_BROWSER_SQL_PROBE_CONFIG__;

    const defaultTimeoutMs =
        5000;

    function sleep(
        milliseconds
    ) {
        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }

    function sanitizedError(
        stage
    ) {
        return {
            name:
                "BrowserSqlProbeError",
            message:
                "Browser SQL probe failed at " +
                stage +
                "."
        };
    }

    function asBytes(
        value
    ) {
        if (
            value instanceof
                Uint8Array
        ) {
            return value;
        }

        if (
            value instanceof
                ArrayBuffer
        ) {
            return new Uint8Array(
                value
            );
        }

        if (
            value &&
            value.buffer instanceof
                ArrayBuffer
        ) {
            return new Uint8Array(
                value.buffer,
                value.byteOffset ?? 0,
                value.byteLength ??
                    value.buffer.byteLength
            );
        }

        throw new Error(
            "DuckDB query result is not a byte buffer."
        );
    }

    function containsBytes(
        haystack,
        needle
    ) {
        if (
            needle.length ===
                0
        ) {
            return true;
        }

        outer:
        for (
            let index = 0;
            index <=
                haystack.length -
                    needle.length;
            index += 1
        ) {
            for (
                let offset = 0;
                offset <
                    needle.length;
                offset += 1
            ) {
                if (
                    haystack[
                        index +
                            offset
                    ] !==
                    needle[
                        offset
                    ]
                ) {
                    continue outer;
                }
            }

            return true;
        }

        return false;
    }

    function createWorkerClient(
        worker,
        timeoutMs
    ) {
        let nextMessageId =
            1;

        const pending =
            new Map();

        function rejectAll(
            error
        ) {
            for (
                const entry of
                pending.values()
            ) {
                clearTimeout(
                    entry.timer
                );

                entry.reject(
                    error
                );
            }

            pending.clear();
        }

        const onError =
            () => {
                rejectAll(
                    new Error(
                        "DuckDB Worker failed."
                    )
                );
            };

        const onMessage =
            event => {
                const message =
                    event.data;

                if (
                    !message ||
                    typeof message !==
                        "object"
                ) {
                    return;
                }

                if (
                    message.type ===
                        "LOG" ||
                    message.type ===
                        "INSTANTIATE_PROGRESS" ||
                    message.type ===
                        "PROGRESS_UPDATE"
                ) {
                    return;
                }

                const entry =
                    pending.get(
                        message.requestId
                    );

                if (!entry) {
                    return;
                }

                pending.delete(
                    message.requestId
                );

                clearTimeout(
                    entry.timer
                );

                if (
                    message.type ===
                        "ERROR"
                ) {
                    entry.reject(
                        new Error(
                            "DuckDB Worker request failed."
                        )
                    );
                    return;
                }

                entry.resolve(
                    message.data
                );
            };

        worker.addEventListener(
            "error",
            onError
        );

        worker.addEventListener(
            "message",
            onMessage
        );

        function request(
            type,
            data,
            requestedTimeoutMs
        ) {
            const messageId =
                nextMessageId++;

            const effectiveTimeout =
                requestedTimeoutMs ??
                timeoutMs;

            return new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const timer =
                        setTimeout(
                            () => {
                                pending.delete(
                                    messageId
                                );

                                reject(
                                    new Error(
                                        "DuckDB Worker request timed out."
                                    )
                                );
                            },
                            effectiveTimeout
                        );

                    pending.set(
                        messageId,
                        {
                            resolve,
                            reject,
                            timer
                        }
                    );

                    worker.postMessage({
                        messageId,
                        type,
                        data
                    });
                }
            );
        }

        function dispose() {
            worker.removeEventListener(
                "error",
                onError
            );

            worker.removeEventListener(
                "message",
                onMessage
            );

            rejectAll(
                new Error(
                    "DuckDB Worker client disposed."
                )
            );
        }

        return {
            request,
            dispose
        };
    }

    async function verifyBrowserCapabilities() {
        const capabilities = [
            [
                "Worker",
                typeof Worker ===
                    "function"
            ],
            [
                "Blob",
                typeof Blob ===
                    "function"
            ],
            [
                "URL.createObjectURL",
                typeof URL !==
                    "undefined" &&
                typeof URL
                    .createObjectURL ===
                    "function"
            ],
            [
                "WebAssembly",
                typeof WebAssembly !==
                    "undefined"
            ],
            [
                "OPFS",
                typeof navigator !==
                    "undefined" &&
                navigator.storage &&
                typeof navigator
                    .storage
                    .getDirectory ===
                    "function"
            ]
        ];

        const missing =
            capabilities
                .filter(
                    entry =>
                        !entry[1]
                )
                .map(
                    entry =>
                        entry[0]
                );

        if (
            missing.length >
                0
        ) {
            throw new Error(
                "Required browser capability is unavailable."
            );
        }

        await navigator
            .storage
            .getDirectory();
    }

    async function verifyBlobWorker(
        timeoutMs
    ) {
        const blob =
            new Blob(
                [
                    "self.onmessage=function(event){self.postMessage(event.data);};"
                ],
                {
                    type:
                        "application/javascript"
                }
            );

        const blobUrl =
            URL.createObjectURL(
                blob
            );

        let worker =
            null;

        try {
            worker =
                new Worker(
                    blobUrl
                );

            const marker =
                "market-flow-browser-sql-probe-worker";

            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const timer =
                        setTimeout(
                            () => {
                                reject(
                                    new Error(
                                        "Blob Worker did not respond."
                                    )
                                );
                            },
                            timeoutMs
                        );

                    worker
                        .addEventListener(
                            "error",
                            () => {
                                clearTimeout(
                                    timer
                                );

                                reject(
                                    new Error(
                                        "Blob Worker failed."
                                    )
                                );
                            },
                            {
                                once:
                                    true
                            }
                        );

                    worker
                        .addEventListener(
                            "message",
                            event => {
                                if (
                                    event.data !==
                                        marker
                                ) {
                                    return;
                                }

                                clearTimeout(
                                    timer
                                );

                                resolve();
                            },
                            {
                                once:
                                    true
                            }
                        );

                    worker.postMessage(
                        marker
                    );
                }
            );
        } finally {
            if (worker) {
                worker.terminate();
            }

            URL.revokeObjectURL(
                blobUrl
            );
        }
    }

    function createPinnedWorker(
        workerUrl,
        timeoutMs
    ) {
        const wrapperSource =
            "importScripts(" +
            JSON.stringify(
                workerUrl
            ) +
            ");";

        const wrapperBlob =
            new Blob(
                [
                    wrapperSource
                ],
                {
                    type:
                        "application/javascript"
                }
            );

        const wrapperUrl =
            URL.createObjectURL(
                wrapperBlob
            );

        const worker =
            new Worker(
                wrapperUrl
            );

        return {
            worker,
            client:
                createWorkerClient(
                    worker,
                    timeoutMs
                ),
            wrapperUrl,
            connectionId:
                null
        };
    }

    async function closeSession(
        session
    ) {
        if (!session) {
            return;
        }

        try {
            if (
                session.connectionId !==
                    null
            ) {
                await session
                    .client
                    .request(
                        "DISCONNECT",
                        session.connectionId,
                        1000
                    );
            }
        } catch (
            error
        ) {
            // Best effort only. Worker termination releases probe-owned handles.
        }

        session
            .client
            .dispose();

        session
            .worker
            .terminate();

        URL.revokeObjectURL(
            session.wrapperUrl
        );

        await sleep(
            25
        );
    }

    async function instantiateSession(
        bundleName,
        timeoutMs
    ) {
        const bundle =
            config
                .engine
                .bundles[
                    bundleName
                ];

        if (!bundle) {
            throw new Error(
                "Unknown DuckDB bundle."
            );
        }

        const session =
            createPinnedWorker(
                bundle.mainWorker,
                timeoutMs
            );

        try {
            await session
                .client
                .request(
                    "PING",
                    null,
                    timeoutMs
                );

            await session
                .client
                .request(
                    "INSTANTIATE",
                    [
                        bundle.mainModule,
                        null
                    ],
                    timeoutMs
                );

            await session
                .client
                .request(
                    "OPEN",
                    {
                        path:
                            config
                                .databaseUrl,
                        accessMode:
                            3,
                        maximumThreads:
                            1,
                        opfs: {
                            fileHandling:
                                "manual"
                        }
                    },
                    timeoutMs
                );

            session.connectionId =
                await session
                    .client
                    .request(
                        "CONNECT",
                        null,
                        timeoutMs
                    );

            return session;
        } catch (
            error
        ) {
            await closeSession(
                session
            );

            throw error;
        }
    }

    async function runQuery(
        session,
        sql,
        timeoutMs
    ) {
        return await session
            .client
            .request(
                "RUN_QUERY",
                [
                    session
                        .connectionId,
                    sql
                ],
                timeoutMs
            );
    }

    async function persistMarker(
        session,
        timeoutMs
    ) {
        const tableName =
            "market_flow_browser_sql_probe_marker";

        await runQuery(
            session,
            "CREATE TABLE IF NOT EXISTS " +
                tableName +
                " (marker VARCHAR PRIMARY KEY);",
            timeoutMs
        );

        await runQuery(
            session,
            "BEGIN TRANSACTION;",
            timeoutMs
        );

        try {
            await runQuery(
                session,
                "DELETE FROM " +
                    tableName +
                    ";",
                timeoutMs
            );

            await runQuery(
                session,
                "INSERT INTO " +
                    tableName +
                    " VALUES (" +
                    JSON.stringify(
                        config
                            .syntheticMarker
                    ) +
                    ");",
                timeoutMs
            );

            await runQuery(
                session,
                "COMMIT;",
                timeoutMs
            );
        } catch (
            error
        ) {
            try {
                await runQuery(
                    session,
                    "ROLLBACK;",
                    timeoutMs
                );
            } catch (
                rollbackError
            ) {
                // Preserve the original failure.
            }

            throw error;
        }

        await runQuery(
            session,
            "CHECKPOINT;",
            timeoutMs
        );
    }

    async function readPersistedMarker(
        session,
        timeoutMs
    ) {
        const tableName =
            "market_flow_browser_sql_probe_marker";

        const result =
            await runQuery(
                session,
                "SELECT " +
                    JSON.stringify(
                        config
                            .syntheticMarker
                    ) +
                    " AS marker " +
                    "WHERE EXISTS (" +
                    "SELECT 1 FROM " +
                    tableName +
                    " WHERE marker = " +
                    JSON.stringify(
                        config
                            .syntheticMarker
                    ) +
                    ");",
                timeoutMs
            );

        const resultBytes =
            asBytes(
                result
            );

        const markerBytes =
            new TextEncoder()
                .encode(
                    config
                        .syntheticMarker
                );

        if (
            !containsBytes(
                resultBytes,
                markerBytes
            )
        ) {
            throw new Error(
                "Synthetic marker was not found after reopen."
            );
        }

        return config
            .syntheticMarker;
    }

    async function verifyPersistedMarker(
        bundleName,
        timeoutMs
    ) {
        let session =
            null;

        try {
            session =
                await instantiateSession(
                    bundleName,
                    timeoutMs
                );

            return await readPersistedMarker(
                session,
                timeoutMs
            );
        } finally {
            await closeSession(
                session
            );
        }
    }

    async function run(
        options = {}
    ) {
        const bundleName =
            options.bundle ??
            "eh";

        const timeoutMs =
            options.workerReadyTimeoutMs ??
            defaultTimeoutMs;

        const stages = [];

        let failedStage =
            null;

        let activeSession =
            null;

        async function runStage(
            name,
            action
        ) {
            try {
                await action();

                stages.push({
                    name,
                    status:
                        "passed"
                });
            } catch (
                error
            ) {
                failedStage =
                    name;

                stages.push({
                    name,
                    status:
                        "failed"
                });

                throw error;
            }
        }

        try {
            await runStage(
                "bookmarklet-bootstrap",
                async () => {}
            );

            await runStage(
                "browser-capabilities",
                verifyBrowserCapabilities
            );

            await runStage(
                "blob-worker-create",
                async () =>
                    await verifyBlobWorker(
                        timeoutMs
                    )
            );

            const bundle =
                config
                    .engine
                    .bundles[
                        bundleName
                    ];

            await runStage(
                "worker-asset-load",
                async () => {
                    if (!bundle) {
                        throw new Error(
                            "Unknown DuckDB bundle."
                        );
                    }

                    activeSession =
                        createPinnedWorker(
                            bundle
                                .mainWorker,
                            timeoutMs
                        );

                    await activeSession
                        .client
                        .request(
                            "PING",
                            null,
                            timeoutMs
                        );
                }
            );

            await runStage(
                "wasm-instantiate",
                async () => {
                    await activeSession
                        .client
                        .request(
                            "INSTANTIATE",
                            [
                                bundle
                                    .mainModule,
                                null
                            ],
                            timeoutMs
                        );
                }
            );

            await runStage(
                "opfs-open",
                async () => {
                    await activeSession
                        .client
                        .request(
                            "OPEN",
                            {
                                path:
                                    config
                                        .databaseUrl,
                                accessMode:
                                    3,
                                maximumThreads:
                                    1,
                                opfs: {
                                    fileHandling:
                                        "manual"
                                }
                            },
                            timeoutMs
                        );

                    activeSession
                        .connectionId =
                        await activeSession
                            .client
                            .request(
                                "CONNECT",
                                null,
                                timeoutMs
                            );
                }
            );

            await runStage(
                "write-commit-checkpoint",
                async () =>
                    await persistMarker(
                        activeSession,
                        timeoutMs
                    )
            );

            await runStage(
                "reopen-verify",
                async () => {
                    await closeSession(
                        activeSession
                    );

                    activeSession =
                        null;

                    await verifyPersistedMarker(
                        bundleName,
                        timeoutMs
                    );
                }
            );

            return {
                status:
                    "passed",
                failedStage:
                    null,
                stages,
                error:
                    null
            };
        } catch (
            error
        ) {
            return {
                status:
                    "failed",
                failedStage,
                stages,
                error:
                    sanitizedError(
                        failedStage ??
                        "unknown"
                    )
            };
        } finally {
            await closeSession(
                activeSession
            );
        }
    }

    async function verify(
        options = {}
    ) {
        const bundleName =
            options.bundle ??
            "eh";

        const timeoutMs =
            options.workerReadyTimeoutMs ??
            defaultTimeoutMs;

        try {
            const marker =
                await verifyPersistedMarker(
                    bundleName,
                    timeoutMs
                );

            return {
                status:
                    "passed",
                marker,
                error:
                    null
            };
        } catch (
            error
        ) {
            return {
                status:
                    "failed",
                marker:
                    null,
                error:
                    sanitizedError(
                        "reopen-verify"
                    )
            };
        }
    }

    async function cleanup() {
        try {
            const root =
                await navigator
                    .storage
                    .getDirectory();

            for (
                const name of
                [
                    config
                        .databaseWalFileName,
                    config
                        .databaseFileName
                ]
            ) {
                try {
                    await root
                        .removeEntry(
                            name
                        );
                } catch (
                    error
                ) {
                    if (
                        !error ||
                        error.name !==
                            "NotFoundError"
                    ) {
                        throw error;
                    }
                }
            }

            return {
                status:
                    "passed",
                deletedEntries:
                    [
                        config
                            .databaseFileName,
                        config
                            .databaseWalFileName
                    ],
                error:
                    null
            };
        } catch (
            error
        ) {
            return {
                status:
                    "failed",
                deletedEntries:
                    [],
                error:
                    sanitizedError(
                        "cleanup"
                    )
            };
        }
    }

    const api =
        Object.freeze({
            config,
            run,
            verify,
            cleanup
        });

    windowObject
        .MarketFlowBrowserSqlProbe =
        api;

    if (
        windowObject
            .__MARKET_FLOW_BROWSER_SQL_PROBE_AUTO_RUN__ !==
            false
    ) {
        api
            .run()
            .then(
                result => {
                    console.log(
                        "Market Flow Browser SQL probe:",
                        result
                    );
                }
            );
    }
})(
    window
);
