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

describe("Scenario: Remove all subscriptions on symbol change", () => {
  it("remove_all_subscriptions_on_symbol_change", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const subscriptionManager = new SubscriptionManager(eventBus);

    // Create active subscriptions for AAPL
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");
    subscriptionManager.createSubscription("sub_2", "AAPL", "5");

    const eventCallback = vi.fn();
    eventBus.on("subscription:removed", eventCallback);

    // Remove all subscriptions for AAPL (simulating symbol change)
    subscriptionManager.removeSubscriptionsBySymbol("AAPL");

    // Verify subscriptions are no longer tracked
    expect(subscriptionManager.hasSubscription("sub_1")).toBe(false);
    expect(subscriptionManager.hasSubscription("sub_2")).toBe(false);

    // Verify subscription:removed events were emitted for each
    expect(eventCallback).toHaveBeenCalledTimes(2);
  });
});

describe("Scenario: Ignore updates for removed subscriptions", () => {
  it("ignore_updates_for_removed_subscriptions", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const barStore = new SimpleBarStore();
    const subscriptionManager = new SubscriptionManager(eventBus);

    // Create and then remove a subscription
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");
    subscriptionManager.removeSubscription("sub_1");

    const seriesDataCallback = vi.fn();
    eventBus.on("series:data", seriesDataCallback);

    // Simulate datafeed delivering a bar for the removed subscription
    const newBar: Bar = {
      time: 1700000000000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
    };
    subscriptionManager.handleRealtimeBar("sub_1", newBar, barStore);

    // Verify bar was NOT added to the store
    expect(barStore.getBarCount()).toBe(0);

    // Verify no series:data event was emitted
    expect(seriesDataCallback).not.toHaveBeenCalled();
  });
});

describe("Scenario: Handle duplicate subscription creation", () => {
  it("handle_duplicate_subscription_creation", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const subscriptionManager = new SubscriptionManager(eventBus);

    const createdCallback = vi.fn();
    const removedCallback = vi.fn();
    eventBus.on("subscription:created", createdCallback);
    eventBus.on("subscription:removed", removedCallback);

    // Create initial subscription
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");
    expect(subscriptionManager.hasSubscription("sub_1")).toBe(true);

    // Create another subscription with the same guid
    subscriptionManager.createSubscription("sub_1", "GOOG", "5");

    // Verify only one subscription exists
    expect(subscriptionManager.hasSubscription("sub_1")).toBe(true);
    const sub = subscriptionManager.getSubscription("sub_1");
    expect(sub?.symbol).toBe("GOOG");
    expect(sub?.resolution).toBe("5");

    // Verify events were emitted
    expect(createdCallback).toHaveBeenCalledTimes(2);
    expect(removedCallback).toHaveBeenCalledTimes(1);
  });
});

describe("Scenario: Remove all subscriptions on resolution change", () => {
  it("remove_all_subscriptions_on_resolution_change", () => {
    const eventBus = new EventBus<ChartStateEvents>();
    const subscriptionManager = new SubscriptionManager(eventBus);

    // Create active subscriptions for resolution "1"
    subscriptionManager.createSubscription("sub_1", "AAPL", "1");
    subscriptionManager.createSubscription("sub_2", "GOOG", "1");
    subscriptionManager.createSubscription("sub_3", "MSFT", "5");

    const eventCallback = vi.fn();
    eventBus.on("subscription:removed", eventCallback);

    // Remove all subscriptions for resolution "1" (simulating resolution change)
    subscriptionManager.removeSubscriptionsByResolution("1");

    // Verify subscriptions for resolution "1" are removed
    expect(subscriptionManager.hasSubscription("sub_1")).toBe(false);
    expect(subscriptionManager.hasSubscription("sub_2")).toBe(false);

    // Verify subscription for resolution "5" still exists
    expect(subscriptionManager.hasSubscription("sub_3")).toBe(true);

    // Verify subscription:removed events were emitted for each removed subscription
    expect(eventCallback).toHaveBeenCalledTimes(2);
  });
});
