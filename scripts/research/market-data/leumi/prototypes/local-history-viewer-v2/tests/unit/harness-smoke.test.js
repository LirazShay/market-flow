"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const fixtures = require(
    "../fixtures/leumi-api-fixtures"
);

test(
    "fast unit-test harness runs in Node without browser globals",
    () => {
        assert.equal(
            typeof window,
            "undefined"
        );

        assert.equal(
            typeof fixtures.createMapHeatPayload,
            "function"
        );

        assert.equal(
            typeof fixtures.createSecuritiesPayload,
            "function"
        );

        assert.equal(
            fixtures.scenarios.success
                .mapHeatRecords.length,
            4
        );
    }
);
