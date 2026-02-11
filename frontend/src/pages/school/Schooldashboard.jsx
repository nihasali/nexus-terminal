import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Layout from "./Layout";
import {
  Users,
  GraduationCap,
  School,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";

function SchoolDashboard() {
  const user = useSelector((state) => state.auth.user);

  // You can fetch these from your API
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    totalClasses: 42,
    totalRevenue: "₹45,60,000",
  });

  return (
    <Layout>
      <div className="p-8">
        {/* Header with School Name + Dashboard */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <School className="text-orange-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              {user?.fullname || "Delhi Public School"} Dashboard
            </h1>
          </div>
          <p className="text-gray-600">Welcome back, {user?.f}!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <GraduationCap size={24} />
              </div>
              <TrendingUp size={20} className="opacity-70" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">
              Total Students
            </h3>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs opacity-75 mt-2">+12% from last month</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users size={24} />
              </div>
              <TrendingUp size={20} className="opacity-70" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">
              Total Teachers
            </h3>
            <p className="text-3xl font-bold">{stats.totalTeachers}</p>
            <p className="text-xs opacity-75 mt-2">+3 new this semester</p>
          </div>

          {/* Total Classes */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <School size={24} />
              </div>
              <Calendar size={20} className="opacity-70" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">
              Total Classes
            </h3>
            <p className="text-3xl font-bold">{stats.totalClasses}</p>
            <p className="text-xs opacity-75 mt-2">Across all grades</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <TrendingUp size={20} className="opacity-70" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold">{stats.totalRevenue}</p>
            <p className="text-xs opacity-75 mt-2">This academic year</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-lg p-4 text-left transition-all hover:shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <GraduationCap className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Add New Student</p>
                  <p className="text-sm text-gray-600">Register a student</p>
                </div>
              </div>
            </button>

            <button className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-lg p-4 text-left transition-all hover:shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Manage Staff</p>
                  <p className="text-sm text-gray-600">View all staff members</p>
                </div>
              </div>
            </button>

            <button className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-lg p-4 text-left transition-all hover:shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">View Attendance</p>
                  <p className="text-sm text-gray-600">Check daily attendance</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 pb-4 border-b">
              <div className="p-2 bg-orange-100 rounded-full">
                <GraduationCap className="text-orange-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  New student admission completed
                </p>
                <p className="text-xs text-gray-600">Rahul Kumar - Class 10A</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 pb-4 border-b">
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="text-orange-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Staff attendance marked
                </p>
                <p className="text-xs text-gray-600">
                  85/85 teachers present today
                </p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="text-orange-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Fee payment received
                </p>
                <p className="text-xs text-gray-600">₹45,000 from Class 12B</p>
                <p className="text-xs text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SchoolDashboard;