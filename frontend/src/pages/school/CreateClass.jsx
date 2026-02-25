import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

const ArrowLeftIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const SaveIcon      = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default function CreateClass() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", section: "", academic_year: "", class_teacher_id: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => { fetchAvailableTeachers(); }, []);

  const fetchAvailableTeachers = async () => {
    try {
      const res = await api.get("Class/school-teachers/available/");
      setTeachers(res.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name          = "Class name is required";
    if (!form.academic_year.trim()) e.academic_year = "Academic year is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        section:       form.section.trim() || null,
        academic_year: form.academic_year.trim(),
        class_teacher_id: form.class_teacher_id ? parseInt(form.class_teacher_id) : null,
      };
      const res = await api.post("Class/school-classes/", payload);
      showToast("Class created successfully!");
      setTimeout(() => navigate(`/school-classes/${res.data.id}`), 1200);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const fieldError = Object.values(data)[0];
        showToast(Array.isArray(fieldError) ? fieldError[0] : fieldError, "error");
      } else {
        showToast("Failed to create class.", "error");
      }
      setSaving(false);
    }
  };

  // Generate academic year suggestions
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    `${currentYear - 1}-${String(currentYear).slice(2)}`,
    `${currentYear}-${String(currentYear + 1).slice(2)}`,
    `${currentYear + 1}-${String(currentYear + 2).slice(2)}`,
  ];

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-8 py-5 flex items-center gap-4">
            <Link to="/school-classes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Class</h1>
              <p className="text-xs text-gray-400 mt-0.5">Set up a new class section for your school</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1 — Class Identity */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Class Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Class Name" required error={errors.name}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. 10, LKG, 12 Science"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border ${errors.name ? "border-red-400" : "border-gray-200"} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all`}
                  />
                </Field>

                <Field label="Section" error={errors.section}>
                  <input
                    name="section"
                    value={form.section}
                    onChange={handleChange}
                    placeholder="e.g. A, B, C"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  />
                </Field>

                <Field label="Academic Year" required error={errors.academic_year}>
                  <input
                    name="academic_year"
                    value={form.academic_year}
                    onChange={handleChange}
                    placeholder="e.g. 2025-26"
                    list="year-options"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border ${errors.academic_year ? "border-red-400" : "border-gray-200"} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all`}
                  />
                  <datalist id="year-options">
                    {yearOptions.map(y => <option key={y} value={y} />)}
                  </datalist>
                </Field>
              </div>
            </div>

            {/* Section 2 — Class Teacher */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Class Teacher</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Optional — can be assigned later</p>
                </div>
              </div>

              {teachers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs text-amber-700">All teachers are already assigned as class teachers, or no teachers have been added yet.</p>
                </div>
              ) : (
                <Field label="Assign Class Teacher">
                  <select
                    name="class_teacher_id"
                    value={form.class_teacher_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none transition-all"
                  >
                    <option value="">— Select a teacher (optional) —</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullname}{t.subject ? ` · ${t.subject}` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Teacher preview card */}
                  {form.class_teacher_id && (() => {
                    const t = teachers.find(t => t.id === parseInt(form.class_teacher_id));
                    if (!t) return null;
                    const initials = t.fullname.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        {t.profile_picture
                          ? <img src={t.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                        }
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.fullname}</p>
                          <p className="text-xs text-gray-400">{t.email}{t.subject ? ` · ${t.subject}` : ""}</p>
                        </div>
                      </div>
                    );
                  })()}
                </Field>
              )}
            </div>

            {/* Preview */}
            {form.name && (
              <div className="border-t border-gray-100 pt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Preview</p>
                <div className="bg-gray-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                  <p className="text-gray-400 text-xs mb-1">{form.academic_year || "—"}</p>
                  <p className="text-white text-4xl font-black">{form.name}</p>
                  {form.section && (
                    <span className="inline-block mt-2 px-3 py-1 bg-amber-400/20 text-amber-400 text-xs font-bold rounded-full">
                      Section {form.section}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/school-classes"
                className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all ${
                  saving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 shadow-sm"
                }`}>
                {saving
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>
                  : <><SaveIcon /> Create Class</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}