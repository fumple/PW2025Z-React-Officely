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
