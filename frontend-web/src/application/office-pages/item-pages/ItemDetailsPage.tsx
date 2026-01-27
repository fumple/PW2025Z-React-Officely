import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export const ItemDetailsPage = () => {
  const navigate = useNavigate();

  const { itemId } = useParams<{ itemId: string }>();
  if (!itemId) return null;

  const officeName = "Lorem Ipsum Office";

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 720 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>
          {officeName} - Desk #{itemId}
        </Typography>

        <Box
          sx={{
            mt: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Type:
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Floor:
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Room:
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "13px" }}>
            Pricing:
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
          <Button
            variant="contained"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => navigate("./edit")}
          >
            Edit
          </Button>

          <Button variant="outlined" onClick={() => navigate("/app/bookings")}>
            View bookings
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<VisibilityOffIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => alert("unpublished")}
          >
            Unpublish
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
            onClick={() => alert("delete")}
          >
            Delete
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: "14px" }}>
          Properties
        </Typography>

        <Paper variant="card" sx={{ mt: "8px" }}>
          <Typography
            sx={{ fontSize: "12px", fontWeight: 600, color: "text.primary" }}
          >
            Desk:
          </Typography>

          <Box
            component="ul"
            sx={{ m: 0, mt: "6px", pl: "18px", color: "text.primary" }}
          >
            <li>
              <Typography sx={{ fontSize: "13px", color: "text.primary" }}>
                Standing Desk
              </Typography>
            </li>
          </Box>

          <Box
            component="ul"
            sx={{ m: 0, mt: "6px", pl: "18px", color: "text.primary" }}
          >
            <li>
              <Typography sx={{ fontSize: "13px", color: "text.primary" }}>
                Desk with adjustable height
              </Typography>
            </li>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
