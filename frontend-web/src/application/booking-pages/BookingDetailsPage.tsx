import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import * as bookingsApi from "../../api/bookingsApi";
import * as officesApi from "../../api/officesApi";
import * as usersApi from "../../api/usersApi";

function formatPaymentStatus(
  s?: NonNullable<bookingsApi.BookingResource["paymentInfo"]>["status"],
) {
  if (!s) return "-";
  switch (s) {
    case "pendingPayment":
      return "Due";
    case "received":
      return "Paid";
    case "pendingRefund":
      return "Pending refund";
    case "refunded":
      return "Refunded";
    case "cancelled":
      return "Cancelled";
    default:
      return String(s);
  }
}

export const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [booking, setBooking] = useState<bookingsApi.BookingResource | null>(
    null,
  );
  const [officeName, setOfficeName] = useState<string>("-");
  const [itemLabel, setItemLabel] = useState<string>("-");
  const [offerName, setOfferName] = useState<string>("-");
  const [userLabel, setUserLabel] = useState<string>("-");

  const [openCancelNoRefund, setOpenCancelNoRefund] = useState(false);
  const [openCancelWithRefund, setOpenCancelWithRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isPaid = booking?.paymentInfo?.status === "received";
  const canMarkPaid = !!booking?._links?.markPaid;
  const canMarkRefunded = !!booking?._links?.markRefunded;

  const paymentStatus = booking?.paymentInfo?.status;

  const isRefundingOrRefunded =
    paymentStatus === "pendingRefund" || paymentStatus === "refunded";

  const bookingStatus = booking?.status;

  const isCancelled =
    bookingStatus === "cancelledByStaff" || bookingStatus === "cancelledByUser";

  const loadAll = async () => {
    if (!bookingId) return;
    setLoading(true);
    setApiError(null);

    const bRes = await bookingsApi.getBooking(bookingId);

    if (!bRes.ok) {
      setApiError(
        bRes.error?.errors?.[0]?.message ?? "Failed to load booking.",
      );
      setBooking(null);
      setLoading(false);
      return;
    }

    const b = bRes.data;
    setBooking(b);

    // Enrich related labels in parallel (best-effort)
    const [officeRes, itemRes, offerRes, userRes] = await Promise.allSettled([
      officesApi.getOffice(b.officeId),
      officesApi.getOfficeItem({ officeId: b.officeId, itemId: b.itemId }),
      officesApi.getOfficeOffer({ officeId: b.officeId, offerId: b.offerId }),
      usersApi.getUser(b.userId),
    ]);

    // Office
    if (officeRes.status === "fulfilled" && officeRes.value.ok) {
      setOfficeName(officeRes.value.data.name);
    } else {
      setOfficeName(`Office ${b.officeId}`);
    }

    // Item label (name + floor/room if present)
    if (itemRes.status === "fulfilled" && itemRes.value.ok) {
      const it = itemRes.value.data;
      const fr = [it.floor, it.room].filter(Boolean).join(" / ");
      setItemLabel(fr ? `${it.name} (${fr})` : it.name);
    } else {
      setItemLabel(`Item ${b.itemId}`);
    }

    // Offer
    if (offerRes.status === "fulfilled" && offerRes.value.ok) {
      setOfferName(offerRes.value.data.name);
    } else {
      setOfferName(`Offer ${b.offerId}`);
    }

    // User label
    if (userRes.status === "fulfilled" && userRes.value.ok) {
      const u = userRes.value.data;
      const full = `${u.firstName} ${u.lastName}`.trim();
      setUserLabel(`${full} (${u.email})`);
    } else {
      setUserLabel(`User ${b.userId}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadAll();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 920 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          Booking #{bookingId}
        </Typography>

        {apiError ? (
          <Typography color="error" sx={{ mt: "10px" }}>
            {apiError}
          </Typography>
        ) : null}

        {loading ? (
          <Box
            sx={{ mt: "12px", display: "flex", alignItems: "center", gap: 1 }}
          >
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              Loading booking...
            </Typography>
          </Box>
        ) : booking ? (
          <>
            {/* Meta block */}
            <Box
              sx={{
                mt: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
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
                  sx={{ py: 0 }}
                  onClick={() => navigate(`/app/offices/${booking.officeId}`)}
                >
                  {officeName}
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Item:
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  sx={{ py: 0 }}
                  onClick={() =>
                    navigate(
                      `/app/offices/${booking.officeId}/item/${booking.itemId}`,
                    )
                  }
                >
                  {itemLabel}
                </Button>
              </Box>

              {/* Offer */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Offer:
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  sx={{ py: 0 }}
                  onClick={() =>
                    navigate(
                      `/app/offices/${booking.officeId}/offer/${booking.offerId}`,
                    )
                  }
                >
                  {offerName}
                </Button>
              </Box>

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
                  sx={{ py: 0 }}
                  onClick={() => navigate(`/app/users/${booking.userId}`)}
                >
                  {userLabel}
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
                  Booking status:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {booking.status}
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Created:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {booking.creationDate}
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Starts:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {booking.startDate}
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Ends:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {booking.endDate}
                  </Box>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ fontSize: "13px", mt: "6px" }}
                >
                  Total price:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {booking.totalPrice}
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Payment status:{" "}
                  <Box component="span" sx={{ color: "text.primary" }}>
                    {formatPaymentStatus(booking.paymentInfo?.status)}
                  </Box>
                </Typography>

                {booking.paymentInfo ? (
                  <Box
                    sx={{
                      mt: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      Transfer title:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {booking.paymentInfo.transferTitle}
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      Receiver:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {booking.paymentInfo.receiverName}
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      Account:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {booking.paymentInfo.accountNumber}
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      Due date:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {booking.paymentInfo.dueDate}
                      </Box>
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </Box>

            {/* Action error */}
            {actionError ? (
              <Typography color="error" sx={{ mt: "10px" }}>
                {actionError}
              </Typography>
            ) : null}

            {/* Actions */}
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "12px" }}
            >
              <Button
                variant="contained"
                startIcon={<CheckIcon fontSize="small" />}
                disabled={acting || !canMarkPaid}
                onClick={async () => {
                  setActing(true);
                  setActionError(null);

                  const res = await bookingsApi.markBookingPaid(bookingId);
                  if (!res.ok) {
                    setActionError(
                      res.error?.errors?.[0]?.message ??
                        "Failed to mark booking as paid.",
                    );
                    setActing(false);
                    return;
                  }

                  await loadAll();
                  setActing(false);
                }}
              >
                Mark as paid
              </Button>

              {canMarkRefunded ? (
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon fontSize="small" />}
                  disabled={acting}
                  onClick={async () => {
                    setActing(true);
                    setActionError(null);

                    const res =
                      await bookingsApi.markBookingRefunded(bookingId);
                    if (!res.ok) {
                      setActionError(
                        res.error?.errors?.[0]?.message ??
                          "Failed to mark booking as refunded.",
                      );
                      setActing(false);
                      return;
                    }

                    await loadAll();
                    setActing(false);
                  }}
                >
                  Mark refunded
                </Button>
              ) : null}

              <Button
                variant="text"
                color="error"
                startIcon={<WarningAmberIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
                disabled={
                  acting || isRefundingOrRefunded || isCancelled || isPaid
                }
                onClick={() => {
                  if (isRefundingOrRefunded || isCancelled) return;
                  setOpenCancelNoRefund(true);
                }}
              >
                Cancel as not paid
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<WarningAmberIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
                disabled={acting || !isPaid || isCancelled}
                onClick={() => {
                  setRefundReason("");
                  setOpenCancelWithRefund(true);
                }}
              >
                Cancel with refund
              </Button>
            </Box>
            {!isPaid ? (
              <Typography
                sx={{ fontSize: "12px", color: "text.secondary", mt: "6px" }}
              >
                Refund cancellation is available only after the booking is
                marked as paid.
              </Typography>
            ) : null}

            {/* Dialog: cancel no refund */}
            <Dialog
              open={openCancelNoRefund}
              onClose={() => {
                if (acting) return;
                setOpenCancelNoRefund(false);
              }}
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
                  disabled={acting}
                  onClick={async () => {
                    setActing(true);
                    setActionError(null);

                    const res = await bookingsApi.cancelBooking({
                      bookingId,
                      withRefund: false,
                      reason: "not paid",
                    });

                    if (!res.ok) {
                      setActionError(
                        res.error?.errors?.[0]?.message ??
                          "Failed to cancel booking.",
                      );
                      setActing(false);
                      return;
                    }

                    setOpenCancelNoRefund(false);
                    await loadAll();
                    setActing(false);
                  }}
                >
                  Yes
                </Button>

                <Button
                  variant="text"
                  color="error"
                  disabled={acting}
                  onClick={() => setOpenCancelNoRefund(false)}
                >
                  No
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog: cancel with refund */}
            <Dialog
              open={openCancelWithRefund}
              onClose={() => {
                if (acting) return;
                setOpenCancelWithRefund(false);
              }}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Cancel reservation</DialogTitle>
              <DialogContent
                sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                  Are you sure that you want to cancel this reservation? This
                  user will be given a full refund.
                </Typography>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "text.secondary",
                      mb: "4px",
                    }}
                  >
                    Reason for cancellation
                  </Typography>
                  <OutlinedInput
                    fullWidth
                    multiline
                    minRows={3}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    disabled={acting}
                  />
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: "16px", pb: "12px" }}>
                <Button
                  variant="contained"
                  disabled={acting || !refundReason.trim()}
                  onClick={async () => {
                    setActing(true);
                    setActionError(null);

                    const res = await bookingsApi.cancelBooking({
                      bookingId,
                      withRefund: true,
                      reason: refundReason.trim(),
                    });

                    if (!res.ok) {
                      setActionError(
                        res.error?.errors?.[0]?.message ??
                          "Failed to cancel booking with refund.",
                      );
                      setActing(false);
                      return;
                    }

                    setOpenCancelWithRefund(false);
                    await loadAll();
                    setActing(false);
                  }}
                >
                  Yes
                </Button>

                <Button
                  variant="text"
                  color="error"
                  disabled={acting}
                  onClick={() => setOpenCancelWithRefund(false)}
                >
                  No
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : null}
      </Box>
    </Box>
  );
};
