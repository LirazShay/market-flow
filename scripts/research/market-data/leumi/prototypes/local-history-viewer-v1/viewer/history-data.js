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
                    page.hasMore
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
            loadInitialPage
        });

    console.log(
        "Market Flow viewer history data loaded."
    );
})();
