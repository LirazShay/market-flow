(() => {
    "use strict";

    if (
        window.MarketFlowViewerLiveRefresh
    ) {
        console.warn(
            "MarketFlowViewerLiveRefresh is already loaded."
        );
        return;
    }

    const channel =
        window.MarketFlowChannel;

    const messageLogic =
        window.MarketFlowChannelMessageLogic;

    const currentTable =
        window.MarketFlowViewerCurrentTable;

    const securityDetail =
        window.MarketFlowViewerSecurityDetail;

    if (
        !channel ||
        !messageLogic ||
        !currentTable ||
        !securityDetail
    ) {
        throw new Error(
            "Viewer live-refresh dependencies are not loaded."
        );
    }

    const sessions =
        new WeakMap();

    function setText(
        targetWindow,
        role,
        value
    ) {
        const element =
            targetWindow
                .document
                .querySelector(
                    "[data-role='" +
                    role +
                    "']"
                );

        if (element) {
            element.textContent =
                value;
        }
    }

    function setMode(
        targetWindow,
        mode
    ) {
        const shell =
            targetWindow
                .MarketFlowViewerShell;

        shell?.setState?.({
            liveRefreshMode:
                mode
        });

        if (
            mode ===
            "broadcast"
        ) {
            setText(
                targetWindow,
                "live-refresh-status",
                "עדכון חי פעיל"
            );
        } else {
            setText(
                targetWindow,
                "live-refresh-status",
                "עדכון חי לא זמין — אפשר לרענן ידנית"
            );
        }
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

        let refreshInFlight =
            false;

        let refreshPending =
            false;

        let refreshCount =
            0;

        let lastReason =
            null;

        let closed =
            false;

        async function executeRefresh(
            reason
        ) {
            if (closed) {
                return null;
            }

            if (refreshInFlight) {
                refreshPending =
                    true;

                lastReason =
                    reason;

                return null;
            }

            refreshInFlight =
                true;

            lastReason =
                reason;

            try {
                const model =
                    await currentTable
                        .loadAndRender(
                            targetWindow
                        );

                await securityDetail
                    .refreshFromModel(
                        targetWindow,
                        model
                    );

                refreshCount++;

                return model;
            } finally {
                refreshInFlight =
                    false;

                if (
                    refreshPending &&
                    !closed
                ) {
                    refreshPending =
                        false;

                    const pendingReason =
                        lastReason;

                    targetWindow
                        .setTimeout(
                            () => {
                                executeRefresh(
                                    pendingReason
                                ).catch(
                                    error => {
                                        console.error(
                                            "Deferred viewer refresh failed.",
                                            error
                                        );
                                    }
                                );
                            },
                            0
                        );
                }
            }
        }

        const subscription =
            channel.subscribe(
                targetWindow,
                message => {
                    if (
                        messageLogic
                            .isRefreshMessage(
                                message
                            )
                    ) {
                        executeRefresh(
                            "broadcast:" +
                            message.type
                        ).catch(
                            error => {
                                console.error(
                                    "Broadcast-triggered viewer refresh failed.",
                                    error
                                );
                            }
                        );
                    }
                }
            );

        setMode(
            targetWindow,
            subscription.available
                ? "broadcast"
                : "manual"
        );

        const manualButton =
            targetWindow
                .document
                .querySelector(
                    "[data-role='manual-refresh']"
                );

        const manualHandler =
            () => {
                executeRefresh(
                    "manual"
                ).catch(
                    error => {
                        console.error(
                            "Manual viewer refresh failed.",
                            error
                        );
                    }
                );
            };

        manualButton
            ?.addEventListener(
                "click",
                manualHandler
            );

        const publicState =
            Object.freeze({
                available:
                    subscription
                        .available,
                refresh:
                    reason =>
                        executeRefresh(
                            reason ??
                            "manual-api"
                        ),
                getState:
                    () =>
                        Object.freeze({
                            available:
                                subscription
                                    .available,
                            refreshInFlight,
                            refreshPending,
                            refreshCount,
                            lastReason
                        }),
                close:
                    () => {
                        if (closed) {
                            return;
                        }

                        closed =
                            true;

                        manualButton
                            ?.removeEventListener(
                                "click",
                                manualHandler
                            );

                        subscription
                            .close();

                        sessions.delete(
                            targetWindow
                        );
                    }
            });

        sessions.set(
            targetWindow,
            {
                publicState
            }
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

    window.MarketFlowViewerLiveRefresh =
        Object.freeze({
            attach,
            detach,
            getState
        });

    console.log(
        "Market Flow viewer live refresh loaded."
    );
})();
