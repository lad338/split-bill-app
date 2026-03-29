import { useState, useEffect, useCallback } from 'react'
import { getAllReceipts, saveReceipt, hardDeleteReceipt } from '../services/storage'
import type { Receipt } from '../types'

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const all = await getAllReceipts()
    const active = all.filter(r => !r.deletedAt)
    active.sort((a, b) => b.updatedAt - a.updatedAt)
    setReceipts(active)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const save = useCallback(async (receipt: Receipt) => {
    await saveReceipt({ ...receipt, updatedAt: Date.now() })
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await hardDeleteReceipt(id)
    await refresh()
  }, [refresh])

  return { receipts, loading, save, remove, refresh }
}
