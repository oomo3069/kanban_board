<template>
  <div class="dashboard-container">
    <div class="flexb">
      <div>
        <h2>NAME : {{ user?.name }} ID : {{ user?.invite_code }}</h2>
      </div>
      <div>
        <button @click="showModal = true">+</button>
        <!-- ปุ่ม Notification -->
        <button class="noti-btn" @click="toggleNotiPanel">🔔</button>
      </div>
    </div>
    <button @click="logout"><p>LOGOUT</p></button>

    <!-- Grid -->
    <div class="board-grid">
      <router-link
        v-for="board in boards"
        :key="board.id"
        :to="`/boards/${board.id}`"
        class="board-card"
        tag="div"
      >
        <h3>{{ board.name }}</h3>
        <p>{{ board.description }}</p>
        <div v-if="board.owner_id === user.id" class="board-actions">
          <button @click.stop="startEditBoard(board)">EDIT</button>
          <button @click.stop="deleteBoard(board.id)">DELETE</button>
        </div>
      </router-link>
    </div>

    <!-- Modal สร้างบอร์ด -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>BOARD</h3>
        <input v-model="newBoard.name" placeholder="BOARD NAME" />
        <textarea v-model="newBoard.description" placeholder="DESCRIPTION" />
        <button @click="createBoard">BUILD</button>
        <button @click="showModal = false">CANCEL</button>
      </div>
    </div>
  </div>
  <!-- Modal แก้ไข -->
  <div v-if="editBoard" class="modal">
    <div class="modal-content">
      <h3>EDIT</h3>
      <input v-model="editBoard.name" placeholder="BOARD" />
      <textarea v-model="editBoard.description" placeholder="DESCRIPTION" />
      <button @click="updateBoard">APPLY</button>
      <button @click="editBoard = null">CANCEL</button>
    </div>
  </div>
  <!-- Panel -->
  <div v-if="showNotiPanel" class="noti-panel">
    <div class="noti-header">
      <h3>NOTIFICATION</h3>
      <button @click="toggleNotiPanel">❌</button>
    </div>
<ul>
  <li v-for="noti in notifications" :key="noti.id">
    <div>
      {{ noti.message }}
      <template v-if="noti.type === 'invite'">
        <button @click="acceptInvite(noti.id)">✅</button>
        <button @click="rejectInvite(noti.id)">❌</button>
      </template>
    </div>
  </li>
</ul>

  </div>
</template>

<script setup lang="ts">
import "../assets/dashboard.css";
import { onMounted, ref } from "vue";
import axios from "../utils/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();

const user = ref<any>(null);
const boards = ref<any[]>([]);
const newBoard = ref({ name: "", description: "" });
const showModal = ref(false);

const logout = () => {
  auth.logout();
  router.push("/login");
};

const fetchBoards = async () => {
  const profile = await axios.get("/customers/profile");
  user.value = profile.data.customer;

  const owned = await axios.get("/boards/my");
  const member = await axios.get("/boards/member");

  // ตัด member ที่ตัวเองเป็น owner ทิ้ง
  const memberOnly = member.data.boards.filter((b: any) => b.owner_id !== user.value.id);

  boards.value = [...owned.data.boards, ...memberOnly];
};

const createBoard = async () => {
  await axios.post("/boards", newBoard.value);
  await fetchBoards();
  showModal.value = false;
};
const editBoard = ref<any>(null);

const startEditBoard = (board: any) => {
  editBoard.value = { ...board }; // clone ข้อมูลก่อน
};

const updateBoard = async () => {
  await axios.put(`/boards/${editBoard.value.id}`, {
    name: editBoard.value.name,
    description: editBoard.value.description,
  });
  await fetchBoards();
  editBoard.value = null;
};

const deleteBoard = async (id: number) => {
  if (confirm("คุณแน่ใจว่าจะลบบอร์ดนี้หรือไม่?")) {
    await axios.delete(`/boards/${id}`);
    await fetchBoards();
  }
};
const notifications = ref<any[]>([]);
const showNotiPanel = ref(false);

const toggleNotiPanel = async () => {
  showNotiPanel.value = !showNotiPanel.value;
  if (showNotiPanel.value) {
    const res = await axios.get("/notifications");
    notifications.value = res.data.notifications;
  }
};

const markAsRead = async (id: number) => {
  await axios.put(`/notifications/${id}/read`);
  notifications.value = notifications.value.filter((n) => n.id !== id);
};
const acceptInvite = async (id: number) => {
  try {
    await axios.post(`/invite/accept/${id}`);
    alert("✅ เข้าร่วมบอร์ดแล้ว");
    notifications.value = notifications.value.filter((n) => n.id !== id);
    await fetchBoards(); // อัปเดตบอร์ดที่เข้าร่วม
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};

const rejectInvite = async (id: number) => {
  try {
    await axios.delete(`/invite/reject/${id}`);
    alert("❌ ปฏิเสธคำเชิญแล้ว");
    notifications.value = notifications.value.filter((n) => n.id !== id);
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};
onMounted(() => {
  fetchBoards();
});
</script>
<style scoped>
.noti-btn {
  font-size: 30px;
}
</style>
