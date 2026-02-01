import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormHelperText from "@mui/material/FormHelperText";

import * as officesApi from "../../../api/officesApi";

type ItemType = "shared" | "individual";

type ItemValues = {
  type: ItemType;
  name: string;
  floor: string;
  room: string;
  totalCapacity: number;
  offerId: string;
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
    offerId: yup.string().trim().required("Offer is required"),
  })
  .required();

export const ItemCreatePage = () => {
  const navigate = useNavigate();
  const { officeId } = useParams<{ officeId?: string }>();

  const [offers, setOffers] = useState<officesApi.OfficeOfferResource[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "shared",
      name: "",
      floor: "",
      room: "",
      totalCapacity: 1,
      offerId: "",
    },
    mode: "onSubmit",
  });

  const itemType = useWatch({ control, name: "type" });

  useEffect(() => {
    if (!officeId) return;

    let alive = true;

    (async () => {
      setOffersLoading(true);
      setOffersError(null);

      const res = await officesApi.listOfficeOffers({
        officeId,
        pageSize: 50, // backend validation limit
      });

      if (!alive) return;

      if (!res.ok) {
        setOffers([]);
        setOffersError(
          res.error?.errors?.[0]?.message ?? "Failed to load offers.",
        );
      } else {
        const all = res.data.results ?? [];
        // ✅ show only active offers (frontend filter)
        setOffers(all.filter((o) => o.available));
      }

      setOffersLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [officeId]);

  const onSubmit = async (data: ItemValues) => {
    if (!officeId) return;

    setSubmitting(true);
    setSubmitError(null);

    const input: officesApi.CreateOfficeItemInput = {
      name: data.name.trim(),
      floor: data.floor.trim(),
      room: data.room.trim(),
      offerId: data.offerId,
      type: data.type === "shared" ? "SHARED" : "INDIVIDUAL",
    };

    // capacity rules from swagger:
    // - required iff type is SHARED
    // - must NOT be present for INDIVIDUAL
    if (input.type === "SHARED") {
      input.capacity = data.totalCapacity;
    }

    const res = await officesApi.createOfficeItem({ officeId, input });

    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(
        res.error?.errors?.[0]?.message ?? "Failed to create item.",
      );
      return;
    }

    // route style consistent with your other pages
    navigate(`/app/offices/${officeId}/item/${res.data.id}`);
  };

  if (!officeId) {
    return (
      <Box sx={{ px: "12px", pt: "6px" }}>
        <Typography color="error">Missing officeId in route params.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Typography variant="h5" component="h1" sx={{ m: 0, mb: "12px" }}>
        Create item
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
          opacity: submitting ? 0.7 : 1,
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
          name="offerId"
          control={control}
          render={({ field }) => (
            <FormControl variant="outlined" error={!!errors.offerId}>
              <FormLabel htmlFor="offer">
                Offer{" "}
                {offersLoading ? (
                  <CircularProgress size={14} sx={{ ml: "8px" }} />
                ) : null}
              </FormLabel>

              <Select {...field} id="offer" displayEmpty>
                <MenuItem value="">
                  <em>Select…</em>
                </MenuItem>

                {offers.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.name}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {offersError ?? errors.offerId?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Box sx={{ display: "flex", gap: "10px", mt: "6px" }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
            disabled={offersLoading || submitting}
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
            disabled={submitting}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
