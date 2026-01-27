import { useState } from "react";
import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export const EmployeeDetailsPage = () => {
  const [openBlock, setOpenBlock] = useState(false);

  const navigate = useNavigate();

  const { employeeId } = useParams<{ employeeId: string }>();
  if (!employeeId) return null;

  const firstName = "Bob";
  const lastName = "React";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          Employee #{employeeId}: {firstName} {lastName}
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
          <Button
            variant="text"
            color="error"
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenBlock(true)}
          >
            Remove Access
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
        <DialogTitle>Remove employee access</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure that you want to remove this employees access?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setOpenBlock(false);
              alert("blocked");
              navigate("..");
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
    </Box>
  );
};
