import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormHelperText from "@mui/material/FormHelperText";

type ItemValues = {
  name: string;
  floor: string;
  room: string;
};

const schema: yup.ObjectSchema<ItemValues> = yup
  .object({
    name: yup.string().trim().required("Name is required"),
    floor: yup.string().trim().required("Floor is required"),
    room: yup.string().trim().required("Room is required"),
  })
  .required();

export const ItemEditPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemValues>({
    resolver: yupResolver(schema),
  });

  if (!itemId) return null;

  const onSubmit = (data: ItemValues) => {
    console.log(data);
    navigate(`../item/${itemId}`);
  };

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
        Edit item
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
            <FormControl variant="outlined">
              <FormLabel htmlFor="itemName">Name</FormLabel>
              <OutlinedInput {...field} id="itemName" />
              <FormHelperText>{errors.name?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="floor"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined">
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
            <FormControl variant="outlined">
              <FormLabel htmlFor="room">Room</FormLabel>
              <OutlinedInput {...field} id="room" />
              <FormHelperText>{errors.room?.message}</FormHelperText>
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
            onClick={() => navigate(`../item/${itemId}`)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
