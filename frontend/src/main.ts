// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import './assets/style.css';

import axios from 'axios';
import { useAuthStore } from './store/auth'; // 👈 สำคัญมาก

const app = createApp(App);

const pinia = createPinia();
app.use(pinia); // 👈 ต้องใช้ก่อนจะใช้ store ใด ๆ
app.use(router);

// ✅ ใส่ interceptor หลังจากสร้าง pinia แล้ว
axios.interceptors.request.use((config) => {
  const auth = useAuthStore(); // ดึง store
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`; // แนบ token ไปทุก request
  }
  return config;
});

app.mount('#app');
