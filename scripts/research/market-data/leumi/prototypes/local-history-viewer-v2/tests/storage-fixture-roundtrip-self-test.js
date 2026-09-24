(() => {
    "use strict";

    if (window.MarketFlowStorageFixtureSelfTest) {
        console.warn("MarketFlowStorageFixtureSelfTest is already loaded.");
        return;
    }

    const schema = window.MarketFlowStorageSchema;
    const connection = window.MarketFlowStorageConnection;
    const upgrade = window.MarketFlowStorageUpgrade;
    const read = window.MarketFlowStorageRead;
    const write = window.MarketFlowStorageWrite;

    if (!schema || !connection || !upgrade || !read || !write) {
        throw new Error(
            "Storage fixture self-test dependencies are missing. " +
            "Load schema.js, connection.js, upgrade.js, read.js and write.js first."
        );
    }

    const FIXTURE_PREFIX =
        "__market_flow_self_test_stage_6_2__:";

    function createRunId() {
        return (
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2)
        );
    }

    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(
                message +
                ". Expected " +
                JSON.stringify(expected) +
                ", received " +
                JSON.stringify(actual)
            );
        }
    }

    async function run() {
        let database;

        try {
            database = await connection.openDatabase({
                onUpgradeNeeded: upgrade.upgradeDatabase
            });

            const storeName = schema.stores.meta.name;
            const countBefore = await read.count(
                database,
                storeName
            );

            const fixtureKey =
                FIXTURE_PREFIX + createRunId();

            const originalFixture = {
                key: fixtureKey,
                value: {
                    version: 1,
                    nullValue: null,
                    zeroValue: 0,
                    emptyString: "",
                    textValue: "stage-6.2"
                }
            };

            const addResult = await write.add(
                database,
                storeName,
                originalFixture
            );

            assertEqual(
                addResult,
                fixtureKey,
                "add() returned an unexpected key"
            );

            const afterAdd = await read.get(
                database,
                storeName,
                fixtureKey
            );

            assertEqual(
                afterAdd.value.nullValue,
                null,
                "null did not survive add/get round-trip"
            );

            assertEqual(
                afterAdd.value.zeroValue,
                0,
                "zero did not survive add/get round-trip"
            );

            assertEqual(
                afterAdd.value.emptyString,
                "",
                "empty string did not survive add/get round-trip"
            );

            const updatedFixture = {
                ...afterAdd,
                value: {
                    ...afterAdd.value,
                    version: 2,
                    textValue: "stage-6.2-updated"
                }
            };

            const putResult = await write.put(
                database,
                storeName,
                updatedFixture
            );

            assertEqual(
                putResult,
                fixtureKey,
                "put() returned an unexpected key"
            );

            const afterPut = await read.get(
                database,
                storeName,
                fixtureKey
            );

            assertEqual(
                afterPut.value.version,
                2,
                "put() did not replace the existing fixture"
            );

            assertEqual(
                afterPut.value.nullValue,
                null,
                "null did not survive put/get round-trip"
            );

            assertEqual(
                afterPut.value.zeroValue,
                0,
                "zero did not survive put/get round-trip"
            );

            assertEqual(
                afterPut.value.emptyString,
                "",
                "empty string did not survive put/get round-trip"
            );

            const allMeta = await read.getAll(
                database,
                storeName
            );

            const fixtureFromGetAll = allMeta.find(
                record => record.key === fixtureKey
            );

            if (!fixtureFromGetAll) {
                throw new Error(
                    "getAll() did not return the Stage 6.2 fixture."
                );
            }

            const countAfter = await read.count(
                database,
                storeName
            );

            assertEqual(
                countAfter,
                countBefore + 1,
                "Fixture count changed unexpectedly"
            );

            return {
                passed: true,
                fixtureKey,
                fixturePrefix: FIXTURE_PREFIX,
                countBefore,
                countAfter,
                verified: [
                    "add",
                    "put",
                    "get",
                    "getAll",
                    "count",
                    "null round-trip",
                    "zero round-trip",
                    "empty-string round-trip"
                ],
                cleanupRequired: true
            };
        } finally {
            if (database) {
                connection.closeDatabase(database);
            }
        }
    }

    window.MarketFlowStorageFixtureSelfTest = Object.freeze({
        run,
        fixturePrefix: FIXTURE_PREFIX
    });

    console.log(
        "Market Flow storage fixture round-trip self-test loaded."
    );
})();
