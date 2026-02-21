import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Camera, Mail, Phone, User, Calendar, Droplet,
  BookOpen, Users, MapPin, Check, X, FileText,
  Hash, Clock, Heart,
} from "lucide-react";
import api from "../../api/axios";
import StudentLayout from "./StudentLayout";

// ── Stat tile used in the hero strip ──
function StatTile({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 border-r border-white/10 last:border-0">
      <p className="text-2xl font-bold text-white tracking-tight">{value || "—"}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
      {accent && (
        <span className="mt-2 inline-block w-5 h-0.5 rounded-full bg-amber-400" />
      )}
    </div>
  );
}

// ── Section card wrapper ──
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-white" />
        </div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Individual info row inside a card ──
function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <Icon size={14} className={highlight ? "text-amber-400" : "text-gray-400"} />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400 font-medium flex-shrink-0">{label}</p>
        <p className="text-sm font-semibold text-gray-900 text-right truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const user = useSelector((state) => state.auth.user);

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast]               = useState(null);

  const fileInputRef = useRef();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("Profile/student/profile/");
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
    if (!file.type.startsWith("image/")) { showToast("Please select an image file.", "error"); return; }
    if (file.size > 5 * 1024 * 1024)    { showToast("Image must be under 5MB.", "error");      return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("profile_picture", selectedFile);
    try {
      const res = await api.patch("Profile/student/profile/update/", formData);
      setProfile((prev) => ({ ...prev, profile_picture: res.data.profile_picture }));
      setPreviewUrl(null);
      setSelectedFile(null);
      showToast("Profile picture updated!");
    } catch {
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

  const initials = (profile?.fullname || user?.fullname || "S")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const currentPicture = previewUrl || profile?.profile_picture || null;

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <Check size={15} /> : <X size={15} />}
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gray-50">

        {/* ── HERO HEADER — full width dark banner ── */}
        <div className="relative bg-gray-900 overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.03]" />
            <div className="absolute -bottom-32 -left-10 w-80 h-80 rounded-full bg-white/[0.02]" />
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-8 pt-10 pb-0">
            <div className="flex items-end gap-8">

              {/* Avatar */}
              <div className="relative flex-shrink-0 mb-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-2xl">
                  {currentPicture ? (
                    <img
                      src={currentPicture}
                      alt="Profile"
                      className={`w-full h-full object-cover ${previewUrl ? "opacity-70" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-4xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>

                {/* PREVIEW badge */}
                {previewUrl && (
                  <div className="absolute -top-2.5 -right-2.5 bg-amber-400 text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg tracking-wide">
                    PREVIEW
                  </div>
                )}

                {/* Camera button */}
                {!previewUrl && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                    title="Change photo"
                  >
                    <Camera size={15} className="text-gray-700" />
                  </button>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>

              {/* Name + meta */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {profile?.fullname || user?.fullname || "Student"}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Mail size={13} /> {profile?.email || "—"}
                  </span>
                  {profile?.admission_number && (
                    <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Hash size={13} /> {profile.admission_number}
                    </span>
                  )}
                  {profile?.class_name && (
                    <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <BookOpen size={13} /> Class {profile.class_name}{profile.section ? ` · ${profile.section}` : ""}
                    </span>
                  )}
                </div>

                {/* Upload actions inline in hero */}
                {previewUrl && (
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-5 py-2 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all shadow"
                    >
                      {uploading
                        ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading...</>
                        : <><Check size={14} /> Save Photo</>
                      }
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      className="flex items-center gap-2 px-5 py-2 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stat strip */}
            <div className="mt-6 grid grid-cols-4 bg-white/5 border-t border-white/10 rounded-t-none -mx-8">
              <StatTile label="Roll Number"    value={profile?.roll_number}    accent />
              <StatTile label="Blood Group"    value={profile?.blood_group}    />
              <StatTile label="Date of Joining"
                value={profile?.date_of_joining
                  ? new Date(profile.date_of_joining).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : null}
              />
              <StatTile label="Documents"      value={profile?.document?.length ?? 0} />
            </div>
          </div>
        </div>

        {/* ── BODY — 2-column balanced grid ── */}
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Col 1 */}
            <div className="space-y-6">

              {/* Personal */}
              <SectionCard icon={User} title="Personal Information">
                <InfoRow icon={User}     label="Full Name"      value={profile?.fullname} highlight />
                <InfoRow icon={Mail}     label="Email"          value={profile?.email} />
                <InfoRow icon={Phone}    label="Phone"          value={profile?.phone} />
                <InfoRow icon={User}     label="Gender"         value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
                <InfoRow icon={Calendar} label="Date of Birth"
                  value={profile?.DOB ? new Date(profile.DOB).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                />
              </SectionCard>

              {/* Guardian */}
              <SectionCard icon={Users} title="Guardian Information">
                <InfoRow icon={User}  label="Guardian Name"  value={profile?.guardian_name}  highlight />
                <InfoRow icon={Phone} label="Guardian Phone" value={profile?.guardian_phone} />
                {profile?.student_contact && (
                  <InfoRow icon={Phone} label="Student Contact" value={profile.student_contact} />
                )}
              </SectionCard>

              {/* Account dark card */}
              <div className="bg-gray-900 rounded-2xl p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Account Summary</p>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Account Type",  value: "Student" },
                    { label: "Status",        value: "Active",            accent: true },
                    { label: "Admission No",  value: profile?.admission_number },
                    { label: "Roll Number",   value: profile?.roll_number },
                  ].map(({ label, value, accent }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`text-sm font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-6">

              {/* Academic */}
              <SectionCard icon={BookOpen} title="Academic Details">
                <InfoRow icon={Hash}      label="Admission Number" value={profile?.admission_number} highlight />
                <InfoRow icon={Hash}      label="Roll Number"      value={profile?.roll_number} />
                <InfoRow icon={Calendar}  label="Date of Joining"
                  value={profile?.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                />
                <InfoRow icon={Droplet}   label="Blood Group"      value={profile?.blood_group} />
                {profile?.class_name && (
                  <InfoRow icon={BookOpen} label="Class & Section"
                    value={`${profile.class_name}${profile.section ? ` – Section ${profile.section}` : ""}`}
                  />
                )}
              </SectionCard>

              {/* Address */}
              {profile?.address && (
                <SectionCard icon={MapPin} title="Address">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={13} className="text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{profile.address}</p>
                  </div>
                </SectionCard>
              )}

              {/* Documents */}
              {profile?.document?.length > 0 ? (
                <SectionCard icon={FileText} title={`Documents (${profile.document.length})`}>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.document.map((doc) => {
                      const isPdf = typeof doc.file === "string" &&
                        (doc.file.toLowerCase().endsWith(".pdf") || doc.file.toLowerCase().includes("/raw/upload/"));
                      return (
                        <a
                          key={doc.id}
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all"
                        >
                          {isPdf ? (
                            <div className="w-full h-20 bg-red-50 flex flex-col items-center justify-center">
                              <FileText size={22} className="text-red-400 mb-1" />
                              <span className="text-[10px] font-bold text-red-400">PDF</span>
                            </div>
                          ) : (
                            <img src={doc.file} alt="document" className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
                          )}
                          <div className="px-2 py-1.5 bg-white">
                            <p className="text-[10px] text-gray-400 capitalize truncate">{doc.document_type || "Document"}</p>
                            <p className="text-[10px] text-gray-400 group-hover:text-gray-800 transition-colors">View →</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </SectionCard>
              ) : (
                <SectionCard icon={FileText} title="Documents">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No documents uploaded</p>
                    <p className="text-xs text-gray-300 mt-1">Your uploaded documents will appear here</p>
                  </div>
                </SectionCard>
              )}

              
            </div>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
}