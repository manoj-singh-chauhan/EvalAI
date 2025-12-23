import axiosClient from "./axiosClient";

export interface ExtractedQuestion {
  id: string;
  number: number;
  text: string;
  marks: number;
}

export interface SubmissionRecord {
  id: string;
  mode: "typed" | "upload";
  marks?: number | null;
  totalMarks?: number | null;
  questions?: number | null;
  fileUrl?: string | null;
  rawText?: string | null;
  errorMessage?: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  questionsList?: ExtractedQuestion[];
}

export interface AnswerSheetRecord {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalScore: number | null;
  errorMessage?: string | null;
}

export interface SubmissionDetail {
  submission: SubmissionRecord;
  answerSheets: AnswerSheetRecord[];
}

export interface PaginationData {
  submissions: SubmissionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const SubmissionAPI = {
  getAll: async (page: number = 1, limit: number = 8): Promise<PaginationData> => {
    const res = await axiosClient.get("/api/submissions", {
      params: { page, limit },
    });
    return {
      submissions: Array.isArray(res.data.submissions) ? res.data.submissions : [],
      pagination: res.data.pagination,
    };
  },

  getOne: async (id: string): Promise<SubmissionDetail> => {
    const res = await axiosClient.get(`/api/submissions/${id}`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await axiosClient.delete(`/api/submissions/${id}`);
    return res.data;
  },
};