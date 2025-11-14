// import axios from "axios";
// import logger from "../config/logger";

// export const downloadFile = async (url: string): Promise<Buffer> => {
//   try {
//     logger.info("Downloading");

//     // const response = await axios.get(url, {
//     //   responseType: "arraybuffer",
//     // });

//     const response = await axios.get(url, {
//       responseType: "arraybuffer",
//       decompress: false,
//     });

    


//     return response.data;
//   } catch (error: any) {
//     logger.error(`Failed to download file from ${url}: ${error.message}`);
//     throw new Error(`Failed to download file: ${url}`);
//   }
// };



import axios from "axios";
import logger from "../config/logger";

export const downloadFile = async (url: string): Promise<Buffer> => {
  try {
    logger.info("Downloading file from Cloudinary...");

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      decompress: true, // allow compression if needed
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return Buffer.from(response.data);
  } catch (error: any) {
    logger.error(`Failed to download file from ${url}: ${error.message}`);
    throw new Error(`Failed to download file: ${url}`);
  }
};
