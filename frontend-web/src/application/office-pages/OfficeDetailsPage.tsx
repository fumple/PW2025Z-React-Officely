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
import type {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid/models";

const BASE_PAGE_SIZES = [10, 20, 50] as const;

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

function getPageTokenFromHref(href?: string): string | null {
  if (!href) return null;
  const m = href.match(/[?&]pageToken=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Wrapper component that forces a full remount when officeId changes.
 * This avoids "reset-state-in-effect" warnings and naturally resets pagination/search states.
 */
export const OfficeDetailsPage = () => {
  const { officeId } = useParams<{ officeId: string }>();
  if (!officeId) return null;

  return <OfficeDetailsInner key={officeId} officeId={officeId} />;
};

const OfficeDetailsInner = ({ officeId }: { officeId: string }) => {
  const navigate = useNavigate();

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

  const [itemsLoading, setItemsLoading] = useState(false);

  const [itemsPaginationModel, setItemsPaginationModel] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [itemsSortModel, setItemsSortModel] = useState<GridSortModel>([]);
  const [itemsFilterModel, setItemsFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [itemsPageTokens, setItemsPageTokens] = useState<
    Record<number, string | null>
  >({
    0: null,
  });
  const [itemsHasNextPage, setItemsHasNextPage] = useState(false);

  const itemsSearch = (itemsFilterModel.quickFilterValues ?? [])
    .join(" ")
    .trim();

  const [offersLoading, setOffersLoading] = useState(false);

  const [offersPaginationModel, setOffersPaginationModel] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [offersSortModel, setOffersSortModel] = useState<GridSortModel>([]);
  const [offersFilterModel, setOffersFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [offersPageTokens, setOffersPageTokens] = useState<
    Record<number, string | null>
  >({
    0: null,
  });
  const [offersHasNextPage, setOffersHasNextPage] = useState(false);

  const offersSearch = (offersFilterModel.quickFilterValues ?? [])
    .join(" ")
    .trim();

  const loadMembersDetailed = async (isAlive: () => boolean) => {
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
    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const officeRes = await officesApi.getOffice(officeId);
      if (!alive) return;

      if (!officeRes.ok) {
        setApiError(
          officeRes.error?.errors?.[0]?.message ?? "Failed to load office.",
        );
        setLoading(false);
        return;
      }

      setOffice(officeRes.data);

      await loadMembersDetailed(() => alive);
      if (!alive) return;

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setItemsLoading(true);

      const sort = itemsSortModel[0];
      const sortField = sort?.field;
      const sortDirection = sort?.sort;

      const tokenForPage = itemsPageTokens[itemsPaginationModel.page] ?? null;

      const res = await officesApi.listOfficeItems({
        officeId,
        pageSize: itemsPaginationModel.pageSize,
        pageToken: tokenForPage ?? undefined,
        search: itemsSearch || undefined,
        sortField: sortField || undefined,
        sortDirection:
          (sortDirection as "asc" | "desc" | undefined) || undefined,
      });

      if (!alive) return;

      if (res.ok) {
        setItemsRows(
          res.data.results.map((it) => ({
            id: it.id,
            name: it.name,
            type: it.type,
            floor: it.floor,
            room: it.room,
            offerId: it.offerId,
            capacity: it.type === "SHARED" ? String(it.capacity ?? "") : "1",
          })),
        );

        const nextToken = getPageTokenFromHref(res.data._links.next?.href);
        setItemsHasNextPage(!!nextToken);

        setItemsPageTokens((prev) => {
          const nextPageIndex = itemsPaginationModel.page + 1;
          if (prev[nextPageIndex] === nextToken) return prev;
          return { ...prev, [nextPageIndex]: nextToken };
        });
      } else {
        setItemsRows([]);
        setItemsHasNextPage(false);
      }

      setItemsLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [
    officeId,
    itemsPaginationModel.page,
    itemsPaginationModel.pageSize,
    itemsSortModel,
    itemsSearch,
    itemsPageTokens,
  ]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setOffersLoading(true);

      const sort = offersSortModel[0];
      const sortField = sort?.field;
      const sortDirection = sort?.sort;

      const tokenForPage = offersPageTokens[offersPaginationModel.page] ?? null;

      const res = await officesApi.listOfficeOffers({
        officeId,
        pageSize: offersPaginationModel.pageSize,
        pageToken: tokenForPage ?? undefined,
        search: offersSearch || undefined,
        sortField: sortField || undefined,
        sortDirection:
          (sortDirection as "asc" | "desc" | undefined) || undefined,
      });

      if (!alive) return;

      if (res.ok) {
        setOffersRows(
          res.data.results.map((o) => ({
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

        const nextToken = getPageTokenFromHref(res.data._links.next?.href);
        setOffersHasNextPage(!!nextToken);

        setOffersPageTokens((prev) => {
          const nextPageIndex = offersPaginationModel.page + 1;
          if (prev[nextPageIndex] === nextToken) return prev;
          return { ...prev, [nextPageIndex]: nextToken };
        });
      } else {
        setOffersRows([]);
        setOffersHasNextPage(false);
      }

      setOffersLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [
    officeId,
    offersPaginationModel.page,
    offersPaginationModel.pageSize,
    offersSortModel,
    offersSearch,
    offersPageTokens,
  ]);

  const handleOffersSortModelChange = (m: GridSortModel) => {
    setOffersSortModel(m);
    setOffersPaginationModel((p) => ({ ...p, page: 0 }));
    setOffersPageTokens({ 0: null });
  };

  const handleOffersFilterModelChange = (m: GridFilterModel) => {
    setOffersFilterModel(m);
    setOffersPaginationModel((p) => ({ ...p, page: 0 }));
    setOffersPageTokens({ 0: null });
  };

  const handleOffersPaginationModelChange = (m: GridPaginationModel) => {
    if (m.pageSize !== offersPaginationModel.pageSize) {
      setOffersPaginationModel({ page: 0, pageSize: m.pageSize });
      setOffersPageTokens({ 0: null });
      return;
    }
    if (m.page > offersPaginationModel.page && !offersHasNextPage) return;

    const token = offersPageTokens[m.page];
    if (m.page > 0 && token === undefined) return;

    setOffersPaginationModel(m);
  };

  const handleItemsSortModelChange = (m: GridSortModel) => {
    setItemsSortModel(m);
    setItemsPaginationModel((p) => ({ ...p, page: 0 }));
    setItemsPageTokens({ 0: null });
  };

  const handleItemsFilterModelChange = (m: GridFilterModel) => {
    setItemsFilterModel(m);
    setItemsPaginationModel((p) => ({ ...p, page: 0 }));
    setItemsPageTokens({ 0: null });
  };

  const handleItemsPaginationModelChange = (m: GridPaginationModel) => {
    if (m.pageSize !== itemsPaginationModel.pageSize) {
      setItemsPaginationModel({ page: 0, pageSize: m.pageSize });
      setItemsPageTokens({ 0: null });
      return;
    }
    if (m.page > itemsPaginationModel.page && !itemsHasNextPage) return;

    const token = itemsPageTokens[m.page];
    if (m.page > 0 && token === undefined) return;

    setItemsPaginationModel(m);
  };

  const reloadMembers = async () => {
    await loadMembersDetailed(() => true);
  };

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

  const itemRowCount = itemsHasNextPage
    ? -1
    : itemsPaginationModel.page * itemsPaginationModel.pageSize +
      itemsRows.length;

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

  const offersRowCount = offersHasNextPage
    ? -1
    : offersPaginationModel.page * offersPaginationModel.pageSize +
      offersRows.length;

  const membersColumns = useMemo<GridColDef<MemberRow>[]>(
    () => [
      { field: "fullName", headerName: "Employee", flex: 1, minWidth: 200 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 240 },
      { field: "role", headerName: "Role", width: 140 },
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
                onClick={() =>
                  navigate(
                    `/app/bookings?officeId=${encodeURIComponent(officeId)}`,
                  )
                }
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
                  if (!office) return;

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
              lng={office?.coordinates?.lon ?? 21.0122}
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
          loading={itemsLoading}
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          sortModel={itemsSortModel}
          onSortModelChange={handleItemsSortModelChange}
          filterModel={itemsFilterModel}
          onFilterModelChange={handleItemsFilterModelChange}
          paginationModel={itemsPaginationModel}
          onPaginationModelChange={handleItemsPaginationModelChange}
          rowCount={itemRowCount}
          paginationMeta={{ hasNextPage: itemsHasNextPage }}
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
          loading={offersLoading}
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          sortModel={offersSortModel}
          onSortModelChange={handleOffersSortModelChange}
          filterModel={offersFilterModel}
          onFilterModelChange={handleOffersFilterModelChange}
          paginationModel={offersPaginationModel}
          onPaginationModelChange={handleOffersPaginationModelChange}
          rowCount={offersRowCount}
          paginationMeta={{ hasNextPage: offersHasNextPage }}
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
        <Paper variant="card">
          <DataGrid
            rows={membersRows}
            columns={membersColumns}
            disableRowSelectionOnClick
            loading={loading}
            showToolbar
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
              },
            }}
            disableColumnFilter
            autoHeight
            hideFooterPagination
          />
        </Paper>
      </Paper>

      {/* Add Employee Dialog */}
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
                if (!email) return;

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
              if (!email) return;

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
