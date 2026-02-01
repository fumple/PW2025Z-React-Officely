import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

import { OfficeLocationPicker } from "./OfficeLocationPicker";
import * as officesApi from "../../api/officesApi";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

type OfficeFormValues = {
  name: string;
  description: string;
  openingHours: string;
  address: string;

  contactEmail: string;
  contactPhone: string;
  paymentAccountNumber: string;
  paymentReceiverName: string;

  photos: File[]; // newly added only
};

type GalleryItem =
  | { id: string; kind: "existing"; url: string; currentIndex: number }
  | { id: string; kind: "new"; url: string; file: File };

const MAX_IMAGES = 10;
const PHONE_E164 = /^\+[1-9]\d{1,14}$/;

const schema: yup.ObjectSchema<OfficeFormValues> = yup
  .object({
    name: yup.string().trim().required("Name is required").max(64),
    description: yup
      .string()
      .trim()
      .required("Description is required")
      .max(4096),
    openingHours: yup
      .string()
      .trim()
      .required("Opening hours are required")
      .max(1024),
    address: yup.string().trim().required("Address is required").max(256),

    contactEmail: yup
      .string()
      .trim()
      .required("Contact email is required")
      .email("Invalid email")
      .max(256),

    contactPhone: yup
      .string()
      .trim()
      .required("Contact phone is required")
      .matches(PHONE_E164, "Phone must be in E.164 format, e.g. +48123123123"),

    paymentAccountNumber: yup
      .string()
      .trim()
      .required("IBAN is required")
      .max(34),
    paymentReceiverName: yup
      .string()
      .trim()
      .required("Payment receiver name is required")
      .max(64),

    // IMPORTANT: in EDIT we do NOT require adding new photos
    photos: yup
      .mixed<File[]>()
      .test(
        "maxFiles",
        `Max ${MAX_IMAGES} photos`,
        (v) => (v?.length ?? 0) <= MAX_IMAGES,
      )
      .default([]),
  })
  .required();

