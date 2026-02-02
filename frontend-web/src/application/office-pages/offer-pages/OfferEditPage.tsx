import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import * as officesApi from "../../../api/officesApi";

type OfferFormValues = {
  name: string;
  publicName: string;

  pricePerDay: number;
  freeCancellationHours: number;
  paymentHours: number;

  flagSelections: Record<string, string[]>;
  intSelections: Record<string, number | null>;
};

const inputBgSx = {
  bgcolor: "#fff",
  "&:hover": { bgcolor: "#fff" },
  "&.Mui-focused": { bgcolor: "#fff" },
} as const;

function formKeyOf(sectionKey: string, elementKey: string) {
  return `${sectionKey}__${elementKey}`;
}

function firstVal(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

function isTruthy(v: unknown) {
  const x = firstVal(v);
  if (x === true) return true;
  if (typeof x === "number") return x !== 0;
  if (typeof x === "string") {
    const s = x.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

function toIntOrNull(v: unknown): number | null {
  const x = firstVal(v);
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export const OfferEditPage = () => {
  const navigate = useNavigate();
  const { officeId, offerId } = useParams<{
    officeId?: string;
    offerId?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [offer, setOffer] = useState<officesApi.OfficeOfferResource | null>(
    null,
  );

  const [sections, setSections] = useState<officesApi.FilterSection[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    defaultValues: {
      name: "",
      publicName: "",
      pricePerDay: 1,
      freeCancellationHours: 0,
      paymentHours: 0,
      flagSelections: {},
      intSelections: {},
    },
    mode: "onSubmit",
  });

  // Load offer (and optionally office just for validation)
  useEffect(() => {
    if (!officeId || !offerId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setLoadError(null);

      const [officeRes, offerRes] = await Promise.all([
        officesApi.getOffice(officeId),
        officesApi.getOfficeOffer({ officeId, offerId }),
      ]);

      if (!alive) return;

      if (!officeRes.ok) {
        setOffer(null);
        setLoadError(
          officeRes.error?.errors?.[0]?.message ?? "Failed to load office.",
        );
        setLoading(false);
        return;
      }

      if (!offerRes.ok) {
        setOffer(null);
        setLoadError(
          offerRes.error?.errors?.[0]?.message ?? "Failed to load offer.",
        );
        setLoading(false);
        return;
      }

      setOffer(offerRes.data);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, offerId]);

  // Load filters
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingFilters(true);
      setFiltersError(null);

      const res = await officesApi.getOfferFilters();

      if (!alive) return;

      if (!res.ok) {
        setSections([]);
        setFiltersError(
          res.error?.errors?.[0]?.message ?? "Failed to load filters.",
        );
      } else {
        setSections(res.data.filters ?? []);
      }

      setLoadingFilters(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Build initial form values from offer + sections
  // IMPORTANT: do NOT initialize while filters are still loading,
  // otherwise you reset with empty selections and it looks "unselected".
  const initialFormValues = useMemo<OfferFormValues | null>(() => {
    if (!offer) return null;
    if (loadingFilters) return null;
    if (sections.length === 0) return null; // wait until we actually have filters

    const rawProps =
      (offer as unknown as { properties?: Record<string, unknown> })
        .properties ?? {};

    const flagSelections: Record<string, string[]> = {};
    const intSelections: Record<string, number | null> = {};

    for (const sec of sections) {
      for (const el of sec.elements ?? []) {
        const fk = formKeyOf(sec.key, el.key);

        if (el.type === "flags") {
          const selected: string[] = [];
          for (const f of el.flags ?? []) {
            const propKey = `${sec.key}.${el.key}.${f.key}`;
            if (isTruthy(rawProps[propKey])) selected.push(f.key);
          }
          flagSelections[fk] = selected;
        }

        if (el.type === "integer") {
          const propKey = `${sec.key}.${el.key}`;
          intSelections[fk] = toIntOrNull(rawProps[propKey]);
        }
      }
    }

    return {
      name: offer.name ?? "",
      publicName: offer.publicName ?? "",
      pricePerDay: offer.pricePerDay ?? 1,
      freeCancellationHours: offer.freeCancellationHours ?? 0,
      paymentHours: offer.paymentHours ?? 0,
      flagSelections,
      intSelections,
    };
  }, [offer, sections, loadingFilters]);

  // Reset exactly when initial values are ready
  useEffect(() => {
    if (!initialFormValues) return;
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  const onSubmit: SubmitHandler<OfferFormValues> = async (data) => {
    if (!officeId || !offerId) return;

    setSubmitting(true);
    setSubmitError(null);

    const props: Record<string, string> = {};

    for (const sec of sections) {
      for (const el of sec.elements ?? []) {
        const formKey = formKeyOf(sec.key, el.key);

        if (el.type === "flags") {
          const selected = data.flagSelections?.[formKey] ?? [];
          for (const flagKey of selected) {
            props[`${sec.key}.${el.key}.${flagKey}`] = "true";
          }
        }

        if (el.type === "integer") {
          const v = data.intSelections?.[formKey];
          if (typeof v === "number" && Number.isFinite(v)) {
            props[`${sec.key}.${el.key}`] = String(v);
          }
        }
      }
    }

    const res = await officesApi.createOfficeOffer({
      officeId,
      input: {
        sourceId: offerId,
        name: data.name.trim(),
        publicName: data.publicName.trim() ? data.publicName.trim() : undefined,

        pricePerDay: data.pricePerDay,
        pricePerDayCurrency: "PLN",

        freeCancellationHours: data.freeCancellationHours,
        paymentHours: data.paymentHours,

        properties: props,
      },
    });

    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(
        res.error?.errors?.[0]?.message ?? "Failed to save offer.",
      );
      return;
    }

    navigate(`/app/offices/${officeId}/offer/${res.data.id}`);
  };

  if (!officeId || !offerId) return null;

  const hasFilters = sections.length > 0;

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
        Edit offer
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            mb: "10px",
          }}
        >
          <CircularProgress size={18} />
          <Typography sx={{ fontSize: "13px", color: "#666" }}>
            Loading…
          </Typography>
        </Box>
      ) : null}

      {loadError ? (
        <Typography color="error" sx={{ mb: "10px" }}>
          {loadError}
        </Typography>
      ) : null}

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
          rules={{
            required: "Required",
            minLength: { value: 1, message: "Required" },
          }}
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
          rules={{
            min: { value: 1, message: "Min 1" },
            validate: (v) => Number.isFinite(v) || "Invalid number",
          }}
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
          rules={{
            min: { value: 0, message: "Min 0" },
            validate: (v) => Number.isFinite(v) || "Invalid number",
          }}
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
          rules={{
            min: { value: 0, message: "Min 0" },
            validate: (v) => Number.isFinite(v) || "Invalid number",
          }}
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
                  const fk = formKeyOf(sec.key, el.key);

                  if (el.type === "flags") {
                    return (
                      <Controller
                        key={el.key}
                        name={`flagSelections.${fk}` as const}
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
                                      el.flags?.find((f) => f.key === flagKey)
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
                        name={`intSelections.${fk}` as const}
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
                              inputProps={{ min: el.min, max: el.max }}
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
            disabled={submitting || !!loadError || !offer}
          >
            Save
          </Button>

          <Button
            type="button"
            variant="text"
            color="error"
            startIcon={<CancelIcon fontSize="small" />}
            onClick={() =>
              navigate(`/app/offices/${officeId}/offer/${offerId}`)
            }
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
