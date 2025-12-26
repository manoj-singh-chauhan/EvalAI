// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   FiHome,
//   FiActivity,
//   FiBarChart2,
//   FiSettings,
//   FiUsers,
//   FiLogOut,
// } from "react-icons/fi";
// import { useClerk, useUser } from "@clerk/clerk-react";
// import { BsReverseLayoutSidebarReverse } from "react-icons/bs";
// import { IoMdNotifications } from "react-icons/io";

// interface SidebarWrapperProps {
//   children: React.ReactNode;
// }

// const getInitials = (fullName?: string | null) => {
//   if (!fullName) return "U";
//   const parts = fullName.trim().split(" ").filter(Boolean);
//   if (parts.length === 1) return parts[0][0].toUpperCase();
//   return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
// };

// const UserAvatar = ({ name }: { name?: string | null }) => {
//   const colors = [
//     "bg-blue-500",
//     "bg-purple-500",
//     "bg-pink-500",
//     "bg-green-500",
//     "bg-orange-500",
//     "bg-red-500",
//     "bg-teal-500",
//     "bg-indigo-500",
//   ];
//   const initials = getInitials(name);
//   const color = colors[initials.charCodeAt(0) % colors.length];

//   return (
//     <div
//       className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-xs font-bold text-white`}
//     >
//       {initials}
//     </div>
//   );
// };

// export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ children }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);

//   const userBtnRef = useRef<HTMLButtonElement | null>(null);

//   const location = useLocation();
//   const { signOut } = useClerk();
//   const { user } = useUser();

//   useEffect(() => {
//     const onResize = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       if (mobile) setExpanded(false);
//     };
//     onResize();
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const menuItems = [
//     { path: "/", label: "Home", icon: FiHome },
//     { path: "/submissions", label: "Activity", icon: FiActivity },
//     { path: "/analytics", label: "Analytics", icon: FiBarChart2 },
//     { path: "/students", label: "Students", icon: FiUsers },
//     { path: "/settings", label: "Settings", icon: FiSettings },
//   ];

//   const handleLogout = async () => {
//     setShowLogoutModal(false);
//     setShowUserMenu(false);
//     await signOut();
//   };

//   const SidebarContent = ({ isExpanded }: { isExpanded: boolean }) => (
//     <div className="flex flex-col h-full bg-white">
//       <div
//         className={`h-16 flex items-center border-b ${
//           isExpanded ? "px-4" : "justify-center"
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-teal-500 text-white rounded-md flex items-center justify-center font-bold text-sm">
//             AE
//           </div>
//           {isExpanded && <span className="font-semibold text-sm">AI Eval</span>}
//         </div>
//       </div>

//       <nav className="flex-1 p-2 space-y-1 mt-4">
//         {menuItems.map((item) => {
//           const active = location.pathname === item.path;
//           const Icon = item.icon;

//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
//                 active
//                   ? "bg-teal-50 text-teal-600"
//                   : "text-gray-600 hover:bg-gray-50"
//               } ${!isExpanded && "justify-center"}`}
//             >
//               <Icon className="text-lg" />
//               {isExpanded && (
//                 <span className="text-sm font-medium">{item.label}</span>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* USER */}
//       <div className="p-2 ">
//         <button
//           ref={userBtnRef}
//           onClick={() => setShowUserMenu((v) => !v)}
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-md  ${
//             !isExpanded && "justify-center"
//           }`}
//         >
//           <UserAvatar name={user?.fullName} />
//           {isExpanded && (
//             <div className="text-left min-w-0">
//               <div className="text-sm font-medium truncate">
//                 {user?.fullName}
//               </div>
//               <div className="text-xs text-gray-500 truncate">
//                 {user?.primaryEmailAddress?.emailAddress}
//               </div>
//             </div>
//           )}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* <aside
//         className={`hidden md:flex border-r bg-white transition-all ${
//           expanded ? "w-64" : "w-[72px]"
//         }`}
//       > */}
//       <aside
//         className={`hidden md:flex bg-white transition-all
//     ${
//       expanded
//         ? "w-64 border-r border-gray-200"
//         : "w-[72px] shadow-[1px_0_0_rgba(0,0,0,0.04)]"
//     }
//   `}
//       >
//         <SidebarContent isExpanded={expanded} />
//       </aside>

//       <main className="flex-1 flex flex-col">
//         <div className="hidden md:flex h-16 border-b bg-white items-center px-4">
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="p-2 hover:bg-gray-100 rounded-md"
//           >
//             <BsReverseLayoutSidebarReverse
//               className={`w-5 h-5 ${expanded ? "rotate-180" : ""}`}
//             />
//           </button>

//           <span className="ml-4 text-sm font-medium">AI Eval</span>

//           <div className="ml-auto">
//             <IoMdNotifications className="w-6 h-6 text-gray-500" />
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto custom-scroll">{children}</div>
//       </main>

//       {/* USER MENU POPOVER */}
//       {showUserMenu && userBtnRef.current && (
//         <div
//           className="fixed z-[200] w-56 bg-white border rounded-lg shadow-xl"
//           style={{
//             left: userBtnRef.current.getBoundingClientRect().left,
//             top: userBtnRef.current.getBoundingClientRect().top - 70,
//           }}
//         >
//           <button
//             onClick={() => setShowLogoutModal(true)}
//             className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
//           >
//             <FiLogOut />
//             Sign Out
//           </button>
//         </div>
//       )}

//       {/* LOGOUT MODAL */}
//       {/* {showLogoutModal && (
//         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
//           <div className="bg-white rounded-lg p-5 w-full max-w-xs">
//             <h3 className="text-sm font-semibold">Sign out?</h3>
//             <div className="mt-4 flex gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 className="flex-1 border rounded-md py-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex-1 bg-red-600 text-white rounded-md py-2"
//               >
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )} */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
//           <div className="bg-white rounded-lg p-5 w-full max-w-xs">
//             <h3 className="text-sm font-medium text-gray-900">Sign out?</h3>

