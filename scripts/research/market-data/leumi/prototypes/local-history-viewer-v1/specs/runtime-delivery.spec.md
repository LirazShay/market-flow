# MF-LHV-RUNTIME-001 — Runtime Assembly and Bookmarklet Delivery Specification

## Purpose

Runtime delivery turns repository source modules into one reproducible browser-runnable payload and a practical self-contained Bookmarklet.

It exists so live use does not require manually loading source files in dependency order or maintaining a second hand-copied implementation.

Operational progress is tracked only in `../STATUS.json`.

## Scope

This spec owns:

- deterministic source ordering;
- assembled readable runtime;
- compact Bookmarklet artifact;
- runtime entry/orchestration API;
- idempotent repeated launch;
- stop/restart boundary;
- generated artifact policy;
- verified distribution through CI/release.

It does not own recorder/storage/viewer business logic.

## Contract

### Assembly

Repository source modules are ordered explicitly by:

~~~text
runtime/source-order.js
~~~

The runtime entry point is:

~~~text
runtime/entry.js
~~~

Build command:

~~~text
npm run build:runtime
~~~

Generated artifacts:

~~~text
runtime/dist/market-flow-v1.runtime.js
runtime/dist/market-flow-v1.bookmarklet.txt
runtime/dist/market-flow-v1.manifest.json
runtime/dist/market-flow-loader-probe.bookmarklet.txt
~~~

The readable runtime preserves assembled repository source for inspection/debugging.

The Bookmarklet is generated from that assembled runtime, not maintained separately.

### Compact artifact

The Bookmarklet contract is:

~~~text
"javascript:"
+
compact single-line JavaScript
~~~

Current compaction deliberately uses Terser with:

~~~text
compress: false
mangle: false
~~~

to remove formatting/comments without renaming identifiers or applying aggressive semantic transformations.

The Bookmarklet body is raw compact JavaScript.

It must not percent-encode spaces or whole-runtime content.

There is no arbitrary absolute Bookmarklet size ceiling in the build. Legitimate source growth is not itself a build error.

The no-inflation packaging contract is:

~~~text
bookmarklet bytes
=
compact runtime bytes
+
bytes("javascript:")
~~~

### Integrity manifest and loader probe

The build also emits a deterministic manifest whose build identity is the SHA-256 of the readable runtime.

The manifest records:

~~~text
formatVersion
buildId
runtime.fileName
runtime.url
runtime.sha256
runtime.bytes
~~~

The loader-probe Bookmarklet is an experimental compatibility artifact. It may fetch and verify the remote runtime, but it must not execute it or replace the currently running runtime.

The self-contained Bookmarklet remains the normal verified delivery path unless a later spec explicitly promotes a remote loader after live-origin verification.

Full probe semantics live in:

~~~text
loader-probe.spec.md
~~~

### Runtime API

Public runtime API:

~~~text
MarketFlowRuntime.launch({ recorderConfig })
MarketFlowRuntime.stop(reason)
MarketFlowRuntime.closeViewer()
MarketFlowRuntime.getSnapshot()
MarketFlowRuntime.createDebugBundle(options)
MarketFlowRuntime.downloadDebugBundle(options)
~~~

Initial generated runtime execution auto-launches once.

Repeated Bookmarklet execution while already loaded must reuse the same exposed runtime instead of redefining/forking component globals.

### Repeated launch

While recorder is running:

- do not start a second recorder;
- reuse/focus the named viewer.

After a clean stop:

- wait for stop persistence;
- allow a new recorder instance;
- keep prior IndexedDB history.

### Distribution

A full successful Browser CI run may publish the generated runtime artifacts to the stable rolling release:

~~~text
local-history-viewer-v1-runtime-latest
~~~

The stable download should represent browser-verified generated output, not an arbitrary unverified local build.

## Invariants

1. Generated output derives from repository source modules.
2. Business logic is not duplicated into a separately maintained Bookmarklet implementation.
3. Dependency ordering is deterministic.
4. Bookmarklet is self-contained and does not fetch executable code from an external runtime host.
5. Bookmarklet begins with `javascript:`.
6. Bookmarklet body is single-line compact JavaScript.
7. Bookmarklet contains no whole-runtime percent encoding / `%20` packaging transformation.
8. There is no arbitrary absolute size rejection.
9. Repeated launch is idempotent with respect to recorder/viewer instance creation.
10. Restart is blocked while prior stop persistence is pending.
11. Generated artifacts contain no credentials, cookies, authorization headers, account identifiers, or private session state.
12. Stable release publication follows full Browser CI success.
13. The runtime manifest SHA-256 and byte count must describe the exact published readable runtime.
14. The compatibility probe never executes or replaces the remote runtime it downloads.
15. A permanent remote loader is not considered supported until real Leumi-origin compatibility is verified.

## Failure semantics

Build failure:

~~~text
missing source
invalid source order/path
compaction failure
artifact write failure
→ no valid generated delivery artifact
~~~

Runtime launch failure must surface explicitly.

A second launch must not hide a stop-persistence conflict by creating overlapping recorder ownership.

Release publication must not promote artifacts when Browser CI failed.

A live authenticated-browser failure remains live verification evidence; CI smoke success must not be misrepresented as proof of real provider/session compatibility.

## Extension and reuse

The runtime builder is a reusable delivery pattern for browser research tools that need:

- source-controlled modular code;
- one self-contained user-launchable payload;
- deterministic packaging;
- browser smoke verification;
- stable verified distribution.

Future tools may choose extensions, userscripts, local apps, or other packaging. They should retain the principle that delivery artifacts are generated from source and tested, not hand-maintained forks.

If browser URL/bookmark practicality changes materially, packaging may change without changing recorder/storage/viewer contracts.

## Verification mapping

Fast build/package tests:

~~~text
../tests/unit/runtime-build.test.js
~~~

Browser smoke:

~~~text
../tests/automation/specs/runtime-assembly.spec.js
../tests/automation/specs/loader-probe.spec.js
~~~

The Browser suite verifies generated execution, initial/repeated launch and restart behavior, plus probe-side remote fetch/integrity/compile-without-execute behavior under controlled browser conditions.

Real Chrome bookmark storage/execution inside the authenticated Leumi site remains live-provider verification.

## Change triggers

Review this spec whenever changing:

- source order;
- runtime entry API;
- build tooling/minifier configuration;
- Bookmarklet format;
- encoding/compaction;
- generated artifact names;
- launch/relaunch/restart behavior;
- external-host dependency;
- manifest/build identity;
- loader compatibility probe;
- promotion of a remote loader from experiment to supported delivery;
- release publication rule;
- security contents of generated output.

## References

- `../runtime/README.md`
- `../runtime/source-order.js`
- `../runtime/build-runtime.js`
- `../runtime/entry.js`
- `../runtime/loader-probe.js`
- `loader-probe.spec.md`
- `system.spec.md`
- `../tests/unit/runtime-build.test.js`
- `../tests/automation/specs/runtime-assembly.spec.js`
