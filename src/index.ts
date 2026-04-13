// @dwengochart/core
// Framework-agnostic financial chart state management

import { EventBus } from "@yatamazuki/typed-eventbus";

/**
 * OHLCV Bar data structure
 */
export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Validation error for a Bar
 */
export interface BarValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a Bar according to OHLCV rules:
 * - time must be a positive integer
 * - open, high, low, close must be finite numbers
 * - volume must be non-negative if provided
 * - high must be >= low
 * - high must be >= open and close
 * - low must be <= open and close
 * - numeric fields must not be NaN
 */
export function validateBar(bar: Bar): BarValidationResult {
  // Check time is a positive integer
  if (!Number.isInteger(bar.time) || bar.time <= 0) {
    return { valid: false, error: "time must be a positive integer" };
  }

  // Check for NaN in numeric fields
  const numericFields: (keyof Bar)[] = ["open", "high", "low", "close"];
  for (const field of numericFields) {
    if (Number.isNaN(bar[field])) {
      return { valid: false, error: "numeric fields must not be NaN" };
    }
  }

  // Check for Infinity in numeric fields
  for (const field of numericFields) {
    if (!Number.isFinite(bar[field])) {
      return { valid: false, error: "numeric fields must be finite" };
    }
  }

  // Check volume is non-negative if provided
  if (bar.volume !== undefined) {
    if (bar.volume < 0 || !Number.isInteger(bar.volume)) {
      return { valid: false, error: "volume must be non-negative" };
    }
  }

  // Check high >= low
  if (bar.high < bar.low) {
    return { valid: false, error: "high must be >= low" };
  }

  // Check high >= open and close
  if (bar.high < bar.open || bar.high < bar.close) {
    return { valid: false, error: "high must be >= open and close" };
  }

  // Check low <= open and close
  if (bar.low > bar.open || bar.low > bar.close) {
    return { valid: false, error: "low must be <= open and close" };
  }

  return { valid: true };
}

/**
 * Datafeed Configuration
 */
export interface DatafeedConfiguration {
  supported_resolutions: string[];
  exchanges?: string[];
  symbols_types?: string[];
}

/**
 * GetBars response
 */
export interface GetBarsResponse {
  bars: Bar[];
  noData: boolean;
  nextTime?: number;
}

/**
 * GetBars options
 */
export interface GetBarsOptions {
  countBack?: number;
  firstDataRequest?: boolean;
}

/**
 * Search result for symbols
 */
export interface SearchSymbolResult {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
}

/**
 * Datafeed callbacks
 */
export interface DatafeedCallbacks {
  onReady: (config: DatafeedConfiguration) => void;
  onError: (reason: string) => void;
  onResolve: (symbolInfo: SymbolInfo) => void;
  onHistory: (bars: Bar[], noData: boolean, nextTime?: number) => void;
  onRealtime: (bar: Bar) => void;
}

/**
 * Datafeed interface matching TradingView's IBasicDataFeed
 */
export interface IDatafeed {
  onReady(callback: (config: DatafeedConfiguration) => void): void;
  resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: SymbolInfo) => void,
    onError: (reason: string) => void,
  ): void;
  getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    from: number,
    to: number,
    onHistory: (bars: Bar[], noData: boolean, nextTime?: number) => void,
    onError: (reason: string) => void,
    firstDataRequest?: boolean,
  ): void;
  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtime: (bar: Bar) => void,
    onReset: () => void,
  ): void;
  unsubscribeBars(listenerId: string): void;
  searchSymbols(
    userInput: string,
    onResult: (results: SearchSymbolResult[]) => void,
  ): void;
}

/**
 * Simple in-memory datafeed implementation for testing
 */
export class SimpleDatafeed implements IDatafeed {
  private symbols: Map<string, SymbolInfo> = new Map();
  private bars: Map<string, Bar[]> = new Map();
  private listeners: Map<string, (bar: Bar) => void> = new Map();
  private listenerCounter = 0;

  addSymbol(symbolInfo: SymbolInfo): void {
    this.symbols.set(symbolInfo.name, symbolInfo);
  }

  addBars(symbolName: string, bars: Bar[]): void {
    this.bars.set(symbolName, bars);
  }

  onReady(callback: (config: DatafeedConfiguration) => void): void {
    callback({
      supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
    });
  }

  resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: SymbolInfo) => void,
    onError: (reason: string) => void,
  ): void {
    const symbolInfo = this.symbols.get(symbolName);
    if (symbolInfo) {
      onResolve(symbolInfo);
    } else {
      onError(`Symbol "${symbolName}" not found`);
    }
  }

  getBars(
    _symbolInfo: SymbolInfo,
    _resolution: string,
    from: number,
    to: number,
    onHistory: (bars: Bar[], noData: boolean, nextTime?: number) => void,
    _onError: (reason: string) => void,
    _firstDataRequest?: boolean,
    countBack?: number,
  ): void {
    const bars = this.bars.get(_symbolInfo.name) || [];
    let filtered = bars.filter((b) => b.time >= from && b.time <= to);

    if (countBack !== undefined && filtered.length > countBack) {
      filtered = filtered.slice(filtered.length - countBack);
    }

    if (filtered.length === 0) {
      onHistory([], true);
    } else {
      onHistory(filtered, false);
    }
  }

  subscribeBars(
    _symbolInfo: SymbolInfo,
    _resolution: string,
    onRealtime: (bar: Bar) => void,
    _onReset: () => void,
  ): void {
    const listenerId = `listener_${++this.listenerCounter}`;
    this.listeners.set(listenerId, onRealtime);
  }

  unsubscribeBars(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  searchSymbols(
    userInput: string,
    onResult: (results: SearchSymbolResult[]) => void,
  ): void {
    const results: SearchSymbolResult[] = [];
    const searchLower = userInput.toLowerCase();

    for (const [name, symbol] of this.symbols.entries()) {
      if (name.toLowerCase().includes(searchLower)) {
        results.push({
          symbol: name,
          full_name: name,
          description: symbol.description || name,
          exchange: symbol.exchange,
          type: symbol.type,
        });
      }
    }

    onResult(results);
  }

  // Helper to simulate real-time updates
  emitRealtimeBar(bar: Bar): void {
    for (const listener of this.listeners.values()) {
      listener(bar);
    }
  }
}

