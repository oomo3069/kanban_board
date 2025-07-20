<template>
  <div class="containerlogin">
    <div class="login-form">
      <h2>RESET PASSWORD</h2>
      <form @submit.prevent="submit">
        <h3>PASSWORD</h3>
        <input v-model="password" type="password" placeholder="" />
        <h3>CONFIRM PASSWORD</h3>
        <input v-model="confirmPassword" type="password" placeholder="" />
        <button type="submit">RESET</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/login.css";
import { resetPassword } from "../services/auth"; // ใช้ service ที่สร้างไว้
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const password = ref("");
const confirmPassword = ref("");
const route = useRoute();
const router = useRouter();

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    return;
  }
  try {
    await resetPassword(route.params.token as string, password.value); // ใช้ service
    alert("รีเซ็ตสำเร็จ");
    router.push("/login");
  } catch (err: any) {
    alert("Token ไม่ถูกต้องหรือหมดอายุ");
  }
};
</script>