const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/automation/specs",
    fullyParallel: false,
    workers: 2,
    retries: 0,
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    reporter: process.env.CI
        ? [
            ["line"],
            ["html", {
                outputFolder: "playwright-report",
                open: "never"
            }]
        ]
        : [
            ["list"],
            ["html", {
                outputFolder: "playwright-report",
                open: "never"
            }]
        ],
    outputDir: "test-results",
    use: {
        baseURL: "http://127.0.0.1:4173",
        browserName: "chromium",
        headless: true,
        trace: "retain-on-failure",
        screenshot: "only-on-failure"
    },
    webServer: {
        command: "node tests/automation/server.js",
        url: "http://127.0.0.1:4173/tests/automation/harness.html",
        reuseExistingServer: !process.env.CI,
        timeout: 15000
    }
});