/**
 * Bar Series Store interface
 */
export interface BarSeriesStore {
  addBars(bars: Bar[]): void;
  getBars(startTime: number, endTime: number): Bar[];
  getLatestBar(): Bar | undefined;
  getEarliestBarTime(): number | undefined;
  getBarCount(): number;
  clear(): void;
}

/**
 * Options for SimpleBarStore
 */
export interface SimpleBarStoreOptions {
  maxCapacity?: number;
}

/**
 * A simple in-memory bar series store
 * Bars are stored in a Map keyed by time for O(1) lookup
 */
export class SimpleBarStore implements BarSeriesStore {
  private bars: Map<number, Bar> = new Map();
  private maxCapacity?: number;

  constructor(options?: SimpleBarStoreOptions) {
    this.maxCapacity = options?.maxCapacity;
  }

  addBars(bars: Bar[]): void {
    if (bars.length === 0) {
      return;
    }

    for (const bar of bars) {
      this.bars.set(bar.time, bar);
    }

    // Sort by time for consistent iteration
    this.bars = new Map([...this.bars.entries()].sort((a, b) => a[0] - b[0]));

    // Enforce maximum capacity by evicting oldest bars
    if (this.maxCapacity !== undefined && this.bars.size > this.maxCapacity) {
      const excess = this.bars.size - this.maxCapacity;
      const keysToDelete: number[] = [];
      for (const key of this.bars.keys()) {
        if (keysToDelete.length < excess) {
          keysToDelete.push(key);
        } else {
          break;
        }
      }
      for (const key of keysToDelete) {
        this.bars.delete(key);
      }
    }
  }

  getBars(startTime: number, endTime: number): Bar[] {
    const result: Bar[] = [];
    for (const [time, bar] of this.bars.entries()) {
      if (time >= startTime && time <= endTime) {
        result.push(bar);
      }
    }
    return result;
  }

  getLatestBar(): Bar | undefined {
    const entries = [...this.bars.entries()];
    if (entries.length === 0) {
      return undefined;
    }
    return entries[entries.length - 1][1];
  }

  getEarliestBarTime(): number | undefined {
    const entries = [...this.bars.entries()];
    if (entries.length === 0) {
      return undefined;
    }
    return entries[0][0];
  }

  getBarCount(): number {
    return this.bars.size;
  }

  clear(): void {
    this.bars.clear();
  }
}

/**
 * Symbol Info matching TradingView's LibrarySymbolInfo
 */
export interface SymbolInfo {
  name: string;
  description?: string;
  exchange: string;
  type: string;
  timezone: string;
  session: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_no_volume: boolean;
  supported_resolutions?: string[];
  currency_code?: string;
  has_daily?: boolean;
  has_weekly_and_monthly?: boolean;
}

/**
 * Validation result for SymbolInfo
 */
export interface SymbolInfoValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates session format. Valid formats:
 * - "HHMM-HHMM" (e.g., "0930-1600")
 * - "24x7" (for crypto)
 * - Multi-segment: "HHMM-HHMM,HHMM-HHMM,..." (e.g., "0400-0930,0930-1600,1600-2000")
 */
function isValidSession(session: string): boolean {
  if (session === "24x7") {
    return true;
  }

  // Check for multi-segment format
  const segments = session.split(",");
  const timeSegmentRegex = /^\d{4}-\d{4}$/;

  for (const segment of segments) {
    if (!timeSegmentRegex.test(segment)) {
      return false;
    }

    // Validate time ranges within segment
    const [start, end] = segment.split("-").map(Number);
    const startHour = Math.floor(start / 100);
    const startMin = start % 100;
    const endHour = Math.floor(end / 100);
    const endMin = end % 100;

    // Check valid hour and minute ranges
    if (startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59) {
      return false;
    }
    if (endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59) {
      return false;
    }
  }

  return true;
}

/**
 * Validates SymbolInfo according to TradingView spec:
 * - name is required
 * - pricescale must be a positive integer
 * - session must be in valid format (HHMM-HHMM, 24x7, or multi-segment)
 */
export function validateSymbolInfo(
  symbolInfo: Partial<SymbolInfo>,
): SymbolInfoValidationResult {
  // Check name is required
  if (!symbolInfo.name || symbolInfo.name.trim() === "") {
    return { valid: false, error: "name is required" };
  }

  // Check pricescale is a positive integer
  if (
    symbolInfo.pricescale === undefined ||
    !Number.isInteger(symbolInfo.pricescale) ||
    symbolInfo.pricescale <= 0
  ) {
    return { valid: false, error: "pricescale must be a positive integer" };
  }

  // Check session format
  if (!symbolInfo.session || !isValidSession(symbolInfo.session)) {
    return { valid: false, error: "invalid session format" };
  }

  return { valid: true };
}

