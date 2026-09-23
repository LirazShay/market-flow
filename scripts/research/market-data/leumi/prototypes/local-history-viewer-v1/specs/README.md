# Local History Viewer V1 — Specification Index

This directory is the normative specification layer for the Local History Viewer V1 research tool and the reusable ideas it establishes.

It answers:

~~~text
What is this?
Why does it exist?
What does each responsibility promise?
What must never break?
What can future tools reuse or replace?
~~~

Operational progress is **not** defined here. See `../STATUS.json`.

Planned work/order is **not** defined here. See `../ROADMAP.md`.

Deeper rationale/evidence lives in `../docs/` and repository-level `docs/leumi-api/`.

## Specification set

| Spec | Responsibility |
|---|---|
| [system.spec.md](system.spec.md) | whole-tool purpose, architecture contract, global invariants |
| [provider-data-contract.spec.md](provider-data-contract.spec.md) | Leumi provider assumptions and data-integrity boundary |
| [recorder.spec.md](recorder.spec.md) | universe discovery, chunk collection, cycle completeness, scheduling |
| [persistence.spec.md](persistence.spec.md) | IndexedDB schema ownership, lifecycle and atomic persistence |
| [messaging.spec.md](messaging.spec.md) | cross-tab notification contract |
| [viewer.spec.md](viewer.spec.md) | same-origin viewer, current table, history, diagnostics, refresh |
| [runtime-delivery.spec.md](runtime-delivery.spec.md) | deterministic assembly, Bookmarklet, launch/relaunch, verified distribution |
| [loader-probe.spec.md](loader-probe.spec.md) | non-invasive live compatibility test for a future permanent remote loader |
| [debug-bundle.spec.md](debug-bundle.spec.md) | bounded sanitized diagnostics/export for live-only problems |
| [research-evolution.spec.md](research-evolution.spec.md) | how this initial research tool becomes a foundation for later tools |

## Ownership model

~~~text
specs/
    durable normative contracts

docs/
    deeper design, evidence and rationale

component README
    local orientation/navigation

code + tests
    implementation + executable evidence

STATUS.json
    live progress only
~~~

If code/tests/specs disagree, do not silently pick one. Treat the mismatch as a coherence defect and resolve intended behavior explicitly.

## Mandatory SPEC impact review

Any meaningful change to behavior, architecture, provider assumptions, storage, messaging, viewer UX, delivery, failure semantics, or reuse boundaries must review the affected specs.

Typical mapping:

| Changed area | Specs to review |
|---|---|
| recorder/provider collection | `recorder.spec.md`, `provider-data-contract.spec.md`, often `system.spec.md` |
| IndexedDB/schema/transactions | `persistence.spec.md`, often `system.spec.md` |
| BroadcastChannel/messages | `messaging.spec.md`, `viewer.spec.md` / `recorder.spec.md` where affected |
| viewer behavior | `viewer.spec.md` |
| runtime/Bookmarklet/release | `runtime-delivery.spec.md` |
| remote-loader feasibility / manifest / CSP probe | `loader-probe.spec.md`, `runtime-delivery.spec.md` |
| live diagnostics/debug export | `debug-bundle.spec.md`, plus owning component specs when behavior is affected |
| new research tool/reuse direction | `research-evolution.spec.md`, `system.spec.md` |
| cross-cutting invariant | every affected responsibility spec |

A change that introduces a new durable responsibility should create a new spec instead of stretching an unrelated spec indefinitely.

## Spec maintenance rule

A work batch is not documentation-complete until:

~~~text
implementation changed
→ SPEC impact reviewed
→ affected specs updated/added/removed
→ references checked
→ relevant tests/verification run
~~~

No spec should contain live stage status, next-stage pointers, or latest CI snapshots.

Repository-wide policy:

~~~text
../../../../../../../docs/project/specification-policy.md
~~~
