import { useMemo } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type UsersRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

const allUsers: UsersRow[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  email: "Text line",
  firstName: "Text line",
  lastName: "Text line",
}));

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const UsersManagementPage = () => {
  const navigate = useNavigate();

  const rows = allUsers;
  const pageSizeOptions = getRowsPerPageOptions(rows.length);

  const columns = useMemo<GridColDef<UsersRow>[]>(
    () => [
      { field: "id", headerName: "ID", minWidth: 90, flex: 0.5 },
      { field: "email", headerName: "Email", minWidth: 220, flex: 1.2 },
      { field: "firstName", headerName: "First Name", minWidth: 160, flex: 1 },
      { field: "lastName", headerName: "Last Name", minWidth: 160, flex: 1 },
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
            onClick={() => navigate(`/app/users/${params.row.id}`)}
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
          Users
        </Typography>
      </Box>

      {/* Official table card */}
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
          disableColumnFilter
        />
      </Box>
    </Box>
  );
};
