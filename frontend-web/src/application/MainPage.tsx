import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { styled } from "@mui/material/styles";

const StatCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.25, 2), // ~18px 16px
  height: 130,

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
}));

const StatValue = styled("div")(({ theme }) => ({
  fontSize: "20px",
  fontWeight: 500,
  color: theme.palette.text.primary,
  lineHeight: 1,
  marginBottom: 6,
}));

const StatLabel = styled("div")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.text.secondary,
}));

type Stat = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

const STATS: Stat[] = [
  {
    icon: <LocationOnIcon fontSize="large" />,
    value: "100",
    label: "Active offices",
  },
  {
    icon: <CalendarMonthIcon fontSize="large" />,
    value: "100",
    label: "Future bookings",
  },
  {
    icon: <CheckBoxIcon fontSize="large" />,
    value: "100",
    label: "Past bookings",
  },
  {
    icon: <AttachMoneyIcon fontSize="large" />,
    value: "0",
    label: "Pending payments",
  },
];

export const MainPage = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 200px)",
        gap: 2, // uses theme spacing
        alignItems: "start",
        "@media (max-width: 920px)": {
          gridTemplateColumns: "repeat(2, 200px)",
        },
        "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
      }}
    >
      {STATS.map((s) => (
        <StatCard key={s.label}>
          <Box sx={{ mb: 1.25, color: "text.primary", display: "inline-flex" }}>
            {s.icon}
          </Box>

          <StatValue>{s.value}</StatValue>
          <StatLabel>{s.label}</StatLabel>
        </StatCard>
      ))}
    </Box>
  );
};
