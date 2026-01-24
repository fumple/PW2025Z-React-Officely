import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { styled } from "@mui/material/styles";
import { getDashboardStats } from "../api/dashBoardApi";
import { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";

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

export const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeOffices: 0,
    futureBookings: 0,
    pastBookings: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);

      const res = await getDashboardStats();
      if (!alive) return;

      if (res.ok) setStats(res.data);
      else
        setApiError(
          res.error?.errors?.[0]?.message ?? "Failed to load dashboard stats.",
        );

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        icon: <LocationOnIcon fontSize="large" />,
        value: String(stats.activeOffices),
        label: "Active offices",
      },
      {
        icon: <CalendarMonthIcon fontSize="large" />,
        value: String(stats.futureBookings),
        label: "Future bookings",
      },
      {
        icon: <CheckBoxIcon fontSize="large" />,
        value: String(stats.pastBookings),
        label: "Past bookings",
      },
      {
        icon: <AttachMoneyIcon fontSize="large" />,
        value: String(stats.pendingPayments),
        label: "Pending payments",
      },
    ],
    [stats],
  );
  return (
    <Box>
      {apiError ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {apiError}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 200px)",
          gap: 2,
          alignItems: "start",
          "@media (max-width: 920px)": {
            gridTemplateColumns: "repeat(2, 200px)",
          },
          "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
          opacity: loading ? 0.6 : 1,
        }}
      >
        {cards.map((s) => (
          <StatCard key={s.label}>
            <Box
              sx={{ mb: 1.25, color: "text.primary", display: "inline-flex" }}
            >
              {s.icon}
            </Box>
            <StatValue>{s.value}</StatValue>
            <StatLabel>{s.label}</StatLabel>
          </StatCard>
        ))}
      </Box>
    </Box>
  );
};
