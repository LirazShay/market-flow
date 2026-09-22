# Local History Viewer V1 — Design Docs

התיקייה הזו מכילה **design documents יציבים**, לא operational status.

## Read by question

| אם צריך להבין... | קובץ |
|---|---|
| מה V1 חייב/לא חייב לעשות | [requirements.md](requirements.md) |
| איך הרכיבים מתחברים | [architecture.md](architecture.md) |
| schema, stores, records, transaction boundaries | [data-model.md](data-model.md) |
| measured IndexedDB growth / bytes per history row / capacity caveats | [storage-growth-report.md](storage-growth-report.md) |
| viewer behavior / RTL / tables / states | [viewer-ux.md](viewer-ux.md) |
| test cases שתוכננו ל-V1 | [test-plan.md](test-plan.md) |
| Clean Code / design / safe-change rules | [project engineering practices](../../../../../../../docs/project/engineering-practices.md) |

## What does not live here

Current progress:

~~~text
../STATUS.json
~~~

Stage order:

~~~text
../ROADMAP.md
~~~

Testing execution/checkpoint policy:

~~~text
../tests/TESTING_POLICY.md
~~~

Historical completed mini-project documentation:

~~~text
history/
~~~

## Ownership rule

Design changes belong here.

Implementation details/run instructions belong beside the code in:

~~~text
../recorder/
../storage/
../tests/
~~~

