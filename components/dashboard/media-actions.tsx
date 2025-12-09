"use client"

import { useState } from "react"
import { useMedia } from "@/contexts/media-context"
import type { MediaItem } from "@/contexts/media-context"
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
  const { updateMedia, deleteMedia } = useMedia()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(media.title)
  const [editDescription, setEditDescription] = useState(media.description || "")

  const handleUpdate = () => {
    updateMedia(media.id, {
      title: editTitle,
      description: editDescription,
    })
    setIsEditOpen(false)
  }

  const handleDelete = () => {
    deleteMedia(media.id)
    setIsDeleteOpen(false)
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
            <DialogDescription>Atualize o título e descrição do arquivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-2" />
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
            <Button onClick={handleUpdate} className="w-full">
              Salvar
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
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
