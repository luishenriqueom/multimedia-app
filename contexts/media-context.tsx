"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { listMedia, getMediaPresignedUrl, deleteMedia as deleteMediaApi } from "@/hooks/use-media"

export interface MediaItem {
  id: number // Changed from string to number to match API
  filename: string // Changed from title to filename
  description?: string
  type: "image" | "audio" | "video"
  url?: string // Optional, will be fetched when needed
  thumbnail?: string
  fileSize: number
  duration?: number // for audio/video in seconds
  uploadedAt: Date
  updatedAt: Date
}

// Type for API response from /media/ endpoint
type ApiMediaItem = {
  id: number
  filename: string
  size: number
  mimetype: string
  thumbnail?: string
  created_at: string
}

function mimeTypeToMediaType(mimetype: string): MediaItem["type"] {
  if (!mimetype) return "image"
  if (mimetype.startsWith("image/")) return "image"
  if (mimetype.startsWith("audio/")) return "audio"
  if (mimetype.startsWith("video/")) return "video"
  return "image"
}

function mapApiToMediaItem(item: ApiMediaItem): MediaItem {
  const uploadedAt = new Date(item.created_at)
  return {
    id: item.id,
    filename: item.filename,
    description: undefined, // Not available in list endpoint
    type: mimeTypeToMediaType(item.mimetype),
    url: undefined, // Will be fetched when needed via presigned URL
    thumbnail: item.thumbnail || undefined,
    fileSize: item.size,
    uploadedAt,
    updatedAt: uploadedAt,
  }
}

interface MediaContextType {
  mediaItems: MediaItem[]
  isLoading: boolean
  refreshMedia: () => Promise<void>
  addMedia: (media: MediaItem) => void
  updateMedia: (id: number, updates: Partial<MediaItem>) => void
  deleteMedia: (id: number) => Promise<void>
  getMedia: (id: number) => MediaItem | undefined
  getMediaUrl: (id: number) => Promise<string | undefined>
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await listMedia()
      const mapped = (response as ApiMediaItem[]).map(mapApiToMediaItem)
      setMediaItems(mapped)
    } catch (err) {
      console.error("Erro ao carregar mídia da API", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load media on mount
  useEffect(() => {
    refreshMedia()
  }, [refreshMedia])

  const addMedia = useCallback((media: MediaItem) => {
    setMediaItems((prev) => [media, ...prev])
  }, [])

  const updateMedia = useCallback((id: number, updates: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item)),
    )
  }, [])

  const deleteMedia = useCallback(async (id: number) => {
    try {
      await deleteMediaApi(id)
      setMediaItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Erro ao deletar mídia", err)
      throw err
    }
  }, [])

  const getMedia = useCallback(
    (id: number) => {
      return mediaItems.find((item) => item.id === id)
    },
    [mediaItems],
  )

  const getMediaUrl = useCallback(async (id: number): Promise<string | undefined> => {
    try {
      const response = await getMediaPresignedUrl(id)
      return (response as { url: string }).url
    } catch (err) {
      console.error("Erro ao obter URL da mídia", err)
      return undefined
    }
  }, [])

  return (
    <MediaContext.Provider
      value={{ mediaItems, isLoading, refreshMedia, addMedia, updateMedia, deleteMedia, getMedia, getMediaUrl }}
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
