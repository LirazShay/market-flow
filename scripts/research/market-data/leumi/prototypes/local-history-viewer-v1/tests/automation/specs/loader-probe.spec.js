"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
const crypto =
    require("node:crypto");

const {
    test,
    expect
} =
    require(
        "@playwright/test"
    );

const probeBookmarkletPath =
    path.resolve(
        __dirname,
        "../../..",
        "runtime",
        "dist",
        "market-flow-loader-probe.bookmarklet.txt"
    );

function sha256Hex(
    text
) {
    return crypto
        .createHash(
            "sha256"
        )
        .update(
            text,
            "utf8"
        )
        .digest(
            "hex"
        );
}

async function installProbeBookmarklet(
    page,
    bookmarklet
) {
    await page.evaluate(
        href => {
            const anchor =
                document
                    .createElement(
                        "a"
                    );

            anchor.id =
                "loader-probe-bookmarklet";

            anchor.href =
                href;

            anchor.textContent =
                "run loader probe";

            document.body
                .appendChild(
                    anchor
                );
        },
        bookmarklet
    );
}

test(
    "Loader probe fetches, verifies and compiles remote runtime without executing it",
    async ({ page }) => {
        const bookmarklet =
            fs.readFileSync(
                probeBookmarkletPath,
                "utf8"
            );

        const runtimeText =
            "window.__marketFlowRemoteProbeRuntimeExecuted = true;";

        const runtimeBytes =
            Buffer.byteLength(
                runtimeText,
                "utf8"
            );

        const runtimeSha256 =
            sha256Hex(
                runtimeText
            );

        await page.goto(
            "/tests/automation/runtime-smoke.html"
        );

        const origin =
            new URL(
                page.url()
            ).origin;

        const manifestUrl =
            origin +
            "/loader-probe/manifest.json";

        const runtimeUrl =
            origin +
            "/loader-probe/runtime.js";

        await page.route(
            "**/loader-probe/manifest.json",
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType:
                        "application/json",
                    body:
                        JSON.stringify({
                            formatVersion:
                                1,
                            buildId:
                                "sha256:" +
                                runtimeSha256,
                            runtime: {
                                fileName:
                                    "runtime.js",
                                url:
                                    runtimeUrl,
                                sha256:
                                    runtimeSha256,
                                bytes:
                                    runtimeBytes
                            }
                        })
                });
            }
        );

        await page.route(
            "**/loader-probe/runtime.js",
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType:
                        "text/javascript",
                    body:
                        runtimeText
                });
            }
        );

        await page.evaluate(
            manifestUrl => {
                window
                    .MarketFlowLoaderProbeConfig = {
                        manifestUrl
                    };

                document.cookie =
                    "loaderProbeSecret=must-not-leak";
            },
            manifestUrl
        );

        await installProbeBookmarklet(
            page,
            bookmarklet
        );

        await page.locator(
            "#loader-probe-bookmarklet"
        ).click();

        await page.waitForFunction(
            () => {
                const result =
                    window
                        .MarketFlowLoaderProbeLastResult;

                return Boolean(
                    result &&
                    result.completedAtMs !==
                        null
                );
            }
        );

        const result =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowLoaderProbeLastResult
            );

        expect(
            result.overallSuccess
        ).toBe(true);

        expect(
            result.steps
                .manifestFetch
                .success
        ).toBe(true);

        expect(
            result.steps
                .runtimeFetch
                .success
        ).toBe(true);

        expect(
            result.steps
                .runtimeHash
                .success
        ).toBe(true);

        expect(
            result.steps
                .runtimeCompile
                .success
        ).toBe(true);

        expect(
            result.steps
                .runtimeCompile
                .executed
        ).toBe(false);

        expect(
            await page.evaluate(
                () =>
                    window
                        .__marketFlowRemoteProbeRuntimeExecuted
            )
        ).toBeUndefined();

        await expect(
            page.locator(
                "#market-flow-loader-probe-panel"
            )
        ).toContainText(
            "Loader Probe — עבר"
        );

        const downloadPromise =
            page.waitForEvent(
                "download"
            );

        await page
            .getByRole(
                "button",
                {
                    name:
                        "הורד תוצאת בדיקה"
                }
            )
            .click();

        const download =
            await downloadPromise;

        const downloadedPath =
            await download.path();

        const downloaded =
            fs.readFileSync(
                downloadedPath,
                "utf8"
            );

        const downloadedResult =
            JSON.parse(
                downloaded
            );

        expect(
            downloadedResult
                .overallSuccess
        ).toBe(true);

        expect(
            downloaded
        ).not.toContain(
            "must-not-leak"
        );
    }
);

test(
    "Loader probe refuses to compile a runtime whose SHA-256 does not match the manifest",
    async ({ page }) => {
        const bookmarklet =
            fs.readFileSync(
                probeBookmarkletPath,
                "utf8"
            );

        const runtimeText =
            "window.__mustNeverExecute = true;";

        await page.goto(
            "/tests/automation/runtime-smoke.html"
        );

        const origin =
            new URL(
                page.url()
            ).origin;

        const manifestUrl =
            origin +
            "/loader-probe-bad/manifest.json";

        const runtimeUrl =
            origin +
            "/loader-probe-bad/runtime.js";

        await page.route(
            "**/loader-probe-bad/manifest.json",
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType:
                        "application/json",
                    body:
                        JSON.stringify({
                            formatVersion:
                                1,
                            buildId:
                                "sha256:" +
                                "0".repeat(64),
                            runtime: {
                                fileName:
                                    "runtime.js",
                                url:
                                    runtimeUrl,
                                sha256:
                                    "0".repeat(64),
                                bytes:
                                    Buffer.byteLength(
                                        runtimeText,
                                        "utf8"
                                    )
                            }
                        })
                });
            }
        );

        await page.route(
            "**/loader-probe-bad/runtime.js",
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType:
                        "text/javascript",
                    body:
                        runtimeText
                });
            }
        );

        await page.evaluate(
            manifestUrl => {
                window
                    .MarketFlowLoaderProbeConfig = {
                        manifestUrl
                    };
            },
            manifestUrl
        );

        await installProbeBookmarklet(
            page,
            bookmarklet
        );

        await page.locator(
            "#loader-probe-bookmarklet"
        ).click();

        await page.waitForFunction(
            () => {
                const result =
                    window
                        .MarketFlowLoaderProbeLastResult;

                return Boolean(
                    result &&
                    result.completedAtMs !==
                        null
                );
            }
        );

        const result =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowLoaderProbeLastResult
            );

        expect(
            result.overallSuccess
        ).toBe(false);

        expect(
            result.steps
                .runtimeHash
                .success
        ).toBe(false);

        expect(
            result.steps
                .runtimeCompile
        ).toBeNull();

        expect(
            await page.evaluate(
                () =>
                    window
                        .__mustNeverExecute
            )
        ).toBeUndefined();
    }
);
