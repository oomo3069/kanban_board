// src/store/auth.ts
import { defineStore } from "pinia";
import axios from "axios";
import * as authService from "../services/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null as any,
  }),

  actions: {
    async login(form: any) {
      const res = await authService.login(form);
      this.token = res.data.token;
      localStorage.setItem("token", res.data.token);
      await this.getProfile();
    },

    async register(form: any) {
      await authService.register(form);
    },

    async getProfile() {
      if (!this.token) return;
      const res = await axios.get("/api/customers/profile", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      this.user = res.data.customer;
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
    },
  },
});
