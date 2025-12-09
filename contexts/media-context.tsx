"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface MediaItem {
  id: string
  title: string
  description?: string
  type: "image" | "audio" | "video"
  url: string
  thumbnail?: string
  fileSize: number
  duration?: number // for audio/video in seconds
  uploadedAt: Date
  updatedAt: Date
}

interface MediaContextType {
  mediaItems: MediaItem[]
  isLoading: boolean
  addMedia: (media: MediaItem) => void
  updateMedia: (id: string, updates: Partial<MediaItem>) => void
  deleteMedia: (id: string) => void
  getMedia: (id: string) => MediaItem | undefined
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading] = useState(false)

  const addMedia = useCallback((media: MediaItem) => {
    setMediaItems((prev) => [media, ...prev])
  }, [])

  const updateMedia = useCallback((id: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item)),
    )
  }, [])

  const deleteMedia = useCallback((id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const getMedia = useCallback(
    (id: string) => {
      return mediaItems.find((item) => item.id === id)
    },
    [mediaItems],
  )

  return (
    <MediaContext.Provider value={{ mediaItems, isLoading, addMedia, updateMedia, deleteMedia, getMedia }}>
      {children}
    </MediaContext.Provider>
  )
}

export function useMedia() {
  const context = useContext(MediaContext)
  if (!context) {
    throw new Error("useMedia must be used within MediaProvider")
  }
  return context
}
