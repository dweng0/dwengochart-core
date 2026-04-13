# BDD Status

Checked 153 scenario(s) across 6 test file(s).


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

- [x] Set the visible range
- [x] Pan the viewport
- [x] Zoom the viewport
- [x] Zoom out with maximum range limit
- [x] Zoom in with minimum range limit
- [x] Auto-scroll to latest bar on new real-time data
- [x] Do not auto-scroll when user has panned away
- [x] Initial viewport before any data
- [x] Fit viewport to all loaded data
- [x] Pan with no data loaded
- [x] Re-enable auto-scroll
- [x] Zoom anchor at viewport edge
- [x] Prevent inverted viewport
- [x] Auto-calculate price range from visible bars
- [x] Set logarithmic price scale
- [x] Set percentage price scale

## Feature: Interaction Event Handling

- [x] Handle interaction:pan event
- [x] Handle interaction:zoom event
- [x] Handle interaction:fit event
- [x] Handle interaction:pan with zoom clamping
- [x] Handle interaction:pan with boundary clamping
- [x] Handle interaction:pan disables auto-scroll
- [x] Ignore interaction events when no data is loaded

## Feature: Loading and Error State

- [x] Emit chart:loading when fetching initial data
- [x] Emit chart:loading false when data arrives
- [x] Emit chart:loading for backward pagination
- [x] Emit chart:error on symbol resolution failure
- [x] Emit chart:error on data loading failure
- [x] Clear chart:error on successful data load
- [x] Emit chart:error null on reset

## Feature: Real-time Subscription Management

- [x] Create a subscription
- [x] Receive a real-time bar update
- [x] Remove a subscription
- [x] Remove all subscriptions on symbol change
- [x] Ignore updates for removed subscriptions
- [x] Handle duplicate subscription creation
- [x] Remove all subscriptions on resolution change
- [x] Concurrent subscriptions for same symbol different resolutions

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
- [x] Adapter resolves a symbol and updates state
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

- [x] Parse standard intraday resolutions
- [x] Parse daily resolution
- [x] Parse weekly resolution
- [x] Parse monthly resolution
- [x] Reject invalid resolution string
- [x] Reject negative resolution
- [x] Parse multi-unit resolutions
- [x] Parse seconds resolutions
- [x] Resolution equivalence
- [x] Convert resolution to milliseconds
- [x] Convert intraday resolution to milliseconds

## Feature: Price Formatting

- [x] Format a price with pricescale 100
- [x] Format a price with pricescale 1
- [x] Format a price with high pricescale for crypto
- [x] Format a price with currency symbol
- [x] Format a price with euro currency
- [x] Format zero price
- [x] Format a very large price

## Feature: Time Formatting

- [x] Format a timestamp at daily resolution
- [x] Format a timestamp at intraday resolution
- [x] Format a timestamp at weekly resolution
- [x] Format a timestamp at monthly resolution
- [x] Format respects timezone

---
**133/153 scenarios covered.**

20 scenario(s) need tests:
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
