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

export async function uploadMedia(
  file: File,
  options?: { title?: string; description?: string; is_public?: boolean }
) {
  const form = new FormData();
  form.append("file", file);
  if (options?.title) form.append("title", options.title);
  if (options?.description) form.append("description", options.description);
  if (typeof options?.is_public !== "undefined")
    form.append("is_public", String(options.is_public));

  // NOTE: apiFetch sets JSON header by default — use native fetch for multipart
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(base + "/media/upload", {
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

export async function deleteMedia(mediaId: number) {
  return apiFetch(`/media/${mediaId}`, { method: "DELETE" });
}
