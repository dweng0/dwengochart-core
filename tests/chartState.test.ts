import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import { ChartState, SymbolInfo, SimpleBarStore, Bar } from "../src/index";

interface ChartEvents {
  "symbol:resolved": { symbol: SymbolInfo };
  "viewport:changed": {
    range?: { from: number; to: number };
    timeRange?: [number, number];
    priceRange?: [number, number];
    priceScale?: "linear" | "logarithmic" | "percentage";
    basePrice?: number;
  };
  "state:reset": undefined;
  "series:data": { seriesId: string; bars: any[] };
  "chart:loading": boolean;
  "chart:error": string | null;
  "series:add": { id: string; type: string; options?: Record<string, unknown> };
  "series:remove": { id: string };
  "series:update": { id: string; options: Record<string, unknown> };
  "series:show": { id: string };
  "series:hide": { id: string };
  "series:type": { id: string; type: string };
  "series:order": { ids: string[] };
}

describe("Scenario: Set the active symbol", () => {
  it("set_the_active_symbol", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

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

    const eventCallback = vi.fn();
    eventBus.on("symbol:resolved", eventCallback);

    chartState.setSymbol(symbolInfo, "1D");

    expect(chartState.getSymbol()).toBe("AAPL");
    expect(chartState.getResolution()).toBe("1D");
    expect(eventCallback).toHaveBeenCalledTimes(1);
    expect(eventCallback.mock.calls[0][0].symbol.name).toBe("AAPL");
  });
});

describe("Scenario: Change resolution", () => {
  it("change_resolution", () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

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

    // Set initial symbol and resolution
    chartState.setSymbol(symbolInfo, "1D");

    // Add some bars to the store
    barStore.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
    ]);

    expect(barStore.getBarCount()).toBe(2);

    const viewportCallback = vi.fn();
    eventBus.on("viewport:changed", viewportCallback);

    // Change resolution
    chartState.setResolution("1H");

    expect(chartState.getResolution()).toBe("1H");
    expect(barStore.getBarCount()).toBe(0);
    expect(viewportCallback).toHaveBeenCalledTimes(1);
  });
});

describe("Scenario: Reset state", () => {
  it("reset_state", () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

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

    // Set initial symbol and add bars
    chartState.setSymbol(symbolInfo, "1D");
    barStore.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
    ]);

    expect(chartState.getSymbol()).toBe("AAPL");
    expect(barStore.getBarCount()).toBe(1);

    const resetCallback = vi.fn();
    eventBus.on("state:reset", resetCallback);

    // Reset the state
    chartState.reset();

    expect(chartState.getSymbol()).toBeUndefined();
    expect(chartState.getResolution()).toBeUndefined();
    expect(barStore.getBarCount()).toBe(0);
    expect(resetCallback).toHaveBeenCalledTimes(1);
  });
});

describe("Scenario: Change resolution without an active symbol", () => {
  it("change_resolution_without_an_active_symbol", () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

    // Add some bars to the store (simulating pre-loaded data without a symbol)
    barStore.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
    ]);

    expect(chartState.getSymbol()).toBeUndefined();
    expect(barStore.getBarCount()).toBe(2);

    const viewportCallback = vi.fn();
    eventBus.on("viewport:changed", viewportCallback);

    // Change resolution without a symbol set
    chartState.setResolution("1H");

    expect(chartState.getResolution()).toBe("1H");
    expect(barStore.getBarCount()).toBe(2); // Bar store should NOT be cleared
    expect(viewportCallback).toHaveBeenCalledTimes(1);
  });
});

describe("Scenario: Serialize chart state", () => {
  it("serialize_chart_state", () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

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

    // Set symbol and resolution
    chartState.setSymbol(symbolInfo, "1D");

    // Serialize the state
    const serialized = chartState.serialize();

    expect(serialized.symbol).toBe("AAPL");
    expect(serialized.resolution).toBe("1D");
    expect(serialized.series).toEqual([]);
    expect(serialized.viewport.range).toBeUndefined();
    expect(serialized.viewport.priceRange).toBeUndefined();
    expect(serialized.viewport.scale).toBe("linear");
  });
});

