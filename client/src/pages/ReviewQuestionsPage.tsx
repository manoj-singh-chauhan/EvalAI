import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import Loader from "../components/Loader";
import {
  FiExternalLink,
  FiFileText,
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiX,
  FiTrash2,
  FiPlus,
  FiSave,
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-1350pxl mx-auto space-y-6">
        <div className="bg-white rounded  p-1">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
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
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Review Questions
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Verify extracted questions and marks before proceeding.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-5 ml-0 sm:ml-14">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    Count
                  </span>
                  <span className="text-sm font-bold">{questions.length}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                    Total Marks
                  </span>
                  <span className="text-sm font-bold">{totalMarks}</span>
                </div>

                {flaggedCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-md border border-yellow-200 animate-pulse">
                    <FiAlertCircle className="flex-shrink-0" />
                    <span className="text-sm font-bold">
                      {flaggedCount} Flagged
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0 xl:self-start ml-0 sm:ml-14 xl:ml-0">
              {mode === "upload" && fileUrl && (
                <button
                  onClick={() => window.open(fileUrl, "_blank")}
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all shadow-sm"
                >
                  <FiExternalLink /> Original
                </button>
              )}

              {mode === "typed" && rawText && (
                <button
                  onClick={() => setShowTypedText(!showTypedText)}
                  className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-all font-medium text-sm shadow-sm ${
                    showTypedText
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FiFileText />
                  {showTypedText ? "Hide Text" : "Show Text"}
                </button>
              )}

              <button
                onClick={addNewQuestion}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 font-medium text-sm transition-all shadow-sm"
              >
                <FiPlus /> Add Question
              </button>
              <button
                onClick={handleUpdate}
                disabled={flaggedCount > 0}
                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all transform active:scale-95 ${
                  flaggedCount > 0
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md"
                }`}
              >
                <FiSave />
                {flaggedCount > 0 ? "Fix Issues" : "Save & Continue"}
              </button>
            </div>
          </div>
        </div>

        {mode === "typed" && rawText && showTypedText && (
          <div className="bg-white rounded  border border-gray-300 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <FiFileText className="text-gray-500" /> Original Text
              </h3>
              <button
                onClick={() => setShowTypedText(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
              <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono leading-relaxed">
                {rawText}
              </pre>
            </div>
          </div>
        )}
        {message.type && (
          <div
            className={`px-4 py-3 rounded-lg border flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : message.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            <span className="mt-0.5">
              {message.type === "success" ? (
                <FiCheck className="text-lg" />
              ) : message.type === "error" ? (
                <FiAlertCircle className="text-lg" />
              ) : (
                "ℹ️"
              )}
            </span>
            <span className="text-sm font-medium flex-1">{message.text}</span>
            <button
              onClick={() => setMessage({ type: null, text: "" })}
              className="opacity-60 hover:opacity-100"
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`group relative rounded border ${
                q.flagged
                  ? "bg-red-50/50 border-red-300 shadow-sm"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 mt-1">
                    {i + 1}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Question Text
                      </label>
                      <button
                        onClick={() => deleteQuestion(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                        title="Remove Question"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <textarea
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].text = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full p-0 bg-transparent border-none resize-none focus:ring-0 text-gray-800 font-medium placeholder-gray-300 leading-relaxed"
                      rows={2}
                      placeholder="Type your question here..."
                    />

                    {q.flagged && (
                      <div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-100/50 px-2 py-1 rounded w-fit">
                        <FiAlertCircle /> Mark allocation missing
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
                          className={`w-20 p-1.5 text-center text-sm font-bold rounded border focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                            q.flagged
                              ? "border-red-300 text-red-700 bg-white"
                              : "border-gray-200 text-gray-800 bg-gray-50"
                          }`}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <span className="text-xs text-gray-300 font-medium">
                        Q.{i + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <FiFileText className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              No Questions Added
            </h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Get started by adding your first question manually.
            </p>
            <button
              onClick={addNewQuestion}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all"
            >
              Add First Question
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