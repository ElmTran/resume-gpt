// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia"; // 导入 Pinia
import App from "./App.vue";
import router from "./router"; // 导入路由
import "./style.css";

const app = createApp(App);
const pinia = createPinia(); // 创建 Pinia 实例

app.use(pinia); // 注册 Pinia
app.use(router); // 注册路由
app.mount("#app");
