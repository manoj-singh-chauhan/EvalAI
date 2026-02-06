import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ResultAPI } from "../api/result.api";
import Loader from "../components/Loader";
import {
  FiArrowLeft,
  FiEye,
  FiFileText,
  FiCheckCircle,
  FiDownload,
} from "react-icons/fi";

type UploadedFile = {
  fileUrl: string;
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
  answerSheetFiles: UploadedFile[];
  answers: EvaluatedAnswer[];
  totalScore: number;
  feedback?: string | null;
};

export default function AnswerSheetPage() {
  const { answerId } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const displayIndex = params.get("index");

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<AnswerSheetRecord | null>(null);

  useEffect(() => {
    if (!answerId) return;

    const fetchSheet = async () => {
      const res = await ResultAPI.getAnswerSheet(answerId);
      setSheet(res);
      setLoading(false);
    };

    fetchSheet();
  }, [answerId]);

  const handleDownload = () => {
    window.scrollTo(0, 0);
    setTimeout(() => window.print(), 200);
  };

  if (loading) return <Loader text="Loading..." />;
  if (!sheet) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-1350pxl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* <div className="flex items-center gap-4 mb-8"> */}
        <div className="flex items-center justify-between mb-8 gap-4">
          {/* <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            <FiFileText size={20} />
          </button>

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
          </div> */}
          <div className="flex items-center gap-4">
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

          {/* Right Side: Download Button */}
          <button
            onClick={handleDownload}
            className="group flex items-center gap-3 transition-all duration-200"
          >
            <span className="text-gray-700 font-medium text-lg group-hover:text-emerald-600 transition-colors">
              Download record
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md group-hover:bg-emerald-700 group-hover:scale-105 transition-all">
              <FiDownload size={22} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              Total Score
            </h2>
            <span className="text-4xl font-bold text-green-600">
              {sheet.totalScore}
            </span>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Overall Feedback
            </h2>
            <p className="text-gray-700 text-sm">
              {sheet.feedback || "No feedback provided."}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiFileText className="text-blue-600" /> Uploaded Submission
          </h2>
          {sheet.answerSheetFiles.map((file, index) => (
            <a
              key={index}
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border rounded text-sm"
            >
              <FiEye size={16} />
              View File {index + 1}
            </a>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6">Evaluated Questions</h2>

        {sheet.answers.map((ans) => (
          <div
            key={ans.questionNumber}
            className="bg-white border border-gray-200 shadow-sm rounded p-6 mb-6"
          >
            <div className="flex justify-between mb-4 border-b pb-3">
              <p className="font-bold">
                Q{ans.questionNumber}. {ans.questionText}
              </p>
              <span className="font-bold text-green-600">
                {ans.score}/{ans.maxScore}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-xs font-semibold mb-2">STUDENT ANSWER</p>
                <p className="text-sm whitespace-pre-wrap">
                  {ans.studentAnswer || "(No answer)"}
                </p>
              </div>

              {ans.feedback && (
                <div className="bg-yellow-50 p-4 rounded border">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <FiCheckCircle /> AI FEEDBACK
                  </p>
                  <p className="text-sm">{ans.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
