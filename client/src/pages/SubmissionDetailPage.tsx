import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  //   FiRefreshCw,
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

const socket = io(SOCKET_URL, { autoConnect: true });

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    // return () => socket.off();
    return () => {
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-1">
            <FiCheckCircle /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold flex items-center gap-1">
            <FiClock /> Processing…
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 rounded-full  text-red-700 text-sm font-semibold flex items-center gap-1">
            <FiAlertTriangle /> Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">
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

  if (loading) return <p className="p-10 text-gray-600">Loading submission…</p>;

  if (!data || error) {
    return (
      <p className="p-10 text-center bg-red-50 text-red-700 border rounded">
        {error || "Submission not found."}
      </p>
    );
  }

  const submission = data.submission;
  const sheets = data.answerSheets;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">Submission Details</h1>
      <div className="bg-white border shadow rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Question Paper
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Mode: <span className="capitalize">{submission.mode}</span>
            </p>
          </div>
          {getBadge(submission.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Total Marks:</span>{" "}
            {submission.totalMarks ?? "--"}
          </p>

          <p>
            <span className="font-semibold">Questions Extracted:</span>{" "}
            {submission.questions ?? "--"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          
          
          {submission.status === "completed" && (
            <button
              onClick={() =>
                navigate(`/submissions/${submission.id}/questions`)
              }
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <FiFileText />
              View Extracted Questions
            </button>
          )}

          
          {submission.mode === "upload" && submission.fileUrl && (
            <button
              onClick={() => window.open(submission.fileUrl!, "_blank")}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <FiFileText />
              View Uploaded File
            </button>
          )}
        </div>

        
        {submission.errorMessage && (
          <p className="text-red-700 bg-red-50 p-2 rounded mt-2 text-sm">
            <span className="font-semibold">Error:</span>{" "}
            {submission.errorMessage}
          </p>
        )}

        {submission.mode === "typed" && submission.rawText && (
          <div className="bg-gray-50 border rounded p-4 max-h-64 overflow-y-auto text-sm whitespace-pre-wrap">
            {submission.rawText}
          </div>
        )}

        {submission.status === "failed" && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => handleRetry(submission.id)}
              className="flex items-center gap-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition shadow-sm"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {submission.status === "completed" && (
        <div className="bg-white border shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Answer Sheets</h2>

            <button
              onClick={() => navigate(`/answers/${submission.id}`)}
              className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Answer Sheet
            </button>
          </div>

          {sheets.length === 0 ? (
            <p className="text-gray-600">No answer sheets uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {sheets.map((sheet: AnswerSheetRecord, index: number) => (
                <div
                  key={sheet.id}
                  className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Answer Sheet #{index + 1}
                    </p>

                    <p className="text-sm">Status: {getBadge(sheet.status)}</p>

                    {sheet.status === "completed" && (
                      <p className="text-sm mt-1 text-green-700">
                        Score: {sheet.totalScore} / {submission.totalMarks}
                      </p>
                    )}

                    {sheet.status === "failed" && sheet.errorMessage && (
                      <p className="text-sm text-red-700 mt-1">
                        Error: {sheet.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {sheet.status === "completed" && (
                      <button
                        onClick={() =>
                          navigate(
                            `/results/sheet/${sheet.id}?index=${index + 1}`
                          )
                        }
                        className="flex items-center gap-2 px-2 p-1 bg-gray-900 text-white rounded hover:bg-black transition shadow-sm"
                      >
                        View
                      </button>
                    )}

                    {sheet.status === "failed" && (
                      <div className="flex items-center gap-2 ">
                        <button
                          onClick={() =>
                            navigate(
                              `/results/sheet/${sheet.id}?index=${index + 1}`
                            )
                          }
                          className="flex items-center gap-2 px-2 p-1 bg-gray-900 text-white rounded hover:bg-black transition shadow-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRetryAnswer(sheet.id)}
                          className="flex items-center gap-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition shadow-sm"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
