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
  FiBarChart2,
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
  return msg.length > 100 ? msg.slice(0, 100) + "..." : msg;
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

  if (loading) return <Loader text="Analyzing Performance..." />;

  if (error)
    return (
      <div className="flex justify-center p-10">
        <p className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </p>
      </div>
    );
  if (!resultData) return null;

  const { questionPaper: qp, answers } = resultData;
  const completedCount = answers.filter((a) => a.status === "completed").length;

  return (
    <div className="w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiBarChart2 className="text-teal-600 text-xl" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Evaluation Dashboard
            </h1>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex gap-4 md:gap-8 bg-gradient-to-b from-gray-50 to-white px-4 md:px-8 py-3 rounded border border-gray-200 shadow-sm w-full md:w-auto justify-between md:justify-start">
            <div className="flex-1 md:flex-none text-center md:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Papers
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {answers.length}
              </p>
            </div>

            <div className="w-px h-10 bg-gray-200/60 hidden md:block"></div>

            <div className="flex-1 md:flex-none text-center md:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Completed
              </p>
              <p className="text-xl md:text-2xl font-bold text-teal-600">
                {completedCount}
              </p>
            </div>

            <div className="w-px h-10 bg-gray-200/60 hidden md:block"></div>

            <div className="flex-1 md:flex-none text-center md:text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Marks
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {qp.totalMarks}
              </p>
            </div>
          </div>

          <button
            onClick={handleQuestionPaper}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm text-sm"
          >
            <FiFileText />
            {qpDetails && qpDetails.type !== "file" ? "Hide QP" : "View QP"}
          </button>
        </div>
      </div>

      {qpDetails && qpDetails.type === "text" && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-4 md:p-6 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider border-b pb-2">
            Question Paper Content
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-100 max-h-[300px] overflow-y-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono leading-relaxed">
              {qpDetails.rawText}
            </pre>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {answers.map((ans, index) => (
          <div
            key={ans.id}
            className="group relative bg-white rounded border border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center p-4 md:p-5 md:pl-7 gap-4 md:gap-6">
              <div className="flex-1 w-full md:w-auto flex items-center gap-4 md:gap-5">

                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Answer Sheet {index + 1}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-between md:justify-center items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-10 md:pr-10">
                {ans.status === "completed" ? (
                  <div className="text-center md:text-left flex-1 md:flex-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Score Achieved
                    </span>
                    <div className="flex items-baseline justify-center md:justify-start gap-1.5 mt-1">
                      <span className="text-2xl font-bold text-gray-800 tracking-tight">
                        {ans.totalScore}
                      </span>
                      <span className="text-sm font-semibold text-gray-400">
                        / {qp.totalMarks}
                      </span>
                    </div>
                  </div>
                ) : ans.status === "failed" ? (
                  <p className="text-sm text-red-500 max-w-xs bg-red-50 px-3 py-1 rounded border border-red-100 flex-1 md:flex-auto text-center md:text-left">
                    {trimError(ans.errorMessage)}
                  </p>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 italic flex-1 md:flex-auto">
                    <FiClock className="animate-spin" />
                    <span className="text-sm">Evaluating...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {ans.status === "completed" && (
                  <button
                    onClick={() =>
                      navigate(`/results/sheet/${ans.id}?index=${index + 1}`)
                    }
                    className="w-full md:w-auto flex-1 md:flex-none px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <FiEye /> View
                  </button>
                )}

                {ans.status === "failed" && (
                  <>
                    <button
                      onClick={() =>
                        navigate(`/results/sheet/${ans.id}?index=${index + 1}`)
                      }
                      className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => retrySheet(String(ans.id))}
                      className="flex-1 md:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <FiRefreshCw /> Retry
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}