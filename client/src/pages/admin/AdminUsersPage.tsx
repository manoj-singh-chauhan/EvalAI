import React, { useState, useEffect, useCallback } from "react";
import { AdminAPI } from "../../api/admin.api";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiMoreVertical,
  FiEye,
  FiSearch,
  FiX,
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: number;
  lastActiveAt: number;
  status: string;
  imageUrl: string;
}

const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await AdminAPI.getAllUsers();
        if (data.success) {
          setAllUsers(data.users);
          setFilteredUsers(data.users);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Debounced search function
  const handleSearch = useCallback(
    async (search: string) => {
      if (!search.trim()) {
        setFilteredUsers(allUsers);
        return;
      }

      setSearchLoading(true);
      try {
        const data = await AdminAPI.searchUsers(search);
        if (data.success) {
          setFilteredUsers(data.users);
        }
      } catch (err) {
        console.error("Search error:", err);
        setFilteredUsers(allUsers);
      } finally {
        setSearchLoading(false);
      }
    },
    [allUsers]
  );

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleViewActivity = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/admin/user/${userId}`);
    setOpenMenuId(null);
  };

  const formatLastSeen = (ts?: number) => {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 5) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-1250px mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Users Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View all registered users and their details
            </p>
          </div>

          <div className="relative w-full sm:max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <FiSearch className="text-gray-400 w-5 h-5" />
              {searchLoading && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {allUsers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {allUsers.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Admins
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {allUsers.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {allUsers.length}
            </p>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {allUsers.filter((u) => u.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-semibold mb-1">Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {allUsers.filter((u) => u.role === "admin").length}
            </p>
          </div>
        </div>
        <div className="hidden md:block bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Last Seen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="inline-block">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No users match your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.imageUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                            }}
                          />
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatLastSeen(user.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(user.joinedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === user.id ? null : user.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiMoreVertical
                              size={20}
                              className="text-gray-600"
                            />
                          </button>

                          {openMenuId === user.id && (
                            <div
                              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                              onClick={handleMenuClick}
                            >
                              <button
                                onClick={(e) => handleViewActivity(e, user.id)}
                                className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                              >
                                <FiEye size={16} />
                                View Activity
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? "No users match your search" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user.id ? null : user.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiMoreVertical size={18} className="text-gray-600" />
                    </button>

                    {openMenuId === user.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                        onClick={handleMenuClick}
                      >
                        <button
                          onClick={(e) => handleViewActivity(e, user.id)}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                        >
                          <FiEye size={16} />
                          View Activity
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-700">Last Seen</p>
                      <p>{formatLastSeen(user.lastActiveAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-700">Joined</p>
                      <p>{formatDate(user.joinedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;