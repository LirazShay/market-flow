"use strict";

const path =
    require("node:path");
const {
    test,
    expect
} =
    require("@playwright/test");

const probeBuilder =
    require(
        "../../../runtime/build-browser-sql-probe"
    );

const engineManifest =
    require(
        "../../../runtime/duckdb-engine-manifest"
    );

const workstreamRoot =
    path.resolve(
        __dirname,
        "../../.."
    );

const duckdbDist =
    path.join(
        workstreamRoot,
        "node_modules",
        "@duckdb",
        "duckdb-wasm",
        "dist"
    );

const MOCK_PAGE =
    "/tests/automation/mock-leumi-authenticated.html";

const LOCK_NAME =
    "market-flow:wp03:web-lock-probe";

async function routePinnedEngineAssets(
    context
) {
    const manifest =
        engineManifest
            .createEngineAssetManifest();

    const routeByUrl =
        new Map();

    for (
        const bundleName of [
            "mvp",
            "eh"
        ]
    ) {
        const bundle =
            manifest
                .bundles[
                    bundleName
                ];

        routeByUrl.set(
            bundle.mainWorker,
            {
                path:
                    path.join(
                        duckdbDist,
                        path.basename(
                            bundle.mainWorker
                        )
                    ),
                contentType:
                    "application/javascript"
            }
        );

        routeByUrl.set(
            bundle.mainModule,
            {
                path:
                    path.join(
                        duckdbDist,
                        path.basename(
                            bundle.mainModule
                        )
                    ),
                contentType:
                    "application/wasm"
            }
        );
    }

    await context.route(
        "**/*",
        async route => {
            const mapping =
                routeByUrl.get(
                    route.request().url()
                );

            if (!mapping) {
                await route.continue();
                return;
            }

            await route.fulfill({
                path:
                    mapping.path,
                contentType:
                    mapping.contentType
            });
        }
    );
}

async function injectProbe(
    page
) {
    const artifacts =
        await probeBuilder
            .buildProbeArtifacts({
                write:
                    false
            });

    await page.evaluate(
        () => {
            window
                .__MARKET_FLOW_BROWSER_SQL_PROBE_AUTO_RUN__ =
                false;
        }
    );

    await page.addScriptTag({
        content:
            artifacts.probeText
    });
}

async function loadSyntheticLeumiPage(
    page
) {
    await page.goto(
        MOCK_PAGE
    );

    await expect(
        page.locator(
            "#mock-leumi-ready"
        )
    ).toHaveText(
        "ready"
    );

    const marker =
        await page.evaluate(
            () =>
                window
                    .__MARKET_FLOW_SYNTHETIC_LEUMI__
        );

    expect(marker).toEqual({
        provider:
            "leumi-synthetic",
        authenticated:
            true,
        containsRealSessionData:
            false
    });
}

async function holdExclusiveLock(
    page
) {
    return await page.evaluate(
        async lockName => {
            let resolveAcquired;

            const acquired =
                new Promise(
                    resolve => {
                        resolveAcquired =
                            resolve;
                    }
                );

            window.__mfWp03LockRelease =
                null;

            window.__mfWp03LockRequest =
                navigator.locks.request(
                    lockName,
                    {
                        mode:
                            "exclusive",
                        ifAvailable:
                            true
                    },
                    lock => {
                        resolveAcquired(
                            Boolean(
                                lock
                            )
                        );

                        if (!lock) {
                            return;
                        }

                        return new Promise(
                            resolve => {
                                window
                                    .__mfWp03LockRelease =
                                    () => {
                                        window
                                            .__mfWp03LockRelease =
                                            null;

                                        resolve();
                                    };
                            }
                        );
                    }
                );

            return await acquired;
        },
        LOCK_NAME
    );
}

async function tryExclusiveLock(
    page
) {
    return await page.evaluate(
        async lockName =>
            await navigator
                .locks
                .request(
                    lockName,
                    {
                        mode:
                            "exclusive",
                        ifAvailable:
                            true
                    },
                    lock =>
                        Boolean(
                            lock
                        )
                ),
        LOCK_NAME
    );
}

