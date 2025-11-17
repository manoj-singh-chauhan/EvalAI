// import axios from "axios";
// import axiosClient from "./axiosClient";

// export const AnswerAPI = {
//   submit: async ({
//     questionPaperId,
//     files,
//   }: {
//     questionPaperId: number;
//     files: File[];
//   }) => {
    
//     const sigRes = await axiosClient.get("/answers/get-upload-signature");

//     const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;
//     console.log(sigRes.data);

//     const uploadedFiles: any[] = [];

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
//         mimeType: file.type,
//       });
//     }

    
//     const res = await axiosClient.post("/answers/submit", {
//       questionPaperId,
//       answerSheetFiles: uploadedFiles,
//     });

//     console.log(res);

//     return res.data;
//   },

//   getStatus: async (id: number) => {
//     const res = await axiosClient.get(`/answers/${id}`);
//     return res.data;
//   },

//   retryJob: async (id: number) => {
//     const res = await axiosClient.post(`/answers/${id}/retry`);
//     return res.data;
//   },
// };



import axios from "axios";
import axiosClient from "./axiosClient";

export interface SubmitAnswerArgs {
  questionPaperId: number;
  files: File[];
}

export interface ApiBaseResponse {
  success: boolean;
  message?: string;
  id?: number;
  data?: any;
}

export const AnswerAPI = {
  submit: async ({ questionPaperId, files }: SubmitAnswerArgs): Promise<ApiBaseResponse> => {
    const sigRes = await axiosClient.get("/answers/get-upload-signature");

    const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;
    console.log("Upload Signature →", sigRes.data);

    
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

    
    const res = await axiosClient.post("/answers/submit", {
      questionPaperId,
      answerSheetFiles: uploadedFiles,
    });

    console.log("Answer Submit Response →", res.data);
    return res.data;
  },

  
  getStatus: async (id: number): Promise<ApiBaseResponse> => {
    const res = await axiosClient.get(`/answers/${id}`);
    return res.data;
  },

  retryJob: async (id: number): Promise<ApiBaseResponse> => {
    const res = await axiosClient.post(`/answers/${id}/retry`);
    return res.data;
  },
};
