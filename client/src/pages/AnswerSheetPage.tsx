import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ResultAPI } from "../api/result.api";
import Loader from "../components/Loader";
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

type UploadedFile = {
  fileUrl: string;
  mimeType?: string;
};

type EvaluatedAnswer = {
  questionNumber: number;
  questionText: string;
  studentAnswer: string;
  score: number;
  maxScore: number;
  feedback?: string | null;
};

type AnswerSheetRecord = {
  id: string;
  questionPaperId: string;
  answerSheetFiles: UploadedFile[];
  answers: EvaluatedAnswer[];
  totalScore: number;
  feedback?: string | null;
  status: string;
  errorMessage?: string | null;
};

export default function AnswerSheetPage() {
  const { answerId } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const displayIndex = params.get("index");

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<AnswerSheetRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!answerId) return;

    const fetchSheet = async () => {
      try {
        const res = await ResultAPI.getAnswerSheet(answerId);
        setSheet(res);
      } catch {
        setError("Failed to load answer sheet.");
      }
      setLoading(false);
    };

    fetchSheet();
  }, [answerId]);

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="p-6 text-center bg-white text-red-700 border border-red-200 rounded-lg shadow-sm max-w-md w-full">
          {error}
        </p>
      </div>
    );
  }

  if (!sheet) return null;

  const evaluatedAnswers = sheet.answers || [];

  return (
    <div className="h-screen  bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
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
              Answer Sheet {displayIndex}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Detailed evaluation and feedback
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded flex flex-col justify-center">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Total Score
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-600">
                {sheet.totalScore}
              </span>
              <span className="text-sm text-gray-400 font-medium">points</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Overall Feedback
            </h2>
            {sheet.feedback ? (
              <p className="text-gray-700 text-sm leading-relaxed">
                {sheet.feedback}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No feedback provided.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiFileText className="text-blue-600" /> Uploaded Submission
          </h2>
          <div className="flex flex-wrap gap-3">
            {sheet.answerSheetFiles.map((file, index) => (
              <a
                key={index}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm font-medium"
              >
                <FiDownload size={16} />
                View File {index + 1}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Evaluated Questions
          </h2>

          {evaluatedAnswers.map((ans) => (
            <div
              key={ans.questionNumber}
              className="bg-white border border-gray-200 shadow-sm rounded p-6 "
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    Q{ans.questionNumber}
                  </div>
                  <p className="font-medium text-gray-900 whitespace-pre-line leading-relaxed">
                    {ans.questionText}
                  </p>
                </div>

                <div className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-sm font-bold whitespace-nowrap">
                  {ans.score} / {ans.maxScore} Marks
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Student Answer
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {ans.studentAnswer && ans.studentAnswer.trim() !== "" ? (
                      ans.studentAnswer
                    ) : (
                      <span className="text-gray-400 italic">
                        (No answer provided)
                      </span>
                    )}
                  </p>
                </div>
                {ans.feedback && (
                  <div className="bg-yellow-50/50 rounded-lg p-4 border border-yellow-100">
                    <p className="text-xs font-semibold text-yellow-700 uppercase mb-2 flex items-center gap-1">
                      <FiCheckCircle /> AI Feedback
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {ans.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
