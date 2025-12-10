import type { MediaItem } from "../contexts/media-context"

type ApiPayloadItem = {
  filename: string
  size: number
  mime_type: string
  thumbnail?: string
  created_at?: string
  // other possible fields from API
  url?: string
}

function mimeTypeToMediaType(mime: string): MediaItem["type"] {
  if (!mime) return "image"
  if (mime.startsWith("image")) return "image"
  if (mime.startsWith("audio")) return "audio"
  if (mime.startsWith("video")) return "video"
  return "image"
}

export function mapApiPayloadToMediaItems(items: ApiPayloadItem[]): MediaItem[] {
  return items.map((it) => {
    const uploadedAt = it.created_at ? new Date(it.created_at) : new Date()
    const type = mimeTypeToMediaType(it.mime_type)

    const media: MediaItem = {
      id: it.filename,
      title: it.filename,
      description: undefined,
      type,
      url: it.url ?? "",
      thumbnail: it.thumbnail ?? undefined,
      fileSize: it.size ?? 0,
      uploadedAt,
      updatedAt: uploadedAt,
    }

    return media
  })
}

export default mapApiPayloadToMediaItems
