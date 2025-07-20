<template>
  <div class="containerlogin">
  <div class="regis-form">
    <h2>REGISTER</h2>
    <form @submit.prevent="submit">
      <h3>NAME</h3>
      <input v-model="form.name" placeholder="" />
      <h3>EMAIL</h3>
      <input v-model="form.email" placeholder="" />
      <h3>PHONE</h3>
      <input v-model="form.phone_number" placeholder="" />
      <h3>PASSWORD</h3>
      <input v-model="form.password" type="password" placeholder="" />
      <h3>CONFIRM PASSWORD</h3>
      <input v-model="form.confirmPassword" type="password" placeholder="" />
      <button type="submit">REGISTER</button>
    </form>
  </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/login.css";
import { reactive } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const form = reactive({
  name: "",
  email: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
});

const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
  try {
    await auth.register(form);
    alert("สมัครสำเร็จ");
    router.push("/login");
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};
</script>
