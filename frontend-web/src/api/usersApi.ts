import { apiFetch } from "./http";

export type Me = {
  firstName: string;
  lastName: string;
  email: string;
  admin: boolean;
};

export function getMe() {
  return apiFetch<Me>("/users/@me", { method: "GET", auth: true });
}
