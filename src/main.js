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
import * as moment from "moment";

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
app.config.globalProperties.$fixMenu = function (e) {
  if (e) {
    setTimeout(() => {
      var menus = document.querySelectorAll(
        ".v-overlay-container .v-overlay .v-overlay__content",
      );

      if (menus) {
        menus.forEach((menu) => {
          if (!menu.style.left.startsWith("-")) return;
          const right = menu.style.right;
          const left = menu.style.left;
          menu.style.left = right;
          menu.style.right = left.replace("-", "");
        });
      }
    }, 1);
  }
};
app.config.globalProperties.$formatDate = function (date, time = false) {
  if (time) {
    return moment(date).format("YYYY-MM-DD , hh:mm:ss A");
  } else {
    return moment(date).format("YYYY-MM-DD");
  }
};
app.config.globalProperties.$diffDays = function (date1, date2) {
  let x = moment(date1);
  let y = moment(date2);
  return y.diff(x, "days");
};
app.component("VueDatePicker", VueDatePicker);
app.mount("#app");
