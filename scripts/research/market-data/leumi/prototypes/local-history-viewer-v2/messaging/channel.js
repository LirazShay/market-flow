(() => {
    "use strict";

    if (window.MarketFlowChannel) {
        console.warn(
            "MarketFlowChannel is already loaded."
        );
        return;
    }

    const logic =
        window.MarketFlowChannelMessageLogic;

    if (!logic) {
        throw new Error(
            "MarketFlowChannelMessageLogic is not loaded."
        );
    }

    let publisherChannel =
        null;

    function getBroadcastChannelCtor(
        windowRef
    ) {
        const ctor =
            windowRef
                ?.BroadcastChannel;

        return typeof ctor ===
            "function"
            ? ctor
            : null;
    }

    function ensurePublisher() {
        if (publisherChannel) {
            return publisherChannel;
        }

        const BroadcastChannelCtor =
            getBroadcastChannelCtor(
                window
            );

        if (!BroadcastChannelCtor) {
            return null;
        }

        publisherChannel =
            new BroadcastChannelCtor(
                logic.CHANNEL_NAME
            );

        return publisherChannel;
    }

    function publish(
        type,
        metadata = {},
        atMs = Date.now()
    ) {
        const message =
            logic.createMessage(
                type,
                {
                    atMs,
                    metadata
                }
            );

        const channel =
            ensurePublisher();

        if (!channel) {
            return Object.freeze({
                delivered:
                    false,
                reason:
                    "broadcast-channel-unavailable",
                message
            });
        }

        try {
            channel.postMessage(
                message
            );

            return Object.freeze({
                delivered:
                    true,
                reason:
                    null,
                message
            });
        } catch (error) {
            console.error(
                "Market Flow BroadcastChannel publish failed.",
                error
            );

            return Object.freeze({
                delivered:
                    false,
                reason:
                    "broadcast-channel-publish-failed",
                message
            });
        }
    }

    function subscribe(
        targetWindow,
        onMessage
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

        if (
            typeof onMessage !==
            "function"
        ) {
            throw new TypeError(
                "onMessage must be a function."
            );
        }

        const BroadcastChannelCtor =
            getBroadcastChannelCtor(
                targetWindow
            );

        if (!BroadcastChannelCtor) {
            return Object.freeze({
                available:
                    false,
                close:
                    () => {}
            });
        }

        let channel;

        try {
            channel =
                new BroadcastChannelCtor(
                    logic.CHANNEL_NAME
                );
        } catch (error) {
            console.error(
                "Market Flow BroadcastChannel subscribe failed.",
                error
            );

            return Object.freeze({
                available:
                    false,
                close:
                    () => {}
            });
        }

        channel.onmessage =
            event => {
                onMessage(
                    event.data
                );
            };

        return Object.freeze({
            available:
                true,
            close:
                () => {
                    channel.close();
                }
        });
    }

    function closePublisher() {
        if (!publisherChannel) {
            return;
        }

        publisherChannel.close();
        publisherChannel =
            null;
    }

    window.MarketFlowChannel =
        Object.freeze({
            CHANNEL_NAME:
                logic.CHANNEL_NAME,
            MESSAGE_TYPES:
                logic.MESSAGE_TYPES,
            publish,
            subscribe,
            closePublisher
        });

    console.log(
        "Market Flow cross-tab channel loaded."
    );
})();
