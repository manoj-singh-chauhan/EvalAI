import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/admin.api';
import { 
  FiArrowLeft, FiMail, FiCalendar, FiCheckCircle, 
  FiAlertCircle, FiClock, FiType, FiUploadCloud, FiEye,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: number;
  status: string;
  imageUrl: string;
}

interface RecentSubmission {
  id: string;
  status: string;
  mode: string;
  totalMarks: number;
  createdAt: number;
}

interface UserActivity {
  userId: string;
  summary: {
    totalQuestionPapers: number;
    completedPapers: number;
    failedPapers: number;
    pendingPapers: number;
    totalAnswerSheets: number;
    completedAnswerSheets: number;
    failedAnswerSheets: number;
  };
  allSubmissions: RecentSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  health: {
    failureRate: number;
    hasIssues: boolean;
  };
}

const AdminUserActivityPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        const usersData = await AdminAPI.getAllUsers();
        const foundUser = usersData.users.find((u: User) => u.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        }

        const activityData = await AdminAPI.getUserActivity(userId, 1, 8);
        if (activityData.success) {
          setActivity(activityData);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handlePageChange = async (newPage: number) => {
    if (!activity || newPage < 1 || newPage > activity.pagination.totalPages) return;
    
    setLoading(true);
    try {
      const activityData = await AdminAPI.getUserActivity(userId!, newPage, 8);
      if (activityData.success) {
        setActivity(activityData);
      }
    } catch (err) {
      console.error('Error loading page:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold border border-emerald-200/50">
            <FiCheckCircle size={12} /> Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold border border-blue-200/50">
            <FiClock size={12} className="animate-spin" /> Processing
          </span>
        );
      case 'failed':
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/admin')}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <FiArrowLeft size={20} />
            Back to Users
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = activity ? {
    total: activity.summary.totalQuestionPapers,
    typed: activity.allSubmissions.filter(s => s.mode === 'typed').length,
    uploaded: activity.allSubmissions.filter(s => s.mode === 'upload').length,
  } : { total: 0, typed: 0, uploaded: 0 };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-1350pxl mx-auto px-q sm:px-6 lg:px-8 py-6 sm:py-8">
        {user && (
          <div className="bg-white rounded shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                }}
              />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <div className="space-y-1 text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <FiMail size={16} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={16} />
                    <span className="text-sm">Joined {formatDate(user.joinedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {user.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">Total Papers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <FiType size={18} />
                  <span className="text-sm sm:text-base">Typed: {stats.typed}</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiType className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <FiUploadCloud size={18} />
                  <span className="text-sm sm:text-base">Uploaded: {stats.uploaded}</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiUploadCloud className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Mode</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Total Marks</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!activity?.allSubmissions || activity.allSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No question papers found
                    </td>
                  </tr>
                ) : (
                  activity.allSubmissions.map((paper, idx) => (
                    <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-sm font-bold text-gray-400">
                        {String(
                          (activity.pagination.page - 1) * activity.pagination.limit + idx + 1
                        ).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${
                            paper.mode === 'typed'
                              ? 'bg-indigo-500/10 text-indigo-600'
                              : 'bg-orange-500/10 text-orange-600'
                          }`}>
                            {paper.mode === 'typed' ? (
                              <FiType size={18} />
                            ) : (
                              <FiUploadCloud size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {paper.mode === 'typed' ? 'Typed Response' : 'File Upload'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {paper.mode === 'typed' ? 'Manual entry' : 'Document submission'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {paper.totalMarks !== undefined ? (
                          <span className="text-sm font-bold text-gray-900">{paper.totalMarks}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {getStatusBadge(paper.status)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm text-gray-700 font-semibold">
                          {formatDate(paper.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => navigate(`/submissions/${paper.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden divide-y divide-gray-100">
            {!activity?.allSubmissions || activity.allSubmissions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No question papers found
              </div>
            ) : (
              activity.allSubmissions.map((paper, idx) => (
                <div key={paper.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-bold text-gray-400">
                        #{String((activity.pagination.page - 1) * activity.pagination.limit + idx + 1).padStart(2, '0')}
                      </span>
                      <div className={`p-2 rounded-lg ${
                        paper.mode === 'typed'
                          ? 'bg-indigo-500/10 text-indigo-600'
                          : 'bg-orange-500/10 text-orange-600'
                      }`}>
                        {paper.mode === 'typed' ? (
                          <FiType size={16} />
                        ) : (
                          <FiUploadCloud size={16} />
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/submissions/${paper.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <FiEye size={16} />
                      View
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-900">
                      {paper.mode === 'typed' ? 'Typed Response' : 'File Upload'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{formatDate(paper.createdAt)}</span>
                      {paper.totalMarks !== undefined && (
                        <span className="font-semibold">{paper.totalMarks} marks</span>
                      )}
                    </div>
                    <div className="pt-2">
                      {getStatusBadge(paper.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {activity && activity.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{activity.pagination.page}</span> of{" "}
                <span className="font-semibold">{activity.pagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(activity.pagination.page - 1)}
                  disabled={activity.pagination.page === 1}
                  className="p-2 text-gray-600 hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 hover:border-indigo-200"
                >
                  <FiChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: activity.pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                        activity.pagination.page === page
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 hover:bg-white border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(activity.pagination.page + 1)}
                  disabled={activity.pagination.page === activity.pagination.totalPages}
                  className="p-2 text-gray-600 hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 hover:border-indigo-200"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserActivityPage;