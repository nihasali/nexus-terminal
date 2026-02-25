import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "./Layout";

const PlusIcon   = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EyeIcon    = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const UsersIcon  = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;

const SECTION_COLORS = ["bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-indigo-100 text-indigo-700"];

export default function ClassList() {
  const [classes, setClasses]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    let data = [...classes];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.section?.toLowerCase().includes(q) ||
        c.class_teacher?.fullname?.toLowerCase().includes(q)
      );
    }
    if (yearFilter) data = data.filter(c => c.academic_year === yearFilter);
    setFiltered(data);
  }, [search, yearFilter, classes]);

  const fetchClasses = async () => {
    try {
      const res = await api.get("Class/school-classes/");
      setClasses(res.data);
      setFiltered(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const years = [...new Set(classes.map(c => c.academic_year))].sort().reverse();

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
              <p className="text-sm text-gray-400 mt-1">{classes.length} class{classes.length !== 1 ? "es" : ""} configured</p>
            </div>
            <Link to="/school-classes/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 shadow-sm transition-all">
              <PlusIcon /> Create Class
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by class name, section or teacher..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
            </div>
            {years.length > 1 && (
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">No classes found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search || yearFilter ? "Try adjusting your filters" : "Create your first class to get started"}
              </p>
              {!search && !yearFilter && (
                <Link to="/school-classes/create"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all">
                  <PlusIcon /> Create Class
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((cls, i) => {
                const sectionColor = SECTION_COLORS[i % SECTION_COLORS.length];
                const initials = cls.class_teacher?.fullname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={cls.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                    {/* Card top — dark */}
                    <div className="bg-gray-900 px-5 pt-5 pb-8 relative overflow-hidden">
                      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-xs font-medium mb-1">{cls.academic_year}</p>
                          <h3 className="text-white text-3xl font-black leading-none">
                            {cls.name}
                          </h3>
                          {cls.section && (
                            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${sectionColor}`}>
                              Section {cls.section}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{cls.student_count}</p>
                          <p className="text-gray-500 text-xs">students</p>
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4">
                      {cls.class_teacher ? (
                        <div className="flex items-center gap-3">
                          {cls.class_teacher.profile_picture ? (
                            <img src={cls.class_teacher.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Class Teacher</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{cls.class_teacher.fullname}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <p className="text-xs font-semibold">No class teacher assigned</p>
                        </div>
                      )}
                    </div>

                    {/* View button */}
                    <div className="px-5 pb-5">
                      <Link to={`/school-classes/${cls.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                        <EyeIcon /> View Class
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}