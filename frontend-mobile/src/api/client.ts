import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, PARKLY_BASE_URL } from "../config";

const PUBLIC_ROUTES = ["/login", "/signup"];

const readBody = async (res: Response) => {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiFetchRel = async (path: string, options: RequestInit = {}) => {
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

  const token = await SecureStore.getItemAsync("token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && !isPublic ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await readBody(res);

  if (!res.ok) {
    console.log("API ERROR:", res.status, body);
    throw { status: res.status, body };
  }

  return body;
};

export const apiFetchLinks = async (
  path: string,
  options: RequestInit = {},
) => {
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

  const token = await SecureStore.getItemAsync("token");
  const res = await fetch(`${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && !isPublic ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await readBody(res);

  if (!res.ok) {
    console.log("API ERROR:", res.status, body);
    throw { status: res.status, body };
  }

  return body;
};

export const apiFetchParkly = async (
  path: string,
  options: RequestInit = {},
) => {
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

  const token = await SecureStore.getItemAsync("token");
  const res = await fetch(`${PARKLY_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && !isPublic ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await readBody(res);

  if (!res.ok) {
    console.log("API ERROR:", res.status, body);
    throw { status: res.status, body };
  }

  return body;
};
