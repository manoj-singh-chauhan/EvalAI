import axios from "axios";
import axiosClient from "./axiosClient";

export interface SubmitAnswerArgs {
  questionPaperId: string;
  files: File[];
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
  // data?: any;
  data?: unknown;
}

export const AnswerAPI = {
  submit: async ({
    questionPaperId,
    files,
  }: SubmitAnswerArgs): Promise<SubmitAnswerResponse> => {
    const sigRes = await axiosClient.get(
      `/api/answers/get-upload-signature/${questionPaperId}`
    );

    const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

    const uploadedFiles: { fileUrl: string; mimeType: string }[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      const uploadRes = await axios.post(uploadUrl, formData);

      uploadedFiles.push({
        fileUrl: uploadRes.data.secure_url,
        mimeType: file.type || "application/octet-stream",
      });
    }

    const res = await axiosClient.post("/api/answers/submit", {
      questionPaperId,
      answerSheetFiles: uploadedFiles,
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



// import axios from "axios";
// import axiosClient from "./axiosClient";

// export interface SubmitAnswerArgs {
//   questionPaperId: string;
//   files: File[];
//   strictnessLevel?: "lenient" | "moderate" | "strict";
// }

// export interface SubmitAnswerResponse {
//   success: boolean;
//   ids: string[];
//   message?: string;
// }

// export interface ApiBaseResponse {
//   success: boolean;
//   message?: string;
//   id?: number;
//   data?: unknown;
// }

// export const AnswerAPI = {
//   submit: async ({
//     questionPaperId,
//     files,
//     strictnessLevel = "moderate", // Default to moderate
//   }: SubmitAnswerArgs): Promise<SubmitAnswerResponse> => {
//     const sigRes = await axiosClient.get(
//       `/api/answers/get-upload-signature/${questionPaperId}`
//     );

//     const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

//     const uploadedFiles: { fileUrl: string; mimeType: string }[] = [];

//     for (const file of files) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("signature", signature);
//       formData.append("timestamp", timestamp);
//       formData.append("folder", folder);
//       formData.append("api_key", apiKey);

//       const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
//       const uploadRes = await axios.post(uploadUrl, formData);

//       uploadedFiles.push({
//         fileUrl: uploadRes.data.secure_url,
//         mimeType: file.type || "application/octet-stream",
//       });
//     }

//     const res = await axiosClient.post("/api/answers/submit", {
//       questionPaperId,
//       answerSheetFiles: uploadedFiles,
//       strictnessLevel, // Send strictness level to backend
//     });

//     return res.data;
//   },

//   getStatus: async (id: string): Promise<ApiBaseResponse> => {
//     const res = await axiosClient.get(`/api/answers/${id}`);
//     return res.data;
//   },

//   retryJob: async (id: string): Promise<ApiBaseResponse> => {
//     const res = await axiosClient.post(`/api/answers/${id}/retry`);
//     return res.data;
//   },
// };