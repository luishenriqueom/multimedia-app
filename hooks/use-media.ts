import { apiFetch } from "@/lib/api";

export async function listMedia(q?: string | null, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return apiFetch(`/media/?${params.toString()}`, { method: "GET" });
}

export async function getMedia(mediaId: number) {
  return apiFetch(`/media/${mediaId}`, { method: "GET" });
}

export async function getMediaPresignedUrl(mediaId: number) {
  return apiFetch(`/media/${mediaId}/url`, { method: "GET" });
}

export async function uploadImage(
  file: File,
  options?: { description?: string; tags?: string[]; is_profile?: boolean }
) {
  const form = new FormData();
  form.append("file", file);
  if (options?.description) form.append("description", options.description);
  if (options?.tags && options.tags.length > 0)
    form.append("tags", options.tags.join(","));
  if (options?.is_profile)
    form.append("is_profile", String(options.is_profile));

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  let token: string | null = null;
  if (globalThis.window !== undefined) {
    token = globalThis.window.localStorage.getItem("token");
  }
  const res = await fetch(base + "/media/upload/image", {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    let text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function uploadVideo(
  file: File,
  options?: { description?: string; genero?: string; tags?: string[] }
) {
  const form = new FormData();
  form.append("file", file);
  if (options?.description) form.append("description", options.description);
  if (options?.genero) form.append("genero", options.genero);
  if (options?.tags && options.tags.length > 0)
    form.append("tags", options.tags.join(","));

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  let token: string | null = null;
  if (globalThis.window !== undefined) {
    token = globalThis.window.localStorage.getItem("token");
  }
  const res = await fetch(base + "/media/upload/video", {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    let text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function uploadAudio(
  file: File,
  options?: { description?: string; genero?: string; tags?: string[] }
) {
  const form = new FormData();
  form.append("file", file);
  if (options?.description) form.append("description", options.description);
  if (options?.genero) form.append("genero", options.genero);
  if (options?.tags && options.tags.length > 0)
    form.append("tags", options.tags.join(","));

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  let token: string | null = null;
  if (globalThis.window !== undefined) {
    token = globalThis.window.localStorage.getItem("token");
  }
  const res = await fetch(base + "/media/upload/audio", {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    let text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// Helper function to determine upload function based on file type
export async function uploadMedia(
  file: File,
  options?: {
    description?: string;
    genero?: string;
    tags?: string[];
    is_profile?: boolean;
  }
) {
  const mimetype = file.type || "";
  if (mimetype.startsWith("image/")) {
    return uploadImage(file, {
      description: options?.description,
      tags: options?.tags,
      is_profile: options?.is_profile,
    });
  } else if (mimetype.startsWith("video/")) {
    return uploadVideo(file, {
      description: options?.description,
      genero: options?.genero,
      tags: options?.tags,
    });
  } else if (mimetype.startsWith("audio/")) {
    return uploadAudio(file, {
      description: options?.description,
      genero: options?.genero,
      tags: options?.tags,
    });
  } else {
    throw new Error("Tipo de arquivo não suportado");
  }
}

export async function deleteMedia(mediaId: number) {
  return apiFetch(`/media/${mediaId}`, { method: "DELETE" });
}

export async function updateImage(
  mediaId: number,
  updates: { description?: string; tags?: string[] }
) {
  return apiFetch(`/media/image/${mediaId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function updateVideo(
  mediaId: number,
  updates: { description?: string; genero?: string; tags?: string[] }
) {
  return apiFetch(`/media/video/${mediaId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function updateAudio(
  mediaId: number,
  updates: { description?: string; genero?: string; tags?: string[] }
) {
  return apiFetch(`/media/audio/${mediaId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}
