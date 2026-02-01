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

import * as officesApi from "../../api/officesApi";

export const EmployeeDetailsPage = () => {
  const [openRemove, setOpenRemove] = useState(false);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [user, setUser] = useState<officesApi.UserResource | null>(null);

  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { officeId, employeeId } = useParams<{
    officeId: string;
    employeeId: string;
  }>();

  useEffect(() => {
    if (!employeeId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const res = await officesApi.getUser(employeeId);

      if (!alive) return;

      if (!res.ok) {
        setApiError(
          res.error?.errors?.[0]?.message ?? "Failed to load employee.",
        );
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(res.data);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [employeeId]);

  if (!employeeId) return null;

  const firstName = user?.firstName ?? "-";
  const lastName = user?.lastName ?? "-";
  const email = user?.email ?? "-";
  const nationality = user?.nationality ?? "-";
  const dateOfBirth = user?.dateOfBirth ?? "-";
  const phoneNumber = user?.phoneNumber ?? "-";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      {apiError ? (
        <Typography color="error" sx={{ mb: "10px" }}>
          {apiError}
        </Typography>
      ) : null}

      <Box>
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          {loading
            ? "Loading..."
            : `Employee #${employeeId}: ${firstName} ${lastName}`}
        </Typography>

        <Box
          sx={{
            mt: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Email: {email}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            First Name: {firstName}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Last Name: {lastName}
          </Typography>

          {/* Not available in your current UserResource → keep placeholders */}
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Nationality: {nationality}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Date of Birth: {dateOfBirth}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Phone number: {phoneNumber}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "12px" }}>
          <Button
            variant="text"
            color="error"
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            disabled={loading || !officeId}
            onClick={() => {
              setRemoveError(null);
              setOpenRemove(true);
            }}
          >
            Remove Access
          </Button>
        </Box>
      </Box>

      {/* Dialog: remove access */}
      <Dialog
        open={openRemove}
        onClose={() => {
          if (removing) return;
          setOpenRemove(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove employee access</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure you want to remove this employee&apos;s access to this
            office?
          </Typography>

          {removeError ? (
            <Typography color="error" sx={{ mt: "10px" }}>
              {removeError}
            </Typography>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            disabled={removing || !officeId}
            onClick={async () => {
              if (!officeId) {
                setRemoveError("Missing officeId in route.");
                return;
              }

              setRemoving(true);
              setRemoveError(null);

              // 1) find membership (memberId) by userId
              const membersRes = await officesApi.listOfficeMembers(officeId);
              if (!membersRes.ok) {
                setRemoveError(
                  membersRes.error?.errors?.[0]?.message ??
                    "Failed to load office members.",
                );
                setRemoving(false);
                return;
              }

              const membership = membersRes.data.results.find(
                (m) => m.userId === employeeId,
              );
              if (!membership) {
                setRemoveError(
                  "This user does not have access (membership not found).",
                );
                setRemoving(false);
                return;
              }

              // 2) delete membership
              const delRes = await officesApi.deleteOfficeMember({
                officeId,
                memberId: membership.id,
              });

              if (!delRes.ok) {
                setRemoveError(
                  delRes.error?.errors?.[0]?.message ??
                    "Failed to remove employee access.",
                );
                setRemoving(false);
                return;
              }

              setOpenRemove(false);
              setRemoving(false);

              navigate("../..", { relative: "path" });
            }}
          >
            {removing ? (
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <CircularProgress size={16} /> Removing...
              </Box>
            ) : (
              "Yes"
            )}
          </Button>

          <Button
            variant="text"
            color="error"
            disabled={removing}
            onClick={() => setOpenRemove(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