//             <p className="mt-1 text-xs text-gray-500">
//               You will be logged out.
//             </p>

//             <div className="mt-4 flex gap-3">
//               <button
//                 onClick={() => setShowLogoutModal(false)}
//                 className="flex-1 border border-gray-300 rounded-md py-2 text-xs hover:bg-gray-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="flex-1 bg-red-600 text-white rounded-md py-2 text-xs hover:bg-red-700"
//               >
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiActivity,
  FiBarChart2,
  // FiSettings,
  // FiUsers,
  FiLogOut,
  FiX,
  FiLayers
} from "react-icons/fi";
import { useClerk, useUser } from "@clerk/clerk-react";
import { BsReverseLayoutSidebarReverse } from "react-icons/bs";
import { IoMdNotifications } from "react-icons/io";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

/* ===== INITIALS ===== */
const getInitials = (fullName?: string | null) => {
  if (!fullName) return "U";
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
};

const UserAvatar = ({ name }: { name?: string | null }) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];
  const initials = getInitials(name);
  const color = colors[initials.charCodeAt(0) % colors.length];

  return (
    <div
      className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-xs font-bold text-white`}
    >
      {initials}
    </div>
  );
};

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
      if (mobile) setExpanded(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const menuItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/submissions", label: "Activity", icon: FiActivity },
    { path: "/analytics", label: "Analytics", icon: FiBarChart2 },
    // { path: "/students", label: "Students", icon: FiUsers },
    // { path: "/settings", label: "Settings", icon: FiSettings },
     { path: "/workflow", label: "Workflow", icon: FiLayers },
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setShowUserMenu(false);
    await signOut();
  };

  const SidebarContent = ({ isExpanded }: { isExpanded: boolean }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div
        className={`h-16 flex items-center border-b ${
          isExpanded ? "px-4" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 text-white rounded-md flex items-center justify-center font-bold text-sm">
            AE
          </div>
          {isExpanded && (
            <span className="font-semibold text-sm">AI Eval</span>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-1 mt-4">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
                active
                  ? "bg-teal-50 text-teal-600"
                  : "text-gray-600 hover:bg-gray-50"
              } ${!isExpanded && "justify-center"}`}
            >
              <Icon className="text-lg" />
              {isExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER */}
      <div className="p-2">
        <button
          ref={userBtnRef}
          onClick={() => setShowUserMenu((v) => !v)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            !isExpanded && "justify-center"
          }`}
        >
          <UserAvatar name={user?.fullName} />
          {isExpanded && (
            <div className="text-left min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.fullName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex bg-white transition-all ${
          expanded
            ? "w-64 border-r border-gray-200"
            : "w-[72px] shadow-[1px_0_0_rgba(0,0,0,0.04)]"
        }`}
      >
        <SidebarContent isExpanded={expanded} />
      </aside>

      {/* MOBILE SIDEBAR */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4"
            >
              <FiX size={20} />
            </button>
            <SidebarContent isExpanded={true} />
          </aside>
        </>
      )}

      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="h-16 border-b bg-white flex items-center px-4">
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md mr-2"
            >
              <BsReverseLayoutSidebarReverse className="w-5 h-5" />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <BsReverseLayoutSidebarReverse
                className={`w-5 h-5 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}

          <span className="ml-3 text-sm font-medium">AI Eval</span>

          <div className="ml-auto">
            <IoMdNotifications className="w-6 h-6 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">{children}</div>
      </main>

      {/* USER MENU */}
      {showUserMenu && userBtnRef.current && (
        <div
          className="fixed z-[200] w-56 bg-white border rounded-lg shadow-xl"
          style={{
            left: userBtnRef.current.getBoundingClientRect().left,
            top: userBtnRef.current.getBoundingClientRect().top - 70,
          }}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiLogOut />
            Sign Out
          </button>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-5 w-full max-w-xs">
            <h3 className="text-sm font-medium text-gray-900">Sign out?</h3>
            <p className="mt-1 text-xs text-gray-500">
              You will be logged out.
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-gray-300 rounded-md py-2 text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white rounded-md py-2 text-xs hover:bg-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
