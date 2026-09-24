(function (root) {
  "use strict";

  const HORIZONS = [5, 10, 20, 30, 40, 50, 60, 90, 120];
  const DB_NAME = "market-flow-leumi-history-v1";

  const dist = () => ({ count: 0, sum: 0, min: null, max: null, freq: new Map() });
  function add(d, x) {
    if (!Number.isFinite(x) || x < 0) throw new Error("Invalid non-negative measurement.");
    x = Math.round(x); d.count++; d.sum += x;
    d.min = d.min === null ? x : Math.min(d.min, x);
    d.max = d.max === null ? x : Math.max(d.max, x);
    d.freq.set(x, (d.freq.get(x) || 0) + 1);
  }
  function summary(d) {
    if (!d.count) return { count: 0, min: null, p50: null, p90: null, p95: null, p99: null, max: null, mean: null };
    const entries = [...d.freq].sort((a, b) => a[0] - b[0]);
    const q = p => {
      const target = Math.max(1, Math.ceil(p * d.count));
      let n = 0;
      for (const [value, count] of entries) { n += count; if (n >= target) return value; }
      return entries.at(-1)[0];
    };
    return { count: d.count, min: d.min, p50: q(.5), p90: q(.9), p95: q(.95), p99: q(.99), max: d.max, mean: d.sum / d.count };
  }
  const rate = (n, d) => d ? n / d : null;

  function makeAccumulator(horizons) {
    return {
      rows: 0,
      securities: new Set(),
      groups: 0,
      delta: dist(),
      horizons: Object.fromEntries(horizons.map(h => [String(h), {
        base: 0, nonEdge: 0, edge: 0, candidate: 0, candidateAtEdge: 0,
        unavailable: 0, unavailableNonEdge: 0, strict: 0,
        endpointError: dist(), futureSamples: dist(), maxGap: dist()
      }]))
    };
  }

  function validateHorizons(horizons) {
    if (!Array.isArray(horizons) || !horizons.length || new Set(horizons).size !== horizons.length || horizons.some(x => !Number.isFinite(x) || x <= 0)) {
      throw new Error("horizonsSec must contain unique positive finite values.");
    }
  }

  function accumulateGroup(a, rawRows, horizons) {
    if (!rawRows.length) return;
    const rows = rawRows.map(r => {
      if (r?.securityId == null || r?.sessionId == null || !Number.isFinite(r?.collectedAtMs)) throw new Error("Invalid history row identity/timestamp.");
      return { securityId: String(r.securityId), sessionId: String(r.sessionId), t: r.collectedAtMs };
    }).sort((x, y) => x.t - y.t);
    const first = rows[0];
    if (rows.some(r => r.securityId !== first.securityId || r.sessionId !== first.sessionId)) throw new Error("Group mixes security/session identities.");
    const t = rows.map(r => r.t);
    for (let i = 1; i < t.length; i++) {
      if (!(t[i] > t[i - 1])) throw new Error("Observation timestamps must be strictly increasing within each security/session group.");
      add(a.delta, t[i] - t[i - 1]);
    }
    a.rows += t.length; a.securities.add(first.securityId); a.groups++;
    const last = t.at(-1);

    for (const h of horizons) {
      const out = a.horizons[String(h)], ms = h * 1000;
      let end = 0;
      for (let base = 0; base < t.length; base++) {
        if (end < base) end = base;
        const deadline = t[base] + ms;
        while (end + 1 < t.length && t[end + 1] <= deadline) end++;
        const edge = last < deadline, candidate = end > base;
        out.base++;
        if (edge) out.edge++; else out.nonEdge++;
        if (candidate) { out.candidate++; if (edge) out.candidateAtEdge++; }
        else { out.unavailable++; if (!edge) out.unavailableNonEdge++; }
        if (!edge && candidate) {
          out.strict++;
          add(out.endpointError, deadline - t[end]);
          add(out.futureSamples, end - base);
          let maxGap = 0;
          for (let i = base + 1; i <= end; i++) maxGap = Math.max(maxGap, t[i] - t[i - 1]);
          add(out.maxGap, maxGap);
        }
      }
    }
  }

  function finish(a, horizons, meta = {}) {
    const cadence = summary(a.delta), result = {};
    for (const h of horizons) {
      const x = a.horizons[String(h)];
      result[String(h)] = {
        horizonSec: h,
        baseObservationCount: x.base,
        nonEdgeObservationCount: x.nonEdge,
        sessionEdgeCensoredCount: x.edge,
        endpointCandidateCount: x.candidate,
        endpointCandidateAtSessionEdgeCount: x.candidateAtEdge,
        endpointUnavailableCount: x.unavailable,
        endpointUnavailableNonEdgeCount: x.unavailableNonEdge,
        strictEvaluableCount: x.strict,
        endpointCandidateRateAll: rate(x.candidate, x.base),
        sessionEdgeCensoringRate: rate(x.edge, x.base),
        strictCoverageRateAll: rate(x.strict, x.base),
        strictCoverageRateAmongNonEdge: rate(x.strict, x.nonEdge),
        endpointTimingErrorMs: summary(x.endpointError),
        futureSampleCount: summary(x.futureSamples),
        maxObservedGapMs: summary(x.maxGap)
      };
    }
    return {
      schemaVersion: 1,
      horizonsSec: [...horizons],
      semantics: {
        timestamp: "history.collectedAtMs",
        group: "securityId + sessionId",
        endpoint: "latest strictly-future observation at or before t0+h",
        strictEvaluable: "endpoint exists and same-session observed path reaches t0+h",
        toleranceApplied: false,
        pathGapThresholdApplied: false,
        minimumPathCoverageApplied: false
      },
      integrity: { validRowCount: a.rows, securityCount: a.securities.size, sessionGroupCount: a.groups, ...meta },
      cadence: { interObservationDeltaMs: cadence, firstFutureSampleDelayMs: { ...cadence } },
      horizons: result
    };
  }

  function analyzeRows(rows, options = {}) {
    if (!Array.isArray(rows)) throw new Error("rows must be an array.");
    const horizons = options.horizonsSec || HORIZONS; validateHorizons(horizons);
    const groups = new Map();
    for (const row of rows) {
      const key = JSON.stringify([row?.securityId, row?.sessionId]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    const a = makeAccumulator(horizons);
    for (const group of groups.values()) accumulateGroup(a, group, horizons);
    return finish(a, horizons);
  }

  function openDb(name) {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(name);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error("IndexedDB open failed."));
      r.onupgradeneeded = () => { r.transaction?.abort(); reject(new Error("Database missing; analyzer refuses to create/upgrade it.")); };
    });
  }
  function countHistory(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("history", "readonly"), r = tx.objectStore("history").count(); let value;
      r.onsuccess = () => { value = r.result; }; r.onerror = () => reject(r.error);
      tx.oncomplete = () => resolve(value); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  }
  function scan(db, horizons, onProgress) {
    return new Promise((resolve, reject) => {
      const a = makeAccumulator(horizons), tx = db.transaction("history", "readonly"), store = tx.objectStore("history");
      if (!store.indexNames.contains("bySecurityTime")) { reject(new Error("history.bySecurityTime index is missing.")); return; }
      const r = store.index("bySecurityTime").openCursor(); let count = 0, key = null, group = [], failed = false;
      const fail = e => { if (!failed) { failed = true; reject(e || new Error("History scan failed.")); } };
      const flush = () => { if (group.length) { accumulateGroup(a, group, horizons); group = []; } };
      r.onsuccess = () => {
        try {
          const c = r.result; if (!c) { flush(); return; }
          const row = c.value, next = JSON.stringify([row?.securityId, row?.sessionId]);
          if (key !== null && next !== key) flush(); key = next;
          group.push({ securityId: row?.securityId, sessionId: row?.sessionId, collectedAtMs: row?.collectedAtMs });
          count++; if (onProgress && count % 100000 === 0) onProgress({ indexedRowCount: count }); c.continue();
        } catch (e) { try { tx.abort(); } catch (_) {} fail(e); }
      };
      r.onerror = () => fail(r.error); tx.onerror = () => fail(tx.error); tx.onabort = () => fail(tx.error);
      tx.oncomplete = () => { if (!failed) resolve({ a, count }); };
    });
  }

  async function run(options = {}) {
    if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable; run on the origin that owns the Market Flow V1 database.");
    const horizons = options.horizonsSec || HORIZONS; validateHorizons(horizons);
    const db = await openDb(options.dbName || DB_NAME);
    try {
      if (!db.objectStoreNames.contains("history")) throw new Error("history object store is missing.");
      const total = await countHistory(db), scanned = await scan(db, horizons, options.onProgress || (p => console.log(`[Issue #15] scanned ${p.indexedRowCount.toLocaleString()} rows`)));
      if (total !== scanned.count) throw new Error(`Index coverage mismatch: history=${total}, bySecurityTime=${scanned.count}.`);
      const report = finish(scanned.a, horizons, { historyStoreRowCount: total, indexedHistoryRowCount: scanned.count, indexCoverageExact: true });
      report.generatedAt = new Date().toISOString(); console.log("[Issue #15] history coverage report", report);
      if (options.download) download(report, options.fileName); return report;
    } finally { db.close(); }
  }

  function download(report, fileName) {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = fileName || `market-flow-issue15-history-coverage-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const api = Object.freeze({ DEFAULT_DB_NAME: DB_NAME, DEFAULT_HORIZONS_SEC: Object.freeze([...HORIZONS]), analyzeRows, run, download });
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root?.window === root) root.MarketFlowIssue15HistoryCoverage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
