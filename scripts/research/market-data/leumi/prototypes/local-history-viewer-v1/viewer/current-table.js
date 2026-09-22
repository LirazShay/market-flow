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
            ".current-table tbody tr:hover { background: #f8fafc; }",
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
            "[data-role='last-update']",
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

            th.textContent =
                column.label;

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
            model.rows
        ) {
            const tr =
                documentRef.createElement(
                    "tr"
                );

            tr.dataset.securityId =
                row.securityId;

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
            "[data-role='last-update']",
            logic.formatCellValue(
                model.summary
                    .lastCollectedAtMs,
                "timestamp"
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
            loadAndRender
        });

    console.log(
        "Market Flow viewer current table loaded."
    );
})();
