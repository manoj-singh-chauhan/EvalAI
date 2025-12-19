// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { AnswerAPI } from "../api/answer.api";
// import { QuestionAPI } from "../api/question.api";
// import {
//   FiUpload,
//   FiAlertTriangle,
//   FiCheckCircle,
//   FiFileText,
//   FiX,
//   FiArrowRight,
// } from "react-icons/fi";

// interface QuestionItem {
//   text: string;
//   marks: number | null;
//   flagged?: boolean;
// }

// interface QuestionPaperData {
//   questions: QuestionItem[];
// }

// type MessageType = "success" | "error" | "info" | null;

// interface MessageState {
//   type: MessageType;
//   text: string;
// }

// export default function AnswerPage() {
//   const { paperId } = useParams();
//   const navigate = useNavigate();

//   const [files, setFiles] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [questionData, setQuestionData] = useState<QuestionPaperData | null>(
//     null
//   );

//   const [message, setMessage] = useState<MessageState>({
//     type: null,
//     text: "",
//   });

//   const showMessage = (type: MessageType, text: string) => {
//     setMessage({ type, text });
//   };



//   useEffect(() => {
//     const loadQuestionPaper = async () => {
//       if (!paperId) return;
//       try {
//         const res = await QuestionAPI.getQuestions(paperId);
//         setQuestionData(res.data as QuestionPaperData);
//       } catch {
//         console.log("Failed to load question details");
//       }
//     };
//     loadQuestionPaper();
//   }, [paperId]);

//   const flaggedCount =
//     questionData?.questions.filter((q) => q.flagged === true).length || 0;

//   const removeFile = (index: number) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     if (!paperId) {
//       showMessage("error", "Invalid question paper ID.");
//       return;
//     }

//     if (files.length === 0) {
//       showMessage("error", "Please upload answer sheets.");
//       return;
//     }

//     setLoading(true);
//     showMessage("info", "Uploading answer sheets…");

//     try {
//       const res = await AnswerAPI.submit({
//         questionPaperId: paperId,
//         files,
//       });

//       if (!res.success) {
//         showMessage("error", res.message || "Submission failed.");
//         setLoading(false);
//         return;
//       }

//       navigate(`/results/${paperId}`);
//     } catch (error: unknown) {
//       const err = error as { response?: { data?: { message?: string } } };
//       showMessage(
//         "error",
//         err.response?.data?.message || "Something went wrong"
//       );
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-md shadow-lg border border-gray-100 p-8 w-full max-w-4xl mx-auto">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             Upload Answer Sheets
//           </h2>
//           <p className="text-gray-500 text-sm mt-1">
//             Upload student answer sheets for AI evaluation
//           </p>
//         </div>
//       </div>

//       {questionData && (
//         <div
//           className={`mb-8 border rounded-md p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors
//             ${
//               flaggedCount > 0
//                 ? "bg-amber-50 border-amber-200"
//                 : "bg-blue-50 border-blue-100"
//             }
//         `}
//         >
//           <div className="flex gap-4">
//             <div
//               className={`p-2.5 rounded-full shrink-0 h-fit 
//                 ${
//                   flaggedCount > 0
//                     ? "bg-amber-100 text-amber-600"
//                     : "bg-blue-100 text-blue-600"
//                 }
//             `}
//             >
//               {flaggedCount > 0 ? (
//                 <FiAlertTriangle className="text-xl" />
//               ) : (
//                 <FiFileText className="text-xl" />
//               )}
//             </div>

//             <div>
//               <h3
//                 className={`font-bold ${
//                   flaggedCount > 0 ? "text-amber-900" : "text-blue-900"
//                 }`}
//               >
//                 {flaggedCount > 0
//                   ? "Missing Marks Detected"
//                   : "Question Paper Ready"}
//               </h3>
//               <p
//                 className={`text-sm mt-0.5 ${
//                   flaggedCount > 0 ? "text-amber-700" : "text-blue-700"
//                 }`}
//               >
//                 {flaggedCount > 0
//                   ? `${flaggedCount} questions are missing marks. Please fix to ensure accurate grading.`
//                   : `${questionData.questions.length} questions extracted. You can edit them anytime.`}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate(`/review-questions/${paperId}`)}
//             className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-md shadow-sm transition-all flex items-center justify-center gap-2
//                 ${
//                   flaggedCount > 0
//                     ? "bg-amber-500 hover:bg-amber-600 text-white"
//                     : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
//                 }
//             `}
//           >
//             Review Questions <FiArrowRight />
//           </button>
//         </div>
//       )}

