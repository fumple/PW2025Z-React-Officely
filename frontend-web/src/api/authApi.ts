import { apiFetch, setToken, clearToken } from "./http";

export type LoginRequest = {
  type: "admin";
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type SignupRequest = {
  type: "admin";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string; // e.g. "PL"
  phoneNumber: string; // e.g. "+48..."
};

export async function login(req: LoginRequest) {
  const res = await apiFetch<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(req),
  });

  if (res.ok) {
    if (res.data?.token) setToken(res.data.token);
  }

  return res;
}

export async function signup(req: SignupRequest) {
  return apiFetch<unknown>("/signup", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function resetPasswordEmail(email: string) {
  return apiFetch<unknown>("/resetPasswordEmail", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function checkResetCode(params: { email: string; code: string }) {
  return apiFetch<{ valid: boolean }>("/checkResetCode", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function resetPassword(params: {
  email: string;
  code: string;
  newPassword: string;
}) {
  return apiFetch<unknown>("/resetPassword", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function logout() {
  clearToken();
}