describe("Scenario: Deserialize chart state", () => {
  it("deserialize_chart_state", () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

    const serializedState = {
      symbol: "AAPL",
      resolution: "1D",
      series: [
        { id: "candles", type: "candlestick", options: {} },
        { id: "ma20", type: "line", options: { color: "orange" } },
      ],
      viewport: {
        range: { from: 1000, to: 5000 },
        priceRange: { min: 90, max: 110 },
        scale: "linear" as const,
      },
    };

    const symbolCallback = vi.fn();
    const viewportCallback = vi.fn();
    eventBus.on("symbol:resolved", symbolCallback);
    eventBus.on("viewport:changed", viewportCallback);

    // Deserialize the state
    chartState.deserialize(serializedState);

    expect(chartState.getSymbol()).toBe("AAPL");
    expect(chartState.getResolution()).toBe("1D");
    expect(symbolCallback).toHaveBeenCalledTimes(1);
    expect(viewportCallback).toHaveBeenCalledTimes(1);
  });
});

describe("Scenario: Concurrent symbol changes discard stale resolution", () => {
  it("concurrent_symbol_changes_discard_stale_resolution", async () => {
    const eventBus = new EventBus<ChartEvents>();
    const barStore = new SimpleBarStore();
    const chartState = new ChartState({ eventBus, barStore });

    const aaplSymbol: SymbolInfo = {
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

    const googSymbol: SymbolInfo = {
      name: "GOOG",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0930-1600",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };

    const symbolCallback = vi.fn();
    eventBus.on("symbol:resolved", symbolCallback);

    // Start resolving AAPL (returns a request ID)
    const requestId1 = chartState.beginSymbolResolution("AAPL", "1D");

    // Before AAPL resolves, start resolving GOOG
    const requestId2 = chartState.beginSymbolResolution("GOOG", "1H");

    // Simulate AAPL resolution completing (should be discarded)
    chartState.completeSymbolResolution(requestId1, aaplSymbol);

    // State should still be undefined because AAPL was stale
    expect(chartState.getSymbol()).toBeUndefined();

    // Simulate GOOG resolution completing (should be accepted)
    chartState.completeSymbolResolution(requestId2, googSymbol);

    // State should now reflect GOOG
    expect(chartState.getSymbol()).toBe("GOOG");
    expect(chartState.getResolution()).toBe("1H");

    // Only one symbol:resolved event should have been emitted (for GOOG)
    expect(symbolCallback).toHaveBeenCalledTimes(1);
    expect(symbolCallback.mock.calls[0][0].symbol.name).toBe("GOOG");
  });
});

describe("Scenario: Add a series", () => {
  it("add_a_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    const addCallback = vi.fn();
    eventBus.on("series:add", addCallback);

    // Add a series
    chartState.addSeries("candles", "candlestick", {});

    // Verify the series is tracked (via serialize)
    const serialized = chartState.serialize();
    expect(serialized.series).toHaveLength(1);
    expect(serialized.series[0].id).toBe("candles");
    expect(serialized.series[0].type).toBe("candlestick");

    // Verify the event was emitted
    expect(addCallback).toHaveBeenCalledTimes(1);
    expect(addCallback.mock.calls[0][0]).toEqual({
      id: "candles",
      type: "candlestick",
      options: {},
    });
  });
});

describe("Scenario: Add multiple series", () => {
  it("add_multiple_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    const addCallback = vi.fn();
    eventBus.on("series:add", addCallback);

    // Add multiple series
    chartState.addSeries("candles", "candlestick");
    chartState.addSeries("ma20", "line", { color: "orange" });

    // Verify both series are tracked
    const serialized = chartState.serialize();
    expect(serialized.series).toHaveLength(2);
    expect(serialized.series[0].id).toBe("candles");
    expect(serialized.series[0].type).toBe("candlestick");
    expect(serialized.series[1].id).toBe("ma20");
    expect(serialized.series[1].type).toBe("line");

    // Verify events were emitted for each
    expect(addCallback).toHaveBeenCalledTimes(2);
    expect(addCallback.mock.calls[0][0]).toEqual({
      id: "candles",
      type: "candlestick",
      options: undefined,
    });
    expect(addCallback.mock.calls[1][0]).toEqual({
      id: "ma20",
      type: "line",
      options: { color: "orange" },
    });
  });
});

