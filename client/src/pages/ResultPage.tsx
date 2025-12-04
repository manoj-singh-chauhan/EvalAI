import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResultAPI } from "../api/result.api";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
  FiFileText,
  // FiExternalLink
} from "react-icons/fi";
import Loader from "../components/Loader";

const socket = io(SOCKET_URL, { autoConnect: true });

type QPaper = {
  id: string;
  totalMarks: number;
  mode: string;
  status: string;
  errorMessage?: string | null;
};

type AnswerRecord = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalScore: number | null;
  errorMessage?: string | null;
};

type ResultResponse = {
  questionPaper: QPaper;
  answers: AnswerRecord[];
};

type QPFile =
  | { type: "text"; rawText: string }
  | { type: "file"; fileUrl: string; mimeType: string };

const trimError = (msg?: string | null): string => {
  if (!msg) return "";
  return msg.length > 120 ? msg.slice(0, 120) + "..." : msg;
};

export default function ResultsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [qpDetails, setQpDetails] = useState<QPFile | null>(null);
  const [error, setError] = useState("");

  const refreshResults = useCallback(async () => {
    try {
      const updated = await ResultAPI.getResults(String(paperId));
      setResultData(updated);
    } catch {
      setError("Failed to refresh results.");
    }
  }, [paperId]);

  const setupSocketListeners = useCallback(
    (answers: AnswerRecord[]) => {
      answers.forEach((ans) => {
        const channel = `answer-status-${ans.id}`;
        socket.off(channel);
        socket.on(channel, () => {
          refreshResults();
        });
      });
    },
    [refreshResults]
  );

  useEffect(() => {
    if (!paperId) return;

    const load = async () => {
      try {
        const res = await ResultAPI.getResults(String(paperId));
        setResultData(res);
        setupSocketListeners(res.answers);
      } catch {
        setError("Failed to load results.");
      }
      setLoading(false);
    };

    load();
    return () => {
      socket.off();
    };
  }, [paperId, setupSocketListeners]);

  const handleQuestionPaper = async () => {
    if (qpDetails) {
      if (qpDetails.type === "file") {
        window.open(qpDetails.fileUrl, "_blank");
      } else {
        setQpDetails(null);
      }
      return;
    }

    try {
      const res = await ResultAPI.getQuestionPaper(String(paperId));

      if (res.type === "file") {
        window.open(res.fileUrl, "_blank");

        setQpDetails(res);
      } else {
        setQpDetails(res);
      }
    } catch {
      setError("Could not load question paper.");
    }
  };

  const retrySheet = async (id: string) => {
    try {
      await ResultAPI.retryAnswer(String(id));
      await refreshResults();
    } catch {
      setError("Retry failed. Try again later.");
    }
  };

  if (loading)
    // return <p className="p-10 text-center text-gray-500">Loading results...</p>;

    return <Loader text="Loadings..." />;

  if (error)
    return (
      <p className="p-10 text-center text-red-600 border bg-red-50 m-4 rounded">
        {error}
      </p>
    );
  if (!resultData) return null;

  const { questionPaper: qp, answers } = resultData;

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-100 p-8 w-full max-w-4xl mx-auto">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Evaluation Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          View scores and details for this session
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">
              Question Paper
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Total Marks:{" "}
              <span className="font-bold text-gray-800">{qp.totalMarks}</span>
            </p>
          </div>

          <button
            onClick={handleQuestionPaper}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            <FiFileText />

            {qpDetails
              ? qpDetails.type === "file"
                ? "Open File"
                : "Hide"
              : "View"}
          </button>
        </div>

        {qpDetails && qpDetails.type === "text" && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {qpDetails.rawText}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-bold text-xl text-gray-800 mb-4">Answer Sheets</h2>

        <div className="space-y-4">
          {answers.map((ans, index) => (
            <div
              key={ans.id}
              className="p-5 border border-gray-200 rounded-md bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Answer Sheet {index + 1}
                  </h3>

                  {ans.status === "completed" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                      <FiCheckCircle /> Completed
                    </span>
                  ) : ans.status === "processing" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
                      <FiClock /> Processing...
                    </span>
                  ) : ans.status === "failed" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
                      <FiAlertTriangle /> Failed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                      Pending
                    </span>
                  )}
                </div>

                {ans.status === "completed" && (
                  <p className="text-sm font-medium text-gray-600">
                    Score:{" "}
                    <span className="text-green-600 text-lg font-bold">
                      {ans.totalScore}
                    </span>{" "}
                    <span className="text-gray-400">/ {qp.totalMarks}</span>
                  </p>
                )}

                {ans.status === "failed" && ans.errorMessage && (
                  <p className="text-sm text-red-600  p-1.5  mt-1">
                    Error: {trimError(ans.errorMessage)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {ans.status === "failed" && (
                  // <button
                  //   onClick={() => retrySheet(String(ans.id))}
                  //   className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center gap-2 transition"
                  // >
                  //   <FiRefreshCw /> Retry
                  // </button>
                  <button
                    onClick={() => retrySheet(String(ans.id))}
                    className={`
    flex-1 sm:flex-none px-4 py-2 rounded-md font-semibold text-sm text-gray-600
    flex items-center justify-center gap-2 transition-all duration-300
    backdrop-blur-sm shadow-sm border
    bg-white/60 
  `}
                  >
                    <FiRefreshCw className="text-lg" />
                    Retry
                  </button>
                )}

                {/* <button
                  onClick={() =>
                    navigate(`/results/sheet/${ans.id}?index=${index + 1}`)
                  }
                  disabled={
                    ans.status !== "completed" && ans.status !== "failed"
                  }
                  className={`flex-1 sm:flex-none px-5 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all
                    ${
                      ans.status === "completed" || ans.status === "failed"
                        ? "text-black shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <FiEye />
                  View
                </button> */}
                <button
                  onClick={() =>
                    (ans.status === "completed" || ans.status === "failed") &&
                    navigate(`/results/sheet/${ans.id}?index=${index + 1}`)
                  }
                  disabled={
                    ans.status !== "completed" && ans.status !== "failed"
                  }
                  className={`
    flex-1 sm:flex-none px-5 py-2 rounded-md font-medium text-sm 
    flex items-center justify-center gap-2 transition-all duration-200
    ${
      ans.status === "completed" || ans.status === "failed"
        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
        : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
                >
                  <FiEye />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
