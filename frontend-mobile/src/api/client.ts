import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config";

const readBody = async (res: Response) => {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = await SecureStore.getItemAsync("token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await readBody(res);

  if (!res.ok) {
    const body = await readBody(res);
    console.log("API ERROR:", res.status, body);
    throw { status: res.status, body };
  }

  return body;
};
