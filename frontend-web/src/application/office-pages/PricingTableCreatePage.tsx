import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

type CurrencyUnit = "PLN" | "USD" | "EUR";

type PricingTableFormValues = {
  name: string;
  pricePerDay: number;
  unit: CurrencyUnit;
  freeCancelHours: number;
  timeForPaymentHours: number;
};

const schema: yup.ObjectSchema<PricingTableFormValues> = yup
  .object({
    name: yup.string().trim().required("Name is required"),
    pricePerDay: yup
      .number()
      .typeError("Price per day must be a number")
      .required("Price per day is required")
      .moreThan(0, "Price per day must be greater than 0"),
    unit: yup
      .mixed<CurrencyUnit>()
      .oneOf(["PLN", "USD", "EUR"], "Choose a currency")
      .required("Currency is required"),
    freeCancelHours: yup
      .number()
      .typeError("Free cancellation time must be a number")
      .required("Free cancellation time is required")
      .min(0, "Must be 0 or more"),
    timeForPaymentHours: yup
      .number()
      .typeError("Time for payment must be a number")
      .required("Time for payment is required")
      .min(0, "Must be 0 or more"),
  })
  .required();

export const PricingTableCreatePage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PricingTableFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      pricePerDay: 0,
      unit: "PLN",
      freeCancelHours: 0,
      timeForPaymentHours: 0,
    },
  });

  if (!officeId) return null;

  const inputBgSx = {
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#fff" },
    "&.Mui-focused": { bgcolor: "#fff" },
  } as const;

  const onSubmit = (data: PricingTableFormValues) => {
    console.log({
      ...data,
      timeForPaymentBasis: "afterReservation",
    });

    // demo id for now
    const pricingTableId = "1";
    navigate(`../pricing-table/${pricingTableId}`);
  };

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography
        component="h1"
        sx={{
          m: 0,
          fontSize: "22px",
          fontWeight: 600,
          color: "#111",
          mb: "12px",
        }}
      >
        Create pricing table
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <OutlinedInput {...field} id="name" sx={inputBgSx} />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 120px",
            gap: "10px",
          }}
        >
          <Controller
            name="pricePerDay"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" error={!!errors.pricePerDay}>
                <FormLabel htmlFor="pricePerDay">Price per day</FormLabel>
                <OutlinedInput
                  id="pricePerDay"
                  type="number"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  sx={inputBgSx}
                />
                <FormHelperText>{errors.pricePerDay?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" error={!!errors.unit}>
                <FormLabel htmlFor="unit">Unit</FormLabel>
                <Select {...field} id="unit" sx={inputBgSx} displayEmpty>
                  <MenuItem value="PLN">PLN</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
                <FormHelperText>{errors.unit?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Box>

        <Controller
          name="freeCancelHours"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.freeCancelHours}>
              <FormLabel htmlFor="freeCancelHours">
                Time for free cancellation (hours)
              </FormLabel>
              <Typography
                variant="caption"
                sx={{ display: "block", mt: "2px" }}
              >
                The user has the number of hours written here before the
                reservation starts to cancel it and receive a full refund.
              </Typography>
              <OutlinedInput
                id="freeCancelHours"
                type="number"
                value={Number.isFinite(field.value) ? field.value : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                sx={inputBgSx}
              />
              <FormHelperText>{errors.freeCancelHours?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="timeForPaymentHours"
          control={control}
          render={({ field }) => (
            <FormControl
              variant="outlined"
              error={!!errors.timeForPaymentHours}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <FormLabel>Time for payment (hours)</FormLabel>
                <Typography variant="caption" sx={{ display: "block" }}>
                  After this time passes and the user still hasn&apos;t
                  submitted payment, the reservation is automatically cancelled.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px",
                    gap: "10px",
                  }}
                >
                  <OutlinedInput
                    id="timeForPaymentHours"
                    type="number"
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    sx={inputBgSx}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: "8px",
                      color: "text.secondary",
                    }}
                  >
                    after reservation is made
                  </Box>
                </Box>
              </Box>
              <FormHelperText>
                {errors.timeForPaymentHours?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
          >
            Save
          </Button>

          <Button
            type="button"
            variant="text"
            color="error"
            startIcon={<CancelIcon fontSize="small" />}
            onClick={() => navigate("..")}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
