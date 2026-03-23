---
language: typescript
framework: react-vite
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-05
---

You must only write code and tests that meet the features and scenarios of this behaviour driven development document.

System: A framework-agnostic TypeScript library that manages financial chart state, data models, and datafeed contracts. It owns OHLCV bar storage, symbol resolution, viewport state, series configuration, and real-time subscription management — communicating all state changes via @yatamazuki/typed-eventbus. It has zero DOM dependencies and runs in any JavaScript environment.

    Feature: Bar Data Model
        As a developer
        I want a well-defined OHLCV bar data structure
        So that all chart data has a consistent, validated shape

        Scenario: Create a valid bar
            Given a bar with time 1700000000000, open 100, high 105, low 95, close 102, and volume 1000
            When the bar is validated
            Then it should be accepted as a valid Bar

        Scenario: Create a bar without volume
            Given a bar with time 1700000000000, open 100, high 105, low 95, and close 102
            When the bar is validated
            Then it should be accepted as a valid Bar with volume undefined

        Scenario: Reject a bar where high is less than low
            Given a bar with time 1700000000000, open 100, high 90, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating high must be >= low

        Scenario: Reject a bar where high is less than open or close
            Given a bar with time 1700000000000, open 100, high 99, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating high must be >= open and close

        Scenario: Reject a bar where low is greater than open or close
            Given a bar with time 1700000000000, open 100, high 105, low 101, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating low must be <= open and close

        Scenario: Reject a bar with negative time
            Given a bar with time -1, open 100, high 105, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating time must be a positive integer

        Scenario: Reject a bar with NaN values
            Given a bar with time 1700000000000, open NaN, high 105, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating numeric fields must not be NaN

        Scenario: Reject a bar with negative volume
            Given a bar with time 1700000000000, open 100, high 105, low 95, close 102, and volume -5
            When the bar is validated
            Then it should be rejected with an error indicating volume must be non-negative

        Scenario: Reject a bar with Infinity values
            Given a bar with time 1700000000000, open Infinity, high 105, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating numeric fields must be finite

        Scenario: Reject a bar with non-integer timestamp
            Given a bar with time 1700000000000.5, open 100, high 105, low 95, and close 102
            When the bar is validated
            Then it should be rejected with an error indicating time must be an integer

        Scenario: Accept a bar with zero price
            Given a bar with time 1700000000000, open 0, high 0, low 0, close 0, and volume 0
            When the bar is validated
            Then it should be accepted as a valid Bar

    Feature: Bar Series Storage
        As a developer
        I want a time-series store that manages collections of bars
        So that bars are always sorted, deduplicated, and efficiently accessible

        Background:
            Given an empty bar series store

        Scenario: Add bars in chronological order
            Given bars at times [1000, 2000, 3000]
            When the bars are added to the store
            Then the store should contain 3 bars in ascending time order

        Scenario: Add bars in reverse order
            Given bars at times [3000, 2000, 1000]
            When the bars are added to the store
            Then the store should contain 3 bars in ascending time order

        Scenario: Deduplicate bars with the same timestamp
            Given bars at times [1000, 2000, 2000, 3000]
            When the bars are added to the store
            Then the store should contain 3 bars
            And the bar at time 2000 should reflect the last-written values

        Scenario: Merge an update into an existing bar
            Given a bar at time 1000 with close 100 already in the store
            When a bar at time 1000 with close 105 is added
            Then the store should contain 1 bar with close 105

        Scenario: Retrieve bars within a time range
            Given bars at times [1000, 2000, 3000, 4000, 5000]
            When bars are queried from time 2000 to 4000
            Then the result should contain bars at times [2000, 3000, 4000]

        Scenario: Query a range with no matching bars
            Given bars at times [1000, 2000, 3000]
            When bars are queried from time 5000 to 6000
            Then the result should be an empty array

        Scenario: Add an empty array of bars
            When an empty array of bars is added to the store
            Then the store should remain empty and not emit any events

        Scenario: Handle a large dataset
            Given 100000 bars with sequential timestamps
            When the bars are added to the store
            Then the store should contain 100000 bars in ascending time order
            And retrieval of any 1000-bar window should complete in under 50ms

        Scenario: Get the latest bar
            Given bars at times [1000, 2000, 3000]
            When the latest bar is requested
            Then the bar at time 3000 should be returned

        Scenario: Get the latest bar from an empty store
            When the latest bar is requested
            Then the result should be undefined

        Scenario: Add a second batch with partial overlap
            Given bars at times [1000, 2000, 3000] already in the store
            When bars at times [2000, 3000, 4000, 5000] are added
            Then the store should contain 5 bars in ascending time order
            And bars at times 2000 and 3000 should reflect the last-written values

        Scenario: Clear the store
            Given bars at times [1000, 2000, 3000] in the store
            When the store is cleared
            Then the store should be empty
            And a "state:reset" event should not be emitted from the store itself

        Scenario: Get the bar count
            Given bars at times [1000, 2000, 3000]
            When the bar count is requested
            Then the result should be 3

        Scenario: Enforce maximum capacity
            Given a store configured with a maximum capacity of 10000 bars
            And 10000 bars already in the store
            When 100 new bars with later timestamps are added
            Then the store should still contain 10000 bars
            And the 100 oldest bars should have been evicted

    Feature: Symbol Info Model
        As a developer
        I want a symbol information model matching TradingView's LibrarySymbolInfo
        So that resolved symbols carry all metadata needed for rendering and calculations

        Scenario: Create a valid symbol info
            Given symbol info with name "AAPL", description "Apple Inc", exchange "NASDAQ", type "stock", timezone "America/New_York", session "0930-1600", minmov 1, pricescale 100, has_intraday true, and has_no_volume false
            When the symbol info is validated
            Then it should be accepted as valid SymbolInfo

        Scenario: Create a crypto symbol with fractional pricing
            Given symbol info with name "BTCUSD", pricescale 100000000, minmov 1, and has_no_volume false
            When the symbol info is validated
            Then it should be accepted with pricescale 100000000

        Scenario: Reject symbol info with missing required name
            Given symbol info without a name
            When the symbol info is validated
            Then it should be rejected with an error indicating name is required

        Scenario: Reject symbol info with invalid pricescale
            Given symbol info with name "TEST" and pricescale 0
            When the symbol info is validated
            Then it should be rejected with an error indicating pricescale must be a positive integer

        Scenario: Reject symbol info with invalid session format
            Given symbol info with name "TEST" and session "invalid"
            When the symbol info is validated
            Then it should be rejected with an error indicating invalid session format

        Scenario: Accept a 24x7 session format for crypto
            Given symbol info with name "BTCUSD" and session "24x7"
            When the symbol info is validated
            Then it should be accepted as valid SymbolInfo

        Scenario: Accept a multi-segment session format
            Given symbol info with name "AAPL" and session "0400-0930,0930-1600,1600-2000"
            When the symbol info is validated
            Then it should be accepted as valid SymbolInfo

        Scenario: Symbol info includes supported resolutions
            Given symbol info with name "AAPL" and supported_resolutions ["1", "5", "15", "60", "1D", "1W"]
            When the symbol info is validated
            Then it should be accepted and the supported_resolutions should be preserved

        Scenario: Symbol info includes currency code
            Given symbol info with name "AAPL" and currency_code "USD"
            When the symbol info is validated
            Then it should be accepted and the currency_code should be preserved

        Scenario: Symbol info includes data capability flags
            Given symbol info with name "AAPL", has_intraday true, has_daily true, and has_weekly_and_monthly true
            When the symbol info is validated
            Then all capability flags should be preserved

    Feature: Datafeed Contract
        As a developer integrating a data source
        I want a well-defined datafeed interface matching TradingView's IBasicDataFeed
        So that any data provider can plug into the chart system

        Scenario: Datafeed onReady returns configuration
            Given a datafeed implementation
            When onReady is called with a callback
            Then the callback should receive a DatafeedConfiguration with supported_resolutions

        Scenario: Datafeed resolveSymbol succeeds
            Given a datafeed that knows symbol "AAPL"
            When resolveSymbol is called for "AAPL"
            Then the onResolve callback should receive a valid SymbolInfo

        Scenario: Datafeed resolveSymbol fails for unknown symbol
            Given a datafeed that does not know symbol "INVALID"
            When resolveSymbol is called for "INVALID"
            Then the onError callback should be called with a reason string

        Scenario: Datafeed getBars returns historical data
            Given a datafeed with historical data for "AAPL" at resolution "1D"
            When getBars is called with from 1000 and to 5000
            Then the onHistory callback should receive bars in ascending time order and a noData flag

        Scenario: Datafeed getBars returns noData when no bars exist
            Given a datafeed with no data for "AAPL" at resolution "1D" in the requested range
            When getBars is called with from 1000 and to 2000
            Then the onHistory callback should receive an empty array and noData set to true

        Scenario: Datafeed getBars respects countBack parameter
            Given a datafeed with 100 bars for "AAPL" at resolution "1D"
            When getBars is called with countBack 10
            Then the onHistory callback should receive at most 10 bars

        Scenario: Datafeed subscribeBars registers a real-time listener
            Given a datafeed for symbol "AAPL" at resolution "1"
            When subscribeBars is called with a callback and listenerGuid "guid_1"
            Then the datafeed should track the subscription under "guid_1"

        Scenario: Datafeed unsubscribeBars removes a real-time listener
            Given an active subscription with listenerGuid "guid_1"
            When unsubscribeBars is called with "guid_1"
            Then the subscription should be removed and no further callbacks should fire

        Scenario: Datafeed searchSymbols returns matching results
            Given a datafeed with symbols "AAPL", "AMZN", and "GOOG"
            When searchSymbols is called with userInput "A"
            Then the callback should receive results including "AAPL" and "AMZN"

        Scenario: Datafeed searchSymbols returns empty for no match
            Given a datafeed with symbols "AAPL", "AMZN", and "GOOG"
            When searchSymbols is called with userInput "ZZZ"
            Then the callback should receive an empty array

        Scenario: Datafeed onReady callback is asynchronous
            Given a datafeed implementation
            When onReady is called with a callback
            Then the callback must not fire synchronously in the same call stack

        Scenario: Datafeed getBars calls onError on failure
            Given a datafeed that errors for symbol "AAPL" at resolution "1D"
            When getBars is called
            Then the onError callback should be called with a reason string

        Scenario: Datafeed getBars includes firstDataRequest flag
            Given a datafeed with data for "AAPL" at resolution "1D"
            When getBars is called with firstDataRequest set to true
            Then the datafeed should return the most recent bars up to countBack
            When getBars is called with firstDataRequest set to false
            Then the datafeed should return bars for the specified from/to range

    Feature: Chart State Management
        As a developer
        I want centralized chart state that tracks the current symbol, resolution, series type, and viewport
        So that all components stay synchronized via events

        Background:
            Given a chart state manager initialized with the event bus

        Scenario: Set the active symbol
            When the symbol is set to "AAPL" with resolution "1D"
            Then the state should reflect symbol "AAPL" and resolution "1D"
            And a "symbol:resolved" event should be emitted

        Scenario: Change resolution
            Given the active symbol is "AAPL" with resolution "1D"
            When the resolution is changed to "1H"
            Then the state should reflect resolution "1H"
            And a "viewport:changed" event should be emitted
            And the bar store should be cleared for the new resolution

        Scenario: Change series type
            Given the series type is "candlestick"
            When the series type is changed to "line"
            Then the state should reflect series type "line"
            And a "series:typeChanged" event should be emitted with type "line"

        Scenario: Set series type to same value is a no-op
            Given the series type is "candlestick"
            When the series type is changed to "candlestick"
            Then no "series:typeChanged" event should be emitted

        Scenario: Reset state
            Given an active symbol "AAPL" with bars in the store
            When the state is reset
            Then the symbol should be undefined
            And the bar store should be empty
            And a "state:reset" event should be emitted

        Scenario: Concurrent symbol changes discard stale resolution
            Given the symbol is being set to "AAPL" and resolution is pending
            When the symbol is changed to "GOOG" before "AAPL" resolves
            Then the "AAPL" resolution result should be discarded when it arrives
            And only "GOOG" should be reflected in the state

        Scenario: Set an invalid series type
            Given the supported series types are ["candlestick", "line", "area"]
            When the series type is set to "invalid_type"
            Then it should be rejected with an error indicating unsupported series type
            And the current series type should remain unchanged

        Scenario: Change resolution without an active symbol
            Given no symbol is currently set
            When the resolution is changed to "1H"
            Then the state should reflect resolution "1H"
            And no bar store clearing or data fetching should occur

        Scenario: Serialize chart state
            Given an active symbol "AAPL" with resolution "1D" and series type "candlestick"
            When the state is serialized
            Then the result should contain symbol, resolution, series type, and viewport range

        Scenario: Deserialize chart state
            Given a serialized state with symbol "AAPL", resolution "1D", and series type "line"
            When the state is deserialized
            Then the chart state should reflect all deserialized values
            And appropriate events should be emitted for each restored property

    Feature: Viewport State
        As a developer
        I want to track and modify the visible time range
        So that the renderer knows which bars to draw and when to request more data

        Background:
            Given a viewport manager initialized with the event bus

        Scenario: Set the visible range
            When the visible range is set to from 1000 and to 5000
            Then the viewport should reflect from 1000 and to 5000
            And a "viewport:changed" event should be emitted

        Scenario: Pan the viewport
            Given the visible range is from 1000 to 5000
            When the viewport is panned by delta -1000
            Then the visible range should be from 0 to 4000
            And a "viewport:changed" event should be emitted

        Scenario: Zoom the viewport
            Given the visible range is from 1000 to 5000
            When the viewport is zoomed by factor 0.5 anchored at 3000
            Then the visible range should shrink symmetrically around 3000
            And a "viewport:changed" event should be emitted

        Scenario: Zoom out with maximum range limit
            Given a maximum visible range of 100000
            And the visible range is from 1000 to 5000
            When the viewport is zoomed out beyond the maximum
            Then the visible range should be clamped to the maximum
            And a "viewport:changed" event should be emitted

        Scenario: Zoom in with minimum range limit
            Given a minimum visible range of 100
            And the visible range is from 1000 to 5000
            When the viewport is zoomed in beyond the minimum
            Then the visible range should be clamped to the minimum
            And a "viewport:changed" event should be emitted

        Scenario: Auto-scroll to latest bar on new real-time data
            Given auto-scroll is enabled
            And the visible range is from 1000 to 5000
            When a real-time bar arrives at time 5500
            Then the viewport should shift so the new bar is visible
            And a "viewport:changed" event should be emitted

        Scenario: Do not auto-scroll when user has panned away
            Given auto-scroll is enabled
            And the user has panned the viewport to an earlier range
            When a real-time bar arrives at time 5500
            Then the viewport should not shift

        Scenario: Initial viewport before any data
            Given no bars have been loaded
            When the viewport state is queried
            Then from and to should both be 0
            And the viewport should be flagged as uninitialized

        Scenario: Fit viewport to all loaded data
            Given bars spanning from time 1000 to time 10000
            When fit-to-data is requested
            Then the visible range should encompass all bars with padding
            And a "viewport:changed" event should be emitted

        Scenario: Pan with no data loaded
            Given no bars have been loaded
            When the viewport is panned
            Then the pan should be a no-op
            And no events should be emitted

        Scenario: Re-enable auto-scroll
            Given auto-scroll was disabled because the user panned away
            When auto-scroll is explicitly re-enabled
            Then the viewport should shift to show the latest bar
            And subsequent real-time bars should auto-scroll the viewport

        Scenario: Zoom anchor at viewport edge
            Given the visible range is from 1000 to 5000
            When the viewport is zoomed by factor 0.5 anchored at 1000
            Then the left side should remain at 1000
            And the right side should shrink toward 1000

        Scenario: Prevent inverted viewport
            When the visible range is set with from greater than to
            Then the viewport should reject the invalid range
            And the previous valid range should be preserved

    Feature: Real-time Subscription Management
        As a developer
        I want to manage multiple concurrent real-time data subscriptions
        So that symbol/resolution changes are handled cleanly without leaked subscriptions

        Background:
            Given a subscription manager initialized with the event bus

        Scenario: Create a subscription
            When a subscription is created for symbol "AAPL" at resolution "1" with guid "sub_1"
            Then the subscription manager should track "sub_1"
            And a "subscription:created" event should be emitted

        Scenario: Receive a real-time bar update
            Given an active subscription "sub_1" for "AAPL" at resolution "1"
            When the datafeed delivers a new bar for "sub_1"
            Then the bar should be merged into the store
            And a "bars:realtime" event should be emitted

        Scenario: Remove a subscription
            Given an active subscription "sub_1"
            When the subscription "sub_1" is removed
            Then the subscription manager should no longer track "sub_1"
            And a "subscription:removed" event should be emitted

        Scenario: Remove all subscriptions on symbol change
            Given active subscriptions "sub_1" and "sub_2" for "AAPL"
            When the symbol is changed to "GOOG"
            Then all subscriptions for "AAPL" should be removed
            And "subscription:removed" events should be emitted for each

        Scenario: Ignore updates for removed subscriptions
            Given a subscription "sub_1" that has been removed
            When the datafeed delivers a bar for "sub_1"
            Then the bar should be silently ignored
            And no events should be emitted

        Scenario: Handle duplicate subscription creation
            Given an active subscription "sub_1" for "AAPL" at resolution "1"
            When another subscription is created with the same guid "sub_1"
            Then the old subscription should be replaced
            And only one subscription should exist for "sub_1"

        Scenario: Remove all subscriptions on resolution change
            Given active subscriptions for "AAPL" at resolution "1"
            When the resolution is changed to "5"
            Then all subscriptions for the old resolution should be removed
            And "subscription:removed" events should be emitted for each

        Scenario: Concurrent subscriptions for same symbol different resolutions
            Given an active subscription for "AAPL" at resolution "1"
            When a subscription is created for "AAPL" at resolution "5"
            Then only the latest resolution subscription should be active
            And the previous resolution subscription should be removed

    Feature: Event Bus Integration
        As a developer
        I want all state changes communicated via typed events
        So that the renderer and widget packages can react without direct imports

        Scenario: Events are typed with correct payloads
            Given the chart event map type definition
            When a "bars:historical" event is emitted
            Then the payload must conform to { symbol: string, bars: Bar[], resolution: string }

        Scenario: Multiple listeners receive the same event
            Given two listeners subscribed to "bars:realtime"
            When a "bars:realtime" event is emitted
            Then both listeners should receive the event with the same payload

        Scenario: Unsubscribed listener does not receive events
            Given a listener subscribed to "viewport:changed"
            When the listener is unsubscribed
            And a "viewport:changed" event is emitted
            Then the listener should not be called

        Scenario: Event bus is injectable
            Given a custom event bus instance
            When the chart state manager is initialized with that instance
            Then all events should be emitted on the provided bus
            And external code can listen on the same bus

        Scenario: Listener that throws does not crash other listeners
            Given two listeners subscribed to "bars:realtime"
            And the first listener throws an error
            When a "bars:realtime" event is emitted
            Then the second listener should still receive the event
            And the error should be reported but not propagated

        Scenario: Events are delivered in emission order
            Given a listener subscribed to "viewport:changed"
            When three "viewport:changed" events are emitted in sequence
            Then the listener should receive them in the same order

    Feature: Datafeed Adapter
        As a developer
        I want an adapter that bridges a user-provided IBasicDataFeed to the core state
        So that datafeed callbacks automatically update the bar store and emit events

        Background:
            Given a datafeed adapter initialized with a mock datafeed and the event bus

        Scenario: Adapter calls onReady and emits datafeed:ready
            When the adapter is initialized
            Then it should call the datafeed's onReady
            And emit a "datafeed:ready" event with the configuration

        Scenario: Adapter resolves a symbol and updates state
            When the adapter resolves symbol "AAPL"
            Then it should call the datafeed's resolveSymbol
            And on success, emit a "symbol:resolved" event
            And update the chart state with the resolved symbol info

        Scenario: Adapter handles symbol resolution failure
            When the adapter resolves symbol "INVALID"
            Then it should call the datafeed's resolveSymbol
            And on failure, emit a "symbol:error" event with the error reason

        Scenario: Adapter fetches historical bars and populates the store
            Given symbol "AAPL" is resolved
            When the adapter fetches bars for resolution "1D" from 1000 to 5000
            Then it should call the datafeed's getBars
            And on success, add the bars to the store
            And emit a "bars:historical" event

        Scenario: Adapter starts a real-time subscription
            Given symbol "AAPL" is resolved
            When the adapter subscribes to real-time updates at resolution "1"
            Then it should call the datafeed's subscribeBars
            And register the subscription in the subscription manager

        Scenario: Adapter cleans up subscriptions on symbol change
            Given an active real-time subscription for "AAPL"
            When the adapter resolves a new symbol "GOOG"
            Then it should unsubscribe from "AAPL" via the datafeed's unsubscribeBars
            And remove the subscription from the manager

        Scenario: Adapter fetches earlier history on backward pagination
            Given symbol "AAPL" is resolved with bars from time 5000 to 10000 loaded
            When the viewport scrolls to require bars before time 5000
            Then the adapter should call getBars with a range ending at 5000 and firstDataRequest false
            And on success, merge the earlier bars into the store
            And emit a "bars:historical" event

        Scenario: Adapter discards stale getBars responses
            Given the adapter has requested bars for "AAPL" at resolution "1D"
            When the resolution changes to "1H" before the response arrives
            Then the stale "1D" response should be discarded when it arrives
            And only the "1H" request should populate the store

        Scenario: Adapter handles concurrent getBars requests
            Given rapid scrolling triggers multiple getBars calls
            When responses arrive out of order
            Then all responses for the current symbol and resolution should be merged into the store
            And stale responses for old symbols or resolutions should be discarded

        Scenario: Adapter teardown cleans up all resources
            When the adapter is destroyed
            Then all active subscriptions should be unsubscribed via the datafeed
            And all pending getBars callbacks should be ignored
            And all eventbus listeners should be removed

        Scenario: Adapter normalizes synchronous datafeed callbacks to async
            Given a datafeed that calls onHistory synchronously within getBars
            When the adapter calls getBars
            Then the store update and event emission should still occur asynchronously

    Feature: Supported Resolutions
        As a developer
        I want resolution values parsed and validated
        So that invalid intervals are caught early

        Scenario: Parse standard intraday resolutions
            Given resolution strings ["1", "5", "15", "30", "60"]
            When each is parsed
            Then they should map to minutes [1, 5, 15, 30, 60]

        Scenario: Parse daily resolution
            Given resolution string "1D"
            When it is parsed
            Then it should map to 1 day

        Scenario: Parse weekly resolution
            Given resolution string "1W"
            When it is parsed
            Then it should map to 1 week

        Scenario: Parse monthly resolution
            Given resolution string "1M"
            When it is parsed
            Then it should map to 1 month

        Scenario: Reject invalid resolution string
            Given resolution string "abc"
            When it is parsed
            Then it should throw an error indicating invalid resolution format

        Scenario: Reject negative resolution
            Given resolution string "-5"
            When it is parsed
            Then it should throw an error indicating resolution must be positive

        Scenario: Parse multi-unit resolutions
            Given resolution strings ["2D", "4H", "3M", "2W"]
            When each is parsed
            Then they should map to 2 days, 4 hours, 3 months, and 2 weeks respectively

        Scenario: Parse seconds resolutions
            Given resolution strings ["1S", "5S", "30S"]
            When each is parsed
            Then they should map to seconds [1, 5, 30]

        Scenario: Resolution equivalence
            Given resolution strings "60" and "1H"
            When they are compared
            Then they should be considered equivalent

        Scenario: Convert resolution to milliseconds
            Given resolution string "1D"
            When it is converted to milliseconds
            Then the result should be 86400000

        Scenario: Convert intraday resolution to milliseconds
            Given resolution string "5"
            When it is converted to milliseconds
            Then the result should be 300000

    Feature: Price Formatting
        As a developer
        I want to format raw prices into display strings using symbol metadata
        So that the renderer can show human-readable price labels

        Scenario: Format a price with pricescale 100
            Given a symbol with pricescale 100
            When price 10250 is formatted
            Then the result should be "102.50"

        Scenario: Format a price with pricescale 1
            Given a symbol with pricescale 1
            When price 102 is formatted
            Then the result should be "102"

        Scenario: Format a price with high pricescale for crypto
            Given a symbol with pricescale 100000000
            When price 4523456789 is formatted
            Then the result should be "45.23456789"

        Scenario: Format a price with currency symbol
            Given a symbol with pricescale 100 and currency_code "USD"
            When price 10250 is formatted with currency
            Then the result should be "$102.50"

        Scenario: Format a price with euro currency
            Given a symbol with pricescale 100 and currency_code "EUR"
            When price 10250 is formatted with currency
            Then the result should be "€102.50"

        Scenario: Format zero price
            Given a symbol with pricescale 100
            When price 0 is formatted
            Then the result should be "0.00"

        Scenario: Format a very large price
            Given a symbol with pricescale 100
            When price 10000050 is formatted
            Then the result should be "100,000.50"

    Feature: Time Formatting
        As a developer
        I want to format timestamps into display strings based on resolution and timezone
        So that the renderer can show human-readable time labels

        Scenario: Format a timestamp at daily resolution
            Given resolution "1D" and timezone "America/New_York"
            When timestamp 1700000000000 is formatted
            Then the result should show a date like "Nov 14"

        Scenario: Format a timestamp at intraday resolution
            Given resolution "5" and timezone "America/New_York"
            When timestamp 1700000000000 is formatted
            Then the result should show time like "14:13"

        Scenario: Format a timestamp at weekly resolution
            Given resolution "1W" and timezone "UTC"
            When timestamp 1700000000000 is formatted
            Then the result should show a date like "Nov 13"

        Scenario: Format a timestamp at monthly resolution
            Given resolution "1M" and timezone "UTC"
            When timestamp 1700000000000 is formatted
            Then the result should show a month like "Nov 2023"

        Scenario: Format respects timezone
            Given resolution "5" and timezone "Asia/Tokyo"
            When timestamp 1700000000000 is formatted
            Then the result should reflect Tokyo time, not UTC
