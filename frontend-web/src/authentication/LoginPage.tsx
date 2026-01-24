import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import * as authApi from "../api/authApi";
import { getToken } from "../api/http";

type FormValues = {
  email: string;
  password: string;
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    email: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Please enter a valid email"),
    password: yup.string().required("Password is required"),
  })
  .required();

export const LoginPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) navigate("/app", { replace: true });
  }, [navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async ({ email, password }: FormValues) => {
    setApiError(null);
    const res = await authApi.login({ type: "admin", email, password });
    if (res.ok) {
      navigate("/app");
      return;
    }

    const msg =
      res.error?.errors?.[0]?.message ??
      (res.status === 400 ? "Invalid email and/or password." : "Login failed.");

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
      <Typography
        component="p"
        variant="subtitle1"
        sx={{ alignSelf: "center" }}
      >
        Welcome back!
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.email}>
              <FormLabel htmlFor="email" sx={{ mt: "6px" }}>
                Email
              </FormLabel>
              <OutlinedInput
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.email?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.password}>
              <FormLabel htmlFor="password" sx={{ mt: "6px" }}>
                Password
              </FormLabel>
              <OutlinedInput
                {...field}
                id="password"
                type="password"
                autoComplete="current-password"
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.password?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {apiError ? (
          <FormHelperText sx={{ margin: "4px 0 2px 0" }} error>
            {apiError}
          </FormHelperText>
        ) : null}

        <Button variant="contained" type="submit" fullWidth>
          Log in
        </Button>
      </Box>

      <Link component={RouterLink} to="/password-recovery" underline="hover">
        Forgot your password?
      </Link>
    </Box>
  );
};