/**
 * Chart state events interface
 */
export interface ChartStateEvents {
  "symbol:resolved": { symbol: SymbolInfo };
  "viewport:changed": {
    range?: { from: number; to: number };
    timeRange?: [number, number];
    priceRange?: [number, number];
    priceScale?: "linear" | "logarithmic" | "percentage";
    basePrice?: number;
  };
  "state:reset": undefined;
  "series:data": { seriesId: string; bars: Bar[] };
  "chart:loading": { loading: boolean; region?: "left" | "center" };
  "chart:error": { message: string } | null;
  "series:add": { id: string; type: string; options?: Record<string, unknown> };
  "series:remove": { id: string };
  "series:update": { id: string; options: Record<string, unknown> };
  "series:show": { id: string };
  "series:hide": { id: string };
  "series:type": { id: string; type: string };
  "series:order": { ids: string[] };
  "interaction:pan": { deltaX: number };
  "interaction:zoom": { delta: number; centerX: number };
  "interaction:fit": undefined;
  "subscription:created": { guid: string; symbol: string; resolution: string };
  "subscription:removed": { guid: string };
}

/**
 * Series configuration
 */
export interface SeriesInfo {
  id: string;
  type: string;
  options?: Record<string, unknown>;
  visible?: boolean;
}

/**
 * Serialized chart state
 */
export interface SerializedChartState {
  symbol: string | undefined;
  resolution: string | undefined;
  series: SeriesInfo[];
  viewport: {
    range?: { from: number; to: number };
    priceRange?: { min: number; max: number };
    scale?: "linear" | "logarithmic" | "percentage";
  };
}

/**
 * Options for ChartState
 */
export interface ChartStateOptions {
  eventBus?: EventBus<ChartStateEvents>;
  barStore?: BarSeriesStore;
  viewportWidthPx?: number;
}

/**
 * ChartState manages the centralized state for a financial chart.
 * It tracks the current symbol, resolution, and viewport state,
 * and emits events to keep all components synchronized.
 */
/**
 * Supported series types
 */
const SUPPORTED_SERIES_TYPES = [
  "candlestick",
  "line",
  "area",
  "ohlc",
  "volume",
];

export class ChartState {
  private symbol: SymbolInfo | undefined;
  private resolution: string | undefined;
  private eventBus: EventBus<ChartStateEvents> | undefined;
  private barStore: BarSeriesStore | undefined;
  private series: Map<string, SeriesInfo> = new Map();
  private seriesBarStores: Map<string, BarSeriesStore> = new Map();
  private viewportRange: { from: number; to: number } | undefined;
  private priceRange: { min: number; max: number } | undefined;
  private priceScale: "linear" | "logarithmic" | "percentage" = "linear";
  private pendingSymbolRequest: number | undefined;
  private symbolRequestCounter = 0;
  private minRange: number | undefined;
  private maxRange: number | undefined;
  private autoScrollEnabled: boolean = false;
  private latestBarTime: number | undefined;
  private viewportWidthPx: number;

  constructor(options?: ChartStateOptions) {
    this.eventBus = options?.eventBus;
    this.barStore = options?.barStore;
    this.viewportWidthPx = options?.viewportWidthPx ?? 800;

    // Set up interaction event listeners
    if (this.eventBus) {
      this.eventBus.on("interaction:pan", (payload) => {
        this.handleInteractionPan(payload);
      });
      this.eventBus.on("interaction:zoom", (payload) => {
        this.handleInteractionZoom(payload);
      });
      this.eventBus.on("interaction:fit", () => {
        this.handleInteractionFit();
      });
    }
  }

