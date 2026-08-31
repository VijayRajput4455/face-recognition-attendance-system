import React, { useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

export function HourlyFlowChart({ data = [], peakHour = '' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fallback default hours if empty
  const defaultHours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const chartData = data.length > 0 ? data : defaultHours.map((h) => ({ hour: h, count: 0 }));
  const maxCount = Math.max(...chartData.map((d) => d.count), 5);

  const chartHeight = 140;
  const barWidth = 18;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Check-In Arrival Velocity
          </span>
        </div>
        {peakHour && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            Peak: {peakHour}
          </span>
        )}
      </div>

      <div className="relative pt-6 pb-2">
        {/* Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute top-0 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none z-10 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            style={{
              left: `${((hoveredIndex + 0.5) / chartData.length) * 100}%`,
            }}
          >
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{chartData[hoveredIndex].hour}:</span>
            <span className="font-bold text-emerald-400">
              {chartData[hoveredIndex].count} {chartData[hoveredIndex].count === 1 ? 'Check-in' : 'Check-ins'}
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 px-1 border-b border-slate-200">
          {chartData.map((item, idx) => {
            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isHovered = hoveredIndex === idx;
            const isPeak = item.hour === peakHour;

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                {/* Bar */}
                <div className="w-full flex justify-center items-end h-full">
                  <div
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                      isHovered
                        ? 'bg-indigo-600 shadow-md shadow-indigo-500/30'
                        : isPeak
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 ring-2 ring-indigo-400/40'
                        : item.count > 0
                        ? 'bg-gradient-to-t from-indigo-500 to-blue-400'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
          {chartData.map((item, idx) => {
            // Show every 2nd or 3rd label on small screens
            const isVisible = idx % 2 === 0;
            return (
              <span
                key={item.hour}
                className={`text-center transition-colors ${
                  hoveredIndex === idx
                    ? 'font-bold text-indigo-600'
                    : item.hour === peakHour
                    ? 'font-bold text-slate-800'
                    : 'text-slate-400'
                } ${isVisible ? 'inline' : 'hidden sm:inline'}`}
              >
                {item.hour}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HourlyFlowChart;
