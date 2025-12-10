"use client";

import { useState, useEffect } from "react";
import { useMedia } from "@/contexts/media-context";
import type { MediaItem } from "@/contexts/media-context";
import {
  updateImage,
  updateVideo,
  updateAudio,
  getImage,
  getVideo,
  getAudio,
} from "@/hooks/use-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";

interface MediaActionsProps {
  readonly media: MediaItem;
}

export function MediaActions({ media }: MediaActionsProps) {
  const { updateMedia, deleteMedia, refreshMedia } = useMedia();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [editDescription, setEditDescription] = useState(
    media.description || ""
  );
  const [editGenero, setEditGenero] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Load full media details when edit dialog opens
  useEffect(() => {
    if (isEditOpen) {
      const loadMediaDetails = async () => {
        setIsLoadingDetails(true);
        try {
          let details: any;
          if (media.type === "image") {
            details = await getImage(media.id);
          } else if (media.type === "video") {
            details = await getVideo(media.id);
          } else if (media.type === "audio") {
            details = await getAudio(media.id);
          }

          if (details) {
            setEditDescription(details.description || "");
            setTagsInput((details.tags || []).join(", "));
            if (media.type === "video" || media.type === "audio") {
              setEditGenero(details.genero || "");
            }
          }
        } catch (error) {
          console.error("Erro ao carregar detalhes da mídia", error);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      loadMediaDetails();
    } else {
      // Reset state when dialog closes
      setIsLoadingDetails(false);
      setEditDescription(media.description || "");
      setTagsInput("");
      setEditGenero("");
    }
  }, [isEditOpen, media.id, media.type, media.description]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Parse tags from input string
      const tagsArray = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Call appropriate update function based on media type
      if (media.type === "image") {
        await updateImage(media.id, {
          description: editDescription || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });
        updateMedia(media.id, { description: editDescription });
      } else if (media.type === "video") {
        await updateVideo(media.id, {
          description: editDescription || undefined,
          genero: editGenero || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });
        updateMedia(media.id, { description: editDescription });
      } else if (media.type === "audio") {
        await updateAudio(media.id, {
          description: editDescription || undefined,
          genero: editGenero || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });
        updateMedia(media.id, { description: editDescription });
      }

      await refreshMedia();
      setIsEditOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar mídia", error);
      alert("Erro ao atualizar mídia. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMedia(media.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Erro ao deletar mídia", error);
      alert("Erro ao deletar mídia. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Arquivo</DialogTitle>
            <DialogDescription>
              Atualize as informações do arquivo
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando detalhes...
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-filename" className="text-sm font-medium">
                  Nome do arquivo
                </label>
                <Input
                  id="edit-filename"
                  value={media.filename}
                  disabled
                  className="mt-2 bg-muted"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Descrição
                </label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descrição do arquivo"
                  className="mt-2"
                />
              </div>
              {(media.type === "video" || media.type === "audio") && (
                <div>
                  <label htmlFor="edit-genero" className="text-sm font-medium">
                    Gênero
                  </label>
                  <Input
                    id="edit-genero"
                    value={editGenero}
                    onChange={(e) => setEditGenero(e.target.value)}
                    placeholder="Gênero (ex: Rock, Pop, Ação, Drama...)"
                    className="mt-2"
                  />
                </div>
              )}
              <div>
                <label htmlFor="edit-tags" className="text-sm font-medium">
                  Tags
                </label>
                <Input
                  id="edit-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags separadas por vírgula (ex: tag1, tag2, tag3)"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe múltiplas tags com vírgulas
                </p>
              </div>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
            Deletar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este arquivo? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
