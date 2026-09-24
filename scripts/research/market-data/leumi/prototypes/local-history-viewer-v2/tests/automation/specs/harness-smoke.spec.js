const {
    test,
    expect
} = require("@playwright/test");

test(
    "browser harness loads storage modules in Chromium",
    async ({ page }) => {
        const pageErrors = [];

        page.on(
            "pageerror",
            error => {
                pageErrors.push(error.message);
            }
        );

        await page.goto(
            "/tests/automation/harness.html"
        );

        await expect(
            page.locator("#harness-ready")
        ).toHaveAttribute(
            "data-ready",
            "true"
        );

        await expect(
            page.locator("#harness-ready")
        ).toHaveText("ready");

        const capabilities =
            await page.evaluate(() => ({
                indexedDbAvailable:
                    typeof indexedDB !==
                    "undefined",
                harnessLoaded:
                    Boolean(
                        window.MarketFlowTestHarness
                    ),
                missingGlobals:
                    window
                        .MarketFlowTestHarness
                        .requiredGlobals
                        .filter(
                            name => !window[name]
                        )
            }));

        expect(
            capabilities.indexedDbAvailable
        ).toBe(true);

        expect(
            capabilities.harnessLoaded
        ).toBe(true);

        expect(
            capabilities.missingGlobals
        ).toEqual([]);

        expect(pageErrors).toEqual([]);
    }
);
