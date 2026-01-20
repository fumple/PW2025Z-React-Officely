import { useMemo } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import Paper from "@mui/material/Paper";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type OfficeRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  totalCapacity: string;
};

const allOffices: OfficeRow[] = Array.from({ length: 60 }).map((_, i) => ({
  id: String(i + 1),
  name: "Text line",
  address: "Text line",
  city: "Text line",
  country: "Text line",
  totalCapacity: "Text line",
}));

export const OfficesManagementPage = () => {
  const navigate = useNavigate();

  const rows = allOffices;

  const columns = useMemo<GridColDef<OfficeRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "address", headerName: "Address", flex: 1, minWidth: 160 },
      { field: "city", headerName: "City", flex: 1, minWidth: 140 },
      { field: "country", headerName: "Country", flex: 1, minWidth: 140 },
      {
        field: "totalCapacity",
        headerName: "Total capacity",
        flex: 1,
        minWidth: 160,
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
            onClick={() => navigate(`/app/offices/${params.row.id}`)}
          >
            Details
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const pageSizeOptions =
    rows.length === 0
      ? [10]
      : (BASE_PAGE_SIZES.filter((n) => n <= rows.length) as number[]).length > 0
        ? (BASE_PAGE_SIZES.filter((n) => n <= rows.length) as number[])
        : [rows.length];

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          mb: "12px",
        }}
      >
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          Offices
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate("/app/offices/new")}
        >
          Add new office
        </Button>
      </Box>

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
