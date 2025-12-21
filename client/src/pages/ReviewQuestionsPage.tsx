import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import Loader from "../components/Loader";
import {
  FiExternalLink,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

interface QuestionItem {
  text: string;
  marks: number | null;
  flagged?: boolean;
}

interface QuestionPaperResponse {
  questions: QuestionItem[];
  fileUrl?: string;
  rawText?: string;
  mode?: "upload" | "typed";
}

export default function ReviewQuestionsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "typed" | null>(null);

  const [showTypedText, setShowTypedText] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | null;
    text: string;
  }>({ type: null, text: "" });

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);
  const flaggedCount = questions.filter((q) => q.flagged).length;

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await QuestionAPI.getQuestions(paperId!);
        const data = res.data as QuestionPaperResponse;

        setQuestions(data.questions);

        if (data.fileUrl) setFileUrl(data.fileUrl);
        if (data.rawText) setRawText(data.rawText);
        if (data.mode) setMode(data.mode);
      } catch {
        setMessage({ type: "error", text: "Failed to load questions." });
      }
      setLoading(false);
    };

    loadData();
  }, [paperId]);

  const handleUpdate = async () => {
    if (flaggedCount > 0) {
      setMessage({
        type: "error",
        text: `Please fix ${flaggedCount} flagged question(s) before saving.`,
      });
      return;
    }

    try {
      const res = await QuestionAPI.updateQuestions(paperId!, questions);

      if (res.success) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setTimeout(() => {
          navigate(`/answers/${paperId}`);
        }, 800);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Update failed.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Update failed." });
    }
  };

  const addNewQuestion = () => {
    setQuestions([...questions, { text: "", marks: null, flagged: false }]);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Review Questions
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Questions are AI-extracted. Please review and confirm
                correctness.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <span className="text-xs sm:text-sm font-medium">
                    Total Questions:
                  </span>
                  <span className="text-base sm:text-lg font-bold">
                    {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <span className="text-xs sm:text-sm font-medium">
                    Total Marks:
                  </span>
                  <span className="text-base sm:text-lg font-bold">
                    {totalMarks}
                  </span>
                </div>

                {flaggedCount > 0 && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    <FiAlertCircle className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                      {flaggedCount} Flagged
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {mode === "upload" && fileUrl && (
                <button
                  onClick={() => window.open(fileUrl, "_blank")}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm font-medium text-sm"
                >
                  <FiExternalLink className="flex-shrink-0" />
                  <span className="hidden sm:inline">Original Paper</span>
                  <span className="sm:hidden">Original</span>
                </button>
              )}

              {mode === "typed" && rawText && (
                <button
                  onClick={() => setShowTypedText(!showTypedText)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 border-2 rounded-lg transition-all shadow-sm font-medium text-sm ${
                    showTypedText
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  <FiFileText className="flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {showTypedText ? "Hide Original" : "Show Original"}
                  </span>
                  <span className="sm:hidden">
                    {showTypedText ? "Hide" : "Show"}
                  </span>
                </button>
              )}

              <button
                onClick={addNewQuestion}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-green-600 text-white border-2 border-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium text-sm"
              >
                <FiPlus className="flex-shrink-0" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Original Text Box */}
        {mode === "typed" && rawText && showTypedText && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Original Question Paper
                </h3>
                <button
                  onClick={() => setShowTypedText(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {rawText}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message.type && (
          <div
            className={`px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-300"
                : message.type === "error"
                ? "bg-red-50 text-red-800 border-red-300"
                : "bg-blue-50 text-blue-800 border-blue-300"
            }`}
          >
            <span className="mt-0.5 flex-shrink-0">
              {message.type === "success" ? (
                <FiCheck className="text-xl" />
              ) : message.type === "error" ? (
                <FiAlertCircle className="text-xl" />
              ) : (
                "ℹ️"
              )}
            </span>
            <span className="text-sm sm:text-base font-medium flex-1">
              {message.text}
            </span>
            <button
              onClick={() => setMessage({ type: null, text: "" })}
              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4 sm:space-y-5">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`rounded-xl shadow-sm border-2 p-4 sm:p-6 transition-all hover:shadow-md ${
                q.flagged
                  ? "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Question {i + 1}
                  </h3>
                </div>

                <button
                  onClick={() => deleteQuestion(i)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg flex-shrink-0"
                  title="Delete question"
                >
                  <FiTrash2 className="text-base sm:text-lg" />
                </button>
              </div>

              {/* Flagged Warning */}
              {q.flagged && (
                <div className="mb-4 px-3 sm:px-4 py-2 sm:py-3 bg-yellow-100 border border-yellow-300 rounded-lg text-xs sm:text-sm text-yellow-800 font-semibold flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0" />
                  <span>Missing marks — please enter marks to continue</span>
                </div>
              )}

              {/* Question Text */}
              <div className="mb-4">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">
                  Question Text
                </label>
                <textarea
                  value={q.text}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i].text = e.target.value;
                    setQuestions(updated);
                  }}
                  className="w-full p-3 sm:p-4 rounded-lg border-2 border-gray-300 resize-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                  rows={3}
                  placeholder="Enter question text..."
                />
              </div>

              {/* Marks Input */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">
                  Marks
                </label>
                <input
                  type="number"
                  value={q.marks ?? ""}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i].marks = Number(e.target.value);
                    updated[i].flagged = false;
                    setQuestions(updated);
                  }}
                  className="p-2.5 sm:p-3 w-24 sm:w-28 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base font-medium"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Questions Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Click "Add Question" to get started
            </p>
            <button
              onClick={addNewQuestion}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
            >
              <FiPlus />
              Add First Question
            </button>
          </div>
        )}

        {/* Save Button */}
        {questions.length > 0 && (
          <div className="sticky bottom-4 pt-4">
            <button
              onClick={handleUpdate}
              disabled={flaggedCount > 0}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                flaggedCount > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/50"
              }`}
            >
              {flaggedCount > 0
                ? `Fix ${flaggedCount} Flagged Question(s) to Continue`
                : "Save & Continue"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}