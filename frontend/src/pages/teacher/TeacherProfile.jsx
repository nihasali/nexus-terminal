import React, { useEffect, useState } from "react";
import { getTeacherProfile } from "../../api/authService";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import TeacherLayout from "./TeacherLayout";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  DollarSign,
  IdCard,
  Edit,
  Camera,
  MapPin,
  Briefcase,
  Shield,
} from "lucide-react";
import Toast from '../../components/Toast';

function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getTeacherProfile();
      setTeacher(res.data);
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

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  if (!teacher) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <p className="text-gray-500">No profile data found</p>
        </div>
      </TeacherLayout>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="text-gray-600" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-sm text-gray-900 font-medium">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
        </div>
      </div>
    </div>
  );

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
        {/* Clean Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your personal information
                </p>
              </div>
              <button
                onClick={() => navigate('/teacher/edit-profile')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Profile Header Section */}
          <div className="mb-12">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {teacher.profile_picture ? (
                  <img
                    src={teacher.profile_picture}
                    alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-semibold text-3xl">
                      {getInitials(teacher.fullname)}
                    </span>
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center shadow-sm transition-colors">
                  <Camera className="text-gray-600" size={16} />
                </button>
              </div>

              {/* Name and Role */}
              <div className="flex-1 pt-2">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                  {teacher.fullname}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <Mail size={14} />
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <IdCard size={14} />
                    <span>ID: {teacher.employee_id}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Active
                  </span>
                  {teacher.years_of_experience && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {teacher.years_of_experience} years experience
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Personal Information
                </h3>
              </div>
              <div className="px-6 divide-y divide-gray-100">
                <InfoRow
                  icon={Phone}
                  label="Phone Number"
                  value={teacher.phone}
                />
                <InfoRow
                  icon={User}
                  label="Gender"
                  value={teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : null}
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    teacher.DOB
                      ? `${new Date(teacher.DOB).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })} ${calculateAge(teacher.DOB) ? `(${calculateAge(teacher.DOB)} years old)` : ""}`
                      : null
                  }
                />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={teacher.address || null}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Professional Details
                </h3>
              </div>
              <div className="px-6 divide-y divide-gray-100">
                <InfoRow
                  icon={IdCard}
                  label="Employee ID"
                  value={teacher.employee_id}
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Qualification"
                  value={teacher.qualification}
                />
                <InfoRow
                  icon={Award}
                  label="Years of Experience"
                  value={teacher.years_of_experience ? `${teacher.years_of_experience} years` : null}
                />
                <InfoRow
                  icon={DollarSign}
                  label="Salary"
                  value={teacher.salary ? `₹${teacher.salary.toLocaleString('en-IN')} / month` : null}
                />
              </div>
            </div>
          </div>

          {/* Additional Information (if needed) */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Account Security
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your account is protected and all information is kept confidential.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default TeacherProfile;