//       <label
//         htmlFor="answerUpload"
//         onDragOver={(e) => {
//           e.preventDefault();
//           setIsDragging(true);
//         }}
//         onDragLeave={(e) => {
//           e.preventDefault();
//           setIsDragging(false);
//         }}
//         onDrop={(e) => {
//           e.preventDefault();
//           setIsDragging(false);
//           const droppedFiles = Array.from(e.dataTransfer.files || []);
//           if (droppedFiles.length > 0) {
//             setFiles((prev) => [...prev, ...droppedFiles]);
//           }
//         }}
//         className={`
//           flex flex-col items-center justify-center 
//           w-full h-64 border-2 border-dashed rounded-md cursor-pointer transition-all duration-200
//           ${
//             isDragging
//               ? "border-blue-500 bg-blue-50 scale-[0.99]"
//               : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
//           }
//         `}
//       >
//         <div
//           className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
//             isDragging
//               ? "bg-blue-200 text-blue-700"
//               : "bg-white text-gray-400 shadow-sm"
//           }`}
//         >
//           <FiUpload className="text-2xl" />
//         </div>

//         <span className="text-gray-700 font-medium text-lg">
//           {isDragging ? "Drop files here..." : "Click or drag to upload"}
//         </span>
//         <span className="text-gray-400 text-sm mt-2">
//           Supports PDF, JPG, PNG
//         </span>

//         <input
//           id="answerUpload"
//           type="file"
//           multiple
//           accept=".pdf,.jpg,.jpeg,.png"
//           className="hidden"
//           onChange={(e) => {
//             if (!e.target.files) return;
//             const selected = Array.from(e.target.files);
//             setFiles((prev) => [...prev, ...selected]);
//           }}
//         />
//       </label>

//       {files.length > 0 && (
//         <div className="mt-8">
//           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
//             Attached Files ({files.length})
//           </h4>
//           <div className="grid grid-cols-1 gap-2">
//             {files.map((f, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors"
//               >
//                 <div className="flex items-center gap-3 overflow-hidden">
//                   <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-200 text-gray-500 shrink-0">
//                     <span className="text-[10px] font-bold">FILE</span>
//                   </div>
//                   <span className="text-sm text-gray-700 truncate font-medium">
//                     {f.name}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => removeFile(index)}
//                   className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-all"
//                   title="Remove file"
//                 >
//                   <FiX />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {message.type && (
//         <div
//           className={`mt-6 px-4 py-3 rounded-lg text-sm border flex items-start gap-3 animate-in fade-in slide-in-from-top-1
//           ${
//             message.type === "error"
//               ? "bg-red-50 text-red-700 border-red-200"
//               : message.type === "success"
//               ? "bg-green-50 text-green-700 border-green-200"
//               : "bg-blue-50 text-blue-700 border-blue-200"
//           }
//         `}
//         >
//           <span className="text-lg mt-0.5">
//             {message.type === "error" ? <FiAlertTriangle /> : <FiCheckCircle />}
//           </span>
//           <span className="font-medium">{message.text}</span>
//         </div>
//       )}

