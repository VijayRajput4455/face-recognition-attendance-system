import React, { useState } from 'react';
import { Calendar, Filter, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export function Attendance() {
  const [activeTab, setActiveTab] = useState('All Records');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  const stats = [
    { label: 'Total Employees', value: '1,248', sub: '', color: 'text-slate-900 dark:text-white' },
    { label: 'Present', value: '856', sub: '(68.5%)', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Absent', value: '352', sub: '(28.2%)', color: 'text-rose-600 dark:text-rose-400' },
    { label: 'Late', value: '40', sub: '(3.2%)', color: 'text-amber-600 dark:text-amber-400' },
  ];

  const attendanceRecords = [
    { id: 'EMP001', name: 'Amit Sharma', dept: 'Engineering', checkIn: '09:12 AM', checkOut: '06:24 PM', status: 'Present', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'EMP045', name: 'Neha Verma', dept: 'HR', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'EMP128', name: 'Rohit Kumar', dept: 'Marketing', checkIn: '09:18 AM', checkOut: '06:30 PM', status: 'Present', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'EMP067', name: 'Priya Singh', dept: 'Finance', checkIn: '09:30 AM', checkOut: '06:05 PM', status: 'Late', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'EMP069', name: 'Vikram Patel', dept: 'Engineering', checkIn: '—', checkOut: '—', status: 'Absent', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'EMP110', name: 'Karan Mehta', dept: 'Sales', checkIn: '—', checkOut: '—', status: 'Absent', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
  ];

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesTab =
      activeTab === 'All Records' || rec.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      departmentFilter === 'All Departments' || rec.dept === departmentFilter;

    return matchesTab && matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Attendance
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage and view attendance records
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>May 18, 2024</span>
          </div>
          <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => (
          <div key={idx} className="visio-card p-4">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{st.label}</p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-sans ${st.color}`}>{st.value}</span>
              {st.sub && <span className="text-xs font-semibold text-slate-400">{st.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="visio-card p-6 space-y-5">
        {/* Filter Tabs Header */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 space-x-8 text-xs font-bold">
          {['All Records', 'Present', 'Absent', 'Late'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors relative ${
                activeTab === tab
                  ? 'text-[#635BFF] border-b-2 border-[#635BFF]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Controls Bar: Search + Dept Filter + Export */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All Departments">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">ID</th>
                <th className="pb-3 px-3">Department</th>
                <th className="pb-3 px-3">Check In</th>
                <th className="pb-3 px-3">Check Out</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rec.img}
                        alt={rec.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="font-bold text-slate-900 dark:text-white">{rec.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 font-semibold">{rec.id}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{rec.dept}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{rec.checkIn}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{rec.checkOut}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      rec.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : rec.status === 'Late'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <span>Showing 1 to 6 of 1,248 records</span>
          <div className="flex items-center space-x-1 font-semibold">
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-7 w-7 rounded-lg bg-[#635BFF] text-white flex items-center justify-center font-bold">
              1
            </button>
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50">
              2
            </button>
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50">
              3
            </button>
            <span>...</span>
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50">
              208
            </button>
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
