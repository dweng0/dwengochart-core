import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import {
  SafeEventBus,
  ChartStateEvents,
  ChartState,
  SymbolInfo,
  Bar,
  SimpleBarStore,
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
