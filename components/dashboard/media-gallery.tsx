"use client"

import { useState, useMemo } from "react"
import { useMedia } from "@/contexts/media-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, Music, Video, Grid, List } from "lucide-react"
import { MediaActions } from "./media-actions"
import { MediaPreview } from "./media-preview"

type ViewMode = "grid" | "list"
type FilterType = "all" | "image" | "audio" | "video"

export function MediaGallery() {
  const { mediaItems } = useMedia()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null)

  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesType = filterType === "all" || item.type === filterType
      return matchesSearch && matchesType
    })
  }, [mediaItems, searchQuery, filterType])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Eye className="h-5 w-5" />
      case "audio":
        return <Music className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "image":
        return "Imagem"
      case "audio":
        return "Áudio"
      case "video":
        return "Vídeo"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {selectedMedia && <MediaPreview mediaId={selectedMedia} onClose={() => setSelectedMedia(null)} />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Minha Galeria</CardTitle>
              <CardDescription>
                {filteredItems.length} arquivo(s) encontrado(s) de {mediaItems.length} total
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              Todos ({mediaItems.length})
            </Button>
            <Button
              variant={filterType === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("image")}
            >
              <Eye className="h-4 w-4 mr-1" />
              Imagens ({mediaItems.filter((m) => m.type === "image").length})
            </Button>
            <Button
              variant={filterType === "audio" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("audio")}
            >
              <Music className="h-4 w-4 mr-1" />
              Áudios ({mediaItems.filter((m) => m.type === "audio").length})
            </Button>
            <Button
              variant={filterType === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("video")}
            >
              <Video className="h-4 w-4 mr-1" />
              Vídeos ({mediaItems.filter((m) => m.type === "video").length})
            </Button>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {mediaItems.length === 0
                  ? "Nenhum arquivo encontrado. Comece fazendo upload!"
                  : "Nenhum arquivo corresponde aos filtros."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.filename}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          {getTypeIcon(item.type)}
                          <p className="text-xs text-muted-foreground mt-2">{getTypeLabel(item.type)}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="font-medium truncate text-sm">{item.filename}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>{item.uploadedAt.toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <MediaActions media={item} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail || "/placeholder.svg"}
                            alt={item.filename}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.filename}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{getTypeLabel(item.type)}</span>
                          <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{item.uploadedAt.toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <MediaActions media={item} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
