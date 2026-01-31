import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { FiUpload, FiType } from "react-icons/fi";
import { FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

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

  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const isInsufficientCredits =
    message.type === "error" &&
    (message.text.toLowerCase().includes("insufficient") ||
      message.text.toLowerCase().includes("exhausted") ||
      message.text.toLowerCase().includes("limit"));

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
    setUploadProgress(0);
    setCurrentJobId(null);
    setJobStatus("processing");

    setMessage({ type: null, text: "" });

    try {
      let response;
      if (mode === "typed") {
        showMessage("info", "Submitting your questions...");
        response = await QuestionAPI.submitTyped({ text });
      } else {
        // await new Promise((resolve) => setTimeout(resolve, 5000));

        response = await QuestionAPI.uploadPaper(file as File, (percent) => {
          setUploadProgress(percent);
          if (percent === 100) {
            showMessage("info", "File uploaded! Sending to AI...");
          }
        });
      }

      if (!response.success) {
        showMessage("error", response.message || "Submission failed.");
        setLoading(false);
        setJobStatus("failed");
        return;
      }

      setCurrentJobId(response.id);
      localStorage.setItem("myJobId", response.id);
      setJobStatus("processing");
      showMessage("info", "Checking / extracting your question paper…");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Something went wrong.",
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
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

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

      {mode === "typed" ? (
        <textarea
          className="w-full border border-gray-300 p-4 rounded min-h-[365px] outline-none text-sm resize-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 placeholder-gray-400"
          placeholder={`Enter or paste your exam questions here.\n\nFormat Example:\nQ1. Define Computer Networking. (5 Marks)\nQ2. Explain the OSI Model with diagram. (10 Marks)\nQ3. Write short notes on TCP vs UDP. (5 Marks)`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (currentJobId) {
              setCurrentJobId(null);
              setJobStatus("idle");
            }
          }}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4 w-full">
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
            className={`relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded cursor-pointer transition-all duration-300 ease-in-out overflow-hidden
        ${
          file
            ? "border-teal-500 bg-teal-50/50 shadow-inner"
            : "border-gray-300 bg-gray-50 "
        }`}
          >
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
              {file ? (
                <div className="animate-in zoom-in duration-300">
                  <div className="relative mb-3 flex justify-center">
                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm border border-teal-200">
                      <FiUpload className="w-10 h-10" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 break-all px-4">
                    {file.name}
                  </h3>
                  <p className="text-sm text-teal-600 font-medium">
                    {formatFileSize(file.size)} • Ready to Evaluate
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-xs font-semibold text-gray-500 hover:text-red-500 underline transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-colors duration-300 ${isDragging ? "bg-teal-200 text-teal-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    <FiUpload
                      className={`w-10 h-10 ${isDragging ? "animate-bounce" : ""}`}
                    />
                  </div>

                  <div>
                    <p className="text-xl font-semibold text-gray-800">
                      {isDragging
                        ? "Drop your paper here"
                        : "Upload Question Paper"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and drop your file
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                      PDF
                    </span>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                      JPG
                    </span>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                      PNG
                    </span>
                  </div>
                </div>
              )}
            </div>

            <input
              id="fileUpload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {!file && (
            <p className="text-center text-xs text-gray-400 italic">
              * Maximum file size: 10MB. Make sure the text is clearly visible.
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        {message.text && (
          <div
            className={`px-4 py-3 rounded-lg text-sm border flex items-center justify-between gap-3 ${
              message.type === "success"
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : message.type === "error"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <div className="flex gap-2 items-center">
              {message.type === "error" ? (
                <FiAlertTriangle />
              ) : message.type === "success" ? (
                <FiCheckCircle />
              ) : (
                <FiInfo />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage({ type: null, text: "" })}>
              ✕
            </button>
          </div>
        )}

        {loading &&
          mode === "upload" &&
          uploadProgress > 0 &&
          uploadProgress < 100 && (
            <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-bold text-teal-700">
                  Uploading Question Paper...
                </span>
                <span className="text-sm font-bold text-teal-700">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-100 shadow-inner">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
      </div>

      {isInsufficientCredits && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => navigate("/billing")}
            className="text-xs font-medium text-teal-600 underline"
          >
            Unlock more usage →
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 items-center">
        {showRetryButton && !loading && (
          <button
            onClick={handleRetry}
            className="px-8 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors shadow-sm"
          >
            Retry
          </button>
        )}

        {showSubmitButton && !loading && (
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-10 py-2.5 rounded-lg text-white font-bold bg-teal-500 hover:bg-teal-600 transition-all shadow-md active:scale-95"
          >
            Submit
          </button>
        )}

        {loading &&
          (mode === "typed" ||
            uploadProgress === 100 ||
            uploadProgress === 0) && (
            <div className="flex items-center gap-2 text-teal-600 font-bold animate-pulse">
              <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"></div>
              Evaluation in progress...
            </div>
          )}
      </div>
    </div>
  );
}
