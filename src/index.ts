// @dwengochart/core
// Framework-agnostic financial chart state management

/**
 * OHLCV Bar data structure
 */
export interface Bar {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

/**
 * Validation error for a Bar
 */
export interface BarValidationResult {
    valid: boolean
    error?: string
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
        return { valid: false, error: 'time must be a positive integer' }
    }

    // Check for NaN in numeric fields
    const numericFields: (keyof Bar)[] = ['open', 'high', 'low', 'close']
    for (const field of numericFields) {
        if (Number.isNaN(bar[field])) {
            return { valid: false, error: 'numeric fields must not be NaN' }
        }
    }

    // Check for Infinity in numeric fields
    for (const field of numericFields) {
        if (!Number.isFinite(bar[field])) {
            return { valid: false, error: 'numeric fields must be finite' }
        }
    }

    // Check volume is non-negative if provided
    if (bar.volume !== undefined) {
        if (bar.volume < 0 || !Number.isInteger(bar.volume)) {
            return { valid: false, error: 'volume must be non-negative' }
        }
    }

    // Check high >= low
    if (bar.high < bar.low) {
        return { valid: false, error: 'high must be >= low' }
    }

    // Check high >= open and close
    if (bar.high < bar.open || bar.high < bar.close) {
        return { valid: false, error: 'high must be >= open and close' }
    }

    // Check low <= open and close
    if (bar.low > bar.open || bar.low > bar.close) {
        return { valid: false, error: 'low must be <= open and close' }
    }

    return { valid: true }
}

/**
 * Bar Series Store interface
 */
export interface BarSeriesStore {
    addBars(bars: Bar[]): void
    getBars(startTime: number, endTime: number): Bar[]
    getLatestBar(): Bar | undefined
    getBarCount(): number
    clear(): void
}

/**
 * A simple in-memory bar series store
 * Bars are stored in a Map keyed by time for O(1) lookup
 */
export class SimpleBarStore implements BarSeriesStore {
    private bars: Map<number, Bar> = new Map()

    addBars(bars: Bar[]): void {
        if (bars.length === 0) {
            return
        }

        for (const bar of bars) {
            this.bars.set(bar.time, bar)
        }

        // Sort by time for consistent iteration
        this.bars = new Map(
            [...this.bars.entries()].sort((a, b) => a[0] - b[0]),
        )
    }

    getBars(startTime: number, endTime: number): Bar[] {
        const result: Bar[] = []
        for (const [time, bar] of this.bars.entries()) {
            if (time >= startTime && time <= endTime) {
                result.push(bar)
            }
        }
        return result
    }

    getLatestBar(): Bar | undefined {
        const entries = [...this.bars.entries()]
        if (entries.length === 0) {
            return undefined
        }
        return entries[entries.length - 1][1]
    }

    getBarCount(): number {
        return this.bars.size
    }

    clear(): void {
        this.bars.clear()
    }
}
