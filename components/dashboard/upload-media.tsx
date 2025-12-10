"use client";

import type React from "react";

import { useState } from "react";
import { useMedia } from "@/contexts/media-context";
import { uploadMedia } from "@/hooks/use-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type FileType = "image" | "audio" | "video" | null;

interface FileMetadata {
  description: string;
  genero: string;
  tags: string[];
}

interface QueuedFile {
  id: string;
  file: File;
  type: FileType;
  metadata: FileMetadata;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function UploadMedia() {
  const { refreshMedia } = useMedia();
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(
    null
  );

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const timestamp = Date.now();
    const newFiles: QueuedFile[] = selectedFiles
      .filter((file) => {
        const type = getFileType(file);
        const isValid = type !== null;
        if (!isValid) {
          console.warn("Tipo de arquivo não suportado:", file.name);
        }
        return isValid;
      })
      .map((file, idx) => ({
        id: `${timestamp}-${idx}-${file.name}`,
        file,
        type: getFileType(file)!,
        metadata: {
          description: "",
          genero: "",
          tags: [],
        },
        status: "pending" as const,
      }));

    setQueuedFiles((prev) => [...prev, ...newFiles]);
    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const updateFileMetadata = (id: string, updates: Partial<FileMetadata>) => {
    setQueuedFiles((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, metadata: { ...item.metadata, ...updates } }
          : item
      )
    );
  };

