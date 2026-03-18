// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5555', // เปลี่ยนเป็น URL ของ backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
