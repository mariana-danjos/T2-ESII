import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#7b1fa2" },
    secondary: { main: "#ec407a" },
    background: { default: "#faf7fb" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { variant: "contained" }, styleOverrides: { root: { textTransform: "none" } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});
