(() => {
    const data = window.__marketFlowTestData;

    if (!data) {
        console.error(
            "Market Flow test data was not found. Run show-all-securities-table.js first in this tab."
        );
        return;
    }

    const { mapRecords, securities, mergedRows } = data;

    if (!Array.isArray(mapRecords) || !Array.isArray(securities)) {
        console.error(
            "window.__marketFlowTestData has an unexpected structure."
        );
        return;
    }

    const isEmptyString = value =>
        typeof value === "string" && value.trim() === "";

    const valueType = value => {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    };

    const stableValueKey = value => {
        if (value === null) {
            return "null:null";
        }

        if (value === undefined) {
            return "undefined:undefined";
        }

        if (typeof value === "object") {
            try {
                return "object:" + JSON.stringify(value);
            } catch {
                return "object:[unserializable]";
            }
        }

        return valueType(value) + ":" + String(value);
    };

    const analyzeRecords = (sourceName, records) => {
        const fields = new Set();

        for (const record of records) {
            if (record && typeof record === "object") {
                Object.keys(record).forEach(key => fields.add(key));
            }
        }

        return [...fields]
            .sort((a, b) => a.localeCompare(b))
            .map(field => {
                let presentCount = 0;
                let missingCount = 0;
                let nullCount = 0;
                let undefinedCount = 0;
                let emptyStringCount = 0;
                let zeroCount = 0;

                const typeCounts = {};
                const distinct = new Set();
                const samples = [];
                const numericValues = [];

                for (const record of records) {
                    const hasField =
                        record &&
                        Object.prototype.hasOwnProperty.call(record, field);

                    if (!hasField) {
                        missingCount++;
                        continue;
                    }

                    presentCount++;

                    const value = record[field];
                    const type = valueType(value);

                    typeCounts[type] = (typeCounts[type] ?? 0) + 1;

                    if (value === null) {
                        nullCount++;
                        continue;
                    }

                    if (value === undefined) {
                        undefinedCount++;
                        continue;
                    }

                    if (isEmptyString(value)) {
                        emptyStringCount++;
                    }

                    if (value === 0) {
                        zeroCount++;
                    }

                    distinct.add(stableValueKey(value));

                    if (samples.length < 5) {
                        const key = stableValueKey(value);

                        if (!samples.some(x => stableValueKey(x) === key)) {
                            samples.push(value);
                        }
                    }

                    if (
                        typeof value === "number" &&
                        Number.isFinite(value)
                    ) {
                        numericValues.push(value);
                    }
                }

                const usableCount =
                    records.length -
                    missingCount -
                    nullCount -
                    undefinedCount -
                    emptyStringCount;

                const coveragePercent =
                    records.length === 0
                        ? 0
                        : (usableCount / records.length) * 100;

                let availability;

                if (usableCount === records.length) {
                    availability = "ALWAYS_VALUE";
                } else if (usableCount === 0) {
                    availability = "NO_USABLE_VALUE";
                } else {
                    availability = "PARTIAL_VALUE";
                }

                return {
                    source: sourceName,
                    field,
                    totalRecords: records.length,
                    presentCount,
                    missingCount,
                    nullCount,
                    undefinedCount,
                    emptyStringCount,
                    usableCount,
                    coveragePercent: Number(coveragePercent.toFixed(2)),
                    zeroCount,
                    distinctCount: distinct.size,
                    availability,
                    types: typeCounts,
                    min:
                        numericValues.length > 0
                            ? Math.min(...numericValues)
                            : null,
                    max:
                        numericValues.length > 0
                            ? Math.max(...numericValues)
                            : null,
                    samples
                };
            });
    };

    const normalizeComparable = value => {
        if (value === null || value === undefined) {
            return null;
        }

        if (
            typeof value === "number" ||
            (typeof value === "string" &&
                value.trim() !== "" &&
                Number.isFinite(Number(value)))
        ) {
            return {
                type: "number",
                value: Number(value)
            };
        }

        return {
            type: "string",
            value: String(value)
        };
    };

    const valuesEqual = (left, right) => {
        const a = normalizeComparable(left);
        const b = normalizeComparable(right);

        if (a === null || b === null) {
            return false;
        }

        return a.type === b.type && a.value === b.value;
    };

    const compareMappedFields = (
        mapRecordsInput,
        securitiesInput
    ) => {
        const detailsByKey = new Map(
            securitiesInput.map(x => [String(x.Key), x])
        );

        const mappings = [
            ["PaperId", "Key", "מזהה נייר"],
            ["PaperRate", "LastKnownRate", "שער אחרון"],
            [
                "ChangeRate",
                "BaseRateChangePercentage",
                "שינוי יומי באחוזים"
            ],
            ["BuyRate", "BuyLimit1", "BID1"],
            ["SellRate", "SellLimit1", "ASK1"],
            ["DailyVolume", "DailyTurnover", "כמות יומית"],
            ["DailyTmura", "DailyNISRevenue", "מחזור כספי"],
            [
                "DailyNumDeals",
                "DailyDealsQuantity",
                "מספר עסקאות יומי"
            ],
            [
                "LastDealTime",
                "LastDealTimeOnly",
                "שעת עסקה אחרונה"
            ]
        ];

        return mappings.map(
            ([mapField, detailsField, description]) => {
                let comparableCount = 0;
                let equalCount = 0;
                let differentCount = 0;
                let missingMapValue = 0;
                let missingDetailsValue = 0;

                const differences = [];

                for (const mapRow of mapRecordsInput) {
                    const details = detailsByKey.get(
                        String(mapRow.PaperId)
                    );

                    const mapValue = mapRow?.[mapField];
                    const detailsValue = details?.[detailsField];

                    if (
                        mapValue === null ||
                        mapValue === undefined
                    ) {
                        missingMapValue++;
                    }

                    if (
                        detailsValue === null ||
                        detailsValue === undefined
                    ) {
                        missingDetailsValue++;
                    }

                    if (
                        mapValue === null ||
                        mapValue === undefined ||
                        detailsValue === null ||
                        detailsValue === undefined
                    ) {
                        continue;
                    }

                    comparableCount++;

                    if (valuesEqual(mapValue, detailsValue)) {
                        equalCount++;
                    } else {
                        differentCount++;

                        if (differences.length < 5) {
                            differences.push({
                                PaperId: mapRow.PaperId,
                                PaperName: mapRow.PaperName,
                                mapValue,
                                detailsValue
                            });
                        }
                    }
                }

                return {
                    mapField,
                    detailsField,
                    description,
                    comparableCount,
                    equalCount,
                    differentCount,
                    equalPercent:
                        comparableCount === 0
                            ? null
                            : Number(
                                  (
                                      (equalCount /
                                          comparableCount) *
                                      100
                                  ).toFixed(2)
                              ),
                    missingMapValue,
                    missingDetailsValue,
                    differenceSamples: differences
                };
            }
        );
    };

    const summarizeAvailability = rows => {
        return rows.reduce(
            (result, row) => {
                result[row.availability] =
                    (result[row.availability] ?? 0) + 1;

                return result;
            },
            {}
        );
    };

    const mapCoverage = analyzeRecords(
        "MapHeat2",
        mapRecords
    );

    const securitiesCoverage = analyzeRecords(
        "GetSecuritiesData",
        securities
    );

    const comparisons = compareMappedFields(
        mapRecords,
        securities
    );

    const report = {
        generatedAt: new Date().toISOString(),
        snapshot: {
            mapHeatRecords: mapRecords.length,
            securities: securities.length,
            mergedRows: Array.isArray(mergedRows)
                ? mergedRows.length
                : null
        },
        availabilitySummary: {
            MapHeat2: summarizeAvailability(mapCoverage),
            GetSecuritiesData:
                summarizeAvailability(securitiesCoverage)
        },
        fieldCoverage: {
            MapHeat2: mapCoverage,
            GetSecuritiesData: securitiesCoverage
        },
        comparisons
    };

    window.__marketFlowFieldCoverageReport = report;

    const popup = window.open("", "_blank");

    if (!popup) {
        console.log(report);
        console.warn(
            "Popup was blocked. The full report is available in window.__marketFlowFieldCoverageReport"
        );
        return report;
    }

    const escapeHtml = value =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    const stringifyCompact = value => {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    };

    const availabilityLabel = availability => {
        switch (availability) {
            case "ALWAYS_VALUE":
                return "תמיד יש ערך";
            case "PARTIAL_VALUE":
                return "חלקי";
            case "NO_USABLE_VALUE":
                return "אין ערך שימושי";
            default:
                return availability;
        }
    };

    const renderCoverageTable = rows => {
        const sorted = [...rows].sort((a, b) => {
            if (a.coveragePercent !== b.coveragePercent) {
                return a.coveragePercent - b.coveragePercent;
            }

            return a.field.localeCompare(b.field);
        });

        return `
            <table>
                <thead>
                    <tr>
                        <th>שדה</th>
                        <th>מצב</th>
                        <th>Coverage</th>
                        <th>סה"כ</th>
                        <th>ערכים שימושיים</th>
                        <th>NULL</th>
                        <th>Missing</th>
                        <th>Undefined</th>
                        <th>Empty</th>
                        <th>Zero</th>
                        <th>Distinct</th>
                        <th>Types</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>דוגמאות</th>
                    </tr>
                </thead>
                <tbody>
                    ${sorted
                        .map(
                            row => `
                            <tr class="${row.availability}">
                                <td class="field">${escapeHtml(
                                    row.field
                                )}</td>
                                <td>${escapeHtml(
                                    availabilityLabel(
                                        row.availability
                                    )
                                )}</td>
                                <td>${row.coveragePercent}%</td>
                                <td>${row.totalRecords}</td>
                                <td>${row.usableCount}</td>
                                <td>${row.nullCount}</td>
                                <td>${row.missingCount}</td>
                                <td>${row.undefinedCount}</td>
                                <td>${row.emptyStringCount}</td>
                                <td>${row.zeroCount}</td>
                                <td>${row.distinctCount}</td>
                                <td>${escapeHtml(
                                    stringifyCompact(row.types)
                                )}</td>
                                <td>${escapeHtml(row.min)}</td>
                                <td>${escapeHtml(row.max)}</td>
                                <td>${escapeHtml(
                                    stringifyCompact(row.samples)
                                )}</td>
                            </tr>
                        `
                        )
                        .join("")}
                </tbody>
            </table>
        `;
    };

    const renderComparisons = rows => {
        return `
            <table>
                <thead>
                    <tr>
                        <th>משמעות</th>
                        <th>MapHeat2</th>
                        <th>GetSecuritiesData</th>
                        <th>ניתן להשוות</th>
                        <th>זהים</th>
                        <th>שונים</th>
                        <th>% זהים</th>
                        <th>חסר ב-MapHeat</th>
                        <th>חסר ב-Details</th>
                        <th>דוגמאות להבדלים</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows
                        .map(
                            row => `
                            <tr>
                                <td>${escapeHtml(
                                    row.description
                                )}</td>
                                <td class="field">${escapeHtml(
                                    row.mapField
                                )}</td>
                                <td class="field">${escapeHtml(
                                    row.detailsField
                                )}</td>
                                <td>${row.comparableCount}</td>
                                <td>${row.equalCount}</td>
                                <td>${row.differentCount}</td>
                                <td>${
                                    row.equalPercent === null
                                        ? ""
                                        : row.equalPercent + "%"
                                }</td>
                                <td>${row.missingMapValue}</td>
                                <td>${row.missingDetailsValue}</td>
                                <td>${escapeHtml(
                                    stringifyCompact(
                                        row.differenceSamples
                                    )
                                )}</td>
                            </tr>
                        `
                        )
                        .join("")}
                </tbody>
            </table>
        `;
    };

    const toMarkdown = () => {
        const lines = [];

        lines.push("# Field Availability Report");
        lines.push("");
        lines.push(
            `Generated: ${report.generatedAt}`
        );
        lines.push("");
        lines.push(
            `MapHeat2 records: ${report.snapshot.mapHeatRecords}`
        );
        lines.push(
            `GetSecuritiesData records: ${report.snapshot.securities}`
        );
        lines.push("");

        for (const [source, rows] of Object.entries(
            report.fieldCoverage
        )) {
            lines.push(`## ${source}`);
            lines.push("");
            lines.push(
                "| Field | Availability | Coverage % | Total | Usable | Null | Missing | Undefined | Empty | Zero | Distinct | Types | Min | Max | Samples |"
            );
            lines.push(
                "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|"
            );

            for (const row of rows) {
                lines.push(
                    `| ${row.field} | ${row.availability} | ${row.coveragePercent} | ${row.totalRecords} | ${row.usableCount} | ${row.nullCount} | ${row.missingCount} | ${row.undefinedCount} | ${row.emptyStringCount} | ${row.zeroCount} | ${row.distinctCount} | ${stringifyCompact(
                        row.types
                    )} | ${row.min ?? ""} | ${row.max ?? ""} | ${stringifyCompact(
                        row.samples
                    ).replaceAll("|", "\\|")} |`
                );
            }

            lines.push("");
        }

        lines.push("## Cross-endpoint comparisons");
        lines.push("");
        lines.push(
            "| Meaning | MapHeat2 | GetSecuritiesData | Comparable | Equal | Different | Equal % | Missing Map | Missing Details |"
        );
        lines.push(
            "|---|---|---|---:|---:|---:|---:|---:|---:|"
        );

        for (const row of comparisons) {
            lines.push(
                `| ${row.description} | ${row.mapField} | ${row.detailsField} | ${row.comparableCount} | ${row.equalCount} | ${row.differentCount} | ${row.equalPercent ?? ""} | ${row.missingMapValue} | ${row.missingDetailsValue} |`
            );
        }

        return lines.join("\n");
    };

    const downloadText = (filename, text, type) => {
        const blob = new Blob([text], { type });
        const url = URL.createObjectURL(blob);
        const a = popup.document.createElement("a");

        a.href = url;
        a.download = filename;

        popup.document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    };

    popup.document.write(`
        <!doctype html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="utf-8" />
            <title>Market Flow - Field Coverage</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #1f2328;
                    background: #f6f8fa;
                }

                h1, h2 {
                    margin-bottom: 8px;
                }

                .summary,
                .section {
                    background: white;
                    border: 1px solid #d0d7de;
                    border-radius: 8px;
                    padding: 14px;
                    margin-bottom: 18px;
                }

                .buttons {
                    display: flex;
                    gap: 8px;
                    margin: 12px 0;
                }

                button {
                    padding: 8px 12px;
                    cursor: pointer;
                }

                .table-wrap {
                    overflow: auto;
                    max-height: 70vh;
                    border: 1px solid #d0d7de;
                    border-radius: 6px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    white-space: nowrap;
                    font-size: 12px;
                }

                th, td {
                    padding: 7px 9px;
                    border-bottom: 1px solid #eaeef2;
                    text-align: right;
                    vertical-align: top;
                }

                th {
                    position: sticky;
                    top: 0;
                    background: #f0f3f6;
                    z-index: 1;
                }

                td.field {
                    font-family: Consolas, monospace;
                    font-weight: 700;
                }

                tr.NO_USABLE_VALUE {
                    background: #fff1f0;
                }

                tr.PARTIAL_VALUE {
                    background: #fffbe6;
                }

                tr.ALWAYS_VALUE {
                    background: #f0fff4;
                }

                .note {
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <h1>Market Flow - בדיקת זמינות שדות</h1>

            <div class="summary">
                <div>
                    Snapshot:
                    MapHeat2 = ${report.snapshot.mapHeatRecords},
                    GetSecuritiesData = ${report.snapshot.securities}
                </div>
                <div>
                    Generated:
                    ${escapeHtml(report.generatedAt)}
                </div>
                <div class="buttons">
                    <button id="downloadJson">הורד JSON</button>
                    <button id="downloadMarkdown">הורד Markdown</button>
                </div>
                <div class="note">
                    ירוק = יש ערך בכל הרשומות.
                    צהוב = יש ערך רק בחלק מהרשומות.
                    אדום = לא נמצא ערך שימושי באף רשומה בסנאפשוט הנוכחי.
                </div>
            </div>

            <div class="section">
                <h2>MapHeat2</h2>
                <div class="table-wrap">
                    ${renderCoverageTable(mapCoverage)}
                </div>
            </div>

            <div class="section">
                <h2>GetSecuritiesData</h2>
                <div class="table-wrap">
                    ${renderCoverageTable(
                        securitiesCoverage
                    )}
                </div>
            </div>

            <div class="section">
                <h2>השוואת שדות מקבילים בין שתי הקריאות</h2>
                <div class="table-wrap">
                    ${renderComparisons(comparisons)}
                </div>
            </div>
        </body>
        </html>
    `);

    popup.document.close();

    popup.document
        .getElementById("downloadJson")
        .addEventListener("click", () => {
            downloadText(
                "market-flow-field-coverage.json",
                JSON.stringify(report, null, 2),
                "application/json"
            );
        });

    popup.document
        .getElementById("downloadMarkdown")
        .addEventListener("click", () => {
            downloadText(
                "market-flow-field-coverage.md",
                toMarkdown(),
                "text/markdown"
            );
        });

    console.log(
        "Market Flow field coverage report:",
        report
    );

    console.log(
        "Full report available in window.__marketFlowFieldCoverageReport"
    );

    return report;
})();
