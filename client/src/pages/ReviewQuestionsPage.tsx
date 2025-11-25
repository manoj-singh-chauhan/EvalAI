import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuestionAPI } from "../api/question.api";

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

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await QuestionAPI.getQuestions(paperId!);
        const data = res.data as QuestionPaperResponse;
        setQuestions(data.questions);
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
    return <p className="p-10 text-gray-600">Loading...</p>;
  }
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
      
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Review Questions
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Verify, edit, and assign marks before final evaluation.
          </p>
        </div>

   
        {message && (
          <div className="p-4 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 shadow-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-md shadow p-5 border">
          <p className="text-gray-600 text-sm font-medium">Total Marks</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalMarks}</p>
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
                Question 
              </label>
              <textarea
                value={q.text}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].text = e.target.value;
                  setQuestions(updated);
                }}
                className="w-full mt-2 p-3 rounded-md border resize-none  transition"
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
                  className="mt-2 p-2 w-24 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
