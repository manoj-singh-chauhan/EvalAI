import { useEffect, useState, useCallback } from "react";
import {
  // FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiType,
  FiUploadCloud,
  FiArrowRight,
  FiActivity
} from "react-icons/fi";
import { SubmissionAPI, type SubmissionRecord } from "../api/submission.api";
import { QuestionAPI } from "../api/question.api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import Loader from "../components/Loader";

const socket = io(SOCKET_URL, { autoConnect: true });

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSubmissions = useCallback(async () => {
    const data = await SubmissionAPI.getAll();
    setSubmissions(data);
  }, []);

  const setupSocket = useCallback(
    (items: SubmissionRecord[]) => {
      items.forEach((sub) => {
        const channel = `job-status-${sub.id}`;
        socket.off(channel);
        socket.on(channel, () => {
          loadSubmissions();
        });
      });
    },
    [loadSubmissions]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await SubmissionAPI.getAll();
        setSubmissions(data);
        setupSocket(data);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      submissions.forEach((sub) => {
        const channel = `job-status-${sub.id}`;
        socket.off(channel);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupSocket]);

  const handleRetry = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    await QuestionAPI.retryJob(submissionId);
    await loadSubmissions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: SubmissionRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
            <FiCheckCircle size={14} /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            <FiClock size={14} className="animate-spin-slow" /> Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
            <FiAlertCircle size={14} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
            <FiClock size={14} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return <Loader text="Loading activities..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Activity Log
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Track your assessment history and performance results.
            </p>
          </div>
          
        </div>

        
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <FiActivity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                You haven't submitted any assessments yet. Start a new quiz to see your results here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Submission Mode
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s, index) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/submissions/${s.id}`)}
                      className="group hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            s.mode === 'typed' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {s.mode === "typed" ? <FiType size={18} /> : <FiUploadCloud size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {s.mode === "typed" ? "Typed Response" : "File Upload"}
                            </p>
                            {/* <p className="text-xs text-gray-500">ID: {s.id.slice(-6)}</p> */}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        {s.marks !== undefined && s.marks !== null ? (
                          <span className="text-sm font-bold text-gray-900">
                            {s.marks}
                          </span>
                        ) : (
                          <span className="text-2xl text-gray-300 leading-none">&middot;&middot;&middot;</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(s.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="text-sm text-gray-500">
                          {formatDate(s.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="View Details"
                            onClick={() => navigate(`/submissions/${s.id}`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <FiArrowRight size={18} />
                          </button>

                          {s.status === "failed" && (
                            <button
                              title="Retry Submission"
                              onClick={(e) => handleRetry(s.id, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FiRefreshCw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}