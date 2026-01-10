import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { OfficeLocationPicker } from "./OfficeLocationPicker";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_IMAGES = 10;

export const OfficeCreatePage = () => {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [location, setLocation] = useState({
    address: "",
    lat: 52.2297,
    lng: 21.0122,
  });

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const canAddMore = images.length < MAX_IMAGES;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newItems: SelectedImage[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);

    // allow selecting the same file again next time
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((x) => x.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const officeId = crypto.randomUUID();

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: 560,
        }}
      >
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          Create a new office
        </Typography>

        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <FormControl variant="outlined">
            <FormLabel htmlFor="officeName">Name</FormLabel>
            <OutlinedInput id="officeName" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="officeDescription">Description</FormLabel>
            <OutlinedInput id="officeDescription" multiline minRows={4} />
          </FormControl>

          <FormLabel htmlFor="officeAddress">Address</FormLabel>
          <OfficeLocationPicker
            address={location.address}
            lat={location.lat}
            lng={location.lng}
            onChange={setLocation}
          />

          {/* Gallery */}
          <Box sx={{ mt: "2px" }}>
            <Typography sx={{ fontSize: "11px", color: "#666", mb: "6px" }}>
              Gallery ({images.length}/{MAX_IMAGES})
            </Typography>

            <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {images.map((img) => (
                <Box
                  key={img.id}
                  sx={{
                    position: "relative",
                    height: 100,
                    borderRadius: "10px",
                    border: "1px solid #eee",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    component="img"
                    src={img.previewUrl}
                    alt={img.file.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => removeImage(img.id)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255,255,255,0.85)",
                      border: "1px solid #e6e6e6",
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}

              <Box
                role="button"
                tabIndex={0}
                onClick={() => canAddMore && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (!canAddMore) return;
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                title={canAddMore ? "Add image" : "Max images reached"}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "10px",
                  border: "1px dashed #cfcfcf",
                  backgroundColor: "#fff",
                  display: "grid",
                  placeItems: "center",
                  cursor: canAddMore ? "pointer" : "not-allowed",
                  opacity: canAddMore ? 1 : 0.45,
                  userSelect: "none",
                }}
              >
                <AddPhotoAlternateIcon />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                  disabled={!canAddMore}
                  style={{ display: "none" }}
                />
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
            <Button
              type="button"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
              onClick={() => navigate(`/app/offices/${officeId}`)}
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
