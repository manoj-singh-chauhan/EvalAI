import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiInfo,
  FiArrowLeft,
  FiExternalLink,
  FiCreditCard,
  FiFileText,
  FiCpu,
} from "react-icons/fi";
import { ActivityAPI, ActivityRecord } from "../api/activity.api";
import { SOCKET_URL } from "../config/env";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-react";

const socket = io(SOCKET_URL);

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  const fetchActivities = async () => {
    try {
      const data = await ActivityAPI.getAll();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchActivities();
    const channel = `activity-update-${user.id}`;

    socket.on(channel, (newLog: ActivityRecord) => {
      setActivities((prev) => [newLog, ...prev]);
    });

    return () => {
      socket.off(channel);
    };
  }, [user]);

  const getStatusConfig = (status: string, type: string) => {
    switch (status) {
      case "success":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          icon: <FiCheckCircle />,
        };
      case "failed":
        return {
          color: "text-red-500",
          bg: "bg-red-50",
          icon: <FiAlertCircle />,
        };
      case "processing":
        return {
          color: "text-blue-500",
          bg: "bg-blue-50 animate-pulse",
          icon: <FiClock className="animate-spin" />,
        };
      default:
        return {
          color: "text-indigo-500",
          bg: "bg-indigo-50",
          icon: type === "PAYMENT" ? <FiCreditCard /> : <FiInfo />,
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUBMISSION":
        return <FiFileText className="text-gray-400" />;
      case "EVALUATION":
        return <FiCpu className="text-gray-400" />;
      case "PAYMENT":
        return <FiCreditCard className="text-gray-400" />;
      default:
        return <FiActivity className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-transparent">
      <div className="max-w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 
              hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 
              transition-all duration-200 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Platform Activity
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor your AI extractions and system events in real-time.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {activities.length === 0 && !loading ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-md p-16 text-center ml-12">
                <FiActivity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  No activity recorded yet.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Your AI interactions will appear here.
                </p>
              </div>
            ) : (
              activities.map((item) => {
                const config = getStatusConfig(item.status, item.type);
                return (
                  <div
                    key={item.id}
                    className="relative flex items-start gap-6 group"
                  >
                    <div
                      className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-gray-50 
                        flex items-center justify-center text-lg ${config.bg} ${config.color} shadow-sm`}
                    >
                      {config.icon}
                    </div>

                    <div
                      className="flex-grow bg-white border border-gray-200 rounded-lg p-5 shadow-sm 
                      hover:border-teal-200 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            {getTypeIcon(item.type)} {item.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base leading-tight flex items-center gap-2">
                        {item.title}
                        {item.type === "EVALUATION" &&
                          item.status === "success" && (
                            <span className="bg-teal-100 text-teal-700 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                              Graded
                            </span>
                          )}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mt-1.5">
                        {item.description}
                      </p>

                      {item.linkId && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          {/* <button
                            onClick={() => {
                              if (item.type === "SUBMISSION") {
                                navigate(`/submissions/${item.linkId}`);
                              } else if (item.type === "EVALUATION") {
                                navigate(`/results/${item.linkId}`);
                              } else {
                                navigate(`/activity`);
                              }
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            <FiExternalLink size={14} />
                            VIEW DETAILS
                          </button> */}
                          <button
  onClick={() => {
    if (item.type === "SUBMISSION") {
      navigate(`/submissions/${item.linkId}`);
    } 
    else if (item.type === "EVALUATION") {
      // If the job is finished, go to the specific sheet
      if (item.status === "success") {
        navigate(`/results/sheet/${item.linkId}`);
      } 
      // If it's still processing or queued, go to the dashboard
      // Note: This requires the linkId to be the PaperID for 'info' status
      else {
        navigate(`/results/${item.linkId}`);
      }
    } 
    else {
      navigate(`/activity`);
    }
  }}
  className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
>
  <FiExternalLink size={14} />
  VIEW DETAILS
</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
