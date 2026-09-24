(() => {
    "use strict";

    if (
        window.MarketFlowViewerBootstrap
    ) {
        console.warn(
            "MarketFlowViewerBootstrap is already loaded."
        );
        return;
    }

    const stateLogic =
        window.MarketFlowViewerStateLogic;

    const currentTable =
        window.MarketFlowViewerCurrentTable;

    const liveRefresh =
        window.MarketFlowViewerLiveRefresh;

    const securityDetail =
        window.MarketFlowViewerSecurityDetail;

    const diagnostics =
        window.MarketFlowViewerDiagnostics;

    const debugBundle =
        window.MarketFlowDebugBundle;

    if (!stateLogic) {
        throw new Error(
            "MarketFlowViewerStateLogic is not loaded."
        );
    }

    if (!currentTable) {
        throw new Error(
            "MarketFlowViewerCurrentTable is not loaded. " +
            "Load viewer/current-table.js before viewer/bootstrap.js."
        );
    }

    if (!liveRefresh) {
        throw new Error(
            "MarketFlowViewerLiveRefresh is not loaded. " +
            "Load viewer/live-refresh.js before viewer/bootstrap.js."
        );
    }

    if (!securityDetail) {
        throw new Error(
            "MarketFlowViewerSecurityDetail is not loaded. " +
            "Load viewer/security-detail.js before viewer/bootstrap.js."
        );
    }

    if (!diagnostics) {
        throw new Error(
            "MarketFlowViewerDiagnostics is not loaded. " +
            "Load viewer/diagnostics.js before viewer/bootstrap.js."
        );
    }

    if (!debugBundle) {
        throw new Error(
            "MarketFlowDebugBundle is not loaded. " +
            "Load debug/debug-bundle.js before viewer/bootstrap.js."
        );
    }

    const VIEWER_WINDOW_NAME =
        "market-flow-leumi-v2-viewer";

    const VIEWER_MARKER =
        "market-flow-leumi-v2";

    let viewerWindow =
        null;

    let recoveryTimer =
        null;

    let closingViewer =
        false;

    const reloadHandlerByWindow =
        new WeakMap();

    function appendTextElement(
        documentRef,
        parent,
        tagName,
        text,
        attributes = {}
    ) {
        const element =
            documentRef.createElement(
                tagName
            );

        element.textContent =
            text;

        for (
            const [
                name,
                value
            ] of
            Object.entries(
                attributes
            )
        ) {
            element.setAttribute(
                name,
                value
            );
        }

        parent.appendChild(
            element
        );

        return element;
    }

    function createMetric(
        documentRef,
        container,
        label,
        role
    ) {
        const item =
            documentRef.createElement(
                "div"
            );

        item.className =
            "metric";

        appendTextElement(
            documentRef,
            item,
            "span",
            label,
            {
                class:
                    "metric-label"
            }
        );

        appendTextElement(
            documentRef,
            item,
            "strong",
            "—",
            {
                "data-role":
                    role,
                class:
                    "metric-value"
            }
        );

        container.appendChild(
            item
        );
    }

    function applyShellStyles(
        documentRef
    ) {
        const style =
            documentRef.createElement(
                "style"
            );

        style.textContent = [
            ":root { color-scheme: light; font-family: Arial, sans-serif; }",
            "* { box-sizing: border-box; }",
            "body { margin: 0; background: #f6f8fb; color: #172033; }",
            ".viewer-shell { min-height: 100vh; display: grid; grid-template-rows: auto auto 1fr auto; }",
            ".viewer-header { padding: 18px 24px 10px; background: #fff; border-bottom: 1px solid #d9dfeb; }",
            ".viewer-header h1 { margin: 0; font-size: 24px; }",
            ".viewer-status { margin-top: 8px; font-size: 14px; }",
            ".viewer-actions { margin-top: 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }",
            ".viewer-actions button { border: 1px solid #cfd6e4; border-radius: 6px; background: #fff; padding: 7px 12px; cursor: pointer; }",
            ".live-refresh-status { font-size: 12px; color: #667085; }",
            ".metrics { display: flex; flex-wrap: wrap; gap: 10px; padding: 12px 24px; background: #fff; border-bottom: 1px solid #e5e9f1; }",
            ".metric { min-width: 150px; display: grid; gap: 3px; }",
            ".metric-label { font-size: 12px; color: #667085; }",
            ".metric-value { font-size: 14px; }",
            ".viewer-main { min-width: 0; padding: 18px 24px; }",
            ".panel { background: #fff; border: 1px solid #dfe4ec; border-radius: 10px; padding: 16px; }",
            ".placeholder { margin: 14px 0 0; color: #667085; }",
            ".viewer-footer { padding: 10px 24px; background: #fff; border-top: 1px solid #d9dfeb; font-size: 13px; }",
            "button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }"
        ].join("\n");

        documentRef.head.appendChild(
            style
        );
    }

    function renderShell(
        targetWindow
    ) {
        const documentRef =
            targetWindow.document;

        const initialState =
            stateLogic
                .createInitialViewerState(
                    Date.now()
                );

        documentRef.open();
        documentRef.write(
            "<!doctype html><html lang=\"he\" dir=\"rtl\"><head><meta charset=\"utf-8\"><title>Market Flow — תצוגת שוק</title></head><body></body></html>"
        );
        documentRef.close();

        documentRef
            .documentElement
            .setAttribute(
                "data-market-flow-viewer",
                VIEWER_MARKER
            );

        applyShellStyles(
            documentRef
        );

        const shell =
            documentRef.createElement(
                "div"
            );

        shell.className =
            "viewer-shell";

        const header =
            documentRef.createElement(
                "header"
            );

        header.className =
            "viewer-header";

        appendTextElement(
            documentRef,
            header,
            "h1",
            "Market Flow — תצוגת שוק"
        );

        appendTextElement(
            documentRef,
            header,
            "div",
            "טוען נתונים...",
            {
                class:
                    "viewer-status",
                "data-role":
                    "viewer-status",
                "data-view-state":
                    initialState
                        .viewState,
                "aria-live":
                    "polite"
            }
        );

        const actions =
            documentRef.createElement(
                "div"
            );

        actions.className =
            "viewer-actions";

        const refreshButton =
            documentRef.createElement(
                "button"
            );

        refreshButton.type =
            "button";

        refreshButton.dataset.role =
            "manual-refresh";

        refreshButton.textContent =
            "רענן תצוגה";

        actions.appendChild(
            refreshButton
        );

        appendTextElement(
            documentRef,
            actions,
            "span",
            "בודק עדכון חי...",
            {
                "data-role":
                    "live-refresh-status",
                class:
                    "live-refresh-status"
            }
        );

        const exportDebugButton =
            documentRef.createElement(
                "button"
            );

        exportDebugButton.type =
            "button";

        exportDebugButton.dataset.role =
            "export-debug";

        exportDebugButton.textContent =
            "הורד קובץ Debug";

        actions.appendChild(
            exportDebugButton
        );

        const debugExportStatus =
            appendTextElement(
                documentRef,
                actions,
                "span",
                "",
                {
                    "data-role":
                        "debug-export-status",
                    class:
                        "live-refresh-status",
                    "aria-live":
                        "polite"
                }
            );

        exportDebugButton
            .addEventListener(
                "click",
                async () => {
                    if (
                        exportDebugButton
                            .disabled
                    ) {
                        return;
                    }

                    exportDebugButton
                        .disabled =
                        true;

                    debugExportStatus
                        .textContent =
                        "מכין קובץ Debug...";

                    try {
                        const result =
                            await debugBundle
                                .download();

                        debugExportStatus
                            .textContent =
                            "הורד: " +
                            result
                                .fileName;
                    } catch (error) {
                        console.error(
                            "Debug Bundle export failed.",
                            error
                        );

                        debugExportStatus
                            .textContent =
                            "ייצוא Debug נכשל.";
                    } finally {
                        exportDebugButton
                            .disabled =
                            false;
                    }
                }
            );

        header.appendChild(
            actions
        );

        shell.appendChild(
            header
        );

        const metrics =
            documentRef.createElement(
                "section"
            );

        metrics.className =
            "metrics";

        metrics.setAttribute(
            "aria-label",
            "מצב מערכת"
        );

        createMetric(
            documentRef,
            metrics,
            "מצב recorder",
            "recorder-health"
        );

        createMetric(
            documentRef,
            metrics,
            "עדכון אחרון",
            "last-update"
        );

        createMetric(
            documentRef,
            metrics,
            "Cycle אחרון",
            "last-cycle"
        );

        createMetric(
            documentRef,
            metrics,
            "משך cycle",
            "cycle-duration"
        );

        createMetric(
            documentRef,
            metrics,
            "מספר ניירות",
            "security-count"
        );

        createMetric(
            documentRef,
            metrics,
            "Cycles מוצלחים",
            "completed-cycles"
        );

        createMetric(
            documentRef,
            metrics,
            "Cycles שנכשלו",
            "failed-cycles"
        );

        createMetric(
            documentRef,
            metrics,
            "גודל history",
            "history-count"
        );

        createMetric(
            documentRef,
            metrics,
            "אחסון",
            "storage-usage"
        );

        shell.appendChild(
            metrics
        );

        const main =
            documentRef.createElement(
                "main"
            );

        main.className =
            "viewer-main";

        main.setAttribute(
            "data-role",
            "viewer-main"
        );

        const currentPanel =
            documentRef.createElement(
                "section"
            );

        currentPanel.className =
            "panel";

        currentPanel.setAttribute(
            "data-role",
            "current-market-panel"
        );

        appendTextElement(
            documentRef,
            currentPanel,
            "h2",
            "מצב שוק נוכחי"
        );

        appendTextElement(
            documentRef,
            currentPanel,
            "p",
            "טבלת הנתונים תיטען מ-IndexedDB בשלב הבא.",
            {
                class:
                    "placeholder",
                "data-role":
                    "current-market-placeholder"
            }
        );

        main.appendChild(
            currentPanel
        );

        const detailPanel =
            documentRef.createElement(
                "section"
            );

        detailPanel.className =
            "panel";

        detailPanel.hidden =
            true;

        detailPanel.setAttribute(
            "data-role",
            "security-detail-panel"
        );

        appendTextElement(
            documentRef,
            detailPanel,
            "h2",
            "היסטוריית נייר"
        );

        main.appendChild(
            detailPanel
        );

        shell.appendChild(
            main
        );

        const footer =
            documentRef.createElement(
                "footer"
            );

        footer.className =
            "viewer-footer";

        footer.setAttribute(
            "data-role",
            "viewer-footer"
        );

        footer.textContent =
            "Market Flow Local History Viewer V2";

        shell.appendChild(
            footer
        );

        documentRef.body.appendChild(
            shell
        );

        let currentState =
            initialState;

        targetWindow
            .MarketFlowViewerShell =
            Object.freeze({
                marker:
                    VIEWER_MARKER,
                initialState,
                openedFromOrigin:
                    window.location.origin,
                getState:
                    () =>
                        currentState,
                setState:
                    patch => {
                        currentState =
                            Object.freeze({
                                ...currentState,
                                ...patch
                            });

                        return currentState;
                    }
            });

        return targetWindow;
    }

    function detachViewerModules(
        targetWindow
    ) {
        securityDetail.detach(
            targetWindow
        );

        diagnostics.detach(
            targetWindow
        );

        liveRefresh.detach(
            targetWindow
        );
    }

    function loadViewerData(
        targetWindow
    ) {
        diagnostics
            .refresh(
                targetWindow
            )
            .catch(
                error => {
                    console.error(
                        "Initial viewer diagnostics load failed.",
                        error
                    );
                }
            );

        currentTable
            .loadAndRender(
                targetWindow
            )
            .catch(
                () => {
                    // Error state is rendered by the current-table module.
                }
            );
    }

    function removeReloadRecoveryHook(
        targetWindow
    ) {
        const handler =
            reloadHandlerByWindow
                .get(
                    targetWindow
                );

        if (!handler) {
            return;
        }

        try {
            targetWindow
                .removeEventListener(
                    "beforeunload",
                    handler
                );
        } catch {
            // Ignore cleanup failure during navigation.
        }

        reloadHandlerByWindow
            .delete(
                targetWindow
            );
    }

    function cancelPendingRecovery() {
        if (
            recoveryTimer !==
            null
        ) {
            clearTimeout(
                recoveryTimer
            );

            recoveryTimer =
                null;
        }
    }

    function initializeViewerWindow(
        targetWindow
    ) {
        removeReloadRecoveryHook(
            targetWindow
        );

        renderShell(
            targetWindow
        );

        securityDetail.attach(
            targetWindow
        );

        diagnostics.attach(
            targetWindow
        );

        liveRefresh.attach(
            targetWindow
        );

        loadViewerData(
            targetWindow
        );
    }

    function scheduleReloadRecovery(
        targetWindow
    ) {
        cancelPendingRecovery();

        const startedAtMs =
            Date.now();

        const poll =
            () => {
                recoveryTimer =
                    null;

                if (
                    closingViewer ||
                    viewerWindow !==
                        targetWindow ||
                    targetWindow.closed
                ) {
                    return;
                }

                let marker =
                    null;

                let shell =
                    null;

                try {
                    marker =
                        targetWindow
                            .document
                            .documentElement
                            ?.dataset
                            ?.marketFlowViewer ??
                        null;

                    shell =
                        targetWindow
                            .MarketFlowViewerShell ??
                        null;
                } catch {
                    marker =
                        null;

                    shell =
                        null;
                }

                if (
                    marker ===
                        VIEWER_MARKER &&
                    shell
                ) {
                    if (
                        Date.now() -
                            startedAtMs <
                        5000
                    ) {
                        recoveryTimer =
                            setTimeout(
                                poll,
                                25
                            );
                    }

                    return;
                }

                try {
                    initializeViewerWindow(
                        targetWindow
                    );

                    installReloadRecoveryHook(
                        targetWindow
                    );

                    targetWindow.focus();
                } catch (error) {
                    if (
                        Date.now() -
                            startedAtMs >=
                        5000
                    ) {
                        console.error(
                            "Viewer reload recovery failed.",
                            error
                        );

                        return;
                    }

                    recoveryTimer =
                        setTimeout(
                            poll,
                            25
                        );
                }
            };

        recoveryTimer =
            setTimeout(
                poll,
                0
            );
    }

    function installReloadRecoveryHook(
        targetWindow
    ) {
        removeReloadRecoveryHook(
            targetWindow
        );

        const handler =
            () => {
                if (
                    closingViewer ||
                    viewerWindow !==
                        targetWindow
                ) {
                    return;
                }

                detachViewerModules(
                    targetWindow
                );

                scheduleReloadRecovery(
                    targetWindow
                );
            };

        reloadHandlerByWindow
            .set(
                targetWindow,
                handler
            );

        targetWindow
            .addEventListener(
                "beforeunload",
                handler
            );
    }

    function hasViewerShell(
        targetWindow
    ) {
        try {
            return Boolean(
                targetWindow
                    .MarketFlowViewerShell &&
                targetWindow
                    .document
                    .documentElement
                    ?.dataset
                    ?.marketFlowViewer ===
                    VIEWER_MARKER
            );
        } catch {
            return false;
        }
    }

    function isViewerOpen() {
        return Boolean(
            viewerWindow &&
            !viewerWindow.closed
        );
    }

    function openViewer() {
        if (isViewerOpen()) {
            if (
                !hasViewerShell(
                    viewerWindow
                )
            ) {
                initializeViewerWindow(
                    viewerWindow
                );

                installReloadRecoveryHook(
                    viewerWindow
                );
            }

            viewerWindow.focus();
            return viewerWindow;
        }

        viewerWindow =
            window.open(
                "about:blank",
                VIEWER_WINDOW_NAME
            );

        if (!viewerWindow) {
            throw new Error(
                "Viewer window could not be opened. The browser may have blocked the popup."
            );
        }

        try {
            initializeViewerWindow(
                viewerWindow
            );

            installReloadRecoveryHook(
                viewerWindow
            );
        } catch (error) {
            try {
                viewerWindow.close();
            } catch {
                // Ignore cleanup failure.
            }

            viewerWindow =
                null;

            throw new Error(
                "Viewer must open in a same-origin child window. " +
                error.message
            );
        }

        viewerWindow.focus();

        return viewerWindow;
    }

    function closeViewer() {
        if (!isViewerOpen()) {
            viewerWindow =
                null;
            return;
        }

        closingViewer =
            true;

        cancelPendingRecovery();

        removeReloadRecoveryHook(
            viewerWindow
        );

        detachViewerModules(
            viewerWindow
        );

        viewerWindow.close();
        viewerWindow =
            null;

        closingViewer =
            false;
    }

    function getViewerSnapshot() {
        if (!isViewerOpen()) {
            return Object.freeze({
                isOpen:
                    false,
                windowName:
                    VIEWER_WINDOW_NAME,
                marker:
                    VIEWER_MARKER,
                state:
                    null
            });
        }

        return Object.freeze({
            isOpen:
                true,
            windowName:
                viewerWindow.name,
            marker:
                viewerWindow
                    .MarketFlowViewerShell
                    ?.marker ??
                null,
            state:
                viewerWindow
                    .MarketFlowViewerShell
                    ?.getState?.() ??
                viewerWindow
                    .MarketFlowViewerShell
                    ?.initialState ??
                null,
            title:
                viewerWindow
                    .document
                    .title ??
                null
        });
    }

    window.MarketFlowViewerBootstrap =
        Object.freeze({
            VIEWER_WINDOW_NAME,
            VIEWER_MARKER,
            openViewer,
            closeViewer,
            isViewerOpen,
            getViewerSnapshot
        });

    console.log(
        "Market Flow viewer bootstrap loaded."
    );
})();
