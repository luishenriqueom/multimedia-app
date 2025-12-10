"use client"

import { useState } from "react"
import { useMedia } from "@/contexts/media-context"
import type { MediaItem } from "@/contexts/media-context"
import { updateImage, updateVideo, updateAudio } from "@/hooks/use-media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit2, Trash2 } from "lucide-react"

interface MediaActionsProps {
  media: MediaItem
}

export function MediaActions({ media }: MediaActionsProps) {
  const { updateMedia, deleteMedia, refreshMedia } = useMedia()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editDescription, setEditDescription] = useState(media.description || "")

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const updates = { description: editDescription || undefined }
      
      // Call appropriate update function based on media type
      if (media.type === "image") {
        await updateImage(media.id, updates)
      } else if (media.type === "video") {
        await updateVideo(media.id, updates)
      } else if (media.type === "audio") {
        await updateAudio(media.id, updates)
      }
      
      // Update local state
      updateMedia(media.id, { description: editDescription })
      setIsEditOpen(false)
    } catch (error) {
      console.error("Erro ao atualizar mídia", error)
      alert("Erro ao atualizar mídia. Tente novamente.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMedia(media.id)
      setIsDeleteOpen(false)
    } catch (error) {
      console.error("Erro ao deletar mídia", error)
      alert("Erro ao deletar mídia. Tente novamente.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-2">
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Arquivo</DialogTitle>
            <DialogDescription>Atualize a descrição do arquivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome do arquivo</label>
              <Input value={media.filename} disabled className="mt-2 bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição do arquivo"
                className="mt-2"
              />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-1">
            <Trash2 className="h-4 w-4" />
            Deletar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este arquivo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
