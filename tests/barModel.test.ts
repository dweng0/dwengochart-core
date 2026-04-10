import { describe, it, expect } from "vitest";
import {
  validateBar,
  Bar,
  SimpleBarStore,
  BarSeriesStore,
  validateSymbolInfo,
  SymbolInfo,
  formatPrice,
} from "../src/index";

describe("Scenario: Create a valid bar", () => {
  it("create_a_valid_bar", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Create a bar without volume", () => {
  it("create_a_bar_without_volume", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(true);
    expect(bar.volume).toBeUndefined();
  });
});

describe("Scenario: Reject a bar where high is less than low", () => {
  it("reject_a_bar_where_high_is_less_than_low", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 90,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("high must be >= low");
  });
});

describe("Scenario: Reject a bar where high is less than open or close", () => {
  it("reject_a_bar_where_high_is_less_than_open_or_close", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 99,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("high must be >= open and close");
  });
});

describe("Scenario: Reject a bar where low is greater than open or close", () => {
  it("reject_a_bar_where_low_is_greater_than_open_or_close", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 101,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("low must be <= open and close");
  });
});

describe("Scenario: Reject a bar with negative time", () => {
  it("reject_a_bar_with_negative_time", () => {
    const bar: Bar = {
      time: -1,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("time must be a positive integer");
  });
});

describe("Scenario: Reject a bar with NaN values", () => {
  it("reject_a_bar_with_nan_values", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: NaN,
      high: 105,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("numeric fields must not be NaN");
  });
});

describe("Scenario: Reject a bar with negative volume", () => {
  it("reject_a_bar_with_negative_volume", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: -5,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("volume must be non-negative");
  });
});

describe("Scenario: Reject a bar with Infinity values", () => {
  it("reject_a_bar_with_infinity_values", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: Infinity,
      high: 105,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("numeric fields must be finite");
  });
});

describe("Scenario: Reject a bar with noninteger timestamp", () => {
  it("reject_a_bar_with_noninteger_timestamp", () => {
    const bar: Bar = {
      time: 1700000000000.5,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("time must be a positive integer");
  });
});

describe("Scenario: Accept a bar with zero price", () => {
  it("accept_a_bar_with_zero_price", () => {
    const bar: Bar = {
      time: 1700000000000,
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      volume: 0,
    };
    const result: any = validateBar(bar);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Add bars in chronological order", () => {
  it("add_bars_in_chronological_order", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const bars: Bar[] = [
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ];
    store.addBars(bars);
    expect(store.getBarCount()).toBe(3);
    const retrieved = store.getBars(1000, 3000);
    expect(retrieved.length).toBe(3);
    expect(retrieved[0].time).toBe(1000);
    expect(retrieved[1].time).toBe(2000);
    expect(retrieved[2].time).toBe(3000);
  });
});

describe("Scenario: Add bars in reverse order", () => {
  it("add_bars_in_reverse_order", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const bars: Bar[] = [
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
    ];
    store.addBars(bars);
    expect(store.getBarCount()).toBe(3);
    const retrieved = store.getBars(1000, 3000);
    expect(retrieved.length).toBe(3);
    expect(retrieved[0].time).toBe(1000);
    expect(retrieved[1].time).toBe(2000);
    expect(retrieved[2].time).toBe(3000);
  });
});

describe("Scenario: Deduplicate bars with the same timestamp", () => {
  it("bar_series_deduplicate_bars_with_the_same_timestamp", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const bars: Bar[] = [
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 2000, open: 105, high: 110, low: 100, close: 108 },
      { time: 3000, open: 108, high: 113, low: 103, close: 110 },
    ];
    store.addBars(bars);
    expect(store.getBarCount()).toBe(3);
    const retrieved = store.getBars(2000, 2000);
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].open).toBe(105);
    expect(retrieved[0].close).toBe(108);
  });
});

describe("Scenario: Merge an update into an existing bar", () => {
  it("merge_an_update_into_an_existing_bar", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([{ time: 1000, open: 100, high: 105, low: 95, close: 100 }]);
    store.addBars([{ time: 1000, open: 100, high: 105, low: 95, close: 105 }]);
    expect(store.getBarCount()).toBe(1);
    const retrieved = store.getBars(1000, 1000);
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].close).toBe(105);
  });
});

