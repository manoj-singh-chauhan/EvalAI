// import { useEffect, useState, useCallback } from "react";
// import {
//   FiArrowLeft,
//   FiClock,
//   FiUploadCloud,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiZap,
//   FiRefreshCw,
//   FiFilter,
//   FiX,
//   FiCalendar,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";

// export default function ActivityPage() {
//   const navigate = useNavigate();
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     type: "all",
//     dateRange: "all",
//   });
//   const [showFilters, setShowFilters] = useState(false);

//   // Simulated API call - replace with real API
//   useEffect(() => {
//     const loadActivities = async () => {
//       setLoading(true);
//       try {
//         // Replace with actual API call
//         // const data = await ActivityAPI.getAll(filters);
        
//         // Demo data
//         const demoActivities = [
//           {
//             id: 1,
//             type: "upload",
//             title: "File Uploaded Successfully",
//             description: "You uploaded 'Operating_Systems_Final.pdf' for evaluation.",
//             timestamp: new Date(Date.now() - 2 * 60000),
//             metadata: {
//               fileName: "Operating_Systems_Final.pdf",
//               fileSize: "2.4 MB",
//             },
//             status: "success",
//           },
//           {
//             id: 2,
//             type: "completed",
//             title: "Evaluation Completed",
//             description: "AI finished marking your submission. Score: 85/100",
//             timestamp: new Date(Date.now() - 60 * 60000),
//             metadata: {
//               submissionId: "SUB-12345",
//               score: 85,
//               maxScore: 100,
//             },
//             status: "success",
//           },
//           {
//             id: 3,
//             type: "warning",
//             title: "Daily Limit Warning",
//             description: "You have used 80% of your daily AI evaluation credits.",
//             timestamp: new Date(Date.now() - 5 * 60 * 60000),
//             metadata: {
//               used: 16,
//               total: 20,
//             },
//             status: "warning",
//           },
//           {
//             id: 4,
//             type: "processing",
//             title: "Evaluation in Progress",
//             description: "Your submission 'Typed Response #08' is being evaluated.",
//             timestamp: new Date(Date.now() - 10 * 60 * 60000),
//             metadata: {
//               submissionId: "SUB-12346",
//               progress: 65,
//             },
//             status: "processing",
//           },
//           {
//             id: 5,
//             type: "failed",
//             title: "Evaluation Failed",
//             description: "Failed to process your PDF file. Please try again.",
//             timestamp: new Date(Date.now() - 24 * 60 * 60000),
//             metadata: {
//               errorCode: "INVALID_FORMAT",
//               retryAvailable: true,
//             },
//             status: "error",
//           },
//           {
//             id: 6,
//             type: "upload",
//             title: "File Uploaded Successfully",
//             description: "You uploaded 'Database_Assignment.pdf' for evaluation.",
//             timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
//             metadata: {
//               fileName: "Database_Assignment.pdf",
//               fileSize: "1.8 MB",
//             },
//             status: "success",
//           },
//         ];

//         setActivities(demoActivities);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadActivities();
//   }, [filters]);

//   const getActivityIcon = (type) => {
//     switch (type) {
//       case "upload":
//         return <FiUploadCloud size={20} />;
//       case "completed":
//         return <FiCheckCircle size={20} />;
//       case "processing":
//         return <FiRefreshCw size={20} />;
//       case "warning":
//         return <FiZap size={20} />;
//       case "failed":
//         return <FiAlertCircle size={20} />;
//       default:
//         return <FiClock size={20} />;
//     }
//   };

//   const getActivityColor = (type) => {
//     switch (type) {
//       case "upload":
//         return {
//           bg: "bg-blue-50",
//           icon: "text-blue-600",
//           border: "border-blue-200",
//           badge: "bg-blue-100 text-blue-700",
//         };
//       case "completed":
//         return {
//           bg: "bg-emerald-50",
//           icon: "text-emerald-600",
//           border: "border-emerald-200",
//           badge: "bg-emerald-100 text-emerald-700",
//         };
//       case "processing":
//         return {
//           bg: "bg-indigo-50",
//           icon: "text-indigo-600",
//           border: "border-indigo-200",
//           badge: "bg-indigo-100 text-indigo-700",
//         };
//       case "warning":
//         return {
//           bg: "bg-amber-50",
//           icon: "text-amber-600",
//           border: "border-amber-200",
//           badge: "bg-amber-100 text-amber-700",
//         };
//       case "failed":
//         return {
//           bg: "bg-red-50",
//           icon: "text-red-600",
//           border: "border-red-200",
//           badge: "bg-red-100 text-red-700",
//         };
//       default:
//         return {
//           bg: "bg-gray-50",
//           icon: "text-gray-600",
//           border: "border-gray-200",
//           badge: "bg-gray-100 text-gray-700",
//         };
//     }
//   };

