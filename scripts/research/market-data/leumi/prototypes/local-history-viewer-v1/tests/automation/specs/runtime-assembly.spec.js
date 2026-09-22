"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");

const {
    test,
    expect
} = require(
    "@playwright/test"
);

const {
    installLeumiApiMocks
} = require(
    "../helpers/mock-leumi-api"
);

const bookmarkletPath =
    path.resolve(
        __dirname,
        "../../..",
        "runtime",
        "dist",
        "market-flow-v1.bookmarklet.txt"
    );

async function deleteDatabase(
    page
) {
    await page.evaluate(
        async () => {
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const request =
                        indexedDB
                            .deleteDatabase(
                                "market-flow-leumi-history-v1"
                            );

                    request.onsuccess =
                        () =>
                            resolve();

                    request.onerror =
                        () =>
                            reject(
                                request.error ??
                                new Error(
                                    "Failed to delete runtime smoke database."
                                )
                            );

                    request.onblocked =
                        () =>
                            reject(
                                new Error(
                                    "Runtime smoke database deletion was blocked."
                                )
                            );
                }
            );
        }
    );
}

async function installBookmarklet(
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
                "runtime-bookmarklet";

            anchor.href =
                href;

            anchor.textContent =
                "launch runtime";

            document.body
                .appendChild(
                    anchor
                );
        },
        bookmarklet
    );
}

test(
    "Stage 19.2 assembled Bookmarklet launches one recoverable runtime on a clean browser page",
    async ({ page }) => {
        test.setTimeout(
            60000
        );

        const bookmarklet =
            fs.readFileSync(
                bookmarkletPath,
                "utf8"
            );

        expect(
            bookmarklet.startsWith(
                "javascript:"
            )
        ).toBe(true);

        expect(
            bookmarklet.includes(
                "%0A"
            )
        ).toBe(false);

        expect(
            bookmarklet.includes(
                "window.MarketFlowRuntime"
            )
        ).toBe(true);

        expect(
            Buffer.byteLength(
                bookmarklet,
                "utf8"
            )
        ).toBeLessThanOrEqual(
            256 * 1024
        );

        await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/runtime-smoke.html"
        );

        await deleteDatabase(
            page
        );

        await installBookmarklet(
            page,
            bookmarklet
        );

        const popupPromise =
            page.waitForEvent(
                "popup"
            );

        await page.locator(
            "#runtime-bookmarklet"
        ).click();

        const viewer =
            await popupPromise;

        await expect(
            viewer.locator(
                "[data-role='viewer-status']"
            )
        ).toBeVisible();

        const firstSnapshot =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowRuntime
                        .getSnapshot()
            );

        expect(
            firstSnapshot
                .recorder
                .isRunning
        ).toBe(true);

        expect(
            firstSnapshot
                .viewer
                .isOpen
        ).toBe(true);

        const firstInstanceId =
            firstSnapshot
                .persistence
                .instanceId;

        expect(
            typeof firstInstanceId
        ).toBe("string");

        const pageCountBefore =
            page
                .context()
                .pages()
                .length;

        await page.locator(
            "#runtime-bookmarklet"
        ).click();

        const repeatedSnapshot =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowRuntime
                        .getSnapshot()
            );

        expect(
            repeatedSnapshot
                .persistence
                .instanceId
        ).toBe(
            firstInstanceId
        );

        expect(
            page
                .context()
                .pages()
                .length
        ).toBe(
            pageCountBefore
        );

        await page.evaluate(
            async () => {
                await window
                    .MarketFlowRuntime
                    .stop(
                        "runtime-smoke-restart"
                    );
            }
        );

        await page.locator(
            "#runtime-bookmarklet"
        ).click();

        await page.waitForFunction(
            previousInstanceId => {
                const snapshot =
                    window
                        .MarketFlowRuntime
                        .getSnapshot();

                return (
                    snapshot
                        .recorder
                        .isRunning &&
                    snapshot
                        .persistence
                        .instanceId !==
                        previousInstanceId
                );
            },
            firstInstanceId
        );

        const restartedSnapshot =
            await page.evaluate(
                () =>
                    window
                        .MarketFlowRuntime
                        .getSnapshot()
            );

        expect(
            restartedSnapshot
                .recorder
                .isRunning
        ).toBe(true);

        expect(
            restartedSnapshot
                .persistence
                .instanceId
        ).not.toBe(
            firstInstanceId
        );

        await page.evaluate(
            async () => {
                await window
                    .MarketFlowRuntime
                    .stop(
                        "runtime-smoke-cleanup"
                    );

                window
                    .MarketFlowRuntime
                    .closeViewer();

                window
                    .MarketFlowChannel
                    .closePublisher();
            }
        );

        await deleteDatabase(
            page
        );
    }
);
