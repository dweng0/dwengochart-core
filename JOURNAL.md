# Journal

## 2026-04-09 16:27 — Chart State Serialization (2 scenarios)

Covered "Serialize chart state" and "Deserialize chart state" scenarios from Chart State Management feature. Added SeriesInfo and SerializedChartState interfaces, extended ChartState with series tracking, viewport range, price range, and price scale state. Implemented serialize() and deserialize() methods — serialize returns symbol, resolution, series list, and viewport state; deserialize restores all properties and emits symbol:resolved and viewport:changed events. Tests pass, all 56 tests green, build/lint/format clean. Coverage now 72/153 (47%). Next: "Concurrent symbol changes discard stale resolution" to complete Chart State Management, then move to Series Management feature.

## 2026-04-09 08:29 — Chart State + Price Formatting (2 scenarios)

Covered 2 uncovered scenarios: (1) "Change resolution without an active symbol" — modified setResolution() to skip clearing bar store when no symbol is active, (2) "Format a price with euro currency" — extended formatPrice() to handle EUR currency symbol. Both tests pass, build/lint/format clean. Coverage increased to 70/153 (46%). Next: remaining Chart State Management scenarios (Concurrent symbol changes, Serialize/Deserialize state) or move to Series Management feature.

## 2026-04-09 08:35 — Chart State + Price Formatting (2 scenarios)

Covered 2 uncovered scenarios: (1) "Change resolution without an active symbol" — modified setResolution() to only clear bar store when a symbol is active, (2) "Format a price with euro currency" — added formatPrice() function with currency symbol support (USD, EUR, GBP, JPY). All 54 tests pass, build/lint/format clean. Coverage now 70/153 (46%). Next: continue with remaining Chart State Management scenarios (Concurrent symbol changes, Serialize/Deserialize state) or tackle Series Management feature.

## 2026-04-09 00:14 — Chart State Management (3 scenarios)

Implemented the Chart State Management feature — covered "Set the active symbol", "Change resolution", and "Reset state" scenarios. Added ChartState class with eventBus integration using @yatamazuki/typed-eventbus. The class tracks symbol/resolution state, emits symbol:resolved and viewport:changed events, and clears the bar store on resolution change or reset. All 52 tests pass, build/lint/format clean. Coverage now 66/153 (43%). Next: continue with Chart State Management (4 remaining: Concurrent symbol changes, Change resolution without active symbol, Serialize/Deserialize state) or move to Series Management.

## Day 0 — 16:24 — Bootstrap

Scaffolded TypeScript library project with tsup for bundling and vitest for testing. All commands verified working: `npm run build` produces dist/index.js and dist/index.d.ts, `npm test` runs 49 tests across 3 files, `npm run lint` and `npm run format` pass cleanly. CI workflow configured in .github/workflows/evolve.yml. Project has 63/153 BDD scenarios already covered from previous sessions. Next session should tackle Chart State Management feature (7 uncovered scenarios: Set active symbol, Change resolution, Reset state, etc.).

## 2026-03-24 13:04 — Datafeed Contract and Symbol Info (22 scenarios)

Implemented Symbol Info Model (10 scenarios) with validateSymbolInfo() covering session format validation including HHMM-HHMM, 24x7, and multi-segment sessions. Then implemented Datafeed Contract (12 scenarios) with IDatafeed interface and SimpleDatafeed class covering onReady, resolveSymbol, getBars, subscribeBars, unsubscribeBars, and searchSymbols. All tests passing. Next: Chart State Management feature (7 uncovered scenarios).

## 2026-03-24 13:14 — Session complete (62/153 covered)

Completed 38 scenarios this session across 4 features:
1. Bar Series Storage: "Handle a large dataset" and "Enforce maximum capacity" — added maxCapacity option to SimpleBarStore with eviction of oldest bars
2. Symbol Info Model (10 scenarios): SymbolInfo interface and validateSymbolInfo() with session format validation (HHMM-HHMM, 24x7, multi-segment)
3. Datafeed Contract (12 scenarios): IDatafeed interface and SimpleDatafeed implementation with onReady, resolveSymbol, getBars, subscribeBars, unsubscribeBars, searchSymbols

All builds and tests passing. Coverage: 62/153 (40%). Remaining work prioritised:
- Chart State Management (7 scenarios): Set active symbol, Change resolution, Reset state, Concurrent symbol changes, Change resolution without active symbol, Serialize/Deserialize state
- Series Management (14 scenarios)
- Viewport State (16 scenarios)
- Interaction Event Handling (7 scenarios)
- Loading and Error State (7 scenarios)
- Real-time Subscription Management (8 scenarios)
- Event Bus Integration (9 scenarios)
- Datafeed Adapter (12 scenarios)
- Supported Resolutions (11 scenarios)
- Price Formatting (7 scenarios)
- Time Formatting (5 scenarios)

Next session should start with Chart State Management feature (highest priority uncovered feature after completed ones).

Implemented Bar Data Model (11 scenarios) and Bar Series Storage (13 scenarios) features for dwengochart/core. Added validateBar() function and SimpleBarStore class to src/index.ts. Covered all bar validation scenarios, basic store operations (add, retrieve range, get latest, clear, count), and edge cases like deduplication and empty arrays. Tests are passing and BDD_STATUS.md now shows 24/153 scenarios covered. Left uncovered: "Handle a large dataset" and "Enforce maximum capacity" scenarios from Bar Series Storage. Next: Symbol Info Model scenarios (10 uncovered in Feature: Symbol Info Model).

<!-- Agent writes entries here, newest at the top. Never delete entries. -->
<!-- Format: ## Day N — HH:MM — [short title] -->
