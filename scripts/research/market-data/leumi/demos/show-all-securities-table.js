(() => {
    const popup = window.open("", "_blank");

    if (!popup) {
        console.error("Popup was blocked. Allow popups for this site and run the script again.");
        return;
    }

    popup.document.write(`
        <!doctype html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="utf-8" />
            <title>Market Flow - Leumi Scanner Test</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background: #f6f8fa;
                    color: #1f2328;
                }

                h1 {
                    margin-bottom: 6px;
                }

                .status {
                    margin-bottom: 16px;
                    padding: 10px 12px;
                    background: white;
                    border: 1px solid #d0d7de;
                    border-radius: 8px;
                }

                .error {
                    color: #b42318;
                    white-space: pre-wrap;
                }

                .table-wrap {
                    overflow: auto;
                    max-height: calc(100vh - 140px);
                    background: white;
                    border: 1px solid #d0d7de;
                    border-radius: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    white-space: nowrap;
                    font-size: 13px;
                }

                th, td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #eaeef2;
                    text-align: right;
                }

                th {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    background: #f0f3f6;
                    font-weight: 700;
                }

                tbody tr:hover {
                    background: #f6f8fa;
                }

                .positive {
                    color: #067647;
                    font-weight: 700;
                }

                .negative {
                    color: #b42318;
                    font-weight: 700;
                }
            </style>
        </head>
        <body>
            <h1>Market Flow - בדיקת סורק</h1>
            <div id="status" class="status">טוען נתונים...</div>
            <div id="content"></div>
        </body>
        </html>
    `);

    popup.document.close();

    const setStatus = (text, isError = false) => {
        const el = popup.document.getElementById("status");

        if (!el) {
            return;
        }

        el.textContent = text;
        el.className = isError ? "status error" : "status";
    };

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return String(value);
        }

        return number.toLocaleString("he-IL", {
            maximumFractionDigits: 4
        });
    };

    const buildMapUrl = (pageCount) => {
        return (
            "/lti/lti-app/api/MarketFast/MapHeat2" +
            "?indexIdArray=0" +
            "&sectorIdAndTatSectorArray=0;0" +
            "&showOnlyDual=0" +
            "&lowChngPrcDay=-999999999" +
            "&highChngPrcDay=999999999" +
            "&lowChngPrcStartYear=-999999999" +
            "&highChngPrcStartYear=999999999" +
            "&highLow52=0" +
            "&lowDailyAverageVolume=-999999999" +
            "&highDailyAverageVolume=999999999" +
            "&lowDivYield=-999999999" +
            "&highDivYield=999999999" +
            "&lowMarketValue=-999999999999999" +
            "&highMarketValue=999999999999999" +
            "&esdRatingModeSelected=0" +
            "&EsdRatingModeValueSelected=0" +
            "&page=1" +
            "&pageCount=" + pageCount +
            "&orderFieldName=DailyNumDeals" +
            "&order=DESC" +
            "&rt=true"
        );
    };

    const fetchJson = async (url, label) => {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${label} failed: HTTP ${response.status}`);
        }

        return response.json();
    };

    const fetchSecuritiesChunk = async (ids, index, totalChunks) => {
        const url =
            "/lti/lti-app/api/SecuritiesFast/GetSecuritiesData" +
            "?securityIds=" + ids.join(",") +
            "&responseType=1" +
            "&is_gto=true" +
            "&force=false";

        setStatus(
            `טוען נתונים מפורטים: קבוצה ${index + 1} מתוך ${totalChunks}...`
        );

        const json = await fetchJson(
            url,
            `GetSecuritiesData chunk ${index + 1}`
        );

        const securities = json?.data?.SecuritiesData?.Table?.Security;

        if (!Array.isArray(securities)) {
            throw new Error(
                `GetSecuritiesData chunk ${index + 1}: invalid response structure`
            );
        }

        if (securities.length !== ids.length) {
            throw new Error(
                `GetSecuritiesData chunk ${index + 1}: expected ${ids.length}, received ${securities.length}`
            );
        }

        return securities;
    };

    const renderTable = (rows) => {
        const headers = [
            ["PaperName", "שם נייר"],
            ["PaperId", "מספר נייר"],
            ["LastKnownRate", "שער אחרון"],
            ["BaseRateChangePercentage", "שינוי %"],
            ["BuyLimit1", "BID1"],
            ["BuyVolume1", "כמות BID1"],
            ["SellLimit1", "ASK1"],
            ["SellVolume1", "כמות ASK1"],
            ["DailyDealsQuantity", "מספר עסקאות"],
            ["LastDealVolume", "כמות עסקה אחרונה"],
            ["DailyTurnover", "כמות יומית"],
            ["DailyNISRevenue", "מחזור כספי"],
            ["DailyLowestRate", "נמוך יומי"],
            ["DailyHighestRate", "גבוה יומי"],
            ["LastDealTimeOnly", "עסקה אחרונה"]
        ];

        const thead = headers
            .map(([, title]) => `<th>${escapeHtml(title)}</th>`)
            .join("");

        const tbody = rows
            .map(row => {
                return (
                    "<tr>" +
                    headers
                        .map(([key]) => {
                            let value = row[key];

                            if (
                                key !== "PaperName" &&
                                key !== "PaperId" &&
                                key !== "LastDealTimeOnly"
                            ) {
                                value = formatNumber(value);
                            }

                            let className = "";

                            if (key === "BaseRateChangePercentage") {
                                const change = Number(row[key]);

                                if (change > 0) {
                                    className = "positive";
                                } else if (change < 0) {
                                    className = "negative";
                                }
                            }

                            return `<td class="${className}">${escapeHtml(value)}</td>`;
                        })
                        .join("") +
                    "</tr>"
                );
            })
            .join("");

        popup.document.getElementById("content").innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>${thead}</tr>
                    </thead>
                    <tbody>
                        ${tbody}
                    </tbody>
                </table>
            </div>
        `;
    };

    return (async () => {
        try {
            setStatus("טוען את רשימת כל הניירות...");

            const firstMapJson = await fetchJson(
                buildMapUrl(1),
                "MapHeat2 initial request"
            );

            const recordCount = firstMapJson?.data?.MapHeat?.recordCount;

            if (!Number.isInteger(recordCount) || recordCount <= 0) {
                throw new Error(
                    `MapHeat2 returned invalid recordCount: ${recordCount}`
                );
            }

            const fullMapJson = await fetchJson(
                buildMapUrl(recordCount),
                "MapHeat2 full request"
            );

            const mapRecords = fullMapJson?.data?.MapHeat?.records;

            if (!Array.isArray(mapRecords)) {
                throw new Error("MapHeat2 full response structure is invalid");
            }

            if (mapRecords.length !== recordCount) {
                throw new Error(
                    `MapHeat2 expected ${recordCount} records, received ${mapRecords.length}`
                );
            }

            const ids = mapRecords.map(x => x.PaperId);

            if (new Set(ids.map(String)).size !== ids.length) {
                throw new Error("MapHeat2 returned duplicate PaperIds");
            }

            const chunkSize = Math.ceil(ids.length / 3);
            const chunks = [
                ids.slice(0, chunkSize),
                ids.slice(chunkSize, chunkSize * 2),
                ids.slice(chunkSize * 2)
            ].filter(x => x.length > 0);

            const allSecurities = [];

            for (let i = 0; i < chunks.length; i++) {
                const securities = await fetchSecuritiesChunk(
                    chunks[i],
                    i,
                    chunks.length
                );

                allSecurities.push(...securities);
            }

            const securitiesByKey = new Map(
                allSecurities.map(x => [String(x.Key), x])
            );

            const mergedRows = mapRecords.map(mapRow => {
                const details = securitiesByKey.get(
                    String(mapRow.PaperId)
                );

                return {
                    ...mapRow,
                    ...(details ?? {})
                };
            });

            const missingDetails = mergedRows.filter(
                row => !securitiesByKey.has(String(row.PaperId))
            );

            if (missingDetails.length > 0) {
                throw new Error(
                    `Missing detailed data for ${missingDetails.length} securities`
                );
            }

            window.__marketFlowTestData = {
                mapRecords,
                securities: allSecurities,
                mergedRows
            };

            renderTable(mergedRows);

            setStatus(
                `הצלחה: נטענו ${mergedRows.length} ניירות. הנתונים זמינים גם ב-window.__marketFlowTestData`
            );

            console.log("Market Flow test completed.", {
                recordCount,
                mapRecords: mapRecords.length,
                securities: allSecurities.length,
                mergedRows: mergedRows.length
            });
        } catch (error) {
            console.error("Market Flow test failed:", error);
            setStatus(
                `שגיאה: ${error?.message ?? String(error)}`,
                true
            );
        }
    })();
})();
