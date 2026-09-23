"use strict";

const test =
    require("node:test");
const assert =
    require("node:assert/strict");

const {
    ACTIONS,
    validateManifest,
    decideLoaderAction,
    validateArtifactIdentity
} =
    require(
        "../../runtime/pure/permanent-loader-logic"
    );

const BUILD_A =
    "sha256:" +
    "a".repeat(64);

const BUILD_B =
    "sha256:" +
    "b".repeat(64);

const ARTIFACT_SHA =
    "c".repeat(64);

function manifest(
    overrides = {}
) {
    const {
        runtime:
            runtimeOverrides = {},
        ...topLevelOverrides
    } =
        overrides;

    return {
        formatVersion:
            2,
        buildId:
            BUILD_B,
        runtime: {
            url:
                "https://raw.githubusercontent.com/LirazShay/market-flow/runtime-release/market-flow-v1.runtime.js",
            sha256:
                ARTIFACT_SHA,
            bytes:
                123456,
            ...runtimeOverrides
        },
        ...topLevelOverrides
    };
}

test(
    "LDR1 accepts build identity independently from final runtime artifact SHA-256",
    () => {
        const normalized =
            validateManifest(
                manifest()
            );

        assert.equal(
            normalized.buildId,
            BUILD_B
        );

        assert.equal(
            normalized.runtime
                .sha256,
            ARTIFACT_SHA
        );

        assert.notEqual(
            normalized
                .buildId
                .slice(
                    "sha256:"
                        .length
                ),
            normalized
                .runtime
                .sha256
        );
    }
);

test(
    "LDR1 rejects malformed permanent-loader manifests",
    () => {
        assert.throws(
            () =>
                validateManifest({
                    formatVersion:
                        1,
                    buildId:
                        BUILD_B,
                    runtime: {
                        url:
                            "https://example.invalid/runtime.js",
                        sha256:
                            ARTIFACT_SHA,
                        bytes:
                            10
                    }
                }),
            /formatVersion/
        );

        assert.throws(
            () =>
                validateManifest(
                    manifest({
                        buildId:
                            "build-123"
                    })
                ),
            /buildId/
        );

        assert.throws(
            () =>
                validateManifest(
                    manifest({
                        runtime: {
                            sha256:
                                "not-a-sha",
                            bytes:
                                123
                        }
                    })
                ),
            /sha256/
        );

        assert.throws(
            () =>
                validateManifest(
                    manifest({
                        runtime: {
                            bytes:
                                0
                        }
                    })
                ),
            /bytes/
        );
    }
);

test(
    "LDR1 chooses INSTALL when no runtime is loaded",
    () => {
        const decision =
            decideLoaderAction({
                manifest:
                    manifest(),
                currentRuntime:
                    null
            });

        assert.deepEqual(
            decision,
            {
                action:
                    ACTIONS.INSTALL,
                reason:
                    "no-current-runtime",
                currentBuildId:
                    null,
                targetBuildId:
                    BUILD_B
            }
        );
    }
);

test(
    "LDR1 chooses REUSE when current and target build IDs match",
    () => {
        const decision =
            decideLoaderAction({
                manifest:
                    manifest(),
                currentRuntime: {
                    buildId:
                        BUILD_B,
                    canUpgrade:
                        true
                }
            });

        assert.equal(
            decision.action,
            ACTIONS.REUSE
        );

        assert.equal(
            decision.reason,
            "same-build"
        );
    }
);

test(
    "LDR1 chooses UPGRADE when build differs and current runtime supports upgrade",
    () => {
        const decision =
            decideLoaderAction({
                manifest:
                    manifest(),
                currentRuntime: {
                    buildId:
                        BUILD_A,
                    canUpgrade:
                        true
                }
            });

        assert.equal(
            decision.action,
            ACTIONS.UPGRADE
        );

        assert.equal(
            decision.currentBuildId,
            BUILD_A
        );

        assert.equal(
            decision.targetBuildId,
            BUILD_B
        );
    }
);

test(
    "LDR1 blocks automatic upgrade for a legacy runtime without the upgrade contract",
    () => {
        const decision =
            decideLoaderAction({
                manifest:
                    manifest(),
                currentRuntime: {
                    buildId:
                        null,
                    canUpgrade:
                        false
                }
            });

        assert.deepEqual(
            decision,
            {
                action:
                    ACTIONS.BLOCKED,
                reason:
                    "legacy-runtime-no-build-id",
                currentBuildId:
                    null,
                targetBuildId:
                    BUILD_B
            }
        );
    }
);

test(
    "LDR1 blocks automatic upgrade when current runtime is known but not upgradeable",
    () => {
        const decision =
            decideLoaderAction({
                manifest:
                    manifest(),
                currentRuntime: {
                    buildId:
                        BUILD_A,
                    canUpgrade:
                        false
                }
            });

        assert.equal(
            decision.action,
            ACTIONS.BLOCKED
        );

        assert.equal(
            decision.reason,
            "current-runtime-not-upgradeable"
        );
    }
);

test(
    "LDR1 accepts downloaded artifact only when SHA-256 and byte length both match",
    () => {
        const target =
            manifest();

        assert.deepEqual(
            validateArtifactIdentity({
                manifest:
                    target,
                actualSha256:
                    ARTIFACT_SHA,
                actualBytes:
                    123456
            }),
            {
                valid:
                    true,
                expectedSha256:
                    ARTIFACT_SHA,
                actualSha256:
                    ARTIFACT_SHA,
                expectedBytes:
                    123456,
                actualBytes:
                    123456
            }
        );

        assert.equal(
            validateArtifactIdentity({
                manifest:
                    target,
                actualSha256:
                    "d".repeat(64),
                actualBytes:
                    123456
            }).valid,
            false
        );

        assert.equal(
            validateArtifactIdentity({
                manifest:
                    target,
                actualSha256:
                    ARTIFACT_SHA,
                actualBytes:
                    123455
            }).valid,
            false
        );
    }
);
