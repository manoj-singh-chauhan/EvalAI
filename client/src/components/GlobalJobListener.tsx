import { useEffect } from "react";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { useNavigate } from "react-router-dom";

const socket = socketIO(SOCKET_URL);

export default function GlobalJobListener() {
  const navigate = useNavigate();

  useEffect(() => {
    socket.onAny(async (event, data) => {
      if (!event.startsWith("job-status-")) return;

      const jobId = event.replace("job-status-", "");
      const msg = data.message?.toLowerCase() ?? "";

      if (msg.includes("completed successfully") || msg.includes("extracted successfully")) {
        navigate(`/answers/${jobId}`);
      }
    });
  }, [navigate]);

  return null;
}
