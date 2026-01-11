import { useMemo } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type PaymentRow = {
  id: string;
  reservationId: string;
  type: string;
  amount: string; // later: number
  status: string;
  creationDate: string; // later: ISO string
  dueDate: string; // later: ISO string
};

const allPayments: PaymentRow[] = Array.from({ length: 123 }).map((_, i) => ({
  id: String(i + 1),
  reservationId: "Text line",
  type: "Text line",
  amount: "Text line",
  status: "Text line",
  creationDate: "Text line",
  dueDate: "Text line",
}));

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const PaymentsOverviewPage = () => {
  const navigate = useNavigate();

  const rows = allPayments;
  const pageSizeOptions = getRowsPerPageOptions(rows.length);

  const columns = useMemo<GridColDef<PaymentRow>[]>(
    () => [
      { field: "id", headerName: "ID", minWidth: 90, flex: 0.5 },
      {
        field: "reservationId",
        headerName: "Reservation ID",
        minWidth: 160,
        flex: 1,
      },
      { field: "type", headerName: "Type", minWidth: 140, flex: 0.9 },
      { field: "amount", headerName: "Amount", minWidth: 140, flex: 0.8 },
      { field: "status", headerName: "Status", minWidth: 140, flex: 0.9 },
      {
        field: "creationDate",
        headerName: "Creation date",
        minWidth: 160,
        flex: 0.9,
      },
      { field: "dueDate", headerName: "Due date", minWidth: 160, flex: 0.9 },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        width: 110,
        renderCell: () => (
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate("/app/bookings")}
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
            Details
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ mb: "12px" }}>
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          Payments
        </Typography>
      </Box>

      <Box
        sx={{
          height: 520,
          backgroundColor: "#fff",
          borderRadius: "10px",
          p: "12px",
        }}
      >
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
        />
      </Box>
    </Box>
  );
};
