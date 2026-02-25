import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

const ArrowLeftIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const PlusIcon      = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon         = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIcon     = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const SearchIcon    = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

export default function ClassDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [cls, setCls]               = useState(null);
  const [loading, setLoading]       = useState(true);

  // Assign students
  const [unassigned, setUnassigned]     = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [showStudentPanel, setShowStudentPanel]   = useState(false);

  // Assign teacher
  const [availableTeachers, setAvailableTeachers]   = useState([]);
  const [selectedTeacher, setSelectedTeacher]       = useState("");
  const [assigningTeacher, setAssigningTeacher]     = useState(false);
  const [showTeacherPanel, setShowTeacherPanel]     = useState(false);

  // Remove student confirm
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving]         = useState(false);

  // Delete class confirm
  const [showDelete, setShowDelete]     = useState(false);
  const [deleting, setDeleting]         = useState(false);

  const [toast, setToast]               = useState(null);

  useEffect(() => { fetchClass(); }, []);

  const fetchClass = async () => {
    try {
      const res = await api.get(`Class/school-classes/${id}/`);
      setCls(res.data);
    } catch { navigate("/school-classes"); }
    finally { setLoading(false); }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openStudentPanel = async () => {
    try {
      const res = await api.get("Class/school-students/unassigned/");
      setUnassigned(res.data);
      setSelectedStudents([]);
      setStudentSearch("");
      setShowStudentPanel(true);
    } catch { showToast("Failed to load unassigned students.", "error"); }
  };

  const openTeacherPanel = async () => {
    try {
      const res = await api.get("Class/school-teachers/available/");
      setAvailableTeachers(res.data);
      setSelectedTeacher(cls?.class_teacher?.id?.toString() || "");
      setShowTeacherPanel(true);
    } catch { showToast("Failed to load teachers.", "error"); }
  };

  const toggleStudentSelect = (student) => {
    setSelectedStudents(prev =>
      prev.find(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return;
    setAssigningStudents(true);
    try {
      const res = await api.post(`Class/school-classes/${id}/assign-students/`, {
        admission_numbers: selectedStudents.map(s => s.admission_number),
      });
      setCls(res.data);
      setShowStudentPanel(false);
      showToast(`${selectedStudents.length} student(s) added to class.`);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign students.", "error");
    } finally { setAssigningStudents(false); }
  };

  const handleRemoveStudent = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await api.delete(`Class/school-classes/${id}/assign-students/`, {
        data: { admission_numbers: [removeTarget.admission_number] },
      });
      setCls(res.data);
      setRemoveTarget(null);
      showToast(`${removeTarget.fullname} removed from class.`);
    } catch { showToast("Failed to remove student.", "error"); }
    finally { setRemoving(false); }
  };

  const handleAssignTeacher = async () => {
    setAssigningTeacher(true);
    try {
      await api.post(`Class/school-classes/${id}/assign-teacher/`, {
        teacher_id: selectedTeacher ? parseInt(selectedTeacher) : null,
      });
      await fetchClass();
      setShowTeacherPanel(false);
      showToast("Class teacher updated.");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign teacher.", "error");
    } finally { setAssigningTeacher(false); }
  };

  const handleDeleteClass = async () => {
    setDeleting(true);
    try {
      await api.delete(`Class/school-classes/${id}/`);
      showToast("Class deleted.");
      setTimeout(() => navigate("/school-classes"), 1000);
    } catch { showToast("Failed to delete class.", "error"); setDeleting(false); }
  };

  const filteredUnassigned = unassigned.filter(s =>
    s.fullname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!cls) return null;

  const teacherInitials = cls.class_teacher?.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Remove student modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Student?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{removeTarget.fullname}</strong> will be removed from this class. Their student account won't be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleRemoveStudent} disabled={removing}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50">
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete class modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Class?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Class <strong>{cls.name}{cls.section ? ` - ${cls.section}` : ""}</strong> will be permanently deleted.
              All {cls.student_count} students will be unassigned. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteClass} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
            <Link to="/school-classes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon size={16} /> Back to Classes
            </Link>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-100 transition-all">
              <TrashIcon /> Delete Class
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Class identity + teacher */}
            <div className="space-y-6">

              {/* Hero card */}
              <div className="bg-gray-900 rounded-2xl p-7 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-amber-400 to-amber-600" />
                <div className="relative z-10">
                  <p className="text-gray-400 text-xs font-medium mb-2">{cls.academic_year}</p>
                  <p className="text-white text-5xl font-black leading-none mb-3">{cls.name}</p>
                  {cls.section && (
                    <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-400 text-sm font-bold rounded-full">
                      Section {cls.section}
                    </span>
                  )}
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-3xl font-bold text-white">{cls.student_count}</p>
                    <p className="text-gray-400 text-sm">Students enrolled</p>
                  </div>
                </div>
              </div>

              {/* Class teacher */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-900">Class Teacher</h3>
                  <button onClick={openTeacherPanel}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                    {cls.class_teacher ? "Change" : "Assign"}
                  </button>
                </div>

                {cls.class_teacher ? (
                  <div className="flex items-center gap-3">
                    {cls.class_teacher.profile_picture
                      ? <img src={cls.class_teacher.profile_picture} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      : <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm font-bold">{teacherInitials}</div>
                    }
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cls.class_teacher.fullname}</p>
                      <p className="text-xs text-gray-400">{cls.class_teacher.email}</p>
                      {cls.class_teacher.subject && (
                        <p className="text-xs text-gray-400 mt-0.5">{cls.class_teacher.subject}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">No teacher assigned</p>
                    <button onClick={openTeacherPanel}
                      className="mt-3 text-xs text-gray-900 font-bold underline hover:no-underline">
                      Assign now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Student roster */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Student Roster</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cls.student_count} students in this class</p>
                  </div>
                  <button onClick={openStudentPanel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all">
                    <PlusIcon /> Add Students
                  </button>
                </div>

                {cls.students?.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <p className="text-gray-500 font-semibold text-sm">No students enrolled yet</p>
                    <p className="text-gray-400 text-xs mt-1">Add students from the unassigned pool</p>
                    <button onClick={openStudentPanel}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all mx-auto">
                      <PlusIcon /> Add Students
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {cls.students.map((student, i) => {
                      const initials = student.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                            {student.profile_picture
                              ? <img src={student.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">{initials}</div>
                            }
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{student.fullname}</p>
                              <p className="text-xs text-gray-400">{student.admission_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/school-student-details/${student.id}`}
                              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                              View
                            </Link>
                            <button onClick={() => setRemoveTarget(student)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <XIcon />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Students Slide Panel ── */}
      {showStudentPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowStudentPanel(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Students</h3>
                <p className="text-xs text-gray-400 mt-0.5">{unassigned.length} unassigned students available</p>
              </div>
              <button onClick={() => setShowStudentPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XIcon size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="text-gray-400" />
                </div>
                <input
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Search by name or admission number..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Selected strip */}
            {selectedStudents.length > 0 && (
              <div className="px-6 py-3 bg-gray-900 flex items-center justify-between">
                <p className="text-white text-sm font-semibold">{selectedStudents.length} selected</p>
                <button onClick={() => setSelectedStudents([])} className="text-gray-400 text-xs hover:text-white">Clear</button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredUnassigned.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">
                    {studentSearch ? "No students match your search" : "All students are already assigned to classes"}
                  </p>
                </div>
              ) : (
                filteredUnassigned.map(student => {
                  const selected = selectedStudents.find(s => s.id === student.id);
                  const initials = student.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={student.id}
                      onClick={() => toggleStudentSelect(student)}
                      className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-colors border-b border-gray-50 ${
                        selected ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected ? "bg-gray-900 border-gray-900" : "border-gray-300"
                      }`}>
                        {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {student.profile_picture
                        ? <img src={student.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">{initials}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{student.fullname}</p>
                        <p className="text-xs text-gray-400">{student.admission_number}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add button */}
            <div className="px-6 py-5 border-t border-gray-100">
              <button
                onClick={handleAssignStudents}
                disabled={selectedStudents.length === 0 || assigningStudents}
                className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {assigningStudents
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Adding...</>
                  : `Add ${selectedStudents.length > 0 ? selectedStudents.length + " " : ""}Student${selectedStudents.length !== 1 ? "s" : ""} to Class`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Teacher Slide Panel ── */}
      {showTeacherPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowTeacherPanel(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Assign Class Teacher</h3>
              <button onClick={() => setShowTeacherPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XIcon size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Remove option */}
              <div
                onClick={() => setSelectedTeacher("")}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer mb-3 border-2 transition-all ${
                  selectedTeacher === "" ? "border-gray-900 bg-gray-50" : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTeacher === "" ? "border-gray-900" : "border-gray-300"}`}>
                  {selectedTeacher === "" && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                </div>
                <p className="text-sm font-medium text-gray-500 italic">No class teacher (remove current)</p>
              </div>

              {availableTeachers.length === 0 && !cls.class_teacher ? (
                <p className="text-sm text-gray-400 text-center py-8">No available teachers to assign.</p>
              ) : (
                <>
                  {/* Show current teacher even if not in "available" list */}
                  {cls.class_teacher && (
                    <div
                      onClick={() => setSelectedTeacher(cls.class_teacher.id.toString())}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer mb-2 border-2 transition-all ${
                        selectedTeacher === cls.class_teacher.id.toString() ? "border-gray-900 bg-gray-50" : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedTeacher === cls.class_teacher.id.toString() ? "border-gray-900" : "border-gray-300"}`}>
                        {selectedTeacher === cls.class_teacher.id.toString() && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                      </div>
                      {cls.class_teacher.profile_picture
                        ? <img src={cls.class_teacher.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{teacherInitials}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cls.class_teacher.fullname}</p>
                        <p className="text-xs text-gray-400">{cls.class_teacher.email}</p>
                        <span className="text-xs text-amber-600 font-semibold">Current teacher</span>
                      </div>
                    </div>
                  )}

                  {availableTeachers.map(t => {
                    const tInitials = t.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    const isSelected = selectedTeacher === t.id.toString();
                    return (
                      <div key={t.id}
                        onClick={() => setSelectedTeacher(t.id.toString())}
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer mb-2 border-2 transition-all ${
                          isSelected ? "border-gray-900 bg-gray-50" : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-gray-900" : "border-gray-300"}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                        </div>
                        {t.profile_picture
                          ? <img src={t.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">{tInitials}</div>
                        }
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.fullname}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                          {t.subject && <p className="text-xs text-gray-400">{t.subject}</p>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="px-6 py-5 border-t border-gray-100">
              <button
                onClick={handleAssignTeacher}
                disabled={assigningTeacher}
                className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {assigningTeacher
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                  : "Confirm Assignment"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}