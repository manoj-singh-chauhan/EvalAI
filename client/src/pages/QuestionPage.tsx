import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { useClerk } from "@clerk/clerk-react";
import {
  FiUpload,
  FiType,
  FiMoreVertical,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";

const socket = socketIO(SOCKET_URL);

export default function QuestionPage() {
  const [mode, setMode] = useState<"typed" | "upload">("typed");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

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
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // setLoading(true);
    // setCurrentJobId(null);
    // setJobStatus("idle");      // <-- Extra line removed
    // setJobStatus("processing");

    setLoading(true);
    setCurrentJobId(null);
    setJobStatus("processing"); // Directly set to processing
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
    <div className="bg-white rounded-md shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto">
      {/* Header - Mobile optimized */}
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100 relative">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Create Question Paper
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Choose a method to extract questions
          </p>
        </div>

        {/* Menu button */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Menu"
          >
            <FiMoreVertical className="text-xl sm:text-2xl" />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/submissions");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <FiActivity className="text-blue-500" />
                  View Activities
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode selector - Mobile optimized */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full sm:w-auto">
          {[
            { id: "typed", label: "Type Manually", icon: FiType },
            { id: "upload", label: "Upload File", icon: FiUpload },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as "typed" | "upload")}
                disabled={loading}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                <Icon className="text-base sm:text-lg" />
                <span className="hidden xs:inline">{m.label}</span>
                <span className="xs:hidden">
                  {m.id === "typed" ? "Type" : "Upload"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "typed" && (
        <textarea
          className="w-full border border-gray-300 p-3 sm:p-4 rounded-md min-h-[200px] sm:min-h-[250px] outline-none text-sm sm:text-base"
          placeholder={
            "Paste or type the exam questions here.\n\nExample:\n1. Define networking. (5 Marks)\n2. Explain the OSI model. (10 Marks)"
          }
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            // This fixes the retry button issue!
            if (currentJobId) {
              setCurrentJobId(null);
              setJobStatus("idle");
            }

            // if (message.type === "error") setMessage({ type: null, text: "" });

            if (message.type === "error") setMessage({ type: null, text: "" });
          }}
          disabled={loading}
        />
      )}

      {/* ========== CHANGE 3: Upload mode ========== */}
      {mode === "upload" && (
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
            w-full h-48 sm:h-64 border-2 border-dashed rounded-md cursor-pointer transition-all duration-200
            ${
              file
                ? "border-green-400 bg-green-50"
                : isDragging
                ? "border-blue-500 bg-blue-50 scale-[0.99]"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
            }
          `}
        >
          {file ? (
            <div className="text-center px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FiUpload className="text-lg sm:text-xl" />
              </div>
              <span className="text-green-700 font-medium block text-sm sm:text-base break-all">
                {file.name}
              </span>
              <span className="text-green-600 text-xs mt-1">
                Click to change file
              </span>
            </div>
          ) : (
            <>
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors ${
                  isDragging
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <FiUpload className="text-xl sm:text-2xl" />
              </div>
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {isDragging
                  ? "Drop the file here..."
                  : "Click or drag to upload"}
              </span>
              <span className="text-gray-400 text-xs sm:text-sm mt-2">
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

              // ✅ NEW: Reset job status when file changes
              // This fixes the retry button issue!
              if (currentJobId) {
                setCurrentJobId(null);
                setJobStatus("idle");
              }

              // ❌ OLD CODE (before the fix):
              // if (message.type === "error") setMessage({ type: null, text: "" });

              // ✅ KEPT (still works):
              if (message.type === "error")
                setMessage({ type: null, text: "" });
            }}
            className="hidden"
          />
        </label>
      )}

      {/* Message notification */}
      {message.type && (
        <div
          className={`mt-4 sm:mt-6 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm border flex items-start justify-between gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2
          ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : message.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }
        `}
        >
          <div className="flex gap-2 flex-1 min-w-0">
            <span className="mt-0.5 flex-shrink-0">
              {message.type === "error"
                ? "⚠️"
                : message.type === "success"
                ? "✓"
                : "ℹ️"}
            </span>
            <span className="break-words whitespace-pre-wrap">
              {message.text}
            </span>
          </div>

          <button
            onClick={() => setMessage({ type: null, text: "" })}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 flex justify-end">
        {showRetryButton ? (
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 rounded-md bg-yellow-500 text-white font-medium shadow-sm text-sm sm:text-base"
          >
            Retry
          </button>
        ) : showSubmitButton ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 rounded-md text-white font-medium shadow-sm transition-all text-sm sm:text-base ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
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
