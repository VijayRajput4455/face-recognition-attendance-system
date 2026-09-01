import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { cn, formatTime } from '../../../lib/utils';

export function ShiftDistributionChart({
  shifts = [],
  selectedShiftId,
  onSelectShift,
  onAddShift,
}) {
  const shiftData = shifts.map((shift) => ({
    id: shift.id,
    name: shift.shift_name,
    startTime: shift.start_time,
    endTime: shift.end_time,
    total: shift.total ?? 0,
    enrolled: shift.enrolled ?? 0,
    pending: shift.pending ?? 0,
    rate: Math.round(shift.completion_percentage ?? 0),
  }));

  const totalAllShifts = shiftData.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Shift Distribution</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time workforce allocation and facial recognition readiness per operational shift
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          Total: {totalAllShifts.toLocaleString()} Staff
        </span>
      </div>

      {shifts.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-300" />
          <p>No operational shifts created in the database yet.</p>
          <button
            type="button"
            onClick={onAddShift}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-xs hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Shift</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shiftData.map((shift) => {
            const isSelected = selectedShiftId === shift.id;

            return (
              <div
                key={shift.id}
                onClick={() => onSelectShift?.(isSelected ? 'ALL' : shift.id)}
                className={cn(
                  'p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3',
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80 text-indigo-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{shift.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-indigo-600">{shift.rate}%</span>
                </div>

                <div>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block">
                    {shift.total.toLocaleString()} Staff
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="text-emerald-700 font-semibold">{shift.enrolled} Enrolled</span>
                    <span className="text-amber-700 font-semibold">{shift.pending} Pending</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${shift.rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ShiftDistributionChart;
