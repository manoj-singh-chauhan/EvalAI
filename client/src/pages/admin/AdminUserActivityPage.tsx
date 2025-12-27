import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/admin.api';
import { 
  FiArrowLeft, FiMail, FiCalendar, FiCheckCircle, 
  FiAlertCircle, FiClock
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
  recentSubmissions: Array<{
    id: string;
    status: string;
    mode: string;
    totalMarks: number;
    createdAt: number;
  }>;
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

        // Fetch all users to get user details
        const usersData = await AdminAPI.getAllUsers();
        const foundUser = usersData.users.find((u: User) => u.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        }

        // Fetch activity data
        const activityData = await AdminAPI.getUserActivity(userId);
        if (activityData.success) {
          setActivity(activityData);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

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
        <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <FiArrowLeft size={20} />
          Back to Users
        </button>

        {/* User Header Card */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-6">
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                }}
              />
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{user.name}</h1>
                <div className="space-y-2 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FiMail size={18} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={18} />
                    <span>Joined {formatDate(user.joinedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getRoleColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(user.status)}`}>
                    {user.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Alert */}
        {activity?.health?.hasIssues && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Warning</p>
              <p className="text-red-700 text-sm">
                Failure rate: {activity.health.failureRate}%
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Question Papers Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Question Papers</h3>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-5xl font-bold text-blue-600">
                {activity?.summary?.totalQuestionPapers || 0}
              </p>
              <p className="text-gray-600 text-sm mt-2">Total papers created</p>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">✓ Completed</span>
                <span className="text-2xl font-bold text-gray-900">
                  {activity?.summary?.completedPapers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">⏳ Pending</span>
                <span className="text-2xl font-bold text-gray-900">
                  {activity?.summary?.pendingPapers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">✕ Failed</span>
                <span className="text-2xl font-bold text-red-600">
                  {activity?.summary?.failedPapers || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Sheets Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Answer Sheets</h3>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-5xl font-bold text-green-600">
                {activity?.summary?.totalAnswerSheets || 0}
              </p>
              <p className="text-gray-600 text-sm mt-2">Total sheets submitted</p>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">✓ Evaluated</span>
                <span className="text-2xl font-bold text-gray-900">
                  {activity?.summary?.completedAnswerSheets || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">✕ Failed</span>
                <span className="text-2xl font-bold text-red-600">
                  {activity?.summary?.failedAnswerSheets || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {activity?.recentSubmissions && activity.recentSubmissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h3>
            
            <div className="space-y-4">
              {activity.recentSubmissions.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    {sub.status === 'completed' && (
                      <FiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {sub.status === 'processing' && (
                      <FiClock className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
                    )}
                    {sub.status === 'failed' && (
                      <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    
                    <div>
                      <p className="font-bold text-gray-900">Paper #{sub.id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {sub.mode} • {sub.totalMarks} marks • {formatDate(sub.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ml-4 ${
                    sub.status === 'completed' ? 'bg-green-100 text-green-700' :
                    sub.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserActivityPage;