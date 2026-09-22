"use strict";

const fs =
    require("node:fs");
const path =
    require("node:path");
const test =
    require("node:test");
const assert =
    require("node:assert/strict");

const repositoryRoot =
    path.resolve(
        __dirname,
        ...Array(8).fill("..")
    );

const workstreamRoot =
    path.join(
        repositoryRoot,
        "scripts",
        "research",
        "market-data",
        "leumi",
        "prototypes",
        "local-history-viewer-v1"
    );

const specsRoot =
    path.join(
        workstreamRoot,
        "specs"
    );

const requiredSpecFiles = [
    "system.spec.md",
    "provider-data-contract.spec.md",
    "recorder.spec.md",
    "persistence.spec.md",
    "messaging.spec.md",
    "viewer.spec.md",
    "runtime-delivery.spec.md",
    "research-evolution.spec.md"
];

const requiredHeadings = [
    "## Purpose",
    "## Scope",
    "## Contract",
    "## Invariants",
    "## Failure semantics",
    "## Extension and reuse",
    "## Verification mapping",
    "## Change triggers",
    "## References"
];

const forbiddenOperationalPatterns = [
    /"currentFocus"/,
    /"runId"/,
    /complete-browser-ci-verified/i,
    /verification-pending\s+—/i
];

test(
    "durable responsibility specs exist with the common maintenance contract",
    () => {
        for (
            const fileName of
            requiredSpecFiles
        ) {
            const filePath =
                path.join(
                    specsRoot,
                    fileName
                );

            assert.equal(
                fs.existsSync(
                    filePath
                ),
                true,
                "Missing required spec: " +
                fileName
            );

            const content =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );

            assert.match(
                content,
                /^# MF-LHV-[A-Z]+-\d{3}\s+—/m,
                fileName +
                " must have a stable spec identifier."
            );

            for (
                const heading of
                requiredHeadings
            ) {
                assert.equal(
                    content.includes(
                        heading
                    ),
                    true,
                    fileName +
                    " is missing required heading " +
                    heading
                );
            }

            assert.equal(
                content.includes(
                    "../STATUS.json"
                ),
                true,
                fileName +
                " must point live progress back to STATUS.json."
            );

            for (
                const pattern of
                forbiddenOperationalPatterns
            ) {
                assert.equal(
                    pattern.test(
                        content
                    ),
                    false,
                    fileName +
                    " must not embed live operational status."
                );
            }
        }
    }
);

test(
    "spec index references every required responsibility spec",
    () => {
        const indexPath =
            path.join(
                specsRoot,
                "README.md"
            );

        const content =
            fs.readFileSync(
                indexPath,
                "utf8"
            );

        for (
            const fileName of
            requiredSpecFiles
        ) {
            assert.equal(
                content.includes(
                    fileName
                ),
                true,
                "Spec index is missing " +
                fileName
            );
        }

        assert.equal(
            content.includes(
                "Mandatory SPEC impact review"
            ),
            true
        );
    }
);

test(
    "repository operating rules retain mandatory SPEC impact review hooks",
    () => {
        const requiredPolicySurfaces = [
            path.join(
                repositoryRoot,
                "AGENTS.md"
            ),
            path.join(
                repositoryRoot,
                "docs",
                "project",
                "engineering-practices.md"
            ),
            path.join(
                repositoryRoot,
                "docs",
                "project",
                "specification-policy.md"
            ),
            path.join(
                repositoryRoot,
                ".github",
                "pull_request_template.md"
            )
        ];

        for (
            const filePath of
            requiredPolicySurfaces
        ) {
            const content =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );

            assert.equal(
                content.includes(
                    "SPEC impact review"
                ),
                true,
                path.relative(
                    repositoryRoot,
                    filePath
                ) +
                " must retain the SPEC impact review rule."
            );
        }
    }
);

test(
    "major component READMEs point to their owning specs",
    () => {
        const mappings = [
            [
                "recorder/README.md",
                "../specs/recorder.spec.md"
            ],
            [
                "storage/README.md",
                "../specs/persistence.spec.md"
            ],
            [
                "messaging/README.md",
                "../specs/messaging.spec.md"
            ],
            [
                "viewer/README.md",
                "../specs/viewer.spec.md"
            ],
            [
                "runtime/README.md",
                "../specs/runtime-delivery.spec.md"
            ]
        ];

        for (
            const [
                relativeReadme,
                specReference
            ] of
            mappings
        ) {
            const content =
                fs.readFileSync(
                    path.join(
                        workstreamRoot,
                        relativeReadme
                    ),
                    "utf8"
                );

            assert.equal(
                content.includes(
                    specReference
                ),
                true,
                relativeReadme +
                " must link to " +
                specReference
            );
        }
    }
);
