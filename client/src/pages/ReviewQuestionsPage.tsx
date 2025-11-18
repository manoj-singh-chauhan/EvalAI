import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

interface QuestionItem {
  text: string;
  marks: number | null;
  flagged?: boolean;
}

interface QuestionPaperResponse {
  questions: QuestionItem[];
}

export default function ReviewQuestionsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const totalMarks = questions.reduce(
    (sum, q) => sum + (q.marks || 0),
    0
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axiosClient.get(`/questions/${paperId}`);
        const data = res.data.data as QuestionPaperResponse;

        setQuestions(data.questions);
      } catch (err) {
        setMessage("Failed to load questions.");
      }
      setLoading(false);
    };

    loadData();
  }, [paperId]);

  const handleUpdate = async () => {
    try {
      const res = await axiosClient.post(
        `/questions/${paperId}/update-questions`,
        { questions }
      );

      if (res.data.success) {
        setMessage("Saved successfully!");

        setTimeout(() => {
          navigate(`/answers/${paperId}`);
        }, 800);
      } else {
        setMessage(res.data.message || "Update failed.");
      }
    } catch {
      setMessage("Update failed.");
    }
  };

  if (loading) {
    return <p className="p-10 text-gray-600">Loading...</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Review Extracted Questions</h1>

      {message && (
        <div className="p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      {/* Total Marks Box */}
      <div className="p-4 bg-gray-50 border rounded">
        <p className="font-semibold text-gray-800">
          Total Marks: <span className="font-bold">{totalMarks}</span>
        </p>
      </div>

      {/* Question List */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={i}
            className={`p-4 border rounded-lg ${
              q.flagged ? "bg-yellow-50 border-yellow-400" : "bg-white"
            }`}
          >
            {q.flagged && (
              <p className="mb-2 text-yellow-700 font-semibold">
                ⚠ Missing marks for this question
              </p>
            )}

            <label className="block text-sm font-medium">Question</label>
            <textarea
              value={q.text}
              onChange={(e) => {
                const updated = [...questions];
                updated[i].text = e.target.value;
                setQuestions(updated);
              }}
              className="w-full p-3 border rounded mt-1"
            />

            <label className="block text-sm font-medium mt-3">Marks</label>
            <input
              type="number"
              value={q.marks ?? ""}
              onChange={(e) => {
                const updated = [...questions];
                updated[i].marks = Number(e.target.value);
                updated[i].flagged = false; // unflag after fixing
                setQuestions(updated);
              }}
              className="p-2 border rounded w-32 mt-1"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleUpdate}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Save Updates
      </button>
    </div>
  );
}
