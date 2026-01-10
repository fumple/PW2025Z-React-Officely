import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import test1PhotoUrl from "../../assets/test-photo.jpg";
import test2PhotoUrl from "../../assets/test-photo-2.jpg";
import { OfficeLocationDisplay } from "./OfficeLocationDisplay";
import Paper from "@mui/material/Paper";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  id: string;
  name: string;
  floor: string;
  room: string;
  currentCapacity: string;
  totalCapacity: string;
};

type PricingRow = {
  id: string;
  name: string;
  price: string;
  usedBy: string;
  timeForPayment: string;
  timeForCancellation: string;
};

const allItems: ItemRow[] = Array.from({ length: 60 }).map((_, i) => ({
  id: String(i + 1),
  name: String("A" + (i + 1)),
  floor: "Text line",
  room: "Text line",
  currentCapacity: "Text line",
  totalCapacity: "Text line",
}));

const allPricings: PricingRow[] = Array.from({ length: 80 }).map((_, i) => ({
  id: String(i + 1),
  name: "Text line",
  price: "Text line",
  usedBy: "Text line",
  timeForPayment: "Text line",
  timeForCancellation: "Text line",
}));

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const OfficeDetailsPage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const location = {
    address: "",
    lat: 52.2297,
    lng: 21.0122,
  };

  const officeName = "Lorem Ipsum Office";
  const officeDescription = "The perfect office for everyone!";
  const officeAddress = "al. Jerozolimskie 179, 02-222 Warszawa";
  const officeCountry = "Poland";

  const itemsRows = allItems;
  const pricingRows = allPricings;

  const itemsPageSizeOptions = getRowsPerPageOptions(itemsRows.length);
  const pricingPageSizeOptions = getRowsPerPageOptions(pricingRows.length);

  const itemsColumns = useMemo<GridColDef<ItemRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
      { field: "floor", headerName: "Floor", flex: 1, minWidth: 120 },
      { field: "room", headerName: "Room", flex: 1, minWidth: 120 },
      {
        field: "currentCapacity",
        headerName: "Current capacity",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "totalCapacity",
        headerName: "Total capacity",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "details",
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
            onClick={() => navigate(`./item/${params.row.name}`)}
          >
            Details
          </Button>
        ),
      },
      {
        field: "edit",
        headerName: "",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        width: 80,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate(`./item/${params.row.name}/edit`)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const pricingColumns = useMemo<GridColDef<PricingRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "price", headerName: "Price", flex: 1, minWidth: 120 },
      { field: "usedBy", headerName: "Used by", flex: 1, minWidth: 140 },
      {
        field: "timeForPayment",
        headerName: "Time for payment",
        flex: 1,
        minWidth: 180,
      },
      {
        field: "timeForCancellation",
        headerName: "Time for cancellation",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "details",
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
            onClick={() => navigate(`./pricing-table/${params.row.id}`)}
          >
            Details
          </Button>
        ),
      },
      {
        field: "edit",
        headerName: "",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        width: 80,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate(`./pricing-table/${params.row.id}/edit`)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [navigate],
  );

  if (!officeId) return null;

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      {/* Top section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          mb: "18px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            mb: "18px",
          }}
        >
          {/* Left: title + description + actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              component="h1"
              sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
            >
              {officeName}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontSize: "13px", color: "#444" }}>
                {officeDescription}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#444" }}>
                Address: {officeAddress}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#444" }}>
                Country: {officeCountry}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <Button
                variant="contained"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => navigate("./edit")}
              >
                Edit
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/app/bookings")}
              >
                View bookings
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<VisibilityOffIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
              >
                Unpublish
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </Box>
            <Box sx={{ mb: "18px" }}>
              <Box sx={{ display: "flex", gap: "10px" }}>
                {[test1PhotoUrl, test2PhotoUrl].map((src, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={src}
                    alt={`Office photo ${idx + 1}`}
                    sx={{
                      height: 148,
                      border: "1px solid #eee",
                      objectFit: "cover",
                      backgroundColor: "#fff",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right: map in the top-right corner */}
          <Box sx={{ width: 400, flexShrink: 0 }}>
            <OfficeLocationDisplay
              address={location.address}
              lat={location.lat}
              lng={location.lng}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "10px",
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
          Bookable items
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate("./item/new")}
        >
          Add
        </Button>
      </Box>

      {/* Items table (final table style) */}
      <Paper variant="card">
        <DataGrid
          rows={itemsRows}
          columns={itemsColumns}
          disableRowSelectionOnClick
          pageSizeOptions={itemsPageSizeOptions}
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
      </Paper>

      {/* Pricing tables header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "10px",
          mt: "20px",
        }}
      >
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111",
          }}
        >
          Pricing tables
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate("./pricing-table/new")}
        >
          Add
        </Button>
      </Box>

      {/* Pricing table (final table style) */}
      <Paper variant="card">
        <DataGrid
          rows={pricingRows}
          columns={pricingColumns}
          disableRowSelectionOnClick
          pageSizeOptions={pricingPageSizeOptions}
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
      </Paper>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Office deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "#444", mb: "10px" }}>
            To delete an office the following requirements must be met:
          </Typography>

          <Box
            component="ul"
            sx={{
              mt: 0,
              mb: "12px",
              pl: "18px",
              color: "#444",
              fontSize: "13px",
            }}
          >
            <li>
              There may not be any upcoming or active reservations on the office
            </li>
          </Box>

          <Typography sx={{ fontSize: "13px", color: "#444", mb: "12px" }}>
            Unpublishing the office is preferred to deleting, since it prevents
            new reservations from being made and hides the office in search
            results, while still allowing users to view details of this office
            in their reservations.
          </Typography>

          <Typography sx={{ fontSize: "13px", color: "#444" }}>
            Are you sure you want to delete the office?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => {
              setDeleteOpen(false);
            }}
          >
            Yes
          </Button>

          <Button
            variant="text"
            color="error"
            onClick={() => setDeleteOpen(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
