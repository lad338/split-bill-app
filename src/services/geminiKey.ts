const KEY = 'gemini_api_key'

export const getGeminiKey = (): string | null => localStorage.getItem(KEY)
export const setGeminiKey = (key: string): void => localStorage.setItem(KEY, key)
export const clearGeminiKey = (): void => localStorage.removeItem(KEY)
