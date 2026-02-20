import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera, Mail, Phone, User, Calendar, Briefcase, Users, Check, X } from "lucide-react";
import api from "../../api/axios";
import ParentLayout from "./ParentLayout";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ParentProfile() {
  const user = useSelector((state) => state.auth.user);

  const [profile, setProfile]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [selectedFile, setSelectedFile]     = useState(null);
  const [toast, setToast]                   = useState(null);

  const fileInputRef = useRef();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("Profile/parent/profile/");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB.", "error");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("profile_picture", selectedFile);

    try {
      const res = await api.patch("Profile/parent/profile/update/", formData);
      setProfile((prev) => ({ ...prev, profile_picture: res.data.profile_picture }));
      setPreviewUrl(null);
      setSelectedFile(null);
      showToast("Profile picture updated!");
    } catch (err) {
      showToast("Failed to upload. Try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = (profile?.fullname || user?.fullname || "P")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const currentPicture = previewUrl || profile?.profile_picture || null;

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <svg className="animate-spin h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">View your account details and update your profile picture</p>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* LEFT — Avatar card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">

                {/* Avatar with camera overlay */}
                <div className="relative inline-block mb-5">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto">
                    {currentPicture ? (
                      <img
                        src={currentPicture}
                        alt="Profile"
                        className={`w-full h-full object-cover transition-opacity ${previewUrl ? "opacity-80" : "opacity-100"}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Camera button */}
                  {!previewUrl && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
                      title="Change photo"
                    >
                      <Camera size={15} className="text-white" />
                    </button>
                  )}

                  {/* Preview badge */}
                  {previewUrl && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PREVIEW
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {profile?.fullname || user?.fullname || "Parent"}
                </h2>
                <p className="text-sm text-gray-400 mb-1">{profile?.email || user?.email}</p>
                <span className="inline-flex px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full capitalize">
                  {profile?.relation || "Parent"}
                </span>

                {/* Upload / Cancel actions */}
                {previewUrl ? (
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <><Check size={15} /> Save Photo</>
                      )}
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:border-gray-400 hover:text-gray-700 transition-all"
                  >
                    <Camera size={15} />
                    Change Photo
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-3">JPG, PNG — Max 5MB</p>
              </div>

              {/* Linked children card */}
              {profile?.students?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-900">Linked Children</h3>
                  </div>
                  <div className="space-y-3">
                    {profile.students.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{s.fullname}</p>
                          <p className="text-xs text-gray-400 truncate">{s.admission_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Profile details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Personal Information</h3>
                </div>
                <div className="mt-2">
                  <InfoRow icon={User}     label="Full Name"  value={profile?.fullname} />
                  <InfoRow icon={Mail}     label="Email"      value={profile?.email} />
                  <InfoRow icon={Phone}    label="Phone"      value={profile?.phone} />
                  <InfoRow icon={User}     label="Gender"     value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
                  <InfoRow icon={Calendar} label="Date of Birth"
                    value={profile?.DOB ? new Date(profile.DOB).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                  />
                </div>
              </div>

              {/* Role info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Briefcase size={13} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Role & Occupation</h3>
                </div>
                <div className="mt-2">
                  <InfoRow icon={Users}     label="Relation to Student" value={profile?.relation ? profile.relation.charAt(0).toUpperCase() + profile.relation.slice(1) : null} />
                  <InfoRow icon={Briefcase} label="Occupation"          value={profile?.occupation} />
                </div>
              </div>

              {/* Account info */}
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Type</p>
                    <p className="text-sm font-semibold text-white capitalize">Parent</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Setup Status</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Children Linked</p>
                    <p className="text-sm font-semibold text-white">{profile?.students?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-white truncate">{profile?.email || "—"}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}