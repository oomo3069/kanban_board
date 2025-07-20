import axios from "../utils/axios";

export const assignTask = async (data: { task_id: number; member_id: number }) => {
  const res = await axios.post("/assign", data);
  return res.data;
};