test(
    "WP-03 synthetic Leumi preflight verifies probe persistence across same-origin tabs and exclusive Web Lock semantics",
    async ({ context }) => {
        await routePinnedEngineAssets(
            context
        );

        const pageA =
            await context.newPage();

        const pageB =
            await context.newPage();

        await loadSyntheticLeumiPage(
            pageA
        );

        await loadSyntheticLeumiPage(
            pageB
        );

        expect(
            await pageA.evaluate(
                () => location.origin
            )
        ).toBe(
            await pageB.evaluate(
                () => location.origin
            )
        );

        const locksAvailable =
            await Promise.all([
                pageA.evaluate(
                    () =>
                        Boolean(
                            navigator.locks &&
                            typeof navigator
                                .locks
                                .request ===
                                "function"
                        )
                ),
                pageB.evaluate(
                    () =>
                        Boolean(
                            navigator.locks &&
                            typeof navigator
                                .locks
                                .request ===
                                "function"
                        )
                )
            ]);

        expect(
            locksAvailable
        ).toEqual([
            true,
            true
        ]);

        await injectProbe(
            pageA
        );

        const firstRun =
            await pageA.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .run({
                            bundle:
                                "mvp"
                        })
            );

        expect(
            firstRun.status,
            JSON.stringify(
                firstRun,
                null,
                2
            )
        ).toBe(
            "passed"
        );

        expect(
            firstRun.failedStage
        ).toBeNull();

        expect(
            firstRun.stages.every(
                stage =>
                    stage.status ===
                    "passed"
            )
        ).toBe(
            true
        );

        await injectProbe(
            pageB
        );

        const crossTabVerify =
            await pageB.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .verify({
                            bundle:
                                "mvp"
                        })
            );

        expect(
            crossTabVerify
        ).toMatchObject({
            status:
                "passed",
            marker:
                "market-flow-browser-sql-probe-synthetic-v1"
        });

        await pageA.reload();

        await injectProbe(
            pageA
        );

        const postReloadVerify =
            await pageA.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .verify({
                            bundle:
                                "mvp"
                        })
            );

        expect(
            postReloadVerify
        ).toMatchObject({
            status:
                "passed",
            marker:
                "market-flow-browser-sql-probe-synthetic-v1"
        });

        expect(
            await holdExclusiveLock(
                pageA
            )
        ).toBe(
            true
        );

        expect(
            await tryExclusiveLock(
                pageB
            )
        ).toBe(
            false
        );

        await pageA.evaluate(
            async () => {
                window
                    .__mfWp03LockRelease();

                await window
                    .__mfWp03LockRequest;
            }
        );

        expect(
            await tryExclusiveLock(
                pageB
            )
        ).toBe(
            true
        );

        const cleanup =
            await pageB.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .cleanup()
            );

        expect(
            cleanup
        ).toEqual({
            status:
                "passed",
            deletedEntries: [
                "market-flow-browser-sql-probe-v2.duckdb",
                "market-flow-browser-sql-probe-v2.duckdb.wal"
            ]
        });
    }
);

test(
    "WP-03 synthetic Leumi preflight verifies browser releases an exclusive Web Lock when the owner tab closes",
    async ({ context }) => {
        const ownerPage =
            await context.newPage();

        const standbyPage =
            await context.newPage();

        await loadSyntheticLeumiPage(
            ownerPage
        );

        await loadSyntheticLeumiPage(
            standbyPage
        );

        expect(
            await holdExclusiveLock(
                ownerPage
            )
        ).toBe(
            true
        );

        expect(
            await tryExclusiveLock(
                standbyPage
            )
        ).toBe(
            false
        );

        await ownerPage.close();

        await expect
            .poll(
                async () =>
                    await tryExclusiveLock(
                        standbyPage
                    ),
                {
                    timeout:
                        5000
                }
            )
            .toBe(
                true
            );
    }
);
