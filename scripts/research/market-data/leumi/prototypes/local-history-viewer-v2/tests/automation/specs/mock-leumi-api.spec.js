const {
    test,
    expect
} = require("@playwright/test");

const {
    installLeumiApiMocks,
    MAP_HEAT_PATH,
    SECURITIES_PATH
} = require("../helpers/mock-leumi-api");

test(
    "success scenario drives universe loader without live API calls",
    async ({ page }) => {
        const mock = await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const universe =
            await page.evaluate(async () => {
                return await window
                    .MarketFlowUniverseLoader
                    .loadUniverse({
                        chunkSize: 2
                    });
            });

        expect(
            universe.recordCount
        ).toBe(4);

        expect(
            universe.securityIds
        ).toEqual([
            "1001",
            "1002",
            "1003",
            "1004"
        ]);

        expect(
            universe.chunkSizes
        ).toEqual([
            2,
            2
        ]);

        expect(
            mock.calls.filter(
                call =>
                    call.endpoint === "MapHeat2"
            )
        ).toHaveLength(2);
    }
);

test(
    "universe loader rejects duplicate PaperId from mocked MapHeat2",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "duplicatePaperId"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const message =
            await page.evaluate(async () => {
                try {
                    await window
                        .MarketFlowUniverseLoader
                        .loadUniverse();
                    return null;
                } catch (error) {
                    return error.message;
                }
            });

        expect(message).toContain(
            "duplicate PaperIds"
        );
    }
);

test(
    "universe loader rejects missing PaperId from mocked MapHeat2",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "missingPaperId"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const message =
            await page.evaluate(async () => {
                try {
                    await window
                        .MarketFlowUniverseLoader
                        .loadUniverse();
                    return null;
                } catch (error) {
                    return error.message;
                }
            });

        expect(message).toContain(
            "without PaperId"
        );
    }
);

test(
    "mock infrastructure supports MapHeat2 HTTP failure and invalid structure",
    async ({ browser }) => {
        for (const [
            scenario,
            expected
        ] of [
            [
                "mapHeatHttpFailure",
                "HTTP 503"
            ],
            [
                "invalidMapHeatStructure",
                "response structure is invalid"
            ]
        ]) {
            const page =
                await browser.newPage();

            await installLeumiApiMocks(
                page,
                scenario
            );

            await page.goto(
                "/tests/automation/harness.html"
            );

            const message =
                await page.evaluate(async () => {
                    try {
                        await window
                            .MarketFlowUniverseLoader
                            .loadUniverse();
                        return null;
                    } catch (error) {
                        return error.message;
                    }
                });

            expect(message).toContain(
                expected
            );

            await page.close();
        }
    }
);

test(
    "GetSecuritiesData mocks preserve null and zero fixtures",
    async ({ page }) => {
        const mock = await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const result =
            await page.evaluate(
                async endpoint => {
                    const response =
                        await fetch(
                            endpoint +
                            "?securityIds=1001,1002,1003"
                        );

                    return await response.json();
                },
                SECURITIES_PATH
            );

        const securities =
            result.data
                .SecuritiesData
                .Table
                .Security;

        expect(
            securities.find(
                item => item.Key === 1002
            ).LastKnownRate
        ).toBe(0);

        expect(
            securities.find(
                item => item.Key === 1003
            ).LastKnownRate
        ).toBeNull();

        expect(
            mock.calls.some(
                call =>
                    call.endpoint ===
                    "GetSecuritiesData"
            )
        ).toBe(true);
    }
);

test(
    "GetSecuritiesData mock infrastructure supports HTTP and structure failures",
    async ({ browser }) => {
        for (const [
            scenario,
            expectedStatus,
            expectTable
        ] of [
            [
                "securitiesHttpFailure",
                500,
                false
            ],
            [
                "invalidSecuritiesStructure",
                200,
                false
            ]
        ]) {
            const page =
                await browser.newPage();

            await installLeumiApiMocks(
                page,
                scenario
            );

            await page.goto(
                "/tests/automation/harness.html"
            );

            const result =
                await page.evaluate(
                    async endpoint => {
                        const response =
                            await fetch(
                                endpoint +
                                "?securityIds=1001"
                            );

                        const body =
                            await response.json();

                        return {
                            status:
                                response.status,
                            hasTable:
                                Boolean(
                                    body?.data
                                        ?.SecuritiesData
                                        ?.Table
                                )
                        };
                    },
                    SECURITIES_PATH
                );

            expect(
                result.status
            ).toBe(expectedStatus);

            expect(
                result.hasTable
            ).toBe(expectTable);

            await page.close();
        }
    }
);

test(
    "no mocked request escapes expected Leumi endpoint paths",
    async ({ page }) => {
        await installLeumiApiMocks(
            page,
            "success"
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        const paths =
            await page.evaluate(
                async ({
                    mapHeatPath,
                    securitiesPath
                }) => {
                    await fetch(
                        mapHeatPath +
                        "?page=1&pageCount=1"
                    );

                    await fetch(
                        securitiesPath +
                        "?securityIds=1001"
                    );

                    return [
                        mapHeatPath,
                        securitiesPath
                    ];
                },
                {
                    mapHeatPath:
                        MAP_HEAT_PATH,
                    securitiesPath:
                        SECURITIES_PATH
                }
            );

        expect(paths).toEqual([
            MAP_HEAT_PATH,
            SECURITIES_PATH
        ]);
    }
);
