import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import * as usersApi from "../../../api/usersApi";

export const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [user, setUser] = useState<usersApi.UserResource | null>(null);

  const [openBlock, setOpenBlock] = useState(false);
  const [openInvalidate, setOpenInvalidate] = useState(false);

  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUser = async () => {
    if (!userId) return;
    setLoading(true);
    setApiError(null);

    const res = await usersApi.getUser(userId);
    if (!res.ok) {
      setApiError(res.error?.errors?.[0]?.message ?? "Failed to load user.");
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(res.data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadUser();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  if (!userId) return null;

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "-";

  const blockLabel = user?.blocked
    ? "Unblock (allow new reservations)"
    : "Block from making new reservations";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 920 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          User #{userId}: {loading ? "Loading..." : fullName}
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
              Loading user...
            </Typography>
          </Box>
        ) : user ? (
          <>
            <Box
              sx={{
                mt: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Email:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.email}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                First name:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.firstName}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Last name:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.lastName}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Nationality:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.nationality || "-"}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Date of birth:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.dateOfBirth || "-"}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Phone number:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.phoneNumber || "-"}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Type:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.type}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Admin:{" "}
                <Box component="span" sx={{ color: "text.primary" }}>
                  {user.admin ? "Yes" : "No"}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                Blocked:{" "}
                <Box
                  component="span"
                  sx={{ color: user.blocked ? "error.main" : "text.primary" }}
                >
                  {user.blocked ? "Yes" : "No"}
                </Box>
              </Typography>
            </Box>

            {actionError ? (
              <Typography color="error" sx={{ mt: "10px" }}>
                {actionError}
              </Typography>
            ) : null}

            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "12px" }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/app/bookings")}
              >
                View bookings
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<WarningAmberIcon fontSize="small" />}
                sx={{ textTransform: "none" }}
                disabled={acting}
                onClick={() => setOpenBlock(true)}
              >
                {blockLabel}
              </Button>
            </Box>

            {/* Dialog: block/unblock */}
            <Dialog
              open={openBlock}
              onClose={() => {
                if (acting) return;
                setOpenBlock(false);
              }}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {user.blocked ? "Unblock user" : "Block user"}
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                  {user.blocked
                    ? "Are you sure you want to unblock this user?"
                    : "Are you sure you want to block this user from making new reservations?"}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: "16px", pb: "12px" }}>
                <Button
                  variant="contained"
                  disabled={acting}
                  onClick={async () => {
                    if (!user) return;

                    setActing(true);
                    setActionError(null);

                    const res = await usersApi.setUserBlocked({
                      userId: user.id,
                      blocked: !user.blocked,
                    });

                    if (!res.ok) {
                      setActionError(
                        res.error?.errors?.[0]?.message ??
                          "Failed to update blocked status.",
                      );
                      setActing(false);
                      return;
                    }

                    setOpenBlock(false);
                    await loadUser();
                    setActing(false);
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant="text"
                  color="error"
                  disabled={acting}
                  onClick={() => setOpenBlock(false)}
                >
                  No
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog: invalidate sessions (API not present in YAML — informational) */}
            <Dialog
              open={openInvalidate}
              onClose={() => setOpenInvalidate(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Invalidate user&apos;s sessions</DialogTitle>
              <DialogContent>
                <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                  This action is currently not supported by the API
                  specification.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: "16px", pb: "12px" }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenInvalidate(false)}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : null}
      </Box>
    </Box>
  );
};
