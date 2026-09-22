"use strict";

const {
    createMapHeatPayload,
    createSecuritiesPayload,
    scenarios
} = require("../../fixtures/leumi-api-fixtures");

const MAP_HEAT_PATH =
    "/lti/lti-app/api/MarketFast/MapHeat2";

const SECURITIES_PATH =
    "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData";

function jsonResponse(body) {
    return {
        contentType: "application/json",
        body: JSON.stringify(body)
    };
}

function getScenario(name) {
    const scenario = scenarios[name];

    if (!scenario) {
        throw new Error(
            "Unknown Leumi mock scenario: " +
            name
        );
    }

    return scenario;
}

async function installLeumiApiMocks(
    page,
    scenarioName = "success"
) {
    const scenario = getScenario(
        scenarioName
    );

    const calls = [];

    await page.route(
        "**" + MAP_HEAT_PATH + "**",
        async route => {
            const request = route.request();
            const requestUrl =
                new URL(request.url());

            calls.push({
                endpoint: "MapHeat2",
                method: request.method(),
                url: request.url(),
                pageCount:
                    requestUrl.searchParams.get(
                        "pageCount"
                    )
            });

            if (scenario.mapHeatStatus !== 200) {
                await route.fulfill({
                    status: scenario.mapHeatStatus,
                    ...jsonResponse({
                        error: "synthetic-mapheat-error"
                    })
                });
                return;
            }

            if (
                scenario.invalidMapHeatStructure
            ) {
                await route.fulfill({
                    status: 200,
                    ...jsonResponse({
                        data: {}
                    })
                });
                return;
            }

            const payload =
                createMapHeatPayload(
                    scenario.mapHeatRecords
                );

            const pageCount = Number(
                requestUrl.searchParams.get(
                    "pageCount"
                )
            );

            if (pageCount === 1) {
                payload.data.MapHeat.records =
                    payload.data.MapHeat.records
                        .slice(0, 1);
            }

            await route.fulfill({
                status: 200,
                ...jsonResponse(payload)
            });
        }
    );

    await page.route(
        "**" + SECURITIES_PATH + "**",
        async route => {
            const request = route.request();
            const requestUrl =
                new URL(request.url());

            calls.push({
                endpoint: "GetSecuritiesData",
                method: request.method(),
                url: request.url(),
                securityIds:
                    requestUrl.searchParams.get(
                        "securityIds"
                    )
            });

            if (
                scenario.securitiesStatus !== 200
            ) {
                await route.fulfill({
                    status:
                        scenario.securitiesStatus,
                    ...jsonResponse({
                        error:
                            "synthetic-securities-error"
                    })
                });
                return;
            }

            if (
                scenario.invalidSecuritiesStructure
            ) {
                await route.fulfill({
                    status: 200,
                    ...jsonResponse({
                        data: {
                            SecuritiesData: {}
                        }
                    })
                });
                return;
            }

            await route.fulfill({
                status: 200,
                ...jsonResponse(
                    createSecuritiesPayload(
                        scenario.securities
                    )
                )
            });
        }
    );

    return {
        scenarioName,
        calls
    };
}

module.exports = Object.freeze({
    MAP_HEAT_PATH,
    SECURITIES_PATH,
    installLeumiApiMocks
});