  const parseTags = (tagsInput: string): string[] => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const updateFileStatus = (
    id: string,
    status: QueuedFile["status"],
    error?: string
  ) => {
    setQueuedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, error } : item))
    );
  };

  const handleUpload = async () => {
    if (queuedFiles.length === 0) return;

    setIsUploading(true);
    setCurrentUploadIndex(0);

    try {
      for (let i = 0; i < queuedFiles.length; i++) {
        const queuedFile = queuedFiles[i];
        setCurrentUploadIndex(i);

        // Update status to uploading
        updateFileStatus(queuedFile.id, "uploading");

        try {
          const { file, type, metadata } = queuedFile;
          const tagsArray =
            metadata.tags.length > 0 ? metadata.tags : undefined;

          const uploadOptions: {
            description?: string;
            genero?: string;
            tags?: string[];
          } = {
            description: metadata.description || undefined,
            tags: tagsArray,
          };

          // Add genero for video and audio
          const isVideoOrAudio = type === "video" || type === "audio";
          if (isVideoOrAudio && metadata.genero) {
            uploadOptions.genero = metadata.genero;
          }

          await uploadMedia(file, uploadOptions);

          // Update status to success
          updateFileStatus(queuedFile.id, "success");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.error("Erro ao fazer upload de", queuedFile.file.name, error);

          // Update status to error
          updateFileStatus(queuedFile.id, "error", errorMessage);
        }
      }

      // Refresh media list from API
      await refreshMedia();

      // Clear successful uploads after a delay
      setTimeout(() => {
        setQueuedFiles((prev) =>
          prev.filter((item) => item.status !== "success")
        );
      }, 2000);
    } finally {
      setIsUploading(false);
      setCurrentUploadIndex(null);
    }
  };

  const getTypeLabel = (type: FileType): string => {
    switch (type) {
      case "image":
        return "Imagem";
      case "video":
        return "Vídeo";
      case "audio":
        return "Áudio";
      default:
        return "Desconhecido";
    }
  };

  const getTypeColor = (type: FileType): string => {
    switch (type) {
      case "image":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "video":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "audio":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      default:
        return "";
    }
  };

  const pendingFiles = queuedFiles.filter((f) => f.status === "pending");
  const hasPendingFiles = pendingFiles.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
        <CardDescription>
          Adicione imagens, áudios e vídeos à sua galeria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Clique ou arraste arquivos para upload
          </p>
          <input
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={isUploading}
          >
            Selecionar Arquivos
          </Button>
        </div>

        {/* Files Queue */}
        {queuedFiles.length > 0 && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Fila de Upload ({queuedFiles.length} arquivo
                {queuedFiles.length === 1 ? "" : "s"})
              </p>
              {isUploading && (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Enviando...
                </Badge>
              )}
            </div>
            {queuedFiles.map((queuedFile) => {
              const { id, file, type, metadata, status } = queuedFile;
              const isCurrentUpload =
                currentUploadIndex === queuedFiles.indexOf(queuedFile);
              const tagsInput = metadata.tags.join(", ");

              // Determine border style based on status
              let borderStyle = "border-border";
              if (status === "success") {
                borderStyle = "border-green-500/50 bg-green-500/5";
              } else if (status === "error") {
                borderStyle = "border-red-500/50 bg-red-500/5";
              } else if (isCurrentUpload && status === "uploading") {
                borderStyle = "border-primary bg-primary/5";
              }

              return (
                <div
                  key={id}
                  className={`border rounded-lg p-4 space-y-3 ${borderStyle}`}
                >
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getTypeColor(type)}>
                          {getTypeLabel(type)}
                        </Badge>
                        {status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {status === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {queuedFile.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {queuedFile.error}
                        </p>
                      )}
                    </div>
                    {status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(id)}
                        className="h-6 w-6 p-0 shrink-0"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Fields based on file type */}
                  {status === "pending" && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      {/* Description - All types */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`desc-${id}`} className="text-xs">
                          Descrição {type === "image" ? "" : "(opcional)"}
                        </Label>
                        <Input
                          id={`desc-${id}`}
                          placeholder="Descrição do arquivo"
                          value={metadata.description}
                          onChange={(e) =>
                            updateFileMetadata(id, {
                              description: e.target.value,
                            })
                          }
                          className="h-8 text-sm"
                          disabled={isUploading}
                        />
                      </div>

                      {/* Genero - Video and Audio only */}
                      {(type === "video" || type === "audio") && (
                        <div className="space-y-1.5">
                          <Label htmlFor={`genero-${id}`} className="text-xs">
                            Gênero (opcional)
                          </Label>
                          <Input
                            id={`genero-${id}`}
                            placeholder="Ex: Rock, Pop, Ação, Drama..."
                            value={metadata.genero}
                            onChange={(e) =>
                              updateFileMetadata(id, { genero: e.target.value })
                            }
                            className="h-8 text-sm"
                            disabled={isUploading}
                          />
                        </div>
                      )}

                      {/* Tags - All types */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`tags-${id}`} className="text-xs">
                          Tags (opcional)
                        </Label>
                        <Input
                          id={`tags-${id}`}
                          placeholder="Separe múltiplas tags com vírgulas (ex: tag1, tag2, tag3)"
                          value={tagsInput}
                          onChange={(e) => {
                            const tags = parseTags(e.target.value);
                            updateFileMetadata(id, { tags });
                          }}
                          className="h-8 text-sm"
                          disabled={isUploading}
                        />
                        {metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {metadata.tags.map((tag) => (
                              <Badge
                                key={`${id}-tag-${tag}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status messages */}
                  {status === "success" && (
                    <p className="text-xs text-green-600 font-medium">
                      Upload concluído com sucesso!
                    </p>
                  )}
                  {status === "error" && (
                    <div className="space-y-1">
                      <p className="text-xs text-red-600 font-medium">
                        Erro no upload
                      </p>
                      {queuedFile.error && (
                        <p className="text-xs text-red-500">
                          {queuedFile.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Button */}
        {hasPendingFiles && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando{" "}
                {currentUploadIndex === null
                  ? 0
                  : currentUploadIndex + 1} de {queuedFiles.length}...
              </>
            ) : (
              `Iniciar Upload de ${pendingFiles.length} arquivo${
                pendingFiles.length === 1 ? "" : "s"
              }`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
