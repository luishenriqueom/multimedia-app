import type { MediaItem } from "../contexts/media-context"

// Mock de dados que representará o payload recebido futuramente da API
export const MOCK_MEDIA: MediaItem[] = [
  {
    id: "1",
    title: "aaaa.jpg",
    description: "Foto de exemplo",
    type: "image",
    url: "https://placehold.co/1920x1080.jpg",
    thumbnail: "https://placehold.co/400x225.jpg",
    fileSize: 100,
    uploadedAt: new Date("2025-12-01T10:00:00Z"),
    updatedAt: new Date("2025-12-01T10:00:00Z"),
  },
  {
    id: "2",
    title: "aaaa.mp4",
    description: "Vídeo de amostra",
    type: "video",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail: "https://placehold.co/400x225.png?text=Video+Thumb",
    fileSize: 100,
    duration: 12,
    uploadedAt: new Date("2025-12-02T14:30:00Z"),
    updatedAt: new Date("2025-12-02T14:30:00Z"),
  },
  {
    id: "3",
    title: "sample-audio.mp3",
    description: "Áudio de exemplo",
    type: "audio",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail: "",
    fileSize: 2500000,
    duration: 215,
    uploadedAt: new Date("2025-11-28T09:15:00Z"),
    updatedAt: new Date("2025-11-28T09:15:00Z"),
  },
]

export default MOCK_MEDIA
