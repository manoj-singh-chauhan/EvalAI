import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";
import Loader from "../components/Loader";
import {
  FiExternalLink,
  FiFileText,
  // FiChevronDown,
  // FiChevronUp,
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
  const [message, setMessage] = useState("");

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);

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
        setMessage("Failed to load questions.");
      }
      setLoading(false);
    };

    loadData();
  }, [paperId]);

  const handleUpdate = async () => {
    try {
      const res = await QuestionAPI.updateQuestions(paperId!, questions);

      if (res.success) {
        setMessage("Saved successfully!");
        setTimeout(() => {
          navigate(`/answers/${paperId}`);
        }, 800);
      } else {
        setMessage(res.message || "Update failed.");
      }
    } catch {
      setMessage("Update failed.");
    }
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Review Questions
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
             Questions are AI-extracted. Kindly review and confirm correctness.
            </p>
          </div>

          <div className="flex shrink-0">
            {mode === "upload" && fileUrl && (
              <button
                onClick={() => window.open(fileUrl, "_blank")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm font-medium text-sm"
              >
                <FiExternalLink /> Original QuestionPepar
              </button>
            )}

            {mode === "typed" && rawText && (
              <button
                onClick={() => setShowTypedText(!showTypedText)}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-md transition shadow-sm font-medium text-sm ${
                  showTypedText
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FiFileText />
                {showTypedText ? "hide QuestionPepar" : "Original QuestionPepar"}
                
              </button>
            )}
          </div>
        </div>

        {mode === "typed" && rawText && showTypedText && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              Original Text
            </h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 max-h-[380px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {rawText}
              </pre>
            </div>
          </div>
        )}

        {message && (
          <div className="p-4 bg-blue-100 text-blue-800 rounded-md border border-blue-300 shadow-sm">
            {message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100">
            Total Marks:{" "}
            <span className="font-bold text-lg ml-1">{totalMarks}</span>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`rounded-md shadow-sm border p-6 transition-all ${
                q.flagged
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-white border-gray-200"
              }`}
            >
              {q.flagged && (
                <div className="mb-3 text-sm text-yellow-800 font-semibold flex items-center gap-2">
                  ⚠ Missing marks — please enter marks
                </div>
              )}

              <label className="text-sm font-semibold text-gray-700">
                Question {i + 1}
              </label>
              <textarea
                value={q.text}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].text = e.target.value;
                  setQuestions(updated);
                }}
                className="w-full mt-2 p-3 rounded-md border resize-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
              />

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700">
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
                  className="mt-2 p-2 w-24 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 block"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={handleUpdate}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition text-lg"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
