"use client"

import { calculateCarbs } from "@/hooks/use-carb-store"
import type { Favorite } from "@/hooks/use-carb-store"
import { Zap } from "lucide-react"

interface TopFavorite extends Favorite {
  usageCount: number
  avgWeight: number
}

interface QuickAddButtonsProps {
  topFavorites: TopFavorite[]
  onQuickAdd: (name: string, weight: number, type: Favorite["type"], value: number) => void
}

export function QuickAddButtons({ topFavorites, onQuickAdd }: QuickAddButtonsProps) {
  if (topFavorites.length === 0) return null

  return (
    <section className="mb-3" aria-label="Schnell hinzufügen">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="h-4 w-4 text-foreground/80" />
        <span className="text-xs text-foreground/80 font-semibold uppercase tracking-wide">
          Schnell hinzufügen
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {topFavorites.map((fav) => {
          const avgCarbs = calculateCarbs(fav.avgWeight, fav.type, fav.value)
          return (
            <button
              key={fav.name}
              type="button"
              onClick={() => onQuickAdd(fav.name, fav.avgWeight, fav.type, fav.value)}
              className="bg-card text-card-foreground rounded-lg px-3 py-3 text-sm font-semibold shadow-sm active:scale-95 transition-transform min-h-[60px] flex flex-col items-center justify-center"
            >
              <span className="text-xl font-bold text-primary block mb-0.5">
                {avgCarbs.toFixed(0)}g
              </span>
              <span className="truncate max-w-full">{fav.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
