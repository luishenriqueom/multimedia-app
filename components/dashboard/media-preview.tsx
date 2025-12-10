"use client";

import { useEffect, useMemo, useState } from "react";
import { useMedia } from "@/contexts/media-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAudio, getImage, getVideo } from "@/hooks/use-media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaPreviewProps {
  mediaId: number;
  onClose: () => void;
}

type ImageDetail = {
  id: number;
  description?: string | null;
  filename: string;
  mimetype?: string | null;
  size?: number | null;
  created_at?: string | null;
  width?: number | null;
  height?: number | null;
  color_depth?: number | null;
  dpi_x?: number | null;
  dpi_y?: number | null;
  exif?: Record<string, unknown> | null;
  url?: string | null;
  tags?: string[];
};

type VideoDetail = {
  id: number;
  description?: string | null;
  filename: string;
  mimetype?: string | null;
  size?: number | null;
  created_at?: string | null;
  duration_seconds?: number | null;
  width?: number | null;
  height?: number | null;
  frame_rate?: number | null;
  video_codec?: string | null;
  audio_codec?: string | null;
  bitrate?: number | null;
  tags?: string[];
  genero?: string | null;
  url_1080?: string | null;
  url_720?: string | null;
  url_480?: string | null;
};

type AudioDetail = {
  id: number;
  description?: string | null;
  filename: string;
  mimetype?: string | null;
  size?: number | null;
  created_at?: string | null;
  duration_seconds?: number | null;
  bitrate?: number | null;
  sample_rate?: number | null;
  channels?: number | null;
  tags?: string[];
  genero?: string | null;
  url?: string | null;
};

type MediaDetail = ImageDetail | VideoDetail | AudioDetail;

const toMb = (size?: number | null) =>
  size ? (size / 1024 / 1024).toFixed(2) : undefined;
