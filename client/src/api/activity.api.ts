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

export const ActivityAPI = {
  getAll: async (): Promise<ActivityRecord[]> => {
    const res = await axiosClient.get("/api/activity");
    return res.data.activities;
  }
};