import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiEye,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import {
  SubmissionAPI,
  type SubmissionDetail,
  type AnswerSheetRecord,
} from "../api/submission.api";
import { QuestionAPI } from "../api/question.api";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import { AnswerAPI } from "../api/answer.api";
import Loader from "../components/Loader";

const socket = io(SOCKET_URL, { autoConnect: true });

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTypedText, setShowTypedText] = useState(false);

  const loadSubmission = async () => {
    try {
      const res = await SubmissionAPI.getOne(id!);
      setData(res);
    } catch (err) {
      console.log(err);
      setError("Failed to load submission.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;

    const setupSocketListeners = async () => {
      const res = await SubmissionAPI.getOne(id);
      setData(res);

      const qpChannel = `job-status-${id}`;
      socket.off(qpChannel);
      socket.on(qpChannel, () => {
        loadSubmission();
      });

      res.answerSheets.forEach((sheet) => {
        const ansChannel = `answer-status-${sheet.id}`;
        socket.off(ansChannel);
        socket.on(ansChannel, () => {
          loadSubmission();
        });
      });

      setLoading(false);
    };

    setupSocketListeners();

    return () => {
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 shrink-0">
            <FiCheckCircle /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 shrink-0">
            <FiClock /> Processing…
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 shrink-0">
            <FiAlertTriangle /> Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold shrink-0">
            Pending
          </span>
        );
    }
  };

  const handleRetry = async (submissionId: string) => {
    try {
      await QuestionAPI.retryJob(submissionId);
      await loadSubmission();
    } catch {
      alert("Retry failed.");
    }
  };

  const handleRetryAnswer = async (sheetId: string) => {
    try {
      await AnswerAPI.retryJob(sheetId);
      await loadSubmission();
    } catch (err) {
      console.error("Answer retry failed:", err);
      alert("Retry failed.");
    }
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (!data || error) {
    return (
      <p className="p-10 text-center bg-red-50 text-red-700 border rounded m-4">
        {error || "Submission not found."}
      </p>
    );
  }

  const submission = data.submission;
  const sheets = data.answerSheets;

  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-4 md:p-8 w-full max-w-1350px mx-auto">
        <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="
              flex items-center justify-center
              h-9 w-9 shrink-0
              rounded-lg
              bg-white
              border border-gray-300
              text-gray-600
              hover:bg-indigo-50
              hover:text-indigo-600
              hover:border-indigo-300
              transition
            "
            >
              <FiArrowLeft size={18} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 break-words">
              Submission Details
            </h1>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 md:p-6 mb-8 transition-all">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Question Paper
                </h2>
                {getBadge(submission.status)}
              </div>
              <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  Mode:{" "}
                  <span className="font-semibold capitalize text-gray-800">
                    {submission.mode}
                  </span>
                </span>
                {submission.totalMarks && (
                  <span>
                    Marks:{" "}
                    <span className="font-semibold text-gray-800">
                      {submission.totalMarks}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {submission.status === "completed" && (
                <button
                  onClick={() =>
                    navigate(`/submissions/${submission.id}/questions`)
                  }
                  className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-gray-300 text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <FiFileText />
                  <span className="whitespace-nowrap">View Extracted</span>
                </button>
              )}

              {submission.mode === "upload" && submission.fileUrl && (
                <button
                  onClick={() => window.open(submission.fileUrl!, "_blank")}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <FiFileText />{" "}
                  <span className="whitespace-nowrap">Open File</span>
                </button>
              )}

              {submission.mode === "typed" && submission.rawText && (
                <button
                  onClick={() => setShowTypedText(!showTypedText)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <FiFileText />
                  <span className="whitespace-nowrap">
                    {showTypedText ? "Hide Text" : "View Question"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {submission.errorMessage && (
            <div className="mt-4 text-red-700 bg-red-50 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <FiAlertTriangle className="mt-0.5 shrink-0" />
              <div className="break-words">
                <span className="font-semibold">Error:</span>{" "}
                {submission.errorMessage}
              </div>
            </div>
          )}

          {submission.mode === "typed" &&
            submission.rawText &&
            showTypedText && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                {/* <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 max-h-[400px] overflow-y-auto custom-scrollbar"> */}
                {/* <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 max-h-[400px] overflow-y-auto custom-scroll"> */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed break-words">
                    {submission.rawText}
                  </pre>
                </div>
              </div>
            )}

          {submission.status === "failed" && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleRetry(submission.id)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition shadow-sm text-sm font-medium"
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          )}
        </div>

        {submission.status === "completed" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Answer Sheets</h2>
              <button
                onClick={() => navigate(`/answers/${submission.id}`)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all"
              >
                + Add Answer Sheet
              </button>
            </div>

            {sheets.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <p className="text-gray-500">No answer sheets uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sheets.map((sheet: AnswerSheetRecord, index: number) => (
                  <div
                    key={sheet.id}
                    className="p-4 md:p-5 border border-gray-200 rounded-md bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-gray-800 text-lg">
                          Answer Sheet {index + 1}
                        </h3>
                        {getBadge(sheet.status)}
                      </div>

                      {sheet.status === "completed" && (
                        <p className="text-sm font-medium text-gray-600">
                          Score:{" "}
                          <span className="text-green-600 text-lg font-bold">
                            {sheet.totalScore}
                          </span>{" "}
                          <span className="text-gray-400">
                            / {submission.totalMarks}
                          </span>
                        </p>
                      )}

                      {sheet.status === "failed" && sheet.errorMessage && (
                        <p className="text-sm text-red-600 p-1.5 mt-1 break-words">
                          Error: {sheet.errorMessage}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {sheet.status === "completed" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/results/sheet/${sheet.id}?index=${index + 1}`
                            )
                          }
                          className="flex-1 md:flex-none px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                        >
                          <FiEye /> View
                        </button>
                      )}

                      {sheet.status === "failed" && (
                        <>
                          <button
                            onClick={() =>
                              navigate(
                                `/results/sheet/${sheet.id}?index=${index + 1}`
                              )
                            }
                            className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleRetryAnswer(sheet.id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                          >
                            <FiRefreshCw /> Retry
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
