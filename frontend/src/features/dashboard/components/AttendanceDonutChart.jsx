import React, { useState } from 'react';
import { UserCheck, Clock, UserX, PieChart } from 'lucide-react';

export function AttendanceDonutChart({
  presentOnTime = 0,
  presentLate = 0,
  absent = 0,
  total = 0,
  rate = 0,
}) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const safeTotal = total > 0 ? total : 1;
  const onTimePct = ((presentOnTime / safeTotal) * 100);
  const latePct = ((presentLate / safeTotal) * 100);
  const absentPct = ((absent / safeTotal) * 100);

  // SVG Donut calculation: Circumference = 2 * PI * R
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const onTimeOffset = 0;
  const onTimeDash = (onTimePct / 100) * circumference;

  const lateOffset = onTimeDash;
  const lateDash = (latePct / 100) * circumference;

  const absentOffset = onTimeDash + lateDash;
  const absentDash = (absentPct / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attendance Breakdown
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-900 font-mono">
          {total} Total Staff
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-around py-2">
        {/* SVG Donut Graphic */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="11"
              stroke="currentColor"
              fill="transparent"
            />

            {/* On-Time Segment */}
            {onTimePct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-emerald-500 transition-all duration-500 cursor-pointer"
                strokeWidth={hoveredSegment === 'ontime' ? '13' : '11'}
                strokeDasharray={`${onTimeDash} ${circumference}`}
                strokeDashoffset={-onTimeOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                onMouseEnter={() => setHoveredSegment('ontime')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Late Segment */}
            {latePct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-amber-400 transition-all duration-500 cursor-pointer"
                strokeWidth={hoveredSegment === 'late' ? '13' : '11'}
                strokeDasharray={`${lateDash} ${circumference}`}
                strokeDashoffset={-lateOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                onMouseEnter={() => setHoveredSegment('late')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Absent Segment */}
            {absentPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-rose-400 transition-all duration-500 cursor-pointer"
                strokeWidth={hoveredSegment === 'absent' ? '13' : '11'}
                strokeDasharray={`${absentDash} ${circumference}`}
                strokeDashoffset={-absentOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                onMouseEnter={() => setHoveredSegment('absent')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {rate}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Attendance
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 w-full sm:w-auto text-xs">
          <div
            onMouseEnter={() => setHoveredSegment('ontime')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between gap-4 p-2 rounded-xl border transition-all cursor-pointer ${
              hoveredSegment === 'ontime'
                ? 'bg-emerald-50 border-emerald-200 shadow-2xs'
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800">On-Time Present</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{presentOnTime}</span>
          </div>

          <div
            onMouseEnter={() => setHoveredSegment('late')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between gap-4 p-2 rounded-xl border transition-all cursor-pointer ${
              hoveredSegment === 'late'
                ? 'bg-amber-50 border-amber-200 shadow-2xs'
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-semibold text-slate-800">Late Arrival</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{presentLate}</span>
          </div>

          <div
            onMouseEnter={() => setHoveredSegment('absent')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center justify-between gap-4 p-2 rounded-xl border transition-all cursor-pointer ${
              hoveredSegment === 'absent'
                ? 'bg-rose-50 border-rose-200 shadow-2xs'
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="font-semibold text-slate-800">Absent / Pending</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{absent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceDonutChart;