describe("Scenario: Retrieve bars within a time range", () => {
  it("retrieve_bars_within_a_time_range", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
      { time: 4000, open: 108, high: 113, low: 103, close: 110 },
      { time: 5000, open: 110, high: 115, low: 105, close: 112 },
    ]);
    const retrieved = store.getBars(2000, 4000);
    expect(retrieved.length).toBe(3);
    expect(retrieved[0].time).toBe(2000);
    expect(retrieved[1].time).toBe(3000);
    expect(retrieved[2].time).toBe(4000);
  });
});

describe("Scenario: Query a range with no matching bars", () => {
  it("query_a_range_with_no_matching_bars", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ]);
    const retrieved = store.getBars(5000, 6000);
    expect(retrieved.length).toBe(0);
  });
});

describe("Scenario: Add an empty array of bars", () => {
  it("add_an_empty_array_of_bars", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const initialCount = store.getBarCount();
    store.addBars([]);
    expect(store.getBarCount()).toBe(initialCount);
  });
});

describe("Scenario: Get the latest bar", () => {
  it("get_the_latest_bar", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ]);
    const latest = store.getLatestBar();
    expect(latest).toBeDefined();
    expect(latest?.time).toBe(3000);
  });
});

describe("Scenario: Get the latest bar from an empty store", () => {
  it("get_the_latest_bar_from_an_empty_store", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const latest = store.getLatestBar();
    expect(latest).toBeUndefined();
  });
});

describe("Scenario: Add a second batch with partial overlap", () => {
  it("add_a_second_batch_with_partial_overlap", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ]);
    store.addBars([
      { time: 2000, open: 105, high: 110, low: 100, close: 108 },
      { time: 3000, open: 108, high: 113, low: 103, close: 110 },
      { time: 4000, open: 110, high: 115, low: 105, close: 112 },
      { time: 5000, open: 112, high: 117, low: 107, close: 115 },
    ]);
    expect(store.getBarCount()).toBe(5);
    const retrieved = store.getBars(1000, 5000);
    expect(retrieved.length).toBe(5);
    expect(retrieved[0].time).toBe(1000);
    expect(retrieved[1].time).toBe(2000);
    expect(retrieved[4].time).toBe(5000);
  });
});

describe("Scenario: Clear the store", () => {
  it("clear_the_store", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ]);
    store.clear();
    expect(store.getBarCount()).toBe(0);
  });
});

describe("Scenario: Handle a large dataset", () => {
  it("handle_a_large_dataset", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    const barCount = 100000;
    const bars: Bar[] = [];
    const baseTime = 1000000000000;

    // Generate 100000 bars with sequential timestamps
    for (let i = 0; i < barCount; i++) {
      bars.push({
        time: baseTime + i * 60000, // 1-minute bars
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
      });
    }

    const startTime = performance.now();
    store.addBars(bars);
    const addTime = performance.now() - startTime;

    expect(store.getBarCount()).toBe(barCount);

    // Test retrieval of a 1000-bar window
    const retrievalStart = performance.now();
    const retrieved = store.getBars(
      baseTime + 50000 * 60000,
      baseTime + 51000 * 60000,
    );
    const retrievalTime = performance.now() - retrievalStart;

    expect(retrieved.length).toBe(1001); // inclusive range
    expect(retrievalTime).toBeLessThan(50);
  });
});

describe("Scenario: Enforce maximum capacity", () => {
  it("enforce_maximum_capacity", () => {
    const maxCapacity = 10000;
    const store: BarSeriesStore = new SimpleBarStore({ maxCapacity });
    const baseTime = 1000000000000;

    // Add 10000 bars to fill the store
    const initialBars: Bar[] = [];
    for (let i = 0; i < maxCapacity; i++) {
      initialBars.push({
        time: baseTime + i * 60000,
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
      });
    }
    store.addBars(initialBars);
    expect(store.getBarCount()).toBe(maxCapacity);

    // Add 100 new bars with later timestamps
    const newBars: Bar[] = [];
    for (let i = 0; i < 100; i++) {
      newBars.push({
        time: baseTime + (maxCapacity + i) * 60000,
        open: 200 + i,
        high: 205 + i,
        low: 195 + i,
        close: 202 + i,
      });
    }
    store.addBars(newBars);

    // Store should still contain exactly maxCapacity bars
    expect(store.getBarCount()).toBe(maxCapacity);

    // The 100 oldest bars should have been evicted
    // First bar should now be at index 100 (time baseTime + 100 * 60000)
    const allBars = store.getBars(
      baseTime,
      baseTime + (maxCapacity + 99) * 60000,
    );
    expect(allBars[0].time).toBe(baseTime + 100 * 60000);
    expect(allBars[allBars.length - 1].time).toBe(
      baseTime + (maxCapacity + 99) * 60000,
    );
  });
});

