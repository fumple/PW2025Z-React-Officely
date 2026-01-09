import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";

export const PasswordChangeSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "240px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        textAlign: "center",
        gap: "8px",
      }}
    >
      <Typography variant="subtitle1">Success!</Typography>
      <Typography variant="body2">
        Your new password was saved <br />
        and you may now log in using <br />
        the new password.
      </Typography>

      <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
        Return to login page
      </Button>
    </Box>
  );
};