const formatDuration = (seconds?: number | null) => {
  if (seconds === null || seconds === undefined) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

export function MediaPreview({ mediaId, onClose }: MediaPreviewProps) {
  const { getMedia } = useMedia();
  const media = getMedia(mediaId);

  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<
    "url_480" | "url_720" | "url_1080" | null
  >(null);

  useEffect(() => {
    if (!media) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setDetail(null);
    setMediaUrl(undefined);
    setSelectedResolution(null);

    const load = async () => {
      try {
        if (media.type === "image") {
          const data = (await getImage(media.id)) as ImageDetail;
          if (cancelled) return;
          setDetail(data);
          setMediaUrl(data.url || undefined);
        } else if (media.type === "video") {
          const data = (await getVideo(media.id)) as VideoDetail;
          if (cancelled) return;
          setDetail(data);
          const available = (["url_1080", "url_720", "url_480"] as const).find(
            (key) => data[key]
          );
          setSelectedResolution(available ?? null);
          setMediaUrl((available ? data[available] : null) ?? undefined);
        } else if (media.type === "audio") {
          const data = (await getAudio(media.id)) as AudioDetail;
          if (cancelled) return;
          setDetail(data);
          setMediaUrl(data.url || undefined);
        }
      } catch (err) {
        console.error("Erro ao obter detalhes da mídia", err);
        if (!cancelled) setError("Não foi possível carregar a mídia.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [media]);

  const createdAt = useMemo(() => {
    if (!detail) return undefined;
    const raw = "created_at" in detail ? detail.created_at : null;
    if (!raw) return undefined;
    const date = new Date(raw);
    return isNaN(date.getTime())
      ? undefined
      : format(date, "Pp", { locale: ptBR });
  }, [detail]);

  if (!media) return null;

  const renderPlayer = () => {
    if (isLoading) {
      return (
        <div className="flex h-[60vh] items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
          Carregando...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-[60vh] items-center justify-center rounded-lg bg-destructive/10 px-4 text-sm text-destructive">
          {error}
        </div>
      );
    }

    if (media.type === "image") {
      return (
        <img
          src={mediaUrl || "/placeholder.svg"}
          alt={media.filename}
          className="max-h-[70vh] w-full rounded-lg object-contain"
        />
      );
    }

    if (media.type === "audio") {
      return mediaUrl ? (
        <div className="flex w-full flex-col gap-3">
          <audio controls className="w-full">
            <source src={mediaUrl} type="audio/mpeg" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      ) : (
        <div className="flex h-[60vh] items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
          URL de áudio não disponível.
        </div>
      );
    }

    if (media.type === "video") {
      return mediaUrl ? (
        <div className="flex w-full flex-col gap-3">
          <video
            controls
            className="max-h-[70vh] w-full rounded-lg bg-black object-contain"
          >
            <source src={mediaUrl} type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
          </video>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Resolução:</span>
            <Select
              value={selectedResolution ?? undefined}
              onValueChange={(value: "url_480" | "url_720" | "url_1080") => {
                setSelectedResolution(value);
                if (detail && "url_480" in detail) {
                  setMediaUrl((detail as VideoDetail)[value] || undefined);
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Escolher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="url_1080"
                  disabled={
                    !detail ||
                    !("url_1080" in detail) ||
                    !(detail as VideoDetail).url_1080
                  }
                >
                  1080p
                </SelectItem>
                <SelectItem
                  value="url_720"
                  disabled={
                    !detail ||
                    !("url_720" in detail) ||
                    !(detail as VideoDetail).url_720
                  }
                >
                  720p
                </SelectItem>
                <SelectItem
                  value="url_480"
                  disabled={
                    !detail ||
                    !("url_480" in detail) ||
                    !(detail as VideoDetail).url_480
                  }
                >
                  480p
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="flex h-[60vh] items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
          URL de vídeo não disponível.
        </div>
      );
    }

    return null;
  };

  const renderInfoRow = (label: string, value?: string | number | null) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex justify-between gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-right">{value}</span>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[96vw] max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="truncate">{media.filename}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 overflow-hidden rounded-lg border bg-background p-2">
            {renderPlayer()}
          </div>
          <div className="w-full min-w-[260px] max-w-sm space-y-4 md:w-80">
            {media.description && (
              <p className="text-sm text-muted-foreground">
                {media.description}
              </p>
            )}

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">
                Informações
              </div>
              {renderInfoRow(
                "Tamanho",
                toMb(
                  (detail as ImageDetail | VideoDetail | AudioDetail | null)
                    ?.size ?? media.fileSize
                )
              )}
              {renderInfoRow(
                "Duração",
                media.type === "video" || media.type === "audio"
                  ? formatDuration(
                      (detail as VideoDetail | AudioDetail | null)
                        ?.duration_seconds
                    )
                  : undefined
              )}
              {renderInfoRow(
                "Enviado",
                createdAt ??
                  format(new Date(media.uploadedAt), "Pp", { locale: ptBR })
              )}
              {renderInfoRow(
                "Tipo",
                (detail as ImageDetail | VideoDetail | AudioDetail | null)
                  ?.mimetype
              )}
              {media.type === "image" &&
                renderInfoRow(
                  "Dimensões",
                  detail && "width" in detail && detail.width && detail.height
                    ? `${detail.width} x ${detail.height}`
                    : undefined
                )}
              {media.type === "video" &&
                renderInfoRow(
                  "Resolução",
                  detail && "width" in detail && detail.width && detail.height
                    ? `${detail.width} x ${detail.height}`
                    : undefined
                )}
              {media.type === "video" &&
                renderInfoRow(
                  "Frame rate",
                  detail && "frame_rate" in detail && detail.frame_rate
                    ? `${detail.frame_rate} fps`
                    : undefined
                )}
              {media.type === "video" &&
                renderInfoRow(
                  "Video codec",
                  detail && "video_codec" in detail
                    ? detail.video_codec
                    : undefined
                )}
              {media.type === "video" &&
                renderInfoRow(
                  "Audio codec",
                  detail && "audio_codec" in detail
                    ? detail.audio_codec
                    : undefined
                )}
              {media.type === "audio" &&
                renderInfoRow(
                  "Sample rate",
                  detail && "sample_rate" in detail && detail.sample_rate
                    ? `${detail.sample_rate} Hz`
                    : undefined
                )}
              {media.type === "audio" &&
                renderInfoRow(
                  "Canais",
                  detail && "channels" in detail && detail.channels
                    ? detail.channels
                    : undefined
                )}
              {renderInfoRow(
                "Gênero",
                detail && "genero" in detail ? detail.genero : undefined
              )}
              {renderInfoRow(
                "Tags",
                detail &&
                  "tags" in detail &&
                  detail.tags &&
                  detail.tags.length > 0
                  ? detail.tags.join(", ")
                  : undefined
              )}
            </div>

            {media.type === "image" &&
              detail &&
              "exif" in detail &&
              detail.exif && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 text-sm font-semibold text-foreground">
                    EXIF
                  </div>
                  <pre className="max-h-48 overflow-auto rounded bg-background p-2 text-xs text-muted-foreground">
                    {JSON.stringify(detail.exif, null, 2)}
                  </pre>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
