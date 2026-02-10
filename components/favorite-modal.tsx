"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"

interface FavoriteModalProps {
  isOpen: boolean
  defaultName: string
  onSave: (name: string) => void
  onClose: () => void
}

export function FavoriteModal({ isOpen, defaultName, onSave, onClose }: FavoriteModalProps) {
  const [name, setName] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(defaultName)
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, defaultName])

  if (!isOpen) return null

  const handleSave = () => {
    const trimmed = name.trim()
    if (trimmed) {
      onSave(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fav-modal-title"
    >
      <div className="bg-card rounded-2xl p-6 shadow-2xl w-[90%] max-w-[400px]">
        <h2 id="fav-modal-title" className="text-xl font-bold text-card-foreground mb-4">
          Zu Favoriten speichern
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Name (z.B. 'Mein Brot')"
          className="w-full px-3 py-3 border border-input rounded-lg text-base text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors mb-4"
          aria-label="Favoritenname"
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-lg bg-muted text-card-foreground font-semibold active:bg-muted/80 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold active:opacity-90 transition-opacity"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