  /**
   * Handle interaction:pan event from renderer
   * Converts deltaX (pixels) to time delta using current viewport scale
   * Panning right (positive deltaX) shows earlier times, so viewport shifts left
   * Clamps the viewport to not scroll before the earliest bar
   * Ignores the event if barStore exists but has no data loaded
   */
  private handleInteractionPan(payload: { deltaX: number }): void {
    if (!this.viewportRange) {
      return;
    }

    // Ignore interaction events when barStore exists but no data is loaded
    if (this.barStore && this.barStore.getBarCount() === 0) {
      return;
    }

    // Calculate time per pixel based on current viewport
    const timeRange = this.viewportRange.to - this.viewportRange.from;
    const timePerPixel = timeRange / this.viewportWidthPx;

    // Convert pixel delta to time delta
    const timeDelta = payload.deltaX * timePerPixel;

    // Calculate the new viewport range
    const newFrom = this.viewportRange.from - timeDelta;
    const newTo = this.viewportRange.to - timeDelta;

    // Get the earliest bar time for boundary clamping
    const earliestBarTime = this.barStore?.getEarliestBarTime();

    // Clamp the viewport to not scroll before the earliest bar
    let clampedFrom = newFrom;
    let clampedTo = newTo;
    if (earliestBarTime !== undefined && newFrom < earliestBarTime) {
      // Shift the viewport so it starts at the earliest bar time
      const offset = earliestBarTime - newFrom;
      clampedFrom = earliestBarTime;
      clampedTo = newTo + offset;
    }

    // Apply the (possibly clamped) viewport range
    this.viewportRange = { from: clampedFrom, to: clampedTo };

    // User panning disables auto-scroll
    this.autoScrollEnabled = false;

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange: [clampedFrom, clampedTo],
        priceRange: this.priceRange
          ? [this.priceRange.min, this.priceRange.max]
          : undefined,
      });
    }
  }

  /**
   * Handle interaction:zoom event from renderer
   * Converts delta and centerX to zoom factor and anchor time
   * Ignores the event if barStore exists but has no data loaded
   */
  private handleInteractionZoom(payload: {
    delta: number;
    centerX: number;
  }): void {
    if (!this.viewportRange) {
      return;
    }

    // Ignore interaction events when barStore exists but no data is loaded
    if (this.barStore && this.barStore.getBarCount() === 0) {
      return;
    }

    // Convert centerX (pixels) to anchor time
    const timeRange = this.viewportRange.to - this.viewportRange.from;
    const timePerPixel = timeRange / this.viewportWidthPx;
    const anchorTime = this.viewportRange.from + payload.centerX * timePerPixel;

    // Convert delta to zoom factor (delta > 1 means zoom in)
    const zoomFactor = 1 / payload.delta;

    this.zoomViewport(zoomFactor, anchorTime);
  }

  /**
   * Handle interaction:fit event from renderer
   * Fits viewport to all loaded bar data
   */
  private handleInteractionFit(): void {
    if (!this.barStore || this.barStore.getBarCount() === 0) {
      return;
    }

    // Get all bars to find min/max time
    const allBars = this.barStore.getBars(0, Number.MAX_SAFE_INTEGER);
    if (allBars.length === 0) {
      return;
    }

    const minTime = allBars[0].time;
    const maxTime = allBars[allBars.length - 1].time;

    // Add 5% padding on each side
    const range = maxTime - minTime;
    const padding = range * 0.05;
    const newFrom = minTime - padding;
    const newTo = maxTime + padding;

    this.viewportRange = { from: newFrom, to: newTo };

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange: [newFrom, newTo],
        priceRange: this.priceRange
          ? [this.priceRange.min, this.priceRange.max]
          : undefined,
      });
    }
  }

  /**
   * Add a series to the chart
   * Emits a "series:add" event with the series info
   */
  addSeries(id: string, type: string, options?: Record<string, unknown>): void {
    // Validate series type
    if (!SUPPORTED_SERIES_TYPES.includes(type)) {
      throw new Error(
        `Unsupported series type: ${type}. Supported types: ${SUPPORTED_SERIES_TYPES.join(", ")}`,
      );
    }

    // Check for duplicate id
    if (this.series.has(id)) {
      throw new Error(`Series with id "${id}" already exists`);
    }

    const seriesInfo: SeriesInfo = {
      id,
      type,
      options,
      visible: true,
    };

    this.series.set(id, seriesInfo);
    this.seriesBarStores.set(id, new SimpleBarStore());

    if (this.eventBus) {
      this.eventBus.emit("series:add", { id, type, options });
    }
  }

  /**
   * Remove a series from the chart
   * Emits a "series:remove" event with the series id
   * If the series doesn't exist, this is a no-op
   */
  removeSeries(id: string): void {
    // No-op if series doesn't exist
    if (!this.series.has(id)) {
      return;
    }

    this.series.delete(id);
    this.seriesBarStores.delete(id);

    if (this.eventBus) {
      this.eventBus.emit("series:remove", { id });
    }
  }

  /**
   * Update series options
   * Emits a "series:update" event with the new options
   */
  updateSeriesOptions(id: string, options: Record<string, unknown>): void {
    const seriesInfo = this.series.get(id);
    if (!seriesInfo) {
      throw new Error(`Series "${id}" not found`);
    }

    seriesInfo.options = options;

    if (this.eventBus) {
      this.eventBus.emit("series:update", { id, options });
    }
  }

  /**
   * Show a hidden series
   * Emits a "series:show" event
   */
  showSeries(id: string): void {
    const seriesInfo = this.series.get(id);
    if (!seriesInfo) {
      throw new Error(`Series "${id}" not found`);
    }

    seriesInfo.visible = true;

    if (this.eventBus) {
      this.eventBus.emit("series:show", { id });
    }
  }

  /**
   * Hide a visible series
   * Emits a "series:hide" event
   */
  hideSeries(id: string): void {
    const seriesInfo = this.series.get(id);
    if (!seriesInfo) {
      throw new Error(`Series "${id}" not found`);
    }

    seriesInfo.visible = false;

    if (this.eventBus) {
      this.eventBus.emit("series:hide", { id });
    }
  }

  /**
   * Change the type of a series
   * Emits a "series:type" event with the new type
   * If the type is the same, no event is emitted (no-op)
   */
  changeSeriesType(id: string, type: string): void {
    const seriesInfo = this.series.get(id);
    if (!seriesInfo) {
      throw new Error(`Series "${id}" not found`);
    }

    // Validate series type
    if (!SUPPORTED_SERIES_TYPES.includes(type)) {
      throw new Error(
        `Unsupported series type: ${type}. Supported types: ${SUPPORTED_SERIES_TYPES.join(", ")}`,
      );
    }

    // No-op if type is the same
    if (seriesInfo.type === type) {
      return;
    }

    seriesInfo.type = type;

    if (this.eventBus) {
      this.eventBus.emit("series:type", { id, type });
    }
  }

  /**
   * Reorder series
   * Emits a "series:order" event with the new order
   */
  reorderSeries(ids: string[]): void {
    // Validate that all ids exist
    for (const id of ids) {
      if (!this.series.has(id)) {
        throw new Error(`Series "${id}" not found`);
      }
    }

    // Rebuild the series map in the new order
    const newSeries = new Map<string, SeriesInfo>();
    for (const id of ids) {
      const seriesInfo = this.series.get(id)!;
      newSeries.set(id, seriesInfo);
    }
    this.series = newSeries;

    if (this.eventBus) {
      this.eventBus.emit("series:order", { ids });
    }
  }

  /**
   * Load bars into a series bar store
   * Emits a "series:data" event with the bars
   */
  loadSeriesBars(id: string, bars: Bar[]): void {
    const barStore = this.seriesBarStores.get(id);
    if (!barStore) {
      throw new Error(`Series "${id}" not found`);
    }

    barStore.addBars(bars);

    if (this.eventBus) {
      this.eventBus.emit("series:data", { seriesId: id, bars });
    }
  }

  /**
   * Add a real-time bar to a series
   * Emits a "series:data" event with all bars in the store
   */
  addSeriesBar(id: string, bar: Bar): void {
    const barStore = this.seriesBarStores.get(id);
    if (!barStore) {
      throw new Error(`Series "${id}" not found`);
    }

    barStore.addBars([bar]);

    // Emit all bars in the store
    const allBars = barStore.getBars(0, Number.MAX_SAFE_INTEGER);
    if (this.eventBus) {
      this.eventBus.emit("series:data", { seriesId: id, bars: allBars });
    }
  }

  /**
   * Get the bar store for a series
   */
  getSeriesBarStore(id: string): BarSeriesStore | undefined {
    return this.seriesBarStores.get(id);
  }

  /**
   * Set the active symbol and resolution
   * Emits a "symbol:resolved" event with the symbol info
   */
  setSymbol(symbolInfo: SymbolInfo, resolution: string): void {
    this.symbol = symbolInfo;
    this.resolution = resolution;

    if (this.eventBus) {
      this.eventBus.emit("symbol:resolved", { symbol: symbolInfo });
    }
  }

  /**
   * Change the resolution
   * Clears the bar store only if a symbol is active, and emits a "viewport:changed" event
   */
  setResolution(resolution: string): void {
    this.resolution = resolution;

    if (this.barStore && this.symbol) {
      this.barStore.clear();
    }

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {});
    }
  }

  /**
   * Reset the chart state
   * Clears the symbol, resolution, and bar store
   * Emits a "state:reset" event
   */
  reset(): void {
    this.symbol = undefined;
    this.resolution = undefined;

    if (this.barStore) {
      this.barStore.clear();
    }

    if (this.eventBus) {
      this.eventBus.emit("state:reset");
    }
  }

  /**
   * Set the loading state
   * Emits a "chart:loading" event with { loading: boolean, region?: "left" | "center" }
   */
  setLoading(loading: boolean, region?: "left" | "center"): void {
    if (this.eventBus) {
      this.eventBus.emit("chart:loading", { loading, region });
    }
  }

  /**
   * Set the error state
   * Emits a "chart:error" event with { message: string } or null to clear
   */
  setError(message: string | null): void {
    if (this.eventBus) {
      this.eventBus.emit("chart:error", message === null ? null : { message });
    }
  }

  /**
   * Get the current symbol name
   */
  getSymbol(): string | undefined {
    return this.symbol?.name;
  }

  /**
   * Get the current symbol info
   */
  getSymbolInfo(): SymbolInfo | undefined {
    return this.symbol;
  }

  /**
   * Get the current resolution
   */
  getResolution(): string | undefined {
    return this.resolution;
  }

  /**
   * Serialize the chart state to a plain object
   */
  serialize(): SerializedChartState {
    const seriesArray: SeriesInfo[] = [];
    for (const series of this.series.values()) {
      seriesArray.push(series);
    }

    return {
      symbol: this.symbol?.name,
      resolution: this.resolution,
      series: seriesArray,
      viewport: {
        range: this.viewportRange,
        priceRange: this.priceRange,
        scale: this.priceScale,
      },
    };
  }

  /**
   * Deserialize chart state from a plain object
   * Restores symbol, resolution, series, and viewport state
   * Emits appropriate events for each restored property
   */
  deserialize(state: SerializedChartState): void {
    // Restore symbol and resolution
    if (state.symbol && state.resolution) {
      // We need to reconstruct a SymbolInfo - for now we use a minimal one
      // In a real implementation, this would come from a datafeed resolveSymbol call
      const symbolInfo: SymbolInfo = {
        name: state.symbol,
        exchange: "",
        type: "stock",
        timezone: "UTC",
        session: "24x7",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_no_volume: false,
      };
      this.symbol = symbolInfo;
      this.resolution = state.resolution;

      if (this.eventBus) {
        this.eventBus.emit("symbol:resolved", { symbol: symbolInfo });
      }
    }

    // Restore series
    this.series.clear();
    if (state.series) {
      for (const series of state.series) {
        this.series.set(series.id, series);
      }
    }

    // Restore viewport
    this.viewportRange = state.viewport?.range;
    this.priceRange = state.viewport?.priceRange;
    this.priceScale = state.viewport?.scale || "linear";

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        range: this.viewportRange,
      });
    }
  }

  /**
   * Begin an asynchronous symbol resolution
   * Returns a request ID that must be passed to completeSymbolResolution
   * If a new symbol resolution is started before the previous one completes,
   * the previous one will be discarded
   */
  beginSymbolResolution(_symbolName: string, resolution: string): number {
    const requestId = ++this.symbolRequestCounter;
    this.pendingSymbolRequest = requestId;
    this.resolution = resolution;
    return requestId;
  }

  /**
   * Complete a symbol resolution with the resolved SymbolInfo
   * If the request ID is stale (a newer resolution was started),
   * the result is discarded
   */
  completeSymbolResolution(requestId: number, symbolInfo: SymbolInfo): void {
    // Only accept the resolution if it's still the pending request
    if (this.pendingSymbolRequest !== requestId) {
      // Stale resolution, discard it
      return;
    }

    this.symbol = symbolInfo;
    this.pendingSymbolRequest = undefined;

    if (this.eventBus) {
      this.eventBus.emit("symbol:resolved", { symbol: symbolInfo });
      // Clear any previous error on successful resolution
      this.eventBus.emit("chart:error", null);
    }
  }

  /**
   * Fail a symbol resolution with an error reason
   * Emits a "chart:error" event with { message: string }
   * If the request ID is stale, the error is still emitted
   */
  failSymbolResolution(requestId: number, reason: string): void {
    // Only emit error if this is still the pending request
    if (this.pendingSymbolRequest !== requestId) {
      return;
    }

    this.pendingSymbolRequest = undefined;

    if (this.eventBus) {
      this.eventBus.emit("chart:error", { message: reason });
    }
  }

  /**
   * Set the visible range of the viewport
   * Emits a "viewport:changed" event with timeRange and priceRange
   */
  setVisibleRange(
    timeRange: [number, number],
    priceRange?: [number, number],
  ): void {
    // Prevent inverted viewport (from must be less than to)
    if (timeRange[0] >= timeRange[1]) {
      return; // Reject invalid range, preserve previous valid range
    }

    this.viewportRange = { from: timeRange[0], to: timeRange[1] };
    if (priceRange) {
      this.priceRange = { min: priceRange[0], max: priceRange[1] };
    }

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange,
        priceRange,
      });
    }
  }

  /**
   * Pan the viewport by a delta value
   * Disables auto-scroll when user pans
   * Emits a "viewport:changed" event with the new timeRange
   */
  panViewport(delta: number): void {
    if (!this.viewportRange) {
      return;
    }

    // User panning disables auto-scroll
    this.autoScrollEnabled = false;

    const newFrom = this.viewportRange.from + delta;
    const newTo = this.viewportRange.to + delta;
    this.viewportRange = { from: newFrom, to: newTo };

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange: [newFrom, newTo],
        priceRange: this.priceRange
          ? [this.priceRange.min, this.priceRange.max]
          : undefined,
      });
    }
  }

  /**
   * Set viewport range limits for zoom clamping
   */
  setViewportRangeLimits(minRange: number, maxRange: number): void {
    this.minRange = minRange;
    this.maxRange = maxRange;
  }

  /**
   * Zoom the viewport by a factor anchored at a specific point
   * Factor < 1 zooms in (shrinks range), factor > 1 zooms out (expands range)
   * Respects min/max range limits if set
   * Emits a "viewport:changed" event with the new timeRange
   */
  zoomViewport(factor: number, anchor: number): void {
    if (!this.viewportRange) {
      return;
    }

    const from = this.viewportRange.from;
    const to = this.viewportRange.to;

    // Calculate distances from anchor to edges
    const anchorToLeft = anchor - from;
    const anchorToRight = to - anchor;

    // Apply zoom factor to each side
    const newAnchorToLeft = anchorToLeft * factor;
    const newAnchorToRight = anchorToRight * factor;

    let newFrom = anchor - newAnchorToLeft;
    let newTo = anchor + newAnchorToRight;

    // Apply range limits if set
    let newWidth = newTo - newFrom;
    if (this.minRange !== undefined && newWidth < this.minRange) {
      // Clamp to minimum range
      const scale = this.minRange / newWidth;
      newFrom = anchor - (anchor - newFrom) * scale;
      newTo = anchor + (newTo - anchor) * scale;
    } else if (this.maxRange !== undefined && newWidth > this.maxRange) {
      // Clamp to maximum range
      const scale = this.maxRange / newWidth;
      newFrom = anchor - (anchor - newFrom) * scale;
      newTo = anchor + (newTo - anchor) * scale;
    }

    this.viewportRange = { from: newFrom, to: newTo };

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange: [newFrom, newTo],
        priceRange: this.priceRange
          ? [this.priceRange.min, this.priceRange.max]
          : undefined,
      });
    }
  }

  /**
   * Enable or disable auto-scroll
   * When re-enabled, shifts viewport to show latest bar if available
   */
  setAutoScrollEnabled(enabled: boolean): void {
    const wasEnabled = this.autoScrollEnabled;
    this.autoScrollEnabled = enabled;

    // If re-enabling and we have a latest bar, shift viewport to show it
    if (
      enabled &&
      !wasEnabled &&
      this.latestBarTime !== undefined &&
      this.viewportRange
    ) {
      const range = this.viewportRange.to - this.viewportRange.from;
      const newFrom = this.latestBarTime - range;
      const newTo = this.latestBarTime;
      this.viewportRange = { from: newFrom, to: newTo };

      if (this.eventBus) {
        this.eventBus.emit("viewport:changed", {
          timeRange: [newFrom, newTo],
          priceRange: this.priceRange
            ? [this.priceRange.min, this.priceRange.max]
            : undefined,
        });
      }
    }
  }

  /**
   * Handle a real-time bar arrival
   * If auto-scroll is enabled and the bar is beyond the visible range,
   * shifts the viewport to show the new bar
   */
  onRealtimeBar(barTime: number): void {
    this.latestBarTime = barTime;

    if (!this.autoScrollEnabled || !this.viewportRange) {
      return;
    }

    // Only auto-scroll if the bar is beyond the current visible range
    if (barTime > this.viewportRange.to) {
      const range = this.viewportRange.to - this.viewportRange.from;
      const newFrom = barTime - range;
      const newTo = barTime;
      this.viewportRange = { from: newFrom, to: newTo };

      if (this.eventBus) {
        this.eventBus.emit("viewport:changed", {
          timeRange: [newFrom, newTo],
          priceRange: this.priceRange
            ? [this.priceRange.min, this.priceRange.max]
            : undefined,
        });
      }
    }
  }

  /**
   * Auto-calculate the price range from visible bars
   * Expands the range slightly beyond min/max for padding
   * Emits a "viewport:changed" event with the new priceRange
   */
  autoCalculatePriceRange(paddingPercent: number = 0.1): void {
    if (!this.barStore || !this.viewportRange) {
      return;
    }

    const bars = this.barStore.getBars(
      this.viewportRange.from,
      this.viewportRange.to,
    );

    if (bars.length === 0) {
      return;
    }

    // Find min and max prices from visible bars
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const bar of bars) {
      if (bar.low < minPrice) minPrice = bar.low;
      if (bar.high > maxPrice) maxPrice = bar.high;
    }

    // Expand range for padding
    const range = maxPrice - minPrice;
    const padding = range * paddingPercent;
    const newMin = minPrice - padding;
    const newMax = maxPrice + padding;

    this.priceRange = { min: newMin, max: newMax };

    if (this.eventBus) {
      this.eventBus.emit("viewport:changed", {
        timeRange: [this.viewportRange.from, this.viewportRange.to],
        priceRange: [newMin, newMax],
      });
    }
  }
}

