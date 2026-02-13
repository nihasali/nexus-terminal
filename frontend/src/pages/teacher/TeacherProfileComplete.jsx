import React, { useState } from "react";
import { completeTeacherProfile } from "../../api/authService";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUserThunk } from "../../redux/authSlice";
import TeacherLayout from "./TeacherLayout";
import {
  User,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Toast from '../../components/Toast';

function TeacherProfileComplete() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    phone: "",
    gender: "",
    DOB: "",
    qualification: "",
    years_of_experience: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          message: "Image size should be less than 5MB",
          type: "error",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setToast({
          message: "Please upload an image file",
          type: "error",
        });
        return;
      }

      setProfilePicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.phone || form.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }

    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!form.DOB) {
      newErrors.DOB = "Date of birth is required";
    }

    if (!form.qualification || form.qualification.trim() === "") {
      newErrors.qualification = "Qualification is required";
    }

    if (!form.years_of_experience || form.years_of_experience < 0) {
      newErrors.years_of_experience = "Valid experience is required";
    }

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

    setIsLoading(true);

    const formData = new FormData();

    if (form.phone) formData.append("phone", form.phone);
    if (form.gender) formData.append("gender", form.gender);
    if (form.DOB) formData.append("DOB", form.DOB);
    if (form.qualification) formData.append("qualification", form.qualification);
    if (form.years_of_experience)
      formData.append("years_of_experience", form.years_of_experience);
    if (profilePicture) formData.append("profile_picture", profilePicture);

    try {
      await completeTeacherProfile(formData);

      setToast({
        message: "Profile completed successfully!",
        type: "success",
      });

      await dispatch(loadUserThunk()).unwrap();

      setTimeout(() => {
        navigate("/teacher/dashboard");
      }, 1500);
    } catch (error) {
      console.log("Profile completion error:", error);
      setToast({
        message: error.response?.data?.error || "Failed to complete profile",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <TeacherLayout>
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
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Complete Your Profile
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide your details to get started
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-8 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={16} />
                </div>
                <span className="text-sm font-medium text-gray-900">Account Created</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-900"></div>
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">2</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Profile Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-200"></div>
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-semibold">3</span>
                </div>
                <span className="text-sm text-gray-500">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto px-8 py-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                      <User className="text-gray-400" size={32} />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                    <Camera className="text-white" size={16} />
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Upload a professional photo
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 1234567890"
                    value={form.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Gender and DOB Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-gray-400" size={18} />
                    </div>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none bg-white text-sm`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="date"
                      name="DOB"
                      value={form.DOB}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.DOB ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm`}
                    />
                  </div>
                  {errors.DOB && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.DOB}
                    </p>
                  )}
                </div>
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="e.g., M.Sc in Mathematics, B.Ed"
                    value={form.qualification}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.qualification ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm`}
                  />
                </div>
                {errors.qualification && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.qualification}
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="number"
                    name="years_of_experience"
                    placeholder="e.g., 5"
                    value={form.years_of_experience}
                    onChange={handleChange}
                    min="0"
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.years_of_experience
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm`}
                  />
                </div>
                {errors.years_of_experience && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.years_of_experience}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800 shadow-sm hover:shadow-md"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Complete Profile</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                All fields marked with <span className="text-red-500">*</span> are required
              </p>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default TeacherProfileComplete;