//   const formatTime = (date) => {
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <button
//               onClick={() => navigate(-1)}
//               className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 
//                hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 
//                transition-all duration-200"
//             >
//               <FiArrowLeft size={20} />
//             </button>
//             <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
//           </div>
//           <p className="text-gray-600 text-sm sm:text-base ml-[52px]">
//             Track all your submissions, evaluations, and platform activity.
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//           <div className="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Total Activities
//               </p>
//               <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
//                 <FiClock size={16} />
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Completed
//               </p>
//               <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
//                 <FiCheckCircle size={16} />
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">
//               {activities.filter((a) => a.type === "completed").length}
//             </p>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Credits Used
//               </p>
//               <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
//                 <FiZap size={16} />
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">16 / 20</p>
//           </div>
//         </div>

//         {/* Filter Section */}
//         <div className="mb-6 flex items-center justify-between">
//           <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 
//              bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <FiFilter size={16} />
//             Filter
//           </button>
//         </div>

//         {showFilters && (
//           <div className="bg-white rounded-xl border border-gray-200/60 p-5 mb-6 shadow-sm">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Activity Type
//                 </label>
//                 <select
//                   value={filters.type}
//                   onChange={(e) =>
//                     setFilters({ ...filters, type: e.target.value })
//                   }
//                   className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm 
//                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="all">All Activities</option>
//                   <option value="upload">File Uploads</option>
//                   <option value="completed">Completed</option>
//                   <option value="processing">Processing</option>
//                   <option value="warning">Warnings</option>
//                   <option value="failed">Failed</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Date Range
//                 </label>
//                 <select
//                   value={filters.dateRange}
//                   onChange={(e) =>
//                     setFilters({ ...filters, dateRange: e.target.value })
//                   }
//                   className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm 
//                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="all">All Time</option>
//                   <option value="today">Today</option>
//                   <option value="week">Last 7 Days</option>
//                   <option value="month">Last 30 Days</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Activity Timeline */}
//         <div className="space-y-4">
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="inline-block">
//                 <FiRefreshCw
//                   size={32}
//                   className="text-indigo-600 animate-spin"
//                 />
//               </div>
//               <p className="mt-3 text-gray-600 font-semibold">
//                 Loading activities...
//               </p>
//             </div>
//           ) : activities.length === 0 ? (
//             <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
//               <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
//                 <FiClock size={24} className="text-indigo-400" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-2">
//                 No activities yet
//               </h3>
//               <p className="text-gray-600 text-sm">
//                 Your activity feed will appear here as you submit and evaluate
//                 assessments.
//               </p>
//             </div>
//           ) : (
//             activities.map((activity, index) => {
//               const colors = getActivityColor(activity.type);
//               return (
//                 <div
//                   key={activity.id}
//                   className={`bg-white rounded-xl border ${colors.border} p-5 
//                    hover:shadow-md transition-all duration-200 group`}
//                 >
//                   <div className="flex gap-4">
//                     {/* Icon */}
//                     <div
//                       className={`flex-shrink-0 w-12 h-12 rounded-lg 
//                        flex items-center justify-center ${colors.bg} ${colors.icon} 
//                        group-hover:scale-110 transition-transform`}
//                     >
//                       {getActivityIcon(activity.type)}
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-3 mb-1">
//                         <h3 className="font-bold text-gray-900 text-sm sm:text-base">
//                           {activity.title}
//                         </h3>
//                         <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
//                           {formatTime(activity.timestamp)}
//                         </span>
//                       </div>

//                       <p className="text-sm text-gray-600 mb-3 leading-relaxed">
//                         {activity.description}
//                       </p>

//                       {/* Metadata based on type */}
//                       {activity.metadata && (
//                         <div className="flex flex-wrap gap-2 mb-3">
//                           {activity.type === "upload" && (
//                             <>
//                               <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
//                                 {activity.metadata.fileName}
//                               </span>
//                               <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
//                                 {activity.metadata.fileSize}
//                               </span>
//                             </>
//                           )}

//                           {activity.type === "completed" && (
//                             <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold">
//                               Score: {activity.metadata.score}/{activity.metadata.maxScore}
//                             </span>
//                           )}

//                           {activity.type === "processing" && (
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div
//                                 className="bg-indigo-600 h-2 rounded-full transition-all"
//                                 style={{
//                                   width: `${activity.metadata.progress}%`,
//                                 }}
//                               ></div>
//                             </div>
//                           )}

//                           {activity.type === "warning" && (
//                             <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-medium">
//                               {activity.metadata.used} / {activity.metadata.total} used
//                             </span>
//                           )}

//                           {activity.type === "failed" && (
//                             <button className="text-xs bg-red-100 text-red-700 hover:bg-red-200 
//                              px-2.5 py-1 rounded-md font-medium transition-colors">
//                               Retry
//                             </button>
//                           )}
//                         </div>
//                       )}

//                       {/* Action button */}
//                       <button
//                         className="text-xs font-bold text-indigo-600 hover:text-indigo-800 
//                          uppercase tracking-wide transition-colors"
//                       >
//                         View Details →
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* Load More */}
//         {!loading && activities.length > 0 && (
//           <div className="mt-8 text-center">
//             <button
//               className="px-6 py-3 bg-white border border-gray-300 text-gray-700 
//                rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//             >
//               Load More Activities
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

function ActivityPage(){
    return (
        <>
        <h1>activity page</h1>
        </>
    )
}
export default ActivityPage;