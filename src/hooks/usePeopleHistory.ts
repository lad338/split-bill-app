import { useState, useEffect, useCallback } from 'react'
import { getPeopleHistory, savePeopleHistory } from '../services/storage'

export function usePeopleHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    getPeopleHistory().then(setHistory)
  }, [])

  const addName = useCallback(async (name: string) => {
    const updated = [name, ...history.filter(n => n !== name)].slice(0, 50)
    await savePeopleHistory(updated)
    setHistory(updated)
  }, [history])

  return { history, addName }
}
