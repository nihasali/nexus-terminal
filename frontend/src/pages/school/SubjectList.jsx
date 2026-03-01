import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import api from "../../api/axios";

const PlusIcon  = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const CheckIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon     = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BookIcon  = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;

const SUBJECT_COLORS = [
  "bg-violet-50 border-violet-200 text-violet-700",
  "bg-blue-50 border-blue-200 text-blue-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-rose-50 border-rose-200 text-rose-700",
  "bg-indigo-50 border-indigo-200 text-indigo-700",
  "bg-teal-50 border-teal-200 text-teal-700",
  "bg-orange-50 border-orange-200 text-orange-700",
];

function InlineInput({ value, onChange, placeholder, className = "", autoFocus = false }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${className}`}
    />
  );
}

export default function SubjectList() {
  const [subjects, setSubjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);

  // Create form
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newCode, setNewCode]         = useState("");
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit state — one subject editable at a time
  const [editingId, setEditingId]     = useState(null);
  const [editName, setEditName]       = useState("");
  const [editCode, setEditCode]       = useState("");
  const [saving, setSaving]           = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("Subject_teacher/subjects/");
      setSubjects(res.data);
    } catch { showToast("Failed to load subjects.", "error"); }
    finally { setLoading(false); }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Create ──
  const handleCreate = async () => {
    if (!newName.trim()) { setCreateError("Subject name is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await api.post("Subject_teacher/subjects/", {
        name: newName.trim(),
        code: newCode.trim() || null,
      });
      setSubjects(prev => [...prev, res.data]);
      setNewName("");
      setNewCode("");
      setShowCreate(false);
      showToast(`"${res.data.name}" added successfully.`);
    } catch (err) {
      const msg = err.response?.data?.name?.[0] ||
                  err.response?.data?.error ||
                  Object.values(err.response?.data || {})[0] ||
                  "Failed to create subject.";
      setCreateError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setCreating(false); }
  };

  // ── Edit ──
  const startEdit = (subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditCode(subject.code || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await api.patch(`Subject_teacher/subjects/${id}/`, {
        name: editName.trim(),
        code: editCode.trim() || null,
      });
      setSubjects(prev => prev.map(s => s.id === id ? res.data : s));
      cancelEdit();
      showToast("Subject updated.");
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || "Failed to update subject.";
      showToast(Array.isArray(msg) ? msg[0] : msg, "error");
    } finally { setSaving(false); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`Subject_teacher/subjects/${deleteTarget.id}/`);
      setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast(`"${deleteTarget.name}" deleted.`);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete. Subject may have active assignments.";
      showToast(msg, "error");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <CheckIcon size={15} /> : <XIcon size={15} />}
          {toast.message}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrashIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Subject?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>"{deleteTarget.name}"</strong> will be permanently deleted. This cannot be undone.
              If teachers are assigned to this subject, deletion will be blocked.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
              <p className="text-sm text-gray-400 mt-1">
                {subjects.length} subject{subjects.length !== 1 ? "s" : ""} · Used in teaching assignments and timetable
              </p>
            </div>
            <button
              onClick={() => { setShowCreate(true); setCreateError(""); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 shadow-sm transition-all"
            >
              <PlusIcon /> Add Subject
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* ── Inline create form ── */}
          {showCreate && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">New Subject</h3>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <InlineInput
                    value={newName}
                    onChange={v => { setNewName(v); setCreateError(""); }}
                    placeholder="Subject name  e.g. Mathematics"
                    autoFocus
                    className="w-full"
                  />
                  {createError && <p className="text-red-500 text-xs mt-1.5">{createError}</p>}
                </div>
                <InlineInput
                  value={newCode}
                  onChange={setNewCode}
                  placeholder="Code  e.g. MATH"
                  className="w-36"
                />
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all h-[38px]"
                >
                  {creating
                    ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <><PlusIcon /> Add</>
                  }
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewName(""); setNewCode(""); setCreateError(""); }}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors h-[38px] w-[38px] flex items-center justify-center"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookIcon className="text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold">No subjects yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Add subjects before creating teaching assignments</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all"
              >
                <PlusIcon /> Add First Subject
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100">
                <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">#</p>
                <p className="col-span-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subject Name</p>
                <p className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Code</p>
                <p className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</p>
              </div>

              {/* Rows */}
              {subjects.map((subject, i) => {
                const colorClass = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                const isEditing  = editingId === subject.id;

                return (
                  <div key={subject.id}
                    className={`grid grid-cols-12 items-center px-6 py-4 border-b border-gray-50 last:border-0 transition-colors ${
                      isEditing ? "bg-gray-50" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Index */}
                    <div className="col-span-1">
                      <span className="text-xs text-gray-300 font-medium">{String(i + 1).padStart(2, "0")}</span>
                    </div>

                    {/* Name */}
                    <div className="col-span-5">
                      {isEditing ? (
                        <InlineInput
                          value={editName}
                          onChange={setEditName}
                          placeholder="Subject name"
                          autoFocus
                          className="w-full max-w-xs"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <span className="text-xs font-black">
                              {subject.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Code */}
                    <div className="col-span-3">
                      {isEditing ? (
                        <InlineInput
                          value={editCode}
                          onChange={setEditCode}
                          placeholder="e.g. MATH"
                          className="w-28"
                        />
                      ) : (
                        subject.code
                          ? <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${colorClass}`}>{subject.code}</span>
                          : <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(subject.id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                          >
                            {saving
                              ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <CheckIcon size={12} />
                            }
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <XIcon size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(subject)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                          >
                            <EditIcon size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(subject)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info note */}
          {subjects.length > 0 && (
            <div className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-xs text-amber-700">
                Subjects with active teaching assignments cannot be deleted.
                Remove the assignment first from the Class detail page.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}