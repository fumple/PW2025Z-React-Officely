import { useState } from "react";
import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export const UserDetailsPage = () => {
  const [openBlock, setOpenBlock] = useState(false);
  const [openInvalidate, setOpenInvalidate] = useState(false);

  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();
  if (!userId) return null;

  const firstName = "Bob";
  const lastName = "React";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          User #{userId}: {firstName} {lastName}
        </Typography>

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
            Email:
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", color: "text.secondary" }}
          >
            First Name: {firstName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", color: "text.secondary" }}
          >
            Last Name: {lastName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", color: "text.secondary" }}
          >
            Nationality:
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", color: "text.secondary" }}
          >
            Date of Birth:
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", color: "text.secondary" }}
          >
            Phone number:
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "12px" }}>
          <Button variant="contained" onClick={() => navigate("/app/bookings")}>
            View past bookings
          </Button>

          <Button variant="contained" onClick={() => navigate("/app/bookings")}>
            View active bookings
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenBlock(true)}
          >
            Block from making new reservations
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenInvalidate(true)}
          >
            Invalidate all sessions and require password change
          </Button>
        </Box>
      </Box>

      {/* Dialog: block user */}
      <Dialog
        open={openBlock}
        onClose={() => setOpenBlock(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Block from making new reservations</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure that you want to block this user from making new
            reservations?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpenBlock(false);
              alert("blocked");
            }}
          >
            Yes
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => setOpenBlock(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: invalidate sessions */}
      <Dialog
        open={openInvalidate}
        onClose={() => setOpenInvalidate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invalidate user&apos;s sessions</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure that you want to invalidate all of this user&apos;s
            sessions and require password change upon next login?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpenInvalidate(false);
              alert("invalidated");
            }}
          >
            Yes
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={() => setOpenInvalidate(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
