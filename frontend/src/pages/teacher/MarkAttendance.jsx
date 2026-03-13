import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./TeacherLayout";

// ── Icons ──
const CheckIcon   = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon       = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ClockIcon   = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SaveIcon    = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const LockIcon    = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const EditIcon    = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CalendarIcon = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const STATUS_CONFIG = {
  present: { label: "Present", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-500", icon: <CheckIcon /> },
  absent:  { label: "Absent",  bg: "bg-red-500",     light: "bg-red-50 text-red-700 border-red-200",         ring: "ring-red-500",     icon: <XIcon /> },
  late:    { label: "Late",    bg: "bg-amber-500",   light: "bg-amber-50 text-amber-700 border-amber-200",   ring: "ring-amber-500",   icon: <ClockIcon /> },
};

function StatusToggle({ status, onChange, disabled }) {
  return (
    <div className="flex gap-1.5">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => !disabled && onChange(key)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            status === key
              ? `${cfg.bg} text-white border-transparent shadow-sm`
              : `bg-white ${cfg.light} hover:opacity-80`
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {cfg.icon} {cfg.label}
        </button>
      ))}
    </div>
  );
}

export default function MarkAttendance() {
  const navigate = useNavigate();

  const [myClass, setMyClass]     = useState(null);
  const [classLoading, setClassLoading] = useState(true);
  const [date, setDate]           = useState(() => new Date().toISOString().split("T")[0]);
  const [sheet, setSheet]         = useState([]);
  const [session, setSession]     = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [statuses, setStatuses]   = useState({});  // { academic_record_id: { status, note } }
  const [notes, setNotes]         = useState({});
  const [activeNote, setActiveNote] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // override lock for editing
  const [toast, setToast]         = useState(null);
  const [dirty, setDirty]         = useState(false);

  // ── Load teacher's class ──
  useEffect(() => {
    api.get("Class/my-class/")
      .then(res => setMyClass(res.data))
      .catch(() => setMyClass(null))
      .finally(() => setClassLoading(false));
  }, []);

  // ── Load sheet when class or date changes ──
  useEffect(() => {
    if (myClass) fetchSheet();
  }, [myClass, date]);

  const fetchSheet = useCallback(async () => {
    if (!myClass) return;
    setSheetLoading(true);
    setDirty(false);
    setIsEditing(false);
    try {
      const res = await api.get(
        `Class/attendance/classes/${myClass.id}/sheet/?date=${date}`
      );
      const data = res.data;
      setSheet(data.sheet);
      setSession(data.session);

      // Build initial statuses — default to "present" if not yet marked
      const initial = {};
      const initialNotes = {};
      data.sheet.forEach(row => {
        initial[row.academic_record_id]      = row.status || "present";
        initialNotes[row.academic_record_id] = row.note  || "";
      });
      setStatuses(initial);
      setNotes(initialNotes);
    } catch (err) {
      showToast("Failed to load attendance sheet.", "error");
    } finally { setSheetLoading(false); }
  }, [myClass, date]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusChange = (recordId, status) => {
    setStatuses(prev => ({ ...prev, [recordId]: status }));
    setDirty(true);
  };

  const handleNoteChange = (recordId, note) => {
    setNotes(prev => ({ ...prev, [recordId]: note }));
    setDirty(true);
  };

  // ── Mark all present ──
  const markAllPresent = () => {
    const all = {};
    sheet.forEach(row => { all[row.academic_record_id] = "present"; });
    setStatuses(all);
    setDirty(true);
  };

  // ── Save (without locking) ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const records = sheet.map(row => ({
        academic_record_id: row.academic_record_id,
        status: statuses[row.academic_record_id] || "present",
        note:   notes[row.academic_record_id]    || "",
      }));
      await api.post(`Class/attendance/classes/${myClass.id}/mark/`, {
        date,
        records,
      });
      await fetchSheet();
      showToast("Attendance saved.");
      setDirty(false);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save attendance.", "error");
    } finally { setSaving(false); }
  };

  // ── Submit and lock ──
  const handleSubmit = async () => {
    // First save, then lock
    setSaving(true);
    try {
      const records = sheet.map(row => ({
        academic_record_id: row.academic_record_id,
        status: statuses[row.academic_record_id] || "present",
        note:   notes[row.academic_record_id]    || "",
      }));
      await api.post(`Class/attendance/classes/${myClass.id}/mark/`, { date, records });
      await api.post(`Class/attendance/classes/${myClass.id}/submit/?date=${date}`);
      await fetchSheet();
      showToast("Attendance submitted and locked.");
      setDirty(false);
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit attendance.", "error");
    } finally { setSaving(false); setSubmitting(false); }
  };

  // ── Stats ──
  const stats = sheet.reduce(
    (acc, row) => {
      const s = statuses[row.academic_record_id] || "present";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0 }
  );

  const isLocked   = session?.is_complete && !isEditing;
  const isToday    = date === new Date().toISOString().split("T")[0];
  const absentList = sheet.filter(r => statuses[r.academic_record_id] === "absent");

  if (classLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!myClass) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Class Assigned</h2>
          <p className="text-gray-400 text-sm">You are not assigned as a class teacher. Contact your school admin.</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <CheckIcon size={15} /> : <XIcon size={15} />}
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gray-50">

        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">

              {/* Class info */}
              <div className="flex items-center gap-4">
                <div className="bg-gray-900 rounded-xl px-4 py-2.5 text-center min-w-[56px]">
                  <p className="text-white text-2xl font-black leading-none">{myClass.name}</p>
                  {myClass.section && (
                    <p className="text-amber-400 text-xs font-bold">{myClass.section}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-base">Attendance</p>
                  <p className="text-gray-400 text-xs">{myClass.student_count} students · {myClass.academic_year}</p>
                </div>
              </div>

              {/* Date picker */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <CalendarIcon className="text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer"
                  />
                </div>
                {!isToday && (
                  <button onClick={() => setDate(new Date().toISOString().split("T")[0])}
                    className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors">
                    Today
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

          {/* ── Status bar ── */}
          <div className="grid grid-cols-4 gap-4">
            {/* Present */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckIcon size={16} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.present}</p>
                <p className="text-xs text-gray-400">Present</p>
              </div>
            </div>
            {/* Absent */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XIcon size={16} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.absent}</p>
                <p className="text-xs text-gray-400">Absent</p>
              </div>
            </div>
            {/* Late */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ClockIcon size={16} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.late}</p>
                <p className="text-xs text-gray-400">Late</p>
              </div>
            </div>
            {/* Percentage */}
            <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/5" />
              <div className="relative z-10">
                <p className="text-2xl font-black text-white">
                  {sheet.length > 0
                    ? Math.round(((stats.present + stats.late) / sheet.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-400">Attendance</p>
              </div>
            </div>
          </div>

          {/* ── Session status banner ── */}
          {session?.is_complete && (
            <div className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border ${
              isEditing
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center gap-2.5">
                {isEditing
                  ? <EditIcon size={15} className="text-amber-600" />
                  : <LockIcon size={15} className="text-emerald-600" />
                }
                <p className={`text-sm font-semibold ${isEditing ? "text-amber-700" : "text-emerald-700"}`}>
                  {isEditing
                    ? "Editing mode — changes not saved yet"
                    : `Attendance submitted and locked`
                  }
                </p>
              </div>
              <button
                onClick={() => setIsEditing(e => !e)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  isEditing
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {isEditing ? "Cancel Edit" : "Edit"}
              </button>
            </div>
          )}

          {/* ── Absent students quick list ── */}
          {absentList.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                Absent Today ({absentList.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {absentList.map(row => (
                  <span key={row.academic_record_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 rounded-full text-xs font-semibold text-red-700">
                    {row.profile_picture
                      ? <img src={row.profile_picture} alt="" className="w-4 h-4 rounded-full object-cover" />
                      : <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-[9px] font-black text-red-700">{row.fullname?.charAt(0)}</span>
                    }
                    {row.fullname}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Attendance sheet ── */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">
                {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
              </p>
              {!isLocked && (
                <button onClick={markAllPresent}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 bg-gray-100 rounded-lg transition-colors">
                  Mark All Present
                </button>
              )}
            </div>

            {sheetLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : sheet.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">No students enrolled in this class yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {sheet.map((row, i) => {
                  const status   = statuses[row.academic_record_id] || "present";
                  const initials = row.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  const isNoteOpen = activeNote === row.academic_record_id;

                  return (
                    <div key={row.academic_record_id}
                      className={`px-6 py-4 transition-colors ${
                        status === "absent" ? "bg-red-50/50" :
                        status === "late"   ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Index */}
                        <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0 font-medium">
                          {row.roll_number || (i + 1)}
                        </span>

                        {/* Avatar */}
                        {row.profile_picture
                          ? <img src={row.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">{initials}</div>
                        }

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{row.fullname}</p>
                          <p className="text-xs text-gray-400">{row.admission_number}</p>
                        </div>

                        {/* Status toggle */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <StatusToggle
                            status={status}
                            onChange={s => handleStatusChange(row.academic_record_id, s)}
                            disabled={isLocked}
                          />
                          {/* Note button */}
                          {!isLocked && (
                            <button
                              onClick={() => setActiveNote(isNoteOpen ? null : row.academic_record_id)}
                              className={`p-2 rounded-lg text-xs transition-colors ${
                                notes[row.academic_record_id]
                                  ? "text-blue-500 bg-blue-50"
                                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                              }`}
                              title="Add note"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                            </button>
                          )}
                          {/* Show note if locked */}
                          {isLocked && notes[row.academic_record_id] && (
                            <span className="text-xs text-gray-400 italic max-w-[120px] truncate">
                              "{notes[row.academic_record_id]}"
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Note input (inline) */}
                      {isNoteOpen && !isLocked && (
                        <div className="mt-3 ml-[84px]">
                          <input
                            autoFocus
                            value={notes[row.academic_record_id] || ""}
                            onChange={e => handleNoteChange(row.academic_record_id, e.target.value)}
                            placeholder="Add a note (e.g. 'Doctor's appointment')..."
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            onKeyDown={e => e.key === "Enter" && setActiveNote(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Action bar ── */}
          {!isLocked && sheet.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between gap-4 sticky bottom-6 shadow-lg shadow-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.absent > 0
                    ? <span className="text-red-500">{stats.absent} absent</span>
                    : <span className="text-emerald-600">All students present</span>
                  }
                  {stats.late > 0 && (
                    <span className="text-amber-500 ml-2">· {stats.late} late</span>
                  )}
                </p>
                {dirty && <p className="text-xs text-amber-500 mt-0.5">Unsaved changes</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all">
                  {saving
                    ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <SaveIcon />
                  }
                  Save Draft
                </button>
                <button onClick={handleSubmit} disabled={saving || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 shadow-sm transition-all">
                  {submitting
                    ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <LockIcon />
                  }
                  Submit & Lock
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}