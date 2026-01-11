import { useState } from "react";
import { Link as RouterLink } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

export const LoginPage = () => {
  const [hasError, setError] = useState(false);

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
        component="p"
        variant="subtitle1"
        sx={{ alignSelf: "center" }}
      >
        Welcome back!
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <FormControl variant="outlined" error={hasError}>
          <FormLabel htmlFor="email" sx={{ mt: "6px" }}>
            Email
          </FormLabel>
          <OutlinedInput id="email" type="email" />
        </FormControl>

        <FormControl variant="outlined" error={hasError}>
          <FormLabel htmlFor="password" sx={{ mt: "6px" }}>
            Password
          </FormLabel>
          <OutlinedInput id="password" type="password" />
        </FormControl>

        {hasError && (
          <FormHelperText sx={{ margin: "4px 0 2px 0" }}>
            Invalid email and/or password
          </FormHelperText>
        )}

        <Button
          variant="contained"
          type="submit"
          fullWidth
          onClick={() => setError(true)}
        >
          Log in
        </Button>
      </Box>

      <Link component={RouterLink} to="/password-recovery" underline="hover">
        Forgot your password?
      </Link>
    </Box>
  );
};
