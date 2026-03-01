import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeacherDetail } from '../../api/authService';
import api from '../../api/axios';
import Layout from './Layout';

const SUBJECT_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TeacherDetail() {
  const { id } = useParams();
  const [teacher, setTeacher]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTeacherDetail(id)
      .then(res => { setTeacher(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    // Fetch this teacher's teaching assignments
    api.get(`Subject_teacher/teachers/${id}/assignments/`)
      .then(res => setAssignments(res.data))
      .catch(() => {})
      .finally(() => setAssignLoading(false));
  }, [id]);

  // Group assignments by classroom for clean display
  const groupedAssignments = assignments.reduce((acc, a) => {
    const key = a.classroom?.id;
    if (!acc[key]) {
      acc[key] = { classroom: a.classroom, subjects: [] };
    }
    acc[key].subjects.push(a.subject);
    return acc;
  }, {});
  const groups = Object.values(groupedAssignments);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading teacher profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!teacher) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Teacher not found</p>
            <Link to="/school-teacherlist" className="text-gray-900 hover:underline text-sm mt-2 inline-block">
              Return to list
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Teacher Profile</h1>
              <p className="text-gray-500 text-sm">View teacher information and details</p>
            </div>
            <Link
              to={`/school-teacher/edit/${id}`}
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="relative flex-shrink-0">
                {teacher.profile_picture ? (
                  <img src={teacher.profile_picture} alt={teacher.fullname} className="w-32 h-32 rounded-2xl object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-600">{teacher.fullname?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{teacher.fullname}</h2>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{teacher.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="text-sm">ID: {teacher.employee_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Active
                  </span>
                  <span className="text-gray-600 text-sm">{teacher.years_of_experience} years experience</span>
                  {/* Class teacher badge */}
                  {groups.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                      {assignments.length} Subject{assignments.length !== 1 ? "s" : ""} Teaching
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Teaching Assignments (NEW) ── */}
          <div className="mb-6 bg-gray-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-amber-400 to-amber-600" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wide">Teaching Assignments</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Classes and subjects assigned this academic year</p>
                </div>
                {groups.length > 0 && (
                  <div className="text-right">
                    <p className="text-white text-2xl font-black">{groups.length}</p>
                    <p className="text-gray-400 text-xs">Class{groups.length !== 1 ? "es" : ""}</p>
                  </div>
                )}
              </div>

              {assignLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Loading assignments...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl py-6 text-center">
                  <p className="text-gray-500 text-sm">No teaching assignments yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Assign this teacher to a class from the{" "}
                    <Link to="/school-classes" className="text-amber-400 underline hover:no-underline">class detail page</Link>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groups.map(({ classroom, subjects }) => (
                    <Link
                      key={classroom?.id}
                      to={`/school-classes/${classroom?.id}`}
                      className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">{classroom?.academic_year}</p>
                          <p className="text-white font-black text-xl leading-none">
                            {classroom?.name}
                            {classroom?.section && (
                              <span className="text-amber-400 text-sm font-bold ml-1">- {classroom.section}</span>
                            )}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map((s, i) => (
                          <span key={s?.id}
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                            {s?.name}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-6 uppercase tracking-wide">Personal Information</h3>
              <div className="space-y-6">
                <InfoRow
                  label="Phone Number"
                  value={teacher.phone || "—"}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                />
                <InfoRow
                  label="Email Address"
                  value={teacher.email}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                />
                <InfoRow
                  label="Joining Date"
                  value={`${new Date(teacher.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${Math.floor((new Date() - new Date(teacher.joining_date)) / (1000 * 60 * 60 * 24 * 365))} years)`}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-6 uppercase tracking-wide">Professional Details</h3>
              <div className="space-y-6">
                <InfoRow
                  label="Employee ID"
                  value={teacher.employee_id}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />}
                />
                <InfoRow
                  label="Qualification"
                  value={teacher.qualification || "—"}
                  icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></>}
                />
                <InfoRow
                  label="Years of Experience"
                  value={`${teacher.years_of_experience || 0} years`}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                />
                <InfoRow
                  label="Salary"
                  value={`₹${Number(teacher.salary)?.toLocaleString('en-IN')} / Month`}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Account Security</h3>
                <p className="text-sm text-gray-600">Your account is protected and all information is kept confidential.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TeacherDetail;