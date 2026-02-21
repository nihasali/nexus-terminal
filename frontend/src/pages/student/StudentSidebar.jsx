import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import api from "../../api/axios";
import {
  LayoutDashboard,
  User,
  ClipboardList,
  CheckCircle2,
  GraduationCap,
  Megaphone,
  UserCircle,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
} from "lucide-react";

function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    // Fetch student profile to get profile picture
    // Replace with your actual API endpoint
    const fetchStudentProfile = async () => {
      try {
        // const response = await api.get("Profile/student-profile/");
        // setStudentProfile(response.data);
        
        // For now, using user data from Redux
        setStudentProfile(user);
      } catch (error) {
        console.error("Failed to fetch student profile:", error);
      }
    };

    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post("Users/logout/");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logout());
      navigate("/login");
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/student/dashboard",
    },
    {
      title: "Profile",
      icon: <User size={18} />,
      path: "/student/profile",
    },
    {
      title: "Assignments",
      icon: <ClipboardList size={18} />,
      path: "/student/assignment",
    },
    {
      title: "Attendance",
      icon: <CheckCircle2 size={18} />,
      path: "/student/attendence",
    },
    {
      title: "Exams",
      icon: <GraduationCap size={18} />,
      path: "/student/exams",
    },
    {
      title: "Announcements",
      icon: <Megaphone size={18} />,
      path: "/student/announcement",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "S";
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">NEXUS TERMINAL</h2>
            <p className="text-xs text-gray-500">School Management</p>
          </div>
        </div>

        {/* Profile Section with Picture */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
          <div className="relative flex-1">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 w-full hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              {/* Profile Picture or Avatar */}
              {studentProfile?.profile_picture ? (
                <img
                  src={studentProfile.profile_picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-orange-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {getInitials(user?.fullname)}
                </div>
              )}
              
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {user?.fullname || "Student"}
                </p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform flex-shrink-0 ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <Link
                  to="/student/profile"
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-orange-50 transition-colors text-sm text-gray-700 border-b"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <UserCircle size={16} className="text-gray-500" />
                  <span>View Profile</span>
                </Link>
                <Link
                  to="/student/settings"
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-orange-50 transition-colors text-sm text-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} className="text-gray-500" />
                  <span>Settings</span>
                </Link>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <Link
            to="/student/notifications"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1"
          >
            <Bell size={18} className="text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default StudentSidebar;