import axiosClient from "./axiosClient";

export const BillingAPI = {
  getMyPlan: async () => {
    const res = await axiosClient.get("/api/billing/me");
    return res.data; 
  },

  createOrder: async (planCode: string) => {
    const res = await axiosClient.post("/api/billing/create-order", { planCode });
    return res.data; 
  },

  verifyPayment: async (data: Record<string, unknown>) => {
    const res = await axiosClient.post("/api/billing/verify", data);
    return res.data;
  },
};