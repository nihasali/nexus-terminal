import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import api from "../../api/axios";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Megaphone,
  AlertCircle,
  DollarSign,
  MessageSquare,
  FileText,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      path: "/Schooldashboard",
    },
    {
      title: "Teachers Management",
      icon: <Users size={18} />,
      path: "/create-teacher",
    },
    {
      title: "Student Management",
      icon: <GraduationCap size={18} />,
      path: "/school-teacherlist",
    },
    {
      title: "Parents Management",
      icon: <UserCog size={18} />,
      path: "/parents-management",
    },
    {
      title: "Class Management",
      icon: <Clock size={18} />,
      path: "/class-management",
    },
    {
      title: "Announcement",
      icon: <Megaphone size={18} />,
      path: "/announcement",
    },
    {
      title: "Raise & View Complaints",
      icon: <AlertCircle size={18} />,
      path: "/complaints",
    },
    {
      title: "Finance",
      icon: <DollarSign size={18} />,
      path: "/finance",
    },
    {
      title: "Leave Request",
      icon: <FileText size={18} />,
      path: "/leave-request",
    },
    {
      title: "Settings",
      icon: <Settings size={18} />,
      path: "/settings",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="text-orange-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-800">
            NEXUS TERMINAL
          </h2>
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

export default Sidebar;