export const OfficeEditPage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId: string }>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [published, setPublished] = useState<boolean>(false);

  const resolver = useMemo(() => yupResolver(schema), []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
  } = useForm<OfficeFormValues>({
    resolver,
    defaultValues: {
      name: "",
      description: "",
      openingHours: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
      paymentAccountNumber: "",
      paymentReceiverName: "",
      photos: [],
    },
  });

  const address = useWatch({ control, name: "address" });

  const [lat, setLat] = useState(52.2297);
  const [lng, setLng] = useState(21.0122);

  useEffect(() => {
    if (!officeId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setSubmitError(null);

      const res = await officesApi.getOffice(officeId);
      if (!alive) return;

      if (!res.ok) {
        setSubmitError(
          res.error?.errors?.[0]?.message ?? "Failed to load office.",
        );
        setLoading(false);
        return;
      }

      const o = res.data;

      reset({
        name: o.name ?? "",
        description: o.description ?? "",
        openingHours: o.openingHours ?? "",
        address: o.address ?? "",
        contactEmail: o.contactEmail ?? "",
        contactPhone: o.contactPhone ?? "",
        paymentAccountNumber: o.paymentAccountNumber ?? "",
        paymentReceiverName: o.paymentReceiverName ?? "",
        photos: [],
      });

      setLat(o.coordinates?.lat ?? 52.2297);
      setLng(o.coordinates?.lon ?? 21.0122);
      setPublished(!!o.published);

      const existing = o.photoUrls ?? [];

      setGallery(
        existing.map((url, i) => ({
          id: `e-${i}`,
          kind: "existing",
          url,
          currentIndex: i,
        })),
      );

      clearErrors("photos");

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, reset, clearErrors]);

  const inputBgSx = {
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#fff" },
    "&.Mui-focused": { bgcolor: "#fff" },
  } as const;

  const removeGalleryItem = (id: string) => {
    setGallery((prev) => {
      const item = prev.find((x) => x.id === id);

      if (item?.kind === "new") URL.revokeObjectURL(item.url);

      const next = prev.filter((x) => x.id !== id);
      const nextNewFiles = next
        .filter(
          (x): x is Extract<GalleryItem, { kind: "new" }> => x.kind === "new",
        )
        .map((x) => x.file);

      setValue("photos", nextNewFiles, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors("photos");

      return next;
    });
  };

  const onSubmit = async (data: OfficeFormValues) => {
    if (!officeId) return;

    setSubmitting(true);
    setSubmitError(null);

    if (gallery.length === 0) {
      setSubmitting(false);
      setError("photos", {
        type: "manual",
        message: "At least 1 photo is required",
      });
      return;
    }

    if (gallery.length > MAX_IMAGES) {
      setSubmitting(false);
      setError("photos", {
        type: "manual",
        message: `Max ${MAX_IMAGES} photos`,
      });
      return;
    }

    let addedIdx = 0;
    const imagesOrdering = gallery.map((it) => {
      if (it.kind === "existing") return `current[${it.currentIndex}]`;
      return `added[${addedIdx++}]`;
    });

    const addedImages = gallery
      .filter(
        (it): it is Extract<GalleryItem, { kind: "new" }> => it.kind === "new",
      )
      .map((it) => it.file);

    const res = await officesApi.updateOffice({
      officeId,
      office: {
        name: data.name,
        description: data.description,
        openingHours: data.openingHours,
        address: data.address,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        paymentAccountNumber: data.paymentAccountNumber,
        paymentReceiverName: data.paymentReceiverName,
        published,
        images: imagesOrdering,
      },
      addedImages,
    });

    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(
        res.error?.errors?.[0]?.message ?? "Failed to update office.",
      );
      return;
    }

    navigate(`/app/offices/${officeId}`);
  };

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
        Edit office
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
              <OutlinedInput
                {...field}
                id="name"
                sx={inputBgSx}
                disabled={loading}
              />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.description}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <OutlinedInput
                {...field}
                id="description"
                sx={inputBgSx}
                multiline
                minRows={3}
                disabled={loading}
              />
              <FormHelperText>{errors.description?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="openingHours"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.openingHours}>
              <FormLabel htmlFor="openingHours">Opening hours</FormLabel>
              <OutlinedInput
                {...field}
                id="openingHours"
                multiline
                minRows={2}
                disabled={loading}
              />
              <FormHelperText>{errors.openingHours?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Box sx={{ position: "sticky", top: "12px" }}>
          <Typography
            sx={{ fontSize: "13px", fontWeight: 600, color: "#111", mb: "6px" }}
          >
            Location
          </Typography>

          <OfficeLocationPicker
            address={address ?? ""}
            lat={typeof lat === "number" ? lat : 52.2297}
            lng={typeof lng === "number" ? lng : 21.0122}
            onChange={(next) => {
              setValue("address", next.address, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setLat(next.lat);
              setLng(next.lng);
            }}
          />

          <FormHelperText error sx={{ mt: "6px" }}>
            {errors.address?.message || " "}
          </FormHelperText>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              columnGap: "12px",
              rowGap: "10px",
              mt: "10px",
            }}
          >
            <Controller
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <FormControl
                  variant="outlined"
                  error={!!errors.contactEmail}
                  fullWidth
                  sx={{ minWidth: 0 }}
                >
                  <FormLabel htmlFor="contactEmail" sx={{ mb: "6px" }}>
                    Contact email
                  </FormLabel>
                  <OutlinedInput
                    {...field}
                    id="contactEmail"
                    sx={inputBgSx}
                    disabled={loading}
                  />
                  <FormHelperText>
                    {errors.contactEmail?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <FormControl
                  variant="outlined"
                  error={!!errors.contactPhone}
                  fullWidth
                  sx={{ minWidth: 0 }}
                >
                  <FormLabel htmlFor="contactPhone" sx={{ mb: "6px" }}>
                    Contact phone
                  </FormLabel>
                  <OutlinedInput
                    {...field}
                    id="contactPhone"
                    sx={inputBgSx}
                    placeholder="+48123123123"
                    disabled={loading}
                  />
                  <FormHelperText>
                    {errors.contactPhone?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="paymentReceiverName"
              control={control}
              render={({ field }) => (
                <FormControl
                  variant="outlined"
                  error={!!errors.paymentReceiverName}
                  fullWidth
                  sx={{ minWidth: 0 }}
                >
                  <FormLabel htmlFor="paymentReceiverName" sx={{ mb: "6px" }}>
                    Payment receiver name
                  </FormLabel>
                  <OutlinedInput
                    {...field}
                    id="paymentReceiverName"
                    sx={inputBgSx}
                    disabled={loading}
                  />
                  <FormHelperText>
                    {errors.paymentReceiverName?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="paymentAccountNumber"
              control={control}
              render={({ field }) => (
                <FormControl
                  variant="outlined"
                  error={!!errors.paymentAccountNumber}
                  fullWidth
                  sx={{ minWidth: 0 }}
                >
                  <FormLabel htmlFor="paymentAccountNumber" sx={{ mb: "6px" }}>
                    Payment account number (IBAN)
                  </FormLabel>
                  <OutlinedInput
                    {...field}
                    id="paymentAccountNumber"
                    sx={inputBgSx}
                    disabled={loading}
                  />
                  <FormHelperText>
                    {errors.paymentAccountNumber?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#111",
                mb: "6px",
              }}
            >
              Gallery
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {gallery.map((it, idx) => (
                <Box
                  key={it.id}
                  sx={{
                    width: 140,
                    height: 110,
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #eee",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    component="img"
                    src={it.url}
                    alt={`Office photo ${idx + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <IconButton
                    type="button"
                    size="small"
                    onClick={() => removeGalleryItem(it.id)}
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      zIndex: 2,
                      bgcolor: "rgba(0,0,0,0.55)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16, color: "#fff" }} />
                  </IconButton>
                </Box>
              ))}

              {gallery.length < MAX_IMAGES && (
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) =>
                    e.key === "Enter" || e.key === " "
                      ? inputRef.current?.click()
                      : null
                  }
                  sx={{
                    width: 140,
                    height: 110,
                    border: "1px dashed #cfcfcf",
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    color: "#666",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <AddPhotoAlternateIcon fontSize="small" />
                    <Typography sx={{ fontSize: "12px" }}>Add photo</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;

                const remaining = MAX_IMAGES - gallery.length;
                if (remaining <= 0) return;

                const toAdd = files.slice(0, remaining);

                const newItems: GalleryItem[] = toAdd.map((f, idx) => ({
                  id:
                    typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? `n-${crypto.randomUUID()}`
                      : `n-${Date.now()}-${idx}`,
                  kind: "new",
                  url: URL.createObjectURL(f),
                  file: f,
                }));

                setGallery((prev) => [...prev, ...newItems]);

                const currentPhotos = getValues("photos") ?? [];
                setValue("photos", [...currentPhotos, ...toAdd], {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                clearErrors("photos");
                e.target.value = "";
              }}
            />

            <FormHelperText error sx={{ mt: "6px" }}>
              {errors.photos?.message ?? " "}
            </FormHelperText>
          </Box>

          <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
              disabled={submitting || loading}
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
    </Box>
  );
};
