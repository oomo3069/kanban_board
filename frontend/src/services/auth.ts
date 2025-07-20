// src/services/auth.ts
import axios from "../utils/axios"; // เปลี่ยนจาก "axios" เป็น "../utils/axios"
import type { LoginPayload, RegisterPayload } from "../types/auth";

export const login = (data: LoginPayload) => axios.post("/customers/login", data);
export const register = (data: RegisterPayload) => axios.post("/customers/register", data);

export const forgotPassword = (data: any) => axios.post("/customers/forgot-password", data);
export const resetPassword = (token: string, password: string) =>
axios.put(`/customers/reset-password/${token}`, { password });
