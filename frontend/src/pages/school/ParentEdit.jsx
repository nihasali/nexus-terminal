import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

// Icons
const ArrowLeftIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const UserIcon      = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon      = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon     = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>;
const CalendarIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BriefcaseIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
const SaveIcon      = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

// Field components at module level
const InputField = ({ icon: Icon, label, name, type = "text", required = false, placeholder, disabled = false, className = "", formData, errors, handleChange }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400" />
      </div>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`block w-full pl-10 pr-3 py-2.5 border ${
          errors[name] ? "border-red-400" : "border-gray-200"
        } ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"}
        rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
      />
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
  </div>
);

const SelectField = ({ icon: Icon, label, name, options, required = false, className = "", formData, errors, handleChange }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400" />
      </div>
      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${
          errors[name] ? "border-red-400" : "border-gray-200"
        } rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none transition-all`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
  </div>
);

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-bold">{number}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default function ParentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "", phone: "", gender: "",
    DOB: "", occupation: "", relation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState(null);

  useEffect(() => { fetchParent(); }, []);

  const fetchParent = async () => {
    try {
      const res = await api.get(`Profile/school-parents/details/${id}/`);
      const d   = res.data;
      setFormData({
        fullname:   d.fullname   || "",
        phone:      d.phone      || "",
        gender:     d.gender     || "",
        DOB:        d.DOB        || "",
        occupation: d.occupation || "",
        relation:   d.relation   || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (!formData.fullname.trim()) e.fullname = "Full name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await api.patch(`Profile/school-parents/details/${id}/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      showToast("Parent updated successfully!");
      setTimeout(() => navigate(`/school-parents/details/${id}`), 1400);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update parent.", "error");
      setSaving(false);
    }
  };

  const fieldProps = { formData, errors, handleChange };

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

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-8 py-5 flex items-center gap-4">
            <Link to={`/school-parents/details/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Parent</h1>
              <p className="text-xs text-gray-400 mt-0.5">Update parent account details</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Section 1 — Personal Info */}
            <div>
              <SectionHeader number="1" title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField icon={UserIcon}     label="Full Name"    name="fullname"   placeholder="Full name" required className="md:col-span-2" {...fieldProps} />
                <InputField icon={PhoneIcon}    label="Phone Number" name="phone"      placeholder="+91 9876543210" type="tel" {...fieldProps} />
                <SelectField icon={UserIcon}    label="Gender"       name="gender"
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]} {...fieldProps}
                />
                <InputField icon={CalendarIcon} label="Date of Birth" name="DOB" type="date" {...fieldProps} />
              </div>
            </div>

            {/* Section 2 — Role */}
            <div className="border-t border-gray-100 pt-10">
              <SectionHeader number="2" title="Role & Occupation" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField icon={UserIcon}      label="Relation"    name="relation"
                  options={[
                    { value: "", label: "Select Relation" },
                    { value: "father", label: "Father" },
                    { value: "mother", label: "Mother" },
                    { value: "guardian", label: "Guardian" },
                  ]} {...fieldProps}
                />
                <InputField icon={BriefcaseIcon}  label="Occupation"  name="occupation" placeholder="e.g. Engineer" {...fieldProps} />
              </div>
            </div>

            {/* Note about student links */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-xs text-amber-700">
                To add or remove linked students, go back to the{" "}
                <Link to={`/school-parents/details/${id}`} className="font-semibold underline">parent profile page</Link>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to={`/school-parents/details/${id}`}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  saving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 shadow-sm"
                }`}>
                {saving
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                  : <><SaveIcon size={16} /> Save Changes</>
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}