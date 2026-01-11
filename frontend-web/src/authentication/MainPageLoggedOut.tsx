import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const MainPageLoggedOut = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
      }}
    >
      <Typography component="p" variant="subtitle1">
        This website is for administrators only.
      </Typography>

      <Typography component="p" variant="body2">
        Log in to access the website or <br />
        Sign up to create an account
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => navigate("/login")}
        >
          Log in
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => navigate("/signup")}
        >
          Sign up
        </Button>
      </Box>
    </Box>
  );
};
