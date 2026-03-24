import { describe, it, expect } from 'vitest'
import { validateBar, Bar, SimpleBarStore, BarSeriesStore } from '../src/index'

describe('Scenario: Create a valid bar', () => {
    it('create_a_valid_bar', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 105,
            low: 95,
            close: 102,
            volume: 1000,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(true)
    })
})

describe('Scenario: Create a bar without volume', () => {
    it('create_a_bar_without_volume', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 105,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(true)
        expect(bar.volume).toBeUndefined()
    })
})

describe('Scenario: Reject a bar where high is less than low', () => {
    it('reject_a_bar_where_high_is_less_than_low', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 90,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('high must be >= low')
    })
})

describe('Scenario: Reject a bar where high is less than open or close', () => {
    it('reject_a_bar_where_high_is_less_than_open_or_close', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 99,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('high must be >= open and close')
    })
})

describe('Scenario: Reject a bar where low is greater than open or close', () => {
    it('reject_a_bar_where_low_is_greater_than_open_or_close', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 105,
            low: 101,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('low must be <= open and close')
    })
})

describe('Scenario: Reject a bar with negative time', () => {
    it('reject_a_bar_with_negative_time', () => {
        const bar: Bar = {
            time: -1,
            open: 100,
            high: 105,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('time must be a positive integer')
    })
})

describe('Scenario: Reject a bar with NaN values', () => {
    it('reject_a_bar_with_nan_values', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: NaN,
            high: 105,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('numeric fields must not be NaN')
    })
})

describe('Scenario: Reject a bar with negative volume', () => {
    it('reject_a_bar_with_negative_volume', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 100,
            high: 105,
            low: 95,
            close: 102,
            volume: -5,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('volume must be non-negative')
    })
})

describe('Scenario: Reject a bar with Infinity values', () => {
    it('reject_a_bar_with_infinity_values', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: Infinity,
            high: 105,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('numeric fields must be finite')
    })
})

describe('Scenario: Reject a bar with noninteger timestamp', () => {
    it('reject_a_bar_with_noninteger_timestamp', () => {
        const bar: Bar = {
            time: 1700000000000.5,
            open: 100,
            high: 105,
            low: 95,
            close: 102,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('time must be a positive integer')
    })
})

describe('Scenario: Accept a bar with zero price', () => {
    it('accept_a_bar_with_zero_price', () => {
        const bar: Bar = {
            time: 1700000000000,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
            volume: 0,
        }
        const result: any = validateBar(bar)
        expect(result.valid).toBe(true)
    })
})

describe('Scenario: Add bars in chronological order', () => {
    it('add_bars_in_chronological_order', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        const bars: Bar[] = [
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ]
        store.addBars(bars)
        expect(store.getBarCount()).toBe(3)
        const retrieved = store.getBars(1000, 3000)
        expect(retrieved.length).toBe(3)
        expect(retrieved[0].time).toBe(1000)
        expect(retrieved[1].time).toBe(2000)
        expect(retrieved[2].time).toBe(3000)
    })
})

describe('Scenario: Add bars in reverse order', () => {
    it('add_bars_in_reverse_order', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        const bars: Bar[] = [
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
        ]
        store.addBars(bars)
        expect(store.getBarCount()).toBe(3)
        const retrieved = store.getBars(1000, 3000)
        expect(retrieved.length).toBe(3)
        expect(retrieved[0].time).toBe(1000)
        expect(retrieved[1].time).toBe(2000)
        expect(retrieved[2].time).toBe(3000)
    })
})

describe('Scenario: Deduplicate bars with the same timestamp', () => {
    it('bar_series_deduplicate_bars_with_the_same_timestamp', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        const bars: Bar[] = [
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 2000, open: 105, high: 110, low: 100, close: 108 },
            { time: 3000, open: 108, high: 113, low: 103, close: 110 },
        ]
        store.addBars(bars)
        expect(store.getBarCount()).toBe(3)
        const retrieved = store.getBars(2000, 2000)
        expect(retrieved.length).toBe(1)
        expect(retrieved[0].open).toBe(105)
        expect(retrieved[0].close).toBe(108)
    })
})

describe('Scenario: Merge an update into an existing bar', () => {
    it('merge_an_update_into_an_existing_bar', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 100 },
        ])
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 105 },
        ])
        expect(store.getBarCount()).toBe(1)
        const retrieved = store.getBars(1000, 1000)
        expect(retrieved.length).toBe(1)
        expect(retrieved[0].close).toBe(105)
    })
})

describe('Scenario: Retrieve bars within a time range', () => {
    it('retrieve_bars_within_a_time_range', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
            { time: 4000, open: 108, high: 113, low: 103, close: 110 },
            { time: 5000, open: 110, high: 115, low: 105, close: 112 },
        ])
        const retrieved = store.getBars(2000, 4000)
        expect(retrieved.length).toBe(3)
        expect(retrieved[0].time).toBe(2000)
        expect(retrieved[1].time).toBe(3000)
        expect(retrieved[2].time).toBe(4000)
    })
})

describe('Scenario: Query a range with no matching bars', () => {
    it('query_a_range_with_no_matching_bars', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ])
        const retrieved = store.getBars(5000, 6000)
        expect(retrieved.length).toBe(0)
    })
})

describe('Scenario: Add an empty array of bars', () => {
    it('add_an_empty_array_of_bars', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        const initialCount = store.getBarCount()
        store.addBars([])
        expect(store.getBarCount()).toBe(initialCount)
    })
})

describe('Scenario: Get the latest bar', () => {
    it('get_the_latest_bar', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ])
        const latest = store.getLatestBar()
        expect(latest).toBeDefined()
        expect(latest?.time).toBe(3000)
    })
})

describe('Scenario: Get the latest bar from an empty store', () => {
    it('get_the_latest_bar_from_an_empty_store', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        const latest = store.getLatestBar()
        expect(latest).toBeUndefined()
    })
})

describe('Scenario: Add a second batch with partial overlap', () => {
    it('add_a_second_batch_with_partial_overlap', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ])
        store.addBars([
            { time: 2000, open: 105, high: 110, low: 100, close: 108 },
            { time: 3000, open: 108, high: 113, low: 103, close: 110 },
            { time: 4000, open: 110, high: 115, low: 105, close: 112 },
            { time: 5000, open: 112, high: 117, low: 107, close: 115 },
        ])
        expect(store.getBarCount()).toBe(5)
        const retrieved = store.getBars(1000, 5000)
        expect(retrieved.length).toBe(5)
        expect(retrieved[0].time).toBe(1000)
        expect(retrieved[1].time).toBe(2000)
        expect(retrieved[4].time).toBe(5000)
    })
})

describe('Scenario: Clear the store', () => {
    it('clear_the_store', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ])
        store.clear()
        expect(store.getBarCount()).toBe(0)
    })
})

describe('Scenario: Get the bar count', () => {
    it('get_the_bar_count', () => {
        const store: BarSeriesStore = new SimpleBarStore()
        store.addBars([
            { time: 1000, open: 100, high: 105, low: 95, close: 102 },
            { time: 2000, open: 102, high: 107, low: 97, close: 105 },
            { time: 3000, open: 105, high: 110, low: 100, close: 108 },
        ])
        const count = store.getBarCount()
        expect(count).toBe(3)
    })
})
