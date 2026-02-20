import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

const SearchIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlusIcon   = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EyeIcon    = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const UsersIcon  = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;

export default function ParentList() {
  const [parents, setParents]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterRelation, setFilterRelation] = useState("");

  useEffect(() => { fetchParents(); }, []);

  useEffect(() => {
    let data = [...parents];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.fullname?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.students?.some((s) => s.admission_number?.toLowerCase().includes(q) || s.fullname?.toLowerCase().includes(q))
      );
    }
    if (filterRelation) data = data.filter((p) => p.relation === filterRelation);
    setFiltered(data);
  }, [search, filterRelation, parents]);

  const fetchParents = async () => {
    try {
      const res = await api.get("Profile/school-parents/list/");
      setParents(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const RELATION_COLORS = {
    father:   { bg: "#eff6ff", text: "#2563eb" },
    mother:   { bg: "#fdf2f8", text: "#9d174d" },
    guardian: { bg: "#f0fdf4", text: "#166534" },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
              <p className="text-sm text-gray-400 mt-1">{parents.length} registered parents</p>
            </div>
            <Link
              to="/school-parents/create/"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 shadow-sm transition-all"
            >
              <PlusIcon size={16} /> Add Parent
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone or student..."
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
            </div>
            <select
              value={filterRelation}
              onChange={(e) => setFilterRelation(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            >
              <option value="">All Relations</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <svg className="animate-spin h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No parents found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search || filterRelation ? "Try adjusting your filters" : "Add your first parent to get started"}
              </p>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Relation</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Linked Students</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Occupation</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((parent) => {
                    const rc = RELATION_COLORS[parent.relation] || { bg: "#f9fafb", text: "#6b7280" };
                    const initials = parent.fullname?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                        {/* Name + avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {parent.profile_picture ? (
                              <img src={parent.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{parent.fullname}</p>
                              <p className="text-xs text-gray-400">{parent.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{parent.phone || "—"}</p>
                        </td>
                        {/* Relation badge */}
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                            style={{ background: rc.bg, color: rc.text }}>
                            {parent.relation || "—"}
                          </span>
                        </td>
                        {/* Linked students */}
                        <td className="px-6 py-4">
                          {parent.students?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {parent.students.slice(0, 2).map((s) => (
                                <span key={s.id} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                  {s.fullname}
                                </span>
                              ))}
                              {parent.students.length > 2 && (
                                <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-md">
                                  +{parent.students.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No students linked</span>
                          )}
                        </td>
                        {/* Occupation */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{parent.occupation || "—"}</p>
                        </td>
                        {/* View button */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/school-parents/details/${parent.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                          >
                            <EyeIcon size={13} /> View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}