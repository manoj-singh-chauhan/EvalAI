import axios from "axios";
import axiosClient from "./axiosClient";

export interface SubmitAnswerArgs {
  questionPaperId: string;
  files: File[];
  strictnessLevel?: "lenient" | "moderate" | "strict";
}

export interface SubmitAnswerResponse {
  success: boolean;
  ids: string[];
  message?: string;
}

export interface ApiBaseResponse {
  success: boolean;
  message?: string;
  id?: number;
  data?: unknown;
}

export const AnswerAPI = {
  submit: async ({
    questionPaperId,
    files,
    strictnessLevel = "moderate",
  }: SubmitAnswerArgs): Promise<SubmitAnswerResponse> => {
    
    // const sigRes = await axiosClient.get(
    //   `/api/answers/get-upload-signature/${questionPaperId}`
    // );
     const sigRes = await axiosClient.get(
        `/api/answers/get-upload-signature/${questionPaperId}?fileSize=${files[0].size}`
     );
    const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;
    console.log(sigRes.data);
    const uploadPromises = files.map(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} is too large (Max 10MB)`);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      const uploadRes = await axios.post(uploadUrl, formData);

      return {
        fileUrl: uploadRes.data.secure_url,
        mimeType: file.type || "application/octet-stream",
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    const res = await axiosClient.post("/api/answers/submit", {
      questionPaperId,
      answerSheetFiles: uploadedFiles,
      strictnessLevel,
    });

    return res.data;
  },

  getStatus: async (id: string): Promise<ApiBaseResponse> => {
    const res = await axiosClient.get(`/api/answers/${id}`);
    return res.data;
  },

  retryJob: async (id: string): Promise<ApiBaseResponse> => {
    const res = await axiosClient.post(`/api/answers/${id}/retry`);
    return res.data;
  },
};