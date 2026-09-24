"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    SUCCESS_MAP_RECORDS,
    SUCCESS_SECURITIES,
    createMapHeatPayload,
    createSecuritiesPayload,
    scenarios
} = require(
    "../fixtures/leumi-api-fixtures"
);

test(
    "MapHeat fixture factory returns a detached payload",
    () => {
        const payload =
            createMapHeatPayload();

        assert.equal(
            payload.data.MapHeat
                .recordCount,
            SUCCESS_MAP_RECORDS.length
        );

        assert.notEqual(
            payload.data.MapHeat
                .records,
            SUCCESS_MAP_RECORDS
        );

        payload.data.MapHeat
            .records[0]
            .PaperName =
            "mutated";

        assert.equal(
            SUCCESS_MAP_RECORDS[0]
                .PaperName,
            "Fixture Alpha"
        );
    }
);

test(
    "security fixture preserves zero distinctly from null",
    () => {
        const payload =
            createSecuritiesPayload();

        const securities =
            payload.data
                .SecuritiesData
                .Table
                .Security;

        assert.equal(
            securities.find(
                item =>
                    item.Key === 1002
            ).LastKnownRate,
            0
        );

        assert.equal(
            securities.find(
                item =>
                    item.Key === 1003
            ).LastKnownRate,
            null
        );
    }
);

test(
    "success fixture contains matching MapHeat PaperIds and security Keys",
    () => {
        assert.deepEqual(
            SUCCESS_MAP_RECORDS
                .map(
                    record =>
                        String(
                            record.PaperId
                        )
                ),
            SUCCESS_SECURITIES
                .map(
                    security =>
                        String(
                            security.Key
                        )
                )
        );
    }
);

test(
    "fixture scenarios expose the expected deterministic failure modes",
    () => {
        assert.equal(
            scenarios.mapHeatHttpFailure
                .mapHeatStatus,
            503
        );

        assert.equal(
            scenarios.securitiesHttpFailure
                .securitiesStatus,
            500
        );

        assert.equal(
            scenarios.invalidMapHeatStructure
                .invalidMapHeatStructure,
            true
        );

        assert.equal(
            scenarios.invalidSecuritiesStructure
                .invalidSecuritiesStructure,
            true
        );
    }
);
