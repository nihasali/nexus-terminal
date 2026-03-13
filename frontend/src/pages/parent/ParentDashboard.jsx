import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CheckCircle, BookOpen, CreditCard, MessageSquare,
  TrendingUp, Calendar, ChevronRight, Users,
  AlertCircle, Award, Bell,
} from "lucide-react";
import api from "../../api/axios";
import ParentLayout from "./ParentLayout";

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: "Half-yearly exams start November 10",   time: "2h ago", type: "exam" },
  { id: 2, title: "Annual Sports Day scheduled for Dec 5", time: "1d ago", type: "event" },
  { id: 3, title: "Fee payment deadline: October 30",      time: "2d ago", type: "fee" },
  { id: 4, title: "Parent-teacher meeting on Nov 2",       time: "3d ago", type: "meeting" },
];

const TYPE_STYLES = {
  exam:    { bg: "bg-red-50",   text: "text-red-600",   label: "Exam" },
  event:   { bg: "bg-blue-50",  text: "text-blue-600",  label: "Event" },
  fee:     { bg: "bg-amber-50", text: "text-amber-600", label: "Fee" },
  meeting: { bg: "bg-green-50", text: "text-green-600", label: "Meeting" },
};

const TODAY_SCHEDULE = [
  { time: "08:00", subject: "Mathematics",  teacher: "Mr. Ramesh", color: "#6366f1" },
  { time: "09:00", subject: "Physics",      teacher: "Ms. Priya",  color: "#f59e0b" },
  { time: "10:00", subject: "English",      teacher: "Mr. George", color: "#10b981" },
  { time: "11:00", subject: "Computer Sc.", teacher: "Ms. Anitha", color: "#0ea5e9" },
  { time: "13:00", subject: "Chemistry",    teacher: "Mr. Kumar",  color: "#ef4444" },
];

