import axiosClient from "./axiosClient";

export interface ExtractedQuestion {
  id: string;
  number: number;
  text: string;
  marks: number;
}

export interface SubmissionRecord {
  id: string;
  // title: string;
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

export const SubmissionAPI = {
  getAll: async (): Promise<SubmissionRecord[]> => {
    const res = await axiosClient.get("/submissions");
    return Array.isArray(res.data.submissions) ? res.data.submissions : [];
  },

  getOne: async (id: string): Promise<SubmissionDetail> => {
    const res = await axiosClient.get(`/submissions/${id}`);
    return res.data;
  },
};
