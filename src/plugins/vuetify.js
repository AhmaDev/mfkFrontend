// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { VDataTable } from "vuetify/labs/VDataTable";
import { ar } from "vuetify/locale";
// Vuetify
import { createVuetify, ThemeDefinition } from "vuetify";

const lightTheme = {
  dark: true,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    primary: "#0081EA",
    secondary: "#C66BD2",
    error: "#DF1D41",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};

export default createVuetify({
  locale: {
    locale: "ar",
    fallback: "ar",
    messages: { ar },
  },
  theme: {
    defaultTheme: "lightTheme",
    themes: {
      lightTheme,
    },
  },
  components: {
    VDataTable,
  },
});
