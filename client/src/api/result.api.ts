import axiosClient from "./axiosClient";

export const ResultAPI = {
  getResults: async (paperId: string) => {
    const res = await axiosClient.get(`/api/results/${paperId}`);
    return res.data;
  },

  getQuestionPaper: async (paperId: string) => {
    const res = await axiosClient.get(`/api/results/${paperId}/question-paper`);
    return res.data;
  },

  getAnswerSheet: async (answerId: string) => {
    const res = await axiosClient.get(`/api/results/sheet/${answerId}`);
    return res.data;
  },

  retryAnswer: async (answerId: string) => {
    const res = await axiosClient.post(`/api/answers/${answerId}/retry`);
    return res.data;
  },
};
