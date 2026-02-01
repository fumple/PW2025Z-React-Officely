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

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

import { OfficeLocationDisplay } from "./OfficeLocationDisplay";
import * as officesApi from "../../api/officesApi";
import OutlinedInput from "@mui/material/OutlinedInput";
import CircularProgress from "@mui/material/CircularProgress";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  id: string;
  name: string;
  type: "SHARED" | "INDIVIDUAL";
  floor: string;
  room: string;
  offerId: string;
  capacity: string;
};

type OfferRow = {
  id: string;
  name: string;
  publicName: string;
  pricePerDay: string;
  paymentHours: string;
  freeCancellationHours: string;
  available: string;
};

type MemberRow = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
};

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const OfficeDetailsPage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [office, setOffice] = useState<officesApi.OfficeResource | null>(null);

  const [itemsRows, setItemsRows] = useState<ItemRow[]>([]);
  const [offersRows, setOffersRows] = useState<OfferRow[]>([]);
  const [membersRows, setMembersRows] = useState<MemberRow[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const loadMembersDetailed = async (isAlive: () => boolean) => {
    if (!officeId) return;

    const membersRes = await officesApi.listOfficeMembers(officeId);
    if (!isAlive()) return;

    if (!membersRes.ok) {
      setMembersRows([]);
      return;
    }

    const members = membersRes.data.results;

    const userResults = await Promise.allSettled(
      members.map((m) => officesApi.getUser(m.userId)),
    );

    if (!isAlive()) return;

    const rows: MemberRow[] = members.map((m, idx) => {
      const ur = userResults[idx];

      if (ur.status === "fulfilled" && ur.value.ok) {
        const u = ur.value.data;
        return {
          id: m.id,
          userId: m.userId,
          email: u.email,
          fullName: `${u.firstName} ${u.lastName}`.trim(),
          role: u.type,
        };
      }

      return {
        id: m.id,
        userId: m.userId,
        email: "-",
        fullName: `User ${m.userId}`,
        role: "",
      };
    });

    setMembersRows(rows);
  };
  useEffect(() => {
    if (!officeId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const [officeRes, itemsRes, offersRes] = await Promise.all([
        officesApi.getOffice(officeId),
        officesApi.listOfficeItems({ officeId, pageSize: 50 }),
        officesApi.listOfficeOffers({ officeId, pageSize: 50 }),
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
            floor: it.floor,
            room: it.room,
            offerId: it.offerId,
            capacity: it.type === "SHARED" ? String(it.capacity ?? "") : "1", // INDIVIDUAL has no capacity
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
            publicName: o.publicName ?? "-",
            pricePerDay: `${o.pricePerDay} ${o.pricePerDayCurrency}`,
            paymentHours: String(o.paymentHours),
            freeCancellationHours: String(o.freeCancellationHours),
            available:
              o.available === undefined ? "-" : o.available ? "Yes" : "No",
          })),
        );
      } else {
        setOffersRows([]);
      }

      await loadMembersDetailed(() => true);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId]);

  const reloadMembers = async () => {
    await loadMembersDetailed(() => true);
  };

  const itemsPageSizeOptions = getRowsPerPageOptions(itemsRows.length);
  const offersPageSizeOptions = getRowsPerPageOptions(offersRows.length);
  const membersPageSizeOptions = getRowsPerPageOptions(membersRows.length);

  const itemsColumns = useMemo<GridColDef<ItemRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
      { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
      { field: "capacity", headerName: "Capacity", flex: 1, minWidth: 120 },
      { field: "floor", headerName: "Floor", flex: 1, minWidth: 120 },
      { field: "room", headerName: "Room", flex: 1, minWidth: 120 },
      { field: "offerId", headerName: "Offer ID", flex: 1, minWidth: 160 },
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
      {
        field: "publicName",
        headerName: "Public name",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "pricePerDay",
        headerName: "Price / day",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "paymentHours",
        headerName: "Payment (h)",
        flex: 1,
        minWidth: 130,
      },
      {
        field: "freeCancellationHours",
        headerName: "Free cancel (h)",
        flex: 1,
        minWidth: 150,
      },
      { field: "available", headerName: "Available", flex: 1, minWidth: 120 },
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
            onClick={() => navigate(`./offer/${params.row.id}`)}
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
            onClick={() => navigate(`./offer/${params.row.id}/edit`)}
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
      {
        field: "fullName",
        headerName: "Employee",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 240,
      },
      {
        field: "role",
        headerName: "Role",
        width: 140,
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
                startIcon={
                  office?.published ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )
                }
                sx={{ textTransform: "none" }}
                disabled={loading || !office || publishing}
                onClick={async () => {
                  if (!officeId || !office) return;

                  setPublishing(true);
                  setApiError(null);

                  const nextPublished = !office.published;

                  const res = await officesApi.setOfficePublished({
                    officeId,
                    published: nextPublished,
                  });

                  if (!res.ok) {
                    setApiError(
                      res.error?.errors?.[0]?.message ??
                        `Failed to ${nextPublished ? "publish" : "unpublish"} office.`,
                    );
                    setPublishing(false);
                    return;
                  }

                  const officeRes = await officesApi.getOffice(officeId);
                  if (officeRes.ok) setOffice(officeRes.data);

                  setPublishing(false);
                }}
              >
                {office?.published ? "Unpublish" : "Publish"}
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
          onClick={() => navigate("./offer/new")}
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
          onClick={() => {
            setAddMemberError(null);
            setMemberEmail("");
            setAddOpen(true);
          }}
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

      {/* Add Employee Dialog (wiring next) */}
      <Dialog
        open={addOpen}
        onClose={() => {
          if (addingMember) return;
          setAddOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add employee access</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "#444", mb: "10px" }}>
            Enter the employee's email. The employee must already have an
            account in the app.
          </Typography>

          {addMemberError ? (
            <Typography color="error" sx={{ mb: "10px" }}>
              {addMemberError}
            </Typography>
          ) : null}

          <Box>
            <Typography
              sx={{ fontSize: "12px", color: "text.secondary", mb: "4px" }}
            >
              Employee email
            </Typography>

            <OutlinedInput
              fullWidth
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="name.surname@company.com"
              autoFocus
              disabled={addingMember}
              onKeyDown={async (e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();

                const email = memberEmail.trim();
                if (!officeId || !email) return;

                setAddingMember(true);
                setAddMemberError(null);

                const res = await officesApi.createOfficeMember({
                  officeId,
                  email,
                });

                if (!res.ok) {
                  setAddMemberError(
                    res.error?.errors?.[0]?.message ??
                      "Failed to add employee access.",
                  );
                  setAddingMember(false);
                  return;
                }

                await reloadMembers();
                setAddOpen(false);
                setMemberEmail("");
                setAddingMember(false);
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            disabled={addingMember || !memberEmail.trim()}
            onClick={async () => {
              const email = memberEmail.trim();
              if (!officeId || !email) return;

              setAddingMember(true);
              setAddMemberError(null);

              const res = await officesApi.createOfficeMember({
                officeId,
                email,
              });

              if (!res.ok) {
                setAddMemberError(
                  res.error?.errors?.[0]?.message ??
                    "Failed to add employee access.",
                );
                setAddingMember(false);
                return;
              }

              await reloadMembers();

              setAddOpen(false);
              setMemberEmail("");
              setAddingMember(false);
            }}
          >
            {addingMember ? (
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <CircularProgress size={16} /> Adding...
              </Box>
            ) : (
              "Add"
            )}
          </Button>

          <Button
            variant="text"
            color="error"
            disabled={addingMember}
            onClick={() => setAddOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
