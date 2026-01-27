import { apiFetch } from "./http";

type OfficeResource = {
  id: string;
  name: string;
  address: string;
};

type Link = { href: string };

type PagedResponse<T> = {
  results: T[];
  _links: {
    next?: Link;
    self: Link;
    first: Link;
    last: Link;
  };
};

export async function listOffices(
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

  const path = `/offices?${qp.toString()}`;

  return apiFetch<PagedResponse<OfficeResource>>(path, {
    method: "GET",
    auth: true,
  });
}
