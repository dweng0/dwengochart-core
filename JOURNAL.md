# Journal

## 2026-03-24 13:10 — Symbol Info Model complete (50/153 covered)

Implemented all 10 Symbol Info Model scenarios. Fixed test naming issue for "multi-segment" scenario (coverage script normalizes hyphens differently). Added SymbolInfo interface and validateSymbolInfo() function with session format validation supporting HHMM-HHMM, 24x7, and multi-segment formats. Coverage now 50/153. Next: Datafeed Contract scenarios (13 uncovered).

Implemented Bar Data Model (11 scenarios) and Bar Series Storage (13 scenarios) features for dwengochart/core. Added validateBar() function and SimpleBarStore class to src/index.ts. Covered all bar validation scenarios, basic store operations (add, retrieve range, get latest, clear, count), and edge cases like deduplication and empty arrays. Tests are passing and BDD_STATUS.md now shows 24/153 scenarios covered. Left uncovered: "Handle a large dataset" and "Enforce maximum capacity" scenarios from Bar Series Storage. Next: Symbol Info Model scenarios (10 uncovered in Feature: Symbol Info Model).

<!-- Agent writes entries here, newest at the top. Never delete entries. -->
<!-- Format: ## Day N — HH:MM — [short title] -->
