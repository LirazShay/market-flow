(() => {
    "use strict";

    if (window.MarketFlowStorageSchema) {
        console.warn("MarketFlowStorageSchema is already loaded.");
        return;
    }

    const schema = Object.freeze({
        databaseName: "market-flow-leumi-history-v1",
        databaseVersion: 1,

        stores: Object.freeze({
            meta: Object.freeze({
                name: "meta",
                keyPath: "key",
                autoIncrement: false,
                indexes: Object.freeze({})
            }),

            sessions: Object.freeze({
                name: "sessions",
                keyPath: "sessionId",
                autoIncrement: true,
                indexes: Object.freeze({
                    byStartedAt: Object.freeze({
                        name: "byStartedAt",
                        keyPath: "startedAtMs",
                        unique: false
                    })
                })
            }),

            universe: Object.freeze({
                name: "universe",
                keyPath: "securityId",
                autoIncrement: false,
                indexes: Object.freeze({
                    byPaperName: Object.freeze({
                        name: "byPaperName",
                        keyPath: "paperName",
                        unique: false
                    })
                })
            }),

            cycles: Object.freeze({
                name: "cycles",
                keyPath: "cycleId",
                autoIncrement: true,
                indexes: Object.freeze({
                    bySession: Object.freeze({
                        name: "bySession",
                        keyPath: "sessionId",
                        unique: false
                    }),
                    byStartedAt: Object.freeze({
                        name: "byStartedAt",
                        keyPath: "startedAtMs",
                        unique: false
                    }),
                    byStatus: Object.freeze({
                        name: "byStatus",
                        keyPath: "status",
                        unique: false
                    })
                })
            }),

            latest: Object.freeze({
                name: "latest",
                keyPath: "securityId",
                autoIncrement: false,
                indexes: Object.freeze({})
            }),

            history: Object.freeze({
                name: "history",
                keyPath: Object.freeze(["cycleId", "securityId"]),
                autoIncrement: false,
                indexes: Object.freeze({
                    bySecurityTime: Object.freeze({
                        name: "bySecurityTime",
                        keyPath: Object.freeze(["securityId", "collectedAtMs"]),
                        unique: false
                    }),
                    byCollectedAt: Object.freeze({
                        name: "byCollectedAt",
                        keyPath: "collectedAtMs",
                        unique: false
                    }),
                    byCycle: Object.freeze({
                        name: "byCycle",
                        keyPath: "cycleId",
                        unique: false
                    }),
                    bySession: Object.freeze({
                        name: "bySession",
                        keyPath: "sessionId",
                        unique: false
                    })
                })
            })
        })
    });

    window.MarketFlowStorageSchema = schema;

    console.log(
        "Market Flow storage schema loaded:",
        schema.databaseName,
        "v" + schema.databaseVersion
    );
})();
