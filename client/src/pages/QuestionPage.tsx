import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { FiUpload, FiType } from "react-icons/fi";

const socket = socketIO(SOCKET_URL);

export default function QuestionPage() {
  const [mode, setMode] = useState<"typed" | "upload">("typed");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<
    "idle" | "processing" | "failed" | "completed"
  >("idle");

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | null;
    text: string;
  }>({
    type: null,
    text: "",
  });

  const navigate = useNavigate();

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
  };

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
        setJobStatus("completed");

        const status = await QuestionAPI.getStatus(currentJobId);
        if (status.data.status === "completed") {
          navigate(`/answers/${currentJobId}`);
        }
      }

      if (msg.toLowerCase().startsWith("failed")) {
        setMessage({ type: "error", text: msg });
        setLoading(false);
        setJobStatus("failed");
      }
    });

    return () => {
      socket.off(channel);
    };
  }, [currentJobId, navigate]);

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
      showMessage("info", "Checking / extracting your question paper…");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Something went wrong."
      );
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
      showMessage("info", "Retry started. Waiting for updates…");
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
    <div className="bg-white rounded shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create Question Paper
          </h1>
          <p className="text-gray-500 text-sm">
            Choose a method to extract questions
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded inline-flex w-full sm:w-auto gap-1">
          {[
            { id: "typed", label: "Type", icon: FiType },
            { id: "upload", label: "Upload", icon: FiUpload },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as "typed" | "upload")}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-initial ${
                  isActive
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      {mode === "typed" ? (
        <textarea
          className="w-full border border-gray-300 p-4 rounded min-h-[340px] outline-none text-sm resize-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 placeholder-gray-400"
          placeholder={`Paste or type the exam questions here.\n\nExample:\n1. Define networking. (5 Marks)\n2. Explain the OSI model. (10 Marks)`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (currentJobId) {
              setCurrentJobId(null);
              setJobStatus("idle");
            }
            if (message.type === "error") setMessage({ type: null, text: "" });
          }}
          disabled={loading}
        />
      ) : (
        <label
          htmlFor="fileUpload"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) setFile(droppedFile);
          }}
          className={`
            flex flex-col items-center justify-center 
            w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${
              file
                ? "border-teal-400 bg-teal-50"
                : isDragging
                ? "border-teal-500 bg-teal-50 scale-[0.99]"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
            }
          `}
        >
          {file ? (
            <div className="text-center px-4">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUpload className="w-6 h-6" />
              </div>
              <span className="text-teal-700 font-medium block text-sm break-all">
                {file.name}
              </span>
              <span className="text-teal-600 text-xs mt-1">
                Click to change file
              </span>
            </div>
          ) : (
            <>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isDragging
                    ? "bg-teal-100 text-teal-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <FiUpload className="w-8 h-8" />
              </div>
              <span className="text-gray-700 font-medium text-base">
                {isDragging
                  ? "Drop the file here..."
                  : "Click or drag to upload"}
              </span>
              <span className="text-gray-400 text-sm mt-2">
                Supports PDF, JPG, PNG
              </span>
            </>
          )}

          <input
            id="fileUpload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              if (currentJobId) {
                setCurrentJobId(null);
                setJobStatus("idle");
              }
              if (message.type === "error")
                setMessage({ type: null, text: "" });
            }}
            className="hidden"
          />
        </label>
      )}

      {/* Message Alert */}
      {message.type && (
        <div
          className={`mt-6 px-4 py-3 rounded-lg text-sm border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : message.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          <div className="flex gap-2 flex-1 min-w-0">
            <span className="mt-0.5 flex-shrink-0">
              {message.type === "error"
                ? "⚠"
                : message.type === "success"
                ? "✓"
                : "ℹ"}
            </span>
            <span className="break-words">{message.text}</span>
          </div>

          <button
            onClick={() => setMessage({ type: null, text: "" })}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
        {showRetryButton ? (
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors shadow-sm"
          >
            Retry
          </button>
        ) : showSubmitButton ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
