import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import { FiUpload } from "react-icons/fi";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const QuestionPage: React.FC = () => {
  const [mode, setMode] = useState<"typed" | "upload">("typed");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | null;
    text: string;
  }>({ type: null, text: "" });

  const navigate = useNavigate();

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await QuestionAPI.getStatus(jobId);
      const job = res.data;

      if (job.status === "completed") {
        setLoading(false);
        showMessage(
          "success",
          "Processing complete! Redirecting to results..."
        );
        setTimeout(() => navigate(`/answers/${job.id}`), 1500);
      } else if (job.status === "failed") {
        setLoading(false);
        showMessage("error", `Failed: ${job.errorMessage || "Unknown error"}`);
      } else if (job.status === "pending" || job.status === "processing") {
        await sleep(3000);
        pollJobStatus(jobId);
      }
    } catch (error: any) {
      setLoading(false);
      showMessage("error", "Failed to get job status.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setCurrentJobId(null);
    showMessage("info", "Submitting your request...");

    if (mode === "typed" && text.trim() === "") {
      showMessage("error", "Text area cannot be empty.");
      setLoading(false);
      return;
    }
    if (mode === "upload" && !file) {
      showMessage("error", "Please select a file to upload.");
      setLoading(false);
      return;
    }

    try {
      let response;

      if (mode === "typed") {
        response = await QuestionAPI.submitTyped({ text });
      } else if (mode === "upload" && file) {
        response = await QuestionAPI.uploadPaper(file);
      }

      if (!response?.success) {
        showMessage("error", response?.message || "Submission failed.");
        setLoading(false);
        return;
      }

      const paperId = response?.id;
      setCurrentJobId(paperId);
      showMessage("info", "Upload successful! Waiting for processing...");

      pollJobStatus(paperId);
    } catch (error: any) {
      let errMsg = "Something went wrong. Please try again!";
      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      showMessage("error", errMsg);
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!currentJobId) return;

    setLoading(true);
    showMessage("info", "Retrying job...");

    try {
      const response = await QuestionAPI.retryJob(currentJobId);

      if (!response?.success) {
        showMessage("error", response?.message || "Retry failed.");
        setLoading(false);
        return;
      }

      showMessage("info", "Retry successful! Waiting for processing...");

      pollJobStatus(currentJobId);
    } catch (error: any) {
      let errMsg = "Retry failed. Please try again!";
      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      showMessage("error", errMsg);
      setLoading(false);
    }
  };

  const messageColors = {
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
  };

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
            className={`px-6 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            } ${
              mode === m
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            {m === "typed" ? "Typed" : "Upload"}
          </button>
        ))}
      </div>

      {mode === "typed" && (
        <textarea
          className="w-full border border-gray-300 p-4 rounded-lg min-h-[220px] text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter your typed questions here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      )}

      {mode === "upload" && (
        <div className="mt-6">
          <label
            htmlFor="fileUpload"
            className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-blue-100"
            } ${
              file
                ? "border-green-400 bg-green-50"
                : "border-blue-300 bg-blue-50"
            }`}
          >
            {file ? (
              <span className="text-green-700 font-medium">{file.name}</span>
            ) : (
              <>
                <FiUpload className="text-blue-500 text-5xl mb-3" />
                <span className="text-gray-700 font-medium">
                  Click to upload your question paper
                </span>
              </>
            )}

            <input
              id="fileUpload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      )}

      {message.type && (
        <div
          className={`mt-6 p-4 rounded-lg border text-sm font-medium ${
            messageColors[message.type]
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        {message.type === "error" && currentJobId && !loading ? (
          <button
            onClick={handleRetry}
            className="px-6 py-2 rounded-md font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-all duration-200"
          >
            Retry
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;
