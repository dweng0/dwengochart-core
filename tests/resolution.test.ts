import { describe, it, expect } from "vitest";
import { parseResolution, resolutionToMilliseconds } from "../src/index";

describe("Scenario: Parse standard intraday resolutions", () => {
  it("parse_standard_intraday_resolutions", () => {
    const resolutions = ["1", "5", "15", "30", "60"];
    const expectedMinutes = [1, 5, 15, 30, 60];

    resolutions.forEach((resolution, index) => {
      const result = parseResolution(resolution);
      expect(result.type).toBe("minutes");
      expect(result.value).toBe(expectedMinutes[index]);
    });
  });
});

describe("Scenario: Parse daily resolution", () => {
  it("parse_daily_resolution", () => {
    const result = parseResolution("1D");
    expect(result.type).toBe("days");
    expect(result.value).toBe(1);
  });
});

describe("Scenario: Parse weekly resolution", () => {
  it("parse_weekly_resolution", () => {
    const result = parseResolution("1W");
    expect(result.type).toBe("weeks");
    expect(result.value).toBe(1);
  });
});

describe("Scenario: Parse monthly resolution", () => {
  it("parse_monthly_resolution", () => {
    const result = parseResolution("1M");
    expect(result.type).toBe("months");
    expect(result.value).toBe(1);
  });
});

describe("Scenario: Reject invalid resolution string", () => {
  it("reject_invalid_resolution_string", () => {
    expect(() => parseResolution("abc")).toThrow("invalid resolution format");
  });
});

describe("Scenario: Reject negative resolution", () => {
  it("reject_negative_resolution", () => {
    expect(() => parseResolution("-5")).toThrow("resolution must be positive");
  });
});

describe("Scenario: Parse multi-unit resolutions", () => {
  it("parse_multi_unit_resolutions", () => {
    const result2D = parseResolution("2D");
    expect(result2D.type).toBe("days");
    expect(result2D.value).toBe(2);

    const result4H = parseResolution("4H");
    expect(result4H.type).toBe("hours");
    expect(result4H.value).toBe(4);

    const result3M = parseResolution("3M");
    expect(result3M.type).toBe("months");
    expect(result3M.value).toBe(3);

    const result2W = parseResolution("2W");
    expect(result2W.type).toBe("weeks");
    expect(result2W.value).toBe(2);
  });
});

describe("Scenario: Parse seconds resolutions", () => {
  it("parse_seconds_resolutions", () => {
    const resolutions = ["1S", "5S", "30S"];
    const expectedSeconds = [1, 5, 30];

    resolutions.forEach((resolution, index) => {
      const result = parseResolution(resolution);
      expect(result.type).toBe("seconds");
      expect(result.value).toBe(expectedSeconds[index]);
    });
  });
});

describe("Scenario: Resolution equivalence", () => {
  it("resolution_equivalence", () => {
    const result60 = parseResolution("60");
    const result1H = parseResolution("1H");

    // Both should represent 60 minutes / 1 hour
    expect(result60.type).toBe("minutes");
    expect(result60.value).toBe(60);
    expect(result1H.type).toBe("hours");
    expect(result1H.value).toBe(1);

    // Convert both to milliseconds and compare
    const ms60 = resolutionToMilliseconds("60");
    const ms1H = resolutionToMilliseconds("1H");
    expect(ms60).toBe(ms1H);
  });
});

describe("Scenario: Convert resolution to milliseconds", () => {
  it("convert_resolution_to_milliseconds", () => {
    const result = resolutionToMilliseconds("1D");
    // 1 day = 24 * 60 * 60 * 1000 = 86400000 ms
    expect(result).toBe(86400000);
  });
});

describe("Scenario: Convert intraday resolution to milliseconds", () => {
  it("convert_intraday_resolution_to_milliseconds", () => {
    const result = resolutionToMilliseconds("5");
    // 5 minutes = 5 * 60 * 1000 = 300000 ms
    expect(result).toBe(300000);
  });
});
