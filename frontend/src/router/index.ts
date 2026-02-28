import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.vue";
import ResetPasswordPage from "../pages/ResetPasswordPage.vue";

import DashboardPage from "../pages/DashboardPages.vue";
import BoardDetailPage from "../pages/BoardDetailPage.vue";

const routes = [
  { path: "/", redirect: "/login" },

  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/forgot-password", component: ForgotPasswordPage },
  { path: "/reset-password/:token", component: ResetPasswordPage },

  {
    path: "/dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/boards/:id",
    component: BoardDetailPage,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (token && to.path === "/login") {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;