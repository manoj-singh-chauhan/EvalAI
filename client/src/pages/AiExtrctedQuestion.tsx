import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SubmissionAPI, type ExtractedQuestion } from "../api/submission.api";

export default function AiExtractedQuestion() {
  const { id } = useParams();

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
    return <p className="p-10 text-gray-500">Loading extracted questions…</p>;
  }

  if (error) {
    return (
      <p className="p-10 text-center bg-red-50 text-red-700 border rounded">
        {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Question pepar
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Extracted questions using AI.
          </p>
        </div>

        <div className="bg-white rounded-md shadow p-5 border">
          <p className="text-gray-600 text-sm font-medium">Total Marks</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {totalMarks ?? 0}
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            // <div
            //   key={q.id || index}
            //   className="rounded-md shadow-sm border p-6 bg-white border-gray-200"
            // >

            //   <p className="text-lg font-semibold text-gray-900">
            //     Q{q.number ?? index + 1}. {q.text}
            //     <br />
            //   </p>

            //   <p className="text-sm text-gray-700 mt-3 font-medium">
            //     Marks:{" "}
            //     <span className="font-bold text-gray-900">{q.marks}</span>
            //   </p>
            // </div>
            <div
              key={q.id || index}
              className="rounded-md shadow-sm border p-6 bg-white border-gray-200"
            >
              <p className="text-lg font-bold text-gray-900 mb-3">
                Q{q.number ?? index + 1}
              </p>

              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
                {q.text}
              </p>

              <p className="text-sm text-gray-700 mt-4 font-medium">
                Marks:{" "}
                <span className="font-bold text-gray-900">{q.marks}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
