import { createApp } from "vue";
import "./main.css";
import App from "./App.vue";
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/iconfont';
import SvgIcon from './components/SvgIcon/index.vue'
const app = createApp(App);
app.component('SvgIcon', SvgIcon)
app.mount("#app");