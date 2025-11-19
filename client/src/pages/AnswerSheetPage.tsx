import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ResultAPI } from "../api/result.api";
import { useLocation } from "react-router-dom";

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
  id: number;
  questionPaperId: number;
  answerSheetFiles: UploadedFile[];
  answers: EvaluatedAnswer[];
  totalScore: number;
  feedback?: string | null;
  status: string;
  errorMessage?: string | null;
};

export default function AnswerSheetPage() {
  const { answerId } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<AnswerSheetRecord | null>(null);
  const [error, setError] = useState("");
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const displayIndex = params.get("index");

  useEffect(() => {
    if (!answerId) return;

    const fetchSheet = async () => {
      try {
        const res = await ResultAPI.getAnswerSheet(Number(answerId));
        setSheet(res);
      } catch {
        setError("Failed to load answer sheet.");
      }
      setLoading(false);
    };

    fetchSheet();
  }, [answerId]);

  if (loading) {
    return <p className="p-10 text-gray-600">Loading answer sheet...</p>;
  }

  if (error) {
    return (
      <p className="p-10 text-center bg-red-50 text-red-700 border rounded">
        {error}
      </p>
    );
  }

  if (!sheet) return null;

  const { answers } = sheet;

  return (
    <div className="p-10 space-y-8 max-w-4xl mx-auto">
      {/* <h1 className="text-3xl font-bold text-gray-800">
        Answer Sheet #{sheet.id}
      </h1> */}
      <h1 className="text-3xl font-bold text-gray-800">
        Answer Sheet {displayIndex}
      </h1>

      <div className="bg-white border shadow p-6 rounded-xl">
        <h2 className="text-lg font-semibold">Score Summary</h2>

        <p className="text-gray-700 mt-2 text-sm">
          Total Score:{" "}
          <span className="font-bold text-green-700">{sheet.totalScore}</span>
        </p>

        {sheet.feedback && (
          <p className="mt-3 text-gray-800 text-sm">
            <span className="font-semibold">Overall Feedback:</span>{" "}
            {sheet.feedback}
          </p>
        )}
      </div>

      <div className="bg-white border shadow p-6 rounded-xl">
        <h2 className="font-semibold text-lg">Uploaded answer</h2>

        <ul className="mt-3 space-y-2">
          {sheet.answerSheetFiles.map((file, index) => (
            <li key={index}>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm"
              >
                View answer sheet{index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border shadow p-6 rounded-xl">
        <h2 className="font-semibold text-lg mb-4">Evaluated Answers</h2>

        <div className="space-y-6">
          {answers.map((ans) => (
            <div
              key={ans.questionNumber}
              className="p-4 border rounded-lg bg-gray-50"
            >
              <p className="font-medium text-gray-800">
                Q{ans.questionNumber}: {ans.questionText}
              </p>

              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                <span className="font-semibold">Student Answer:</span>{" "}
                {ans.studentAnswer && ans.studentAnswer.trim() !== ""
                  ? ans.studentAnswer
                  : "(No answer provided)"}
              </p>

              <p className="mt-2 text-sm">
                <span className="font-semibold">Score:</span>{" "}
                <span className="text-green-700 font-bold">
                  {ans.score} / {ans.maxScore}
                </span>
              </p>

              {ans.feedback && (
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Feedback:</span>{" "}
                  {ans.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
