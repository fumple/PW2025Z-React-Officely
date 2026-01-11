import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  id: string;
  name: string;
  user: string;
  date: string;
};

const allItems: ItemRow[] = Array.from({ length: 60 }).map((_, i) => ({
  id: String(i + 1),
  name: "Text line",
  user: "Text line",
  date: "Text line",
}));

function getRowsPerPageOptions(totalCount: number): number[] {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? [...filtered] : [totalCount];
}

export const BookingDetailsPage = () => {
  const [openCancelNoRefund, setOpenCancelNoRefund] = useState(false);
  const [openCancelWithRefund, setOpenCancelWithRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const navigate = useNavigate();

  const officeId = "7";
  const officeName = "Lorem Ipsum Office";
  const deskId = "A131";
  const pricingTableCategory = "Standard";
  const userId = "19";
  const userEmail = "bob.react@example.com";

  const rows = allItems;
  const pageSizeOptions = getRowsPerPageOptions(rows.length);

  const columns = useMemo<GridColDef<ItemRow>[]>(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
      { field: "user", headerName: "User", flex: 1, minWidth: 180 },
      { field: "date", headerName: "Date", flex: 1, minWidth: 160 },
    ],
    [],
  );

  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) return null;

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 920 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          Booking #{bookingId}
        </Typography>

        {/* Meta block */}
        <Box
          sx={{
            mt: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Office:
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate(`/app/offices/${officeId}`)}
              sx={{ py: 0 }}
            >
              {officeName}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Desk:{" "}
            <Box component="span" sx={{ color: "text.primary" }}>
              {deskId}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Pricing table:{" "}
            <Box component="span" sx={{ color: "text.primary" }}>
              {pricingTableCategory}
            </Box>
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              User:
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate(`/app/users/${userId}`)}
              sx={{ py: 0 }}
            >
              {userEmail}
            </Button>
          </Box>

          <Box
            sx={{
              mt: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Status: Future
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Starts:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Ends:
            </Typography>

            <Typography variant="body2" sx={{ fontSize: "13px", mt: "6px" }}>
              Price due:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Payment method: Bank transfer
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Payment status: Due (Awaiting bank transfer confirmation from
              staff)
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
          <Button
            variant="contained"
            startIcon={<CheckIcon fontSize="small" />}
            onClick={() => alert("mark as paid")}
          >
            Mark as paid
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenCancelNoRefund(true)}
          >
            Cancel as not paid
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenCancelWithRefund(true)}
          >
            Cancel with refund
          </Button>
        </Box>

        {/* History label */}
        <Typography variant="subtitle2" sx={{ mt: "16px", mb: "8px" }}>
          Change history:
        </Typography>

        {/* History table (official style) */}
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
          />
        </Paper>
      </Box>

      {/* Dialog: cancel no refund */}
      <Dialog
        open={openCancelNoRefund}
        onClose={() => setOpenCancelNoRefund(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel reservation as not paid</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure that you want to cancel this reservation?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpenCancelNoRefund(false);
              alert("cancelled (no refund)");
            }}
          >
            Yes
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => setOpenCancelNoRefund(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: cancel with refund */}
      <Dialog
        open={openCancelWithRefund}
        onClose={() => setOpenCancelWithRefund(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel reservation</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure that you want to cancel this reservation? This user
            will be given a full refund.
          </Typography>

          <Box>
            <Typography
              sx={{ fontSize: "12px", color: "text.secondary", mb: "4px" }}
            >
              Reason for cancellation
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              minRows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpenCancelWithRefund(false);
              alert(`cancelled (refund) reason=${refundReason}`);
            }}
          >
            Yes
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => setOpenCancelWithRefund(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
