// gravatar.ts
export async function sha256Hex(input: string): Promise<string> {
  const normalized = input.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function gravatarUrlFromEmail(
  email: string,
  opts?: { size?: number; d?: string },
): Promise<string> {
  const hash = await sha256Hex(email);
  const size = opts?.size ?? 80;
  const d = opts?.d ?? "identicon";
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=${encodeURIComponent(d)}`;
}
