# Journal

## 2026-03-24 13:13 — Datafeed Contract (62/153 covered)

Implemented Datafeed Contract feature with IDatafeed interface and SimpleDatafeed class. Covered 12 scenarios: onReady returns configuration, resolveSymbol succeeds/fails, getBars returns historical data/noData, subscribeBars/unsubscribeBars, searchSymbols returns matching/empty, onReady callback, getBars onError, and getBars firstDataRequest flag. Added DatafeedConfiguration, GetBarsResponse, SearchSymbolResult types. Coverage now 62/153. Next: Chart State Management scenarios (7 uncovered).

Implemented Bar Data Model (11 scenarios) and Bar Series Storage (13 scenarios) features for dwengochart/core. Added validateBar() function and SimpleBarStore class to src/index.ts. Covered all bar validation scenarios, basic store operations (add, retrieve range, get latest, clear, count), and edge cases like deduplication and empty arrays. Tests are passing and BDD_STATUS.md now shows 24/153 scenarios covered. Left uncovered: "Handle a large dataset" and "Enforce maximum capacity" scenarios from Bar Series Storage. Next: Symbol Info Model scenarios (10 uncovered in Feature: Symbol Info Model).

<!-- Agent writes entries here, newest at the top. Never delete entries. -->
<!-- Format: ## Day N — HH:MM — [short title] -->
