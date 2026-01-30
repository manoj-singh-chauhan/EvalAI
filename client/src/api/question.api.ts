import axios from "axios";
import axiosClient from "./axiosClient";
// import { v4 as uuidv4 } from 'uuid';

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
    const res = await axiosClient.post("/api/questions/submit-typed-job", data);
    return res.data;
  },
  uploadPaper: async (file: File) => {
    // const customJobId = uuidv4();
    try {
      const sigResponse = await axiosClient.post(
        "/api/questions/get-upload-signature",
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          // customJobId: customJobId,
        },
      );

      const { signature, timestamp, folder, apiKey, cloudName, jobId } =
        sigResponse.data;
      //   console.log(customJobId);
      console.log("frontend response : ", sigResponse.data);
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

      const jobResponse = await axiosClient.post(
        "/api/questions/submit-file-job",
        {
          jobId,
          fileUrl: secure_url,
          mimeType,
        },
      );

      return jobResponse.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Direct upload failed:", error.response?.data?.message);
        throw error;
      } else {
        throw error;
      }
    }
  },

  getStatus: async (id: string | number) => {
    const res = await axiosClient.get(`/api/questions/${id}`);
    return res.data;
  },

  getQuestions: async (id: string | number) => {
    const res = await axiosClient.get(`/api/questions/${id}`);
    return res.data;
  },

  retryJob: async (id: string | number) => {
    const res = await axiosClient.post(`/api/questions/${id}/retry`);
    return res.data;
  },

  updateQuestions: async (id: string, questions: QuestionUpdateItem[]) => {
    const res = await axiosClient.put(`/api/questions/${id}/update-questions`, {
      questions,
    });
    return res.data;
  },
};