describe("Scenario: Remove a series", () => {
  it("remove_a_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series first
    chartState.addSeries("candles", "candlestick");

    const removeCallback = vi.fn();
    eventBus.on("series:remove", removeCallback);

    // Remove the series
    chartState.removeSeries("candles");

    // Verify the series is no longer tracked
    const serialized = chartState.serialize();
    expect(serialized.series).toHaveLength(0);

    // Verify the event was emitted
    expect(removeCallback).toHaveBeenCalledTimes(1);
    expect(removeCallback.mock.calls[0][0]).toEqual({ id: "candles" });
  });
});

describe("Scenario: Remove a nonexistent series is a no-op", () => {
  it("remove_a_nonexistent_series_is_a_no_op", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    const removeCallback = vi.fn();
    eventBus.on("series:remove", removeCallback);

    // Try to remove a series that doesn't exist
    chartState.removeSeries("nonexistent");

    // Verify no error was thrown (test would fail if exception occurred)
    // Verify no event was emitted
    expect(removeCallback).toHaveBeenCalledTimes(0);
  });
});

describe("Scenario: Update series options", () => {
  it("update_series_options", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series with initial options
    chartState.addSeries("line1", "line", { color: "blue" });

    const updateCallback = vi.fn();
    eventBus.on("series:update", updateCallback);

    // Update the options
    chartState.updateSeriesOptions("line1", { color: "red" });

    // Verify the options were updated
    const serialized = chartState.serialize();
    expect(serialized.series[0].options).toEqual({ color: "red" });

    // Verify the event was emitted
    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateCallback.mock.calls[0][0]).toEqual({
      id: "line1",
      options: { color: "red" },
    });
  });
});

describe("Scenario: Show a hidden series", () => {
  it("show_a_hidden_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series and hide it
    chartState.addSeries("s1", "line");
    chartState.hideSeries("s1");

    const showCallback = vi.fn();
    eventBus.on("series:show", showCallback);

    // Show the series
    chartState.showSeries("s1");

    // Verify the event was emitted
    expect(showCallback).toHaveBeenCalledTimes(1);
    expect(showCallback.mock.calls[0][0]).toEqual({ id: "s1" });
  });
});

describe("Scenario: Hide a visible series", () => {
  it("hide_a_visible_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series (visible by default)
    chartState.addSeries("s1", "line");

    const hideCallback = vi.fn();
    eventBus.on("series:hide", hideCallback);

    // Hide the series
    chartState.hideSeries("s1");

    // Verify the event was emitted
    expect(hideCallback).toHaveBeenCalledTimes(1);
    expect(hideCallback.mock.calls[0][0]).toEqual({ id: "s1" });
  });
});

describe("Scenario: Change series type", () => {
  it("change_series_type", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series with type "line"
    chartState.addSeries("s1", "line");

    const typeCallback = vi.fn();
    eventBus.on("series:type", typeCallback);

    // Change the type to "area"
    chartState.changeSeriesType("s1", "area");

    // Verify the type was changed
    const serialized = chartState.serialize();
    expect(serialized.series[0].type).toBe("area");

    // Verify the event was emitted
    expect(typeCallback).toHaveBeenCalledTimes(1);
    expect(typeCallback.mock.calls[0][0]).toEqual({ id: "s1", type: "area" });
  });
});

describe("Scenario: Change series type to same value is a no-op", () => {
  it("change_series_type_to_same_value_is_a_no_op", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series with type "candlestick"
    chartState.addSeries("s1", "candlestick");

    const typeCallback = vi.fn();
    eventBus.on("series:type", typeCallback);

    // Try to change to the same type
    chartState.changeSeriesType("s1", "candlestick");

    // Verify no event was emitted
    expect(typeCallback).toHaveBeenCalledTimes(0);
  });
});

describe("Scenario: Reorder series", () => {
  it("reorder_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add series in order s1, s2, s3
    chartState.addSeries("s1", "line");
    chartState.addSeries("s2", "line");
    chartState.addSeries("s3", "line");

    const orderCallback = vi.fn();
    eventBus.on("series:order", orderCallback);

    // Reorder to s3, s1, s2
    chartState.reorderSeries(["s3", "s1", "s2"]);

    // Verify the order was changed
    const serialized = chartState.serialize();
    expect(serialized.series[0].id).toBe("s3");
    expect(serialized.series[1].id).toBe("s1");
    expect(serialized.series[2].id).toBe("s2");

    // Verify the event was emitted
    expect(orderCallback).toHaveBeenCalledTimes(1);
    expect(orderCallback.mock.calls[0][0]).toEqual({ ids: ["s3", "s1", "s2"] });
  });
});

