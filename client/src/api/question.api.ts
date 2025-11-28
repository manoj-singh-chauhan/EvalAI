import axios from "axios";
import axiosClient from "./axiosClient";

interface TypedQuestionPayload {
  text: string;
}
export interface QuestionUpdateItem {
  text: string;
  marks: number | null;
  flagged?: boolean;
  number?: number;
}

export const QuestionAPI = {
  submitTyped: async (data: TypedQuestionPayload) => {
    const res = await axiosClient.post("/questions/submit-typed-job", data);
    return res.data;
  },
  uploadPaper: async (file: File) => {
    try {
      // const sigResponse = await axiosClient.get(
      //   "/questions/get-upload-signature"
      // );

      const sigResponse = await axiosClient.post(
        "/questions/get-upload-signature",
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }
      );

      const { signature, timestamp, folder, apiKey, cloudName, jobId } =
        sigResponse.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      const cloudinaryResponse = await axios.post(uploadUrl, formData);

      const { secure_url, format, resource_type } = cloudinaryResponse.data;

      let mimeType = file.type;
      if (resource_type === "raw" && format === "pdf") {
        mimeType = "application/pdf";
      }

      const jobResponse = await axiosClient.post("/questions/submit-file-job", {
        jobId,
        fileUrl: secure_url,
        mimeType,
      });

      return jobResponse.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Direct upload failed:", error.response?.data?.message);
        throw error;
      }
    }
  },

  getStatus: async (id: string | number) => {
    const res = await axiosClient.get(`/questions/${id}`);
    return res.data;
  },

  getQuestions: async (id: string | number) => {
    const res = await axiosClient.get(`/questions/${id}`);
    return res.data;
  },

  retryJob: async (id: string | number) => {
    const res = await axiosClient.post(`/questions/${id}/retry`);
    return res.data;
  },

  //   updateQuestions: async (id: string, questions: any[]) => {
  //   const res = await axiosClient.put(`/questions/${id}/update-questions`, {
  //     questions,
  //   });
  //   return res.data;
  // },
  updateQuestions: async (id: string, questions: QuestionUpdateItem[]) => {
    const res = await axiosClient.put(`/questions/${id}/update-questions`, {
      questions,
    });
    return res.data;
  },
};
