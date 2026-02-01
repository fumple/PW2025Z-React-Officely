import { apiFetch } from "./http";

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
    self: Link;
    first: Link;
    last: Link;
    next?: Link;
    prev?: Link;
  };
};

export type BookingResource = {
  id: string;
  userId: string;
  officeId: string;
  itemId: string;
  offerId: string;

  status: "active" | "cancelledByUser" | "cancelledByStaff";

  creationDate: string;
  startDate: string;
  endDate: string;

  cancellationReason?: string;

  totalPrice: number;

  paymentInfo?: {
    status:
      | "pendingPayment"
      | "received"
      | "pendingRefund"
      | "refunded"
      | "cancelled";
    accountNumber: string;
    receiverName: string;
    transferTitle: string;
    dueDate: string;
  };

  _links: {
    self: Link;
    user?: Link;
    office: Link;
    item: Link;
    offer: Link;
    cancel?: Link;
    markPaid?: Link;
    markRefunded?: Link;
  };
};

export async function listBookings(params: {
  pageSize: number;
  pageToken?: string;
  officeId?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}) {
  const qp = new URLSearchParams();
  qp.set("pageSize", String(params.pageSize));
  if (params.pageToken) qp.set("pageToken", params.pageToken);
  if (params.officeId) qp.set("officeId", params.officeId);
  if (params.sortField) qp.set("sortField", params.sortField);
  if (params.sortDirection) qp.set("sortDirection", params.sortDirection);

  return apiFetch<PagedResponse<BookingResource>>(
    `/bookings?${qp.toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export async function getBooking(bookingId: string) {
  return apiFetch<BookingResource>(
    `/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export async function cancelBooking(params: {
  bookingId: string;
  withRefund: boolean;
  reason: string;
}) {
  return apiFetch<void>(
    `/bookings/${encodeURIComponent(params.bookingId)}/cancel`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        withRefund: params.withRefund,
        reason: params.reason,
      }),
    },
  );
}

export async function markBookingPaid(bookingId: string) {
  return apiFetch<void>(`/bookings/${encodeURIComponent(bookingId)}/markPaid`, {
    method: "POST",
    auth: true,
  });
}

export async function markBookingRefunded(bookingId: string) {
  return apiFetch<void>(
    `/bookings/${encodeURIComponent(bookingId)}/markRefunded`,
    {
      method: "POST",
      auth: true,
    },
  );
}
