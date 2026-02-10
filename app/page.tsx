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
      <main className="max-w-[600px] mx-auto px-3 pt-3 pb-[160px]">
        {/* Quick Add */}
        <QuickAddButtons topFavorites={topFavorites} onQuickAdd={handleQuickAdd} />

        {/* Rows Container */}
        <div className="bg-card rounded-xl p-3 mb-3 shadow-md">
          {store.rows.length === 0 ? (
            <div className="text-center py-8" role="status">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">
                {"Keine Eintr\u00e4ge. Tippe auf \u201eHinzuf\u00fcgen\u201c, um zu starten."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 md:gap-0">
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
        <div className="max-w-[600px] mx-auto px-4 py-3">
          {/* Total Display */}
          <div className="text-center pb-3 mb-3 border-b border-border">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mr-2">
              Gesamt
            </span>
            <span className="text-3xl font-extrabold text-primary">
              {store.totalCarbs.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">g</span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-muted text-card-foreground font-semibold text-[15px] active:bg-muted/70 transition-colors min-h-[52px]"
            >
              <Trash2 className="h-4 w-4" />
              {"L\u00f6schen"}
            </button>
            <button
              type="button"
              onClick={() => store.addRow()}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] active:opacity-90 transition-opacity min-h-[52px]"
            >
              <Plus className="h-4 w-4" />
              {"Hinzuf\u00fcgen"}
            </button>
          </div>

          {/* Favorites toggle */}
          <button
            type="button"
            onClick={() => setShowFavorites(!showFavorites)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground active:bg-muted transition-colors"
          >
            <Star className="h-4 w-4" />
            Favoriten
          </button>
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