/**
 * Format a raw price into a display string using the symbol's pricescale.
 *
 * @param price - The raw price value (e.g., 10250 for $102.50 with pricescale 100)
 * @param pricescale - The pricescale from SymbolInfo (e.g., 100 for 2 decimal places)
 * @param currencyCode - Optional currency code (e.g., "USD", "EUR")
 * @returns Formatted price string (e.g., "102.50" or "$102.50")
 */
export function formatPrice(
  price: number,
  pricescale: number,
  currencyCode?: string,
): string {
  // Calculate the number of decimal places from pricescale
  // pricescale 100 → 2 decimals, pricescale 100000000 → 8 decimals
  const decimalPlaces = Math.log10(pricescale);

  // Divide by pricescale to get the actual price
  const actualPrice = price / pricescale;

  // Format with thousand separators using toLocaleString
  const formattedPrice = actualPrice.toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  // Add currency symbol if provided
  if (currencyCode) {
    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    const symbol = currencySymbols[currencyCode] || currencyCode;
    return `${symbol}${formattedPrice}`;
  }

  return formattedPrice;
}

/**
 * Parsed resolution result
 */
export interface ParsedResolution {
  type: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";
  value: number;
}

/**
 * Parse a resolution string into a structured format.
 *
 * Supported formats:
 * - Seconds: "1S", "5S", "30S"
 * - Minutes: "1", "5", "15", "30", "60" (plain numbers are minutes)
 * - Hours: "1H", "2H", "4H"
 * - Days: "1D", "2D", "3D"
 * - Weeks: "1W", "2W"
 * - Months: "1M", "2M", "3M"
 *
 * @param resolution - The resolution string to parse
 * @returns ParsedResolution with type and value
 * @throws Error if the resolution format is invalid
 */
