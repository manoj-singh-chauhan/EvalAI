import axios from "axios";
import axiosClient from "./axiosClient";

export const AnswerAPI = {
  submit: async ({
    questionPaperId,
    files,
  }: {
    questionPaperId: number;
    files: File[];
  }) => {
    
    const sigRes = await axiosClient.get("/answers/get-upload-signature");

    const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;
    console.log(sigRes.data);

    const uploadedFiles: any[] = [];

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
        mimeType: file.type,
      });
    }

    
    const res = await axiosClient.post("/answers/submit", {
      questionPaperId,
      answerSheetFiles: uploadedFiles,
    });

    console.log(res);

    return res.data;
  },

  getStatus: async (id: number) => {
    const res = await axiosClient.get(`/answers/${id}`);
    return res.data;
  },

  retryJob: async (id: number) => {
    const res = await axiosClient.post(`/answers/${id}/retry`);
    return res.data;
  },
};
