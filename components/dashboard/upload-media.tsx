"use client"

import type React from "react"

import { useState } from "react"
import { useMedia } from "@/contexts/media-context"
import { uploadMedia } from "@/hooks/use-media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

export function UploadMedia() {
  const { refreshMedia } = useMedia()
  const [files, setFiles] = useState<File[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileType = (file: File): "image" | "audio" | "video" | null => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("audio/")) return "audio"
    if (file.type.startsWith("video/")) return "video"
    return null
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const fileType = getFileType(file)
        if (!fileType) {
          console.warn("Tipo de arquivo não suportado:", file.name)
          continue
        }

        try {
          const description = descriptions[file.name] || undefined
          await uploadMedia(file, { description })
        } catch (error) {
          console.error("Erro ao fazer upload de", file.name, error)
          // Continue with next file even if one fails
        }
      }

      // Refresh media list from API
      await refreshMedia()

      // Clear after upload
      setFiles([])
      setDescriptions({})
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
        <CardDescription>Adicione imagens, áudios e vídeos à sua galeria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Clique ou arraste arquivos para upload</p>
          <input
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <Button variant="outline" onClick={() => document.getElementById("file-input")?.click()}>
            Selecionar Arquivos
          </Button>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <p className="text-sm font-medium">Arquivos selecionados ({files.length})</p>
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Descrição (opcional)"
                  value={descriptions[file.name] || ""}
                  onChange={(e) =>
                    setDescriptions((prev) => ({
                      ...prev,
                      [file.name]: e.target.value,
                    }))
                  }
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <Button onClick={handleUpload} disabled={isUploading} className="w-full">
            {isUploading ? "Enviando..." : "Upload de " + files.length + " arquivo(s)"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
