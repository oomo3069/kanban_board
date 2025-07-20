<template>
  
  <div class="containerlogin">
  <div class="login-form">
    <h2>FORGOT PASSWORD</h2>
    <form @submit.prevent="submit">
      <h3>EMAIL</h3>
      <input v-model="email" placeholder="" />
      <button type="submit">SEND</button>
    </form>
    <router-link to="/register" class="suplogin">register</router-link>
    <router-link to="/login" class="suplogin">login</router-link>
  </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/login.css";
import { ref } from "vue";
import { forgotPassword } from "../services/auth"; // ✅ import service

const email = ref("");

const submit = async () => {
  try {
    await forgotPassword({ email: email.value }); // ✅ เรียก service ที่ถูกต้อง
    alert("ส่งลิงก์ไปยังอีเมลแล้ว");
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};
</script>
