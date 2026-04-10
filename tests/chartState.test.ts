import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import { ChartState, SymbolInfo, SimpleBarStore } from "../src/index";

interface ChartEvents {
  "symbol:resolved": { symbol: SymbolInfo };
  "viewport:changed": { range?: { from: number; to: number } };
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
