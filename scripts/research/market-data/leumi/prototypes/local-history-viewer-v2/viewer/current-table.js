(() => {
    "use strict";

    if (
        window.MarketFlowViewerCurrentTable
    ) {
        console.warn(
            "MarketFlowViewerCurrentTable is already loaded."
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

    const logic =
        window.MarketFlowCurrentTableLogic;

    const sortStateByWindow =
        new WeakMap();

    const rowActivationHandlers =
        new WeakMap();

    const viewportStateByWindow =
        new WeakMap();

    if (
        !schema ||
        !connection ||
        !upgrade ||
        !read ||
        !logic
    ) {
        throw new Error(
            "Viewer current-table dependencies are not loaded."
        );
    }

    function setText(
        documentRef,
        selector,
        value
    ) {
        const element =
            documentRef.querySelector(
                selector
            );

        if (element) {
            element.textContent =
                value;
        }
    }

    function setViewState(
        targetWindow,
        viewState,
        statusText,
        latestError = null
    ) {
        const activeViewState =
            targetWindow
                .MarketFlowViewerShell
                ?.getState?.()
                ?.viewState;

        if (
            activeViewState ===
                "DETAIL" &&
            (
                viewState === "MAIN" ||
                viewState === "EMPTY"
            )
        ) {
            return;
        }

        const documentRef =
            targetWindow.document;

        const status =
            documentRef.querySelector(
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
                latestError
            });
    }

    function ensureStyles(
        documentRef
    ) {
        if (
            documentRef.getElementById(
                "market-flow-current-table-styles"
            )
        ) {
            return;
        }

        const style =
            documentRef.createElement(
                "style"
            );

        style.id =
            "market-flow-current-table-styles";

        style.textContent = [
            ".table-scroll { margin-top: 14px; overflow: auto; max-width: 100%; }",
            ".current-table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 13px; }",
            ".current-table th, .current-table td { padding: 8px 10px; border-bottom: 1px solid #e5e9f1; white-space: nowrap; text-align: right; }",
            ".current-table th { position: sticky; top: 0; z-index: 1; background: #eef2f7; font-weight: 700; }",
            ".current-table-sort-button { width: 100%; border: 0; background: transparent; padding: 0; font: inherit; font-weight: inherit; color: inherit; cursor: pointer; text-align: inherit; white-space: nowrap; }",
            ".current-table-sort-button:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }",
            ".current-table-sort-indicator { display: inline-block; min-width: 1em; margin-inline-start: 4px; }",
            ".current-table tbody tr[data-security-id] { cursor: pointer; }",
            ".current-table tbody tr:hover { background: #f8fafc; }",
            ".current-table tbody tr[data-security-id]:focus-visible { outline: 3px solid currentColor; outline-offset: -3px; }",
            ".current-table td.numeric { direction: ltr; text-align: left; font-variant-numeric: tabular-nums; }",
            ".current-table td.positive { font-weight: 700; }",
            ".current-table td.negative { font-weight: 700; }",
            ".current-table-empty, .current-table-error { margin: 14px 0 0; }",
            ".current-table-error { font-weight: 700; }"
        ].join("\n");

        documentRef.head.appendChild(
            style
        );
    }

    async function loadSnapshot() {
        const database =
            await connection
                .openDatabase({
                    onUpgradeNeeded:
                        upgrade
                            .upgradeDatabase
                });

        try {
            const [
                latestRows,
                universeRows
            ] =
                await Promise.all([
                    read.getAll(
                        database,
                        schema
                            .stores
                            .latest
                            .name
                    ),
                    read.getAll(
                        database,
                        schema
                            .stores
                            .universe
                            .name
                    )
                ]);

            return logic
                .buildCurrentTableModel(
                    latestRows,
                    universeRows
                );
        } finally {
            connection
                .closeDatabase(
                    database
                );
        }
    }

    function clearPanel(
        panel
    ) {
        const existing =
            panel.querySelectorAll(
                [
                    "[data-role='current-market-placeholder']",
                    "[data-role='current-market-table-wrap']",
                    "[data-role='current-market-empty']",
                    "[data-role='current-market-error']"
                ].join(",")
            );

        for (
            const element of
            existing
        ) {
            element.remove();
        }
    }

    function renderEmpty(
        targetWindow,
        model
    ) {
        const documentRef =
            targetWindow.document;

        const panel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        clearPanel(
            panel
        );

        const empty =
            documentRef.createElement(
                "p"
            );

        empty.dataset.role =
            "current-market-empty";

        empty.className =
            "current-table-empty";

        empty.textContent =
            "אין עדיין snapshot מלא.";

        panel.appendChild(
            empty
        );

        setText(
            documentRef,
            "[data-role='security-count']",
            "0"
        );

        setText(
            documentRef,
            "[data-role='last-cycle']",
            "—"
        );

        setText(
            documentRef,
            "[data-role='viewer-footer']",
            "0 ניירות"
        );

        setViewState(
            targetWindow,
            "EMPTY",
            "אין עדיין snapshot מלא."
        );

        return model;
    }

    function getSortState(
        targetWindow
    ) {
        let sortState =
            sortStateByWindow.get(
                targetWindow
            );

        if (!sortState) {
            sortState =
                logic
                    .createInitialSortState();

            sortStateByWindow.set(
                targetWindow,
                sortState
            );
        }

        return sortState;
    }

    function setSortState(
        targetWindow,
        sortState
    ) {
        sortStateByWindow.set(
            targetWindow,
            sortState
        );

        return sortState;
    }

    function getAriaSort(
        sortState,
        columnKey
    ) {
        if (
            sortState.columnKey !==
            columnKey
        ) {
            return "none";
        }

        return sortState.direction ===
            "asc"
            ? "ascending"
            : "descending";
    }

    function getSortIndicator(
        sortState,
        columnKey
    ) {
        if (
            sortState.columnKey !==
            columnKey
        ) {
            return "";
        }

        return sortState.direction ===
            "asc"
            ? "▲"
            : "▼";
    }

    function captureViewport(
        targetWindow
    ) {
        const wrapper =
            targetWindow
                .document
                .querySelector(
                    "[data-role='current-market-table-wrap']"
                );

        if (!wrapper) {
            return (
                viewportStateByWindow.get(
                    targetWindow
                ) ??
                Object.freeze({
                    scrollLeft: 0,
                    scrollTop: 0
                })
            );
        }

        const viewport =
            Object.freeze({
                scrollLeft:
                    wrapper.scrollLeft,
                scrollTop:
                    wrapper.scrollTop
            });

        viewportStateByWindow.set(
            targetWindow,
            viewport
        );

        return viewport;
    }

    function restoreViewport(
        targetWindow
    ) {
        const viewport =
            viewportStateByWindow.get(
                targetWindow
            );

        const wrapper =
            targetWindow
                .document
                .querySelector(
                    "[data-role='current-market-table-wrap']"
                );

        if (
            !viewport ||
            !wrapper
        ) {
            return false;
        }

        wrapper.scrollLeft =
            viewport.scrollLeft;

        wrapper.scrollTop =
            viewport.scrollTop;

        return true;
    }

    function setRowActivationHandler(
        targetWindow,
        handler
    ) {
        if (
            !targetWindow ||
            typeof targetWindow !==
                "object"
        ) {
            throw new TypeError(
                "targetWindow is required."
            );
        }

        if (handler === null) {
            rowActivationHandlers.delete(
                targetWindow
            );

            return;
        }

        if (
            typeof handler !==
                "function"
        ) {
            throw new TypeError(
                "row activation handler must be a function or null."
            );
        }

        rowActivationHandlers.set(
            targetWindow,
            handler
        );
    }

    function activateRow(
        targetWindow,
        row
    ) {
        const handler =
            rowActivationHandlers.get(
                targetWindow
            );

        if (!handler) {
            return;
        }

        try {
            const result =
                handler(
                    row
                );

            if (
                result &&
                typeof result.catch ===
                    "function"
            ) {
                result.catch(
                    error => {
                        console.error(
                            "Market Flow viewer row activation failed.",
                            error
                        );
                    }
                );
            }
        } catch (error) {
            console.error(
                "Market Flow viewer row activation failed.",
                error
            );
        }
    }

    function renderModel(
        targetWindow,
        model
    ) {
        const documentRef =
            targetWindow.document;

        const panel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        if (!panel) {
            throw new Error(
                "Viewer current-market panel is missing."
            );
        }

        ensureStyles(
            documentRef
        );

        if (!panel.hidden) {
            captureViewport(
                targetWindow
            );
        }

        clearPanel(
            panel
        );

        if (
            model.rows.length ===
            0
        ) {
            return renderEmpty(
                targetWindow,
                model
            );
        }

        const sortState =
            getSortState(
                targetWindow
            );

        const sortedRows =
            logic
                .sortCurrentTableRows(
                    model.rows,
                    sortState
                );

        const wrapper =
            documentRef.createElement(
                "div"
            );

        wrapper.className =
            "table-scroll";

        wrapper.dataset.role =
            "current-market-table-wrap";

        const table =
            documentRef.createElement(
                "table"
            );

        table.className =
            "current-table";

        table.dataset.role =
            "current-market-table";

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
            model.columns
        ) {
            const th =
                documentRef.createElement(
                    "th"
                );

            th.scope =
                "col";

            th.dataset.column =
                column.key;

            th.setAttribute(
                "aria-sort",
                getAriaSort(
                    sortState,
                    column.key
                )
            );

            const button =
                documentRef.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "current-table-sort-button";

            button.dataset.sortColumn =
                column.key;

            button.setAttribute(
                "aria-label",
                "מיין לפי " +
                column.label
            );

            const label =
                documentRef.createElement(
                    "span"
                );

            label.textContent =
                column.label;

            button.appendChild(
                label
            );

            const indicator =
                documentRef.createElement(
                    "span"
                );

            indicator.className =
                "current-table-sort-indicator";

            indicator.setAttribute(
                "aria-hidden",
                "true"
            );

            indicator.textContent =
                getSortIndicator(
                    sortState,
                    column.key
                );

            button.appendChild(
                indicator
            );

            button.addEventListener(
                "click",
                () => {
                    const nextSortState =
                        logic
                            .getNextSortState(
                                getSortState(
                                    targetWindow
                                ),
                                column.key
                            );

                    setSortState(
                        targetWindow,
                        nextSortState
                    );

                    renderModel(
                        targetWindow,
                        model
                    );
                }
            );

            th.appendChild(
                button
            );

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

        for (
            const row of
            sortedRows
        ) {
            const tr =
                documentRef.createElement(
                    "tr"
                );

            tr.dataset.securityId =
                row.securityId;

            tr.tabIndex =
                0;

            tr.setAttribute(
                "aria-label",
                "פתח היסטוריה עבור " +
                (
                    row.paperName ??
                    row.securityId
                )
            );

            tr.addEventListener(
                "click",
                () => {
                    activateRow(
                        targetWindow,
                        row
                    );
                }
            );

            tr.addEventListener(
                "keydown",
                event => {
                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    event.preventDefault();

                    activateRow(
                        targetWindow,
                        row
                    );
                }
            );

            for (
                const column of
                model.columns
            ) {
                const td =
                    documentRef.createElement(
                        "td"
                    );

                td.dataset.column =
                    column.key;

                const rawValue =
                    logic.getColumnValue(
                        row,
                        column
                    );

                td.textContent =
                    logic.formatCellValue(
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

                if (
                    column.key ===
                        "BaseRateChangePercentage" &&
                    Number.isFinite(
                        rawValue
                    )
                ) {
                    if (rawValue > 0) {
                        td.classList.add(
                            "positive"
                        );
                    } else if (
                        rawValue < 0
                    ) {
                        td.classList.add(
                            "negative"
                        );
                    }
                }

                tr.appendChild(
                    td
                );
            }

            tbody.appendChild(
                tr
            );
        }

        table.appendChild(
            tbody
        );

        wrapper.appendChild(
            table
        );

        panel.appendChild(
            wrapper
        );

        if (!panel.hidden) {
            restoreViewport(
                targetWindow
            );
        }

        setText(
            documentRef,
            "[data-role='security-count']",
            String(
                model.summary
                    .rowCount
            )
        );

        setText(
            documentRef,
            "[data-role='last-cycle']",
            model.summary
                .lastCycleId ===
            null
                ? "—"
                : String(
                    model.summary
                        .lastCycleId
                )
        );

        setText(
            documentRef,
            "[data-role='viewer-footer']",
            model.summary
                .rowCount +
                " ניירות"
        );

        setViewState(
            targetWindow,
            "MAIN",
            "נטענו " +
                model.summary
                    .rowCount +
                " ניירות מ-IndexedDB."
        );

        return model;
    }

    function renderError(
        targetWindow,
        error
    ) {
        const documentRef =
            targetWindow.document;

        const panel =
            documentRef.querySelector(
                "[data-role='current-market-panel']"
            );

        if (panel) {
            clearPanel(
                panel
            );

            const message =
                documentRef.createElement(
                    "p"
                );

            message.className =
                "current-table-error";

            message.dataset.role =
                "current-market-error";

            message.textContent =
                "שגיאה בקריאת נתוני IndexedDB.";

            panel.appendChild(
                message
            );
        }

        setViewState(
            targetWindow,
            "ERROR",
            "שגיאה בקריאת נתוני IndexedDB.",
            {
                name:
                    error?.name ??
                    "Error",
                message:
                    error?.message ??
                    String(error)
            }
        );

        console.error(
            "Market Flow viewer current-table refresh failed.",
            error
        );
    }

    async function loadAndRender(
        targetWindow
    ) {
        try {
            const model =
                await loadSnapshot();

            return renderModel(
                targetWindow,
                model
            );
        } catch (error) {
            renderError(
                targetWindow,
                error
            );

            throw error;
        }
    }

    window.MarketFlowViewerCurrentTable =
        Object.freeze({
            loadSnapshot,
            renderModel,
            loadAndRender,
            setRowActivationHandler,
            captureViewport,
            restoreViewport
        });

    console.log(
        "Market Flow viewer current table loaded."
    );
})();
