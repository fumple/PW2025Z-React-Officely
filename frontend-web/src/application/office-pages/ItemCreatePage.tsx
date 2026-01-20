import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
type ItemType = "shared" | "individual";

import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormHelperText from "@mui/material/FormHelperText";

type ItemValues = {
  type: ItemType;
  name: string;
  floor: string;
  room: string;
  totalCapacity: number;
  pricingTableId: string;
};

const schema: yup.ObjectSchema<ItemValues> = yup
  .object({
    type: yup
      .mixed<ItemType>()
      .oneOf(["shared", "individual"], "Choose item type")
      .required("Choose item type"),
    name: yup.string().trim().required("Name is required"),
    floor: yup.string().trim().required("Floor is required"),
    room: yup.string().trim().required("Room is required"),
    totalCapacity: yup
      .number()
      .typeError("Number of desks must be a number")
      .required("Number of desks is required")
      .min(1, "Must be at least 1"),
    pricingTableId: yup.string().trim().required("Pricing table is required"),
  })
  .required();

export const ItemCreatePage = () => {
  const navigate = useNavigate();
  const itemId = "A459";
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemValues>({
    resolver: yupResolver(schema),
  });

  const itemType = useWatch({ control, name: "type" });

  const onSubmit = (data: ItemValues) => {
    console.log(data);
    if (data.type === "individual") data.totalCapacity = 1;
    navigate(`../item/${itemId}`);
  };

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
        Create item
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
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.type}>
              <RadioGroup
                value={field.value}
                onChange={(e) => field.onChange(e.target.value as ItemType)}
              >
                <FormControlLabel
                  value="shared"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "14px", color: "#111" }}>
                        Shared Room
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#777" }}>
                        Room with multiple desks, without reservation of
                        individual desks
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: "flex-start",
                    m: 0,
                    p: "6px 8px",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                />

                <FormControlLabel
                  value="individual"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "14px", color: "#111" }}>
                        Individual desk / Private room
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#777" }}>
                        The type of this item is decided by properties
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: "flex-start",
                    m: 0,
                    p: "6px 8px",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                />
              </RadioGroup>
              <FormHelperText>{errors.type?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <OutlinedInput {...field} id="name" />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="floor"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.floor}>
              <FormLabel htmlFor="floor">Floor</FormLabel>
              <OutlinedInput {...field} id="floor" />
              <FormHelperText>{errors.floor?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="room"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.room}>
              <FormLabel htmlFor="room">Room</FormLabel>
              <OutlinedInput {...field} id="room" />
              <FormHelperText>{errors.room?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="totalCapacity"
          control={control}
          render={({ field }) => (
            <FormControl
              variant="outlined"
              disabled={itemType === "individual"}
            >
              <FormLabel htmlFor="desks">Number of desks</FormLabel>
              <OutlinedInput id="desks" {...field} type="number" />
              <FormHelperText>{errors.totalCapacity?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="pricingTableId"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined">
              <FormLabel htmlFor="pricingTable">Pricing Table</FormLabel>
              <Select {...field} id="pricingTable" displayEmpty>
                <MenuItem value="">
                  <em>Select…</em>
                </MenuItem>
                <MenuItem value="shared-room">Shared Room Pricing</MenuItem>
                <MenuItem value="private-desk">Private Desk Pricing</MenuItem>
                <MenuItem value="meeting-room">Meeting Room Pricing</MenuItem>
              </Select>
              <FormHelperText>{errors.pricingTableId?.message}</FormHelperText>
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
