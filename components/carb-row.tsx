"use client"

import type { CarbRow as CarbRowType, Favorite } from "@/hooks/use-carb-store"
import { Star, Trash2 } from "lucide-react"

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

  // Determine select display value
  const selectValue = row.name
    ? (() => {
        const idx = favorites.findIndex(
          (f) => f.name === row.name && f.type === row.type && f.value === row.value
        )
        return idx >= 0 ? `fav:${idx}` : row.type
      })()
    : row.type

  const typeLabel =
    row.type === "KH100"
      ? "KH/100g"
      : row.type === "FAKTOR"
        ? "Faktor"
        : "Teiler"

  return (
    <div className="grid grid-cols-[1fr_50px_50px_50px] grid-rows-[auto_auto] gap-1 p-2 bg-muted rounded-lg md:grid-cols-[80px_100px_1fr_80px_40px_40px] md:grid-rows-1 md:gap-2 md:p-0 md:bg-transparent md:rounded-none md:border-b md:border-border md:pb-2.5 md:mb-2.5 md:last:border-b-0 md:last:pb-0 md:last:mb-0">
      {/* Row 1: Weight input */}
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        placeholder="Gramm"
        value={row.weight || ""}
        onChange={(e) => onUpdate(row.id, { weight: parseFloat(e.target.value) || 0 })}
        onBlur={() => {
          if (row.name && row.weight > 0) {
            onWeightCommit(row.name, row.weight)
          }
        }}
        className="col-span-2 md:col-span-1 row-start-1 min-h-[38px] md:min-h-[48px] rounded-lg border border-input bg-card text-card-foreground px-2 py-1.5 text-[15px] md:text-base font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        aria-label="Gewicht in Gramm"
      />

      {/* Row 1: Carb value display */}
      <div
        className="col-start-3 col-span-2 md:col-start-4 md:col-span-1 row-start-1 flex items-center justify-center text-lg md:text-xl font-extrabold text-primary bg-card rounded-lg px-1 py-2 shadow-sm md:shadow-none md:text-right md:bg-transparent"
        aria-live="polite"
        aria-label="Berechnete Kohlenhydrate"
      >
        {row.carbs.toFixed(1)}g
      </div>

      {/* Row 2: Type select */}
      <select
        value={selectValue}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="col-start-1 row-start-2 md:col-start-2 md:row-start-1 min-h-[38px] md:min-h-[48px] rounded-lg border border-input bg-card text-card-foreground px-2 py-1 text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        aria-label={`Berechnungstyp: ${typeLabel}`}
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

      {/* Row 2: Value input */}
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="Wert"
        value={row.value || ""}
        onChange={(e) => onUpdate(row.id, { value: parseFloat(e.target.value) || 0 })}
        className="col-start-2 row-start-2 md:col-start-3 md:row-start-1 min-h-[38px] md:min-h-[48px] rounded-lg border border-input bg-card text-card-foreground px-1.5 py-1 text-[13px] md:text-base text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        aria-label="KH-Wert"
      />

      {/* Row 2: Action buttons */}
      <div className="col-start-3 col-span-2 row-start-2 md:col-start-5 md:col-span-2 md:row-start-1 flex gap-1">
        <button
          type="button"
          onClick={() => onSaveFavorite(row)}
          className="flex-1 min-h-[38px] md:min-h-[44px] flex items-center justify-center rounded-lg bg-card border border-input text-card-foreground active:bg-amber-50 transition-colors"
          title="Als Favorit speichern"
          aria-label="Als Favorit speichern"
        >
          <Star className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          className="flex-1 min-h-[38px] md:min-h-[44px] flex items-center justify-center rounded-lg bg-card border border-input text-card-foreground active:bg-red-50 transition-colors"
          title="Eintrag entfernen"
          aria-label="Eintrag entfernen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
