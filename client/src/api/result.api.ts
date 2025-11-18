import axiosClient from "./axiosClient";

export const ResultAPI = {
  getResults: async (paperId: number) => {
    const res = await axiosClient.get(`/results/${paperId}`);
    return res.data;
  },

  getQuestionPaper: async (paperId: number) => {
    const res = await axiosClient.get(`/results/${paperId}/question-paper`);
    return res.data;
  },

  getAnswerSheet: async (answerId: number) => {
    const res = await axiosClient.get(`/results/sheet/${answerId}`);
    return res.data;
  },

  retryAnswer: async (answerId: number) => {
    const res = await axiosClient.post(`/answers/${answerId}/retry`);
    return res.data;
  },
};
