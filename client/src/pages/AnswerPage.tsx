import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnswerAPI } from "../api/answer.api";
import { io as socketIO } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { FiUpload } from "react-icons/fi";

const socket = socketIO(SOCKET_URL);

const AnswerPage = () => {
  const { paperId } = useParams(); 

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const [jobId, setJobId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "info" | "success" | "error" | null;
    text: string;
  }>({
    type: null,
    text: "",
  });

  const showMessage = (type: "info" | "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    if (!jobId) return;

    const channel = `answer-status-${jobId}`;
    socket.on(channel, (data) => {
      const msg = data.message;
      console.log("SOCKET →", msg);

      showMessage("info", msg);

      if (msg.toLowerCase().includes("completed")) {
        setLoading(false);
        showMessage("success", "Evaluation Completed!");
      }

      if (msg.toLowerCase().includes("failed")) {
        setLoading(false);
        showMessage("error", msg);
      }
    });

    return () => socket.off(channel);
  }, [jobId]);


  const handleSubmit = async () => {
    if (files.length === 0) {
      showMessage("error", "Please upload answer sheets.");
      return;
    }

    setLoading(true);
    showMessage("info", "Uploading answer sheets…");

    try {
      const res = await AnswerAPI.submit({
        questionPaperId: Number(paperId),
        files,
      });

      if (!res.success) {
        showMessage("error", res.message || "Submission failed.");
        setLoading(false);
        return;
      }

      setJobId(res.id);
      showMessage("info", "Evaluation started…");
    } catch (err: any) {
      showMessage("error", err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };


  const handleRetry = async () => {
    if (!jobId) return;

    setLoading(true);
    showMessage("info", "Retrying evaluation…");

    try {
      const res = await AnswerAPI.retryJob(jobId);

      if (!res.success) {
        showMessage("error", res.message || "Retry failed.");
        setLoading(false);
        return;
      }

      showMessage("info", "Retry started… waiting for updates");
    } catch (err: any) {
      showMessage("error", "Retry failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Upload Answer Sheets</h2>

      
      <label
        htmlFor="answerUpload"
        className="block border-2 border-dashed p-8 rounded-xl cursor-pointer bg-blue-50 text-center"
      >
        <FiUpload className="text-blue-500 text-5xl mx-auto mb-3" />
        <span className="text-gray-700">
          Upload answer sheets (images or PDF)
        </span>

        <input
          id="answerUpload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 text-gray-700">
          {files.map((f) => (
            <li key={f.name}>• {f.name}</li>
          ))}
        </ul>
      )}

      
      {message.type && (
        <div className="mt-6 p-4 rounded-lg border text-sm bg-blue-100 text-blue-700">
          {message.text}
        </div>
      )}

      
      <div className="mt-6">
        {message.type === "error" && jobId ? (
          <button
            onClick={handleRetry}
            disabled={loading}
            className="px-6 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
          >
            {loading ? "Retrying…" : "Retry"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            {loading ? "Processing…" : "Submit Answer Sheets"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AnswerPage;
