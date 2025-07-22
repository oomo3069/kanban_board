<template>
  <div class="containerlogin">
  <p class="alert">*หมายเหตุ การLoginครั้งเเรกอาจใช้เวลานาน โปรดสักครู่หรือรีเว็บเเล้วกดใหม่</p>
  <div class="login-form">
    <h2>LOGIN</h2>
    <form @submit.prevent="submit">
      <h3>EMAIL</h3>
      <input v-model="email" placeholder="" />
      <h3>PASSWORD</h3>
      <input v-model="password" type="password" placeholder="" />
      
      <button type="submit">LOGIN</button>
    </form>
    
    <router-link to="/register" class="suplogin">register</router-link>
    <router-link to="/forgot-password" class="suplogin">forgot-password</router-link>
  
  </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/login.css";
import { ref } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    router.push("/dashboard");
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};
</script>
<style scoped>
  .alert{
    color: red;
  }
</style>

