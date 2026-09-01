import React from 'react';
import { Users, UserCheck, UserX, ScanFace, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DashboardKpiGrid({
  totalEmployees = 0,
  activeEmployees = 0,
  inactiveEmployees = 0,
  enrolledCount = 0,
  pendingCount = 0,
  loading = false,
  selectedStatus = '',
  selectedEnrollmentStatus = '',
  onSelectMetric,
}) {
  const activePct = totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : '0.0';
  const enrolledPct = totalEmployees > 0 ? ((enrolledCount / totalEmployees) * 100).toFixed(1) : '0.0';
  const pendingPct = totalEmployees > 0 ? ((pendingCount / totalEmployees) * 100).toFixed(1) : '0.0';
  const inactivePct = totalEmployees > 0 ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs animate-pulse min-h-[82px] flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const isTotalActive = !selectedStatus && !selectedEnrollmentStatus;
  const isActiveActive = selectedStatus === 'ACTIVE';
  const isInactiveActive = selectedStatus === 'INACTIVE';
  const isEnrolledActive = selectedEnrollmentStatus === 'ENROLLED';
  const isPendingActive = selectedEnrollmentStatus === 'PENDING';
  const isReadyActive = selectedEnrollmentStatus === 'ENROLLED' && isTotalActive;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Employees Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('total')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isTotalActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Total Employees
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {totalEmployees}
            </span>
            <span className="text-xs text-blue-600 font-medium truncate">Workforce</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <Users className="w-5 h-5" />
        </div>
      </button>

      {/* 2. Active Employees Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('active')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isActiveActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Active Staff
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {activeEmployees}
            </span>
            <span className="text-xs text-blue-600 font-medium truncate">{activePct}% Active</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100/70 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <UserCheck className="w-5 h-5" />
        </div>
      </button>

      {/* 3. Face Enrolled Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('enrolled')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isEnrolledActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Face Enrolled
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {enrolledCount}
            </span>
            <span className="text-xs text-blue-600 font-medium truncate">{enrolledPct}% Enrolled</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-100/70 border border-indigo-200/60 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <ScanFace className="w-5 h-5" />
        </div>
      </button>

      {/* 4. Pending Enrollment Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('pending')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isPendingActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Pending Action
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-600 font-medium truncate">{pendingPct}% Pending</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-100/70 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <Clock className="w-5 h-5" />
        </div>
      </button>

      {/* 5. Inactive Employees Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('inactive')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isInactiveActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Inactive Staff
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {inactiveEmployees}
            </span>
            <span className="text-xs text-rose-600 font-medium truncate">{inactiveEmployees} Inactive</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-100/70 border border-rose-200/60 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <UserX className="w-5 h-5" />
        </div>
      </button>

      {/* 6. Recognition Ready Toggle */}
      <button
        type="button"
        onClick={() => onSelectMetric?.('ready')}
        className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
          isReadyActive
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <div className="min-w-0 pr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Recognition Ready
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {enrolledCount}/{totalEmployees}
            </span>
            <span className="text-xs text-blue-600 font-medium truncate">{enrolledPct}% Ready</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sky-100/70 border border-sky-200/60 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
}

export default DashboardKpiGrid;
