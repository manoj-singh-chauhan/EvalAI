import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnswerAPI } from "../api/answer.api";
import { QuestionAPI } from "../api/question.api";
import { FiUpload } from "react-icons/fi";

type QuestionItem = {
  text: string;
  marks: number | null;
  flagged: boolean;
};

type QuestionPaper = {
  id: number;
  questions: QuestionItem[];
  totalMarks: number;
};

type MessageState = {
  type: "info" | "success" | "error" | null;
  text: string;
};

const AnswerPage = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<MessageState>({
    type: null,
    text: "",
  });

  const [questionData, setQuestionData] = useState<QuestionPaper | null>(null);

  const showMessage = (type: MessageState["type"], text: string) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    const loadQuestionPaper = async () => {
      if (!paperId) return;

      try {
        const res = await QuestionAPI.getStatus(paperId);
        setQuestionData(res.data as QuestionPaper);
      } catch {
        console.log("Failed to load question details");
      }
    };

    loadQuestionPaper();
  }, [paperId]);

  const flaggedCount =
    questionData?.questions?.filter((q) => q.flagged).length || 0;

  const handleSubmit = async () => {
    if (!paperId) {
      showMessage("error", "Invalid question paper ID.");
      return;
    }

    if (flaggedCount > 0) {
      showMessage("error", "Please fix missing marks before uploading answers.");
      return;
    }

    if (files.length === 0) {
      showMessage("error", "Please upload answer sheets.");
      return;
    }

    setLoading(true);
    showMessage("info", "Uploading answer sheets…");

    try {
      const res = await AnswerAPI.submit({
        questionPaperId: Number(paperId),
        files,
      });

      if (!res.success) {
        showMessage("error", res.message || "Submission failed.");
        setLoading(false);
        return;
      }

      navigate(`/results/${paperId}`);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Something went wrong."
      );
    }

    setLoading(false);
  };

  return (
    <div className="p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Upload Answer Sheets</h2>

      {/* {questionData && flaggedCount > 0 && (
        <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-600 rounded">
          <p className="text-yellow-800 font-semibold">
            ⚠ {flaggedCount} question(s) are missing marks.
          </p>

          <button
            onClick={() => navigate(`/review-questions/${paperId}`)}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Fix Missing Marks
          </button>
        </div>
      )} */}

      {questionData && (
      <div className="mb-4">
        {flaggedCount > 0 && (
          <p className="p-3 mb-3 bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600 rounded">
            ⚠ {flaggedCount} questions are missing marks.
          </p>
        )}

        <button
          onClick={() => navigate(`/review-questions/${paperId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Review Questions
        </button>
      </div>
    )}


      <label
        htmlFor="answerUpload"
        className="block border-2 border-dashed p-8 rounded-xl cursor-pointer bg-blue-50 text-center"
      >
        <FiUpload className="text-blue-500 text-5xl mx-auto mb-3" />
        <span className="text-gray-700">
          Upload answer sheets (PDF / images)
        </span>

        <input
          id="answerUpload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 text-gray-700 text-left">
          {files.map((f) => (
            <li key={f.name}>• {f.name}</li>
          ))}
        </ul>
      )}

      {message.type && (
        <div
          className={`mt-6 p-4 rounded-lg border text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {message.text}
        </div>
      )}

      
      {/* <div className="mt-6"> */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processing…" : "Submit Answer Sheets"}
        </button>
      </div>
    </div>
  );
};

export default AnswerPage;
