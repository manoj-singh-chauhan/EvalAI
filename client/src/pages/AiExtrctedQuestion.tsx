import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SubmissionAPI, type ExtractedQuestion } from "../api/submission.api";
import Loader from "../components/Loader";
import { FiArrowLeft } from "react-icons/fi";

export default function AiExtractedQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [totalMarks, setTotalMarks] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await SubmissionAPI.getOne(String(id));
        setTotalMarks(res.submission.totalMarks ?? null);
        setQuestions(res.submission.questionsList || []);
      } catch {
        setError("Failed to load extracted questions.");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <Loader text="Loading questions..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow border border-red-200 p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    // CHANGE 1: Use h-screen + overflow-y-auto + custom-scroll
    // This ensures it takes the full screen height and scrolls internally
    <div className="h-screen bg-gray-50">
      {/* CHANGE 2: Changed max-w-4xl to max-w-7xl for a wider, full-screen feel on desktop */}
      <div className="max-w-1350pxl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Question Paper
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              AI-extracted questions from your submission
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
              Total Questions
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {questions.length}
            </p>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
              Total Marks
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {totalMarks ?? 0}
            </p>
          </div>
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
              Avg. Marks
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {questions.length > 0
                ? ((questions.reduce((sum, q) => sum + (q.marks || 0), 0) /
                    questions.length) as number).toFixed(1)
                : "0"}
            </p>
          </div> */}
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Questions Found
            </h3>
            <p className="text-gray-600 text-sm">
              No questions were extracted from your submission.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.id || index}
                className="bg-white rounded shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {q.number ?? index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {q.text}
                    </p>
                    <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <span className="font-bold mr-1">Marks:</span> {q.marks}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
