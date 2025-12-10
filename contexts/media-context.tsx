"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { MOCK_MEDIA } from "../mock/media-mock"
import apiMock from "../mock/media-api-mock.json"
import { mapApiPayloadToMediaItems } from "../mock/api-to-media"

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
  // Carrega dados do formato da API (útil para substituir o mock no futuro)
  loadFromApiMock: () => void
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  // Inicializa com mock local para facilitar desenvolvimento do dashboard
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(MOCK_MEDIA)
  const [isLoading] = useState(false)

  const loadFromApiMock = useCallback(() => {
    try {
      const mapped = mapApiPayloadToMediaItems(apiMock as any)
      setMediaItems(mapped)
    } catch (err) {
      // fallback: mantemos o mock TS
      console.error("Erro ao mapear mock da API", err)
    }
  }, [])

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
    <MediaContext.Provider
      value={{ mediaItems, isLoading, addMedia, updateMedia, deleteMedia, getMedia, loadFromApiMock }}
    >
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
