import { Outlet } from "react-router";

import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";

import { authTheme } from "./authTheme";

export const AuthLayout = () => {
  return (
    <ThemeProvider theme={authTheme}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </ThemeProvider>
  );
};
