import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import axios from "axios";
import VueAxios from "vue-axios";
import "line-awesome/dist/line-awesome/css/line-awesome.css";
import Notifications from "@kyvg/vue3-notification";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
import store from "./store";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import print from "vue3-print-nb";

loadFonts();

axios.defaults.baseURL = "https://api.mfk-albina.com/api/";

const app = createApp(App).use(store);
app.use(router);
app.use(ToastPlugin, {
  position: "bottom",
});
app.use(vuetify);
app.use(print);
app.use(Notifications);
app.use(VueAxios, axios);

app.component("VueDatePicker", VueDatePicker);
app.mount("#app");
