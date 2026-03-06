import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { setupStore } from "@/store";
import { setupDirective } from "@/directive";
import { setupElIcons, setupI18n, setupPermission } from "@/plugins";
import print from "vue3-print-nb";

import { NotificationPlugin } from "@/plugins/notificationService"; // 引入通知服务
// 本地SVG图标
import "virtual:svg-icons-register";

// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";

//wflow样式文件
// import "./assets/theme.css";
import "./assets/global.css";
import { Icon } from "@iconify/vue";

if (typeof global === "undefined") {
  (window as any).global = window;
}

const app = createApp(App);
// 全局注册 自定义指令(directive)
setupDirective(app);
// 全局注册 状态管理(store)
setupStore(app);
// 全局注册Element-plus图标
setupElIcons(app);
// 国际化
setupI18n(app);
// 注册动态路由
setupPermission();
app.use(router);
// 通知服务
app.use(NotificationPlugin);
// 打印
app.use(print);
app.mount("#app");
app.component("Iconify", Icon);
