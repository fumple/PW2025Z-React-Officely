import { apiFetch } from "./http";

export type OfficeResource = {
  id: string;
  ownerId?: string;

  name: string;
  description: string;
  openingHours: string;

  address: string;
  coordinates: { lat: number; lon: number };

  photoUrls: string[];

  contactEmail: string;
  contactPhone: string;

  paymentAccountNumber: string;
  paymentReceiverName: string;

  published?: boolean;
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

export type CreateOfficeInput = {
  name: string;
  description: string;
  openingHours: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  paymentAccountNumber: string;
  paymentReceiverName: string;
  images: File[];
};

export async function createOffice(input: CreateOfficeInput) {
  const fd = new FormData();

  fd.append(
    "office",
    new Blob(
      [
        JSON.stringify({
          name: input.name,
          description: input.description,
          openingHours: input.openingHours,
          address: input.address,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          paymentAccountNumber: input.paymentAccountNumber,
          paymentReceiverName: input.paymentReceiverName,
        }),
      ],
      { type: "application/json" },
    ),
  );

  for (const f of input.images) fd.append("images", f);

  return apiFetch<{ id: string }>(`/offices`, {
    method: "POST",
    auth: true,
    body: fd,
  });
}

type Pagination = {
  currentPage: number;
  lastPage: number;
  pageSize: number;
};

export type OfficeOfferResource = {
  id: string;
  officeId: string;
  name: string;
  description: string;
  price: number;
  currency: "PLN";
  availableFrom: string; // date-time
  availableTo?: string; // date-time
  _links: { self: Link };
};

export type OfficeItemResource = {
  id: string;
  officeId: string;
  offerId: string;
  name: string;
  type: "SHARED" | "INDIVIDUAL";
  capacity?: number; // only for SHARED
  _links: { self: Link };
};

export type OfficeMemberResource = {
  id: string;
  officeId: string;
  userId: string;
  _links: { self: Link; delete?: Link };
};

function getPageTokenFromHref(href?: string): string | null {
  if (!href) return null;
  const m = href.match(/[?&]pageToken=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function getOffice(officeId: string) {
  return apiFetch<OfficeResource>(`/offices/${encodeURIComponent(officeId)}`, {
    method: "GET",
    auth: true,
  });
}

export async function listOfficeOffers(params: {
  officeId: string;
  pageSize?: number;
  pageToken?: string;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}) {
  const qp = new URLSearchParams();
  qp.set("pageSize", String(params.pageSize ?? 50));
  if (params.pageToken) qp.set("pageToken", params.pageToken);
  if (params.search) qp.set("search", params.search);
  if (params.sortField) qp.set("sortField", params.sortField);
  if (params.sortDirection) qp.set("sortDirection", params.sortDirection);

  return apiFetch<PagedResponse<OfficeOfferResource>>(
    `/offices/${encodeURIComponent(params.officeId)}/offers?${qp.toString()}`,
    { method: "GET", auth: true },
  );
}

export async function listOfficeItems(params: {
  officeId: string;
  pageSize?: number;
  pageToken?: string;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}) {
  const qp = new URLSearchParams();
  qp.set("pageSize", String(params.pageSize ?? 50));
  if (params.pageToken) qp.set("pageToken", params.pageToken);
  if (params.search) qp.set("search", params.search);
  if (params.sortField) qp.set("sortField", params.sortField);
  if (params.sortDirection) qp.set("sortDirection", params.sortDirection);

  return apiFetch<PagedResponse<OfficeItemResource>>(
    `/offices/${encodeURIComponent(params.officeId)}/items?${qp.toString()}`,
    { method: "GET", auth: true },
  );
}

export async function listOfficeMembers(officeId: string) {
  // NOTE: members response is not paged in the YAML (just results + _links)
  return apiFetch<{
    results: OfficeMemberResource[];
    _links: { self: Link; create?: Link };
  }>(`/offices/${encodeURIComponent(officeId)}/members`, {
    method: "GET",
    auth: true,
  });
}

export { getPageTokenFromHref };

export type UpdateOfficeInput = {
  officeId: string;
  office: {
    name: string;
    description: string;
    openingHours: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    paymentAccountNumber: string;
    paymentReceiverName: string;
    published?: boolean;
    images: string[];
  };
  addedImages: File[];
};

export async function updateOffice(input: UpdateOfficeInput) {
  const fd = new FormData();

  fd.append(
    "office",
    new Blob([JSON.stringify(input.office)], { type: "application/json" }),
  );

  for (const f of input.addedImages) fd.append("addedImages", f);

  return apiFetch<void>(`/offices/${encodeURIComponent(input.officeId)}`, {
    method: "PATCH",
    auth: true,
    body: fd,
  });
}

export async function setOfficePublished(params: {
  officeId: string;
  published: boolean;
}) {
  const fd = new FormData();

  fd.append(
    "office",
    new Blob([JSON.stringify({ published: params.published })], {
      type: "application/json",
    }),
  );

  // IMPORTANT: we intentionally DO NOT append "addedImages" here.

  return apiFetch<void>(`/offices/${encodeURIComponent(params.officeId)}`, {
    method: "PATCH",
    auth: true,
    body: fd,
  });
}
