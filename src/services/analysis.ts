import { analyzeWithGemini } from './gemini'
import type { AnalysisResult } from './gemini'

export type { AnalysisResult }

/**
 * Analyzes a receipt image using the configured AI provider.
 * Currently uses Google Gemini. Extend this function to support
 * additional providers in the future.
 *
 * Requires a Gemini API key to be set via setGeminiKey().
 * Throws on API errors, missing key, or unreadable receipt.
 */
export async function analyzeReceiptImage(imageData: string): Promise<AnalysisResult> {
  return analyzeWithGemini(imageData)
}
