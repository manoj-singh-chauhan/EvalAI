import { useEffect, useState, useCallback } from "react";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiType,
  FiUploadCloud,
  FiActivity,
  FiTrendingUp,
  FiMoreVertical,
  FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // const loadSubmissions = useCallback(async (page: number = 1) => {
  //   try {
  //     setLoading(true);
  //     const data = await SubmissionAPI.getAll(page, 8);
  //     setSubmissions(data.submissions);
  //     setPagination(data.pagination);
  //     setupSocket(data.submissions);
  //   } finally {
  //     setLoading(false);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  const loadSubmissions = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);

        const data = await SubmissionAPI.getAll(page, pagination.limit);

        setSubmissions(data.submissions);

        setPagination({
          ...data.pagination,
          page, // frontend controls current page
        });
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  const setupSocket = useCallback(
    (items: SubmissionRecord[]) => {
      items.forEach((sub) => {
        const channel = `job-status-${sub.id}`;
        socket.off(channel);
        socket.on(channel, () => {
          loadSubmissions(pagination.page);
        });
      });
    },
    [loadSubmissions, pagination.page]
  );
  useEffect(() => {
    setupSocket(submissions);
  }, [submissions, setupSocket]);

  useEffect(() => {
    // loadSubmissions(1);
    loadSubmissions(pagination.page);

    return () => {
      submissions.forEach((sub) => {
        const channel = `job-status-${sub.id}`;
        socket.off(channel);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    await loadSubmissions(pagination.page);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await SubmissionAPI.delete(deleteId);
    await loadSubmissions(pagination.page);

    setShowConfirm(false);
    setDeleteId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadSubmissions(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  const getStats = () => {
    const completed = submissions.filter(
      (s) => s.status === "completed"
    ).length;

    const typedCount = submissions.filter((s) => s.mode === "typed").length;
    const uploadedCount = submissions.filter((s) => s.mode === "upload").length;

    return {
      total: pagination.total,
      completed,
      typedCount,
      uploadedCount,
    };
  };

  const stats = getStats();

  if (loading && pagination.page === 1) {
    return <Loader text="Loading activities..." />;
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
    <div className="h-screen  bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 
               hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 
               transition-all duration-200"
              >
                <FiArrowLeft size={20} />
              </button>

              <h1 className="text-2xl font-bold">Activity Log</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base ml-[52px]">
            Track your assessment history and performance results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded p-6 shadow-sm border border-gray-200/60">
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

          <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200/60 ">
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

          <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between">
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

              <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200/30">
                <FiTrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

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
              <div className="hidden lg:block overflow-x-auto custom-scroll">
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
                            {String(
                              // index + 1
                              (pagination.page - 1) * pagination.limit +
                                index +
                                1
                            ).padStart(2, "0")}
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
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl text-black font-bold text-md ">
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
                            <div className="relative">
                              <button
                                title="More Actions"
                                onClick={(e) => toggleMenu(s.id, e)}
                                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-gray-200"
                              >
                                <FiMoreVertical size={18} strokeWidth={2.5} />
                              </button>

                              {openMenuId === s.id && (
                                // <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                <div className="absolute right-full  top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      setDeleteId(s.id);
                                      setShowConfirm(true);
                                    }}
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
                            // <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                            <div className="absolute right-full  top-1/2 -translate-y-1/3 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setDeleteId(s.id);
                                  setShowConfirm(true);
                                }}
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
              {/* //pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Page{" "}
                    <span className="font-semibold">{pagination.page}</span> of{" "}
                    <span className="font-semibold">
                      {pagination.totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 text-gray-600 hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 hover:border-indigo-200"
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                            pagination.page === page
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-white border border-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 text-gray-600 hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 hover:border-indigo-200"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiTrash2 size={22} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delete Record</h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this record?
              <span className="font-semibold text-red-600">
                {" "}
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
