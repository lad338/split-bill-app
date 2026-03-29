import { describe, it, expect, beforeEach } from 'vitest'
import { getGeminiKey, setGeminiKey, clearGeminiKey } from './geminiKey'

beforeEach(() => localStorage.clear())

describe('geminiKey', () => {
  it('returns null when no key is stored', () => {
    expect(getGeminiKey()).toBeNull()
  })

  it('returns the stored key after setGeminiKey', () => {
    setGeminiKey('my-api-key')
    expect(getGeminiKey()).toBe('my-api-key')
  })

  it('overwrites an existing key', () => {
    setGeminiKey('old-key')
    setGeminiKey('new-key')
    expect(getGeminiKey()).toBe('new-key')
  })

  it('returns null after clearGeminiKey', () => {
    setGeminiKey('my-api-key')
    clearGeminiKey()
    expect(getGeminiKey()).toBeNull()
  })
})