export function parseResolution(resolution: string): ParsedResolution {
  if (!resolution || resolution.trim() === "") {
    throw new Error("invalid resolution format");
  }

  // Check for negative numbers first
  if (resolution.startsWith("-")) {
    throw new Error("resolution must be positive");
  }

  const upper = resolution.toUpperCase();

  // Check for seconds (e.g., "1S", "5S")
  const secondsMatch = upper.match(/^(\d+)S$/);
  if (secondsMatch) {
    const value = parseInt(secondsMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "seconds", value };
  }

  // Check for hours (e.g., "1H", "4H")
  const hoursMatch = upper.match(/^(\d+)H$/);
  if (hoursMatch) {
    const value = parseInt(hoursMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "hours", value };
  }

  // Check for days (e.g., "1D", "2D")
  const daysMatch = upper.match(/^(\d+)D$/);
  if (daysMatch) {
    const value = parseInt(daysMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "days", value };
  }

  // Check for weeks (e.g., "1W", "2W")
  const weeksMatch = upper.match(/^(\d+)W$/);
  if (weeksMatch) {
    const value = parseInt(weeksMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "weeks", value };
  }

  // Check for months (e.g., "1M", "3M")
  const monthsMatch = upper.match(/^(\d+)M$/);
  if (monthsMatch) {
    const value = parseInt(monthsMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "months", value };
  }

  // Check for plain number (minutes, e.g., "1", "5", "15")
  const minutesMatch = upper.match(/^(\d+)$/);
  if (minutesMatch) {
    const value = parseInt(minutesMatch[1], 10);
    if (value <= 0) {
      throw new Error("resolution must be positive");
    }
    return { type: "minutes", value };
  }

  // No match - invalid format
  throw new Error("invalid resolution format");
}

