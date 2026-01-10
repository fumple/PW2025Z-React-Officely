import { useState } from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

export const ItemCreatePage = () => {
  const [pricingTableId, setPricingTableId] = useState("");

  const navigate = useNavigate();
  const itemId = "A459";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
        Create item
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{ maxWidth: 560 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <FormControl variant="outlined">
            <FormLabel htmlFor="name">Name</FormLabel>
            <OutlinedInput id="name" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="floor">Floor</FormLabel>
            <OutlinedInput id="floor" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="room">Room</FormLabel>
            <OutlinedInput id="room" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="desks">Number of desks</FormLabel>
            <OutlinedInput id="desks" type="number" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="pricingTable">Pricing Table</FormLabel>
            <Select
              id="pricingTable"
              value={pricingTableId}
              onChange={(e: SelectChangeEvent) =>
                setPricingTableId(e.target.value)
              }
              displayEmpty
            >
              <MenuItem value="shared-room">Shared Room Pricing</MenuItem>
              <MenuItem value="private-desk">Private Desk Pricing</MenuItem>
              <MenuItem value="meeting-room">Meeting Room Pricing</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
            <Button
              type="button"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
              onClick={() => navigate(`../item/${itemId}`)}
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
