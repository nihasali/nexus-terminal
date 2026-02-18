import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";
import {
  User, Phone, Calendar, IdCard, Users,
  MapPin, Droplet, Save, ArrowLeft, Upload,
  AlertCircle, CheckCircle2, Trash2, FileText,
} from "lucide-react";
import Toast from "../../components/Toast";

// ── Reusable field components (defined OUTSIDE to prevent cursor-disappearing bug) ──

const InputField = ({ icon: Icon, label, name, type = "text", required = false, placeholder, className = "", formData, errors, handleChange }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full pl-10 pr-3 py-2.5 border ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm`}
      />
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center">
        <AlertCircle size={12} className="mr-1" /> {errors[name]}
      </p>
    )}
  </div>
);

const SelectField = ({ icon: Icon, label, name, options, required = false, className = "", formData, errors, handleChange }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" size={18} />
      </div>
      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        className={`block w-full pl-10 pr-3 py-2.5 border ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white text-sm`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center">
        <AlertCircle size={12} className="mr-1" /> {errors[name]}
      </p>
    )}
  </div>
);

// ── Main Component ──

function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "", phone: "", gender: "", DOB: "",
    roll_number: "", date_of_joining: "", blood_group: "",
    guardian_name: "", guardian_phone: "", address: "", student_contact: "",
  });

  const [existingDocs, setExistingDocs] = useState([]);   // docs already on server
  const [docsToDelete, setDocsToDelete] = useState([]);   // ids marked for deletion
  const [newFiles, setNewFiles] = useState([]);            // new files to upload

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchStudent(); }, []);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`Profile/school-students/edit/${id}/`);
      const d = res.data;
      setFormData({
        fullname:        d.fullname        || "",
        phone:           d.phone           || "",
        gender:          d.gender          || "",
        DOB:             d.DOB             || "",
        roll_number:     d.roll_number     || "",
        date_of_joining: d.date_of_joining || "",
        blood_group:     d.blood_group     || "",
        guardian_name:   d.guardian_name   || "",
        guardian_phone:  d.guardian_phone  || "",
        address:         d.address         || "",
        student_contact: d.student_contact || "",
      });
      // documents come as array from serializer (related_name='document')
      setExistingDocs(d.document || []);
    } catch (error) {
      console.error(error);
      setToast({ message: "Failed to load student data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Toggle existing doc for deletion
  const toggleDeleteDoc = (docId) => {
    setDocsToDelete((prev) =>
      prev.includes(docId) ? prev.filter((i) => i !== docId) : [...prev, docId]
    );
  };

  // Add new files (merge, no duplicates)
  const handleNewFiles = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => {
      const merged = [...prev];
      selected.forEach((f) => {
        if (!merged.some((x) => x.name === f.name && x.size === f.size)) {
          merged.push(f);
        }
      });
      return merged;
    });
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.guardian_name.trim()) newErrors.guardian_name = "Guardian name is required";
    if (!formData.guardian_phone) newErrors.guardian_phone = "Guardian phone is required";
    if (!formData.roll_number.trim()) newErrors.roll_number = "Roll number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ message: "Please fix the errors above", type: "error" });
      return;
    }

    setSaving(true);
    const data = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    // Append IDs of docs to delete
    docsToDelete.forEach((docId) => data.append("delete_documents", docId));

    // Append new files
    newFiles.forEach((file) => data.append("documents", file));

    try {
      await api.patch(`Profile/school-students/edit/${id}/`, data);
      setToast({ message: "Student updated successfully!", type: "success" });
      setTimeout(() => navigate(`/school-student-details/${id}`), 1500);
    } catch (error) {
      console.error(error);
      setToast({
        message: error.response?.data?.error || "Error updating student",
        type: "error",
      });
      setSaving(false);
    }
  };

  const fieldProps = { formData, errors, handleChange };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading student data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center space-x-4">
              <Link
                to={`/school-student-details/${id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Student</h1>
                <p className="text-sm text-gray-500 mt-1">Update student information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1 — Basic Information */}
            <div className="space-y-6">
              <SectionHeader number="1" title="Basic Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField icon={User}     label="Full Name"    name="fullname"  placeholder="John Doe"           required className="md:col-span-2" {...fieldProps} />
                <InputField icon={Phone}    label="Phone Number" name="phone"     placeholder="+91 1234567890" type="tel"             {...fieldProps} />
                <SelectField icon={User}   label="Gender"       name="gender"    required
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  {...fieldProps}
                />
                <InputField icon={Calendar} label="Date of Birth" name="DOB" type="date" {...fieldProps} />
              </div>
            </div>

            {/* Section 2 — Academic Details */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <SectionHeader number="2" title="Academic Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField icon={IdCard}   label="Roll Number"     name="roll_number"     placeholder="e.g. 2024001" required {...fieldProps} />
                <InputField icon={Calendar} label="Date of Joining" name="date_of_joining" type="date"                         {...fieldProps} />
                <InputField icon={Droplet}  label="Blood Group"     name="blood_group"     placeholder="e.g. O+"               {...fieldProps} />
              </div>
            </div>

            {/* Section 3 — Guardian Information */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <SectionHeader number="3" title="Guardian Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField icon={Users} label="Guardian Name"  name="guardian_name"  placeholder="Parent/Guardian Full Name" required {...fieldProps} />
                <InputField icon={Phone} label="Guardian Phone" name="guardian_phone" placeholder="+91 9876543210" type="tel"  required {...fieldProps} />
                <InputField icon={Phone} label="Student Contact" name="student_contact" placeholder="+91 9876543210" type="tel"        {...fieldProps} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="text-gray-400" size={18} />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full residential address"
                      rows="3"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 — Documents */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <SectionHeader number="4" title="Documents" />
              <div className="pl-10 space-y-4">

                {/* Existing documents */}
                {existingDocs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingDocs.map((doc) => {
                        const isPdf = typeof doc.file === "string" &&
                          (doc.file.toLowerCase().endsWith(".pdf") || doc.file.toLowerCase().includes("/raw/upload/"));
                        const markedForDelete = docsToDelete.includes(doc.id);

                        return (
                          <div
                            key={doc.id}
                            className={`relative border rounded-lg overflow-hidden transition-all ${
                              markedForDelete
                                ? "border-red-400 opacity-50"
                                : "border-gray-200"
                            }`}
                          >
                            {isPdf ? (
                              <div className="w-full h-24 flex flex-col items-center justify-center bg-red-50">
                                <FileText className="text-red-400 mb-1" size={28} />
                                <span className="text-xs font-semibold text-red-400">PDF</span>
                              </div>
                            ) : (
                              <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                <img src={doc.file} alt="document" className="w-full h-24 object-cover" />
                              </a>
                            )}
                            <div className="p-2 flex items-center justify-between">
                              <p className="text-xs text-gray-500 truncate capitalize">{doc.document_type || "Document"}</p>
                              <button
                                type="button"
                                onClick={() => toggleDeleteDoc(doc.id)}
                                className={`ml-1 p-1 rounded transition-colors ${
                                  markedForDelete
                                    ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                }`}
                                title={markedForDelete ? "Undo delete" : "Mark for deletion"}
                              >
                                {markedForDelete
                                  ? <CheckCircle2 size={14} />
                                  : <Trash2 size={14} />
                                }
                              </button>
                            </div>
                            {markedForDelete && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">WILL DELETE</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {docsToDelete.length > 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        {docsToDelete.length} document(s) will be deleted on save.
                      </p>
                    )}
                  </div>
                )}

                {/* Upload new documents */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Add New Documents</p>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center">
                      <Upload className="text-gray-400 mx-auto mb-2" size={24} />
                      <p className="text-sm font-medium text-gray-700">Click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                      <input type="file" name="new_documents" multiple onChange={handleNewFiles} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                  </label>

                  {newFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {newFiles.map((file, idx) => {
                        const isPdf = file.type === "application/pdf";
                        const preview = !isPdf ? URL.createObjectURL(file) : null;
                        return (
                          <div key={idx} className="relative group border border-green-200 rounded-lg overflow-hidden bg-green-50">
                            {isPdf ? (
                              <div className="w-full h-24 flex flex-col items-center justify-center">
                                <FileText className="text-green-500 mb-1" size={28} />
                                <span className="text-xs font-semibold text-green-600">PDF</span>
                              </div>
                            ) : (
                              <img src={preview} alt={file.name} className="w-full h-24 object-cover" />
                            )}
                            <div className="p-2">
                              <p className="text-xs text-gray-600 truncate">{file.name}</p>
                              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewFile(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M9 3L3 9M3 3l6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                            <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">NEW</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <Link
                to={`/school-student-details/${id}`}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  saving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 shadow-sm"
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

// Small helper component for section headers
function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-semibold">{number}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default StudentEdit;