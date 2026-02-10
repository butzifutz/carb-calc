"use client"

import { useState, useCallback, useEffect } from "react"

// === Types ===
export interface Favorite {
  name: string
  type: "KH100" | "FAKTOR" | "TEILER"
  value: number
}

export interface FavoriteUsageEntry {
  weight: number
  timestamp: number
}

export interface FavoriteUsage {
  favName: string
  usages: FavoriteUsageEntry[]
  avgWeight: number
}

export interface HistoryItem {
  name: string
  carbs: number
}

export interface HistoryEntry {
  date: string
  items: HistoryItem[]
  total: number
}

export interface CarbRow {
  id: string
  weight: number
  type: "KH100" | "FAKTOR" | "TEILER"
  value: number
  name: string
  carbs: number
}

// === Calculation ===
export function calculateCarbs(
  weight: number,
  type: "KH100" | "FAKTOR" | "TEILER",
  value: number
): number {
  let factor = 0
  if (type === "FAKTOR") factor = value
  if (type === "TEILER" && value !== 0) factor = 1 / value
  if (type === "KH100") factor = value / 100
  return weight * factor
}

// === localStorage helpers ===
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// === Hook ===
export function useCarbStore() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [usage, setUsage] = useState<FavoriteUsage[]>([])
  const [rows, setRows] = useState<CarbRow[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadFromStorage<Favorite[]>("kh_favorites", []))
    setHistory(loadFromStorage<HistoryEntry[]>("kh_history", []))
    setUsage(loadFromStorage<FavoriteUsage[]>("kh_favorite_usage", []))
    setIsLoaded(true)
  }, [])

  // Total carbs
  const totalCarbs = rows.reduce((sum, row) => sum + row.carbs, 0)

  // === Row management ===
  const addRow = useCallback((preset?: { name: string; weight: number; type: CarbRow["type"]; value: number }) => {
    const id = crypto.randomUUID()
    const weight = preset?.weight ?? 0
    const type = preset?.type ?? "KH100"
    const value = preset?.value ?? 0
    const carbs = calculateCarbs(weight, type, value)

    setRows((prev) => [
      ...prev,
      { id, weight, type, value, name: preset?.name ?? "", carbs },
    ])
  }, [])

  const updateRow = useCallback((id: string, updates: Partial<Omit<CarbRow, "id" | "carbs">>) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row
        const updated = { ...row, ...updates }
        updated.carbs = calculateCarbs(updated.weight, updated.type, updated.value)
        return updated
      })
    )
  }, [])

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }, [])

  const clearRows = useCallback(() => {
    // Save to history before clearing
    const items = rows
      .filter((r) => r.weight > 0 && r.value > 0)
      .map((r) => ({ name: r.name || "Lebensmittel", carbs: r.carbs }))

    if (items.length > 0) {
      const total = items.reduce((sum, i) => sum + i.carbs, 0)
      const newEntry: HistoryEntry = {
        date: new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        items,
        total,
      }
      const newHistory = [newEntry, ...history].slice(0, 20)
      setHistory(newHistory)
      saveToStorage("kh_history", newHistory)
    }

    setRows([])
  }, [rows, history])

  // === Favorites ===
  const addFavorite = useCallback((fav: Favorite) => {
    setFavorites((prev) => {
      const updated = [...prev, fav]
      saveToStorage("kh_favorites", updated)
      return updated
    })
  }, [])

  const deleteFavorite = useCallback((index: number) => {
    setFavorites((prev) => {
      const deleted = prev[index]
      const updated = prev.filter((_, i) => i !== index)
      saveToStorage("kh_favorites", updated)

      // Also remove usage tracking
      if (deleted) {
        setUsage((prevUsage) => {
          const updatedUsage = prevUsage.filter((u) => u.favName !== deleted.name)
          saveToStorage("kh_favorite_usage", updatedUsage)
          return updatedUsage
        })
      }

      return updated
    })
  }, [])

  // === Usage tracking ===
  const trackUsage = useCallback((favName: string, weight: number) => {
    if (!favName || weight <= 0) return

    setUsage((prev) => {
      const updated = [...prev]
      let entry = updated.find((u) => u.favName === favName)

      if (!entry) {
        entry = { favName, usages: [], avgWeight: 0 }
        updated.push(entry)
      }

      entry.usages.push({ weight, timestamp: Date.now() })
      if (entry.usages.length > 10) entry.usages.shift()

      const totalWeight = entry.usages.reduce((sum, u) => sum + u.weight, 0)
      entry.avgWeight = Math.round(totalWeight / entry.usages.length)

      saveToStorage("kh_favorite_usage", updated)
      return updated
    })
  }, [])

  const getTopFavorites = useCallback(
    (limit = 4) => {
      return favorites
        .map((fav) => {
          const usageData = usage.find((u) => u.favName === fav.name)
          return {
            ...fav,
            usageCount: usageData ? usageData.usages.length : 0,
            avgWeight: usageData ? usageData.avgWeight : 0,
          }
        })
        .filter((f) => f.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit)
    },
    [favorites, usage]
  )

  return {
    rows,
    totalCarbs,
    favorites,
    history,
    isLoaded,
    addRow,
    updateRow,
    deleteRow,
    clearRows,
    addFavorite,
    deleteFavorite,
    trackUsage,
    getTopFavorites,
  }
}
