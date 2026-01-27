import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import * as authApi from "../api/authApi";

type LocationState = { email?: string; code?: string } | null;

type FormValues = {
  newPassword: string;
  repeatPassword: string;
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    newPassword: yup
      .string()
      .required("New password is required")
      .min(8, "password must be at least 8 characters")
      .matches(/[a-z]/, "password must include a lowercase letter")
      .matches(/[A-Z]/, "password must include an uppercase letter")
      .matches(/[0-9]/, "password must include a number")
      .matches(/[!@#$%^&*]/, "password must include one of: ! @ # $ % ^ & *"),
    repeatPassword: yup
      .string()
      .required("Please repeat your password")
      .oneOf([yup.ref("newPassword")], "Passwords do not match."),
  })
  .required();

export const PasswordChangePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);

  const state = (location.state as LocationState) ?? null;
  const email = state?.email;
  const code = state?.code;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { newPassword: "", repeatPassword: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!email || !code) {
      navigate("/password-recovery", { replace: true });
    }
  }, [email, code, navigate]);

  if (!email || !code) {
    return null;
  }

  const onSubmit = async ({ newPassword }: FormValues) => {
    setApiError(null);
    const res = await authApi.resetPassword({ email, code, newPassword });

    if (res.ok) {
      navigate("/password-change/success", { replace: true });
      return;
    }

    const msg =
      res.error?.errors?.[0]?.message ??
      (res.status === 400
        ? "Password reset failed. Check the recovery code and try again."
        : "Password reset failed.");

    setApiError(msg);
  };

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
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.newPassword}>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <OutlinedInput
                {...field}
                id="newPassword"
                type="password"
                autoComplete="new-password"
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.newPassword?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="repeatPassword"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.repeatPassword}>
              <FormLabel htmlFor="repeatPassword">Repeat password</FormLabel>
              <OutlinedInput
                {...field}
                id="repeatPassword"
                type="password"
                autoComplete="new-password"
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.repeatPassword?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {apiError ? (
          <FormHelperText error sx={{ mt: "4px" }}>
            {apiError}
          </FormHelperText>
        ) : null}

        <Button variant="contained" fullWidth type="submit">
          Save
        </Button>
      </Box>
    </Box>
  );
};
