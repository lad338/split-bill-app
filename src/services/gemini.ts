import { GoogleGenAI } from '@google/genai'
import { nanoid } from 'nanoid'
import { getGeminiKey } from './geminiKey'
import type { ReceiptItem } from '../types'

export interface AnalysisResult {
  title: string       // merchant name or empty string
  date?: number       // Unix ms, undefined if not on receipt
  items: ReceiptItem[]
}

const PROMPT = `You are a receipt parser. Extract data from the receipt image and return ONLY valid JSON with no extra text, code fences, or explanation.

If a valid receipt is found, return:
{
  "title": "<merchant name or empty string>",
  "date": "<YYYY-MM-DD or null>",
  "items": [
    { "name": "<item name>", "price": <number> }
  ]
}

Rules:
- Include only individual line items. Exclude subtotals and totals.
- Tax and tips should be separated item entries.
- Skip any items with a price of $0.
- Prices are positive numbers. If there is a discount, return the discounted price as the item price, not the original price.
- For items with add-ons or modifiers (e.g. extra meat, extra sauce): either combine into one entry with the total price, or list each as a separate entry with its individual price — whichever is clearer given the receipt layout.
- If you cannot read the receipt or no receipt is present, return: { "error": "<reason>" }`

export async function analyzeWithGemini(imageData: string): Promise<AnalysisResult> {
  const apiKey = getGeminiKey()
  if (!apiKey) throw new Error('Gemini API key is not set')

  // Parse "data:<mimeType>;base64,<data>" format
  const match = imageData.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid image data format')
  const [, mimeType, base64Data] = match

  const ai = new GoogleGenAI({ apiKey })
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      parts: [
        { text: PROMPT },
        { inlineData: { mimeType, data: base64Data } },
      ],
    }],
  })

  const raw = result.text  // .text is a getter (string | undefined), not a method, in @google/genai
  if (!raw) throw new Error('No text in AI response')

  // Strip optional markdown code fences (e.g. ```json ... ```)
  const text = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()

  let parsed: { title?: string; date?: string | null; items?: { name: string; price: number }[]; error?: string }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse AI response')
  }

  if (parsed.error) throw new Error(parsed.error)

  return {
    title: parsed.title ?? '',
    date: parsed.date ? new Date(parsed.date).getTime() : undefined,
    items: (parsed.items ?? []).map(item => ({
      id: nanoid(),
      name: item.name,
      price: item.price,
      shares: [],
    })),
  }
}
