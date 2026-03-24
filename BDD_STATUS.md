# BDD Status

Checked 153 scenario(s) across 1 test file(s).


## Feature: Bar Data Model

- [ ] UNCOVERED: Create a valid bar
- [ ] UNCOVERED: Create a bar without volume
- [ ] UNCOVERED: Reject a bar where high is less than low
- [ ] UNCOVERED: Reject a bar where high is less than open or close
- [ ] UNCOVERED: Reject a bar where low is greater than open or close
- [ ] UNCOVERED: Reject a bar with negative time
- [ ] UNCOVERED: Reject a bar with NaN values
- [ ] UNCOVERED: Reject a bar with negative volume
- [ ] UNCOVERED: Reject a bar with Infinity values
- [ ] UNCOVERED: Reject a bar with non-integer timestamp
- [ ] UNCOVERED: Accept a bar with zero price

## Feature: Bar Series Storage

- [ ] UNCOVERED: Add bars in chronological order
- [ ] UNCOVERED: Add bars in reverse order
- [ ] UNCOVERED: Deduplicate bars with the same timestamp
- [ ] UNCOVERED: Merge an update into an existing bar
- [ ] UNCOVERED: Retrieve bars within a time range
- [ ] UNCOVERED: Query a range with no matching bars
- [ ] UNCOVERED: Add an empty array of bars
- [ ] UNCOVERED: Handle a large dataset
- [ ] UNCOVERED: Get the latest bar
- [ ] UNCOVERED: Get the latest bar from an empty store
- [ ] UNCOVERED: Add a second batch with partial overlap
- [ ] UNCOVERED: Clear the store
- [ ] UNCOVERED: Get the bar count
- [ ] UNCOVERED: Enforce maximum capacity

## Feature: Symbol Info Model

- [ ] UNCOVERED: Create a valid symbol info
- [ ] UNCOVERED: Create a crypto symbol with fractional pricing
- [ ] UNCOVERED: Reject symbol info with missing required name
- [ ] UNCOVERED: Reject symbol info with invalid pricescale
- [ ] UNCOVERED: Reject symbol info with invalid session format
- [ ] UNCOVERED: Accept a 24x7 session format for crypto
- [ ] UNCOVERED: Accept a multi-segment session format
- [ ] UNCOVERED: Symbol info includes supported resolutions
- [ ] UNCOVERED: Symbol info includes currency code
- [ ] UNCOVERED: Symbol info includes data capability flags

## Feature: Datafeed Contract

- [ ] UNCOVERED: Datafeed onReady returns configuration
- [ ] UNCOVERED: Datafeed resolveSymbol succeeds
- [ ] UNCOVERED: Datafeed resolveSymbol fails for unknown symbol
- [ ] UNCOVERED: Datafeed getBars returns historical data
- [ ] UNCOVERED: Datafeed getBars returns noData when no bars exist
- [ ] UNCOVERED: Datafeed getBars respects countBack parameter
- [ ] UNCOVERED: Datafeed subscribeBars registers a real-time listener
- [ ] UNCOVERED: Datafeed unsubscribeBars removes a real-time listener
- [ ] UNCOVERED: Datafeed searchSymbols returns matching results
- [ ] UNCOVERED: Datafeed searchSymbols returns empty for no match
- [ ] UNCOVERED: Datafeed onReady callback is asynchronous
- [ ] UNCOVERED: Datafeed getBars calls onError on failure
- [ ] UNCOVERED: Datafeed getBars includes firstDataRequest flag

## Feature: Chart State Management

- [ ] UNCOVERED: Set the active symbol
- [ ] UNCOVERED: Change resolution
- [ ] UNCOVERED: Reset state
- [ ] UNCOVERED: Concurrent symbol changes discard stale resolution
- [ ] UNCOVERED: Change resolution without an active symbol
- [ ] UNCOVERED: Serialize chart state
- [ ] UNCOVERED: Deserialize chart state

## Feature: Series Management

- [ ] UNCOVERED: Add a series
- [ ] UNCOVERED: Add multiple series
- [ ] UNCOVERED: Remove a series
- [ ] UNCOVERED: Update series options
- [ ] UNCOVERED: Show a hidden series
- [ ] UNCOVERED: Hide a visible series
- [ ] UNCOVERED: Change series type
- [ ] UNCOVERED: Change series type to same value is a no-op
- [ ] UNCOVERED: Reorder series
- [ ] UNCOVERED: Set an invalid series type
- [ ] UNCOVERED: Add a series with duplicate id
- [ ] UNCOVERED: Remove a nonexistent series is a no-op
- [ ] UNCOVERED: Emit series:data when bars are loaded for a series
- [ ] UNCOVERED: Emit series:data when a real-time bar updates a series
- [ ] UNCOVERED: Each series has its own bar store
- [ ] UNCOVERED: Clear series data on symbol change

## Feature: Viewport State

