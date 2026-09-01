import React from 'react';
import { Filter, RotateCcw, Building2, Clock, Briefcase, UserCheck, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DashboardGlobalFilters({
  departments = [],
  shifts = [],
  designations = [],
  filters,
  setFilters,
  onReset,
}) {
  const hasActiveFilters =
    filters.departmentId !== 'ALL' ||
    filters.shiftId !== 'ALL' ||
    filters.designationId !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.enrollmentStatus !== 'ALL';

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 text-xs flex-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] pl-1 pr-2">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Filters</span>
        </div>

        {/* Department Filter */}
        <select
          value={filters.departmentId}
          onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>

        {/* Shift Filter */}
        <select
          value={filters.shiftId}
          onChange={(e) => setFilters({ ...filters, shiftId: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Shifts</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shift_name}
            </option>
          ))}
        </select>

        {/* Designation Filter */}
        <select
          value={filters.designationId}
          onChange={(e) => setFilters({ ...filters, designationId: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Designations</option>
          {designations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.designation_name}
            </option>
          ))}
        </select>

        {/* Employment Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">Status: All</option>
          <option value="ACTIVE">Active Staff</option>
          <option value="INACTIVE">Inactive Staff</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>

        {/* Face Enrollment Status Filter */}
        <select
          value={filters.enrollmentStatus}
          onChange={(e) => setFilters({ ...filters, enrollmentStatus: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">Enrollment: All</option>
          <option value="ENROLLED">Face Enrolled</option>
          <option value="PENDING">Pending Enrollment</option>
          <option value="FAILED">Enrollment Failed</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}

export default DashboardGlobalFilters;
