"use client"

import type { HistoryEntry } from "@/hooks/use-carb-store"
import { BarChart3 } from "lucide-react"

interface HistorySectionProps {
  history: HistoryEntry[]
}

export function HistorySection({ history }: HistorySectionProps) {
  if (history.length === 0) return null

  return (
    <section className="mt-4 bg-card rounded-xl p-4 shadow-md" aria-label="Letzte Eintraege">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="font-bold text-card-foreground text-sm uppercase tracking-wide">
          Letzte Eintraege
        </h2>
      </div>

      <ul className="divide-y divide-border">
        {history.slice(0, 5).map((entry, index) => (
          <li key={`${entry.date}-${index}`} className="flex items-center justify-between py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-card-foreground truncate">
                {entry.items.map((i) => i.name).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">{entry.date}</p>
            </div>
            <span className="font-bold text-primary text-base ml-3">
              {entry.total.toFixed(1)}g
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
