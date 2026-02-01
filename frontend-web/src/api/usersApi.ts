import { apiFetch } from "./http";

export type UserResource = {
  type: "admin" | "local_customer" | "flatly_customer";
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  blocked: boolean;
  admin: boolean;
};

export async function getMe() {
  return apiFetch<UserResource>(`/users/@me`, { method: "GET", auth: true });
}

export type UpdateMeInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  nationality?: string;
  phoneNumber?: string;
  password?: string;
  currentPassword?: string;
};

export async function updateMe(input: UpdateMeInput) {
  return apiFetch<void>(`/users/@me`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function getUser(userId: string) {
  return apiFetch<UserResource>(`/users/${encodeURIComponent(userId)}`, {
    method: "GET",
    auth: true,
  });
}
