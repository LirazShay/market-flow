# Live Leumi Verification Procedure

This document defines the safe, reproducible procedure for provider-dependent validation of the assembled Local History Viewer V1 runtime.

Operational progress belongs only in `../STATUS.json`.

## Safety boundary

Run the generated Bookmarklet only inside the user's already-authenticated Leumi browser tab.

Do not copy, commit, upload or paste:

- cookies;
- authorization headers;
- session tokens;
- account numbers;
- private browser/session storage;
- HAR files containing authenticated headers;
- screenshots that expose account/private financial data.

The verification report should contain only sanitized behavior/results and non-sensitive counters.

## Prerequisite

Use a runtime artifact generated from the repository sources:

~~~text
npm run build:runtime
~~~

Generated Bookmarklet:

~~~text
runtime/dist/market-flow-v1.bookmarklet.txt
~~~

The Browser CI artifact may also be used when it was produced from the exact code state being verified.

## Verification sequence

### 1. Launch on the real Leumi origin

Open the intended Leumi market page while already authenticated, then execute the generated Bookmarklet.

Expected observable behavior:

- `window.MarketFlowRuntime` exists;
- the recorder starts;
- the same-origin viewer opens;
- the viewer does not require copied market rows from the opener;
- no external code host is contacted by the Bookmarklet.

### 2. Confirm real provider collection

Allow at least one complete recorder cycle.

Check only behavioral evidence:

- `completedCycles >= 1`;
- `failedCycles === 0` for a successful verification run;
- MapHeat2 is reached through the existing same-origin API path;
- GetSecuritiesData is reached through the existing same-origin API path;
- the universe count is dynamic rather than assumed;
- the successful cycle reports requested/received/unique equality.

Do not export authenticated network traffic. If DevTools Network is used, record only endpoint names, HTTP status, request count and sanitized shape observations.

### 3. Capture a sanitized runtime/persistence snapshot

Run this expression in DevTools Console after at least one completed cycle:

~~~js
await (async () => {
    const runtime =
        window.MarketFlowRuntime;

    const connection =
        window.MarketFlowStorageConnection;

    const upgrade =
        window.MarketFlowStorageUpgrade;

    const read =
        window.MarketFlowStorageRead;

    const schema =
        window.MarketFlowStorageSchema;

    if (
        !runtime ||
        !connection ||
        !upgrade ||
        !read ||
        !schema
    ) {
        throw new Error(
            "Market Flow runtime is not fully loaded."
        );
    }

    const snapshot =
        runtime.getSnapshot();

    const database =
        await connection.openDatabase({
            onUpgradeNeeded:
                upgrade.upgradeDatabase
        });

    try {
        const countStore =
            storeName =>
                read.count(
                    database,
                    schema
                        .stores[
                            storeName
                        ]
                        .name
                );

        return {
            recorder: {
                status:
                    snapshot
                        .recorder
                        .status,
                isRunning:
                    snapshot
                        .recorder
                        .isRunning,
                completedCycles:
                    snapshot
                        .recorder
                        .completedCycles,
                failedCycles:
                    snapshot
                        .recorder
                        .failedCycles
            },
            viewer: {
                isOpen:
                    snapshot
                        .viewer
                        .isOpen,
                state:
                    snapshot
                        .viewer
                        .state
                        ?.view ??
                    snapshot
                        .viewer
                        .state
                        ?.status ??
                    null
            },
            persistedCounts: {
                sessions:
                    await countStore(
                        "sessions"
                    ),
                universe:
                    await countStore(
                        "universe"
                    ),
                cycles:
                    await countStore(
                        "cycles"
                    ),
                latest:
                    await countStore(
                        "latest"
                    ),
                history:
                    await countStore(
                        "history"
                    )
            }
        };
    } finally {
        connection.closeDatabase(
            database
        );
    }
})();
~~~

Only the returned sanitized object should be recorded. Do not dump records or raw browser/session data.

### 4. Viewer verification

Confirm from the viewer UI:

- current rows render from IndexedDB;
- the row count is consistent with the persisted latest snapshot;
- sorting works;
- opening one security shows persisted history;
- viewer refresh follows a committed cycle;
- manual refresh remains DB-only.

### 5. Repeated launch

Execute the same Bookmarklet again while the recorder is running.

Expected:

- no second recorder instance;
- no second viewer window;
- the existing named viewer is focused/reused.

### 6. Stop/restart

Stop through:

~~~js
await MarketFlowRuntime.stop(
    "live-verification"
);
~~~

Wait for completion, then execute the Bookmarklet again.

Expected:

- the prior stop persistence completes;
- a new recorder instance starts cleanly;
- existing IndexedDB history remains available;
- the viewer can reread the persisted state.

## Result classification

Record every material outcome as one of:

~~~text
Verified
Inferred
Unknown
~~~

Use `Verified` only for behavior directly observed in the real authenticated Leumi browser session.

Use `Inferred` for conclusions supported by CI/mock behavior plus live observations but not directly proven.

Use `Unknown` when the live session does not expose enough evidence.

## Minimum acceptance evidence

A live verification report should contain, without secrets/private data:

- exact repository commit/runtime artifact used;
- browser/date;
- Bookmarklet launch result;
- sanitized MapHeat2/GetSecuritiesData observations;
- sanitized runtime/persistence snapshot;
- viewer behavior result;
- repeated-launch result;
- stop/restart result;
- any failures/errors with private data removed;
- Verified/Inferred/Unknown classification for each item.

Do not proceed to long-run live validation until the required live checks have actually been executed and recorded.
