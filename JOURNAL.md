# Journal

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
