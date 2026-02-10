"use client"

import { useState, useRef, useEffect } from "react"
import type { CarbRow as CarbRowType, Favorite } from "@/hooks/use-carb-store"
import { Star, X } from "lucide-react"

const TYPE_LABELS: Record<CarbRowType["type"], string> = {
  KH100: "100g",
  TEILER: "Teiler",
  FAKTOR: "Faktor",
}

const TYPE_ORDER: CarbRowType["type"][] = ["KH100", "TEILER", "FAKTOR"]

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
  const popRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    if (!starOpen) return
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setStarOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [starOpen])

  const isFavorited = row.name
    ? favorites.some((f) => f.name === row.name && f.type === row.type && f.value === row.value)
    : false

  const getTypeHint = (fav: Favorite) => {
    if (fav.type === "KH100") return `${fav.value}g/100g`
    if (fav.type === "FAKTOR") return `x${fav.value}`
    return `/${fav.value}`
  }

  return (
    <div className="py-2 border-b border-border last:border-b-0">
      {/* Row 1: Weight | Value | KH result | Delete */}
      <div className="flex items-center gap-2">
        {/* Name badge (if favorite loaded) */}
        {row.name && (
          <span className="text-[11px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 truncate max-w-[90px]">
            {row.name}
          </span>
        )}

        {/* Weight */}
        <div className="flex items-center gap-1">
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
            className="w-[56px] h-9 rounded-md border border-input bg-card text-card-foreground px-1.5 text-sm font-semibold text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            aria-label="Gewicht in Gramm"
          />
          <span className="text-[11px] text-muted-foreground">g</span>
        </div>

        {/* Value */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground">
            {row.type === "KH100" ? "KH" : row.type === "TEILER" ? "/" : "x"}
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
            className="w-[52px] h-9 rounded-md border border-input bg-card text-card-foreground px-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            aria-label="KH-Wert"
          />
        </div>

        {/* = KH result */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">=</span>
          <span
            className="w-[50px] text-right text-sm font-extrabold text-primary tabular-nums"
            aria-live="polite"
            aria-label="Berechnete Kohlenhydrate"
          >
            {row.carbs.toFixed(1)}
          </span>
          <span className="text-[11px] text-muted-foreground">g</span>
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
            onClick={() => onUpdate(row.id, { type: t })}
            className={`h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
              row.type === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground active:bg-muted/70"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}

        {/* Star chip with popover */}
        <div className="relative ml-auto" ref={popRef}>
          <button
            type="button"
            onClick={() => setStarOpen(!starOpen)}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-colors ${
              isFavorited
                ? "bg-amber-100 text-amber-600"
                : "bg-muted text-muted-foreground active:bg-muted/70"
            }`}
            aria-label="Favoriten"
            aria-expanded={starOpen}
          >
            <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-amber-500" : ""}`} />
          </button>

          {/* Popover */}
          {starOpen && (
            <div className="absolute right-0 bottom-9 z-50 w-56 bg-card rounded-xl shadow-xl border border-border p-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Save as favorite */}
              <button
                type="button"
                onClick={() => {
                  setStarOpen(false)
                  onSaveFavorite(row)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-card-foreground active:bg-muted transition-colors"
                disabled={!row.type || !row.value}
              >
                <Star className="h-4 w-4 text-amber-500" />
                Als Favorit speichern
              </button>

              {/* Divider + existing favorites */}
              {favorites.length > 0 && (
                <>
                  <div className="border-t border-border my-1" />
                  <p className="px-3 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                    Laden
                  </p>
                  <div className="max-h-[200px] overflow-y-auto">
                    {favorites.map((fav, i) => (
                      <button
                        key={`${fav.name}-${i}`}
                        type="button"
                        onClick={() => {
                          onLoadFavorite(row.id, fav)
                          setStarOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm active:bg-muted transition-colors"
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
