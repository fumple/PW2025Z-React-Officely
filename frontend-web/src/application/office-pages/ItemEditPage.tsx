import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

export const ItemEditPage = () => {
  const { itemName } = useParams<{ itemName: string }>();
  const navigate = useNavigate();
  if (!itemName) return null;

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
        Edit item
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{ maxWidth: 560 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <FormControl variant="outlined">
            <FormLabel htmlFor="itemName">Name</FormLabel>
            <OutlinedInput id="itemName" value={itemName} />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="floor">Floor</FormLabel>
            <OutlinedInput id="floor" />
          </FormControl>

          <FormControl variant="outlined">
            <FormLabel htmlFor="room">Room</FormLabel>
            <OutlinedInput id="room" />
          </FormControl>

          <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
            <Button
              type="button"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
              onClick={() => navigate(`../item/${itemName}`)}
            >
              Save
            </Button>

            <Button
              type="button"
              variant="text"
              color="error"
              startIcon={<CancelIcon fontSize="small" />}
              onClick={() => navigate(`../item/${itemName}`)}
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
