import axiosClient from "./axiosClient";

export const AdminAPI = {
  getAllUsers: async () => {
    const res = await axiosClient.get("/api/admin/users");
    return res.data;
  },

  getUserActivity: async (userId: string) => {
    const res = await axiosClient.get(`/api/admin/users/${userId}/activity`);
    return res.data;
  },
};