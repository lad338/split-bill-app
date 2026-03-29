import { describe, it, expect } from 'vitest'
import { parseDateSearch, matchesDateSearch } from './dateSearch'

describe('parseDateSearch', () => {
  it('parses YYYYMMDD', () => {
    expect(parseDateSearch('20250101')).toEqual({ year: 2025, month: 1, day: 1 })
  })
  it('parses YYYY/MM/DD', () => {
    expect(parseDateSearch('2026/01/01')).toEqual({ year: 2026, month: 1, day: 1 })
  })
  it('parses YYYY/M/D single-digit month and day', () => {
    expect(parseDateSearch('2026/1/2')).toEqual({ year: 2026, month: 1, day: 2 })
  })
  it('parses YYYY-MM-DD', () => {
    expect(parseDateSearch('2024-12-31')).toEqual({ year: 2024, month: 12, day: 31 })
  })
  it('parses YYYY-M-D single-digit month and day', () => {
    expect(parseDateSearch('2025-3-4')).toEqual({ year: 2025, month: 3, day: 4 })
  })
  it('returns null for plain text', () => {
    expect(parseDateSearch('dinner')).toBeNull()
  })
  it('returns null for partial year only', () => {
    expect(parseDateSearch('2025')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseDateSearch('')).toBeNull()
  })
})

describe('matchesDateSearch', () => {
  // 2025-01-01 noon UTC+8 → use local date construction to avoid timezone surprises
  const ts = new Date(2025, 0, 1, 12, 0, 0).getTime()
  it('returns true when year/month/day match', () => {
    expect(matchesDateSearch(ts, { year: 2025, month: 1, day: 1 })).toBe(true)
  })
  it('returns false when day differs', () => {
    expect(matchesDateSearch(ts, { year: 2025, month: 1, day: 2 })).toBe(false)
  })
  it('returns false when month differs', () => {
    expect(matchesDateSearch(ts, { year: 2025, month: 2, day: 1 })).toBe(false)
  })
})
