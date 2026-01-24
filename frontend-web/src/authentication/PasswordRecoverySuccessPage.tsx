import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useLocation, useNavigate } from "react-router";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import * as apiAuth from "../api/authApi";

type FormValues = {
  code: string;
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    code: yup
      .string()
      .trim()
      .required("The code is required to proceed")
      .matches(
        /^[A-Za-z0-9]{6}$/,
        "Code must be 6 characters (letters and digits)",
      ),
  })
  .required();

export const PasswordRecoverySuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const [apiError, setApiError] = useState<string | null>(null);

  const email = state?.email;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!email) navigate("/password-recovery", { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const onSubmit = async ({ code }: FormValues) => {
    setApiError(null);
    const res = await apiAuth.checkResetCode({ email, code });
    console.log("checkResetCode payload:", { email, code });
    console.log("checkResetCode res:", res);
    if (res.ok) {
      if (res.data?.valid === true) {
        navigate("/password-change", { state: { email, code } });
        return;
      }
      setError("code", { type: "server", message: "Invalid code." });
      return;
    }
    if (res.status === 429) {
      setApiError("Too many requests. Please try again later.");
      return;
    }

    const first = res.error?.errors?.[0];
    if (first?.field === "code") {
      setError("code", {
        type: "server",
        message: first.message ?? "Invalid code.",
      });
      return;
    }

    setApiError(
      first?.message ?? "Could not verify the code. Please try again.",
    );
  };

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
        was valid, a recovery code was sent. <br /> <br />
        Check your email for the recovery code and type it in below.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "8px",
        }}
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.code}>
              <FormLabel htmlFor="code" sx={{ mt: "2px", textAlign: "left" }}>
                Recovery code
              </FormLabel>
              <OutlinedInput
                {...field}
                id="code"
                type="text"
                autoComplete="one-time-code"
                inputProps={{ autoCapitalize: "characters" }}
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.code?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {apiError ? (
          <FormHelperText error sx={{ margin: "4px 0 2px 0" }}>
            {apiError}
          </FormHelperText>
        ) : null}

        <Button variant="contained" type="submit" fullWidth>
          Submit
        </Button>
      </Box>
    </Box>
  );
};
