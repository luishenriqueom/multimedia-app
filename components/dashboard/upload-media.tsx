"use client"

import type React from "react"

import { useState } from "react"
import { useMedia } from "@/contexts/media-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

export function UploadMedia() {
  const { addMedia } = useMedia()
  const [files, setFiles] = useState<File[]>([])
  const [titles, setTitles] = useState<Record<string, string>>({})
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
        if (!fileType) continue

        // Create FormData for file upload
        const formData = new FormData()
        formData.append("file", file)

        // Upload to Blob
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          console.error("Upload failed for", file.name)
          continue
        }

        const { url } = await uploadResponse.json()

        // Add to media context
        const newMedia = {
          id: Date.now().toString() + Math.random(),
          title: titles[file.name] || file.name.split(".")[0],
          description: descriptions[file.name] || "",
          type: fileType,
          url,
          fileSize: file.size,
          uploadedAt: new Date(),
          updatedAt: new Date(),
        }

        addMedia(newMedia)
      }

      // Clear after upload
      setFiles([])
      setTitles({})
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
                  placeholder="Título"
                  value={titles[file.name] || ""}
                  onChange={(e) =>
                    setTitles((prev) => ({
                      ...prev,
                      [file.name]: e.target.value,
                    }))
                  }
                  className="h-8"
                />
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
