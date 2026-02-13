import React, { useEffect, useState } from "react";
import { listTeachers } from "../../api/authService";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import Toast from '../../components/Toast';

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchQuery, statusFilter]);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await listTeachers();
      setTeachers(res.data);
      setFilteredTeachers(res.data);
    } catch (err) {
      console.log(err);
      setToast({
        message: "Failed to load teachers. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((t) => t.is_setup_complete);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter((t) => !t.is_setup_complete);
    }

    setFilteredTeachers(filtered);
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "??";
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.is_setup_complete).length,
    pending: teachers.filter((t) => !t.is_setup_complete).length,
  };

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Teachers</h1>
              <p className="text-gray-500 text-sm">Manage your teaching staff</p>
            </div>
            <Link to="/create-teacher">
              <button className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Teacher</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Total Teachers
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wider mb-2">
                    Active
                  </p>
                  <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-700 uppercase tracking-wider mb-2">
                    Pending Setup
                  </p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Setup</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading teachers...</p>
              </div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-16 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Teachers Found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Start by adding your first teacher to the system"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link to="/create-teacher">
                  <button className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Add First Teacher
                  </button>
                </Link>
              )}
            </div>
          ) : (
            /* Teachers Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {teacher.profile_picture ? (
                          <img
                            src={teacher.profile_picture}
                            alt={teacher.fullname}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                            <span className="text-xl font-bold text-gray-600">
                              {getInitials(teacher.fullname)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div>
                        {teacher.is_setup_complete ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teacher Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {teacher.fullname}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {teacher.employee_id}
                      </p>
                      {teacher.qualification && (
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                          {teacher.qualification}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {/* Email */}
                    <div className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 break-all flex-1">
                        {teacher.email}
                      </span>
                    </div>

                    {/* Phone */}
                    {teacher.phone && (
                      <div className="flex items-start space-x-3">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {teacher.phone}
                        </span>
                      </div>
                    )}

                    {/* Experience */}
                    {teacher.years_of_experience && (
                      <div className="flex items-start space-x-3">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {teacher.years_of_experience} years experience
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-2">
                      <Link to={`/school-teacher-details/${teacher.id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                      </Link>

                      <Link to={`/school-teacher/edit/${teacher.id}`}>
                        <button className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredTeachers.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              Showing {filteredTeachers.length} of {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default TeacherList;