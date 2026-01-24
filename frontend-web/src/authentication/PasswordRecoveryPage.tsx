import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import * as authApi from "../api/authApi";
import { useState } from "react";

type FormValues = {
  email: string;
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    email: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Please enter a valid email"),
  })
  .required();

export const PasswordRecoveryPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async ({ email }: FormValues) => {
    setApiError(null);
    const res = await authApi.resetPasswordEmail(email);

    if (res.ok) {
      navigate("/password-recovery/success", { state: { email } });
      return;
    }

    const msg =
      res.error?.errors?.[0]?.message ??
      (res.status === 429
        ? "Too many attempts. Try again later."
        : "Could not send recovery email.");

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
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
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

        {apiError ? (
          <FormHelperText error sx={{ mt: "4px" }}>
            {apiError}
          </FormHelperText>
        ) : null}

        <Button variant="contained" fullWidth type="submit">
          Send Recovery Link
        </Button>
      </Box>
    </Box>
  );
};
