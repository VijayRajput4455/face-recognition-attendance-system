import React from 'react';
import { Target, ArrowRight, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function EnrollmentCompletionTargetCard({
  enrolledCount = 0,
  pendingCount = 0,
  totalEmployees = 0,
  pending7Days = 0,
  pending30Days = 0,
  onViewPending,
}) {
  const currentPct = totalEmployees > 0 ? ((enrolledCount / totalEmployees) * 100).toFixed(1) : '0.0';
  const targetPct = 95.0;
  const gap = Math.max(0, targetPct - parseFloat(currentPct)).toFixed(1);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Enrollment Completion Target</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric goal compliance and aging profile telemetry
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
          Target: {targetPct}%
        </span>
      </div>

      {/* Progress & Gap Display */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {currentPct}%
          </span>
          <span className="text-xs font-bold font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
            {gap}% gap remaining
          </span>
        </div>

        {/* Multi-tier Milestone Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(parseFloat(currentPct), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0%</span>
            <span>Target: {targetPct}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
          <span className="text-emerald-700 font-semibold">{enrolledCount.toLocaleString()} Enrolled</span>
          <span className="text-amber-700 font-semibold">{pendingCount.toLocaleString()} Pending</span>
        </div>
      </div>

      {/* Actionable Pending Aging Breakdown */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold text-slate-900">Pending Enrollment Attention</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">&gt; 7 Days Pending</span>
            <span className="text-sm font-bold font-mono text-amber-600">{pending7Days} Staff</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">&gt; 30 Days Pending</span>
            <span className="text-sm font-bold font-mono text-rose-600">{pending30Days} Staff</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs group"
        >
          <span>View Pending Employees</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default EnrollmentCompletionTargetCard;
