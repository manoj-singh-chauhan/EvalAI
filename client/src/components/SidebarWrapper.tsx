import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiActivity,
  FiBarChart2,
  FiSettings,
  FiUsers,
  FiX,
  FiLogOut,
  // FiBell,
  // FiUser,
} from "react-icons/fi";
import { useClerk } from "@clerk/clerk-react";
import { BsReverseLayoutSidebarReverse } from "react-icons/bs";
import { FaUserTie } from "react-icons/fa6";
import { IoMdNotifications } from "react-icons/io";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const { signOut } = useClerk();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/submissions", label: "Activity", icon: FiActivity },
    { path: "/analytics", label: "Analytics", icon: FiBarChart2 },
    { path: "/students", label: "Students", icon: FiUsers },
    { path: "/settings", label: "Settings", icon: FiSettings },
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
  };

  const SidebarContent = ({ isExpanded }: { isExpanded: boolean }) => (
    <div className="flex flex-col h-full bg-white relative">
      <div
        className={`h-16 flex items-center border-b border-gray-100 transition-all ${
          isExpanded ? "px-4" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[40px] h-9 bg-teal-500 text-white rounded-md flex items-center justify-center font-bold text-sm shadow-sm">
            AE
          </div>
          {isExpanded && (
            <span className="font-semibold text-sm whitespace-nowrap">
              AI Eval
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-4 overflow-y-auto custom-scroll">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group relative ${
                isActive
                  ? "bg-teal-50 text-teal-600"
                  : "hover:bg-gray-50 text-gray-600"
              } ${!isExpanded && "justify-center"}`}
            >
              <Icon className="text-lg flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-600 transition-colors ${
            !isExpanded && "justify-center"
          }`}
        >
          <FiLogOut className="text-lg" />
          {isExpanded && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`hidden md:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          expanded ? "w-64" : "w-[72px]"
        }`}
      >
        <SidebarContent isExpanded={expanded} />
      </aside>

      {isMobile && (
        <>
          {isMobileOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <FiX className="text-xl" />
            </button>
            <SidebarContent isExpanded={true} />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col">
        <div className="md:hidden h-16 border-b bg-white flex items-center px-4 sticky top-0 z-10">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <BsReverseLayoutSidebarReverse className="w-5 h-5" />
          </button>

          <span className="ml-3 text-sm font-medium">AI Eval</span>

          <div className="ml-auto flex items-center gap-3">
            <IoMdNotifications className="w-6 h-6 text-gray-500" />
            <FaUserTie className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div className="hidden md:flex h-16 border-b bg-white items-center px-4 sticky top-0 z-10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <BsReverseLayoutSidebarReverse
              className={`w-5 h-5 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <span className="ml-4 text-sm font-medium">AI Eval</span>

          <div className="ml-auto flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <IoMdNotifications className="w-6 h-6 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FaUserTie className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">{children}</div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-5 w-full max-w-xs">
            <h3 className="text-sm font-semibold">Sign out?</h3>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border rounded-md py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white rounded-md py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
