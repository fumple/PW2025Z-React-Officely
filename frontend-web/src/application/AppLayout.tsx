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

import { clearToken } from "../api/http";
import { useNavigate } from "react-router";
import { getMe, updateMe, type UpdateMeInput } from "../api/usersApi";
import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import OutlinedInput from "@mui/material/OutlinedInput";
import CircularProgress from "@mui/material/CircularProgress";

import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";

const NAV_ITEMS = [
  { to: "/app/offices", label: "Offices" },
  { to: "/app/bookings", label: "Bookings" },
  { to: "/app/users", label: "Users" },
  { to: "/app/payments", label: "Payments" },
];

export const AppLayout = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const onLogout = () => {
    clearToken();
    navigate("/", { replace: true });
  };
  const [me, setMe] = useState<import("../api/usersApi").UserResource | null>(
    null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const loadMe = async () => {
    const res = await getMe();
    if (!res.ok) return;

    setMe(res.data);

    const e = res.data.email?.trim().toLowerCase() ?? "";
    if (!e) return;

    const data = new TextEncoder().encode(e);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashHex = [...new Uint8Array(hashBuffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const url = `https://gravatar.com/avatar/${hashHex}?s=80&d=identicon&r=g`;
    setAvatarUrl(url);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadMe();
    })();

    return () => {
      alive = false;
    };
  }, []);

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
                src={avatarUrl}
                alt="User avatar"
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #cfcfcf",
                  bgcolor: "#fff",
                }}
              />
              <Typography>
                {me ? `${me.firstName} ${me.lastName}` : "Loading..."}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tooltip title="Edit profile">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (!me) return;
                      setEditError(null);

                      setFirstName(me.firstName ?? "");
                      setLastName(me.lastName ?? "");
                      setEmail(me.email ?? "");
                      setNationality(me.nationality ?? "");
                      setPhoneNumber(me.phoneNumber ?? "");

                      setEditOpen(true);
                    }}
                    disabled={!me}
                    sx={{
                      width: 34,
                      height: 34,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Log out">
                  <IconButton
                    size="small"
                    onClick={onLogout}
                    sx={{
                      width: 34,
                      height: 34,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ px: "18px", py: "16px" }}>
          <Outlet />
        </Box>

        <Dialog
          open={editOpen}
          onClose={() => {
            if (saving) return;
            setEditOpen(false);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit profile</DialogTitle>

          <DialogContent>
            {editError ? (
              <Typography color="error" sx={{ mb: "10px" }}>
                {editError}
              </Typography>
            ) : null}

            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <OutlinedInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                disabled={saving}
              />
              <OutlinedInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                disabled={saving}
              />
              <OutlinedInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={saving}
              />
              <OutlinedInput
                value={nationality}
                onChange={(e) => setNationality(e.target.value.toUpperCase())}
                placeholder="Nationality (e.g. PL)"
                disabled={saving}
              />
              <OutlinedInput
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number (e.g. +48123456789)"
                disabled={saving}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: "16px", pb: "12px" }}>
            <Button
              variant="contained"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setEditError(null);

                const payload: UpdateMeInput = {
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  email: email.trim(),
                  nationality: nationality.trim(),
                  phoneNumber: phoneNumber.trim(),
                };

                Object.keys(payload).forEach((k) => {
                  const key = k as keyof typeof payload;
                  if (payload[key] === "") delete payload[key];
                });

                const res = await updateMe(payload);

                if (!res.ok) {
                  setEditError(
                    res.error?.errors?.[0]?.message ??
                      "Failed to update profile.",
                  );
                  setSaving(false);
                  return;
                }

                await loadMe();
                setEditOpen(false);
                setSaving(false);
              }}
            >
              {saving ? (
                <Box
                  sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                >
                  <CircularProgress size={16} /> Saving...
                </Box>
              ) : (
                "Save"
              )}
            </Button>

            <Button
              variant="text"
              color="error"
              disabled={saving}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};
