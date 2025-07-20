import axios from "../utils/axios";

export const getNotifications = async () => {
  const res = await axios.get("/notifications");
  return res.data.notifications;
};

export const markNotificationAsRead = async (id: number) => {
  const res = await axios.put(`/notifications/${id}/read`);
  return res.data;
};
