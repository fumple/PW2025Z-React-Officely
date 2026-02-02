import { apiFetch, type ApiErrorResponse } from "./http";

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

export type OfficeResource = {
  id: string;
  name: string;
  published: boolean;
};

export type BookingResource = {
  id: string;
  status: "active" | "cancelledByUser" | "cancelledByStaff";
  startDate: string; // ISO date-time string
  endDate: string; // ISO date-time string
  paymentInfo: {
    status:
      | "pendingPayment"
      | "received"
      | "pendingRefund"
      | "refunded"
      | "cancelled";
  };
};

function getPageTokenFromHref(href?: string): string | null {
  if (!href) return null;
  const m = href.match(/[?&]pageToken=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

type FetchAllOk<T> = { ok: true; data: T[] };
type FetchAllErr = {
  ok: false;
  status: number;
  error: ApiErrorResponse | null;
};

async function fetchAllPages<T>(
  path: string,
  pageSize = 50,
): Promise<FetchAllOk<T> | FetchAllErr> {
  const all: T[] = [];
  let pageToken: string | null = null;

  for (let i = 0; i < 50; i++) {
    const qp = new URLSearchParams();
    qp.set("pageSize", String(pageSize));
    if (pageToken) qp.set("pageToken", pageToken);

    const res = await apiFetch<PagedResponse<T>>(`${path}?${qp.toString()}`, {
      method: "GET",
      auth: true,
    });

    if (!res.ok) return { ok: false, status: res.status, error: res.error };

    all.push(...res.data.results);

    const nextToken = getPageTokenFromHref(res.data._links.next?.href);
    if (!nextToken) break;
    pageToken = nextToken;
  }

  return { ok: true, data: all };
}

export async function getDashboardStats() {
  const [officesRes, bookingsRes] = await Promise.all([
    fetchAllPages<OfficeResource>("/offices"),
    fetchAllPages<BookingResource>("/bookings"),
  ]);

  if (!officesRes.ok) return officesRes;
  if (!bookingsRes.ok) return bookingsRes;

  const offices = officesRes.data;
  const bookings = bookingsRes.data;

  const now = new Date();

  const activeOffices = offices.filter((o) => o.published).length;

  const futureBookings = bookings.filter(
    (b) => b.status === "active" && new Date(b.startDate) > now,
  ).length;

  const pastBookings = bookings.filter((b) => new Date(b.endDate) < now).length;

  const pendingPayments = bookings.filter(
    (b) => b.paymentInfo?.status === "pendingPayment",
  ).length;

  return {
    ok: true as const,
    data: { activeOffices, futureBookings, pastBookings, pendingPayments },
  };
}
