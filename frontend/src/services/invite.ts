import axios from "../utils/axios";

export const inviteToBoard = async (data: { board_id: number; invite_code: string }) => {
  const res = await axios.post("/invite", data);
  return res.data;
};

export const acceptInvite = async (notification_id: number) => {
  const res = await axios.post(`/invite/accept/${notification_id}`);
  return res.data;
};

export const rejectInvite = async (notification_id: number) => {
  const res = await axios.post(`/invite/reject/${notification_id}`);
  return res.data;
};
