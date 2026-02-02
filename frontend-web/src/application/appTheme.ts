import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#1a73e8", // link-like actions
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#111",
      secondary: "#444",
    },
    divider: "#e6e6e6",
  },

  shape: {
    borderRadius: 6,
  },

  typography: {
    fontFamily: `"Segoe UI", Roboto, Arial, sans-serif`,
    body1: { fontSize: "14px", color: "#111" },
    body2: { fontSize: "14px", color: "#444" },

    // use for page titles instead of sx
    h5: { fontSize: "22px", fontWeight: 600, color: "#111" },

    // small label-ish text
    subtitle2: { fontSize: "13px", fontWeight: 600, color: "#111" },
    caption: { fontSize: "12px", color: "#666" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
        },
        // helps layout consistency
        "*, *::before, *::after": {
          boxSizing: "border-box",
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        position: "static",
      },
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          color: "#111",
          borderBottom: "1px solid #e6e6e6",
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "56px",
          paddingLeft: "18px",
          paddingRight: "18px",
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: "6px" },

        contained: {
          height: "30px",
          padding: "0 12px",
          backgroundColor: "#2b2b2b",
          color: "#fff",
          fontSize: "12px",
          "&:hover": { backgroundColor: "#1f1f1f" },
        },

        outlined: {
          height: "30px",
          padding: "0 12px",
          borderColor: "#888",
          backgroundColor: "#efefef",
          color: "#111",
          fontSize: "12px",
          "&:hover": { backgroundColor: "#e6e6e6", borderColor: "#888" },
        },
      },

      // make "Details / Edit" links consistent without per-cell sx
      variants: [
        {
          props: { variant: "text", color: "primary" },
          style: {
            minWidth: 0,
            padding: 0,
            fontSize: "12px",
            "&:hover": {
              textDecoration: "underline",
              backgroundColor: "transparent",
            },
          },
        },
      ],
    },

    // make inputs non-transparent everywhere
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          "&:hover": { backgroundColor: "#fff" },
          "&.Mui-focused": { backgroundColor: "#fff" },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "12px",
          color: "#444",
          marginBottom: "4px",
        },
      },
    },

    // DataGrid: let the *wrapper card* control background/radius,
    // and bake in the padding you keep repeating.
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          background: "transparent",
          // your repeated padding:
          "--DataGrid-cellPaddingInline": "8px",
          "& .MuiDataGrid-columnHeaders": {
            paddingLeft: "8px",
            paddingRight: "8px",
          },
          "& .MuiDataGrid-cell": {
            paddingLeft: "8px",
            paddingRight: "8px",
          },
        },

        columnHeaders: {
          borderBottom: "1px solid #d9d9d9",
          background: "#fff",
        },
        columnHeaderTitle: {
          fontSize: "13px",
          fontWeight: 500,
          color: "#333",
        },
        cell: {
          fontSize: "12px",
          color: "#333",
          borderBottom: "1px solid #efefef",
          background: "#fff",
        },
        row: {
          "&:hover": { backgroundColor: "#fafafa" },
        },
        footerContainer: {
          borderTop: "1px solid #d9d9d9",
          background: "#fff",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
        },
      },
      variants: [
        {
          props: { variant: "card" },
          style: {
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "12px",
          },
        },
      ],
    },
  },
});
