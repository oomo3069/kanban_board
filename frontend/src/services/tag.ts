import axios from "../utils/axios";

export const getTagsByTask = async (taskId: number) => {
  const res = await axios.get(`/tags/${taskId}`);
  return res.data.tags;
};

export const createTag = async (data: { task_id: number; name: string }) => {
  const res = await axios.post("/tags", data);
  return res.data;
};

export const deleteTag = async (id: number) => {
  const res = await axios.delete(`/tags/${id}`);
  return res.data;
};
