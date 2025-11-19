import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResultAPI } from "../api/result.api";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";

const socket = io(SOCKET_URL, { autoConnect: true });

type QPaper = {
  id: number;
  totalMarks: number;
  mode: string;
  status: string;
  errorMessage?: string | null;
};

type AnswerRecord = {
  id: number;
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
      const updated = await ResultAPI.getResults(Number(paperId));
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
        const res = await ResultAPI.getResults(Number(paperId));
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

  const loadQuestionPaper = async () => {
    try {
      const res = await ResultAPI.getQuestionPaper(Number(paperId));
      setQpDetails(res);
    } catch {
      setError("Could not load question paper.");
    }
  };

  const retrySheet = async (id: number) => {
    try {
      await ResultAPI.retryAnswer(id);
      await refreshResults();
    } catch {
      setError("Retry failed. Try again later.");
    }
  };

  if (loading) {
    return <p className="p-10 text-gray-600">Loading results...</p>;
  }

  if (error) {
    return (
      <p className="p-10 text-center bg-red-50 text-red-700 border rounded">
        {error}
      </p>
    );
  }

  if (!resultData) return null;

  const { questionPaper: qp, answers } = resultData;

  return (
    <div className="p-10 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Evaluation Results</h1>

      <div className="bg-white border shadow p-6 rounded-md">
        <h2 className="font-semibold text-lg">Question Paper</h2>

        <p className="text-gray-500 text-sm mt-1">
          Total Marks: {qp.totalMarks}
        </p>

        <button
          onClick={loadQuestionPaper}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Question Paper
        </button>

        {qpDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded border max-h-64 overflow-y-auto">
            {qpDetails.type === "text" ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {qpDetails.rawText}
              </pre>
            ) : (
              <a
                href={qpDetails.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                View question pepar
              </a>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border shadow p-6 rounded-md">
        <h2 className="font-semibold text-lg mb-4">Answer Sheets</h2>

        <div className="space-y-4">
          {answers.map((ans,index) => (
            <div
              key={ans.id}
              className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {/* Answer Sheet #{ans.id} */}
                  Answer Sheet {index + 1}
                </p>

                <p className="text-sm mt-1">
                  Status:{" "}
                  {ans.status === "completed" ? (
                    <span className="text-green-700 font-semibold">
                      Completed
                    </span>
                  ) : ans.status === "processing" ? (
                    <span className="text-yellow-600 font-semibold">
                      Processing…
                    </span>
                  ) : ans.status === "failed" ? (
                    <span className="text-red-600 font-semibold">Failed</span>
                  ) : (
                    <span className="text-gray-700 font-semibold">Pending</span>
                  )}
                </p>

                {ans.status === "completed" && (
                  <p className="text-sm text-green-700 mt-1">
                    Score: {ans.totalScore} / {qp.totalMarks}
                  </p>
                )}

                {ans.status === "failed" && ans.errorMessage && (
                  <p className="text-sm text-red-700 mt-1">
                    Error: {trimError(ans.errorMessage)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  // onClick={() => navigate(`/results/sheet/${ans.id}`)}
                  onClick={() => navigate(`/results/sheet/${ans.id}?index=${index + 1}`)}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
                >
                  View
                </button>

                {ans.status === "failed" && (
                  <button
                    onClick={() => retrySheet(ans.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}