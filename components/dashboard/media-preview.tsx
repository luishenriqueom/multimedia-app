"use client"

import { useState, useEffect } from "react"
import { useMedia } from "@/contexts/media-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MediaPreviewProps {
  mediaId: number
  onClose: () => void
}

export function MediaPreview({ mediaId, onClose }: MediaPreviewProps) {
  const { getMedia, getMediaUrl } = useMedia()
  const media = getMedia(mediaId)
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  useEffect(() => {
    if (media && !media.url) {
      setIsLoadingUrl(true)
      getMediaUrl(media.id)
        .then((url) => {
          setMediaUrl(url)
        })
        .catch((err) => {
          console.error("Erro ao obter URL da mídia", err)
        })
        .finally(() => {
          setIsLoadingUrl(false)
        })
    } else if (media?.url) {
      setMediaUrl(media.url)
    }
  }, [media, getMediaUrl])

  if (!media) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{media.filename}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {isLoadingUrl && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          )}
          {!isLoadingUrl && media.type === "image" && (
            <img src={mediaUrl || "/placeholder.svg"} alt={media.filename} className="w-full h-auto rounded-lg" />
          )}
          {!isLoadingUrl && media.type === "audio" && mediaUrl && (
            <audio controls className="w-full">
              <source src={mediaUrl} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          )}
          {!isLoadingUrl && media.type === "video" && mediaUrl && (
            <video controls className="w-full h-auto rounded-lg">
              <source src={mediaUrl} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {media.description && <p className="text-sm text-muted-foreground">{media.description}</p>}
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Tamanho:</span>
              <span>{(media.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            {media.duration !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium">Duração:</span>
                <span>{Math.floor(media.duration / 60)}:{String(media.duration % 60).padStart(2, "0")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Enviado:</span>
              <span>{format(new Date(media.uploadedAt), "Pp", { locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
