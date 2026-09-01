import React, { useState, useMemo } from 'react';
import {
  Activity,
  ScanFace,
  AlertTriangle,
  Video,
  Clock,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function RecentActivityFeed({ activities = [], loading = false, onNavigate }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'

  // Default fallback activities if empty
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: 'demo-1',
      type: 'face_enrolled',
      title: 'Face Enrolled',
      description: 'System Biometric Verification Engine initialized and ready',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    },
  ];

  const filteredActivities = useMemo(() => {
    if (filterType === 'ALL') return displayActivities;
    return displayActivities.filter((act) => {
      if (filterType === 'COMPLETED') return act.status === 'COMPLETED' || act.type === 'face_enrolled';
      if (filterType === 'PENDING') return act.status === 'PENDING' || act.status === 'PROCESSING';
      if (filterType === 'FAILED') return act.status === 'FAILED';
      return true;
    });
  }, [displayActivities, filterType]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between space-y-6">
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Biometric Activity & Audit</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry stream of face indexing, video processing, and verification events
          </p>
        </div>

        {/* View Toggle & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs gap-0.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'FAILED', label: 'Issues' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  filterType === tab.id
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid vs List View Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-all cursor-pointer',
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* View All Button */}
          <button
            type="button"
            onClick={() => onNavigate?.('enrollments')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/70 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Content Area */}
      {filteredActivities.length === 0 ? (
        <div className="py-14 text-center text-xs text-slate-400 space-y-2 my-auto">
          <Activity className="w-8 h-8 mx-auto text-slate-300" />
          <p>No activity records match the selected filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-auto">
          {filteredActivities.map((act) => {
            const isCompleted = act.type === 'face_enrolled' || act.status === 'COMPLETED';
            const isFailed = act.type === 'enrollment_failed' || act.status === 'FAILED';
            const Icon = isCompleted ? ScanFace : isFailed ? AlertTriangle : Video;

            return (
              <div
                key={act.id}
                onClick={() => onNavigate?.('enrollments')}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group shadow-2xs hover:shadow-sm"
              >
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform',
                      isCompleted
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
                        : isFailed
                        ? 'bg-rose-50 text-rose-600 border-rose-200/80'
                        : 'bg-amber-50 text-amber-600 border-amber-200/80'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span
                    className={cn(
                      'text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border',
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isFailed
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    {isCompleted ? 'Success' : isFailed ? 'Failed' : 'Processing'}
                  </span>
                </div>

                {/* Card Body */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-200/60 pt-2.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Recent'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2.5 my-auto">
          {filteredActivities.map((act) => {
            const isCompleted = act.type === 'face_enrolled' || act.status === 'COMPLETED';
            const isFailed = act.type === 'enrollment_failed' || act.status === 'FAILED';
            const Icon = isCompleted ? ScanFace : isFailed ? AlertTriangle : Video;

            return (
              <div
                key={act.id}
                onClick={() => onNavigate?.('enrollments')}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform',
                      isCompleted
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
                        : isFailed
                        ? 'bg-rose-50 text-rose-600 border-rose-200/80'
                        : 'bg-amber-50 text-amber-600 border-amber-200/80'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {act.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill & Time */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      'text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border',
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isFailed
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Processing'}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
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
