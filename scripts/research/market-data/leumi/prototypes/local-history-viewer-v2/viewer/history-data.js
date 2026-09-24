(() => {
    "use strict";

    if (
        window.MarketFlowViewerHistoryData
    ) {
        console.warn(
            "MarketFlowViewerHistoryData is already loaded."
        );
        return;
    }

    const schema =
        window.MarketFlowStorageSchema;

    const connection =
        window.MarketFlowStorageConnection;

    const upgrade =
        window.MarketFlowStorageUpgrade;

    const read =
        window.MarketFlowStorageRead;

    if (
        !schema ||
        !connection ||
        !upgrade ||
        !read
    ) {
        throw new Error(
            "Viewer history-data dependencies are not loaded."
        );
    }

    const INITIAL_PAGE_SIZE =
        500;

    function assertSecurityId(
        securityId
    ) {
        if (
            typeof securityId !==
                "string" ||
            securityId.length === 0
        ) {
            throw new TypeError(
                "securityId must be a non-empty string."
            );
        }
    }

    function createSecurityTimeRange(
        securityId
    ) {
        return window
            .IDBKeyRange
            .bound(
                [
                    securityId,
                    0
                ],
                [
                    securityId,
                    Number.MAX_SAFE_INTEGER
                ]
            );
    }

    async function loadInitialPage(
        securityId
    ) {
        assertSecurityId(
            securityId
        );

        const database =
            await connection
                .openDatabase({
                    onUpgradeNeeded:
                        upgrade
                            .upgradeDatabase
                });

        try {
            const historyStore =
                schema
                    .stores
                    .history;

            const page =
                await read
                    .getIndexPage(
                        database,
                        historyStore
                            .name,
                        historyStore
                            .indexes
                            .bySecurityTime
                            .name,
                        {
                            range:
                                createSecurityTimeRange(
                                    securityId
                                ),
                            direction:
                                "prev",
                            limit:
                                INITIAL_PAGE_SIZE
                        }
                    );

            return Object.freeze({
                securityId,
                pageSize:
                    INITIAL_PAGE_SIZE,
                rows:
                    page.rows,
                hasMore:
                    page.hasMore,
                continuation:
                    page.continuation
            });
        } finally {
            connection
                .closeDatabase(
                    database
                );
        }
    }

    function assertContinuation(
        securityId,
        continuation
    ) {
        if (
            !continuation ||
            typeof continuation !==
                "object" ||
            !Array.isArray(
                continuation.key
            ) ||
            continuation.key.length !==
                2 ||
            continuation.key[0] !==
                securityId ||
            !Array.isArray(
                continuation.primaryKey
            ) ||
            continuation.primaryKey.length !==
                2 ||
            continuation.primaryKey[1] !==
                securityId
        ) {
            throw new TypeError(
                "continuation must belong to the requested securityId."
            );
        }
    }

    function createOlderSecurityTimeRange(
        securityId,
        continuation
    ) {
        return window
            .IDBKeyRange
            .bound(
                [
                    securityId,
                    0
                ],
                continuation.key
            );
    }

    async function loadOlderPage(
        securityId,
        continuation
    ) {
        assertSecurityId(
            securityId
        );

        assertContinuation(
            securityId,
            continuation
        );

        const database =
            await connection
                .openDatabase({
                    onUpgradeNeeded:
                        upgrade
                            .upgradeDatabase
                });

        try {
            const historyStore =
                schema
                    .stores
                    .history;

            const page =
                await read
                    .getIndexPage(
                        database,
                        historyStore
                            .name,
                        historyStore
                            .indexes
                            .bySecurityTime
                            .name,
                        {
                            range:
                                createOlderSecurityTimeRange(
                                    securityId,
                                    continuation
                                ),
                            direction:
                                "prev",
                            limit:
                                INITIAL_PAGE_SIZE,
                            after:
                                continuation
                        }
                    );

            return Object.freeze({
                securityId,
                pageSize:
                    INITIAL_PAGE_SIZE,
                rows:
                    page.rows,
                hasMore:
                    page.hasMore,
                continuation:
                    page.continuation
            });
        } finally {
            connection
                .closeDatabase(
                    database
                );
        }
    }

    window.MarketFlowViewerHistoryData =
        Object.freeze({
            INITIAL_PAGE_SIZE,
            loadInitialPage,
            loadOlderPage
        });

    console.log(
        "Market Flow viewer history data loaded."
    );
})();
