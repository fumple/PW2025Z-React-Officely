import { Outlet, NavLink, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";

import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";

import { appTheme } from "./appTheme";
import appLogoUrl from "../assets/logo.svg";

import { clearToken } from "../api/http";
import { getMe, updateMe, type UpdateMeInput } from "../api/usersApi";

const NAV_ITEMS = [
  { to: "/app/offices", label: "Offices" },
  { to: "/app/bookings", label: "Bookings" },
];

type FieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "nationality" | "phoneNumber",
    string
  >
>;

const PHONE_PL_REGEX = /^\+48\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NATIONALITY_REGEX = /^[A-Z]{2}$/;
const NO_DIGITS_REGEX = /^(?!.*\d).*$/;

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

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  const validateAll = (): FieldErrors => {
    const errs: FieldErrors = {};

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const nat = nationality.trim();
    const ph = phoneNumber.trim();

    // Validate only if non-empty (because you also allow skipping fields)
    if (fn && !NO_DIGITS_REGEX.test(fn))
      errs.firstName = "First name cannot contain numbers.";
    if (ln && !NO_DIGITS_REGEX.test(ln))
      errs.lastName = "Last name cannot contain numbers.";

    if (em && !EMAIL_REGEX.test(em))
      errs.email = "Email must be a valid address (e.g. name@mail.com).";

    if (nat && !NATIONALITY_REGEX.test(nat))
      errs.nationality = "Nationality must be 2 letters (e.g. PL).";

    if (ph && !PHONE_PL_REGEX.test(ph))
      errs.phoneNumber =
        "Phone must match +48 and 9 digits (e.g. +48111222333).";

    return errs;
  };

  const hasErrors = useMemo(
    () => Object.keys(fieldErrors).length > 0,
    [fieldErrors],
  );

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
                      setFieldErrors({});

                      setFirstName(me.firstName ?? "");
                      setLastName(me.lastName ?? "");
                      setEmail(me.email ?? "");
                      setNationality((me.nationality ?? "").toUpperCase());
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
          PaperProps={{
            sx: {
              borderRadius: "14px",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Edit profile</DialogTitle>
          <Divider />

          <DialogContent sx={{ pt: 2.5 }}>
            {editError ? (
              <Typography color="error" sx={{ mb: 1.5, fontSize: 13 }}>
                {editError}
              </Typography>
            ) : null}

            {/* Nice layout: name row (2 cols), then singles */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFieldErrors((p) => ({ ...p, firstName: undefined }));
                }}
                onBlur={() => setFieldErrors(validateAll())}
                disabled={saving}
                size="small"
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName ?? " "}
              />

              <TextField
                label="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setFieldErrors((p) => ({ ...p, lastName: undefined }));
                }}
                onBlur={() => setFieldErrors(validateAll())}
                disabled={saving}
                size="small"
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName ?? " "}
              />
            </Box>

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}
            >
              <TextField
                label="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                onBlur={() => setFieldErrors(validateAll())}
                disabled={saving}
                size="small"
                error={!!fieldErrors.email}
                helperText={fieldErrors.email ?? " "}
              />

              <TextField
                label="Nationality"
                value={nationality}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  setNationality(v);
                  setFieldErrors((p) => ({ ...p, nationality: undefined }));
                }}
                onBlur={() => setFieldErrors(validateAll())}
                disabled={saving}
                size="small"
                inputProps={{ maxLength: 2 }}
                error={!!fieldErrors.nationality}
                helperText={
                  fieldErrors.nationality ?? "2-letter code (e.g. PL) "
                }
              />

              <TextField
                label="Phone number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setFieldErrors((p) => ({ ...p, phoneNumber: undefined }));
                }}
                onBlur={() => setFieldErrors(validateAll())}
                disabled={saving}
                size="small"
                placeholder="+48111222333"
                error={!!fieldErrors.phoneNumber}
                helperText={fieldErrors.phoneNumber ?? "Format: +48 + 9 digits"}
              />
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              disableElevation
              disabled={saving || hasErrors}
              onClick={async () => {
                const errs = validateAll();
                setFieldErrors(errs);
                if (Object.keys(errs).length > 0) return;

                setSaving(true);
                setEditError(null);

                const payload: UpdateMeInput = {
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  email: email.trim(),
                  nationality: nationality.trim(),
                  phoneNumber: phoneNumber.trim(),
                };

                // remove empty strings so backend won't overwrite with ""
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
              sx={{ minWidth: 110, borderRadius: "10px" }}
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
              sx={{ borderRadius: "10px" }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};
