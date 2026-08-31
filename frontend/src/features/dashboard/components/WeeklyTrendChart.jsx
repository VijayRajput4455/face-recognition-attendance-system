import React, { useState } from 'react';
import { Calendar, UserCheck, UserX, Clock } from 'lucide-react';

export function WeeklyTrendChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Fallback 7-day data if empty
  const defaultData = [
    { day: 'Mon', date: 'Day 1', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Tue', date: 'Day 2', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Wed', date: 'Day 3', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Thu', date: 'Day 4', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Fri', date: 'Day 5', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Sat', date: 'Day 6', present: 0, late: 0, absent: 0, rate: 0 },
    { day: 'Sun', date: 'Day 7', present: 0, late: 0, absent: 0, rate: 0 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const maxVal = Math.max(...chartData.map((d) => (d.present || 0) + (d.absent || 0)), 10);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            7-Day Attendance Trend
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Late
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-200" />
            Absent
          </span>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Tooltip */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div
            className="absolute top-0 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg pointer-events-none z-10 space-y-0.5 backdrop-blur-xs"
            style={{
              left: `${((hoveredIdx + 0.5) / chartData.length) * 100}%`,
            }}
          >
            <div className="text-[10px] text-slate-400 font-mono">
              {chartData[hoveredIdx].day} • {chartData[hoveredIdx].date}
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-emerald-400">{chartData[hoveredIdx].present} Present</span>
              <span>•</span>
              <span className="text-amber-400">{chartData[hoveredIdx].late} Late</span>
              <span>•</span>
              <span className="text-rose-400">{chartData[hoveredIdx].absent} Absent</span>
            </div>
            <div className="text-[10px] text-indigo-300 font-bold">
              {chartData[hoveredIdx].rate}% Compliance
            </div>
          </div>
        )}

        {/* Stacked Bars */}
        <div className="flex items-end justify-between gap-2 h-36 px-2 border-b border-slate-200">
          {chartData.map((item, idx) => {
            const total = (item.present || 0) + (item.absent || 0);
            const presentHeight = maxVal > 0 ? ((item.present - item.late) / maxVal) * 100 : 0;
            const lateHeight = maxVal > 0 ? (item.late / maxVal) * 100 : 0;
            const absentHeight = maxVal > 0 ? (item.absent / maxVal) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                <div
                  className={`w-full max-w-[32px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-200 ${
                    isHovered ? 'ring-2 ring-indigo-500/40 shadow-md' : ''
                  }`}
                  style={{ height: `${Math.max(((total || 1) / maxVal) * 100, 6)}%` }}
                >
                  {/* On-Time Present Bar */}
                  <div
                    style={{ height: `${Math.max(presentHeight, 0)}%` }}
                    className="bg-emerald-500 w-full transition-all"
                  />
                  {/* Late Bar */}
                  {item.late > 0 && (
                    <div
                      style={{ height: `${lateHeight}%` }}
                      className="bg-amber-400 w-full transition-all"
                    />
                  )}
                  {/* Absent Bar */}
                  {item.absent > 0 && (
                    <div
                      style={{ height: `${absentHeight}%` }}
                      className="bg-slate-200 w-full transition-all"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-2 px-2">
          {chartData.map((item, idx) => (
            <div
              key={idx}
              className={`text-center flex-1 transition-colors ${
                hoveredIdx === idx ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              <div>{item.day}</div>
              <div className="text-[9px] font-mono text-slate-400 font-normal">{item.rate}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyTrendChart;
