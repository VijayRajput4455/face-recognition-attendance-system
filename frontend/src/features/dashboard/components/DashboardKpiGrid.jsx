import React from 'react';
import { Users, UserCheck, UserX, ScanFace, Clock, ShieldCheck } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';

export function DashboardKpiGrid({
  totalEmployees = 0,
  activeEmployees = 0,
  inactiveEmployees = 0,
  enrolledCount = 0,
  pendingCount = 0,
  loading = false,
  onNavigate,
}) {
  const activePct = totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : '0.0';
  const enrolledPct = totalEmployees > 0 ? ((enrolledCount / totalEmployees) * 100).toFixed(1) : '0.0';
  const pendingPct = totalEmployees > 0 ? ((pendingCount / totalEmployees) * 100).toFixed(1) : '0.0';
  const inactivePct = totalEmployees > 0 ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Card 1 — Total Employees */}
      <StatCard
        title="Total Employees"
        value={totalEmployees.toLocaleString()}
        subtitle="Registered workforce"
        icon={Users}
        color="indigo"
        loading={loading}
        onClick={() => onNavigate?.('employees')}
      />

      {/* Card 2 — Active Employees */}
      <StatCard
        title="Active Employees"
        value={activeEmployees.toLocaleString()}
        subtitle={`${activePct}% of workforce`}
        icon={UserCheck}
        color="emerald"
        loading={loading}
        onClick={() => onNavigate?.('employees')}
      />

      {/* Card 3 — Face Enrolled */}
      <div
        onClick={() => onNavigate?.('enrollments')}
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:border-slate-300 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Face Enrolled
          </span>
          <div className="p-2.5 rounded-xl border flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 border-indigo-100">
            <ScanFace className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1">
            {enrolledCount.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mb-2">{enrolledPct}% enrolled</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(enrolledPct), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4 — Pending Enrollment */}
      <StatCard
        title="Pending Enrollment"
        value={pendingCount.toLocaleString()}
        subtitle={`${pendingPct}% pending action`}
        icon={Clock}
        color="amber"
        loading={loading}
        onClick={() => onNavigate?.('enrollments')}
      />

      {/* Card 5 — Inactive Employees */}
      <StatCard
        title="Inactive Employees"
        value={inactiveEmployees.toLocaleString()}
        subtitle={`${inactivePct}% of workforce`}
        icon={UserX}
        color="rose"
        loading={loading}
        onClick={() => onNavigate?.('employees')}
      />

      {/* Card 6 — Recognition Ready */}
      <StatCard
        title="Recognition Ready"
        value={`${enrolledCount.toLocaleString()} / ${totalEmployees.toLocaleString()}`}
        subtitle={`${enrolledPct}% recognition ready`}
        icon={ShieldCheck}
        color="blue"
        loading={loading}
        onClick={() => onNavigate?.('recognition')}
      />
    </div>
  );
}

export default DashboardKpiGrid;
