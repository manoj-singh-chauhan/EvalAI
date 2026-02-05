import axiosClient from "./axiosClient";

export interface ActivityRecord {
  id: string;
  type: 'SUBMISSION' | 'EVALUATION' | 'PAYMENT' | 'SYSTEM';
  status: 'success' | 'failed' | 'processing' | 'info';
  title: string;
  description: string;
  linkId?: string;
  createdAt: string;
}

// export const ActivityAPI = {
//   getAll: async (): Promise<ActivityRecord[]> => {
//     const res = await axiosClient.get("/api/activity");
//     return res.data.activities;
//   }
// };

// activity.api.ts
export const ActivityAPI = {
  getAll: async (page: number = 1): Promise<{ activities: ActivityRecord[], totalPages: number }> => {
    const res = await axiosClient.get(`/api/activity?page=${page}&limit=5`);
    return res.data;
  }
};