import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import { FiUpload } from "react-icons/fi";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";

const socket = socketIO(SOCKET_URL);

export default function QuestionPage() {
  const [mode, setMode] = useState<"typed" | "upload">("typed");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<
    "idle" | "processing" | "failed" | "completed"
  >("idle");

  const [message, setMessage] = useState<{ type: "success" | "error" | "info" | null; text: string }>({
    type: null,
    text: "",
  });

  const navigate = useNavigate();

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
  };

  // useEffect(() => {
  //   if (!currentJobId) return;

  //   const channel = `job-status-${currentJobId}`;

  //   socket.off(channel);
  //   socket.on(channel, async (data) => {
  //     const msg = data.message;
  //     setMessage({ type: "info", text: msg });

  //     if (
  //       msg.toLowerCase().includes("completed successfully") ||
  //       msg.toLowerCase().includes("question pepar extracted successfully")
  //     ) {
  //       setMessage({ type: "success", text: msg });
  //       setLoading(false);
  //       setJobStatus("completed");

  //       const status = await QuestionAPI.getStatus(currentJobId);
  //       if (status.data.status === "completed") {
  //         setTimeout(() => navigate(`/answers/${currentJobId}`), 2000);
  //       }
  //     }

  //     if (msg.toLowerCase().startsWith("failed")) {
  //       setMessage({ type: "error", text: msg });
  //       setLoading(false);
  //       setJobStatus("failed");
  //     }
  //   });

  //   return () => socket.off(channel);
  // }, [currentJobId, navigate]);

    useEffect(() => {
    if (!currentJobId) return;

    const channel = `job-status-${currentJobId}`;

    socket.off(channel);
    socket.on(channel, async (data) => {
      const msg = data.message;
      setMessage({ type: "info", text: msg });

      if (
        msg.toLowerCase().includes("completed successfully") ||
        msg.toLowerCase().includes("question pepar extracted successfully")
      ) {
        setMessage({ type: "success", text: msg });
        setLoading(false);

        const status = await QuestionAPI.getStatus(currentJobId);
        if (status.data.status === "completed") {
          setTimeout(() => navigate(`/answers/${currentJobId}`), 2000);
        }
      }

      if (msg.toLowerCase().startsWith("failed")) {
        setMessage({ type: "error", text: msg });
        setLoading(false);
      }
    });

    return () => {
      socket.off(channel);
    };
  }, [currentJobId, navigate]);


  useEffect(() => {
    if (!message.type || message.type === "error") return;

    const timeout = setTimeout(() => {
      setMessage({ type: null, text: "" });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [message]);

  const handleSubmit = async () => {
    if (mode === "typed" && !text.trim()) {
      showMessage("error", "Text area cannot be empty.");
      return;
    }

    if (mode === "upload" && !file) {
      showMessage("error", "Please select a file.");
      return;
    }

    setLoading(true);
    setCurrentJobId(null);
    setJobStatus("processing");
    showMessage("info", "Submitting...");

    try {
      let response;
      if (mode === "typed") {
        response = await QuestionAPI.submitTyped({ text });
      } else {
        response = await QuestionAPI.uploadPaper(file as File);
      }

      if (!response.success) {
        showMessage("error", response.message || "Submission failed.");
        setLoading(false);
        setJobStatus("failed");
        return;
      }

      setCurrentJobId(response.id);
      setJobStatus("processing");
      showMessage("info", "Job queued. Waiting for updates...");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage("error", err.response?.data?.message || "Something went wrong.");
      setLoading(false);
      setJobStatus("failed");
    }
  };

  const handleRetry = async () => {
    if (!currentJobId) return;

    setLoading(true);
    showMessage("info", "Retrying job...");
    setJobStatus("processing");

    try {
      const response = await QuestionAPI.retryJob(currentJobId);

      if (!response.success) {
        showMessage("error", response.message || "Retry failed.");
        setLoading(false);
        setJobStatus("failed");
        return;
      }

      showMessage("info", "Retry successful. Waiting for updates...");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage("error", err.response?.data?.message || "Retry failed.");
      setLoading(false);
      setJobStatus("failed");
      return;
    }

    setLoading(false);
  };

  const showSubmitButton = currentJobId === null;
  const showRetryButton = jobStatus === "failed" && currentJobId !== null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Create Question Paper
      </h2>

      <div className="flex justify-center gap-6 mb-8">
        {["typed", "upload"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as "typed" | "upload")}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-sm font-medium border transition-all ${
              mode === m ? "bg-blue-600 text-white" : "bg-white border-gray-300"
            }`}
          >
            {m === "typed" ? "Typed" : "Upload"}
          </button>
        ))}
      </div>

      {mode === "typed" && (
        <textarea
          className="w-full border border-gray-300 p-4 rounded-lg min-h-[200px]"
          placeholder={
            "Paste or type the exam questions here.\n" +
            "Example:\n" +
            "1. Define networking. (5 Marks)\n" +
            "2. Explain the OSI model. (10 Marks)"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      )}

      {mode === "upload" && (
        <label
          htmlFor="fileUpload"
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer ${
            file ? "border-green-400 bg-green-50" : "border-blue-300 bg-blue-50"
          }`}
        >
          {file ? (
            <span className="text-green-700 font-medium">{file.name}</span>
          ) : (
            <>
              <FiUpload className="text-blue-500 text-5xl mb-3" />
              <span className="text-gray-700">Click to upload a question paper</span>
            </>
          )}

          <input
            id="fileUpload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
            className="hidden"
          />
        </label>
      )}

      {message.type && (
        <div
          className={`mt-6 p-4 rounded-xl shadow-md border text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 border-green-400 text-green-700"
              : message.type === "error"
              ? "bg-red-50 border-red-400 text-red-700"
              : "bg-blue-50 border-blue-400 text-blue-700"
          }`}
          style={{ maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap" }}
        >
          {message.text}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        {showRetryButton ? (
          <button
            onClick={handleRetry}
            className="px-6 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Retry
          </button>
        ) : showSubmitButton ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        ) : null}
      </div>
    </div>
  );
}