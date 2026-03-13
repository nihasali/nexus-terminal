import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Layout from "./TeacherLayout";

const SearchIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

function PercentBar({ value }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${
        value >= 75 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600"
      }`}>{value}%</span>
    </div>
  );
}

export default function AttendanceReport() {
  const [classes, setClasses]   = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [month, setMonth]       = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    api.get("Class/school-classes/")
      .then(res => {
        setClasses(res.data);
        if (res.data.length > 0) setSelectedClass(res.data[0].id.toString());
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClass && month) fetchSummary();
  }, [selectedClass, month]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `Class/attendance/classes/${selectedClass}/monthly-summary/?month=${month}`
      );
      setSummary(res.data);
    } catch { setSummary(null); }
    finally { setLoading(false); }
  };

  const filtered = (summary?.students || []).filter(s =>
    s.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate stats
  const totalStudents = filtered.length;
  const avgPercent    = totalStudents > 0
    ? Math.round(filtered.reduce((a, s) => a + s.attendance_percent, 0) / totalStudents)
    : 0;
  const below75       = filtered.filter(s => s.attendance_percent < 75).length;

  const selectedClassObj = classes.find(c => c.id.toString() === selectedClass);

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
            <p className="text-sm text-gray-400 mt-1">Monthly attendance summary by class</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* ── Filters ── */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none min-w-[180px]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Class {c.name}{c.section ? ` - ${c.section}` : ""} ({c.academic_year})
                </option>
              ))}
            </select>

            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : !summary ? (
            <div className="text-center py-24">
              <p className="text-gray-400">Select a class and month to view the report.</p>
            </div>
          ) : (
            <>
              {/* ── Summary cards ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/5" />
                  <p className="text-gray-400 text-xs mb-1">School Days</p>
                  <p className="text-white text-3xl font-black">{summary.total_days}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">Avg Attendance</p>
                  <p className={`text-3xl font-black ${avgPercent >= 75 ? "text-emerald-600" : avgPercent >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {avgPercent}%
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Class average</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">Total Students</p>
                  <p className="text-3xl font-black text-gray-900">{totalStudents}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Class {selectedClassObj?.name}{selectedClassObj?.section ? ` - ${selectedClassObj.section}` : ""}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <p className="text-red-400 text-xs mb-1">Below 75%</p>
                  <p className="text-3xl font-black text-red-600">{below75}</p>
                  <p className="text-red-400 text-xs mt-1">Need attention</p>
                </div>
              </div>

              {/* ── Table ── */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400">No students found.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">#</p>
                    <p className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</p>
                    <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">P</p>
                    <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">A</p>
                    <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">L</p>
                    <p className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance %</p>
                  </div>

                  {filtered.map((student, i) => {
                    const initials = student.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    const isLow    = student.attendance_percent < 75;
                    return (
                      <div key={student.academic_record_id}
                        className={`grid grid-cols-12 items-center px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${
                          isLow ? "bg-red-50/30" : ""
                        }`}
                      >
                        <div className="col-span-1">
                          <span className="text-xs text-gray-300">{student.roll_number || String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          {student.profile_picture
                            ? <img src={student.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">{initials}</div>
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{student.fullname}</p>
                            <p className="text-xs text-gray-400">{student.admission_number}</p>
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-bold text-emerald-600">{student.present}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-bold text-red-600">{student.absent}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-bold text-amber-600">{student.late}</span>
                        </div>
                        <div className="col-span-4">
                          <PercentBar value={student.attendance_percent} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Low attendance warning */}
              {below75 > 0 && (
                <div className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs text-red-600">
                    <strong>{below75} student{below75 !== 1 ? "s" : ""}</strong> have attendance below 75%. Consider notifying their parents.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}