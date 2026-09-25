"use strict";

const fs =
    require("node:fs");
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

async function routePinnedEngineAssets(
    context,
    options = {}
) {
    const blockedWorker =
        options.blockedWorker ??
        false;

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
                    "application/javascript",
                worker:
                    true
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
                    "application/wasm",
                worker:
                    false
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

            if (
                blockedWorker &&
                mapping.worker
            ) {
                await route.abort(
                    "blockedbyclient"
                );
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

test(
    "WP-02 probe writes, checkpoints, reopens across reload and deletes only its probe OPFS file",
    async ({ page, context }) => {
        await routePinnedEngineAssets(
            context
        );

        await page.goto(
            "/tests/automation/runtime-smoke.html"
        );

        await injectProbe(
            page
        );

        const first =
            await page.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .run({
                            bundle:
                                "mvp"
                        })
            );

        expect(
            first.status
        ).toBe(
            "passed"
        );

        expect(
            first.failedStage
        ).toBeNull();

        expect(
            first.stages.map(
                stage =>
                    stage.name
            )
        ).toEqual([
            "bookmarklet-bootstrap",
            "browser-capabilities",
            "blob-worker-create",
            "worker-asset-load",
            "wasm-instantiate",
            "opfs-open",
            "write-commit-checkpoint",
            "reopen-verify"
        ]);

        expect(
            first.stages.every(
                stage =>
                    stage.status ===
                    "passed"
            )
        ).toBe(true);

        await page.reload();

        await injectProbe(
            page
        );

        const verifyResult =
            await page.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .verify({
                            bundle:
                                "mvp"
                        })
            );

        expect(
            verifyResult.status
        ).toBe(
            "passed"
        );

        expect(
            verifyResult.marker
        ).toBe(
            "market-flow-browser-sql-probe-synthetic-v1"
        );

        const cleanup =
            await page.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .cleanup()
            );

        expect(
            cleanup.status
        ).toBe(
            "passed"
        );

        expect(
            cleanup.deletedEntries
        ).toEqual([
            "market-flow-browser-sql-probe-v2.duckdb",
            "market-flow-browser-sql-probe-v2.duckdb.wal"
        ]);

        const remaining =
            await page.evaluate(
                async () => {
                    const root =
                        await navigator
                            .storage
                            .getDirectory();

                    const found = [];

                    for (
                        const name of [
                            "market-flow-browser-sql-probe-v2.duckdb",
                            "market-flow-browser-sql-probe-v2.duckdb.wal"
                        ]
                    ) {
                        try {
                            await root
                                .getFileHandle(
                                    name
                                );

                            found.push(
                                name
                            );
                        } catch (
                            error
                        ) {
                            if (
                                !error ||
                                error.name !==
                                    "NotFoundError"
                            ) {
                                throw error;
                            }
                        }
                    }

                    return found;
                }
            );

        expect(
            remaining
        ).toEqual([]);
    }
);

test(
    "WP-02 probe classifies blocked pinned Worker loading without leaking raw error details",
    async ({ page, context }) => {
        await routePinnedEngineAssets(
            context,
            {
                blockedWorker:
                    true
            }
        );

        await page.goto(
            "/tests/automation/runtime-smoke.html"
        );

        await injectProbe(
            page
        );

        const result =
            await page.evaluate(
                async () =>
                    await window
                        .MarketFlowBrowserSqlProbe
                        .run({
                            bundle:
                                "mvp",
                            workerReadyTimeoutMs:
                                1500
                        })
            );

        expect(
            result.status
        ).toBe(
            "failed"
        );

        expect(
            result.failedStage
        ).toBe(
            "worker-asset-load"
        );

        expect(
            result.error
        ).toEqual({
            name:
                expect.any(
                    String
                ),
            message:
                expect.any(
                    String
                )
        });

        expect(
            JSON.stringify(
                result
            )
        ).not.toContain(
            "hb2.leumi"
        );

        expect(
            JSON.stringify(
                result
            )
        ).not.toContain(
            "Authorization"
        );

        expect(
            JSON.stringify(
                result
            )
        ).not.toContain(
            "Cookie"
        );
    }
);
