"use client"

import { useMedia } from "@/contexts/media-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
        {media.description && <p className="mt-4 text-sm text-muted-foreground">{media.description}</p>}
      </DialogContent>
    </Dialog>
  )
}
