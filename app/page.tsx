"use client"

import { useState, useCallback } from "react"
import { useCarbStore } from "@/hooks/use-carb-store"
import type { CarbRow as CarbRowType } from "@/hooks/use-carb-store"
import { QuickAddButtons } from "@/components/quick-add-buttons"
import { CarbRow } from "@/components/carb-row"
import { FavoritesManager } from "@/components/favorites-manager"
import { HistorySection } from "@/components/history-section"
import { FavoriteModal } from "@/components/favorite-modal"
import { Plus, Trash2, Star, UtensilsCrossed } from "lucide-react"

export default function CarbCalcPage() {
  const store = useCarbStore()
  const [showFavorites, setShowFavorites] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRow, setModalRow] = useState<CarbRowType | null>(null)

  const topFavorites = store.getTopFavorites(4)

  const handleQuickAdd = useCallback(
    (name: string, weight: number, type: CarbRowType["type"], value: number) => {
      store.trackUsage(name, weight)
      store.addRow({ name, weight, type, value })
    },
    [store]
  )

  const handleSaveFavorite = useCallback((row: CarbRowType) => {
    if (!row.type || !row.value) {
      alert("Bitte zuerst Typ und Wert eingeben.")
      return
    }
    setModalRow(row)
    setModalOpen(true)
  }, [])

  const handleModalSave = useCallback(
    (name: string) => {
      if (modalRow) {
        store.addFavorite({ name, type: modalRow.type, value: modalRow.value })
      }
      setModalOpen(false)
      setModalRow(null)
    },
    [modalRow, store]
  )

  const handleWeightCommit = useCallback(
    (name: string, weight: number) => {
      store.trackUsage(name, weight)
    },
    [store]
  )

  const handleClear = useCallback(() => {
    if (store.rows.length === 0) return
    if (window.confirm("Alle Eintr\u00e4ge l\u00f6schen?")) {
      store.clearRows()
    }
  }, [store])

  if (!store.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-foreground/60 text-sm">Laden...</div>
      </div>
    )
  }

  return (
    <>
      <main className="max-w-[600px] mx-auto px-3 pt-3 pb-[80px]">
        {/* Quick Add */}
        <QuickAddButtons topFavorites={topFavorites} onQuickAdd={handleQuickAdd} />

        {/* Rows Container */}
        <div className="bg-card rounded-xl p-3 mb-3 shadow-md">
          {store.rows.length === 0 ? (
            <div className="text-center py-6" role="status">
              <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-sm">
                {"Keine Eintr\u00e4ge. Tippe auf \u201eNeu\u201c, um zu starten."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Column headers */}
              <div className="flex items-center gap-1.5 pb-1.5 mb-0.5 border-b border-border">
                <span className="w-[60px] text-[10px] text-muted-foreground font-semibold uppercase text-center">Gramm</span>
                <span className="flex-1 min-w-0 text-[10px] text-muted-foreground font-semibold uppercase">Typ</span>
                <span className="w-[52px] text-[10px] text-muted-foreground font-semibold uppercase text-center">Wert</span>
                <span className="w-[52px] text-[10px] text-muted-foreground font-semibold uppercase text-right">KH</span>
                <span className="w-8" />
                <span className="w-8" />
              </div>
              {store.rows.map((row) => (
                <CarbRow
                  key={row.id}
                  row={row}
                  favorites={store.favorites}
                  onUpdate={store.updateRow}
                  onDelete={store.deleteRow}
                  onSaveFavorite={handleSaveFavorite}
                  onWeightCommit={handleWeightCommit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Favorites Manager */}
        {showFavorites && (
          <FavoritesManager
            favorites={store.favorites}
            onDelete={store.deleteFavorite}
            onClose={() => setShowFavorites(false)}
          />
        )}

        {/* History */}
        <HistorySection history={store.history} />
      </main>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-[600px] mx-auto px-3 py-2">
          {/* Row 1: Total + Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Total */}
            <div className="flex items-baseline gap-1 mr-auto pl-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                KH
              </span>
              <span className="text-2xl font-extrabold text-primary tabular-nums">
                {store.totalCarbs.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">g</span>
            </div>

            {/* Favorites toggle */}
            <button
              type="button"
              onClick={() => setShowFavorites(!showFavorites)}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground active:bg-muted transition-colors"
              aria-label="Favoriten anzeigen"
            >
              <Star className="h-4 w-4" />
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={handleClear}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted text-card-foreground active:bg-muted/70 transition-colors"
              aria-label="Alle Eintraege loeschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Add */}
            <button
              type="button"
              onClick={() => store.addRow()}
              className="h-10 px-5 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm active:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Neu
            </button>
          </div>
        </div>
      </footer>

      {/* Save Favorite Modal */}
      <FavoriteModal
        isOpen={modalOpen}
        defaultName={modalRow?.name ?? ""}
        onSave={handleModalSave}
        onClose={() => {
          setModalOpen(false)
          setModalRow(null)
        }}
      />
    </>
  )
}
