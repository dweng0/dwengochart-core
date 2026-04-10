# BDD Status

Checked 153 scenario(s) across 4 test file(s).


## Feature: Bar Data Model

- [x] Create a valid bar
- [x] Create a bar without volume
- [x] Reject a bar where high is less than low
- [x] Reject a bar where high is less than open or close
- [x] Reject a bar where low is greater than open or close
- [x] Reject a bar with negative time
- [x] Reject a bar with NaN values
- [x] Reject a bar with negative volume
- [x] Reject a bar with Infinity values
- [x] Reject a bar with non-integer timestamp
- [x] Accept a bar with zero price

## Feature: Bar Series Storage

- [x] Add bars in chronological order
- [x] Add bars in reverse order
- [x] Deduplicate bars with the same timestamp
- [x] Merge an update into an existing bar
- [x] Retrieve bars within a time range
- [x] Query a range with no matching bars
- [x] Add an empty array of bars
- [x] Handle a large dataset
- [x] Get the latest bar
- [x] Get the latest bar from an empty store
- [x] Add a second batch with partial overlap
- [x] Clear the store
- [x] Get the bar count
- [x] Enforce maximum capacity

## Feature: Symbol Info Model

- [x] Create a valid symbol info
- [x] Create a crypto symbol with fractional pricing
- [x] Reject symbol info with missing required name
- [x] Reject symbol info with invalid pricescale
- [x] Reject symbol info with invalid session format
- [x] Accept a 24x7 session format for crypto
- [x] Accept a multi-segment session format
- [x] Symbol info includes supported resolutions
- [x] Symbol info includes currency code
- [x] Symbol info includes data capability flags

## Feature: Datafeed Contract

- [x] Datafeed onReady returns configuration
- [x] Datafeed resolveSymbol succeeds
- [x] Datafeed resolveSymbol fails for unknown symbol
- [x] Datafeed getBars returns historical data
- [x] Datafeed getBars returns noData when no bars exist
- [x] Datafeed getBars respects countBack parameter
- [x] Datafeed subscribeBars registers a real-time listener
- [x] Datafeed unsubscribeBars removes a real-time listener
- [x] Datafeed searchSymbols returns matching results
- [x] Datafeed searchSymbols returns empty for no match
- [x] Datafeed onReady callback is asynchronous
- [x] Datafeed getBars calls onError on failure
- [x] Datafeed getBars includes firstDataRequest flag

## Feature: Chart State Management

- [x] Set the active symbol
- [x] Change resolution
- [x] Reset state
- [x] Concurrent symbol changes discard stale resolution
- [x] Change resolution without an active symbol
- [x] Serialize chart state
- [x] Deserialize chart state

## Feature: Series Management

- [x] Add a series
- [x] Add multiple series
- [x] Remove a series
- [x] Update series options
- [x] Show a hidden series
- [x] Hide a visible series
- [x] Change series type
- [x] Change series type to same value is a no-op
- [x] Reorder series
- [x] Set an invalid series type
- [x] Add a series with duplicate id
- [x] Remove a nonexistent series is a no-op
- [x] Emit series:data when bars are loaded for a series
- [x] Emit series:data when a real-time bar updates a series
- [x] Each series has its own bar store
- [x] Clear series data on symbol change

## Feature: Viewport State

- [ ] UNCOVERED: Set the visible range
- [ ] UNCOVERED: Pan the viewport
- [ ] UNCOVERED: Zoom the viewport
- [ ] UNCOVERED: Zoom out with maximum range limit
- [ ] UNCOVERED: Zoom in with minimum range limit
- [ ] UNCOVERED: Auto-scroll to latest bar on new real-time data
- [ ] UNCOVERED: Do not auto-scroll when user has panned away
- [x] Initial viewport before any data
- [x] Fit viewport to all loaded data
- [x] Pan with no data loaded
- [ ] UNCOVERED: Re-enable auto-scroll
- [ ] UNCOVERED: Zoom anchor at viewport edge
- [ ] UNCOVERED: Prevent inverted viewport
- [ ] UNCOVERED: Auto-calculate price range from visible bars
- [ ] UNCOVERED: Set logarithmic price scale
- [ ] UNCOVERED: Set percentage price scale

## Feature: Interaction Event Handling

- [ ] UNCOVERED: Handle interaction:pan event
- [ ] UNCOVERED: Handle interaction:zoom event
- [ ] UNCOVERED: Handle interaction:fit event
- [ ] UNCOVERED: Handle interaction:pan with zoom clamping
- [ ] UNCOVERED: Handle interaction:pan with boundary clamping
- [ ] UNCOVERED: Handle interaction:pan disables auto-scroll
- [ ] UNCOVERED: Ignore interaction events when no data is loaded

## Feature: Loading and Error State

- [ ] UNCOVERED: Emit chart:loading when fetching initial data
- [ ] UNCOVERED: Emit chart:loading false when data arrives
- [ ] UNCOVERED: Emit chart:loading for backward pagination
- [ ] UNCOVERED: Emit chart:error on symbol resolution failure
- [ ] UNCOVERED: Emit chart:error on data loading failure
- [ ] UNCOVERED: Clear chart:error on successful data load
- [ ] UNCOVERED: Emit chart:error null on reset

## Feature: Real-time Subscription Management

- [ ] UNCOVERED: Create a subscription
- [ ] UNCOVERED: Receive a real-time bar update
- [ ] UNCOVERED: Remove a subscription
- [ ] UNCOVERED: Remove all subscriptions on symbol change
- [ ] UNCOVERED: Ignore updates for removed subscriptions
- [ ] UNCOVERED: Handle duplicate subscription creation
- [ ] UNCOVERED: Remove all subscriptions on resolution change
- [ ] UNCOVERED: Concurrent subscriptions for same symbol different resolutions

