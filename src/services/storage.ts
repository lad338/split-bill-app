import { openDB, type IDBPDatabase } from 'idb'
import type { Receipt } from '../types'

const DB_NAME = 'split-bill'
const DB_VERSION = 1

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('receipts')) {
        db.createObjectStore('receipts', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta')
      }
    },
  })
}

export async function saveReceipt(receipt: Receipt): Promise<void> {
  const db = await getDB()
  const { imageData: _, ...toStore } = receipt
  await db.put('receipts', toStore)
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  const db = await getDB()
  return (await db.get('receipts', id)) ?? null
}

export async function getAllReceipts(): Promise<Receipt[]> {
  const db = await getDB()
  return db.getAll('receipts')
}

export async function hardDeleteReceipt(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('receipts', id)
}

export async function getSoftDeletedReceipts(): Promise<Receipt[]> {
  const db = await getDB()
  const all = await db.getAll('receipts')
  return all.filter((r: Receipt) => !!r.deletedAt)
}

export async function hardDeleteAllSoftDeleted(): Promise<void> {
  const db = await getDB()
  const all = await db.getAll('receipts')
  const softDeleted = all.filter((r: Receipt) => !!r.deletedAt)
  await Promise.all(softDeleted.map((r: Receipt) => db.delete('receipts', r.id)))
}

export async function softDeleteAllReceipts(): Promise<void> {
  const db = await getDB()
  const all = await db.getAll('receipts')
  const active = all.filter((r: Receipt) => !r.deletedAt)
  const now = Date.now()
  await Promise.all(active.map((r: Receipt) => db.put('receipts', { ...r, deletedAt: now })))
}

export async function savePeopleHistory(names: string[]): Promise<void> {
  const db = await getDB()
  await db.put('meta', names, 'peopleHistory')
}

export async function getPeopleHistory(): Promise<string[]> {
  const db = await getDB()
  return (await db.get('meta', 'peopleHistory')) ?? []
}
