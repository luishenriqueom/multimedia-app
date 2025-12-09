export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(
  /\/$/,
  ""
);

function getToken() {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = API_BASE || "";
  const url = base + path;

  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { credentials: "include", ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let text = await res.text();
    try {
      const json = JSON.parse(text);
      text = json.detail || JSON.stringify(json);
    } catch {}
    throw new Error(text || res.statusText);
  }

  if (contentType.includes("application/json")) {
    return res.json();
  }

  // fallback to text
  return (await res.text()) as unknown as T;
}

export function setToken(token: string | null) {
  try {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }
  } catch {}
}
