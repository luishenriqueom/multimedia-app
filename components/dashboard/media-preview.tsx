"use client"

import { useMedia } from "@/contexts/media-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MediaPreviewProps {
  mediaId: string
  onClose: () => void
}

export function MediaPreview({ mediaId, onClose }: MediaPreviewProps) {
  const { getMedia } = useMedia()
  const media = getMedia(mediaId)

  if (!media) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{media.title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {media.type === "image" && (
            <img src={media.url || "/placeholder.svg"} alt={media.title} className="w-full h-auto rounded-lg" />
          )}
          {media.type === "audio" && (
            <audio controls className="w-full">
              <source src={media.url} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          )}
          {media.type === "video" && (
            <video controls className="w-full h-auto rounded-lg">
              <source src={media.url} type="video/mp4" />
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
