import { createTheme } from "@mui/material/styles";

export const authTheme = createTheme({
  palette: {
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#111",
      secondary: "#555",
    },
  },

  shape: {
    borderRadius: 6,
  },

  typography: {
    subtitle1: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111",
    },
    body2: {
      fontSize: "14px",
      color: "#555",
    },
  },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "13px",
          padding: "6px 14px",
          borderRadius: "6px",
        },
        contained: {
          backgroundColor: "#2b2b2b",
          color: "#efefef",
          "&:hover": { backgroundColor: "#1f1f1f" },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "11px",
          color: "#666",
          marginTop: "6px",
          marginBottom: "6px",
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          display: "block",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
          marginTop: "6px",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "11px",
          color: "#666",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: "26px",
          fontSize: "12px",
          borderRadius: "4px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d9d9d9",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d9d9d9",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9a9a9a",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d9534f",
          },
        },
        input: {
          padding: "0 8px",
          height: "26px",
          boxSizing: "border-box",
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: "4px 0 2px 0",
          fontSize: "11px",
          color: "#d9534f",
        },
      },
    },
  },
});
