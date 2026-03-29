import { describe, it, expect } from 'vitest'
import { equalSplit } from '../../src/utils/shareUtils'

describe('equalSplit', () => {
  it('splits 2 people evenly', () => {
    expect(equalSplit(2)).toEqual([50, 50])
  })
  it('splits 3 people to 2dp, remainder to last', () => {
    expect(equalSplit(3)).toEqual([33.33, 33.33, 33.34])
  })
  it('splits 4 people evenly', () => {
    expect(equalSplit(4)).toEqual([25, 25, 25, 25])
  })
  it('splits 1 person to 100%', () => {
    expect(equalSplit(1)).toEqual([100])
  })
  it('returns empty array for 0', () => {
    expect(equalSplit(0)).toEqual([])
  })
  it('total always rounds to 100 for common counts', () => {
    for (const n of [2, 3, 4, 5, 6, 7]) {
      const result = equalSplit(n)
      const sum = result.reduce((a, b) => a + b, 0)
      expect(Math.round(sum * 100) / 100).toBe(100)
    }
  })
  it('all values are at most 2 decimal places', () => {
    for (const n of [3, 7]) {
      const result = equalSplit(n)
      result.forEach(v => {
        expect(Number.isInteger(Math.round(v * 100))).toBe(true)
      })
    }
  })
})
