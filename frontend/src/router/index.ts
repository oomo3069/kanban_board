import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.vue";
import ResetPasswordPage from "../pages/ResetPasswordPage.vue";

import DashboardPage from "../pages/DashboardPages.vue"
import BoardDetailPage from "../pages/BoardDetailPage.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/forgot-password", component: ForgotPasswordPage },
  { path: "/reset-password/:token", component: ResetPasswordPage },
  
  { path: "/dashboard", component: DashboardPage },
  { path: "/boards/:id", component: BoardDetailPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
