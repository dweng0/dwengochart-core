import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@yatamazuki/typed-eventbus";
import {
  ChartState,
  SymbolInfo,
  ChartStateEvents,
  SubscriptionManager,
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
