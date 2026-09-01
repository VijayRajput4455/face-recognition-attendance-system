import React from 'react';
import { Activity, ScanFace, AlertTriangle, Video, UserPlus, Clock } from 'lucide-react';
import { cn, formatDateTime } from '../../../lib/utils';

export function RecentActivityFeed({ activities = [], loading = false, onNavigate }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('enrollments')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          View all
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-1">
          <Activity className="w-6 h-6 mx-auto text-slate-300" />
          <p>No recent activity recorded in the database yet.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {activities.map((act) => {
            const isCompleted = act.type === 'face_enrolled' || act.status === 'COMPLETED';
            const isFailed = act.type === 'enrollment_failed' || act.status === 'FAILED';
            const Icon = isCompleted ? ScanFace : isFailed ? AlertTriangle : Video;

            return (
              <div
                key={act.id}
                onClick={() => onNavigate?.('enrollments')}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-all cursor-pointer group"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform',
                    isCompleted
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      : isFailed
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {act.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed truncate">
                    {act.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivityFeed;
