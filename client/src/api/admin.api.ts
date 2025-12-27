import axiosClient from "./axiosClient";

export const AdminAPI = {
  getAllUsers: async () => {
    const res = await axiosClient.get("/api/admin/users");
    return res.data;
  },

  searchUsers: async (search: string, role = "all", status = "all") => {
    const res = await axiosClient.get("/api/admin/users/search", {
      params: { search, role, status },
    });
    return res.data;
  },

  getUserActivity: async (
    userId: string,
    page: number = 1,
    limit: number = 8
  ) => {
    const res = await axiosClient.get(
      `/api/admin/users/${userId}/activity`,
      { params: { page, limit } }
    );
    return res.data;
  },
};
