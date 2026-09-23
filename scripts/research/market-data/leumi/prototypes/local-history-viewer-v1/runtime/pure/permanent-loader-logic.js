(function (root, factory) {
    "use strict";

    const api =
        factory();

    if (
        typeof module === "object" &&
        module.exports
    ) {
        module.exports =
            api;
    }

    if (root) {
        root.MarketFlowPermanentLoaderLogic =
            api;
    }
})(
    typeof window !== "undefined"
        ? window
        : null,
    function () {
        "use strict";

        const ACTIONS =
            Object.freeze({
                INSTALL:
                    "INSTALL",
                REUSE:
                    "REUSE",
                UPGRADE:
                    "UPGRADE",
                BLOCKED:
                    "BLOCKED"
            });

        const BUILD_ID_PATTERN =
            /^sha256:[0-9a-f]{64}$/;

        const SHA256_PATTERN =
            /^[0-9a-f]{64}$/;

        function assertObject(
            value,
            label
        ) {
            if (
                value === null ||
                typeof value !==
                    "object" ||
                Array.isArray(
                    value
                )
            ) {
                throw new TypeError(
                    label +
                    " must be an object."
                );
            }
        }

        function validateHttpsUrl(
            value,
            label
        ) {
            if (
                typeof value !==
                    "string" ||
                value.length ===
                    0
            ) {
                throw new TypeError(
                    label +
                    " must be a non-empty string."
                );
            }

            let parsed;

            try {
                parsed =
                    new URL(
                        value
                    );
            } catch {
                throw new TypeError(
                    label +
                    " must be an absolute URL."
                );
            }

            if (
                parsed.protocol !==
                    "https:"
            ) {
                throw new TypeError(
                    label +
                    " must use HTTPS."
                );
            }

            return parsed.href;
        }

        function validateManifest(
            value
        ) {
            assertObject(
                value,
                "manifest"
            );

            if (
                value.formatVersion !==
                    2
            ) {
                throw new TypeError(
                    "manifest.formatVersion must be 2."
                );
            }

            if (
                typeof value.buildId !==
                    "string" ||
                !BUILD_ID_PATTERN.test(
                    value.buildId
                )
            ) {
                throw new TypeError(
                    "manifest.buildId must be sha256:<64 lowercase hex characters>."
                );
            }

            assertObject(
                value.runtime,
                "manifest.runtime"
            );

            const runtimeUrl =
                validateHttpsUrl(
                    value.runtime.url,
                    "manifest.runtime.url"
                );

            if (
                typeof value.runtime
                    .sha256 !==
                    "string" ||
                !SHA256_PATTERN.test(
                    value.runtime
                        .sha256
                )
            ) {
                throw new TypeError(
                    "manifest.runtime.sha256 must contain 64 lowercase hex characters."
                );
            }

            if (
                !Number.isSafeInteger(
                    value.runtime
                        .bytes
                ) ||
                value.runtime
                    .bytes <=
                    0
            ) {
                throw new TypeError(
                    "manifest.runtime.bytes must be a positive safe integer."
                );
            }

            return Object.freeze({
                formatVersion:
                    2,
                buildId:
                    value.buildId,
                runtime:
                    Object.freeze({
                        url:
                            runtimeUrl,
                        sha256:
                            value.runtime
                                .sha256,
                        bytes:
                            value.runtime
                                .bytes
                    })
            });
        }

        function normalizeCurrentRuntime(
            value
        ) {
            if (
                value === null ||
                value === undefined
            ) {
                return null;
            }

            assertObject(
                value,
                "currentRuntime"
            );

            const buildId =
                value.buildId ??
                null;

            if (
                buildId !==
                    null &&
                (
                    typeof buildId !==
                        "string" ||
                    !BUILD_ID_PATTERN
                        .test(
                            buildId
                        )
                )
            ) {
                return Object.freeze({
                    buildId:
                        null,
                    canUpgrade:
                        false,
                    invalidBuildId:
                        true
                });
            }

            return Object.freeze({
                buildId,
                canUpgrade:
                    value.canUpgrade ===
                    true,
                invalidBuildId:
                    false
            });
        }

        function makeDecision(
            action,
            reason,
            currentBuildId,
            targetBuildId
        ) {
            return Object.freeze({
                action,
                reason,
                currentBuildId,
                targetBuildId
            });
        }

        function decideLoaderAction({
            manifest,
            currentRuntime
        }) {
            const target =
                validateManifest(
                    manifest
                );

            const current =
                normalizeCurrentRuntime(
                    currentRuntime
                );

            if (!current) {
                return makeDecision(
                    ACTIONS.INSTALL,
                    "no-current-runtime",
                    null,
                    target.buildId
                );
            }

            if (
                current.invalidBuildId
            ) {
                return makeDecision(
                    ACTIONS.BLOCKED,
                    "current-runtime-invalid-build-id",
                    null,
                    target.buildId
                );
            }

            if (
                current.buildId ===
                    null
            ) {
                return makeDecision(
                    ACTIONS.BLOCKED,
                    "legacy-runtime-no-build-id",
                    null,
                    target.buildId
                );
            }

            if (
                current.buildId ===
                    target.buildId
            ) {
                return makeDecision(
                    ACTIONS.REUSE,
                    "same-build",
                    current.buildId,
                    target.buildId
                );
            }

            if (
                !current.canUpgrade
            ) {
                return makeDecision(
                    ACTIONS.BLOCKED,
                    "current-runtime-not-upgradeable",
                    current.buildId,
                    target.buildId
                );
            }

            return makeDecision(
                ACTIONS.UPGRADE,
                "new-build-available",
                current.buildId,
                target.buildId
            );
        }

        function validateArtifactIdentity({
            manifest,
            actualSha256,
            actualBytes
        }) {
            const target =
                validateManifest(
                    manifest
                );

            if (
                typeof actualSha256 !==
                    "string" ||
                !SHA256_PATTERN.test(
                    actualSha256
                )
            ) {
                throw new TypeError(
                    "actualSha256 must contain 64 lowercase hex characters."
                );
            }

            if (
                !Number.isSafeInteger(
                    actualBytes
                ) ||
                actualBytes < 0
            ) {
                throw new TypeError(
                    "actualBytes must be a non-negative safe integer."
                );
            }

            return Object.freeze({
                valid:
                    actualSha256 ===
                        target.runtime
                            .sha256 &&
                    actualBytes ===
                        target.runtime
                            .bytes,
                expectedSha256:
                    target.runtime
                        .sha256,
                actualSha256,
                expectedBytes:
                    target.runtime
                        .bytes,
                actualBytes
            });
        }

        return Object.freeze({
            ACTIONS,
            BUILD_ID_PATTERN,
            SHA256_PATTERN,
            validateManifest,
            decideLoaderAction,
            validateArtifactIdentity
        });
    }
);
