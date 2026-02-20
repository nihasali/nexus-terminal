import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

// Icons
const ArrowLeftIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const EditIcon      = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon     = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const PlusIcon      = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon         = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LinkIcon      = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const UserIcon      = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon      = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon     = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>;

const RELATION_COLORS = {
  father:   { bg: "#eff6ff", text: "#2563eb" },
  mother:   { bg: "#fdf2f8", text: "#9d174d" },
  guardian: { bg: "#f0fdf4", text: "#166534" },
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ParentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent]           = useState(null);
  const [loading, setLoading]         = useState(true);

  // Link student state
  const [admissionInput, setAdmissionInput] = useState("");
  const [linkLoading, setLinkLoading]       = useState(false);
  const [linkError, setLinkError]           = useState("");

  // Unlink confirm state
  const [unlinkTarget, setUnlinkTarget] = useState(null); // { admission_number, fullname }
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  // Delete parent state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading]         = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => { fetchParent(); }, []);

  const fetchParent = async () => {
    try {
      const res = await api.get(`Profile/school-parents/details/${id}/`);
      setParent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLinkStudent = async () => {
    const num = admissionInput.trim();
    if (!num) return;

    setLinkLoading(true);
    setLinkError("");

    try {
      await api.post(`Profile/school-parents/${id}/link-students/`, {
        admission_numbers: [num],
      });
      showToast("Student linked successfully!");
      setAdmissionInput("");
      fetchParent(); // refresh
    } catch (err) {
      setLinkError(err.response?.data?.error || "Failed to link student.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkStudent = async () => {
    if (!unlinkTarget) return;
    setUnlinkLoading(true);
    try {
      await api.delete(`Profile/school-parents/${id}/link-students/`, {
        data: { admission_numbers: [unlinkTarget.admission_number] },
      });
      showToast(`${unlinkTarget.fullname} unlinked.`);
      setUnlinkTarget(null);
      fetchParent();
    } catch (err) {
      showToast("Failed to unlink student.", "error");
    } finally {
      setUnlinkLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`Profile/school-parents/details/${id}/`);
      showToast("Parent deleted.");
      setTimeout(() => navigate("/school-parents/list/"), 1200);
    } catch (err) {
      showToast("Failed to delete parent.", "error");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <svg className="animate-spin h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      </Layout>
    );
  }

  if (!parent) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-3">
          <p className="text-gray-500">Parent not found.</p>
          <Link to="/school-parents/list/" className="text-sm text-gray-900 underline">Back to list</Link>
        </div>
      </Layout>
    );
  }

  const rc       = RELATION_COLORS[parent.relation] || { bg: "#f9fafb", text: "#6b7280" };
  const initials = parent.fullname?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Unlink confirm modal */}
      {unlinkTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unlink Student?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{unlinkTarget.fullname}</strong> ({unlinkTarget.admission_number}) will be removed from this parent's linked children. The student account won't be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUnlinkTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleUnlinkStudent} disabled={unlinkLoading}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
                {unlinkLoading ? "Unlinking..." : "Yes, Unlink"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Parent?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete <strong>{parent.fullname}</strong>'s account and all their data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteParent} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <Link to="/school-parents/list/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon size={16} /> Back to Parents
            </Link>
            <div className="flex items-center gap-3">
              <Link to={`/school-parents/edit/${id}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all">
                <EditIcon size={14} /> Edit
              </Link>
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-100 transition-all">
                <TrashIcon size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Profile card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar + name */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
              {parent.profile_picture ? (
                <img src={parent.profile_picture} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {initials}
                </div>
              )}
              <h2 className="text-lg font-bold text-gray-900">{parent.fullname}</h2>
              <p className="text-sm text-gray-400 mt-1">{parent.email}</p>
              <div className="mt-3">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style={{ background: rc.bg, color: rc.text }}>
                  {parent.relation || "Parent"}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Details</h3>
              <InfoRow icon={MailIcon}  label="Email"       value={parent.email} />
              <InfoRow icon={PhoneIcon} label="Phone"       value={parent.phone} />
              <InfoRow icon={UserIcon}  label="Gender"      value={parent.gender ? parent.gender.charAt(0).toUpperCase() + parent.gender.slice(1) : null} />
              <InfoRow icon={UserIcon}  label="Occupation"  value={parent.occupation} />
              {parent.DOB && <InfoRow icon={UserIcon} label="Date of Birth"
                value={new Date(parent.DOB).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />}
            </div>
          </div>

          {/* RIGHT — Students */}
          <div className="lg:col-span-2 space-y-6">

            {/* Linked students */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Linked Children</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{parent.students?.length || 0} student(s) linked</p>
                </div>
              </div>

              {parent.students?.length > 0 ? (
                <div className="space-y-3">
                  {parent.students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.fullname}</p>
                          <p className="text-xs text-gray-400">{s.admission_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/school-student-details/${s.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setUnlinkTarget(s)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Unlink student"
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LinkIcon size={18} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No students linked yet</p>
                </div>
              )}
            </div>

            {/* Add new student link */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Link a Student</h3>
              <p className="text-xs text-gray-400 mb-5">Enter the student's admission number to link them to this parent</p>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={15} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={admissionInput}
                    onChange={(e) => { setAdmissionInput(e.target.value); setLinkError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLinkStudent()}
                    placeholder="e.g. holy-face-276f90-2026-0002"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  />
                </div>
                <button
                  onClick={handleLinkStudent}
                  disabled={linkLoading || !admissionInput.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {linkLoading
                    ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <PlusIcon size={15} />
                  }
                  Link
                </button>
              </div>

              {linkError && (
                <p className="text-red-500 text-xs mt-2">{linkError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}