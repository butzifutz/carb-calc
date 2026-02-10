"use client"

import type { Favorite } from "@/hooks/use-carb-store"
import { X, Trash2, Star } from "lucide-react"

interface FavoritesManagerProps {
  favorites: Favorite[]
  onDelete: (index: number) => void
  onClose: () => void
}

export function FavoritesManager({ favorites, onDelete, onClose }: FavoritesManagerProps) {
  const getLabel = (fav: Favorite) => {
    if (fav.type === "KH100") return `${fav.value}g/100g`
    if (fav.type === "FAKTOR") return `Faktor x${fav.value}`
    return `Teiler /${fav.value}`
  }

  return (
    <section className="mt-4 bg-card rounded-xl p-4 shadow-md" aria-label="Favoriten verwalten">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h2 className="font-bold text-card-foreground text-sm uppercase tracking-wide">
            Favoriten verwalten
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-card-foreground transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="text-center py-5 text-muted-foreground text-sm">
          Keine Favoriten vorhanden
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {favorites.map((fav, index) => (
            <li key={`${fav.name}-${index}`} className="flex items-center justify-between py-2.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground truncate">{fav.name}</p>
                <p className="text-xs text-muted-foreground">{getLabel(fav)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Favorit wirklich entfernen?")) {
                    onDelete(index)
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium active:bg-destructive/20 transition-colors"
                aria-label={`${fav.name} entfernen`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only md:not-sr-only">Entfernen</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