//       <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className={`px-6 py-2 rounded-md text-white font-medium shadow-sm transition-all flex items-center ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
//           }`}
//         >
//           {loading ? (
//             <>
//               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//               Processing...
//             </>
//           ) : (
//             <>
//               Evaluate
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnswerAPI } from "../api/answer.api";
import { QuestionAPI } from "../api/question.api";
import {
  FiUpload,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiX,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";

interface QuestionItem {
  text: string;
  marks: number | null;
  flagged?: boolean;
}

interface QuestionPaperData {
  questions: QuestionItem[];
}

type MessageType = "success" | "error" | "info" | null;

interface MessageState {
  type: MessageType;
  text: string;
}

type StrictnessLevel = "lenient" | "moderate" | "strict";

export default function AnswerPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionPaperData | null>(
    null
  );
  const [strictnessLevel, setStrictnessLevel] = useState<StrictnessLevel>("moderate");

  const [message, setMessage] = useState<MessageState>({
    type: null,
    text: "",
  });

  const showMessage = (type: MessageType, text: string) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    const loadQuestionPaper = async () => {
      if (!paperId) return;
      try {
        const res = await QuestionAPI.getQuestions(paperId);
        setQuestionData(res.data as QuestionPaperData);
      } catch {
        console.log("Failed to load question details");
      }
    };
    loadQuestionPaper();
  }, [paperId]);

  const flaggedCount =
    questionData?.questions.filter((q) => q.flagged === true).length || 0;

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!paperId) {
      showMessage("error", "Invalid question paper ID.");
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
        questionPaperId: paperId,
        files,
        strictnessLevel, // Pass strictness level
      });

      if (!res.success) {
        showMessage("error", res.message || "Submission failed.");
        setLoading(false);
        return;
      }

      navigate(`/results/${paperId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Something went wrong"
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-100 p-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Upload Answer Sheets
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload student answer sheets for AI evaluation
          </p>
        </div>
      </div>

      {questionData && (
        <div
          className={`mb-8 border rounded-md p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors
            ${
              flaggedCount > 0
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-100"
            }
        `}
        >
          <div className="flex gap-4">
            <div
              className={`p-2.5 rounded-full shrink-0 h-fit 
                ${
                  flaggedCount > 0
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600"
                }
            `}
            >
              {flaggedCount > 0 ? (
                <FiAlertTriangle className="text-xl" />
              ) : (
                <FiFileText className="text-xl" />
              )}
            </div>

            <div>
              <h3
                className={`font-bold ${
                  flaggedCount > 0 ? "text-amber-900" : "text-blue-900"
                }`}
              >
                {flaggedCount > 0
                  ? "Missing Marks Detected"
                  : "Question Paper Ready"}
              </h3>
              <p
                className={`text-sm mt-0.5 ${
                  flaggedCount > 0 ? "text-amber-700" : "text-blue-700"
                }`}
              >
                {flaggedCount > 0
                  ? `${flaggedCount} questions are missing marks. Please fix to ensure accurate grading.`
                  : `${questionData.questions.length} questions extracted. You can edit them anytime.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/review-questions/${paperId}`)}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-md shadow-sm transition-all flex items-center justify-center gap-2
                ${
                  flaggedCount > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }
            `}
          >
            Review Questions <FiArrowRight />
          </button>
        </div>
      )}

      
      <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <FiAward className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Marking Strictness</h3>
            <p className="text-sm text-gray-600">Choose how strict the AI should be when evaluating answers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setStrictnessLevel("lenient")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              strictnessLevel === "lenient"
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-200 bg-white hover:border-green-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Lenient</span>
              {strictnessLevel === "lenient" && (
                <FiCheckCircle className="text-green-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              Generous marking. Awards full credit for showing understanding, even with minor errors.
            </p>
          </button>

          <button
            onClick={() => setStrictnessLevel("moderate")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              strictnessLevel === "moderate"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Moderate</span>
              {strictnessLevel === "moderate" && (
                <FiCheckCircle className="text-blue-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              Balanced approach. Standard academic marking with fair partial credit.
            </p>
          </button>

          <button
            onClick={() => setStrictnessLevel("strict")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              strictnessLevel === "strict"
                ? "border-red-500 bg-red-50 shadow-md"
                : "border-gray-200 bg-white hover:border-red-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Strict</span>
              {strictnessLevel === "strict" && (
                <FiCheckCircle className="text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              Rigorous marking. Requires precision and complete answers for full marks.
            </p>
          </button>
        </div>
      </div>

      <label
        htmlFor="answerUpload"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFiles = Array.from(e.dataTransfer.files || []);
          if (droppedFiles.length > 0) {
            setFiles((prev) => [...prev, ...droppedFiles]);
          }
        }}
        className={`
          flex flex-col items-center justify-center 
          w-full h-64 border-2 border-dashed rounded-md cursor-pointer transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-[0.99]"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
          }
        `}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDragging
              ? "bg-blue-200 text-blue-700"
              : "bg-white text-gray-400 shadow-sm"
          }`}
        >
          <FiUpload className="text-2xl" />
        </div>

        <span className="text-gray-700 font-medium text-lg">
          {isDragging ? "Drop files here..." : "Click or drag to upload"}
        </span>
        <span className="text-gray-400 text-sm mt-2">
          Supports PDF, JPG, PNG
        </span>

        <input
          id="answerUpload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            if (!e.target.files) return;
            const selected = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selected]);
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Attached Files ({files.length})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {files.map((f, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-200 text-gray-500 shrink-0">
                    <span className="text-[10px] font-bold">FILE</span>
                  </div>
                  <span className="text-sm text-gray-700 truncate font-medium">
                    {f.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-all"
                  title="Remove file"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {message.type && (
        <div
          className={`mt-6 px-4 py-3 rounded-lg text-sm border flex items-start gap-3 animate-in fade-in slide-in-from-top-1
          ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }
        `}
        >
          <span className="text-lg mt-0.5">
            {message.type === "error" ? <FiAlertTriangle /> : <FiCheckCircle />}
          </span>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-md text-white font-medium shadow-sm transition-all flex items-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              Evaluate with {strictnessLevel.charAt(0).toUpperCase() + strictnessLevel.slice(1)} Marking
            </>
          )}
        </button>
      </div>
    </div>
  );
}