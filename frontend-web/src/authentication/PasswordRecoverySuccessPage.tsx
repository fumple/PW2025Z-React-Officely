import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";

export const PasswordRecoverySuccessPage = () => {
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
      <Typography component="p" variant="subtitle1">
        Email sent!
      </Typography>
      <Typography component="p" variant="body2">
        If the provided email <br />
        was valid, a recovery link
        <br /> was sent.
        <br />
        <br />
        Check your email for
        <br /> the recovery link!
      </Typography>

      <Button variant="contained" onClick={() => navigate("..")}>
        Return to login page
      </Button>
    </Box>
  );
};
