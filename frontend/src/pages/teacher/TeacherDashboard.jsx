import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import TeacherLayout from "./TeacherLayout";
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";

function TeacherDashboard() {
  const user = useSelector((state) => state.auth.user);

  // Example stats - replace with actual API data
  const [stats, setStats] = useState({
    totalClasses: 5,
    totalStudents: 142,
    todayClasses: 3,
    pendingAssignments: 12,
    averageAttendance: 92,
    upcomingExams: 2,
  });

  return (
    <TeacherLayout>
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullname || "Teacher"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your classes today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Classes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpen className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Classes
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalClasses}
            </p>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Students
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
          </div>

          {/* Today's Classes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Today
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Today's Classes
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.todayClasses}
            </p>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="text-red-600" size={24} />
              </div>
              <AlertCircle className="text-orange-500" size={20} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Pending Reviews
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingAssignments}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="text-orange-500 mr-2" size={24} />
                Today's Schedule
              </h2>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Schedule Items */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 text-center">
                    <p className="text-xs text-orange-600 font-semibold">
                      09:00 AM
                    </p>
                    <p className="text-xs text-gray-500">60 min</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mathematics - Grade 10A
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chapter 5: Quadratic Equations
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      Room 204
                    </span>
                    <span className="text-xs text-gray-500">
                      35 students
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 text-center">
                    <p className="text-xs text-blue-600 font-semibold">
                      11:00 AM
                    </p>
                    <p className="text-xs text-gray-500">60 min</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mathematics - Grade 9B
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review Session: Geometry
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Room 201
                    </span>
                    <span className="text-xs text-gray-500">
                      28 students
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 text-center">
                    <p className="text-xs text-purple-600 font-semibold">
                      02:00 PM
                    </p>
                    <p className="text-xs text-gray-500">60 min</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mathematics - Grade 10C
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chapter 4: Trigonometry
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Room 204
                    </span>
                    <span className="text-xs text-gray-500">
                      32 students
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Upcoming */}
          <div className="space-y-6">
            {/* Attendance Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Award className="text-green-500 mr-2" size={20} />
                Attendance
              </h3>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f97316"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${
                        2 * Math.PI * 56 * (stats.averageAttendance / 100)
                      } ${2 * Math.PI * 56}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.averageAttendance}%
                      </p>
                      <p className="text-xs text-gray-500">Average</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Overall class attendance rate
                </p>
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="text-orange-500 mr-2" size={20} />
                Upcoming Exams
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    Mid-Term Exam
                  </p>
                  <p className="text-xs text-gray-600 mb-2">Grade 10A</p>
                  <p className="text-xs text-orange-600 font-medium">
                    In 3 days
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    Unit Test - Geometry
                  </p>
                  <p className="text-xs text-gray-600 mb-2">Grade 9B</p>
                  <p className="text-xs text-blue-600 font-medium">
                    In 5 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default TeacherDashboard;