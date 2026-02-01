import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import AddIcon from "@mui/icons-material/Add";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import type {
  GridFilterModel,
  GridSortModel,
  GridPaginationModel,
} from "@mui/x-data-grid/models";

import * as officesApi from "../../api/officesApi";

const BASE_PAGE_SIZES = [10, 20, 50] as const;

type OfficeRow = {
  id: string;
  name: string;
  address: string;
  published: boolean;
  contactEmail: string;
  photosCount: number;
};

function getPageTokenFromHref(href?: string): string | null {
  if (!href) return null;
  const m = href.match(/[?&]pageToken=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export const OfficesManagementPage = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState<OfficeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [pageTokens, setPageTokens] = useState<Record<number, string | null>>({
    0: null,
  });

  const [hasNextPage, setHasNextPage] = useState(false);

  const search = (filterModel.quickFilterValues ?? []).join(" ").trim();

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const sort = sortModel[0];
      const sortField = sort?.field;
      const sortDirection = sort?.sort;

      const tokenForPage = pageTokens[paginationModel.page] ?? null;

      const res = await officesApi.listOffices({
        pageSize: paginationModel.pageSize,
        pageToken: tokenForPage ?? undefined,
        search: search || undefined,
        sortField: sortField || undefined,
        sortDirection:
          (sortDirection as "asc" | "desc" | undefined) || undefined,
      });

      if (!alive) return;

      if (res.ok) {
        setRows(
          res.data.results.map((o) => ({
            id: o.id,
            name: o.name,
            address: o.address,
            published: o.published,
            contactEmail: o.contactEmail,
            photosCount: o.photoUrls?.length ?? 0,
          })),
        );

        const nextToken = getPageTokenFromHref(res.data._links.next?.href);
        setHasNextPage(!!nextToken);

        setPageTokens((prev) => {
          const nextPageIndex = paginationModel.page + 1;
          if (prev[nextPageIndex] === nextToken) return prev;
          return { ...prev, [nextPageIndex]: nextToken };
        });
      } else {
        setApiError(
          res.error?.errors?.[0]?.message ?? "Failed to load offices.",
        );
        setRows([]);
        setHasNextPage(false);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [paginationModel.page, paginationModel.pageSize, sortModel, search]);

  const handleSortModelChange = (m: GridSortModel) => {
    setSortModel(m);
    setPaginationModel((p) => ({ ...p, page: 0 }));
    setPageTokens({ 0: null });
  };

  const handleFilterModelChange = (m: GridFilterModel) => {
    setFilterModel(m);
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

  const columns = useMemo<GridColDef<OfficeRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
      { field: "contactEmail", headerName: "Contact", flex: 1, minWidth: 180 },
      {
        field: "published",
        headerName: "Status",
        minWidth: 120,
        valueGetter: (_, row) => (row.published ? "Published" : "Unpublished"),
        sortComparator: (a, b) => String(a).localeCompare(String(b)),
      },
      {
        field: "photosCount",
        headerName: "Photos",
        minWidth: 90,
        align: "right",
        headerAlign: "right",
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
          filterMode="server"
          paginationMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={-1}
          paginationMeta={{ hasNextPage }}
          pageSizeOptions={BASE_PAGE_SIZES}
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