/**
 * Convert a resolution string to milliseconds.
 *
 * @param resolution - The resolution string (e.g., "1D", "5", "1H")
 * @returns The resolution in milliseconds
 */
export function resolutionToMilliseconds(resolution: string): number {
  const parsed = parseResolution(resolution);

  switch (parsed.type) {
    case "seconds":
      return parsed.value * 1000;
    case "minutes":
      return parsed.value * 60 * 1000;
    case "hours":
      return parsed.value * 60 * 60 * 1000;
    case "days":
      return parsed.value * 24 * 60 * 60 * 1000;
    case "weeks":
      return parsed.value * 7 * 24 * 60 * 60 * 1000;
    case "months":
      // Approximate: 30 days per month
      return parsed.value * 30 * 24 * 60 * 60 * 1000;
    default:
      throw new Error("unknown resolution type");
  }
}

/**
 * Subscription information
 */
export interface SubscriptionInfo {
  guid: string;
  symbol: string;
  resolution: string;
}

/**
 * Manages real-time data subscriptions for chart symbols and resolutions.
 * Tracks active subscriptions and emits events when subscriptions are created or removed.
 */
export class SubscriptionManager {
  private subscriptions: Map<string, SubscriptionInfo> = new Map();
  private eventBus: EventBus<ChartStateEvents>;

