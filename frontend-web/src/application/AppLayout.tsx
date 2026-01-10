import { Outlet, NavLink } from "react-router";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { appTheme } from "./appTheme";

import appLogoUrl from "../assets/logo.svg";
import testPhoto from "../assets/test-photo.jpg";

const NAV_ITEMS = [
  { to: "/app/offices", label: "Offices" },
  { to: "/app/bookings", label: "Bookings" },
  { to: "/app/users", label: "Users" },
  { to: "/app/payments", label: "Payments" },
];

export const AppLayout = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <NavLink to="/app" end style={{ display: "inline-flex" }}>
                <Box
                  component="img"
                  src={appLogoUrl}
                  alt="logo"
                  sx={{ width: 40, height: 40, borderRadius: 999 }}
                />
              </NavLink>

              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Button
                      variant="text"
                      sx={{
                        color: isActive ? "text.primary" : "text.secondary",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {item.label}
                    </Button>
                  )}
                </NavLink>
              ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar
                src={testPhoto}
                alt="User avatar"
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #cfcfcf",
                  bgcolor: "#fff",
                }}
              />
              <Typography>Name Surname</Typography>
              <Button variant="outlined">Log Out</Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ px: "18px", py: "16px" }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
