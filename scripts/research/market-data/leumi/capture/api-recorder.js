(() => {
    if (window.__apiRecorder?.active) {
        console.log("API recorder is already running.");
        return;
    }

    const records = [];
    let active = true;

    const originalFetch = window.fetch;
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    const now = () => new Date().toISOString();

    const safeText = async (response) => {
        try {
            const clone = response.clone();
            return await clone.text();
        } catch (error) {
            return `[Unable to read response: ${error.message}]`;
        }
    };

    window.fetch = async function (...args) {
        const startedAt = performance.now();

        let url = "";
        let method = "GET";
        let body = null;

        try {
            const input = args[0];
            const init = args[1] || {};

            if (typeof input === "string") {
                url = input;
            } else if (input instanceof Request) {
                url = input.url;
                method = input.method || method;
            }

            method = init.method || method;

            if (init.body != null) {
                body = String(init.body);
            }
        } catch (error) {
            console.warn("Failed to inspect fetch request:", error);
        }

        try {
            const response = await originalFetch.apply(this, args);

            if (active) {
                const responseText = await safeText(response);

                const record = {
                    type: "fetch",
                    time: now(),
                    method,
                    url,
                    requestBody: body,
                    status: response.status,
                    statusText: response.statusText,
                    durationMs: Math.round(performance.now() - startedAt),
                    responseContentType: response.headers.get("content-type"),
                    responseText
                };

                records.push(record);

                console.groupCollapsed(
                    `[API RECORDER] FETCH ${method} ${response.status} ${url}`
                );
                console.log(record);
                console.groupEnd();
            }

            return response;
        } catch (error) {
            if (active) {
                const record = {
                    type: "fetch",
                    time: now(),
                    method,
                    url,
                    requestBody: body,
                    error: String(error),
                    durationMs: Math.round(performance.now() - startedAt)
                };

                records.push(record);
                console.error("[API RECORDER] Fetch failed:", record);
            }

            throw error;
        }
    };

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.__apiRecorderInfo = {
            method,
            url,
            startedAt: 0,
            requestBody: null
        };

        return originalXhrOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function (body) {
        if (this.__apiRecorderInfo) {
            this.__apiRecorderInfo.startedAt = performance.now();

            if (body != null) {
                try {
                    this.__apiRecorderInfo.requestBody = String(body);
                } catch {
                    this.__apiRecorderInfo.requestBody = "[Unreadable body]";
                }
            }
        }

        this.addEventListener("loadend", function () {
            if (!active || !this.__apiRecorderInfo) {
                return;
            }

            let responseText = null;

            try {
                if (
                    this.responseType === "" ||
                    this.responseType === "text"
                ) {
                    responseText = this.responseText;
                } else if (this.responseType === "json") {
                    responseText = JSON.stringify(this.response);
                } else {
                    responseText = `[responseType=${this.responseType}]`;
                }
            } catch (error) {
                responseText = `[Unable to read response: ${error.message}]`;
            }

            const record = {
                type: "xhr",
                time: now(),
                method: this.__apiRecorderInfo.method,
                url: this.__apiRecorderInfo.url,
                requestBody: this.__apiRecorderInfo.requestBody,
                status: this.status,
                statusText: this.statusText,
                durationMs: Math.round(
                    performance.now() - this.__apiRecorderInfo.startedAt
                ),
                responseContentType: this.getResponseHeader("content-type"),
                responseText
            };

            records.push(record);

            console.groupCollapsed(
                `[API RECORDER] XHR ${record.method} ${record.status} ${record.url}`
            );
            console.log(record);
            console.groupEnd();
        });

        return originalXhrSend.call(this, body);
    };

    window.__apiRecorder = {
        active: true,

        get records() {
            return records;
        },

        show() {
            console.table(
                records.map((r, index) => ({
                    index,
                    type: r.type,
                    method: r.method,
                    status: r.status,
                    durationMs: r.durationMs,
                    url: r.url
                }))
            );

            return records;
        },

        get(index) {
            return records[index];
        },

        clear() {
            records.length = 0;
            console.log("API recorder cleared.");
        },

        stop() {
            active = false;
            this.active = false;
            console.log(
                `API recorder stopped. ${records.length} records captured.`
            );
        },

        start() {
            active = true;
            this.active = true;
            console.log("API recorder resumed.");
        },

        export() {
            const json = JSON.stringify(records, null, 2);
            const blob = new Blob([json], {
                type: "application/json"
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `api-recording-${new Date()
                .toISOString()
                .replace(/[:.]/g, "-")}.json`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);

            console.log(
                `Exported ${records.length} API records.`
            );
        }
    };

    console.log(
        "API recorder started. Trigger the table refresh, then run __apiRecorder.show()"
    );
})();