## Feature: Event Bus Integration

- [ ] UNCOVERED: Core-to-renderer event payloads are typed
- [ ] UNCOVERED: Renderer-to-core event payloads are typed
- [ ] UNCOVERED: Widget-to-renderer event payloads are typed
- [ ] UNCOVERED: Internal core event payloads are typed
- [ ] UNCOVERED: Multiple listeners receive the same event
- [ ] UNCOVERED: Unsubscribed listener does not receive events
- [ ] UNCOVERED: Event bus is injectable
- [ ] UNCOVERED: Listener that throws does not crash other listeners
- [ ] UNCOVERED: Events are delivered in emission order

## Feature: Datafeed Adapter

- [ ] UNCOVERED: Adapter calls onReady and emits datafeed:ready
- [ ] UNCOVERED: Adapter resolves a symbol and updates state
- [ ] UNCOVERED: Adapter handles symbol resolution failure
- [ ] UNCOVERED: Adapter fetches historical bars and populates series
- [ ] UNCOVERED: Adapter emits chart:loading during data fetch
- [ ] UNCOVERED: Adapter starts a real-time subscription
- [ ] UNCOVERED: Adapter cleans up subscriptions on symbol change
- [ ] UNCOVERED: Adapter fetches earlier history on backward pagination
- [ ] UNCOVERED: Adapter discards stale getBars responses
- [ ] UNCOVERED: Adapter handles concurrent getBars requests
- [ ] UNCOVERED: Adapter teardown cleans up all resources
- [ ] UNCOVERED: Adapter normalizes synchronous datafeed callbacks to async

## Feature: Supported Resolutions

- [ ] UNCOVERED: Parse standard intraday resolutions
- [ ] UNCOVERED: Parse daily resolution
- [ ] UNCOVERED: Parse weekly resolution
- [ ] UNCOVERED: Parse monthly resolution
- [ ] UNCOVERED: Reject invalid resolution string
- [x] Reject negative resolution
- [ ] UNCOVERED: Parse multi-unit resolutions
- [ ] UNCOVERED: Parse seconds resolutions
- [ ] UNCOVERED: Resolution equivalence
- [ ] UNCOVERED: Convert resolution to milliseconds
- [ ] UNCOVERED: Convert intraday resolution to milliseconds

## Feature: Price Formatting

- [x] Format a price with pricescale 100
- [x] Format a price with pricescale 1
- [x] Format a price with high pricescale for crypto
- [x] Format a price with currency symbol
- [x] Format a price with euro currency
- [x] Format zero price
- [ ] UNCOVERED: Format a very large price

## Feature: Time Formatting

- [x] Format a timestamp at daily resolution
- [x] Format a timestamp at intraday resolution
- [x] Format a timestamp at weekly resolution
- [x] Format a timestamp at monthly resolution
- [ ] UNCOVERED: Format respects timezone

---
**85/153 scenarios covered.**

68 scenario(s) need tests:
- Set the visible range
- Pan the viewport
- Zoom the viewport
- Zoom out with maximum range limit
- Zoom in with minimum range limit
- Auto-scroll to latest bar on new real-time data
- Do not auto-scroll when user has panned away
- Re-enable auto-scroll
- Zoom anchor at viewport edge
- Prevent inverted viewport
- Auto-calculate price range from visible bars
- Set logarithmic price scale
- Set percentage price scale
- Handle interaction:pan event
- Handle interaction:zoom event
- Handle interaction:fit event
- Handle interaction:pan with zoom clamping
- Handle interaction:pan with boundary clamping
- Handle interaction:pan disables auto-scroll
- Ignore interaction events when no data is loaded
- Emit chart:loading when fetching initial data
- Emit chart:loading false when data arrives
- Emit chart:loading for backward pagination
- Emit chart:error on symbol resolution failure
- Emit chart:error on data loading failure
- Clear chart:error on successful data load
- Emit chart:error null on reset
- Create a subscription
- Receive a real-time bar update
- Remove a subscription
- Remove all subscriptions on symbol change
- Ignore updates for removed subscriptions
- Handle duplicate subscription creation
- Remove all subscriptions on resolution change
- Concurrent subscriptions for same symbol different resolutions
- Core-to-renderer event payloads are typed
- Renderer-to-core event payloads are typed
- Widget-to-renderer event payloads are typed
- Internal core event payloads are typed
- Multiple listeners receive the same event
- Unsubscribed listener does not receive events
- Event bus is injectable
- Listener that throws does not crash other listeners
- Events are delivered in emission order
- Adapter calls onReady and emits datafeed:ready
- Adapter resolves a symbol and updates state
- Adapter handles symbol resolution failure
- Adapter fetches historical bars and populates series
- Adapter emits chart:loading during data fetch
- Adapter starts a real-time subscription
- Adapter cleans up subscriptions on symbol change
- Adapter fetches earlier history on backward pagination
- Adapter discards stale getBars responses
- Adapter handles concurrent getBars requests
- Adapter teardown cleans up all resources
- Adapter normalizes synchronous datafeed callbacks to async
- Parse standard intraday resolutions
- Parse daily resolution
- Parse weekly resolution
- Parse monthly resolution
- Reject invalid resolution string
- Parse multi-unit resolutions
- Parse seconds resolutions
- Resolution equivalence
- Convert resolution to milliseconds
- Convert intraday resolution to milliseconds
- Format a very large price
- Format respects timezone
