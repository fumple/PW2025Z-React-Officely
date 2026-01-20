import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

export const PasswordChangePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as boolean | null) ?? null;

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !repeat) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== repeat) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    // TODO (backend): call authApi.resetPassword({ token, password })
    navigate("/password-change/success", { replace: true });
  };

  if (!state) {
    return (
      <Box
        sx={{
          width: "240px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "8px",
        }}
      >
        <Typography component="p" variant="subtitle1">
          Invalid link
        </Typography>

        <Typography component="p" variant="body2">
          This password reset link is available only after correct code
          submission.
        </Typography>

        <Button variant="contained" fullWidth onClick={() => navigate("/")}>
          Return to main page
        </Button>
      </Box>
    );
  }

  const mismatch = repeat.length > 0 && password !== repeat;
  const showError = Boolean(error) || mismatch;
  const helperText = error ?? (mismatch ? "Passwords do not match." : "");

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
      <Typography component="p" variant="subtitle1">
        Change your password
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <FormControl variant="outlined" error={showError}>
          <FormLabel htmlFor="newPassword">New password</FormLabel>
          <OutlinedInput
            id="newPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormControl>

        <FormControl variant="outlined" error={showError}>
          <FormLabel htmlFor="repeatPassword">Repeat password</FormLabel>
          <OutlinedInput
            id="repeatPassword"
            type="password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            autoComplete="new-password"
          />
          {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
        </FormControl>

        <Button variant="contained" fullWidth type="submit">
          Save
        </Button>
      </Box>
    </Box>
  );
};
