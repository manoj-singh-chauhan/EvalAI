import { useEffect, useState, useCallback } from "react";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiType,
  FiUploadCloud,
  FiActivity,
  // FiTrendingUp,
  FiMoreVertical,
  FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  // FiFilter,
  // FiX,
} from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SubmissionAPI, type SubmissionRecord } from "../api/submission.api";
import { QuestionAPI } from "../api/question.api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const socket = io(SOCKET_URL, { autoConnect: true });

interface FilterState {
  mode?: "typed" | "upload";
  status?: "pending" | "processing" | "completed" | "failed";
  startDate?: string;
  endDate?: string;
}

type FilterValue =
  | "typed"
  | "upload"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | string
  | undefined;

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // const [showFilters, setShowFilters] = useState(true);
  const showFilters = true;
  const [filters, setFilters] = useState<FilterState>({});
  const navigate = useNavigate();

  const loadSubmissions = useCallback(
    async (page: number = 1) => {
      try {
        // if (page === 0) setLoading(true);
        if (submissions.length === 0) setLoading(true);
        const data = await SubmissionAPI.getAll(page, pagination.limit, {
          mode: filters.mode,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        setSubmissions(data.submissions);
        setPagination({
          ...data.pagination,
          page,
        });
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, filters, submissions.length],
  );

  const setupSocket = useCallback(
    (items: SubmissionRecord[]) => {
      items.forEach((sub) => {
        if (sub.status === "processing" || sub.status === "pending") {
          const channel = `job-status-${sub.id}`;
          socket.off(channel);

          socket.on(channel, () => {
            loadSubmissions(pagination.page);
          });
        }
      });
    },
    [loadSubmissions, pagination.page],
  );

  useEffect(() => {
    setupSocket(submissions);

    return () => {
      submissions.forEach((sub) => {
        socket.off(`job-status-${sub.id}`);
      });
    };
  }, [submissions, setupSocket]);

  useEffect(() => {
    loadSubmissions(pagination.page);
  }, [pagination.page, filters, loadSubmissions]);

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

    try {
      await QuestionAPI.retryJob(submissionId);
      await loadSubmissions(pagination.page);
      // toast.success("Retry started successfully!");
    } catch (err: unknown) {
      const res = (
        err as {
          response?: {
            status?: number;
            data?: { message?: string; error_code?: string };
          };
        }
      ).response;
      const msg = res?.data?.message || "Failed to retry job.";
      if (
        res &&
        res.status === 403 &&
        res.data?.error_code === "DAILY_LIMIT_EXCEEDED"
      ) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2 items-start">
              <span>{msg}</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/billing");
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
              >
                Unlock more usage
              </button>
            </div>
          ),
          { duration: 3000 },
        );
      } else {
        toast.error(msg);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await SubmissionAPI.delete(deleteId);
    await loadSubmissions(pagination.page);
    setShowConfirm(false);
    setDeleteId(null);
  };

  // const handlePageChange = (newPage: number) => {
  //   if (newPage >= 1 && newPage <= pagination.totalPages) {
  //     loadSubmissions(newPage);
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //   }
  // };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((p) => ({ ...p, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleMenu = (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === submissionId ? null : submissionId);
  };

  const handleFilterChange = (key: keyof FilterState, value: FilterValue) => {
    setPagination((p) => ({ ...p, page: 1 }));
    if (value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  // const clearFilters = () => {
  //   setPagination((p) => ({ ...p, page: 1 }));
  //   setFilters({});
  // };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "",
  );

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

  const renderPageButtons = () => {
    const buttons = [];
    const { page, totalPages } = pagination;

    buttons.push(1);

    if (page > 2) buttons.push("...");

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (!buttons.includes(i)) buttons.push(i);
    }

    if (page < totalPages - 2) buttons.push("...");

    if (totalPages > 1 && !buttons.includes(totalPages))
      buttons.push(totalPages);

    return buttons.map((p, index) => (
      <button
        key={index}
        onClick={() => typeof p === "number" && handlePageChange(p)}
        disabled={typeof p !== "number"}
        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
          pagination.page === p
            ? "bg-indigo-600 text-white"
            : p === "..."
              ? "text-gray-400 cursor-default"
              : "text-gray-700 hover:bg-white border border-gray-200"
        }`}
      >
        {p}
      </button>
    ));
  };

  if (loading && pagination.page === 1) {
    return <Loader text="Loading records..." />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 
               hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 
               transition-all duration-200"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">User Dashboard</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base ml-[52px]">
            Review your recent submissions and AI-generated scores.
          </p>
        </div>

        <div className="mb-6">
          {showFilters && (
            <div className="mt-4 bg-white rounded-md shadow-sm border border-gray-200/60 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Submission Mode
                  </label>
                  <select
                    value={filters.mode || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "mode",
                        e.target.value as "typed" | "upload" | "",
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Modes</option>
                    <option value="typed">Typed Response</option>
                    <option value="upload">File Upload</option>
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Submission Mode
                  </label>

                  <Select
                    value={filters.mode || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("mode", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Modes" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="typed">Typed Response</SelectItem>
                      <SelectItem value="upload">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "status",
                        e.target.value as
                          | "pending"
                          | "processing"
                          | "completed"
                          | "failed"
                          | "",
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>

                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("status", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiX size={16} />
                    Clear Filters
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200/60 overflow-hidden">
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl mb-6 border border-indigo-100/50">
                <FiActivity className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No record found
              </h3>
              <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                {hasActiveFilters
                  ? "No submissions match your filters. Try adjusting your criteria."
                  : "You haven't submitted any assessments yet. Start a new quiz to see your results here."}
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
                      {/* <th className="py-4 px-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th> */}
                      <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                              (pagination.page - 1) * pagination.limit +
                                index +
                                1,
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
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl text-black font-bold text-md">
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

                        {/* <td className="py-5 px-6 text-right">
                          <span className="text-sm text-gray-700 font-semibold">
                            {formatDate(s.createdAt)}
                          </span>
                        </td> */}
                        <td className="py-5 px-6 text-center">
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
                                <div className="absolute right-full top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
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
                            <div className="absolute right-full top-1/2 -translate-y-1/3 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
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

                    {/* <div className="flex items-center gap-1">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1,
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
                    </div> */}
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {renderPageButtons()}
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
