import { useMemo } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type BookingRow = {
  id: string;
  office: string;
  price: string; // later: number
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  creationDate: string; // later: ISO string
  bookingPeriod: string; // later: { from; to } or 2 fields
};

const allBookings: BookingRow[] = Array.from({ length: 40 }).map((_, i) => ({
  id: String(i + 1),
  office: "Text line",
  price: "Text line",
  paymentMethod: "Text line",
  paymentStatus: "Text line",
  bookingStatus: "Text line",
  creationDate: "Text line",
  bookingPeriod: "Text line",
}));

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const BookingsManagementPage = () => {
  const navigate = useNavigate();

  const rows = allBookings;
  const pageSizeOptions = getRowsPerPageOptions(rows.length);

  const columns = useMemo<GridColDef<BookingRow>[]>(
    () => [
      { field: "id", headerName: "ID", minWidth: 90, flex: 0.5 },
      { field: "office", headerName: "Office", minWidth: 180, flex: 1 },
      {
        field: "price",
        headerName: "Price paid/due",
        minWidth: 160,
        flex: 0.9,
      },
      {
        field: "paymentMethod",
        headerName: "Payment method",
        minWidth: 160,
        flex: 0.9,
      },
      {
        field: "paymentStatus",
        headerName: "Payment status",
        minWidth: 160,
        flex: 0.9,
      },
      {
        field: "bookingStatus",
        headerName: "Booking status",
        minWidth: 160,
        flex: 0.9,
      },
      {
        field: "creationDate",
        headerName: "Creation date",
        minWidth: 160,
        flex: 0.9,
      },
      {
        field: "bookingPeriod",
        headerName: "Booking period",
        minWidth: 180,
        flex: 1,
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
      {/* Header (same style as others, just no "Add" button) */}
      <Box sx={{ mb: "12px" }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          Bookings
        </Typography>
      </Box>

      {/* Table card */}
      <Paper variant="card" sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={pageSizeOptions}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}
          disableColumnFilter
        />
      </Paper>
    </Box>
  );
};
