import { useEffect, useState, useCallback } from "react";
import {
  FiFileText,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { SubmissionAPI, type SubmissionRecord } from "../api/submission.api";
import { QuestionAPI } from "../api/question.api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env";

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
      const data = await SubmissionAPI.getAll();
      setSubmissions(data);
      setupSocket(data);
      setLoading(false);
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

  const handleRetry = async (submissionId: string) => {
    await QuestionAPI.retryJob(submissionId);
    await loadSubmissions();
  };

  const getStatusBadge = (status: SubmissionRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-1">
            <FiCheckCircle /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold flex items-center gap-1">
            <FiClock /> Processing…
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold flex items-center gap-1">
            <FiAlertTriangle /> Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
            Pending
          </span>
        );
    }
  };

  if (loading) {
    // return <p className="p-10 text-gray-600">Loading submissions…</p>;
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
       Activities
      </h1>

      <div className="bg-white border rounded-md shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-4 text-left">Id</th>
              <th className="p-4 text-left">Mode</th>
              <th className="p-4 text-center">Marks</th>
              <th className="p-4 text-center">Status</th>
              {/* <th className="p-4 text-center">Attempt</th> */}
              <th className="p-4 text-center">Date</th>
              <th className="p-4 text-center">View</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((s,index) => (
              <tr key={s.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4">
                  {/* <div className="text-sm text-gray-500 capitalize">
                    {s.mode === "typed" ? "Typed Paper" : "Uploaded Paper"}
                  </div> */}
                  {/* <div className="text-xs text-gray-400">ID: {s.id}</div> */}
                  <div className="text-xs text-gray-400">{index+1}</div>
                </td>

                <td>
                    <div className="text-sm text-gray-500 capitalize">
                    {s.mode === "typed" ? "Typed" : "Uploaded"}
                  </div>
                </td>

                <td className="p-4 text-center text-gray-700">
                  {s.marks ?? "--"}
                </td>

                <td className="p-4 text-center">{getStatusBadge(s.status)}</td>

                {/* <td className="p-4 text-center">working</td> */}

                <td className="p-4 text-center text-gray-700">
                  {new Date(s.createdAt).toLocaleString()}
                </td>

                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      className="p-2 rounded hover:bg-gray-200"
                      onClick={() => navigate(`/submissions/${s.id}`)}
                    >
                      <FiFileText />
                    </button>

                    {s.status === "failed" && (
                      <button
                        className="p-2 rounded hover:bg-gray-200"
                        onClick={() => handleRetry(s.id)}
                      >
                        <FiRefreshCw className="text-red-700" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
