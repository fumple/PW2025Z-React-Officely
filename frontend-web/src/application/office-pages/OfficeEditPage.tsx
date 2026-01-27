import { useRef, useState } from "react";
import { useNavigate } from "react-router";
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

import { OfficeLocationDisplay } from "./OfficeLocationDisplay";

type OfficeFormValues = {
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: File[];
};
const MAX_IMAGES = 10;
const schema: yup.ObjectSchema<OfficeFormValues> = yup
  .object({
    name: yup.string().trim().required("Name is required"),
    description: yup.string().trim().required("Description is required"),
    address: yup.string().trim().required("Address is required"),
    lat: yup
      .number()
      .typeError("Latitude must be a number")
      .required("Latitude is required"),
    lng: yup
      .number()
      .typeError("Longitude must be a number")
      .required("Longitude is required"),
    photos: yup
      .mixed<File[]>()
      .test("maxFiles", `Max ${MAX_IMAGES} photos`, (value) => {
        if (!value) return true;
        return value.length <= MAX_IMAGES;
      })
      .default([]),
  })
  .required();

export const OfficeEditPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<OfficeFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      lat: 52.2297,
      lng: 21.0122,
    },
  });

  const address = useWatch({ control, name: "address" });
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });

  const inputBgSx = {
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#fff" },
    "&.Mui-focused": { bgcolor: "#fff" },
  } as const;

  const addPhotoToForm = (file: File) => {
    const current = getValues("photos") ?? [];
    if (current.length >= MAX_IMAGES) return;

    setValue("photos", [...current, file], {
      shouldDirty: true,
      shouldValidate: true,
    });

    const url = URL.createObjectURL(file);
    setImages((prev) => [...prev, url]);
  };

  const onSubmit = (data: OfficeFormValues) => {
    console.log({ ...data, images });
    const officeId = "7"; // demo
    navigate(`../offices/${officeId}`);
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
        Edit office
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
              />
              <FormHelperText>{errors.description?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Box sx={{ position: "sticky", top: "12px" }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#111",
              mb: "6px",
            }}
          >
            Location
          </Typography>

          <OfficeLocationDisplay
            address={address ?? ""}
            lat={typeof lat === "number" ? lat : 0.0}
            lng={typeof lng === "number" ? lng : 0.0}
          />

          <FormHelperText error sx={{ mt: "6px" }}>
            {errors.address?.message ||
              errors.lat?.message ||
              errors.lng?.message ||
              " "}
          </FormHelperText>

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
              {images.map((src, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={src}
                  alt={`Office photo ${idx + 1}`}
                  sx={{
                    width: 140,
                    height: 110,
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    objectFit: "cover",
                    backgroundColor: "#fff",
                  }}
                />
              ))}

              {images.length < MAX_IMAGES && (
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                addPhotoToForm(file);
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
    </Box>
  );
};
