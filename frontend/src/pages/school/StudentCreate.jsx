import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import {
  User,
  Mail,
  Phone,
  Calendar,
  IdCard,
  Users,
  MapPin,
  Droplet,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Toast from "../../components/Toast";

// ✅ FIX 2: Moved OUTSIDE component to prevent remount on every render (cursor disappearing bug)
const InputField = ({
  icon: Icon,
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  className = "",
  formData,
  errors,
  handleChange,
}) => (
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
        value={formData[name]}
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
        <AlertCircle size={12} className="mr-1" />
        {errors[name]}
      </p>
    )}
  </div>
);

// ✅ FIX 2: Moved OUTSIDE component
const SelectField = ({
  icon: Icon,
  label,
  name,
  options,
  required = false,
  className = "",
  formData,
  errors,
  handleChange,
}) => (
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
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className={`block w-full pl-10 pr-3 py-2.5 border ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white text-sm`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center">
        <AlertCircle size={12} className="mr-1" />
        {errors[name]}
      </p>
    )}
  </div>
);

function CreateStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    gender: "",
    DOB: "",
    roll_number: "",
    date_of_joining: "",
    blood_group: "",
    guardian_name: "",
    guardian_phone: "",
    address: "",
    student_contact: "",
    documents: null,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documents") {
      const newFiles = Array.from(files);
      const existingFiles = formData.documents ? Array.from(formData.documents) : [];
      const merged = [...existingFiles];
      newFiles.forEach((newFile) => {
        const isDuplicate = merged.some(
          (f) => f.name === newFile.name && f.size === newFile.size
        );
        if (!isDuplicate) merged.push(newFile);
      });

      const dt = new DataTransfer();
      merged.forEach((f) => dt.items.add(f));
      setFormData({ ...formData, documents: dt.files });

      const previews = merged.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }));
      setUploadedFiles(previews);
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const removeFile = (indexToRemove) => {
    const existing = formData.documents ? Array.from(formData.documents) : [];
    const updated = existing.filter((_, i) => i !== indexToRemove);

    const dt = new DataTransfer();
    updated.forEach((f) => dt.items.add(f));
    setFormData({ ...formData, documents: dt.files });

    setUploadedFiles((prev) => {
      const newList = prev.filter((_, i) => i !== indexToRemove);
      // Revoke old object URL to avoid memory leaks
      if (prev[indexToRemove]?.preview) {
        URL.revokeObjectURL(prev[indexToRemove].preview);
      }
      return newList;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.DOB) newErrors.DOB = "Date of birth is required";
    if (!formData.roll_number.trim()) newErrors.roll_number = "Roll number is required";
    if (!formData.date_of_joining) newErrors.date_of_joining = "Date of joining is required";
    if (!formData.guardian_name.trim()) newErrors.guardian_name = "Guardian name is required";
    if (!formData.guardian_phone) newErrors.guardian_phone = "Guardian phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        message: "Please fill all required fields correctly",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const data = new FormData();

    // ✅ FIX 1: Skip 'documents' key here to avoid double-appending
    Object.keys(formData).forEach((key) => {
      if (key === "documents") return;
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    // Append document files individually
    if (formData.documents && formData.documents.length > 0) {
      for (let i = 0; i < formData.documents.length; i++) {
        data.append("documents", formData.documents[i]);
      }
    }

    try {
      const res = await api.post("Profile/school-students/create/", data);

      setToast({
        message: `Student created successfully! Admission No: ${res.data.admission_number}`,
        type: "success",
      });

      setTimeout(() => {
        navigate("/school-students/list/");
      }, 2000);
    } catch (error) {
      console.error(error);
      setToast({
        message: error.response?.data?.error || "Error creating student",
        type: "error",
      });
      setLoading(false);
    }
  };

  // Shared props passed to InputField and SelectField
  const fieldProps = { formData, errors, handleChange };

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/school-students/list/")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Create New Student
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Add a new student to the system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-8 py-12">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">1</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField
                  icon={User}
                  label="Full Name"
                  name="fullname"
                  placeholder="John Doe"
                  required
                  className="md:col-span-2"
                  {...fieldProps}
                />
                <InputField
                  icon={Mail}
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  {...fieldProps}
                />
                <InputField
                  icon={Phone}
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+91 1234567890"
                  {...fieldProps}
                />
                <SelectField
                  icon={User}
                  label="Gender"
                  name="gender"
                  required
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  {...fieldProps}
                />
                <InputField
                  icon={Calendar}
                  label="Date of Birth"
                  name="DOB"
                  type="date"
                  required
                  {...fieldProps}
                />
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">2</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Academic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField
                  icon={IdCard}
                  label="Roll Number"
                  name="roll_number"
                  placeholder="e.g., 2024001"
                  required
                  {...fieldProps}
                />
                <InputField
                  icon={Calendar}
                  label="Date of Joining"
                  name="date_of_joining"
                  type="date"
                  required
                  {...fieldProps}
                />
                <InputField
                  icon={Droplet}
                  label="Blood Group"
                  name="blood_group"
                  placeholder="e.g., O+"
                  {...fieldProps}
                />
                <InputField
                  icon={Phone}
                  label="Student Contact"
                  name="student_contact"
                  type="tel"
                  placeholder="+91 9876543210"
                  {...fieldProps}
                />
              </div>
            </div>

            {/* Section 3: Guardian Information */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">3</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Guardian Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                <InputField
                  icon={Users}
                  label="Guardian Name"
                  name="guardian_name"
                  placeholder="Parent/Guardian Full Name"
                  required
                  {...fieldProps}
                />
                <InputField
                  icon={Phone}
                  label="Guardian Phone"
                  name="guardian_phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  required
                  {...fieldProps}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
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

            {/* Section 4: Documents */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">4</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Documents
                </h3>
              </div>

              <div className="pl-10">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documents (Optional)
                </label>

                {/* Drop zone */}
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <Upload className="text-gray-500" size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload{" "}
                      <span className="text-gray-500 font-normal">or drag and drop</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, JPG, PNG up to 5MB each — multiple files allowed
                    </p>
                    <input
                      type="file"
                      name="documents"
                      multiple
                      onChange={handleChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </label>

                {/* File preview grid */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                      >
                        {/* Image preview */}
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          /* PDF placeholder */
                          <div className="w-full h-24 flex flex-col items-center justify-center bg-red-50">
                            <svg
                              className="text-red-400 mb-1"
                              width="28"
                              height="28"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            <span className="text-xs text-red-400 font-medium">PDF</span>
                          </div>
                        )}

                        {/* File info */}
                        <div className="p-2">
                          <p className="text-xs text-gray-700 font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        {/* Remove button — appears on hover */}
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                          title="Remove file"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M9 3L3 9M3 3l6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Add more tile */}
                    <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg h-full min-h-[7rem] flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">Add more</span>
                      <input
                        type="file"
                        name="documents"
                        multiple
                        onChange={handleChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/school-students/list/")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800 shadow-sm hover:shadow-md"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Create Student</span>
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

export default CreateStudent;