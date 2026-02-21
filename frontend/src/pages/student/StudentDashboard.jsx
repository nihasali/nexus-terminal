import React from "react";
import { useSelector } from "react-redux";
import StudentLayout from "./StudentLayout";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

function StudentDashboard() {
  const user = useSelector((state) => state.auth.user);

  // Example data - replace with actual API data
  const stats = {
    attendance: 92,
    assignmentsPending: 3,
    upcomingExams: 2,
    averageGrade: "A-",
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {user?.fullname || "Student"}! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here's your academic overview for today
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Attendance */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Attendance</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.attendance}%
              </p>
            </div>

            {/* Pending Assignments */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <AlertCircle className="text-orange-500" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.assignmentsPending}
              </p>
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Exams</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.upcomingExams}
              </p>
            </div>

            {/* Average Grade */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Average Grade</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.averageGrade}
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Today's Schedule
                </h3>
              </div>
              <div className="p-6">
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
                        Mathematics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Chapter 5: Quadratic Equations
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          Room 204
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
                        Science
                      </h3>
                      <p className="text-sm text-gray-600">
                        Physics - Laws of Motion
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Lab 3
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 text-center">
                        <p className="text-xs text-green-600 font-semibold">
                          02:00 PM
                        </p>
                        <p className="text-xs text-gray-500">60 min</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        English
                      </h3>
                      <p className="text-sm text-gray-600">
                        Literature - Shakespeare
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Room 101
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Assignments */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Pending Assignments
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      Math Assignment
                    </p>
                    <p className="text-xs text-gray-600 mb-2">Chapter 5 Problems</p>
                    <p className="text-xs text-orange-600 font-medium">
                      Due: Tomorrow
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      Science Project
                    </p>
                    <p className="text-xs text-gray-600 mb-2">Newton's Laws</p>
                    <p className="text-xs text-blue-600 font-medium">
                      Due: In 3 days
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      English Essay
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Macbeth Analysis
                    </p>
                    <p className="text-xs text-purple-600 font-medium">
                      Due: In 5 days
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Quick Tip
                    </h4>
                    <p className="text-xs text-gray-600">
                      Stay organized by checking your assignments daily and
                      planning ahead for exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;