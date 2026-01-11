import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import { COUNTRY_OPTIONS } from "../shared/countries";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router";

type SignupValues = {
  email: string;
  name: string;
  surname: string;
  nationality: string;
  dateOfBirth: string;
  phoneNumber: string;
  password: string;
  repeatPassword: string;
};

const schema: yup.ObjectSchema<SignupValues> = yup
  .object({
    email: yup
      .string()
      .trim()
      .email("Invalid email")
      .required("email is required"),
    name: yup.string().trim().required("first name is required"),
    surname: yup.string().trim().required("last name is required"),
    nationality: yup.string().trim().required("nationality is required"),
    dateOfBirth: yup.string().trim().required("date of birth is required"),
    phoneNumber: yup.string().trim().required("phone number is required"),
    password: yup
      .string()
      .required("password is required")
      .min(8, "password must be at least 8 characters")
      .matches(/[a-z]/, "password must include a lowercase letter")
      .matches(/[A-Z]/, "password must include an uppercase letter")
      .matches(/[0-9]/, "password must include a number")
      .matches(/[!@#$%^&*]/, "password must include one of: ! @ # $ % ^ & *"),
    repeatPassword: yup
      .string()
      .required("repeat password is required")
      .oneOf([yup.ref("password")], "passwords do not match"),
  })
  .required();

export const SignupPage = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data: SignupValues) => {
    console.log(data);
    navigate("/app");
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
        Welcome! Create an account
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.name}>
              <FormLabel htmlFor="name" sx={{ mt: "2px" }}>
                First Name
              </FormLabel>
              <OutlinedInput {...field} id="name" type="text" />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="surname"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.surname}>
              <FormLabel htmlFor="surname" sx={{ mt: "2px" }}>
                Last Name
              </FormLabel>
              <OutlinedInput {...field} id="surname" type="text" />
              <FormHelperText>{errors.surname?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.email}>
              <FormLabel htmlFor="email" sx={{ mt: "2px" }}>
                Email
              </FormLabel>
              <OutlinedInput {...field} id="email" type="email" />
              <FormHelperText>{errors.email?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.phoneNumber}>
              <FormLabel htmlFor="phoneNumber" sx={{ mt: "2px" }}>
                Phone number
              </FormLabel>
              <OutlinedInput {...field} id="phoneNumber" type="tel" />
              <FormHelperText>{errors.phoneNumber?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.dateOfBirth}>
              <FormLabel htmlFor="dateOfBirth" sx={{ mt: "2px" }}>
                Date of birth
              </FormLabel>
              <OutlinedInput {...field} id="dateOfBirth" type="date" />
              <FormHelperText>{errors.dateOfBirth?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="nationality" // you can rename this to "country"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl>
              <FormLabel htmlFor="nationality" sx={{ mt: "2px" }}>
                Nationality
              </FormLabel>
              <Autocomplete
                options={COUNTRY_OPTIONS}
                value={
                  COUNTRY_OPTIONS.find((o) => o.code === field.value) ?? null
                }
                onChange={(_, v) => field.onChange(v?.code ?? "")}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(a, b) => a.code === b.code}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ "& .MuiInputBase-root": { bgcolor: "#fff" } }}
                  />
                )}
              />
            </FormControl>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.password}>
              <FormLabel htmlFor="password" sx={{ mt: "2px" }}>
                Password
              </FormLabel>
              <OutlinedInput {...field} id="password" type="password" />
              <FormHelperText>{errors.password?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="repeatPassword"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.repeatPassword}>
              <FormLabel htmlFor="repeatPassword" sx={{ mt: "2px" }}>
                Repeat password
              </FormLabel>
              <OutlinedInput {...field} id="repeatPassword" type="password" />
              <FormHelperText>{errors.repeatPassword?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Button variant="contained" type="submit" fullWidth>
          Sign up
        </Button>
      </Box>
    </Box>
  );
};
