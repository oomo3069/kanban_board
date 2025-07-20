<template>
  <div class="board-detail">
    <!-- Left Content -->
    <div class="board-main">
      <h2>TASKS IN BOARD</h2>
      <div class="headdt">
        <router-link to="/dashboard" class="bttf">← BACK</router-link>
        <button @click="showModal = true">ADD TASK</button>
      </div>
<draggable
  v-model="tasks"
  group="tasks"
  item-key="id"
  class="task-grid"
  ghost-class="ghost"
  drag-class="drag"
  :animation="300"
>
  <template #item="{ element: task }">
    <div class="task-card">
      <h3>{{ task.name }}</h3>
      <p>{{ task.description }}</p>

      <!-- Tags -->
      <div class="tags">
        <span v-for="tag in task.tags" :key="tag.id" class="tag">
          {{ tag.text }}
          <button @click="deleteTag(tag.id)">X</button>
        </span>
      </div>

      <!-- Add tag input -->
      <input v-model="newTags[task.id]" placeholder="Tag" />
      <button @click="createTag(task.id)">+</button>

      <!-- Action buttons -->
      <div id="o1">
        <button @click="editTask(task)">Edit</button>
        <button @click="deleteTask(task.id)">Delete</button>
      </div>
    </div>
  </template>
</draggable>

      <!-- Modal for new task -->
      <div class="modal" v-if="showModal">
        <div class="modal-content">
          <h3>ADD TASK</h3>
          <input v-model="newTask.name" placeholder="TASK NAME" />
          <textarea v-model="newTask.description" placeholder="TASK DESCRIPTION"></textarea>
          <button @click="createTask">ADD</button>
          <button @click="showModal = false">CANCEL</button>
        </div>
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="board-sidebar">
      <h3>MEMBER</h3>
      <ul>
        <li v-for="member in members" :key="member.id">{{ member.name }}</li>
      </ul>
      
      <input v-model="inviteCode" placeholder="INVITE / ASSIGN" />
      <div class="IAL">
      <button @click="sendInvite">INVITE</button>
      <button @click="assignTask">ASSIGN</button>
      <button v-if="!isOwner" @click="leaveBoard">LEAVE BOARD</button>
        </div>
    </div>
  </div>

  <!-- Modal for editing -->
  <div class="modal" v-if="editModal">
    <div class="modal-content">
      <h3>EDIT TASK</h3>
      <input v-model="taskBeingEdited.name" placeholder="ชื่อ Task" />
      <textarea
        v-model="taskBeingEdited.description"
        placeholder="คำอธิบาย Task"
      ></textarea>
      <button @click="updateTask">APPLY</button>
      <button @click="editModal = false">CANCEL</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import "../assets/BoardDetail.css";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../utils/axios";

const route = useRoute();
const router = useRouter();
const boardId = route.params.id;

const tasks = ref<any[]>([]);
const members = ref<any[]>([]);
const isOwner = ref(false);
const showModal = ref(false);
const inviteCode = ref("");
const newTask = ref({ name: "", description: "" });

const editModal = ref(false);
const taskBeingEdited = ref<any>(null);
const newTags = ref<{ [key: number]: string }>({});

const fetchData = async () => {
  const boardRes = await axios.get(`/boards/${boardId}`);
  isOwner.value = boardRes.data.board.owner_id === localStorage.getItem("user_id");

  const taskRes = await axios.get(`/tasks/board/${boardId}`);
  tasks.value = taskRes.data.tasks;

  const memberRes = await axios.get(`/boards/${boardId}/members`);
  members.value = memberRes.data.members;

  tasks.value.forEach((task) => {
    newTags.value[task.id] = "";
  });
};

const createTask = async () => {
  await axios.post("/tasks", { ...newTask.value, board_id: boardId });
  showModal.value = false;
  await fetchData();
};

const editTask = (task: any) => {
  taskBeingEdited.value = { ...task };
  editModal.value = true;
};

const updateTask = async () => {
  await axios.put(`/tasks/${taskBeingEdited.value.id}`, {
    name: taskBeingEdited.value.name,
    description: taskBeingEdited.value.description,
  });
  editModal.value = false;
  await fetchData();
};

const deleteTask = async (id: number) => {
  await axios.delete(`/tasks/${id}`);
  await fetchData();
};

const createTag = async (taskId: number) => {
  const text = newTags.value[taskId]?.trim();
  if (!text) return;
  await axios.post("/tags", { task_id: taskId, text });
  newTags.value[taskId] = "";
  await fetchData();
};

const deleteTag = async (tagId: number) => {
  await axios.delete(`/tags/${tagId}`);
  await fetchData();
};

const sendInvite = async () => {
  try {
    await axios.post("/invite", {
      board_id: boardId,
      invite_code: inviteCode.value,
    });
    alert("📨 ส่งคำเชิญแล้ว");
  } catch (err: any) {
    alert(err.response?.data?.error || "❌ ส่งคำเชิญล้มเหลว");
  }
};

const assignTask = async () => {
  try {
    const latestTask = tasks.value[tasks.value.length - 1];
    await axios.post("/assign", {
      task_id: latestTask.id,
      member_id: parseInt(inviteCode.value),
    });
    alert("✅ มอบหมาย Task สำเร็จ");
    await fetchData();
  } catch (err: any) {
    alert(err.response?.data?.error || "❌ มอบหมายไม่สำเร็จ");
  }
};

const leaveBoard = async () => {
  try {
    await axios.put(`/boards/leave/${boardId}`);
    alert("🚪 ออกจากบอร์ดแล้ว");
    router.push("/dashboard");
  } catch (err: any) {
    alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
};

onMounted(fetchData);
</script>
