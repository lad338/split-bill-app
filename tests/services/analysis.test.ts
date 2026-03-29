import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/services/gemini', () => ({
  analyzeWithGemini: vi.fn().mockResolvedValue({
    title: 'Test Restaurant',
    date: new Date('2026-03-15').getTime(),
    items: [
      { id: 'item-1', name: 'Margherita Pizza', price: 14.00, shares: [] },
      { id: 'item-2', name: 'House Wine (bottle)', price: 24.00, shares: [] },
    ],
  }),
}))

import { analyzeReceiptImage } from '../../src/services/analysis'

describe('analyzeReceiptImage', () => {
  it('returns an AnalysisResult with title, date, and items', async () => {
    const result = await analyzeReceiptImage('data:image/png;base64,mockdata')
    expect(result.title).toBe('Test Restaurant')
    expect(typeof result.date).toBe('number')
    expect(Array.isArray(result.items)).toBe(true)
    expect(result.items.length).toBeGreaterThan(0)
  })

  it('each item has id, name, price, and empty shares', async () => {
    const result = await analyzeReceiptImage('data:image/png;base64,mockdata')
    for (const item of result.items) {
      expect(typeof item.id).toBe('string')
      expect(typeof item.name).toBe('string')
      expect(typeof item.price).toBe('number')
      expect(item.shares).toEqual([])
    }
  })

  it('delegates to analyzeWithGemini', async () => {
    const { analyzeWithGemini } = await import('../../src/services/gemini')
    await analyzeReceiptImage('data:image/png;base64,mockdata')
    expect(analyzeWithGemini).toHaveBeenCalledWith('data:image/png;base64,mockdata')
  })
})