- [ ] UNCOVERED: Set the visible range
- [ ] UNCOVERED: Pan the viewport
- [ ] UNCOVERED: Zoom the viewport
- [ ] UNCOVERED: Zoom out with maximum range limit
- [ ] UNCOVERED: Zoom in with minimum range limit
- [ ] UNCOVERED: Auto-scroll to latest bar on new real-time data
- [ ] UNCOVERED: Do not auto-scroll when user has panned away
- [ ] UNCOVERED: Initial viewport before any data
- [ ] UNCOVERED: Fit viewport to all loaded data
- [ ] UNCOVERED: Pan with no data loaded
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
- [ ] UNCOVERED: Reject negative resolution
- [ ] UNCOVERED: Parse multi-unit resolutions
- [ ] UNCOVERED: Parse seconds resolutions
- [ ] UNCOVERED: Resolution equivalence
- [ ] UNCOVERED: Convert resolution to milliseconds
- [ ] UNCOVERED: Convert intraday resolution to milliseconds

## Feature: Price Formatting

- [ ] UNCOVERED: Format a price with pricescale 100
- [ ] UNCOVERED: Format a price with pricescale 1
- [ ] UNCOVERED: Format a price with high pricescale for crypto
- [ ] UNCOVERED: Format a price with currency symbol
- [ ] UNCOVERED: Format a price with euro currency
- [ ] UNCOVERED: Format zero price
- [ ] UNCOVERED: Format a very large price

## Feature: Time Formatting

- [ ] UNCOVERED: Format a timestamp at daily resolution
- [ ] UNCOVERED: Format a timestamp at intraday resolution
- [ ] UNCOVERED: Format a timestamp at weekly resolution
- [ ] UNCOVERED: Format a timestamp at monthly resolution
- [ ] UNCOVERED: Format respects timezone

---
**0/153 scenarios covered.**

153 scenario(s) need tests:
- Create a valid bar
- Create a bar without volume
- Reject a bar where high is less than low
- Reject a bar where high is less than open or close
- Reject a bar where low is greater than open or close
- Reject a bar with negative time
- Reject a bar with NaN values
- Reject a bar with negative volume
- Reject a bar with Infinity values
- Reject a bar with non-integer timestamp
- Accept a bar with zero price
- Add bars in chronological order
- Add bars in reverse order
- Deduplicate bars with the same timestamp
- Merge an update into an existing bar
- Retrieve bars within a time range
- Query a range with no matching bars
- Add an empty array of bars
- Handle a large dataset
- Get the latest bar
- Get the latest bar from an empty store
- Add a second batch with partial overlap
- Clear the store
- Get the bar count
- Enforce maximum capacity
- Create a valid symbol info
- Create a crypto symbol with fractional pricing
- Reject symbol info with missing required name
- Reject symbol info with invalid pricescale
- Reject symbol info with invalid session format
- Accept a 24x7 session format for crypto
- Accept a multi-segment session format
- Symbol info includes supported resolutions
- Symbol info includes currency code
- Symbol info includes data capability flags
- Datafeed onReady returns configuration
- Datafeed resolveSymbol succeeds
- Datafeed resolveSymbol fails for unknown symbol
- Datafeed getBars returns historical data
- Datafeed getBars returns noData when no bars exist
- Datafeed getBars respects countBack parameter
- Datafeed subscribeBars registers a real-time listener
- Datafeed unsubscribeBars removes a real-time listener
- Datafeed searchSymbols returns matching results
- Datafeed searchSymbols returns empty for no match
- Datafeed onReady callback is asynchronous
- Datafeed getBars calls onError on failure
- Datafeed getBars includes firstDataRequest flag
- Set the active symbol
- Change resolution
- Reset state
- Concurrent symbol changes discard stale resolution
- Change resolution without an active symbol
- Serialize chart state
- Deserialize chart state
- Add a series
- Add multiple series
- Remove a series
- Update series options
- Show a hidden series
- Hide a visible series
- Change series type
- Change series type to same value is a no-op
- Reorder series
- Set an invalid series type
- Add a series with duplicate id
- Remove a nonexistent series is a no-op
- Emit series:data when bars are loaded for a series
- Emit series:data when a real-time bar updates a series
- Each series has its own bar store
- Clear series data on symbol change
- Set the visible range
- Pan the viewport
- Zoom the viewport
- Zoom out with maximum range limit
- Zoom in with minimum range limit
- Auto-scroll to latest bar on new real-time data
- Do not auto-scroll when user has panned away
- Initial viewport before any data
- Fit viewport to all loaded data
- Pan with no data loaded
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
- Reject negative resolution
- Parse multi-unit resolutions
- Parse seconds resolutions
- Resolution equivalence
- Convert resolution to milliseconds
- Convert intraday resolution to milliseconds
- Format a price with pricescale 100
- Format a price with pricescale 1
- Format a price with high pricescale for crypto
- Format a price with currency symbol
- Format a price with euro currency
- Format zero price
- Format a very large price
- Format a timestamp at daily resolution
- Format a timestamp at intraday resolution
- Format a timestamp at weekly resolution
- Format a timestamp at monthly resolution
- Format respects timezone
