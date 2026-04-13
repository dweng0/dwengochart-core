import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import {
  ChartState,
  SymbolInfo,
  ChartStateEvents,
  SubscriptionManager,
  Bar,
  SimpleBarStore,
} from "../src/index";

describe("Scenario: Create a subscription", () => {
  it("create_a_subscription", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const subscriptionManager = new SubscriptionManager(eventBus);

    const eventCallback = vi.fn();
    eventBus.on("subscription:created", eventCallback);

    subscriptionManager.createSubscription("sub_1", "AAPL", "1");

    expect(subscriptionManager.hasSubscription("sub_1")).toBe(true);
    expect(eventCallback).toHaveBeenCalledTimes(1);
    expect(eventCallback.mock.calls[0][0]).toEqual({
      guid: "sub_1",
      symbol: "AAPL",
      resolution: "1",
    });
  });
});

describe("Scenario: Receive a real-time bar update", () => {
  it("receive_a_realtime_bar_update", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const barStore = new SimpleBarStore();
    const subscriptionManager = new SubscriptionManager(eventBus);

    // Create an active subscription
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");

    // Map series "candles" to this subscription
    subscriptionManager.mapSeriesToSubscription("candles", "sub_1");

    const seriesDataCallback = vi.fn();
    eventBus.on("series:data", seriesDataCallback);

    // Simulate datafeed delivering a new bar
    const newBar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
    };
    subscriptionManager.handleRealtimeBar("sub_1", newBar, barStore);

    // Verify bar was merged into the store
    const bars = barStore.getBars(1700000000000, 1700000000000);
    expect(bars.length).toBe(1);
    expect(bars[0].close).toBe(102);

    // Verify series:data event was emitted
    expect(seriesDataCallback).toHaveBeenCalledTimes(1);
    expect(seriesDataCallback.mock.calls[0][0]).toEqual({
      seriesId: "candles",
      bars: [newBar],
    });
  });
});

describe("Scenario: Remove a subscription", () => {
  it("remove_a_subscription", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const subscriptionManager = new SubscriptionManager(eventBus);

    // Create an active subscription
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");

    const eventCallback = vi.fn();
    eventBus.on("subscription:removed", eventCallback);

    // Remove the subscription
    subscriptionManager.removeSubscription("sub_1");

    // Verify subscription is no longer tracked
    expect(subscriptionManager.hasSubscription("sub_1")).toBe(false);

    // Verify subscription:removed event was emitted
    expect(eventCallback).toHaveBeenCalledTimes(1);
    expect(eventCallback.mock.calls[0][0]).toEqual({ guid: "sub_1" });
  });
});
