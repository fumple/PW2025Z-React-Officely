import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";

export const PasswordRecoveryPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: "240px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        textAlign: "left",
        gap: "8px",
      }}
    >
      <Typography
        variant="subtitle1"
        component="p"
        sx={{ alignSelf: "center" }}
      >
        Forgot your password?
      </Typography>
      <Typography variant="body2" component="p" sx={{ alignSelf: "center" }}>
        Enter your email and we'll <br />
        send you a recovery link!
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/password-recovery/success");
        }}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <FormControl variant="outlined">
          <FormLabel htmlFor="email">Email</FormLabel>
          <OutlinedInput
            id="email"
            type="email"
            autoComplete="email"
            required
          />
        </FormControl>

        <Button variant="contained" fullWidth type="submit">
          Send Recovery Link
        </Button>
      </Box>
    </Box>
  );
};
