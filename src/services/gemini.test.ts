import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage before importing modules that read it
const mockGetItem = vi.fn()
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: mockGetItem, setItem: vi.fn(), removeItem: vi.fn() },
  writable: true,
})

// Mock @google/genai
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}))

import { GoogleGenAI } from '@google/genai'
import { analyzeWithGemini } from './gemini'

function makeAI(responseText: string) {
  const generateContent = vi.fn().mockResolvedValue({ text: responseText })
  ;(GoogleGenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
    models: { generateContent },
  }))
  return generateContent
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetItem.mockReturnValue('test-api-key')
})

describe('analyzeWithGemini', () => {
  it('throws when no API key is stored', async () => {
    mockGetItem.mockReturnValue(null)
    await expect(analyzeWithGemini('data:image/jpeg;base64,abc')).rejects.toThrow(
      'Gemini API key is not set'
    )
  })

  it('maps a valid Gemini response to AnalysisResult', async () => {
    makeAI(JSON.stringify({
      title: 'Pasta Palace',
      date: '2026-03-15',
      items: [
        { name: 'Margherita Pizza', price: 14.00 },
        { name: 'House Wine', price: 24.00 },
      ],
    }))

    const result = await analyzeWithGemini('data:image/jpeg;base64,abc123')
    expect(result.title).toBe('Pasta Palace')
    expect(result.date).toBe(new Date('2026-03-15').getTime())
    expect(result.items).toHaveLength(2)
    expect(result.items[0].name).toBe('Margherita Pizza')
    expect(result.items[0].price).toBe(14.00)
    expect(result.items[0].shares).toEqual([])
    expect(typeof result.items[0].id).toBe('string')
  })

  it('sets date to undefined when Gemini returns null date', async () => {
    makeAI(JSON.stringify({ title: '', date: null, items: [] }))
    const result = await analyzeWithGemini('data:image/jpeg;base64,abc')
    expect(result.date).toBeUndefined()
  })

  it('throws the error message when Gemini returns an error field', async () => {
    makeAI(JSON.stringify({ error: 'No receipt found in the image.' }))
    await expect(analyzeWithGemini('data:image/jpeg;base64,abc')).rejects.toThrow(
      'No receipt found in the image.'
    )
  })

  it('throws when the response is not valid JSON', async () => {
    makeAI('not json at all')
    await expect(analyzeWithGemini('data:image/jpeg;base64,abc')).rejects.toThrow(
      'Failed to parse AI response'
    )
  })

  it('throws when the response text is empty', async () => {
    makeAI('')
    await expect(analyzeWithGemini('data:image/jpeg;base64,abc')).rejects.toThrow(
      'No text in AI response'
    )
  })

  it('parses a response wrapped in markdown code fences', async () => {
    makeAI('```json\n' + JSON.stringify({ title: 'Dollarama', date: '2026-03-27', items: [{ name: 'SINK CADDY', price: 3.00 }] }) + '\n```')
    const result = await analyzeWithGemini('data:image/jpeg;base64,abc')
    expect(result.title).toBe('Dollarama')
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('SINK CADDY')
  })

  it('strips the data URL prefix before sending to Gemini', async () => {
    const generateContent = makeAI(JSON.stringify({ title: '', date: null, items: [] }))
    await analyzeWithGemini('data:image/png;base64,iVBORw0KGgo=')
    const call = generateContent.mock.calls[0][0]
    const inlinePart = call.contents[0].parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData)
    expect(inlinePart.inlineData.data).toBe('iVBORw0KGgo=')
    expect(inlinePart.inlineData.mimeType).toBe('image/png')
  })
})
