import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

type FormValues = {
  code: string;
};

const correctCode = "123456";

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    code: yup
      .string()
      .trim()
      .required("The code is required to proceed")
      .oneOf([correctCode], "The code is incorrect"),
  })
  .required();

export const PasswordRecoverySuccessPage = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  const onSubmit = () => {
    navigate("/password-change", {
      replace: true,
      state: { allowPasswordChange: true },
    });
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
                inputProps={{ inputMode: "numeric" }}
                sx={{ bgcolor: "#fff" }}
              />
              <FormHelperText>{errors.code?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Button variant="contained" type="submit" fullWidth>
          Submit
        </Button>
      </Box>
    </Box>
  );
};
