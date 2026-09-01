import React from 'react';
import { Target, ArrowRight, ShieldAlert, CheckCircle2, Clock, Sparkles } from 'lucide-react';
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
  const numCurrentPct = parseFloat(currentPct) || 0;
  const gap = Math.max(0, targetPct - numCurrentPct).toFixed(1);
  const isTargetMet = numCurrentPct >= targetPct;

  // Arc path: Left (25, 105) over the top to Right (175, 105)
  // Radius = 75, Arc length = PI * 75 = 235.62
  const arcLength = 235.62;
  const progressOffset = arcLength * (1 - Math.min(numCurrentPct, 100) / 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Face Recognition Completion Target</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Face recognition goal compliance and aging profile telemetry
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            Goal: {targetPct}%
          </span>
        </div>
      </div>

      {/* 2. Top-Arch Semi-Circular Radial Goal Gauge */}
      <div className="flex flex-col items-center justify-center my-auto relative py-2">
        <div className="relative w-[230px] h-[125px] flex items-center justify-center">
          <svg className="w-[230px] h-[140px]" viewBox="0 0 200 120">
            <defs>
              <linearGradient id="targetGaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Arch Track */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Target 95% Goal Tick Indicator */}
            <circle
              cx="168"
              cy="52"
              r="4"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-xs"
            />

            {/* Active Progress Colored Arch */}
            {numCurrentPct > 0 && (
              <path
                d="M 25 105 A 75 75 0 0 1 175 105"
                fill="none"
                stroke="url(#targetGaugeGrad)"
                strokeWidth="16"
                strokeDasharray={arcLength}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>

          {/* Central Percentage Value */}
          <div className="absolute top-7 inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {currentPct}%
            </span>
            <div className="flex items-center gap-1 mt-2">
              {isTargetMet ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Target Achieved
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {gap}% to Target
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Tick Labels */}
        <div className="w-full max-w-[210px] flex justify-between text-[10px] font-mono text-slate-400 font-semibold px-2">
          <span>0%</span>
          <span className="text-indigo-600 font-bold">Goal 95%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 3. Quick Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Enrolled
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-700 leading-tight">
                {enrolledCount.toLocaleString()}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
            {currentPct}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100/80 text-amber-600 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-amber-700 leading-tight">
                {pendingCount.toLocaleString()}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-amber-700 bg-white px-2 py-1 rounded-lg border border-amber-200/80 shadow-2xs">
            {totalEmployees > 0 ? ((pendingCount / totalEmployees) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* 4. Actionable Pending Triage Container */}
      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-900">Pending Triage Action</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Aging Queue
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              &gt; 7 Days Pending
            </span>
            <span className="text-base font-extrabold font-mono text-amber-600 mt-1">
              {pending7Days} Staff
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              &gt; 30 Days Pending
            </span>
            <span className="text-base font-extrabold font-mono text-rose-600 mt-1">
              {pending30Days} Staff
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm group"
        >
          <span>View Pending Employees</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-300 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}

export default EnrollmentCompletionTargetCard;
