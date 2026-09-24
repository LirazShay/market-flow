# Product Documentation

This directory holds durable **product-level** thinking for Market Flow.

It is intentionally separate from:

- docs/project/ — repository/process/architecture governance and cross-project operating context.
- docs/analysis/ — analytical research, experiments, scoring research and validation.
- workstream-local specs/ — normative contracts for a concrete subsystem.
- workstream STATUS.json — live operational progress.

## What belongs here

Documents that describe what Market Flow should eventually be able to do, product capabilities, broad requirements, product concepts, and early specifications that may affect several future workstreams.

Examples:

- a future vision.md for the complete Market Flow product;
- cross-cutting product capabilities;
- early requirement sets that are not yet owned by one implementation;
- product ideas that should survive individual prototypes;
- product-level constraints that later workstreams must map into their own specs.

## Current documents

- [live-opportunity-discovery.md](live-opportunity-discovery.md) — initial product direction and requirements for live market opportunity discovery.

## Structure rule

Keep this directory flat by default.

Do not create subdirectories merely because more documents are added. Split into subdirectories only when a real responsibility/lifecycle boundary emerges and the flat layout becomes materially harder to navigate.

## Status rule

These documents must not carry live implementation stage, completion state, current CI snapshot, or the exact next work item.

Operational progress remains owned by the relevant workstream STATUS.json.
