export type ApiErrorItem = {
  type: string;
  message?: string;
  field?: string;
};

export type ApiErrorResponse = {
  errors: ApiErrorItem[];
};

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; error: ApiErrorResponse | null }
> {
  const { auth = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  const json = await readJsonSafely(res);

  if (res.ok) {
    return { ok: true, data: json ?? ({} as T) };
  }

  const err =
    json && typeof json === "object" && "errors" in json
      ? (json as ApiErrorResponse)
      : null;
  return { ok: false, status: res.status, error: err };
}
