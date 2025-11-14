// import app from "./app";
// import dotenv from "dotenv";
// import logger from "./config/logger";

// dotenv.config({ path: ".env.development" });

// const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// const startServer = async (): Promise<void> => {
//   try {
//     app.listen(PORT, () => {
//       logger.info(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     logger.error(error);
//     process.exit(1);
//   }
// };

// startServer();


import app from "./app";
import dotenv from "dotenv";
import logger from "./config/logger";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({ path: ".env.development" });

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;


const httpServer = createServer(app);


export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

const startServer = async (): Promise<void> => {
  try {
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();