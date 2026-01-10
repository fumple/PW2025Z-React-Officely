import { useState } from "react";
import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

export const PricingTableEditPage = () => {
  const [unit, setUnit] = useState("PLN");
  const units = ["PLN", "USD", "EUR"] as const;

  const navigate = useNavigate();
  const { pricingTableId } = useParams<{ pricingTableId: string }>();
  if (!pricingTableId) return null;

  const pricingTableName = "Standard";
  const pricingTableCompanyName = "Regular";
  const officeName = "Lorem Ipsum Office";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 560 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
          {officeName} - {pricingTableCompanyName} Pricing Table
        </Typography>

        <Box>
          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <FormControl variant="outlined">
              <FormLabel htmlFor="name">Name (visible to customers)</FormLabel>
              <OutlinedInput id="name" value={pricingTableName} required />
            </FormControl>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px",
                gap: "10px",
              }}
            >
              <FormControl variant="outlined">
                <FormLabel htmlFor="price">Price per day</FormLabel>
                <OutlinedInput id="price" type="number" required />
              </FormControl>

              <FormControl variant="outlined">
                <FormLabel id="unit-label">Unit</FormLabel>
                <Select
                  labelId="unit-label"
                  value={unit}
                  onChange={(e: SelectChangeEvent) => setUnit(e.target.value)}
                >
                  {units.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl variant="outlined">
              <FormLabel htmlFor="freeCancelHours">
                Hours for free cancellation
              </FormLabel>
              <Typography
                variant="caption"
                sx={{ display: "block", mt: "2px" }}
              >
                The user has the number of hours written here before the
                reservation starts to cancel it and receive a full refund.
              </Typography>
              <OutlinedInput id="freeCancelHours" type="number" required />
            </FormControl>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <FormLabel>Time for payment (hours)</FormLabel>
              <Typography variant="caption" sx={{ display: "block" }}>
                After this time passes and the user still hasn&apos;t submitted
                payment, the reservation is automatically cancelled.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px",
                  gap: "10px",
                }}
              >
                <OutlinedInput type="number" required />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: "8px",
                    color: "text.secondary",
                  }}
                >
                  before start
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
              <Button
                type="button"
                variant="contained"
                startIcon={<SaveIcon fontSize="small" />}
                onClick={() => navigate(`../pricing-table/${pricingTableId}`)}
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
    </Box>
  );
};
