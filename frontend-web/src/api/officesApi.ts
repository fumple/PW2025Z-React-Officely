import { apiFetch } from "./http";

export type OfficeResource = {
  id: string;
  name: string;
  address: string;

  description: string;
  openingHours: string;

  contactEmail: string;
  contactPhone: string;

  paymentAccountNumber: string;
  paymentReceiverName: string;

  published: boolean;

  coordinates?: { lat: number; lon: number };
  photoUrls?: string[];
};

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

export type OfficeOfferResource = {
  id: string;
  officeId: string;

  name: string;
  publicName: string;

  pricePerDay: number;
  pricePerDayCurrency: "PLN";

  freeCancellationHours: number;
  paymentHours: number;

  properties: Record<string, string[]>;
  available: boolean;

  _links: { self: Link };
};

export type OfficeItemResource = {
  id: string;
  officeId: string;
  offerId: string;
  name: string;
  room: string;
  floor: string;
  type: "SHARED" | "INDIVIDUAL";
  capacity?: number;
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

  return apiFetch<void>(`/offices/${encodeURIComponent(params.officeId)}`, {
    method: "PATCH",
    auth: true,
    body: fd,
  });
}

export type CreateOfficeOfferInput = {
  sourceId?: string;
  name: string;
  publicName?: string;

  pricePerDay: number;
  pricePerDayCurrency: "PLN";

  freeCancellationHours: number;
  paymentHours: number;

  properties?: Record<string, string>;
};

export async function createOfficeOffer(params: {
  officeId: string;
  input: CreateOfficeOfferInput;
}) {
  return apiFetch<{ id: string }>(
    `/offices/${encodeURIComponent(params.officeId)}/offers`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(params.input),
    },
  );
}

export async function getOfficeOffer(params: {
  officeId: string;
  offerId: string;
}) {
  return apiFetch<OfficeOfferResource>(
    `/offices/${encodeURIComponent(params.officeId)}/offers/${encodeURIComponent(
      params.offerId,
    )}`,
    { method: "GET", auth: true },
  );
}

export async function setOfficeOfferAvailable(params: {
  officeId: string;
  offerId: string;
  available: boolean;
}) {
  return apiFetch<void>(
    `/offices/${encodeURIComponent(params.officeId)}/offers/${encodeURIComponent(
      params.offerId,
    )}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ available: params.available }),
    },
  );
}

export type FilterFlag = {
  key: string;
  label: string;
};

export type OfferFiltersResponse = {
  filters: FilterSection[];
};

export type FilterSection = {
  key: string;
  label: string;
  elements: FilterElement[];
};

export type FilterElement =
  | {
      key: string;
      label: string;
      type: "flags";
      flags: Array<{ key: string; label: string }>;
    }
  | {
      key: string;
      label: string;
      type: "integer";
      min?: number;
      max?: number;
    };

export async function getOfferFilters() {
  return apiFetch<OfferFiltersResponse>(`/filters`, {
    method: "GET",
    auth: true,
  });
}

export type UpdateOfficeOfferInput = {
  name: string;
  publicName?: string;

  pricePerDay: number;
  pricePerDayCurrency: string;

  freeCancellationHours: number;
  paymentHours: number;

  // flat map, same as create
  properties: Record<string, string>;
};

export const updateOfficeOffer = async ({
  officeId,
  offerId,
  input,
}: {
  officeId: string;
  offerId: string;
  input: UpdateOfficeOfferInput;
}) => {
  return apiFetch<OfficeOfferResource>(
    `/offices/${encodeURIComponent(officeId)}/offers/${encodeURIComponent(
      offerId,
    )}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(input),
    },
  );
};

export type CreateOfficeItemInput = {
  name: string;
  type: "SHARED" | "INDIVIDUAL";

  offerId: string;
  floor: string;
  room: string;

  available?: boolean;

  // required by backend when type=SHARED
  capacity?: number;
};

export async function createOfficeItem(params: {
  officeId: string;
  input: CreateOfficeItemInput;
}) {
  return apiFetch<{ id: string }>(
    `/offices/${encodeURIComponent(params.officeId)}/items`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(params.input),
    },
  );
}

export async function getOfficeItem(params: {
  officeId: string;
  itemId: string;
}) {
  return apiFetch<OfficeItemResource>(
    `/offices/${encodeURIComponent(params.officeId)}/items/${encodeURIComponent(
      params.itemId,
    )}`,
    { method: "GET", auth: true },
  );
}

export type UpdateOfficeItemInput = {
  name?: string;
  type?: "SHARED" | "INDIVIDUAL";

  offerId?: string;
  floor?: string;
  room?: string;

  available?: boolean;

  capacity?: number;
};

export async function updateOfficeItem(params: {
  officeId: string;
  itemId: string;
  input: UpdateOfficeItemInput;
}) {
  return apiFetch<void>(
    `/offices/${encodeURIComponent(params.officeId)}/items/${encodeURIComponent(
      params.itemId,
    )}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(params.input),
    },
  );
}
