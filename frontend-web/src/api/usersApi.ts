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
type Link = { href: string };

type Pagination = {
  currentPage: number;
  lastPage: number;
  pageSize: number;
};

type PagedResponse<T> = {
  results: T[];
  _pagination: Pagination;
  _links: {
    next?: Link;
    prev?: Link;
    self: Link;
    first: Link;
    last: Link;
  };
};

export async function listUsers(
  params: {
    pageSize?: number;
    pageToken?: string;
    search?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  } = {},
) {
  const qp = new URLSearchParams();
  qp.set("pageSize", String(params.pageSize ?? 50));
  if (params.pageToken) qp.set("pageToken", params.pageToken);
  if (params.search) qp.set("search", params.search);
  if (params.sortField) qp.set("sortField", params.sortField);
  if (params.sortDirection) qp.set("sortDirection", params.sortDirection);

  return apiFetch<PagedResponse<UserResource>>(`/users?${qp.toString()}`, {
    method: "GET",
    auth: true,
  });
}

export async function setUserBlocked(params: {
  userId: string;
  blocked: boolean;
}) {
  return apiFetch<void>(`/users/${encodeURIComponent(params.userId)}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ blocked: params.blocked }),
  });
}
