"use client"

import type { CarbRow as CarbRowType, Favorite } from "@/hooks/use-carb-store"
import { Star, X } from "lucide-react"

interface CarbRowProps {
  row: CarbRowType
  favorites: Favorite[]
  onUpdate: (id: string, updates: Partial<Omit<CarbRowType, "id" | "carbs">>) => void
  onDelete: (id: string) => void
  onSaveFavorite: (row: CarbRowType) => void
  onWeightCommit: (name: string, weight: number) => void
}

export function CarbRow({
  row,
  favorites,
  onUpdate,
  onDelete,
  onSaveFavorite,
  onWeightCommit,
}: CarbRowProps) {
  const handleTypeChange = (rawValue: string) => {
    if (rawValue.startsWith("fav:")) {
      const favIndex = parseInt(rawValue.split(":")[1])
      const fav = favorites[favIndex]
      if (fav) {
        onUpdate(row.id, { type: fav.type, value: fav.value, name: fav.name })
      }
    } else {
      onUpdate(row.id, {
        type: rawValue as CarbRowType["type"],
        name: "",
      })
    }
  }

  const selectValue = row.name
    ? (() => {
        const idx = favorites.findIndex(
          (f) => f.name === row.name && f.type === row.type && f.value === row.value,
        )
        return idx >= 0 ? `fav:${idx}` : row.type
      })()
    : row.type

  return (
    <div className="flex items-center gap-1.5 py-1.5 border-b border-border last:border-b-0">
      {/* Weight */}
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        placeholder="g"
        value={row.weight || ""}
        onChange={(e) => onUpdate(row.id, { weight: parseFloat(e.target.value) || 0 })}
        onBlur={() => {
          if (row.name && row.weight > 0) {
            onWeightCommit(row.name, row.weight)
          }
        }}
        className="w-[60px] h-9 rounded-md border border-input bg-card text-card-foreground px-1.5 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        aria-label="Gewicht in Gramm"
      />

      {/* Type select */}
      <select
        value={selectValue}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="flex-1 min-w-0 h-9 rounded-md border border-input bg-card text-card-foreground px-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        aria-label="Berechnungstyp"
      >
        <option value="KH100">KH/100g</option>
        <option value="FAKTOR">Faktor</option>
        <option value="TEILER">Teiler</option>
        {favorites.length > 0 && (
          <optgroup label="Favoriten">
            {favorites.map((f, i) => {
              const label =
                f.type === "KH100"
                  ? `${f.value}g/100g`
                  : f.type === "FAKTOR"
                    ? `x${f.value}`
                    : `/${f.value}`
              return (
                <option key={`${f.name}-${i}`} value={`fav:${i}`}>
                  {f.name} ({label})
                </option>
              )
            })}
          </optgroup>
        )}
      </select>

      {/* Value input */}
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="Wert"
        value={row.value || ""}
        onChange={(e) => onUpdate(row.id, { value: parseFloat(e.target.value) || 0 })}
        className="w-[52px] h-9 rounded-md border border-input bg-card text-card-foreground px-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        aria-label="KH-Wert"
      />

      {/* Carb result */}
      <span
        className="w-[52px] text-right text-sm font-extrabold text-primary tabular-nums shrink-0"
        aria-live="polite"
        aria-label="Berechnete Kohlenhydrate"
      >
        {row.carbs.toFixed(1)}
      </span>

      {/* Save favorite */}
      <button
        type="button"
        onClick={() => onSaveFavorite(row)}
        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md text-muted-foreground active:text-amber-500 transition-colors"
        title="Als Favorit speichern"
        aria-label="Als Favorit speichern"
      >
        <Star className="h-3.5 w-3.5" />
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(row.id)}
        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md text-muted-foreground active:text-destructive transition-colors"
        title="Entfernen"
        aria-label="Eintrag entfernen"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
