import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
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
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] pr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filters</span>
          </div>

          {/* Department Filter */}
          <select
            value={filters.departmentId}
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
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
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
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
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
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
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="INACTIVE">Inactive Staff</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* Face Enrollment Status Filter */}
          <select
            value={filters.enrollmentStatus}
            onChange={(e) => setFilters({ ...filters, enrollmentStatus: e.target.value })}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Enrollment: All</option>
            <option value="ENROLLED">Face Enrolled</option>
            <option value="PENDING">Pending Enrollment</option>
            <option value="FAILED">Enrollment Failed</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardGlobalFilters;
