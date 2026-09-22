(() => {
    "use strict";

    if (
        window.MarketFlowViewerSecurityDetail
    ) {
        console.warn(
            "MarketFlowViewerSecurityDetail is already loaded."
        );
        return;
    }

    const currentTable =
        window.MarketFlowViewerCurrentTable;

    const historyData =
        window.MarketFlowViewerHistoryData;

    const logic =
        window.MarketFlowCurrentTableLogic;

    if (
        !currentTable ||
        !historyData ||
        !logic
    ) {
        throw new Error(
            "Viewer security-detail dependencies are not loaded."
        );
    }

    const sessions =
        new WeakMap();

    const HISTORY_COLUMNS =
        Object.freeze([
            Object.freeze({
                key:
                    "collectedAtMs",
                label:
                    "זמן איסוף",
                type:
                    "timestamp",
                path:
                    Object.freeze([
                        "collectedAtMs"
                    ])
            }),
            Object.freeze({
                key:
                    "cycleId",
                label:
                    "Cycle",
                type:
                    "number",
                path:
                    Object.freeze([
                        "cycleId"
                    ])
            }),
            Object.freeze({
                key:
                    "chunkIndex",
                label:
                    "Chunk",
                type:
                    "number",
                path:
                    Object.freeze([
                        "chunkIndex"
                    ])
            }),
            Object.freeze({
                key:
                    "LastKnownRate",
                label:
                    "שער אחרון",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "LastKnownRate"
                    ])
            }),
            Object.freeze({
                key:
                    "BaseRateChangePercentage",
                label:
                    "שינוי יומי %",
                type:
                    "percentage",
                path:
                    Object.freeze([
                        "data",
                        "BaseRateChangePercentage"
                    ])
            }),
            Object.freeze({
                key:
                    "BuyLimit1",
                label:
                    "BID1",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "BuyLimit1"
                    ])
            }),
            Object.freeze({
                key:
                    "BuyVolume1",
                label:
                    "כמות BID1",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "BuyVolume1"
                    ])
            }),
            Object.freeze({
                key:
                    "SellLimit1",
                label:
                    "ASK1",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "SellLimit1"
                    ])
            }),
            Object.freeze({
                key:
                    "SellVolume1",
                label:
                    "כמות ASK1",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "SellVolume1"
                    ])
            }),
            Object.freeze({
                key:
                    "DailyDealsQuantity",
                label:
                    "מס' עסקאות",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "DailyDealsQuantity"
                    ])
            }),
            Object.freeze({
                key:
                    "LastDealVolume",
                label:
                    "כמות עסקה אחרונה",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "LastDealVolume"
                    ])
            }),
            Object.freeze({
                key:
                    "DailyTurnover",
                label:
                    "כמות יומית",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "DailyTurnover"
                    ])
            }),
            Object.freeze({
                key:
                    "DailyNISRevenue",
                label:
                    "מחזור כספי",
                type:
                    "number",
                path:
                    Object.freeze([
                        "data",
                        "DailyNISRevenue"
                    ])
            }),
            Object.freeze({
                key:
                    "LastDealTimeOnly",
                label:
                    "עסקה אחרונה",
                type:
                    "string",
                path:
                    Object.freeze([
                        "data",
                        "LastDealTimeOnly"
                    ])
            }),
            Object.freeze({
                key:
                    "serverAsOfDate",
                label:
                    "זמן שרת",
                type:
                    "string",
                path:
                    Object.freeze([
                        "serverAsOfDate"
                    ])
            })
        ]);

    function setViewerState(
        targetWindow,
        viewState,
        statusText,
        selectedSecurityId
    ) {
        const status =
            targetWindow
                .document
                .querySelector(
                    "[data-role='viewer-status']"
                );

        if (status) {
            status.textContent =
                statusText;

            status.dataset.viewState =
                viewState;
        }

        targetWindow
            .MarketFlowViewerShell
            ?.setState?.({
                viewState,
                selectedSecurityId:
                    selectedSecurityId ??
                    null
            });
    }

    function ensureStyles(
        documentRef
    ) {
        if (
            documentRef.getElementById(
                "market-flow-security-detail-styles"
            )
        ) {
            return;
        }

        const style =
            documentRef.createElement(
                "style"
            );

        style.id =
            "market-flow-security-detail-styles";

        style.textContent = [
            ".detail-actions { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }",
            ".detail-actions button, .history-load-older { border: 1px solid #cfd6e4; border-radius: 6px; background: #fff; padding: 7px 12px; cursor: pointer; }",
            ".detail-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 12px 0 16px; }",
            ".detail-metric { display: grid; gap: 3px; padding: 10px; background: #f8fafc; border-radius: 8px; }",
            ".detail-metric span { font-size: 12px; color: #667085; }",
            ".detail-metric strong { font-size: 14px; }",
            ".history-table-wrap { overflow: auto; max-width: 100%; }",
            ".history-table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 13px; }",
            ".history-table th, .history-table td { padding: 8px 10px; border-bottom: 1px solid #e5e9f1; white-space: nowrap; text-align: right; }",
            ".history-table th { position: sticky; top: 0; background: #eef2f7; }",
            ".history-table td.numeric { direction: ltr; text-align: left; font-variant-numeric: tabular-nums; }",
            ".history-empty, .history-error { margin: 14px 0; }",
            ".history-error { font-weight: 700; }",
            ".history-load-older { margin-top: 12px; }"
        ].join("\n");

        documentRef.head.appendChild(
            style
        );
    }

    function clearPanel(
        panel
    ) {
        while (
            panel.firstChild
        ) {
            panel.firstChild.remove();
        }
    }

    function appendSummaryMetric(
        documentRef,
        container,
        label,
        value,
        role
    ) {
        const metric =
            documentRef.createElement(
                "div"
            );

        metric.className =
            "detail-metric";

        const labelElement =
            documentRef.createElement(
                "span"
            );

        labelElement.textContent =
            label;

        const valueElement =
            documentRef.createElement(
                "strong"
            );

        valueElement.dataset.role =
            role;

        valueElement.textContent =
            value;

        metric.appendChild(
            labelElement
        );

        metric.appendChild(
            valueElement
        );

        container.appendChild(
            metric
        );
    }

    function getCurrentColumn(
        key
    ) {
        return logic
            .COLUMN_DEFINITIONS
            .find(
                column =>
                    column.key ===
                    key
            );
    }

    function formatCurrentValue(
        row,
        key
    ) {
        const column =
            getCurrentColumn(
                key
            );

        if (!column) {
            throw new Error(
                "Unknown current-table column " +
                key +
                "."
            );
        }

        return logic
            .formatCellValue(
                logic
                    .getColumnValue(
                        row,
                        column
                    ),
                column.type
            );
    }

    function getPathValue(
        row,
        path
    ) {
        let value =
            row;

        for (
            const part of
            path
        ) {
            if (
                value === null ||
                value === undefined
            ) {
                return undefined;
            }

            value =
                value[part];
        }

        return value;
    }

    function appendHistoryRows(
        documentRef,
        tbody,
        rows
    ) {
        for (
            const row of
            rows
        ) {
            const tr =
                documentRef.createElement(
                    "tr"
                );

            tr.dataset.cycleId =
                String(
                    row.cycleId
                );

            for (
                const column of
                HISTORY_COLUMNS
            ) {
                const td =
                    documentRef.createElement(
                        "td"
                    );

                td.dataset.column =
                    column.key;

                const rawValue =
                    getPathValue(
                        row,
                        column.path
                    );

                td.textContent =
                    logic
                        .formatCellValue(
                            rawValue,
                            column.type
                        );

                if (
                    column.type ===
                        "number" ||
                    column.type ===
                        "percentage" ||
                    column.type ===
                        "timestamp"
                ) {
                    td.classList.add(
                        "numeric"
                    );
                }

                tr.appendChild(
                    td
                );
            }

            tbody.appendChild(
                tr
            );
        }
    }

    function restoreMain(
        targetWindow
    ) {
        const session =
            sessions.get(
                targetWindow
            );

        const documentRef =
            targetWindow.document;

        const currentPanel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        const detailPanel =
            documentRef.querySelector(
                "[data-role='security-detail-panel']"
            );

        if (currentPanel) {
            currentPanel.hidden =
                false;
        }

        if (detailPanel) {
            detailPanel.hidden =
                true;
        }

        currentTable
            .restoreViewport(
                targetWindow
            );

        if (session) {
            session.pendingSecurityId =
                null;

            session.securityId =
                null;

            session.row =
                null;

            session.continuation =
                null;

            session.hasMore =
                false;

            session.loadedRows =
                [];
        }

        setViewerState(
            targetWindow,
            "MAIN",
            session
                ?.mainStatusText ??
            "מצב שוק נוכחי.",
            null
        );
    }

    function renderDetail(
        targetWindow,
        row,
        page
    ) {
        const documentRef =
            targetWindow.document;

        const currentPanel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        const detailPanel =
            documentRef.querySelector(
                "[data-role='security-detail-panel']"
            );

        if (
            !currentPanel ||
            !detailPanel
        ) {
            throw new Error(
                "Viewer detail panels are missing."
            );
        }

        ensureStyles(
            documentRef
        );

        clearPanel(
            detailPanel
        );

        currentPanel.hidden =
            true;

        detailPanel.hidden =
            false;

        const actions =
            documentRef.createElement(
                "div"
            );

        actions.className =
            "detail-actions";

        const backButton =
            documentRef.createElement(
                "button"
            );

        backButton.type =
            "button";

        backButton.dataset.role =
            "detail-back";

        backButton.textContent =
            "← חזרה לטבלה";

        backButton.addEventListener(
            "click",
            () => {
                restoreMain(
                    targetWindow
                );
            }
        );

        actions.appendChild(
            backButton
        );

        detailPanel.appendChild(
            actions
        );

        const title =
            documentRef.createElement(
                "h2"
            );

        title.dataset.role =
            "detail-title";

        title.textContent =
            row.paperName ??
            "—";

        detailPanel.appendChild(
            title
        );

        const summary =
            documentRef.createElement(
                "div"
            );

        summary.className =
            "detail-summary";

        summary.dataset.role =
            "detail-summary";

        appendSummaryMetric(
            documentRef,
            summary,
            "מספר נייר",
            row.securityId,
            "detail-security-id"
        );

        appendSummaryMetric(
            documentRef,
            summary,
            "שער אחרון",
            formatCurrentValue(
                row,
                "LastKnownRate"
            ),
            "detail-last-rate"
        );

        appendSummaryMetric(
            documentRef,
            summary,
            "שינוי יומי",
            formatCurrentValue(
                row,
                "BaseRateChangePercentage"
            ),
            "detail-daily-change"
        );

        appendSummaryMetric(
            documentRef,
            summary,
            "BID1 / ASK1",
            formatCurrentValue(
                row,
                "BuyLimit1"
            ) +
                " / " +
                formatCurrentValue(
                    row,
                    "SellLimit1"
                ),
            "detail-bid-ask"
        );

        appendSummaryMetric(
            documentRef,
            summary,
            "עסקה אחרונה",
            formatCurrentValue(
                row,
                "LastDealTimeOnly"
            ),
            "detail-last-deal-time"
        );

        detailPanel.appendChild(
            summary
        );

        const historyHeading =
            documentRef.createElement(
                "h3"
            );

        historyHeading.textContent =
            "היסטוריה";

        detailPanel.appendChild(
            historyHeading
        );

        const session =
            sessions.get(
                targetWindow
            );

        session.securityId =
            row.securityId;

        session.row =
            row;

        session.continuation =
            page.continuation;

        session.hasMore =
            page.hasMore;

        session.loadedRows =
            [
                ...page.rows
            ];

        if (
            page.rows.length ===
            0
        ) {
            const empty =
                documentRef.createElement(
                    "p"
                );

            empty.className =
                "history-empty";

            empty.dataset.role =
                "history-empty";

            empty.textContent =
                "לא נמצאה היסטוריה לנייר הזה.";

            detailPanel.appendChild(
                empty
            );

            return;
        }

        const wrapper =
            documentRef.createElement(
                "div"
            );

        wrapper.className =
            "history-table-wrap";

        const table =
            documentRef.createElement(
                "table"
            );

        table.className =
            "history-table";

        table.dataset.role =
            "security-history-table";

        const thead =
            documentRef.createElement(
                "thead"
            );

        const headerRow =
            documentRef.createElement(
                "tr"
            );

        for (
            const column of
            HISTORY_COLUMNS
        ) {
            const th =
                documentRef.createElement(
                    "th"
                );

            th.scope =
                "col";

            th.textContent =
                column.label;

            th.dataset.column =
                column.key;

            headerRow.appendChild(
                th
            );
        }

        thead.appendChild(
            headerRow
        );

        table.appendChild(
            thead
        );

        const tbody =
            documentRef.createElement(
                "tbody"
            );

        appendHistoryRows(
            documentRef,
            tbody,
            page.rows
        );

        table.appendChild(
            tbody
        );

        wrapper.appendChild(
            table
        );

        detailPanel.appendChild(
            wrapper
        );

        if (
            page.hasMore &&
            page.continuation
        ) {
            const loadOlder =
                documentRef.createElement(
                    "button"
                );

            loadOlder.type =
                "button";

            loadOlder.className =
                "history-load-older";

            loadOlder.dataset.role =
                "history-load-older";

            loadOlder.textContent =
                "טען ישנים יותר";

            loadOlder.addEventListener(
                "click",
                async () => {
                    if (
                        session.loadingOlder ||
                        !session.continuation
                    ) {
                        return;
                    }

                    session.loadingOlder =
                        true;

                    loadOlder.disabled =
                        true;

                    loadOlder.textContent =
                        "טוען...";

                    try {
                        const olderPage =
                            await historyData
                                .loadOlderPage(
                                    session
                                        .securityId,
                                    session
                                        .continuation
                                );

                        appendHistoryRows(
                            documentRef,
                            tbody,
                            olderPage.rows
                        );

                        session.loadedRows.push(
                            ...olderPage.rows
                        );

                        session.continuation =
                            olderPage
                                .continuation;

                        session.hasMore =
                            olderPage
                                .hasMore;

                        if (
                            !olderPage.hasMore ||
                            !olderPage
                                .continuation
                        ) {
                            loadOlder.remove();
                        } else {
                            loadOlder.disabled =
                                false;

                            loadOlder.textContent =
                                "טען ישנים יותר";
                        }
                    } catch (error) {
                        loadOlder.disabled =
                            false;

                        loadOlder.textContent =
                            "נסה שוב לטעון ישנים יותר";

                        console.error(
                            "Market Flow history continuation failed.",
                            error
                        );
                    } finally {
                        session.loadingOlder =
                            false;
                    }
                }
            );

            detailPanel.appendChild(
                loadOlder
            );
        }
    }

    function renderLoading(
        targetWindow,
        row
    ) {
        const documentRef =
            targetWindow.document;

        const currentPanel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        const detailPanel =
            documentRef.querySelector(
                "[data-role='security-detail-panel']"
            );

        if (
            !currentPanel ||
            !detailPanel
        ) {
            throw new Error(
                "Viewer detail panels are missing."
            );
        }

        currentPanel.hidden =
            true;

        detailPanel.hidden =
            false;

        clearPanel(
            detailPanel
        );

        const loading =
            documentRef.createElement(
                "p"
            );

        loading.dataset.role =
            "history-loading";

        loading.textContent =
            "טוען היסטוריה...";

        detailPanel.appendChild(
            loading
        );

        setViewerState(
            targetWindow,
            "DETAIL",
            "טוען היסטוריה עבור " +
                (
                    row.paperName ??
                    row.securityId
                ) +
                "...",
            row.securityId
        );
    }

    async function loadHistoryDepth(
        securityId,
        minimumRows
    ) {
        let page =
            await historyData
                .loadInitialPage(
                    securityId
                );

        const rows = [
            ...page.rows
        ];

        let hasMore =
            page.hasMore;

        let continuation =
            page.continuation;

        while (
            rows.length <
                minimumRows &&
            hasMore &&
            continuation
        ) {
            const olderPage =
                await historyData
                    .loadOlderPage(
                        securityId,
                        continuation
                    );

            rows.push(
                ...olderPage.rows
            );

            hasMore =
                olderPage.hasMore;

            continuation =
                olderPage.continuation;
        }

        return Object.freeze({
            securityId,
            pageSize:
                historyData
                    .INITIAL_PAGE_SIZE,
            rows:
                Object.freeze([
                    ...rows
                ]),
            hasMore,
            continuation
        });
    }

    async function openSecurity(
        targetWindow,
        row
    ) {
        const session =
            sessions.get(
                targetWindow
            );

        if (!session) {
            throw new Error(
                "Security detail is not attached to this viewer."
            );
        }

        renderLoading(
            targetWindow,
            row
        );

        try {
            const page =
                await loadHistoryDepth(
                    row.securityId,
                    0
                );

            if (
                session.pendingSecurityId !==
                    row.securityId
            ) {
                return;
            }

            renderDetail(
                targetWindow,
                row,
                page
            );

            setViewerState(
                targetWindow,
                "DETAIL",
                "מציג היסטוריה עבור " +
                    (
                        row.paperName ??
                        row.securityId
                    ) +
                    ".",
                row.securityId
            );
        } catch (error) {
            const panel =
                targetWindow
                    .document
                    .querySelector(
                        "[data-role='security-detail-panel']"
                    );

            if (panel) {
                clearPanel(
                    panel
                );

                const message =
                    targetWindow
                        .document
                        .createElement(
                            "p"
                        );

                message.className =
                    "history-error";

                message.dataset.role =
                    "history-error";

                message.textContent =
                    "שגיאה בקריאת היסטוריית הנייר.";

                panel.appendChild(
                    message
                );
            }

            console.error(
                "Market Flow security history load failed.",
                error
            );

            throw error;
        }
    }

    async function refreshFromModel(
        targetWindow,
        model
    ) {
        const session =
            sessions.get(
                targetWindow
            );

        if (!session) {
            return false;
        }

        const viewerState =
            targetWindow
                .MarketFlowViewerShell
                ?.getState?.();

        if (
            viewerState
                ?.viewState !==
                "DETAIL" ||
            !session.securityId
        ) {
            return false;
        }

        const securityId =
            session.securityId;

        const row =
            model
                .rows
                .find(
                    candidate =>
                        candidate
                            .securityId ===
                        securityId
                );

        if (!row) {
            throw new Error(
                "Selected security " +
                securityId +
                " is missing from the refreshed current-table model."
            );
        }

        const minimumRows =
            session
                .loadedRows
                .length;

        const page =
            await loadHistoryDepth(
                securityId,
                minimumRows
            );

        const latestState =
            targetWindow
                .MarketFlowViewerShell
                ?.getState?.();

        if (
            latestState
                ?.viewState !==
                "DETAIL" ||
            session.securityId !==
                securityId
        ) {
            return false;
        }

        renderDetail(
            targetWindow,
            row,
            page
        );

        setViewerState(
            targetWindow,
            "DETAIL",
            "מציג היסטוריה עבור " +
                (
                    row.paperName ??
                    row.securityId
                ) +
                ".",
            securityId
        );

        return true;
    }

    function attach(
        targetWindow
    ) {
        const existing =
            sessions.get(
                targetWindow
            );

        if (existing) {
            return existing.publicState;
        }

        const status =
            targetWindow
                .document
                .querySelector(
                    "[data-role='viewer-status']"
                );

        const session = {
            securityId:
                null,
            row:
                null,
            continuation:
                null,
            hasMore:
                false,
            loadedRows:
                [],
            loadingOlder:
                false,
            pendingSecurityId:
                null,
            mainStatusText:
                status
                    ?.textContent ??
                "מצב שוק נוכחי."
        };

        const publicState =
            Object.freeze({
                open:
                    row => {
                        currentTable
                            .captureViewport(
                                targetWindow
                            );

                        session.pendingSecurityId =
                            row.securityId;

                        session.mainStatusText =
                            targetWindow
                                .document
                                .querySelector(
                                    "[data-role='viewer-status']"
                                )
                                ?.textContent ??
                            session.mainStatusText;

                        return openSecurity(
                            targetWindow,
                            row
                        );
                    },
                back:
                    () => {
                        restoreMain(
                            targetWindow
                        );
                    },
                getState:
                    () =>
                        Object.freeze({
                            securityId:
                                session
                                    .securityId,
                            hasMore:
                                session
                                    .hasMore,
                            loadedCount:
                                session
                                    .loadedRows
                                    .length
                        }),
                close:
                    () => {
                        currentTable
                            .setRowActivationHandler(
                                targetWindow,
                                null
                            );

                        sessions.delete(
                            targetWindow
                        );
                    }
            });

        session.publicState =
            publicState;

        sessions.set(
            targetWindow,
            session
        );

        currentTable
            .setRowActivationHandler(
                targetWindow,
                publicState.open
            );

        return publicState;
    }

    function detach(
        targetWindow
    ) {
        sessions
            .get(
                targetWindow
            )
            ?.publicState
            .close();
    }

    function getState(
        targetWindow
    ) {
        return (
            sessions
                .get(
                    targetWindow
                )
                ?.publicState
                .getState() ??
            null
        );
    }

    window.MarketFlowViewerSecurityDetail =
        Object.freeze({
            HISTORY_COLUMNS,
            attach,
            detach,
            getState,
            refreshFromModel
        });

    console.log(
        "Market Flow viewer security detail loaded."
    );
})();
