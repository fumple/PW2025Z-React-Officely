import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

import * as officesApi from "../../../api/officesApi";

type OfferFormValues = {
  name: string;
  publicName: string;
  pricePerDay: number;
  freeCancellationHours: number;
  paymentHours: number;

  // UI state for filters:
  flagSelections: Record<string, string[]>; // key = `${sectionKey}__${elementKey}` -> ["desk", ...]
  intSelections: Record<string, number | null>; // key = `${sectionKey}__${elementKey}` -> number
};

const MAX_HOURS = 744;

const schema: yup.ObjectSchema<OfferFormValues> = yup
  .object({
    name: yup.string().trim().required("Name is required").max(64),
    publicName: yup.string().trim().max(128).default(""),

    pricePerDay: yup
      .number()
      .typeError("Price per day must be a number")
      .required("Price per day is required")
      .integer("Price per day must be an integer")
      .min(1, "Price per day must be at least 1"),

    freeCancellationHours: yup
      .number()
      .typeError("Free cancellation time must be a number")
      .required("Free cancellation time is required")
      .integer("Must be an integer")
      .min(0, "Must be 0 or more")
      .max(MAX_HOURS, `Must be ≤ ${MAX_HOURS}`),

    paymentHours: yup
      .number()
      .typeError("Time for payment must be a number")
      .required("Time for payment is required")
      .integer("Must be an integer")
      .min(0, "Must be 0 or more")
      .max(MAX_HOURS, `Must be ≤ ${MAX_HOURS}`),

    flagSelections: yup.object().default({}),
    intSelections: yup.object().default({}),
  })
  .required();

const keyOf = (sectionKey: string, elementKey: string) =>
  `${sectionKey}__${elementKey}`;

