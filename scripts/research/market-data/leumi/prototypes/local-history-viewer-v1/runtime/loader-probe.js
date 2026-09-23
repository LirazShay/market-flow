(() => {
    "use strict";

    const DEFAULT_MANIFEST_URL =
        "https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-v1.manifest.json";

    const PANEL_ID =
        "market-flow-loader-probe-panel";

    const DOWNLOAD_PREFIX =
        "market-flow-loader-probe";

    if (
        window
            .MarketFlowLoaderProbeRunning
    ) {
        return;
    }

    window
        .MarketFlowLoaderProbeRunning =
        true;

    const result = {
        formatVersion: 1,
        startedAtMs:
            Date.now(),
        completedAtMs:
            null,
        pageOrigin:
            window
                .location
                .origin,
        manifestUrl:
            null,
        steps: {
            manifestFetch:
                null,
            runtimeFetch:
                null,
            runtimeHash:
                null,
            runtimeCompile:
                null
        },
        cspViolations: [],
        overallSuccess:
            false
    };

    function normalizeError(
        error
    ) {
        return {
            name:
                error?.name ??
                "Error",
            message:
                error?.message ??
                String(error)
        };
    }

    function safeRequestedUrl(
        value
    ) {
        try {
            const url =
                new URL(
                    value,
                    window
                        .location
                        .href
                );

            return (
                url.origin +
                url.pathname
            );
        } catch {
            return String(
                value
            );
        }
    }

    function getManifestUrl() {
        const configured =
            window
                .MarketFlowLoaderProbeConfig
                ?.manifestUrl;

        if (
            configured ===
                undefined
        ) {
            return DEFAULT_MANIFEST_URL;
        }

        if (
            typeof configured !==
                "string" ||
            configured.length ===
                0
        ) {
            throw new TypeError(
                "MarketFlowLoaderProbeConfig.manifestUrl must be a non-empty string."
            );
        }

        return configured;
    }

    async function sha256Hex(
        text
    ) {
        if (
            !window.crypto ||
            !window.crypto.subtle
        ) {
            throw new Error(
                "Web Crypto subtle API is unavailable."
            );
        }

        const bytes =
            new TextEncoder()
                .encode(
                    text
                );

        const digest =
            await window
                .crypto
                .subtle
                .digest(
                    "SHA-256",
                    bytes
                );

        return Array.from(
            new Uint8Array(
                digest
            ),
            value =>
                value
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        ).join("");
    }

    async function fetchText(
        requestedUrl
    ) {
        const response =
            await window.fetch(
                requestedUrl,
                {
                    method:
                        "GET",
                    mode:
                        "cors",
                    credentials:
                        "omit",
                    cache:
                        "no-store",
                    redirect:
                        "follow",
                    referrerPolicy:
                        "no-referrer"
                }
            );

        if (!response.ok) {
            throw new Error(
                "HTTP " +
                response.status
            );
        }

        return {
            status:
                response.status,
            text:
                await response
                    .text()
        };
    }

    function validateManifest(
        manifest
    ) {
        if (
            !manifest ||
            typeof manifest !==
                "object" ||
            manifest
                .formatVersion !==
                1 ||
            typeof manifest
                .buildId !==
                "string" ||
            !manifest.runtime ||
            typeof manifest
                .runtime
                .url !==
                "string" ||
            typeof manifest
                .runtime
                .sha256 !==
                "string" ||
            !Number.isInteger(
                manifest
                    .runtime
                    .bytes
            )
        ) {
            throw new Error(
                "Runtime manifest shape is invalid."
            );
        }

        return manifest;
    }

    function createDownloadName() {
        const date =
            new Date();

        const pad =
            value =>
                String(value)
                    .padStart(
                        2,
                        "0"
                    );

        return (
            DOWNLOAD_PREFIX +
            "-" +
            date.getFullYear() +
            pad(
                date.getMonth() +
                1
            ) +
            pad(
                date.getDate()
            ) +
            "-" +
            pad(
                date.getHours()
            ) +
            pad(
                date.getMinutes()
            ) +
            pad(
                date.getSeconds()
            ) +
            ".json"
        );
    }

    function downloadResult() {
        const text =
            JSON.stringify(
                result,
                null,
                2
            ) +
            "\n";

        const blob =
            new Blob(
                [
                    text
                ],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );

        const url =
            URL
                .createObjectURL(
                    blob
                );

        const anchor =
            document
                .createElement(
                    "a"
                );

        anchor.href =
            url;

        anchor.download =
            createDownloadName();

        anchor.style.display =
            "none";

        document.body
            .appendChild(
                anchor
            );

        anchor.click();
        anchor.remove();

        window.setTimeout(
            () =>
                URL
                    .revokeObjectURL(
                        url
                    ),
            0
        );
    }

    function stepText(
        step
    ) {
        if (!step) {
            return "לא נבדק";
        }

        if (step.success) {
            return "עבר";
        }

        return (
            "נכשל: " +
            (
                step
                    .error
                    ?.message ??
                "unknown"
            )
        );
    }

    function renderResult() {
        document
            .getElementById(
                PANEL_ID
            )
            ?.remove();

        const panel =
            document
                .createElement(
                    "section"
                );

        panel.id =
            PANEL_ID;

        panel.dir =
            "rtl";

        panel.style.cssText = [
            "position:fixed",
            "top:16px",
            "right:16px",
            "z-index:2147483647",
            "width:min(520px,calc(100vw - 32px))",
            "max-height:calc(100vh - 32px)",
            "overflow:auto",
            "background:#fff",
            "color:#111827",
            "border:1px solid #94a3b8",
            "border-radius:10px",
            "box-shadow:0 10px 30px rgba(0,0,0,.25)",
            "padding:16px",
            "font:14px/1.5 Arial,sans-serif"
        ].join(";");

        const title =
            document
                .createElement(
                    "h2"
                );

        title.textContent =
            result
                .overallSuccess
                ? "Market Flow Loader Probe — עבר"
                : "Market Flow Loader Probe — נדרשת בדיקה";

        title.style.cssText =
            "margin:0 0 12px;font-size:18px";

        panel.appendChild(
            title
        );

        const summary =
            document
                .createElement(
                    "pre"
                );

        summary.style.cssText =
            "white-space:pre-wrap;margin:0 0 12px;font:13px/1.6 Consolas,monospace";

        summary.textContent = [
            "Manifest fetch: " +
                stepText(
                    result
                        .steps
                        .manifestFetch
                ),
            "Runtime fetch: " +
                stepText(
                    result
                        .steps
                        .runtimeFetch
                ),
            "SHA-256: " +
                stepText(
                    result
                        .steps
                        .runtimeHash
                ),
            "Runtime compile: " +
                stepText(
                    result
                        .steps
                        .runtimeCompile
                ),
            "CSP violations: " +
                result
                    .cspViolations
                    .length
        ].join(
            "\n"
        );

        panel.appendChild(
            summary
        );

        const actions =
            document
                .createElement(
                    "div"
                );

        actions.style.cssText =
            "display:flex;gap:8px;flex-wrap:wrap";

        const download =
            document
                .createElement(
                    "button"
                );

        download.type =
            "button";

        download.textContent =
            "הורד תוצאת בדיקה";

        download.addEventListener(
            "click",
            downloadResult
        );

        actions.appendChild(
            download
        );

        const close =
            document
                .createElement(
                    "button"
                );

        close.type =
            "button";

        close.textContent =
            "סגור";

        close.addEventListener(
            "click",
            () =>
                panel.remove()
        );

        actions.appendChild(
            close
        );

        panel.appendChild(
            actions
        );

        document.body
            .appendChild(
                panel
            );
    }

    function recordCspViolation(
        event
    ) {
        result
            .cspViolations
            .push({
                effectiveDirective:
                    event
                        .effectiveDirective ??
                    null,
                violatedDirective:
                    event
                        .violatedDirective ??
                    null,
                blockedURI:
                    safeRequestedUrl(
                        event
                            .blockedURI ??
                        ""
                    )
            });
    }

    async function run() {
        document
            .addEventListener(
                "securitypolicyviolation",
                recordCspViolation
            );

        try {
            const manifestUrl =
                getManifestUrl();

            result.manifestUrl =
                safeRequestedUrl(
                    manifestUrl
                );

            let manifest;

            try {
                const manifestResponse =
                    await fetchText(
                        manifestUrl
                    );

                manifest =
                    validateManifest(
                        JSON.parse(
                            manifestResponse
                                .text
                        )
                    );

                result
                    .steps
                    .manifestFetch = {
                        success:
                            true,
                        status:
                            manifestResponse
                                .status,
                        buildId:
                            manifest
                                .buildId
                    };
            } catch (error) {
                result
                    .steps
                    .manifestFetch = {
                        success:
                            false,
                        error:
                            normalizeError(
                                error
                            )
                    };

                return;
            }

            let runtimeText;

            try {
                const runtimeUrl =
                    new URL(
                        manifest
                            .runtime
                            .url,
                        manifestUrl
                    )
                        .href;

                const runtimeResponse =
                    await fetchText(
                        runtimeUrl
                    );

                runtimeText =
                    runtimeResponse
                        .text;

                result
                    .steps
                    .runtimeFetch = {
                        success:
                            true,
                        status:
                            runtimeResponse
                                .status,
                        requestedUrl:
                            safeRequestedUrl(
                                runtimeUrl
                            ),
                        bytes:
                            new TextEncoder()
                                .encode(
                                    runtimeText
                                )
                                .byteLength
                    };
            } catch (error) {
                result
                    .steps
                    .runtimeFetch = {
                        success:
                            false,
                        error:
                            normalizeError(
                                error
                            )
                    };

                return;
            }

            try {
                const actualSha256 =
                    await sha256Hex(
                        runtimeText
                    );

                const expectedSha256 =
                    manifest
                        .runtime
                        .sha256;

                const byteLength =
                    new TextEncoder()
                        .encode(
                            runtimeText
                        )
                        .byteLength;

                const hashMatches =
                    actualSha256 ===
                    expectedSha256;

                const bytesMatch =
                    byteLength ===
                    manifest
                        .runtime
                        .bytes;

                if (
                    !hashMatches ||
                    !bytesMatch
                ) {
                    throw new Error(
                        "Downloaded runtime does not match the manifest."
                    );
                }

                result
                    .steps
                    .runtimeHash = {
                        success:
                            true,
                        sha256:
                            actualSha256,
                        bytes:
                            byteLength
                    };
            } catch (error) {
                result
                    .steps
                    .runtimeHash = {
                        success:
                            false,
                        error:
                            normalizeError(
                                error
                            )
                    };

                return;
            }

            try {
                const compiled =
                    new Function(
                        runtimeText
                    );

                if (
                    typeof compiled !==
                        "function"
                ) {
                    throw new Error(
                        "Runtime compilation did not return a function."
                    );
                }

                result
                    .steps
                    .runtimeCompile = {
                        success:
                            true,
                        executed:
                            false
                    };
            } catch (error) {
                result
                    .steps
                    .runtimeCompile = {
                        success:
                            false,
                        error:
                            normalizeError(
                                error
                            )
                    };

                return;
            }

            result.overallSuccess =
                true;
        } finally {
            await new Promise(
                resolve =>
                    window.setTimeout(
                        resolve,
                        0
                    )
            );

            result.completedAtMs =
                Date.now();

            document
                .removeEventListener(
                    "securitypolicyviolation",
                    recordCspViolation
                );

            window
                .MarketFlowLoaderProbeLastResult =
                result;

            window
                .MarketFlowLoaderProbeRunning =
                false;

            renderResult();
        }
    }

    run().catch(
        error => {
            result.completedAtMs =
                Date.now();

            result
                .steps
                .runtimeCompile = {
                    success:
                        false,
                    error:
                        normalizeError(
                            error
                        )
                };

            window
                .MarketFlowLoaderProbeLastResult =
                result;

            window
                .MarketFlowLoaderProbeRunning =
                false;

            renderResult();
        }
    );
})();
