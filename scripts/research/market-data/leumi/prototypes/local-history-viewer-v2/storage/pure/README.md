# Storage Pure Logic

Deterministic persistence-record mapping for Local History Viewer V1.

This folder must stay browser-independent so record contracts can be verified with fast Node unit tests.

## Stage 8.1

~~~text
persistence-records.js
~~~

Maps already-validated recorder/domain objects into IndexedDB record shapes without opening IndexedDB.

It intentionally does **not**:

- create transactions;
- generate autoIncrement IDs;
- write to stores;
- broadcast notifications.

Those browser/transaction responsibilities belong to Stage 8.2–8.4.

Relevant tests:

~~~text
../../tests/unit/persistence-records.test.js
~~~
