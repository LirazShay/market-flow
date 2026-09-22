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

    if (!stateLogic) {
        throw new Error(
            "MarketFlowViewerStateLogic is not loaded."
        );
    }

    const VIEWER_WINDOW_NAME =
        "market-flow-leumi-v1-viewer";

    const VIEWER_MARKER =
        "market-flow-leumi-v1";

    let viewerWindow =
        null;

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
            "מספר ניירות",
            "security-count"
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
            "Market Flow Local History Viewer V1";

        shell.appendChild(
            footer
        );

        documentRef.body.appendChild(
            shell
        );

        targetWindow
            .MarketFlowViewerShell =
            Object.freeze({
                marker:
                    VIEWER_MARKER,
                initialState,
                openedFromOrigin:
                    window.location.origin
            });

        return targetWindow;
    }

    function isViewerOpen() {
        return Boolean(
            viewerWindow &&
            !viewerWindow.closed
        );
    }

    function openViewer() {
        if (isViewerOpen()) {
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
            renderShell(
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

        viewerWindow.close();
        viewerWindow =
            null;
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
