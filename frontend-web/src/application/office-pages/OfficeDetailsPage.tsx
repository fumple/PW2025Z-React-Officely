import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import OutlinedInput from "@mui/material/OutlinedInput";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

import { OfficeLocationDisplay } from "./OfficeLocationDisplay";
import * as officesApi from "../../api/officesApi";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  id: string;
  name: string;
  type: "SHARED" | "INDIVIDUAL";
  offerId: string;
  capacity: string;
};

type OfferRow = {
  id: string;
  name: string;
  price: string;
  availableFrom: string;
  availableTo: string;
};

type MemberRow = {
  id: string;
  userId: string;
};

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const OfficeDetailsPage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [office, setOffice] = useState<officesApi.OfficeResource | null>(null);

  const [itemsRows, setItemsRows] = useState<ItemRow[]>([]);
  const [offersRows, setOffersRows] = useState<OfferRow[]>([]);
  const [membersRows, setMembersRows] = useState<MemberRow[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!officeId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const [officeRes, itemsRes, offersRes, membersRes] = await Promise.all([
        officesApi.getOffice(officeId),
        officesApi.listOfficeItems({ officeId, pageSize: 50 }),
        officesApi.listOfficeOffers({ officeId, pageSize: 50 }),
        officesApi.listOfficeMembers(officeId),
      ]);

      if (!alive) return;

      if (!officeRes.ok) {
        setApiError(
          officeRes.error?.errors?.[0]?.message ?? "Failed to load office.",
        );
        setLoading(false);
        return;
      }

      setOffice(officeRes.data);

      if (itemsRes.ok) {
        setItemsRows(
          itemsRes.data.results.map((it) => ({
            id: it.id,
            name: it.name,
            type: it.type,
            offerId: it.offerId,
            capacity: it.type === "SHARED" ? String(it.capacity ?? "") : "-", // INDIVIDUAL has no capacity
          })),
        );
      } else {
        setItemsRows([]);
      }

      if (offersRes.ok) {
        setOffersRows(
          offersRes.data.results.map((o) => ({
            id: o.id,
            name: o.name,
            price: `${o.price} ${o.currency}`,
            availableFrom: o.availableFrom,
            availableTo: o.availableTo ?? "-",
          })),
        );
      } else {
        setOffersRows([]);
      }

      if (membersRes.ok) {
        setMembersRows(
          membersRes.data.results.map((m) => ({
            id: m.id,
            userId: m.userId,
          })),
        );
      } else {
        setMembersRows([]);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId]);

  const itemsPageSizeOptions = getRowsPerPageOptions(itemsRows.length);
  const offersPageSizeOptions = getRowsPerPageOptions(offersRows.length);
  const membersPageSizeOptions = getRowsPerPageOptions(membersRows.length);

  const itemsColumns = useMemo<GridColDef<ItemRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
      { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
      { field: "offerId", headerName: "Offer ID", flex: 1, minWidth: 160 },
      { field: "capacity", headerName: "Capacity", flex: 1, minWidth: 120 },
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
            onClick={() => navigate(`./item/${params.row.id}`)}
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
            onClick={() => navigate(`./item/${params.row.id}/edit`)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const offersColumns = useMemo<GridColDef<OfferRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "price", headerName: "Price", flex: 1, minWidth: 120 },
      {
        field: "availableFrom",
        headerName: "Available from",
        flex: 1,
        minWidth: 180,
      },
      {
        field: "availableTo",
        headerName: "Available to",
        flex: 1,
        minWidth: 180,
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

  const membersColumns = useMemo<GridColDef<MemberRow>[]>(
    () => [
      { field: "userId", headerName: "User ID", flex: 1, minWidth: 220 },
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
            onClick={() => navigate(`./employee/${params.row.userId}`)}
          >
            Details
          </Button>
        ),
      },
    ],
    [navigate],
  );

  if (!officeId) return null;

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      {apiError ? (
        <Typography color="error" sx={{ mb: "10px" }}>
          {apiError}
        </Typography>
      ) : null}

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
          {/* Left */}
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
              {loading ? "Loading..." : (office?.name ?? "-")}
            </Typography>

            {office ? (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#444",
                    whiteSpace: "pre-line",
                  }}
                >
                  {office.description}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#444" }}>
                  Opening hours:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#444",
                    whiteSpace: "pre-line",
                  }}
                >
                  {office.openingHours}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#444" }}>
                  Address: {office.address}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#444" }}>
                  Contact: {office.contactEmail} · {office.contactPhone}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#444" }}>
                  Payment: {office.paymentReceiverName} ·{" "}
                  {office.paymentAccountNumber}
                </Typography>
              </Box>
            ) : null}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <Button
                variant="contained"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => navigate("./edit")}
                disabled={loading || !office}
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
                disabled={loading || !office || publishing}
                onClick={async () => {
                  if (!officeId) return;

                  setPublishing(true);
                  setApiError(null);

                  const res = await officesApi.setOfficePublished({
                    officeId,
                    published: false,
                  });

                  setPublishing(false);

                  if (!res.ok) {
                    setApiError(
                      res.error?.errors?.[0]?.message ??
                        "Failed to unpublish office.",
                    );
                    return;
                  }

                  // refresh office so UI shows updated state (if your OfficeResource exposes it)
                  const officeRes = await officesApi.getOffice(officeId);
                  if (officeRes.ok) setOffice(officeRes.data);
                }}
              >
                Unpublish
              </Button>
            </Box>

            {/* Gallery */}
            <Box sx={{ mb: "18px" }}>
              <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {(office?.photoUrls ?? []).map((src, idx) => (
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
                      borderRadius: "10px",
                    }}
                  />
                ))}
                {!loading && office && (office.photoUrls?.length ?? 0) === 0 ? (
                  <Typography sx={{ fontSize: "13px", color: "#666" }}>
                    No photos.
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>

          {/* Right: map */}
          <Box sx={{ width: 400, flexShrink: 0 }}>
            <OfficeLocationDisplay
              address={office?.address ?? ""}
              lat={office?.coordinates?.lat ?? 52.2297}
              lng={office?.coordinates?.lon ?? 21.0122} // API uses lon
            />
          </Box>
        </Box>
      </Box>

      {/* Items */}
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
          disabled={loading || !office}
        >
          Add
        </Button>
      </Box>

      <Paper variant="card">
        <DataGrid
          rows={itemsRows}
          columns={itemsColumns}
          disableRowSelectionOnClick
          loading={loading}
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
          disableColumnFilter
        />
      </Paper>

      {/* Offers */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "10px",
          mt: "20px",
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
          Offers
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate("./pricing-table/new")}
          disabled={loading || !office}
        >
          Add
        </Button>
      </Box>

      <Paper variant="card">
        <DataGrid
          rows={offersRows}
          columns={offersColumns}
          disableRowSelectionOnClick
          loading={loading}
          pageSizeOptions={offersPageSizeOptions}
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

      {/* Members */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "10px",
          mt: "20px",
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
          Employees with access
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setAddOpen(true)}
          disabled={loading || !office}
        >
          Add
        </Button>
      </Box>

      <Paper variant="card">
        <DataGrid
          rows={membersRows}
          columns={membersColumns}
          disableRowSelectionOnClick
          loading={loading}
          pageSizeOptions={membersPageSizeOptions}
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

      {/* Delete dialog (API does not support delete in spec, keep as info-only for now) */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Office deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "#444" }}>
            Deleting an office is not supported by the current API
            specification.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button variant="text" onClick={() => setDeleteOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Dialog (wiring next) */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add employee access</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "#444", mb: "10px" }}>
            Enter employee email (wiring API next: POST /offices/{officeId}
            /members).
          </Typography>
          <Box>
            <Typography
              sx={{ fontSize: "12px", color: "text.secondary", mb: "4px" }}
            >
              Employee email
            </Typography>
            <OutlinedInput fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setAddOpen(false)}
          >
            Add
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => setAddOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
