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
