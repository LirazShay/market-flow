"use strict";

const SUCCESS_MAP_RECORDS = Object.freeze([
    Object.freeze({
        PaperId: 1001,
        PaperName: "Fixture Alpha"
    }),
    Object.freeze({
        PaperId: 1002,
        PaperName: "Fixture Beta"
    }),
    Object.freeze({
        PaperId: 1003,
        PaperName: "Fixture Gamma"
    }),
    Object.freeze({
        PaperId: 1004,
        PaperName: "Fixture Delta"
    })
]);

const SUCCESS_SECURITIES = Object.freeze([
    Object.freeze({
        Key: 1001,
        LastKnownRate: 1234,
        BuyLimit1: 1230,
        BuyVolume1: 10,
        SellLimit1: 1240,
        SellVolume1: 12
    }),
    Object.freeze({
        Key: 1002,
        LastKnownRate: 0,
        BuyLimit1: null,
        BuyVolume1: 0,
        SellLimit1: 10,
        SellVolume1: 0
    }),
    Object.freeze({
        Key: 1003,
        LastKnownRate: null,
        BuyLimit1: 990,
        BuyVolume1: 3,
        SellLimit1: null,
        SellVolume1: null
    }),
    Object.freeze({
        Key: 1004,
        LastKnownRate: 4567,
        BuyLimit1: 4550,
        BuyVolume1: 5,
        SellLimit1: 4580,
        SellVolume1: 7
    })
]);

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function createMapHeatPayload(records = SUCCESS_MAP_RECORDS) {
    return {
        data: {
            MapHeat: {
                recordCount: records.length,
                maxDateChange: null,
                records: clone(records)
            }
        }
    };
}

function createSecuritiesPayload(
    securities = SUCCESS_SECURITIES
) {
    return {
        data: {
            SecuritiesData: {
                Table: {
                    AsOfDate: "fixture-as-of-date",
                    Security: clone(securities)
                }
            }
        }
    };
}

const scenarios = Object.freeze({
    success: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 200,
        securities: SUCCESS_SECURITIES
    }),

    duplicatePaperId: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: Object.freeze([
            SUCCESS_MAP_RECORDS[0],
            SUCCESS_MAP_RECORDS[1],
            Object.freeze({
                PaperId: 1001,
                PaperName: "Fixture Duplicate"
            })
        ]),
        securitiesStatus: 200,
        securities: SUCCESS_SECURITIES
    }),

    missingPaperId: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: Object.freeze([
            SUCCESS_MAP_RECORDS[0],
            Object.freeze({
                PaperName: "Fixture Missing Id"
            })
        ]),
        securitiesStatus: 200,
        securities: SUCCESS_SECURITIES
    }),

    mapHeatHttpFailure: Object.freeze({
        mapHeatStatus: 503,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 200,
        securities: SUCCESS_SECURITIES
    }),

    invalidMapHeatStructure: Object.freeze({
        mapHeatStatus: 200,
        invalidMapHeatStructure: true,
        securitiesStatus: 200,
        securities: SUCCESS_SECURITIES
    }),

    securitiesHttpFailure: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 500,
        securities: SUCCESS_SECURITIES
    }),

    invalidSecuritiesStructure: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 200,
        invalidSecuritiesStructure: true
    }),

    securitiesMissingRecord: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 200,
        securities: Object.freeze([
            SUCCESS_SECURITIES[0],
            SUCCESS_SECURITIES[1],
            SUCCESS_SECURITIES[2]
        ])
    }),

    securitiesDuplicateKey: Object.freeze({
        mapHeatStatus: 200,
        mapHeatRecords: SUCCESS_MAP_RECORDS,
        securitiesStatus: 200,
        securities: Object.freeze([
            SUCCESS_SECURITIES[0],
            SUCCESS_SECURITIES[1],
            SUCCESS_SECURITIES[2],
            SUCCESS_SECURITIES[3],
            Object.freeze({
                ...SUCCESS_SECURITIES[3]
            })
        ])
    })
});

module.exports = Object.freeze({
    SUCCESS_MAP_RECORDS,
    SUCCESS_SECURITIES,
    createMapHeatPayload,
    createSecuritiesPayload,
    scenarios
});
