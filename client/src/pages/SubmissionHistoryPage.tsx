import { useEffect, useState, useCallback } from "react";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiType,
  FiUploadCloud,
  // FiArrowRight,
  FiActivity,
  FiTrendingUp,
  FiMoreVertical,
  FiTrash2,
  FiEye,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const handleRetry = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    await QuestionAPI.retryJob(submissionId);
    await loadSubmissions();
  };

  const handleDelete = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // TODO: Implement delete functionality
    console.log("Delete submission:", submissionId);
    // await SubmissionAPI.delete(submissionId);
    // await loadSubmissions();
  };

  const toggleMenu = (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === submissionId ? null : submissionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: SubmissionRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold border border-emerald-200/50">
            <FiCheckCircle size={12} /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold border border-blue-200/50">
            <FiClock size={12} className="animate-spin" /> Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 text-xs font-semibold border border-red-200/50">
            <FiAlertCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-700 text-xs font-semibold border border-gray-200/50">
            <FiClock size={12} /> Pending
          </span>
        );
    }
  };

  // const getStats = () => {
  //   const completed = submissions.filter(s => s.status === 'completed').length;
  //   const avgScore = submissions
  //     .filter(s => s.marks !== null && s.marks !== undefined)
  //     .reduce((acc, s) => acc + (s.marks || 0), 0) / Math.max(completed, 1);

  //   return { total: submissions.length, completed, avgScore: avgScore.toFixed(1) };
  // };

  const getStats = () => {
    const completed = submissions.filter(
      (s) => s.status === "completed"
    ).length;

    const typedCount = submissions.filter((s) => s.mode === "typed").length;
    const uploadedCount = submissions.filter((s) => s.mode === "upload").length;

    return {
      total: submissions.length,
      completed,
      typedCount,
      uploadedCount,
    };
  };

  const stats = getStats();

  if (loading) {
    return <Loader text="Loading activities..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md shadow-lg shadow-indigo-500/25">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Activity Log
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base ml-[52px]">
            Track your assessment history and performance results.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200/60 hover:shadow-lg hover:border-blue-300/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Total Submissions
                </p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {stats.total}
                </p>
              </div>
              <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-md border border-blue-200/30">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200/60 hover:shadow-lg hover:border-emerald-300/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-md border border-emerald-200/30">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200/60 hover:shadow-lg hover:border-indigo-300/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              {/* <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">Average Score</p>
                <p className="text-3xl font-bold text-indigo-600 tracking-tight">{stats.avgScore}</p>
              </div> */}
              {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all"> */}
              {/* <p className="text-gray-600 text-sm font-semibold mb-3">Submission Types</p> */}

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <FiType />
                  <span>Typed: {stats.typedCount}</span>
                </div>

                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <FiUploadCloud />
                  <span>Uploaded: {stats.uploadedCount}</span>
                </div>
              </div>

              {/* </div> */}

              <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/30">
                <FiTrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200/60 overflow-hidden">
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl mb-6 border border-indigo-100/50">
                <FiActivity className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No activities found
              </h3>
              <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                You haven't submitted any assessments yet. Start a new quiz to
                see your results here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Submission Mode
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total marks
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((s, index) => (
                      <tr
                        key={s.id}
                        onClick={() => navigate(`/submissions/${s.id}`)}
                        className="group hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-purple-50/20 transition-all duration-200 cursor-pointer"
                      >
                        <td className="py-5 px-6">
                          <span className="text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-xl shadow-sm ${
                                s.mode === "typed"
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                                  : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                              }`}
                            >
                              {s.mode === "typed" ? (
                                <FiType size={18} />
                              ) : (
                                <FiUploadCloud size={18} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {s.mode === "typed"
                                  ? "Typed Response"
                                  : "File Upload"}
                              </p>
                              <p className="text-xs text-gray-500 font-medium">
                                {s.mode === "typed"
                                  ? "Manual entry"
                                  : "Document submission"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-6 text-center">
                          {s.marks !== undefined && s.marks !== null ? (
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl  text-black font-bold text-md ">
                              {s.marks}
                            </div>
                          ) : (
                            <span className="text-2xl text-gray-300 leading-none">
                              &middot;&middot;&middot;
                            </span>
                          )}
                        </td>

                        <td className="py-5 px-6 text-center">
                          {getStatusBadge(s.status)}
                        </td>

                        <td className="py-5 px-6 text-right">
                          <span className="text-sm text-gray-700 font-semibold">
                            {formatDate(s.createdAt)}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-center">
                          <div
                            className="flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* <button
                              title="View Details"
                              onClick={() => navigate(`/submissions/${s.id}`)}
                              className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-indigo-200"
                            >
                              <FiArrowRight size={18} strokeWidth={2.5} />
                            </button> */}

                            {/* Three Dots Menu */}
                            <div className="relative">
                              <button
                                title="More Actions"
                                onClick={(e) => toggleMenu(s.id, e)}
                                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-gray-200"
                              >
                                <FiMoreVertical size={18} strokeWidth={2.5} />
                              </button>

                              {/* Dropdown Menu */}
                              {openMenuId === s.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                  <button
                                    onClick={() =>
                                      navigate(`/submissions/${s.id}`)
                                    }
                                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                                  >
                                    <FiEye size={16} />
                                    View Details
                                  </button>

                                  {s.status === "failed" && (
                                    <button
                                      onClick={(e) => handleRetry(s.id, e)}
                                      className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors border-t border-gray-100"
                                    >
                                      <FiRefreshCw size={16} />
                                      Retry Submission
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => handleDelete(s.id, e)}
                                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                                  >
                                    <FiTrash2 size={16} />
                                    Delete Record
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {submissions.map((s, index) => (
                  <div
                    key={s.id}
                    className="p-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 transition-all duration-200 active:scale-[0.98]"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <div
                          className={`p-2 rounded-lg shadow-sm ${
                            s.mode === "typed"
                              ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                              : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                          }`}
                        >
                          {s.mode === "typed" ? (
                            <FiType size={16} />
                          ) : (
                            <FiUploadCloud size={16} />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(s.status)}

                        {/* Three Dots Menu for Mobile */}
                        <div
                          className="relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => toggleMenu(s.id, e)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiMoreVertical size={18} />
                          </button>

                          {openMenuId === s.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                              <button
                                onClick={() => navigate(`/submissions/${s.id}`)}
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3"
                              >
                                <FiEye size={16} />
                                View Details
                              </button>

                              {s.status === "failed" && (
                                <button
                                  onClick={(e) => handleRetry(s.id, e)}
                                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 border-t border-gray-100"
                                >
                                  <FiRefreshCw size={16} />
                                  Retry Submission
                                </button>
                              )}

                              <button
                                onClick={(e) => handleDelete(s.id, e)}
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100"
                              >
                                <FiTrash2 size={16} />
                                Delete Record
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      onClick={() => navigate(`/submissions/${s.id}`)}
                      className="space-y-2 mb-3 cursor-pointer"
                    >
                      <p className="text-sm font-bold text-gray-900">
                        {s.mode === "typed" ? "Typed Response" : "File Upload"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="font-semibold">
                          {formatDate(s.createdAt)}
                        </span>
                        {s.marks !== undefined && s.marks !== null && (
                          <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-sm border border-white">
                            Total marks: {s.marks}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
