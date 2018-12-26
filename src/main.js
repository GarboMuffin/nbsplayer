import Vue from "vue";
import App from "./App.vue";
import { FontAwesomeIcon } from "./components/FontAwesomeIcon";

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;
Vue.config.performance = process.env.NODE_ENV !== "production";

new Vue({
  render: (h) => h(App),
}).$mount("#app");
