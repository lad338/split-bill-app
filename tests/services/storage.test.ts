import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import {
  saveReceipt, getReceipt, getAllReceipts, hardDeleteReceipt,
  getSoftDeletedReceipts, hardDeleteAllSoftDeleted, softDeleteAllReceipts,
  savePeopleHistory, getPeopleHistory,
} from '../../src/services/storage'
import type { Receipt } from '../../src/types'

function makeReceipt(id: string): Receipt {
  return {
    id, title: 'Test Receipt', createdAt: 1000, updatedAt: 1000,
    paidBy: '',
    people: [{ id: 'p1', name: 'Alice' }],
    items: [],
    settlements: [],
  }
}

describe('storage', () => {
  it('saves and retrieves a receipt', async () => {
    const receipt = makeReceipt('r1')
    await saveReceipt(receipt)
    expect(await getReceipt('r1')).toEqual(receipt)
  })

  it('returns null for missing receipt', async () => {
    expect(await getReceipt('nonexistent')).toBeNull()
  })

  it('getAllReceipts returns saved receipts', async () => {
    await saveReceipt(makeReceipt('r2'))
    await saveReceipt(makeReceipt('r3'))
    const all = await getAllReceipts()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('saveReceipt strips imageData before writing to IDB', async () => {
    const receipt: Receipt = {
      ...makeReceipt('r-img'),
      imageData: 'data:image/png;base64,abc123',
    }
    await saveReceipt(receipt)
    const stored = await getReceipt('r-img')
    expect(stored?.imageData).toBeUndefined()
  })

  it('saves and retrieves people history', async () => {
    await savePeopleHistory(['Alice', 'Bob'])
    expect(await getPeopleHistory()).toEqual(['Alice', 'Bob'])
  })
})

describe('hardDeleteReceipt', () => {
  it('removes the receipt from IDB', async () => {
    const receipt: Receipt = { id: 'r-hard', title: 'X', createdAt: 0, updatedAt: 0, people: [], items: [], settlements: [] }
    await saveReceipt(receipt)
    await hardDeleteReceipt('r-hard')
    expect(await getReceipt('r-hard')).toBeNull()
  })
})

describe('getSoftDeletedReceipts', () => {
  it('returns only receipts with deletedAt set', async () => {
    const active: Receipt = { id: 'r-active', title: 'A', createdAt: 0, updatedAt: 0, people: [], items: [], settlements: [] }
    const deleted: Receipt = { id: 'r-deleted', title: 'D', createdAt: 0, updatedAt: 0, deletedAt: 1000, people: [], items: [], settlements: [] }
    await saveReceipt(active)
    await saveReceipt(deleted)
    const result = await getSoftDeletedReceipts()
    expect(result.map(r => r.id)).toContain('r-deleted')
    expect(result.map(r => r.id)).not.toContain('r-active')
  })
})

describe('hardDeleteAllSoftDeleted', () => {
  it('removes all soft-deleted receipts and leaves active ones', async () => {
    const active: Receipt = { id: 'r-keep', title: 'K', createdAt: 0, updatedAt: 0, people: [], items: [], settlements: [] }
    const deleted: Receipt = { id: 'r-gone', title: 'G', createdAt: 0, updatedAt: 0, deletedAt: 1000, people: [], items: [], settlements: [] }
    await saveReceipt(active)
    await saveReceipt(deleted)
    await hardDeleteAllSoftDeleted()
    expect(await getReceipt('r-keep')).not.toBeNull()
    expect(await getReceipt('r-gone')).toBeNull()
  })
})

describe('softDeleteAllReceipts', () => {
  it('sets deletedAt on all active receipts', async () => {
    const r: Receipt = { id: 'r-soft', title: 'S', createdAt: 0, updatedAt: 0, people: [], items: [], settlements: [] }
    await saveReceipt(r)
    await softDeleteAllReceipts()
    const updated = await getReceipt('r-soft')
    expect(updated?.deletedAt).toBeGreaterThan(0)
  })

  it('does not touch already-deleted receipts', async () => {
    const r: Receipt = { id: 'r-already', title: 'A', createdAt: 0, updatedAt: 0, deletedAt: 42, people: [], items: [], settlements: [] }
    await saveReceipt(r)
    await softDeleteAllReceipts()
    const updated = await getReceipt('r-already')
    expect(updated?.deletedAt).toBe(42)
  })
})
