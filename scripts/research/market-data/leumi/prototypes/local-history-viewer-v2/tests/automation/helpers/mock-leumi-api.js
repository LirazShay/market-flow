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

function delay(ms) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}

async function installLeumiApiMocks(
    page,
    scenarioName = "success",
    options = {}
) {
    const scenario = getScenario(
        scenarioName
    );

    const calls = [];

    const stats = {
        activeSecuritiesRequests: 0,
        maxActiveSecuritiesRequests: 0
    };

    const securitiesDelayMs =
        options.securitiesDelayMs ??
        0;

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

            const securityIdsValue =
                requestUrl.searchParams.get(
                    "securityIds"
                ) ??
                "";

            const requestedIds =
                securityIdsValue
                    .split(",")
                    .filter(Boolean);

            calls.push({
                endpoint: "GetSecuritiesData",
                method: request.method(),
                url: request.url(),
                securityIds:
                    securityIdsValue,
                responseType:
                    requestUrl.searchParams.get(
                        "responseType"
                    ),
                isGto:
                    requestUrl.searchParams.get(
                        "is_gto"
                    ),
                force:
                    requestUrl.searchParams.get(
                        "force"
                    )
            });

            stats.activeSecuritiesRequests++;

            stats.maxActiveSecuritiesRequests =
                Math.max(
                    stats
                        .maxActiveSecuritiesRequests,
                    stats
                        .activeSecuritiesRequests
                );

            try {
                if (
                    securitiesDelayMs >
                    0
                ) {
                    await delay(
                        securitiesDelayMs
                    );
                }

                if (
                    scenario.securitiesStatus !==
                    200
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

                const requestedSet =
                    new Set(
                        requestedIds
                    );

                const matchingSecurities =
                    (
                        scenario.securities ??
                        []
                    ).filter(
                        security =>
                            requestedSet.has(
                                String(
                                    security.Key
                                )
                            )
                    );

                await route.fulfill({
                    status: 200,
                    ...jsonResponse(
                        createSecuritiesPayload(
                            matchingSecurities
                        )
                    )
                });
            } finally {
                stats.activeSecuritiesRequests--;
            }
        }
    );

    return {
        scenarioName,
        calls,
        stats
    };
}

module.exports = Object.freeze({
    MAP_HEAT_PATH,
    SECURITIES_PATH,
    installLeumiApiMocks
});
