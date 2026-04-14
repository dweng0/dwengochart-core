import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import {
  SafeEventBus,
  ChartStateEvents,
  ChartState,
  SymbolInfo,
  Bar,
  SimpleBarStore,
  CoreToRendererEvents,
  RendererToCoreEvents,
  WidgetToRendererEvents,
  InternalCoreEvents,
  DatafeedConfiguration,
} from "../src/index";

describe("Scenario: Multiple listeners receive the same event", () => {
  it("multiple_listeners_receive_the_same_event", () => {
    const eventBus = new EventBus<ChartStateEvents>();

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventBus.on("series:data", listener1);
    eventBus.on("series:data", listener2);

    const payload = {
      seriesId: "candles",
      bars: [
        { time: 1700000000000, open: 100, high: 105, low: 95, close: 102 },
      ],
    };

    eventBus.emit("series:data", payload);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(payload);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(payload);
  });
});

describe("Scenario: Unsubscribed listener does not receive events", () => {
  it("unsubscribed_listener_does_not_receive_events", () => {
    const eventBus = new EventBus<ChartStateEvents>();

    const listener = vi.fn();

    const unsubscribe = eventBus.on("viewport:changed", listener);

    // Unsubscribe the listener
    unsubscribe();

    // Emit an event
    const payload = {
      timeRange: [1000, 2000] as [number, number],
    };
    eventBus.emit("viewport:changed", payload);

    // Listener should not have been called
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("Scenario: Event bus is injectable", () => {
  it("event_bus_is_injectable", () => {
    const customEventBus = new EventBus<ChartStateEvents>();

    // Create ChartState with custom event bus
    const chartState = new ChartState({ eventBus: customEventBus });

    const listener = vi.fn();
    customEventBus.on("symbol:resolved", listener);

    // Set a symbol - this should emit symbol:resolved on the custom bus
    const symbolInfo: SymbolInfo = {
      name: "AAPL",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0930-1600",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };

    chartState.setSymbol(symbolInfo, "1D");

    // Verify the event was emitted on the custom bus
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ symbol: symbolInfo });
  });
});

describe("Scenario: Listener that throws does not crash other listeners", () => {
  it("listener_that_throws_does_not_crash_other_listeners", () => {
    const eventBus = new SafeEventBus<ChartStateEvents>();

    const listener1 = vi.fn(() => {
      throw new Error("Listener 1 error");
    });
    const listener2 = vi.fn();

    eventBus.on("series:data", listener1);
    eventBus.on("series:data", listener2);

    const payload = {
      seriesId: "candles",
      bars: [
        { time: 1700000000000, open: 100, high: 105, low: 95, close: 102 },
      ],
    };

    // Emit should not throw even though listener1 throws
    expect(() => {
      eventBus.emit("series:data", payload);
    }).not.toThrow();

    // Both listeners should have been called
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(payload);
  });
});

describe("Scenario: Events are delivered in emission order", () => {
  it("events_are_delivered_in_emission_order", () => {
    const eventBus = new EventBus<ChartStateEvents>();

    const receivedPayloads: Array<{ timeRange: [number, number] }> = [];

    eventBus.on("viewport:changed", (payload) => {
      receivedPayloads.push(payload);
    });

    // Emit three events in sequence
    const payload1 = { timeRange: [1000, 2000] as [number, number] };
    const payload2 = { timeRange: [2000, 3000] as [number, number] };
    const payload3 = { timeRange: [3000, 4000] as [number, number] };

    eventBus.emit("viewport:changed", payload1);
    eventBus.emit("viewport:changed", payload2);
    eventBus.emit("viewport:changed", payload3);

    // Verify events were received in order
    expect(receivedPayloads.length).toBe(3);
    expect(receivedPayloads[0]).toEqual(payload1);
    expect(receivedPayloads[1]).toEqual(payload2);
    expect(receivedPayloads[2]).toEqual(payload3);
  });
});

describe("Scenario: Core-to-renderer event payloads are typed", () => {
  it("core_to_renderer_event_payloads_are_typed", () => {
    // Verify that CoreToRendererEvents interface defines all required events
    const eventBus = new EventBus<CoreToRendererEvents>();

    // Test series:add event
    const seriesAddListener = vi.fn();
    eventBus.on("series:add", seriesAddListener);
    eventBus.emit("series:add", {
      id: "candles",
      type: "candlestick",
      options: { color: "blue" },
    });
    expect(seriesAddListener).toHaveBeenCalledWith({
      id: "candles",
      type: "candlestick",
      options: { color: "blue" },
    });

    // Test series:remove event
    const seriesRemoveListener = vi.fn();
    eventBus.on("series:remove", seriesRemoveListener);
    eventBus.emit("series:remove", { id: "candles" });
    expect(seriesRemoveListener).toHaveBeenCalledWith({ id: "candles" });

    // Test series:update event
    const seriesUpdateListener = vi.fn();
    eventBus.on("series:update", seriesUpdateListener);
    eventBus.emit("series:update", {
      id: "candles",
      options: { color: "red" },
    });
    expect(seriesUpdateListener).toHaveBeenCalledWith({
      id: "candles",
      options: { color: "red" },
    });

    // Test series:show event
    const seriesShowListener = vi.fn();
    eventBus.on("series:show", seriesShowListener);
    eventBus.emit("series:show", { id: "candles" });
    expect(seriesShowListener).toHaveBeenCalledWith({ id: "candles" });

    // Test series:hide event
    const seriesHideListener = vi.fn();
    eventBus.on("series:hide", seriesHideListener);
    eventBus.emit("series:hide", { id: "candles" });
    expect(seriesHideListener).toHaveBeenCalledWith({ id: "candles" });

    // Test series:type event
    const seriesTypeListener = vi.fn();
    eventBus.on("series:type", seriesTypeListener);
    eventBus.emit("series:type", { id: "candles", type: "line" });
    expect(seriesTypeListener).toHaveBeenCalledWith({
      id: "candles",
      type: "line",
    });

    // Test series:order event
    const seriesOrderListener = vi.fn();
    eventBus.on("series:order", seriesOrderListener);
    eventBus.emit("series:order", { ids: ["candles", "volume"] });
    expect(seriesOrderListener).toHaveBeenCalledWith({
      ids: ["candles", "volume"],
    });

    // Test series:data event
    const seriesDataListener = vi.fn();
    eventBus.on("series:data", seriesDataListener);
    const bars: Bar[] = [
      { time: 1700000000000, open: 100, high: 105, low: 95, close: 102 },
    ];
    eventBus.emit("series:data", { id: "candles", bars });
    expect(seriesDataListener).toHaveBeenCalledWith({ id: "candles", bars });

    // Test viewport:changed event
    const viewportChangeListener = vi.fn();
    eventBus.on("viewport:changed", viewportChangeListener);
    eventBus.emit("viewport:changed", {
      timeRange: [1000, 2000],
      priceRange: [95, 105],
      priceScale: "linear",
      basePrice: 100,
    });
    expect(viewportChangeListener).toHaveBeenCalledWith({
      timeRange: [1000, 2000],
      priceRange: [95, 105],
      priceScale: "linear",
      basePrice: 100,
    });

    // Test symbol:resolved event
    const symbolResolvedListener = vi.fn();
    eventBus.on("symbol:resolved", symbolResolvedListener);
    const symbolInfo: SymbolInfo = {
      name: "AAPL",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0930-1600",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };
    eventBus.emit("symbol:resolved", { symbol: symbolInfo });
    expect(symbolResolvedListener).toHaveBeenCalledWith({ symbol: symbolInfo });

    // Test chart:loading event
    const chartLoadingListener = vi.fn();
    eventBus.on("chart:loading", chartLoadingListener);
    eventBus.emit("chart:loading", { loading: true, region: "left" });
    expect(chartLoadingListener).toHaveBeenCalledWith({
      loading: true,
      region: "left",
    });

    // Test chart:error event (with error)
    const chartErrorListener = vi.fn();
    eventBus.on("chart:error", chartErrorListener);
    eventBus.emit("chart:error", { message: "Test error" });
    expect(chartErrorListener).toHaveBeenCalledWith({ message: "Test error" });

    // Test chart:error event (null to clear)
    eventBus.emit("chart:error", null);
    expect(chartErrorListener).toHaveBeenCalledWith(null);
  });
});

describe("Scenario: Renderer-to-core event payloads are typed", () => {
  it("renderer_to_core_event_payloads_are_typed", () => {
    const eventBus = new EventBus<RendererToCoreEvents>();

    // Test interaction:crosshair event (with payload)
    const crosshairListener = vi.fn();
    eventBus.on("interaction:crosshair", crosshairListener);
    eventBus.emit("interaction:crosshair", {
      price: 100,
      time: 1700000000000,
      x: 100,
      y: 200,
    });
    expect(crosshairListener).toHaveBeenCalledWith({
      price: 100,
      time: 1700000000000,
      x: 100,
      y: 200,
    });

    // Test interaction:crosshair event (null)
    eventBus.emit("interaction:crosshair", null);
    expect(crosshairListener).toHaveBeenCalledWith(null);

    // Test interaction:click event
    const clickListener = vi.fn();
    eventBus.on("interaction:click", clickListener);
    eventBus.emit("interaction:click", {
      price: 100,
      time: 1700000000000,
      x: 100,
      y: 200,
    });
    expect(clickListener).toHaveBeenCalledWith({
      price: 100,
      time: 1700000000000,
      x: 100,
      y: 200,
    });

    // Test interaction:pan event
    const panListener = vi.fn();
    eventBus.on("interaction:pan", panListener);
    eventBus.emit("interaction:pan", { deltaX: 50 });
    expect(panListener).toHaveBeenCalledWith({ deltaX: 50 });

    // Test interaction:zoom event
    const zoomListener = vi.fn();
    eventBus.on("interaction:zoom", zoomListener);
    eventBus.emit("interaction:zoom", { delta: 1.5, centerX: 400 });
    expect(zoomListener).toHaveBeenCalledWith({ delta: 1.5, centerX: 400 });

    // Test interaction:fit event
    const fitListener = vi.fn();
    eventBus.on("interaction:fit", fitListener);
    eventBus.emit("interaction:fit", {});
    expect(fitListener).toHaveBeenCalledWith({});

    // Test renderer:ready event
    const readyListener = vi.fn();
    eventBus.on("renderer:ready", readyListener);
    eventBus.emit("renderer:ready", {});
    expect(readyListener).toHaveBeenCalledWith({});

    // Test renderer:destroyed event
    const destroyedListener = vi.fn();
    eventBus.on("renderer:destroyed", destroyedListener);
    eventBus.emit("renderer:destroyed", {});
    expect(destroyedListener).toHaveBeenCalledWith({});
  });
});

describe("Scenario: Widget-to-renderer event payloads are typed", () => {
  it("widget_to_renderer_event_payloads_are_typed", () => {
    const eventBus = new EventBus<WidgetToRendererEvents>();

    // Test theme:changed event
    const themeChangeListener = vi.fn();
    eventBus.on("theme:changed", themeChangeListener);
    const theme = {
      mode: "dark" as const,
      colors: {
        background: "#1a1a1a",
        text: "#ffffff",
        grid: "#333333",
        up: "#26a69a",
        down: "#ef5350",
      },
    };
    eventBus.emit("theme:changed", { theme });
    expect(themeChangeListener).toHaveBeenCalledWith({ theme });
  });
});

describe("Scenario: Internal core event payloads are typed", () => {
  it("internal_core_event_payloads_are_typed", () => {
    const eventBus = new EventBus<InternalCoreEvents>();

    // Test bars:historical event
    const barsHistoricalListener = vi.fn();
    eventBus.on("bars:historical", barsHistoricalListener);
    const bars: Bar[] = [
      { time: 1700000000000, open: 100, high: 105, low: 95, close: 102 },
    ];
    eventBus.emit("bars:historical", {
      symbol: "AAPL",
      bars,
      resolution: "1D",
    });
    expect(barsHistoricalListener).toHaveBeenCalledWith({
      symbol: "AAPL",
      bars,
      resolution: "1D",
    });

    // Test bars:realtime event
    const barsRealtimeListener = vi.fn();
    eventBus.on("bars:realtime", barsRealtimeListener);
    const realtimeBar: Bar = {
      time: 1700000001000,
      open: 102,
      high: 107,
      low: 97,
      close: 105,
    };
    eventBus.emit("bars:realtime", {
      symbol: "AAPL",
      bar: realtimeBar,
      resolution: "1D",
    });
    expect(barsRealtimeListener).toHaveBeenCalledWith({
      symbol: "AAPL",
      bar: realtimeBar,
      resolution: "1D",
    });

    // Test state:reset event
    const stateResetListener = vi.fn();
    eventBus.on("state:reset", stateResetListener);
    eventBus.emit("state:reset", {});
    expect(stateResetListener).toHaveBeenCalledWith({});

    // Test subscription:created event
    const subscriptionCreatedListener = vi.fn();
    eventBus.on("subscription:created", subscriptionCreatedListener);
    eventBus.emit("subscription:created", {
      guid: "sub-1",
      symbol: "AAPL",
      resolution: "1D",
    });
    expect(subscriptionCreatedListener).toHaveBeenCalledWith({
      guid: "sub-1",
      symbol: "AAPL",
      resolution: "1D",
    });

    // Test subscription:removed event
    const subscriptionRemovedListener = vi.fn();
    eventBus.on("subscription:removed", subscriptionRemovedListener);
    eventBus.emit("subscription:removed", { guid: "sub-1" });
    expect(subscriptionRemovedListener).toHaveBeenCalledWith({ guid: "sub-1" });

    // Test datafeed:ready event
    const datafeedReadyListener = vi.fn();
    eventBus.on("datafeed:ready", datafeedReadyListener);
    const config: DatafeedConfiguration = {
      supported_resolutions: ["1", "5", "1D"],
    };
    eventBus.emit("datafeed:ready", { configuration: config });
    expect(datafeedReadyListener).toHaveBeenCalledWith({
      configuration: config,
    });

    // Test symbol:error event
    const symbolErrorListener = vi.fn();
    eventBus.on("symbol:error", symbolErrorListener);
    eventBus.emit("symbol:error", {
      symbol: "INVALID",
      reason: "Symbol not found",
    });
    expect(symbolErrorListener).toHaveBeenCalledWith({
      symbol: "INVALID",
      reason: "Symbol not found",
    });
  });
});
