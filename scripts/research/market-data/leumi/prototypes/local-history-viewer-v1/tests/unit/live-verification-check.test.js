const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const helperPath = path.resolve(
    __dirname,
    "../../debug/live-verification-check.js"
);

function createDebugBundle() {
    return {
        runtime: {
            recorder: {
                status: "running-cycle",
                isRunning: true,
                cycleInFlight: true,
                completedCycles: 2,
                failedCycles: 0,
                latestError: null,
                latestCycle: {
                    status: "complete",
                    requested: 561,
                    received: 561,
                    unique: 561,
                    missing: 0,
                    duplicates: 0
                }
            },
            persistence: {
                hasDatabase: true
            },
            viewer: {
                available: true,
                isOpen: true
            }
        },
        database: {
            rowCounts: {
                cycles: 2,
                latest: 561,
                history: 1122
            }
        },
        recentCycles: [
            {
                cycleId: 2,
                status: "complete",
                requested: 561,
                received: 561,
                unique: 561,
                missing: 0,
                duplicates: 0,
                rowReadTruncated: false,
                securityCount: 561,
                marketDataFingerprint: "market-2",
                providerTimeFingerprint: "provider-2",
                changedMarketSecuritiesVsPrevious: 41,
                changedProviderTimeSecuritiesVsPrevious: 4,
                providerTimes: {},
                chunks: []
            },
            {
                cycleId: 1,
                status: "complete",
                requested: 561,
                received: 561,
                unique: 561,
                missing: 0,
                duplicates: 0,
                rowReadTruncated: false,
                securityCount: 561,
                marketDataFingerprint: "market-1",
                providerTimeFingerprint: "provider-1",
                changedMarketSecuritiesVsPrevious: null,
                changedProviderTimeSecuritiesVsPrevious: null,
                providerTimes: {},
                chunks: []
            }
        ]
    };
}

test(
    "live verification accepts an actively running recorder while a cycle is in flight",
    async () => {
        const source =
            fs.readFileSync(
                helperPath,
                "utf8"
            );

        const context = {
            console: {
                log() {},
                error(error) {
                    throw error;
                }
            },
            Blob: class Blob {
                constructor(parts) {
                    this.parts = parts;
                }
            },
            URL: {
                createObjectURL() {
                    return "blob:test";
                },
                revokeObjectURL() {}
            },
            document: {
                body: {
                    appendChild() {}
                },
                documentElement: {
                    appendChild() {}
                },
                createElement() {
                    return {
                        hidden: false,
                        href: "",
                        download: "",
                        click() {},
                        remove() {}
                    };
                }
            },
            setTimeout(callback) {
                callback();
            },
            window: {
                MarketFlowRuntime: {
                    async createDebugBundle() {
                        return createDebugBundle();
                    }
                }
            }
        };

        vm.runInNewContext(
            source,
            context,
            {
                filename:
                    helperPath
            }
        );

        await new Promise(
            resolve =>
                setImmediate(
                    resolve
                )
        );

        const report =
            context.window
                .MarketFlowLiveVerificationReport;

        assert.ok(report);
        assert.equal(
            report.status,
            "PASS"
        );
        assert.deepEqual(
            Array.from(
                report.failedCheckNames
            ),
            []
        );
        assert.equal(
            report.recorderSummary.status,
            "running-cycle"
        );
        assert.equal(
            report.recorderSummary.isRunning,
            true
        );
    }
);