  constructor(eventBus: EventBus<ChartStateEvents>) {
    this.eventBus = eventBus;
  }

  /**
   * Create a new subscription for a symbol at a given resolution.
   * @param guid - Unique identifier for this subscription
   * @param symbol - Symbol name (e.g., "AAPL")
   * @param resolution - Resolution string (e.g., "1", "5", "1D")
   */
  createSubscription(guid: string, symbol: string, resolution: string): void {
    const subscription: SubscriptionInfo = { guid, symbol, resolution };
    this.subscriptions.set(guid, subscription);
    this.eventBus.emit("subscription:created", { guid, symbol, resolution });
  }

  /**
   * Check if a subscription exists.
   * @param guid - Subscription identifier
   * @returns true if the subscription exists
   */
  hasSubscription(guid: string): boolean {
    return this.subscriptions.has(guid);
  }

  /**
   * Get a subscription by guid.
   * @param guid - Subscription identifier
   * @returns The subscription info or undefined
   */
  getSubscription(guid: string): SubscriptionInfo | undefined {
    return this.subscriptions.get(guid);
  }

  /**
   * Remove a subscription by guid.
   * @param guid - Subscription identifier
   */
  removeSubscription(guid: string): void {
    const removed = this.subscriptions.delete(guid);
    if (removed) {
      this.eventBus.emit("subscription:removed", { guid });
    }
  }

  /**
   * Remove all subscriptions for a given symbol.
   * @param symbol - Symbol name to remove subscriptions for
   */
  removeSubscriptionsBySymbol(symbol: string): void {
    const toRemove: string[] = [];
    for (const [guid, sub] of this.subscriptions.entries()) {
      if (sub.symbol === symbol) {
        toRemove.push(guid);
      }
    }
    for (const guid of toRemove) {
      this.removeSubscription(guid);
    }
  }

  /**
   * Remove all subscriptions for a given resolution.
   * @param resolution - Resolution to remove subscriptions for
   */
  removeSubscriptionsByResolution(resolution: string): void {
    const toRemove: string[] = [];
    for (const [guid, sub] of this.subscriptions.entries()) {
      if (sub.resolution === resolution) {
        toRemove.push(guid);
      }
    }
    for (const guid of toRemove) {
      this.removeSubscription(guid);
    }
  }

  /**
   * Get all active subscriptions.
   * @returns Array of subscription info
   */
  getAllSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscriptions for a specific symbol.
   * @param symbol - Symbol name
   * @returns Array of subscription info for that symbol
   */
  getSubscriptionsBySymbol(symbol: string): SubscriptionInfo[] {
    const result: SubscriptionInfo[] = [];
    for (const sub of this.subscriptions.values()) {
      if (sub.symbol === symbol) {
        result.push(sub);
      }
    }
    return result;
  }

  /**
   * Get subscriptions for a specific resolution.
   * @param resolution - Resolution string
   * @returns Array of subscription info for that resolution
   */
  getSubscriptionsByResolution(resolution: string): SubscriptionInfo[] {
    const result: SubscriptionInfo[] = [];
    for (const sub of this.subscriptions.values()) {
      if (sub.resolution === resolution) {
        result.push(sub);
      }
    }
    return result;
  }

  /**
   * Clear all subscriptions without emitting events.
   */
  clear(): void {
    this.subscriptions.clear();
  }
}

/**
 * Format a timestamp into a display string based on resolution and timezone.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param resolution - Resolution string (e.g., "1D", "5", "1W", "1M")
 * @param timezone - IANA timezone string (e.g., "America/New_York", "Asia/Tokyo", "UTC")
 * @returns Formatted time string
 */
export function formatTime(
  timestamp: number,
  resolution: string,
  timezone: string = "UTC",
): string {
  const date = new Date(timestamp);

  // Parse the resolution to determine the format
  const parsed = parseResolution(resolution);

  // Format options based on resolution type
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour12: false,
  };

  switch (parsed.type) {
    case "seconds":
    case "minutes":
    case "hours":
      // Intraday: show time (e.g., "14:13")
      options.hour = "2-digit";
      options.minute = "2-digit";
      break;
    case "days":
      // Daily: show month and day (e.g., "Nov 14")
      options.month = "short";
      options.day = "2-digit";
      break;
    case "weeks":
      // Weekly: show month and day (e.g., "Nov 13")
      options.month = "short";
      options.day = "2-digit";
      break;
    case "months":
      // Monthly: show month and year (e.g., "Nov 2023")
      options.month = "short";
      options.year = "numeric";
      break;
  }

  const formatter = new Intl.DateTimeFormat("en-US", options);
  return formatter.format(date);
}