// ── Attendance mini ring ──
function MiniRing({ percent }) {
  const r    = 20;
  const circ = 2 * Math.PI * r;
  const fill = (percent / 100) * circ;
  const color = percent >= 75 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[9px] font-black text-gray-900">{percent}%</p>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const user = useSelector((state) => state.auth.user);

  const [children, setChildren]           = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData]         = useState(null);
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [loading, setLoading]             = useState(true);
  const [time, setTime]                   = useState(new Date());

  // ── Attendance state ──
  const [attendance, setAttendance]       = useState(null);
  const [attLoading, setAttLoading]       = useState(false);

  useEffect(() => {
    fetchDashboard();
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.id);
      fetchChildAttendance(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("Profile/parent/dashboard/");
      if (res.data.children?.length > 0) {
        setChildren(res.data.children);
        setSelectedChild(res.data.children[0]);
      }
      if (res.data.announcements) setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId) => {
    try {
      const res = await api.get(`Profile/school-students/details/${childId}/`);
      setChildData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChildAttendance = async (childId) => {
    setAttLoading(true);
    setAttendance(null);
    try {
      const d     = new Date();
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const res   = await api.get(`/Class/attendance/students/${childId}/?month=${month}`);
      setAttendance(res.data);
    } catch {
      setAttendance(null);
    } finally {
      setAttLoading(false);
    }
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName  = user?.fullname?.split(" ")[0] || "Parent";
  const attPercent = attendance?.summary?.attendance_percent ?? null;
  const attColor   = attPercent !== null
    ? attPercent >= 75 ? "#10b981" : attPercent >= 50 ? "#f59e0b" : "#ef4444"
    : "#6366f1";
  const attBg      = attPercent !== null
    ? attPercent >= 75 ? "#ecfdf5" : attPercent >= 50 ? "#fffbeb" : "#fef2f2"
    : "#eef2ff";

  const stats = [
    {
      label: "Attendance",
      value: attPercent !== null ? `${attPercent}%` : "—",
      sub:   "This month",
      color: attColor,
      bg:    attBg,
      icon:  CheckCircle,
      to:    "/parent/attendance",
    },
    { label: "Assignments", value: "8",    sub: "Pending",      color: "#f59e0b", bg: "#fffbeb", icon: BookOpen,   to: "/parent/exams" },
    { label: "Class Rank",  value: "#3",   sub: "Out of 42",    color: "#6366f1", bg: "#eef2ff", icon: Award,      to: null },
    { label: "Fee Status",  value: "Paid", sub: "Current term", color: "#0ea5e9", bg: "#f0f9ff", icon: CreditCard, to: "/parent/finance" },
  ];

  return (
    <ParentLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <p className="text-xs text-gray-400">
              {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-lg font-bold text-gray-900 mt-0.5">Parent Dashboard</h1>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 tabular-nums">
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>

        <div className="px-8 py-8 max-w-7xl mx-auto">

          {/* Child switcher */}
          {children.length > 1 && (
            <div className="flex items-center gap-3 mb-8">
              <p className="text-sm font-medium text-gray-500">Viewing:</p>
              {children.map((child) => (
                <button key={child.id} onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedChild?.id === child.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedChild?.id === child.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {child.fullname?.charAt(0).toUpperCase()}
                  </div>
                  {child.fullname}
                </button>
              ))}
            </div>
          )}

          {/* Dark greeting banner */}
          <div className="relative bg-gray-900 rounded-2xl p-8 mb-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-16 right-24 w-64 h-64 rounded-full bg-white/[0.03]" />
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-amber-400 to-amber-600" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">{greeting()}</p>
                <h2 className="text-white text-3xl font-bold mb-2">Welcome, {firstName}</h2>
                <p className="text-gray-400 text-sm">
                  {childData?.fullname
                    ? `Tracking ${childData.fullname}${childData.class_name ? ` · Class ${childData.class_name}${childData.section ? ` Section ${childData.section}` : ""}` : ""}`
                    : "Have a productive day ahead."}
                </p>
                {childData && (
                  <div className="flex items-center gap-2 mt-4">
                    {childData.admission_number && (
                      <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">{childData.admission_number}</span>
                    )}
                    {childData.roll_number && (
                      <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">Roll No. {childData.roll_number}</span>
                    )}
                    {/* Live attendance badge */}
                    {attPercent !== null && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        attPercent >= 75 ? "bg-emerald-500/20 text-emerald-400" :
                        attPercent >= 50 ? "bg-amber-500/20 text-amber-400" :
                                           "bg-red-500/20 text-red-400"
                      }`}>
                        {attPercent}% attendance
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                {childData?.profile_picture
                  ? <img src={childData.profile_picture} alt="" className="w-full h-full object-cover" />
                  : (childData?.fullname || selectedChild?.fullname || "C")?.charAt(0).toUpperCase()
                }
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, sub, color, bg, icon: Icon, to }) => {
              const card = (
                <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1" style={label === "Attendance" && attPercent !== null ? { color } : {}}>{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              );
              return to ? <Link key={label} to={to}>{card}</Link> : <div key={label}>{card}</div>;
            })}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* ── Attendance card (NEW) ── */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedChild?.fullname ? `${selectedChild.fullname.split(" ")[0]}'s Attendance` : "Attendance"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <Link to="/parent/attendance" className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    Full history <ChevronRight size={14} />
                  </Link>
                </div>

                {attLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading attendance...</p>
                  </div>
                ) : !attendance ? (
                  <p className="text-sm text-gray-400 py-4">No attendance data available for this month.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-5">
                      <MiniRing percent={attPercent} />
                      <div className="flex gap-4 flex-1">
                        <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-emerald-600">{attendance.summary.present}</p>
                          <p className="text-xs text-emerald-500 font-medium">Present</p>
                        </div>
                        <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-red-600">{attendance.summary.absent}</p>
                          <p className="text-xs text-red-500 font-medium">Absent</p>
                        </div>
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-amber-600">{attendance.summary.late}</p>
                          <p className="text-xs text-amber-500 font-medium">Late</p>
                        </div>
                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-gray-700">{attendance.summary.total_days}</p>
                          <p className="text-xs text-gray-400 font-medium">Total Days</p>
                        </div>
                      </div>
                    </div>

                    {/* Low attendance alert */}
                    {attPercent < 75 && (
                      <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">
                          Attendance is below 75%. Please ensure{" "}
                          <strong>{selectedChild?.fullname?.split(" ")[0] || "your child"}</strong>{" "}
                          attends school regularly.
                        </p>
                      </div>
                    )}

                    {/* Recent absent days */}
                    {attendance.records?.filter(r => r.status !== "present").length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Absences / Late</p>
                        <div className="space-y-1.5">
                          {attendance.records
                            .filter(r => r.status !== "present")
                            .slice(0, 5)
                            .map(record => (
                              <div key={record.id}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    record.status === "absent" ? "bg-red-500" : "bg-amber-500"
                                  }`} />
                                  <p className="text-xs font-medium text-gray-700">
                                    {new Date(record.date + "T00:00:00").toLocaleDateString("en-IN", {
                                      weekday: "short", day: "numeric", month: "short"
                                    })}
                                  </p>
                                  {record.student?.note && (
                                    <p className="text-xs text-gray-400 italic">"{record.student.note}"</p>
                                  )}
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                                  record.status === "absent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {attendance.records?.filter(r => r.status !== "present").length === 0 && (
                      <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-emerald-600 font-semibold text-sm">🎉 Perfect attendance this month!</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Timetable */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Today's Timetable</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{time.toLocaleDateString("en-US", { weekday: "long" })}</p>
                  </div>
                  <Link to="/parent/attendance" className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    Full schedule <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {TODAY_SCHEDULE.map(({ time: t, subject, teacher, color }, i) => {
                    const isCurrent = i === 1;
                    return (
                      <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isCurrent ? "bg-gray-900" : "bg-gray-50 hover:bg-gray-100"}`}>
                        <p className={`text-xs font-bold w-10 flex-shrink-0 ${isCurrent ? "text-amber-400" : "text-gray-400"}`}>{t}</p>
                        <div className="w-0.5 h-7 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-gray-800"}`}>{subject}</p>
                          <p className="text-xs text-gray-400">{teacher}</p>
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-bold text-gray-900 bg-amber-400 px-2.5 py-0.5 rounded-full flex-shrink-0">NOW</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Attendance",   icon: CheckCircle,   to: "/parent/attendance", color: "#10b981", bg: "#ecfdf5" },
                    { label: "Exam Results", icon: BookOpen,      to: "/parent/exams",      color: "#6366f1", bg: "#eef2ff" },
                    { label: "Fee Payment",  icon: CreditCard,    to: "/parent/finance",    color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Messages",     icon: MessageSquare, to: "/chat",              color: "#0ea5e9", bg: "#f0f9ff" },
                    { label: "Complaints",   icon: AlertCircle,   to: "/parent/complaints", color: "#ef4444", bg: "#fef2f2" },
                    { label: "Calendar",     icon: Calendar,      to: "/parent/attendance", color: "#8b5cf6", bg: "#f5f3ff" },
                    { label: "Progress",     icon: TrendingUp,    to: "/parent/exams",      color: "#f97316", bg: "#fff7ed" },
                    { label: "Profile",      icon: Users,         to: "/parent/profile",    color: "#ec4899", bg: "#fdf2f8" },
                  ].map(({ label, icon: Icon, to, color, bg }) => (
                    <Link key={label} to={to}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: bg }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <p className="text-xs font-semibold text-gray-600 text-center leading-tight">{label}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Child details */}
              {childData && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">{childData.fullname}'s Details</h3>
                    <Link to={`/parent/child/${selectedChild?.id}`} className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                      Full profile <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Blood Group",     value: childData.blood_group },
                      { label: "Date of Birth",   value: childData.DOB ? new Date(childData.DOB).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null },
                      { label: "Student Contact", value: childData.student_contact },
                      { label: "Guardian",        value: childData.guardian_name },
                      { label: "Guardian Phone",  value: childData.guardian_phone },
                      { label: "Date of Joining", value: childData.date_of_joining ? new Date(childData.date_of_joining).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-6">
              {/* Announcements */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-gray-900">Announcements</h3>
                  <Link to="/parent/announcement" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">See all</Link>
                </div>
                <div className="space-y-3">
                  {announcements.map((ann) => {
                    const style = TYPE_STYLES[ann.type] || TYPE_STYLES.event;
                    return (
                      <div key={ann.id} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Bell size={14} className={style.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{ann.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{ann.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming events */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-5">Upcoming Events</h3>
                <div className="space-y-3">
                  {[
                    { date: "10", month: "NOV", title: "Half-yearly Exams",      color: "#ef4444" },
                    { date: "02", month: "NOV", title: "Parent-Teacher Meeting",  color: "#f59e0b" },
                    { date: "30", month: "OCT", title: "Fee Payment Deadline",    color: "#6366f1" },
                    { date: "05", month: "DEC", title: "Annual Sports Day",       color: "#10b981" },
                  ].map(({ date, month, title, color }) => (
                    <div key={title} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: color }}>
                        <span className="text-white text-sm font-bold leading-none">{date}</span>
                        <span className="text-white/80 text-[9px] font-semibold mt-0.5">{month}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages dark card */}
              <div className="bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Messages</p>
                    <p className="text-gray-400 text-xs">2 unread messages</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-4">You have new messages from teachers.</p>
                <Link to="/chat" className="block w-full text-center bg-white text-gray-900 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  Open Messages →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}