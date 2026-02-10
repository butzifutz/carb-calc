"use client"

import { useState } from "react"
import type { CarbRow as CarbRowType, Favorite } from "@/hooks/use-carb-store"
import { Star, X } from "lucide-react"

const TYPE_LABELS: Record<CarbRowType["type"], string> = {
  KH100: "100g",
  TEILER: "Teiler",
  FAKTOR: "Faktor",
}

const TYPE_ORDER: CarbRowType["type"][] = ["KH100", "TEILER", "FAKTOR"]

/**
 * Convert a value from one type to another so that the KH result stays the same.
 *
 * All types express the same concept — "how many g carbs per g food" — but differently:
 *   KH100:  factor = value / 100     (value = g carbs per 100 g)
 *   FAKTOR: factor = value            (value = direct multiplier)
 *   TEILER: factor = 1 / value        (value = divisor)
 *
 * So to convert we first get the factor from the old type, then convert it to the new type.
 */
function convertValue(
  oldType: CarbRowType["type"],
  newType: CarbRowType["type"],
  value: number,
): number {
  if (oldType === newType || value === 0) return value

  // Old value -> factor
  let factor = 0
  if (oldType === "KH100") factor = value / 100
  else if (oldType === "FAKTOR") factor = value
  else if (oldType === "TEILER" && value !== 0) factor = 1 / value

  if (factor === 0) return 0

  // Factor -> new value
  if (newType === "KH100") return Math.round(factor * 100 * 1000) / 1000
  if (newType === "FAKTOR") return Math.round(factor * 1000) / 1000
  if (newType === "TEILER" && factor !== 0) return Math.round((1 / factor) * 1000) / 1000

  return 0
}

interface CarbRowProps {
  row: CarbRowType
  favorites: Favorite[]
  onUpdate: (id: string, updates: Partial<Omit<CarbRowType, "id" | "carbs">>) => void
  onDelete: (id: string) => void
  onSaveFavorite: (row: CarbRowType) => void
  onLoadFavorite: (rowId: string, fav: Favorite) => void
  onWeightCommit: (name: string, weight: number) => void
}

export function CarbRow({
  row,
  favorites,
  onUpdate,
  onDelete,
  onSaveFavorite,
  onLoadFavorite,
  onWeightCommit,
}: CarbRowProps) {
  const [starOpen, setStarOpen] = useState(false)

  const isFavorited = row.name
    ? favorites.some((f) => f.name === row.name && f.type === row.type && f.value === row.value)
    : false

  const getTypeHint = (fav: Favorite) => {
    if (fav.type === "KH100") return `${fav.value}g/100g`
    if (fav.type === "FAKTOR") return `\u00d7${fav.value}`
    return `\u00f7${fav.value}`
  }

  const handleTypeChange = (newType: CarbRowType["type"]) => {
    const newValue = convertValue(row.type, newType, row.value)
    onUpdate(row.id, { type: newType, value: newValue })
  }

  return (
    <>
      <div className="py-2 border-b border-border last:border-b-0">
        {/* Row 1: Weight | Value | KH result | Delete */}
        <div className="flex items-center gap-1.5">
          {/* Name badge (if favorite loaded) */}
          {row.name && (
            <span className="text-[11px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 truncate max-w-[80px]">
              {row.name}
            </span>
          )}

          {/* Weight */}
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="0"
              value={row.weight || ""}
              onChange={(e) =>
                onUpdate(row.id, { weight: Number.parseFloat(e.target.value) || 0 })
              }
              onBlur={() => {
                if (row.name && row.weight > 0) onWeightCommit(row.name, row.weight)
              }}
              className="w-[52px] h-8 rounded-md border border-input bg-card text-card-foreground px-1 text-sm font-semibold text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              aria-label="Gewicht in Gramm"
            />
            <span className="text-[10px] text-muted-foreground">g</span>
          </div>

          {/* Type prefix + Value */}
          <div className="ml-auto flex items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground font-medium">
              {row.type === "KH100" ? "KH" : row.type === "TEILER" ? "\u00f7" : "\u00d7"}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0"
              value={row.value || ""}
              onChange={(e) =>
                onUpdate(row.id, { value: Number.parseFloat(e.target.value) || 0 })
              }
              className="w-[48px] h-8 rounded-md border border-input bg-card text-card-foreground px-1 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              aria-label="KH-Wert"
            />
          </div>

          {/* = KH result */}
          <div className="flex items-center gap-0.5">
            <span className="text-muted-foreground text-[10px]">=</span>
            <span
              className="w-[44px] text-right text-sm font-extrabold text-primary tabular-nums"
              aria-live="polite"
              aria-label="Berechnete Kohlenhydrate"
            >
              {row.carbs.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground">g</span>
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            className="h-7 w-7 shrink-0 flex items-center justify-center rounded text-muted-foreground active:text-destructive transition-colors"
            title="Entfernen"
            aria-label="Eintrag entfernen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: Type chips + Star chip */}
        <div className="flex items-center gap-1 mt-1.5">
          {TYPE_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`h-6 px-2 rounded-full text-[10px] font-semibold transition-colors ${
                row.type === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground active:bg-muted/70"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}

          {/* Star chip */}
          <button
            type="button"
            onClick={() => setStarOpen(true)}
            className={`h-6 w-6 flex items-center justify-center rounded-full transition-colors ml-auto ${
              isFavorited
                ? "bg-amber-100 text-amber-600"
                : "bg-muted text-muted-foreground active:bg-muted/70"
            }`}
            aria-label="Favoriten"
          >
            <Star className={`h-3 w-3 ${isFavorited ? "fill-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Star overlay — centered modal */}
      {starOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStarOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Favoriten"
        >
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-[90%] max-w-[340px] p-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Save current row */}
            <button
              type="button"
              onClick={() => {
                setStarOpen(false)
                onSaveFavorite(row)
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-card-foreground active:bg-muted transition-colors"
              disabled={!row.type || !row.value}
            >
              <Star className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Als Favorit speichern</span>
            </button>

            {/* Existing favorites */}
            {favorites.length > 0 && (
              <>
                <div className="border-t border-border my-2" />
                <p className="px-3 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                  Favorit laden
                </p>
                <div className="max-h-[40vh] overflow-y-auto -mx-1 px-1">
                  {favorites.map((fav, i) => (
                    <button
                      key={`${fav.name}-${i}`}
                      type="button"
                      onClick={() => {
                        onLoadFavorite(row.id, fav)
                        setStarOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm active:bg-muted transition-colors"
                    >
                      <span className="font-medium text-card-foreground truncate">
                        {fav.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                        {getTypeHint(fav)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Close */}
            <div className="border-t border-border mt-2 pt-2">
              <button
                type="button"
                onClick={() => setStarOpen(false)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground active:bg-muted transition-colors text-center"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
