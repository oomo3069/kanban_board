import axios from "../utils/axios";

export const getTasksByBoard = async (boardId: number) => {
  const res = await axios.get(`/tasks/board/${boardId}`);
  return res.data.tasks;
};

export const createTask = async (data: { board_id: number; name: string }) => {
  const res = await axios.post("/tasks", data);
  return res.data;
};

export const updateTask = async (id: number, data: { name: string }) => {
  const res = await axios.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id: number) => {
  const res = await axios.delete(`/tasks/${id}`);
  return res.data;
};
