import { describe, it, expect } from 'vitest'
import { getDisplayPage } from './pagination'

const item = (playcountOne, playcountTwo) => ({ playcountOne, playcountTwo })

describe('getDisplayPage', () => {
  it('returns everything visible when visibleCount covers the whole list', () => {
    const items = [item(10, 5), item(3, 2)]
    const result = getDisplayPage(items, 10)
    expect(result.visible).toEqual(items)
    expect(result.hasMore).toBe(false)
  })

  it('slices to visibleCount and reports hasMore', () => {
    const items = [item(1, 1), item(2, 2), item(3, 3)]
    const result = getDisplayPage(items, 2)
    expect(result.visible).toEqual([item(1, 1), item(2, 2)])
    expect(result.hasMore).toBe(true)
  })

  it('caps the pool itself at `cap`, independent of visibleCount', () => {
    const items = Array.from({ length: 150 }, (_, i) => item(i, i))
    const result = getDisplayPage(items, 200, 100)
    expect(result.displayed).toHaveLength(100)
    expect(result.visible).toHaveLength(100)
    expect(result.hasMore).toBe(false)
  })

  it('scales by the max across the whole displayed pool, not just the visible page', () => {
    // the biggest playcount (900) is on a row past the first page
    const items = [item(10, 5), item(3, 2), item(900, 1)]
    const result = getDisplayPage(items, 2)
    expect(result.max).toBe(900)
  })

  it('returns max: 0 for an empty list instead of -Infinity', () => {
    // Math.max() with no arguments is -Infinity, which would make every
    // bar's width % divide by -Infinity -- MatchTable currently avoids
    // ever calling this with an empty list, but the function shouldn't
    // rely on that being true elsewhere to behave sanely.
    const result = getDisplayPage([], 10)
    expect(result.max).toBe(0)
    expect(result.visible).toEqual([])
    expect(result.hasMore).toBe(false)
  })
})
