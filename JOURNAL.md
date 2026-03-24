# Journal

## 2026-03-24 13:06 — Bar Series Storage capacity scenarios (26/153 covered)

Implemented two uncovered Bar Series Storage scenarios: "Handle a large dataset" and "Enforce maximum capacity". Added maxCapacity option to SimpleBarStore constructor and eviction logic for oldest bars when capacity is exceeded. Both tests pass with performance under 50ms for 1000-bar window retrieval. Coverage is now 26/153. Next: Symbol Info Model scenarios (10 uncovered).

Implemented Bar Data Model (11 scenarios) and Bar Series Storage (13 scenarios) features for dwengochart/core. Added validateBar() function and SimpleBarStore class to src/index.ts. Covered all bar validation scenarios, basic store operations (add, retrieve range, get latest, clear, count), and edge cases like deduplication and empty arrays. Tests are passing and BDD_STATUS.md now shows 24/153 scenarios covered. Left uncovered: "Handle a large dataset" and "Enforce maximum capacity" scenarios from Bar Series Storage. Next: Symbol Info Model scenarios (10 uncovered in Feature: Symbol Info Model).

<!-- Agent writes entries here, newest at the top. Never delete entries. -->
<!-- Format: ## Day N — HH:MM — [short title] -->
