import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import type {
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid/models";

import * as bookingsApi from "../../api/bookingsApi";
import * as officesApi from "../../api/officesApi";
import * as usersApi from "../../api/usersApi";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type BookingRow = {
  id: string;

  officeId: string;
  office: string;

  userId: string;
  user: string;
  userType: string;

  totalPrice: string;
  paymentStatus: string;
  bookingStatus: string;
  creationDate: string;
  bookingPeriod: string;
};

function getPageTokenFromHref(href?: string): string | null {
  if (!href) return null;
  const m = href.match(/[?&]pageToken=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function formatPaymentStatus(
  s?: NonNullable<bookingsApi.BookingResource["paymentInfo"]>["status"],
) {
  if (!s) return "-";
  switch (s) {
    case "pendingPayment":
      return "Due";
    case "received":
      return "Paid";
    case "pendingRefund":
      return "Pending refund";
    case "refunded":
      return "Refunded";
    case "cancelled":
      return "Cancelled";
    default:
      return String(s);
  }
}

function getOfficeIdFromSearch(search: string): string | null {
  const v = new URLSearchParams(search).get("officeId");
  const trimmed = (v ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Wrapper to naturally reset pagination/tokens when officeId filter changes
 * (no "reset-state-in-effect" warnings).
 */
export const BookingsManagementPage = () => {
  const location = useLocation();
  const officeId = getOfficeIdFromSearch(location.search);

  return (
    <BookingsManagementInner key={officeId ?? "all"} officeId={officeId} />
  );
};

const BookingsManagementInner = ({ officeId }: { officeId: string | null }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [pageTokens, setPageTokens] = useState<Record<number, string | null>>({
    0: null,
  });

  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const sort = sortModel[0];
      const sortField = sort?.field;
      const sortDirection = sort?.sort;

      const tokenForPage = pageTokens[paginationModel.page] ?? null;

      const res = await bookingsApi.listBookings({
        officeId: officeId ?? undefined,
        pageSize: paginationModel.pageSize,
        pageToken: tokenForPage ?? undefined,
        sortField: sortField || undefined,
        sortDirection:
          (sortDirection as "asc" | "desc" | undefined) || undefined,
      });

      if (!alive) return;

      if (!res.ok) {
        setApiError(
          res.error?.errors?.[0]?.message ?? "Failed to load bookings.",
        );
        setRows([]);
        setHasNextPage(false);
        setLoading(false);
        return;
      }

      const bookings = res.data.results;

      const uniqueOfficeIds = Array.from(
        new Set(bookings.map((b) => b.officeId)),
      );
      const uniqueUserIds = Array.from(new Set(bookings.map((b) => b.userId)));

      const [officeResults, userResults] = await Promise.all([
        Promise.allSettled(
          uniqueOfficeIds.map((id) => officesApi.getOffice(id)),
        ),
        Promise.allSettled(uniqueUserIds.map((id) => usersApi.getUser(id))),
      ]);

      if (!alive) return;

      const officeNameById = new Map<string, string>();
      uniqueOfficeIds.forEach((id, idx) => {
        const r = officeResults[idx];
        if (r.status === "fulfilled" && r.value.ok) {
          officeNameById.set(id, r.value.data.name);
        }
      });

      const userLabelById = new Map<string, string>();
      const userTypeById = new Map<string, string>();
      uniqueUserIds.forEach((id, idx) => {
        const r = userResults[idx];
        if (r.status === "fulfilled" && r.value.ok) {
          const u = r.value.data;
          const full = `${u.firstName} ${u.lastName}`.trim();
          userLabelById.set(id, `${full} (${u.email})`);
          userTypeById.set(id, String(u.type ?? "-"));
        }
      });

      setRows(
        bookings.map((b) => ({
          id: b.id,

          officeId: b.officeId,
          office: officeNameById.get(b.officeId) ?? `Office ${b.officeId}`,

          userId: b.userId,
          user: userLabelById.get(b.userId) ?? `User ${b.userId}`,
          userType: userTypeById.get(b.userId) ?? "-",

          totalPrice: String(b.totalPrice),
          paymentStatus: formatPaymentStatus(b.paymentInfo?.status),
          bookingStatus: b.status,
          creationDate: b.creationDate,
          bookingPeriod: `${b.startDate} → ${b.endDate}`,
        })),
      );

      const nextToken = getPageTokenFromHref(res.data._links.next?.href);
      setHasNextPage(!!nextToken);

      setPageTokens((prev) => {
        const nextPageIndex = paginationModel.page + 1;
        if (prev[nextPageIndex] === nextToken) return prev;
        return { ...prev, [nextPageIndex]: nextToken };
      });

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, paginationModel.page, paginationModel.pageSize, sortModel]);

  const handleSortModelChange = (m: GridSortModel) => {
    setSortModel(m);
    setPaginationModel((p) => ({ ...p, page: 0 }));
    setPageTokens({ 0: null });
  };

  const handlePaginationModelChange = (m: GridPaginationModel) => {
    if (m.pageSize !== paginationModel.pageSize) {
      setPaginationModel({ page: 0, pageSize: m.pageSize });
      setPageTokens({ 0: null });
      return;
    }

    if (m.page > paginationModel.page && !hasNextPage) return;

    const token = pageTokens[m.page];
    if (m.page > 0 && token === undefined) return;

    setPaginationModel(m);
  };

  const columns = useMemo<GridColDef<BookingRow>[]>(
    () => [
      {
        field: "office",
        headerName: "Office",
        minWidth: 220,
        flex: 1.1,
        renderCell: (params) => (
          <Button
            variant="text"
            onClick={() => navigate(`/app/offices/${params.row.officeId}`)}
            sx={{
              minWidth: 0,
              padding: 0,
              fontSize: "12px",
              "&:hover": {
                textDecoration: "underline",
                backgroundColor: "transparent",
              },
            }}
          >
            {params.value}
          </Button>
        ),
      },
      {
        field: "user",
        headerName: "User",
        minWidth: 260,
        flex: 1.2,
        renderCell: (params) => (
          <Button
            variant="text"
            onClick={() => navigate(`/app/users/${params.row.userId}`)}
            sx={{
              minWidth: 0,
              padding: 0,
              fontSize: "12px",
              "&:hover": {
                textDecoration: "underline",
                backgroundColor: "transparent",
              },
            }}
          >
            {params.value}
          </Button>
        ),
      },
      { field: "userType", headerName: "User type", minWidth: 140, flex: 0.7 },
      {
        field: "totalPrice",
        headerName: "Total price",
        minWidth: 130,
        flex: 0.6,
      },
      {
        field: "paymentStatus",
        headerName: "Payment status",
        minWidth: 170,
        flex: 0.8,
      },
      {
        field: "bookingStatus",
        headerName: "Booking status",
        minWidth: 170,
        flex: 0.8,
      },
      {
        field: "creationDate",
        headerName: "Creation date",
        minWidth: 190,
        flex: 0.9,
      },
      {
        field: "bookingPeriod",
        headerName: "Booking period",
        minWidth: 170,
        flex: 0.9,
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        width: 110,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate(`/app/bookings/${params.row.id}`)}
          >
            Details
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ mb: "12px", display: "flex", alignItems: "baseline", gap: 2 }}>
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          Bookings
        </Typography>

        {officeId ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "13px", color: "#555" }}>
              Filtered by office: {officeId}
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/app/bookings")}
              sx={{ minWidth: 0, padding: 0, fontSize: "12px" }}
            >
              Clear
            </Button>
          </Box>
        ) : null}
      </Box>

      {apiError ? (
        <Typography color="error" sx={{ mb: "10px" }}>
          {apiError}
        </Typography>
      ) : null}

      <Paper variant="card" sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          loading={loading}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={-1}
          paginationMeta={{ hasNextPage }}
          pageSizeOptions={BASE_PAGE_SIZES}
          disableColumnFilter
        />
      </Paper>
    </Box>
  );
};
