import React, { useState } from 'react';
import { ScanFace, Video, ShieldCheck, CheckCircle2, AlertCircle, Clock, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { formatTime, formatDateTime, getInitials, getAvatarColor, cn } from '../../../lib/utils';
import StatusBadge from '../../../components/ui/StatusBadge';

export function LiveBiometricTelemetry({
  enrollments = [],
  employees = [],
  onNavigateProfile,
  onNavigateEnrollment,
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const employeeMap = new Map();
  employees.forEach((e) => employeeMap.set(e.id, e));

  const filteredEnrollments = enrollments.filter((e) => {
    if (filterStatus === 'ALL') return true;
    return e.status === filterStatus;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Live Face Recognition Pipeline Feed</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time video vectorization jobs, neural embeddings status, and failure logs
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          {['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px]',
                filterStatus === status
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <Video className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No face enrollment records matching filter.
        </div>
      ) : (

        <div className="divide-y divide-slate-100">
          {filteredEnrollments.slice(0, 8).map((enr) => {
            const emp = employeeMap.get(enr.employee_id);
            const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Enrolled Employee';
            const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
            const avatarColor = getAvatarColor(empName);

            return (
              <div
                key={enr.id}
                onClick={() => {
                  if (emp) {
                    onNavigateProfile?.(emp.id, empName);
                  }
                }}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2.5 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${avatarColor}`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors truncate">
                      {empName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      <span>{emp?.employee_code || enr.employee_id.substring(0, 8)}</span>
                      <span>•</span>
                      <span className="truncate max-w-xs">{enr.video_path}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={enr.status} type="enrollment" />
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LiveBiometricTelemetry;
