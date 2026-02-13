import React, { useEffect, useState } from "react";
import { getTeacherProfile, updateTeacherProfile } from "../../api/authService";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import {
  User,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  Camera,
  Save,
  X,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Toast from '../../components/Toast';


function TeacherEditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    gender: "",
    DOB: "",
    qualification: "",
    years_of_experience: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getTeacherProfile();
      const data = res.data;

      setForm({
        phone: data.phone || "",
        gender: data.gender || "",
        DOB: data.DOB || "",
        qualification: data.qualification || "",
        years_of_experience: data.years_of_experience || "",
      });

      setImagePreview(data.profile_picture);
    } catch (err) {
      console.log(err);
      setToast({
        message: "Failed to load profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsSaving(true);

    const formData = new FormData();

    if (form.phone) formData.append("phone", form.phone);
    if (form.gender) formData.append("gender", form.gender);
    if (form.DOB) formData.append("DOB", form.DOB);
    if (form.qualification) formData.append("qualification", form.qualification);
    if (form.years_of_experience)
      formData.append("years_of_experience", form.years_of_experience);

    if (profilePicture) formData.append("profile_picture", profilePicture);

    try {
      await updateTeacherProfile(formData);
      setToast({
        message: "Profile updated successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/teacher/profile");
      }, 1500);
    } catch (error) {
      console.log(error.response?.data);
      setToast({
        message: error.response?.data?.error || "Error updating profile",
        type: "error",
      });
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "T";
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading profile...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/teacher/profile")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Edit Profile
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your personal information
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/teacher/profile")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto px-8 py-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Profile Picture
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-semibold text-3xl">
                        {getInitials("Teacher")}
                      </span>
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
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    Change profile picture
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePicture(null);
                        setImagePreview(null);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Personal Information
              </h3>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
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
            </div>

            {/* Professional Information */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Professional Details
              </h3>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g., M.Sc in Mathematics, B.Ed"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={form.years_of_experience}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 5"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
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

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/teacher/profile")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800 shadow-sm hover:shadow-md"
                }`}
              >
                {isSaving ? (
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
    </TeacherLayout>
  );
}

export default TeacherEditProfile;