describe("Scenario: Emit series:data when bars are loaded for a series", () => {
  it("emit_seriesdata_when_bars_are_loaded_for_a_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series
    chartState.addSeries("candles", "candlestick");

    const dataCallback = vi.fn();
    eventBus.on("series:data", dataCallback);

    // Load bars for the series
    const bars: Bar[] = [
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
    ];
    chartState.loadSeriesBars("candles", bars);

    // Verify the event was emitted with the bars
    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback.mock.calls[0][0]).toEqual({
      seriesId: "candles",
      bars: bars,
    });
  });
});

describe("Scenario: Each series has its own bar store", () => {
  it("each_series_has_its_own_bar_store", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add two series
    chartState.addSeries("candles", "candlestick");
    chartState.addSeries("ma20", "line");

    const dataCallback = vi.fn();
    eventBus.on("series:data", dataCallback);

    // Load bars for "candles" only
    const bars: Bar[] = [
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
    ];
    chartState.loadSeriesBars("candles", bars);

    // Verify only one event was emitted (for "candles")
    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback.mock.calls[0][0].seriesId).toBe("candles");

    // Verify "ma20" bar store is empty
    const ma20Store = chartState.getSeriesBarStore("ma20");
    expect(ma20Store?.getBarCount()).toBe(0);

    // Verify "candles" bar store has the bars
    const candlesStore = chartState.getSeriesBarStore("candles");
    expect(candlesStore?.getBarCount()).toBe(1);
  });
});

describe("Scenario: Emit series:data when a real-time bar updates a series", () => {
  it("emit_series_data_when_a_real_time_bar_updates_a_series", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Add a series and load initial bars
    chartState.addSeries("candles", "candlestick");
    const initialBars: Bar[] = [
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
    ];
    chartState.loadSeriesBars("candles", initialBars);

    const dataCallback = vi.fn();
    eventBus.on("series:data", dataCallback);

    // Add a real-time bar
    const realtimeBar: Bar = {
      time: 3000,
      open: 105,
      high: 110,
      low: 100,
      close: 108,
    };
    chartState.addSeriesBar("candles", realtimeBar);

    // Verify the event was emitted with all bars (including the new one)
    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback.mock.calls[0][0].seriesId).toBe("candles");
    expect(dataCallback.mock.calls[0][0].bars).toHaveLength(3);
    expect(dataCallback.mock.calls[0][0].bars[2]).toEqual(realtimeBar);
  });
});

describe("Scenario: Set the visible range", () => {
  it("set_the_visible_range", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    const viewportCallback = vi.fn();
    eventBus.on("viewport:changed", viewportCallback);

    // Set the visible range
    chartState.setVisibleRange([1000, 5000], [50, 150]);

    // Verify the viewport was set (via serialize)
    const serialized = chartState.serialize();
    expect(serialized.viewport.range).toEqual({ from: 1000, to: 5000 });
    expect(serialized.viewport.priceRange).toEqual({ min: 50, max: 150 });

    // Verify the event was emitted with the correct payload
    expect(viewportCallback).toHaveBeenCalledTimes(1);
    expect(viewportCallback.mock.calls[0][0]).toEqual({
      timeRange: [1000, 5000],
      priceRange: [50, 150],
    });
  });
});

describe("Scenario: Pan the viewport", () => {
  it("pan_the_viewport", () => {
    const eventBus = new EventBus<ChartEvents>();
    const chartState = new ChartState({ eventBus });

    // Set initial visible range
    chartState.setVisibleRange([1000, 5000], [50, 150]);

    const viewportCallback = vi.fn();
    eventBus.on("viewport:changed", viewportCallback);

    // Pan the viewport by delta -1000
    chartState.panViewport(-1000);

    // Verify the viewport was panned (via serialize)
    const serialized = chartState.serialize();
    expect(serialized.viewport.range).toEqual({ from: 0, to: 4000 });

    // Verify the event was emitted
    expect(viewportCallback).toHaveBeenCalledTimes(1);
  });
});
