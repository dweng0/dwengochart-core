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
  "viewport:changed": { range?: { from: number; to: number } };
  "state:reset": undefined;
  "series:data": { seriesId: string; bars: Bar[] };
  "chart:loading": boolean;
  "chart:error": string | null;
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
}

/**
 * ChartState manages the centralized state for a financial chart.
 * It tracks the current symbol, resolution, and viewport state,
 * and emits events to keep all components synchronized.
 */
export class ChartState {
  private symbol: SymbolInfo | undefined;
  private resolution: string | undefined;
  private eventBus: EventBus<ChartStateEvents> | undefined;
  private barStore: BarSeriesStore | undefined;
  private series: Map<string, SeriesInfo> = new Map();
  private viewportRange: { from: number; to: number } | undefined;
  private priceRange: { min: number; max: number } | undefined;
  private priceScale: "linear" | "logarithmic" | "percentage" = "linear";
  private pendingSymbolRequest: number | undefined;
  private symbolRequestCounter = 0;

  constructor(options?: ChartStateOptions) {
    this.eventBus = options?.eventBus;
    this.barStore = options?.barStore;
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
  const formattedPrice = (price / pricescale).toFixed(decimalPlaces);

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