export const OfferCreatePage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [sections, setSections] = useState<officesApi.FilterSection[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<OfferFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      publicName: "",
      pricePerDay: 1,
      freeCancellationHours: 0,
      paymentHours: 0,
      flagSelections: {},
      intSelections: {},
    },
  });

  useEffect(() => {
    if (!officeId) return;

    let alive = true;

    (async () => {
      setLoadingFilters(true);
      setFiltersError(null);

      const res = await officesApi.getOfferFilters();
      if (!alive) return;

      if (!res.ok) {
        setSections([]);
        setFiltersError(
          res.error?.errors?.[0]?.message ?? "Failed to load offer filters.",
        );
        setLoadingFilters(false);
        return;
      }

      const nextSections = res.data.filters ?? [];
      setSections(nextSections);

      // Initialize missing keys so controllers are controlled
      const currentFlags = getValues("flagSelections") ?? {};
      const currentInts = getValues("intSelections") ?? {};

      const mergedFlags: Record<string, string[]> = { ...currentFlags };
      const mergedInts: Record<string, number | null> = { ...currentInts };

      for (const sec of nextSections) {
        for (const el of sec.elements ?? []) {
          const k = keyOf(sec.key, el.key);

          if (el.type === "flags") {
            if (!Array.isArray(mergedFlags[k])) mergedFlags[k] = [];
          } else if (el.type === "integer") {
            if (mergedInts[k] === undefined) mergedInts[k] = null;
          }
        }
      }

      setValue("flagSelections", mergedFlags, { shouldDirty: false });
      setValue("intSelections", mergedInts, { shouldDirty: false });

      setLoadingFilters(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, getValues, setValue]);

  const inputBgSx = {
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#fff" },
    "&.Mui-focused": { bgcolor: "#fff" },
  } as const;

  const onSubmit = async (data: OfferFormValues) => {
    if (!officeId) return;

    setSubmitting(true);
    setSubmitError(null);

    // Build flat properties map required by backend: Record<string, string>
    const props: Record<string, string> = {};

    // flags -> "section.element.flag" = "true"
    for (const sec of sections) {
      for (const el of sec.elements ?? []) {
        const k = keyOf(sec.key, el.key);

        if (el.type === "flags") {
          const selected = data.flagSelections?.[k] ?? [];
          for (const flagKey of selected) {
            props[`${sec.key}.${el.key}.${flagKey}`] = "true";
          }
        }

        if (el.type === "integer") {
          const v = data.intSelections?.[k];
          if (typeof v === "number" && Number.isFinite(v)) {
            props[`${sec.key}.${el.key}`] = String(v);
          }
        }
      }
    }

    const res = await officesApi.createOfficeOffer({
      officeId,
      input: {
        name: data.name.trim(),
        publicName: data.publicName.trim() ? data.publicName.trim() : undefined,

        pricePerDay: data.pricePerDay,
        pricePerDayCurrency: "PLN",

        freeCancellationHours: data.freeCancellationHours,
        paymentHours: data.paymentHours,

        // NOTE: YAML says properties is required. Send {} if empty.
        properties: props,
      },
    });

    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(
        res.error?.errors?.[0]?.message ?? "Failed to create offer.",
      );
      return;
    }

    navigate(`/app/offices/${officeId}/offer/${res.data.id}`);
  };

  const hasFilters = sections.length > 0;

  if (!officeId) return null;

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
        Create offer
      </Typography>

      {submitError ? (
        <Typography color="error" sx={{ mb: "10px" }}>
          {submitError}
        </Typography>
      ) : null}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.name}>
              <FormLabel htmlFor="name">Internal name</FormLabel>
              <OutlinedInput {...field} id="name" sx={inputBgSx} />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="publicName"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.publicName}>
              <FormLabel htmlFor="publicName">Public name (optional)</FormLabel>
              <OutlinedInput
                {...field}
                id="publicName"
                sx={inputBgSx}
                placeholder="e.g. Standard desk package"
              />
              <FormHelperText>{errors.publicName?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="pricePerDay"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.pricePerDay}>
              <FormLabel htmlFor="pricePerDay">Price per day (PLN)</FormLabel>
              <OutlinedInput
                id="pricePerDay"
                type="number"
                value={Number.isFinite(field.value) ? field.value : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 1 : Number(e.target.value),
                  )
                }
                sx={inputBgSx}
              />
              <FormHelperText>{errors.pricePerDay?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="freeCancellationHours"
          control={control}
          render={({ field }) => (
            <FormControl
              variant="outlined"
              error={!!errors.freeCancellationHours}
            >
              <FormLabel htmlFor="freeCancellationHours">
                Free cancellation window (hours)
              </FormLabel>
              <OutlinedInput
                id="freeCancellationHours"
                type="number"
                value={Number.isFinite(field.value) ? field.value : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                sx={inputBgSx}
              />
              <FormHelperText>
                {errors.freeCancellationHours?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="paymentHours"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.paymentHours}>
              <FormLabel htmlFor="paymentHours">
                Time for payment (hours)
              </FormLabel>
              <OutlinedInput
                id="paymentHours"
                type="number"
                value={Number.isFinite(field.value) ? field.value : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                sx={inputBgSx}
              />
              <FormHelperText>{errors.paymentHours?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* Filters -> Offer properties */}
        <Box sx={{ mt: "6px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              mb: "8px",
            }}
          >
            <Typography
              sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}
            >
              Properties
            </Typography>
            {loadingFilters ? <CircularProgress size={16} /> : null}
          </Box>

          {filtersError ? (
            <Typography color="error" sx={{ mb: "10px", fontSize: "13px" }}>
              {filtersError}
            </Typography>
          ) : null}

          {!loadingFilters && !hasFilters ? (
            <Typography sx={{ fontSize: "13px", color: "#666" }}>
              No filters available.
            </Typography>
          ) : null}

          {sections.map((sec) => (
            <Box key={sec.key} sx={{ mb: "14px" }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#333",
                  mb: "6px",
                }}
              >
                {sec.label}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: "10px",
                }}
              >
                {(sec.elements ?? []).map((el) => {
                  const formKey = keyOf(sec.key, el.key);

                  if (el.type === "flags") {
                    return (
                      <Controller
                        key={el.key}
                        name={`flagSelections.${formKey}` as const}
                        control={control}
                        render={({ field }) => (
                          <FormControl variant="outlined">
                            <FormLabel>{el.label}</FormLabel>
                            <Select
                              multiple
                              value={
                                Array.isArray(field.value) ? field.value : []
                              }
                              onChange={(e) =>
                                field.onChange(e.target.value as string[])
                              }
                              input={<OutlinedInput sx={inputBgSx} />}
                              renderValue={(selected) => (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                  }}
                                >
                                  {(selected as string[]).map((flagKey) => {
                                    const label =
                                      el.flags.find((f) => f.key === flagKey)
                                        ?.label ?? flagKey;
                                    return (
                                      <Chip
                                        key={flagKey}
                                        label={label}
                                        size="small"
                                      />
                                    );
                                  })}
                                </Box>
                              )}
                            >
                              {(el.flags ?? []).map((f) => (
                                <MenuItem key={f.key} value={f.key}>
                                  {f.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText> </FormHelperText>
                          </FormControl>
                        )}
                      />
                    );
                  }

                  if (el.type === "integer") {
                    return (
                      <Controller
                        key={el.key}
                        name={`intSelections.${formKey}` as const}
                        control={control}
                        render={({ field }) => (
                          <FormControl variant="outlined">
                            <FormLabel>{el.label}</FormLabel>
                            <OutlinedInput
                              type="number"
                              value={
                                typeof field.value === "number"
                                  ? field.value
                                  : ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                field.onChange(raw === "" ? null : Number(raw));
                              }}
                              sx={inputBgSx}
                              inputProps={{
                                min: el.min,
                                max: el.max,
                              }}
                            />
                            <FormHelperText>
                              {typeof el.min === "number" ||
                              typeof el.max === "number"
                                ? `Range: ${el.min ?? "-"} – ${el.max ?? "-"}`
                                : " "}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    );
                  }

                  return null;
                })}
              </Box>

              <Divider sx={{ mt: "10px" }} />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
            disabled={submitting}
          >
            Save
          </Button>

          <Button
            type="button"
            variant="text"
            color="error"
            startIcon={<CancelIcon fontSize="small" />}
            onClick={() => navigate(`/app/offices/${officeId}`)}
            sx={{ textTransform: "none" }}
            disabled={submitting}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
