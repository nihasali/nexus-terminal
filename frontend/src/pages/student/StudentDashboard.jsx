import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ── Mock data fallback for graceful loading ──
const EMPTY_STUDENT = {
  fullname: "",
  email: "",
  admission_number: "",
  roll_number: "",
  blood_group: "",
  date_of_joining: "",
  DOB: "",
  guardian_name: "",
  guardian_phone: "",
  address: "",
  profile_picture: null,
  class_name: "",
  section: "",
};

const NAV_ITEMS = [
  { label: "Dashboard",    icon: HomeIcon,        to: "/student/dashboard" },
  { label: "My Profile",   icon: UserIcon,        to: "/student/profile" },
  { label: "Attendance",   icon: CalendarIcon,    to: "/student/attendance" },
  { label: "Assignments",  icon: BookIcon,        to: "/student/assignments" },
  { label: "Timetable",    icon: ClockIcon,       to: "/student/timetable" },
  { label: "Results",      icon: TrophyIcon,      to: "/student/results" },
  { label: "Finance",      icon: WalletIcon,      to: "/student/finance" },
  { label: "Complaints",   icon: AlertIcon,       to: "/student/complaints" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(EMPTY_STUDENT);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchProfile();
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("Profile/student/dashboard/");
      setStudent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (_) {}
    navigate("/login");
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const initials = student.fullname
    ? student.fullname.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  const stats = [
    { label: "Attendance",    value: "92%",  sub: "This month",    color: "#10b981", bg: "#ecfdf5", icon: CalendarIcon },
    { label: "Assignments",   value: "8",    sub: "Pending",        color: "#f59e0b", bg: "#fffbeb", icon: BookIcon },
    { label: "Rank",          value: "#3",   sub: "In class",       color: "#6366f1", bg: "#eef2ff", icon: TrophyIcon },
    { label: "Fee Status",    value: "Paid", sub: "Current term",   color: "#0ea5e9", bg: "#f0f9ff", icon: WalletIcon },
  ];

  const announcements = [
    { title: "Half-yearly exams start Nov 10", time: "2h ago",  tag: "Exam",   tagColor: "#ef4444" },
    { title: "Annual Sports Day — Dec 5",      time: "1d ago",  tag: "Event",  tagColor: "#f59e0b" },
    { title: "Fee payment deadline: Oct 30",   time: "2d ago",  tag: "Finance",tagColor: "#6366f1" },
    { title: "New library books available",    time: "3d ago",  tag: "Library",tagColor: "#10b981" },
  ];

  const schedule = [
    { time: "08:00",  subject: "Mathematics",       teacher: "Mr. Ramesh",   color: "#6366f1" },
    { time: "09:00",  subject: "Physics",            teacher: "Ms. Priya",    color: "#f59e0b" },
    { time: "10:00",  subject: "English Literature", teacher: "Mr. George",   color: "#10b981" },
    { time: "11:00",  subject: "Computer Science",   teacher: "Ms. Anitha",   color: "#0ea5e9" },
    { time: "13:00",  subject: "Chemistry",          teacher: "Mr. Kumar",    color: "#ef4444" },
    { time: "14:00",  subject: "History",            teacher: "Ms. Lakshmi",  color: "#8b5cf6" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8f7f4", minHeight: "100vh", display: "flex" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transition: "transform 0.3s",
        transform: sidebarOpen || window.innerWidth >= 1024 ? "translateX(0)" : "translateX(-100%)",
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #c9a84c, #f0d080)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#0f0f0f"
            }}>N</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>NEXUS</p>
              <p style={{ color: "#666", fontSize: 11, margin: 0 }}>Student Portal</p>
            </div>
          </div>
        </div>

        {/* Student mini-card */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {student.profile_picture ? (
              <img src={student.profile_picture} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a84c, #f0d080)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, color: "#0f0f0f"
              }}>{initials}</div>
            )}
            <div style={{ overflow: "hidden" }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {loading ? "Loading..." : student.fullname || "Student"}
              </p>
              <p style={{ color: "#666", fontSize: 11, margin: 0 }}>
                {student.admission_number || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
            const active = window.location.pathname === to;
            return (
              <Link key={label} to={to} style={{ textDecoration: "none" }}
                onClick={() => setSidebarOpen(false)}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 24px",
                  background: active ? "#1e1e1e" : "transparent",
                  borderLeft: active ? "3px solid #c9a84c" : "3px solid transparent",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}>
                  <Icon size={16} color={active ? "#c9a84c" : "#666"} />
                  <span style={{ color: active ? "#fff" : "#888", fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1e1e1e" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: "8px 0"
            }}
          >
            <LogoutIcon size={16} color="#666" />
            <span style={{ color: "#666", fontSize: 13 }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
        />
      )}

      {/* ── Main content ── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: "100vh", padding: "0 0 40px" }}>

        {/* Top bar */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #ebebeb",
          padding: "0 36px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "none" }}
          >
            <MenuIcon size={22} color="#333" />
          </button>

          <div>
            <p style={{ margin: 0, color: "#999", fontSize: 12 }}>
              {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Live clock */}
            <div style={{
              background: "#f3f3f0",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#333",
              letterSpacing: "0.05em",
              fontVariantNumeric: "tabular-nums",
            }}>
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            {/* Avatar */}
            {student.profile_picture ? (
              <img src={student.profile_picture} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a84c, #f0d080)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13, color: "#0f0f0f"
              }}>{initials}</div>
            )}
          </div>
        </div>

        <div style={{ padding: "36px 36px 0" }}>

          {/* Greeting banner */}
          <div style={{
            background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
            borderRadius: 20,
            padding: "32px 40px",
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(201,168,76,0.08)" }} />
            <div style={{ position: "absolute", bottom: -60, right: 100, width: 240, height: 240, borderRadius: "50%", background: "rgba(201,168,76,0.05)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600, margin: "0 0 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {greeting()}
              </p>
              <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {loading ? "Welcome back!" : `Welcome back, ${student.fullname?.split(" ")[0] || "Student"}!`}
              </h1>
              <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                {student.class_name
                  ? `Class ${student.class_name}${student.section ? ` · Section ${student.section}` : ""} · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                  : "Have a productive day ahead."}
              </p>
            </div>

            {/* Gold accent line */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "linear-gradient(to bottom, #c9a84c, #f0d080)", borderRadius: "20px 0 0 20px" }} />
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            {stats.map(({ label, value, sub, color, bg, icon: Icon }) => (
              <div key={label} style={{
                background: "#fff",
                borderRadius: 16,
                padding: "24px 20px",
                border: "1px solid #ebebeb",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>{sub}</span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#0f0f0f", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{value}</p>
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

            {/* Left col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Today's schedule */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #ebebeb" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f0f0f", margin: 0 }}>Today's Schedule</h2>
                  <span style={{ fontSize: 12, color: "#aaa" }}>
                    {time.toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {schedule.map(({ time: t, subject, teacher, color }, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: i === 2 ? "#0f0f0f" : "#fafaf8",
                      border: i === 2 ? "none" : "1px solid #f0f0f0",
                      transition: "background 0.2s",
                    }}>
                      <div style={{ width: 48, textAlign: "center" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: i === 2 ? "#c9a84c" : "#999", margin: 0 }}>{t}</p>
                      </div>
                      <div style={{ width: 3, height: 32, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: i === 2 ? "#fff" : "#0f0f0f", margin: "0 0 2px" }}>{subject}</p>
                        <p style={{ fontSize: 12, color: i === 2 ? "#888" : "#aaa", margin: 0 }}>{teacher}</p>
                      </div>
                      {i === 2 && (
                        <span style={{
                          background: "#c9a84c", color: "#0f0f0f",
                          fontSize: 10, fontWeight: 700, padding: "3px 8px",
                          borderRadius: 6, letterSpacing: "0.05em"
                        }}>NOW</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile summary */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #ebebeb" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f0f0f", margin: "0 0 20px" }}>My Details</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Admission No",  value: student.admission_number },
                    { label: "Roll Number",   value: student.roll_number },
                    { label: "Blood Group",   value: student.blood_group },
                    { label: "Date of Birth", value: student.DOB ? new Date(student.DOB).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                    { label: "Guardian",      value: student.guardian_name },
                    { label: "Guardian Phone",value: student.guardian_phone },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "12px 16px", background: "#fafaf8", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0f0f0f", margin: 0 }}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Quick actions */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #ebebeb" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f0f", margin: "0 0 16px" }}>Quick Actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "View Profile",  icon: UserIcon,     to: "/student/profile",    color: "#6366f1", bg: "#eef2ff" },
                    { label: "Attendance",    icon: CalendarIcon, to: "/student/attendance", color: "#10b981", bg: "#ecfdf5" },
                    { label: "Timetable",     icon: ClockIcon,    to: "/student/timetable",  color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Results",       icon: TrophyIcon,   to: "/student/results",    color: "#ef4444", bg: "#fef2f2" },
                    { label: "Assignments",   icon: BookIcon,     to: "/student/assignments",color: "#0ea5e9", bg: "#f0f9ff" },
                    { label: "Complaints",    icon: AlertIcon,    to: "/student/complaints", color: "#8b5cf6", bg: "#f5f3ff" },
                  ].map(({ label, icon: Icon, to, color, bg }) => (
                    <Link key={label} to={to} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "14px 12px",
                        borderRadius: 12,
                        background: bg,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "transform 0.15s",
                        border: `1px solid ${color}22`,
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                          <Icon size={20} color={color} />
                        </div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: color, margin: 0 }}>{label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #ebebeb" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f0f", margin: "0 0 16px" }}>Announcements</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {announcements.map(({ title, time: t, tag, tagColor }, i) => (
                    <div key={i} style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#fafaf8",
                      border: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fafaf8"}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.4 }}>{title}</p>
                        <span style={{
                          flexShrink: 0, fontSize: 9, fontWeight: 700, padding: "2px 7px",
                          borderRadius: 4, background: tagColor + "18", color: tagColor,
                          letterSpacing: "0.05em"
                        }}>{tag.toUpperCase()}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Inline SVG icon components ──
function HomeIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function UserIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function CalendarIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function BookIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function ClockIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TrophyIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14 22 12 17 10 22"/><line x1="8" y1="22" x2="16" y2="22"/><path d="M9 3h6l1 7a4 4 0 01-8 0z"/><path d="M5 3H3v5a5 5 0 004 4.9M19 3h2v5a5 5 0 01-4 4.9"/></svg>;
}
function WalletIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V6H4a2 2 0 000 4h16"/><path d="M20 6v14H4a2 2 0 01-2-2V6"/><circle cx="16" cy="12" r="1" fill={color}/></svg>;
}
function AlertIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function LogoutIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function MenuIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}