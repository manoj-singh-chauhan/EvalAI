import app from "./app";
import dotenv from "dotenv";
import logger from "./config/logger";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({ path: ".env.development" });

const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // logger.info("Client connected to socket");
});

httpServer.listen(PORT, () => {
  logger.info(`Server running at ${PORT}`);
});
