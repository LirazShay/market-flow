(function (root, factory) {
    "use strict";

    const api = factory();

    if (
        typeof module === "object" &&
        module.exports
    ) {
        module.exports = api;
    }

    if (root) {
        root.MarketFlowRecorderDiagnosticsLogic = api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        function assertFiniteTime(
            value,
            name
        ) {
            if (
                !Number.isFinite(value) ||
                value < 0
            ) {
                throw new TypeError(
                    name +
                    " must be a non-negative finite number."
                );
            }
        }

        function normalizeError(
            error,
            atMs
        ) {
            assertFiniteTime(
                atMs,
                "atMs"
            );

            return Object.freeze({
                name:
                    error?.name ??
                    "Error",
                message:
                    error?.message ??
                    String(error),
                atMs
            });
        }

        function normalizeStorageEstimate(
            estimate
        ) {
            const usage =
                Number.isFinite(
                    estimate?.usage
                ) &&
                estimate.usage >= 0
                    ? estimate.usage
                    : null;

            const quota =
                Number.isFinite(
                    estimate?.quota
                ) &&
                estimate.quota >= 0
                    ? estimate.quota
                    : null;

            const freeBytes =
                usage !== null &&
                quota !== null
                    ? Math.max(
                        0,
                        quota - usage
                    )
                    : null;

            const usageRatio =
                usage !== null &&
                quota !== null &&
                quota > 0
                    ? usage / quota
                    : null;

            return Object.freeze({
                usageBytes:
                    usage,
                quotaBytes:
                    quota,
                freeBytes,
                usageRatio
            });
        }

        return Object.freeze({
            normalizeError,
            normalizeStorageEstimate
        });
    }
);