describe("Scenario: Get the bar count", () => {
  it("get_the_bar_count", () => {
    const store: BarSeriesStore = new SimpleBarStore();
    store.addBars([
      { time: 1000, open: 100, high: 105, low: 95, close: 102 },
      { time: 2000, open: 102, high: 107, low: 97, close: 105 },
      { time: 3000, open: 105, high: 110, low: 100, close: 108 },
    ]);
    const count = store.getBarCount();
    expect(count).toBe(3);
  });
});

describe("Scenario: Create a valid symbol info", () => {
  it("create_a_valid_symbol_info", () => {
    const symbolInfo: SymbolInfo = {
      name: "AAPL",
      description: "Apple Inc",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0930-1600",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Create a crypto symbol with fractional pricing", () => {
  it("create_a_crypto_symbol_with_fractional_pricing", () => {
    const symbolInfo: SymbolInfo = {
      name: "BTCUSD",
      exchange: "CRYPTO",
      type: "crypto",
      timezone: "UTC",
      session: "24x7",
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Reject symbol info with missing required name", () => {
  it("reject_symbol_info_with_missing_required_name", () => {
    const symbolInfo: any = {
      exchange: "TEST",
      type: "stock",
      timezone: "UTC",
      session: "0930-1600",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("name is required");
  });
});

describe("Scenario: Reject symbol info with invalid pricescale", () => {
  it("reject_symbol_info_with_invalid_pricescale", () => {
    const symbolInfo: any = {
      name: "TEST",
      exchange: "TEST",
      type: "stock",
      timezone: "UTC",
      session: "0930-1600",
      minmov: 1,
      pricescale: 0,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("pricescale must be a positive integer");
  });
});

describe("Scenario: Reject symbol info with invalid session format", () => {
  it("reject_symbol_info_with_invalid_session_format", () => {
    const symbolInfo: any = {
      name: "TEST",
      exchange: "TEST",
      type: "stock",
      timezone: "UTC",
      session: "invalid",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid session format");
  });
});

describe("Scenario: Accept a 24x7 session format for crypto", () => {
  it("accept_a_24x7_session_format_for_crypto", () => {
    const symbolInfo: SymbolInfo = {
      name: "BTCUSD",
      exchange: "CRYPTO",
      type: "crypto",
      timezone: "UTC",
      session: "24x7",
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Accept a multi-segment session format", () => {
  it("accept_a_multisegment_session_format", () => {
    const symbolInfo: SymbolInfo = {
      name: "AAPL",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0400-0930,0930-1600,1600-2000",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
  });
});

describe("Scenario: Symbol info includes supported resolutions", () => {
  it("symbol_info_includes_supported_resolutions", () => {
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
      supported_resolutions: ["1", "5", "15", "60", "1D", "1W"],
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
    expect(symbolInfo.supported_resolutions).toEqual([
      "1",
      "5",
      "15",
      "60",
      "1D",
      "1W",
    ]);
  });
});

describe("Scenario: Symbol info includes currency code", () => {
  it("symbol_info_includes_currency_code", () => {
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
      currency_code: "USD",
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
    expect(symbolInfo.currency_code).toBe("USD");
  });
});

describe("Scenario: Symbol info includes data capability flags", () => {
  it("symbol_info_includes_data_capability_flags", () => {
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
      has_daily: true,
      has_weekly_and_monthly: true,
    };
    const result: any = validateSymbolInfo(symbolInfo);
    expect(result.valid).toBe(true);
    expect(symbolInfo.has_daily).toBe(true);
    expect(symbolInfo.has_weekly_and_monthly).toBe(true);
  });
});

describe("Scenario: Format a price with euro currency", () => {
  it("format_a_price_with_euro_currency", () => {
    const result = formatPrice(10250, 100, "EUR");
    expect(result).toBe("€102.50");
  });
});

describe("Scenario: Format a very large price", () => {
  it("format_a_very_large_price", () => {
    // Given a symbol with pricescale 100
    // When price 10000050 is formatted
    const result = formatPrice(10000050, 100);
    // Then the result should be "100,000.50"
    expect(result).toBe("100,000.50");
  });
});
