import React from 'react';
import { Clock, Users, CheckCircle2, AlertCircle, ArrowUpRight, Sun, Moon, Sunrise } from 'lucide-react';
import { formatTime, cn } from '../../../lib/utils';

export function ShiftReadinessHeatmap({
  shifts = [],
  employees = [],
  enrollments = [],
  onNavigateShift,
}) {
  const shiftMetrics = shifts.map((shift) => {
    const shiftEmployees = employees.filter((e) => e.shift_id === shift.id);
    const total = shiftEmployees.length;
    const enrolled = shiftEmployees.filter((emp) =>
      enrollments.some((en) => en.employee_id === emp.id && en.status === 'COMPLETED')
    ).length;
    const readinessRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

    return {
      id: shift.id,
      name: shift.shift_name,
      startTime: shift.start_time,
      endTime: shift.end_time,
      graceMinutes: shift.grace_minutes || 0,
      total,
      enrolled,
      readinessRate,
    };
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Shift Allocation & Face Recognition Readiness</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational schedule coverage and face verification readiness
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateShift?.('shifts')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Manage Shifts</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {shiftMetrics.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No shifts configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shiftMetrics.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {s.name}
                    </h4>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 font-mono pl-9">
                    {formatTime(s.startTime)} - {formatTime(s.endTime)}
                  </div>
                </div>

                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full border shrink-0',
                    s.readinessRate >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : s.readinessRate >= 50
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  {s.readinessRate}% Ready
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Assigned Staff</span>
                  <span className="font-bold font-mono text-slate-900">{s.total} Staff</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Enrolled Faces</span>
                  <span className="font-bold font-mono text-emerald-600">{s.enrolled} Active</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Grace Window</span>
                  <span className="font-mono text-slate-500">{s.graceMinutes} mins</span>
                </div>

                {/* Progress */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.readinessRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShiftReadinessHeatmap;
