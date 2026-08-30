import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { attendanceApi } from '../../api/attendance';
import { enrollmentsApi } from '../../api/enrollments';
import { milvusApi } from '../../api/milvus';
import { departmentsApi } from '../../api/departments';
import { useNavigation } from '../../context/NavigationContext';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatTime, formatDateTime, formatConfidence, getInitials, getAvatarColor } from '../../lib/utils';
import {
  Users,
  UserCheck,
  UserX,
  ScanFace,
  Clock,
  Activity,
  Building2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Video,
  ChevronRight,
} from 'lucide-react';

export function DashboardPage() {
  const { navigate } = useNavigation();

  // 1. Fetch Employees
  const { data: employees = [], isLoading: loadingEmployees, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // 2. Fetch Attendance Summaries (for Today)
  const { data: summaries = [], isLoading: loadingSummaries, refetch: refetchSummaries } = useQuery({
    queryKey: ['attendance-summaries'],
    queryFn: attendanceApi.getSummaries,
  });

  // 3. Fetch Attendance Logs (for Recent Activity)
  const { data: logs = [], isLoading: loadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['attendance-logs'],
    queryFn: attendanceApi.getLogs,
  });

  // 4. Fetch Enrollments
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAll,
  });

  // 5. Fetch Milvus Vector Count & Health
  const { data: milvusCountData, isLoading: loadingMilvusCount } = useQuery({
    queryKey: ['milvus-count'],
    queryFn: milvusApi.getCount,
    retry: false,
  });

  const { data: milvusHealthData } = useQuery({
    queryKey: ['milvus-health'],
    queryFn: milvusApi.getHealth,
    retry: false,
  });

  // 6. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const isRefreshing = loadingEmployees || loadingSummaries || loadingLogs;

  const handleRefresh = () => {
    refetchEmployees();
    refetchSummaries();
    refetchLogs();
  };

  // Derive today's metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySummaries = useMemo(() => {
    return summaries.filter((s) => s.attendance_date === todayStr);
  }, [summaries, todayStr]);

  const presentCount = useMemo(() => {
    return todaySummaries.filter((s) => s.status === 'PRESENT' || s.first_check_in).length;
  }, [todaySummaries]);

  const totalEmployees = employees.length;
  const absentCount = Math.max(0, totalEmployees - presentCount);
  const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(0) : 0;

  // Enrolled employees count (from Milvus or enrollments)
  const vectorCount = milvusCountData?.total_vectors ?? 0;
  const completedEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'COMPLETED').length;
  }, [enrollments]);

  const enrolledFacesCount = vectorCount > 0 ? vectorCount : completedEnrollments;
  const pendingEnrollmentsCount = useMemo(() => {
    return enrollments.filter((e) => e.status === 'PENDING' || e.status === 'PROCESSING').length;
  }, [enrollments]);

  // Department distribution
  const deptStats = useMemo(() => {
    return departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department_id === dept.id);
      const deptEmpIds = new Set(deptEmployees.map((e) => e.id));
      const deptPresent = todaySummaries.filter((s) => deptEmpIds.has(s.employee_id) && s.first_check_in).length;
      const total = deptEmployees.length;
      const rate = total > 0 ? Math.round((deptPresent / total) * 100) : 0;

      return {
        id: dept.id,
        name: dept.department_name,
        total,
        present: deptPresent,
        absent: Math.max(0, total - deptPresent),
        rate,
      };
    });
  }, [departments, employees, todaySummaries]);

  // Recent 5 logs
  const recentLogs = useMemo(() => {
    return [...logs].slice(0, 6);
  }, [logs]);

  // Employee mapping lookup
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative background lights */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI-Powered Workforce Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Good morning, Admin</h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed font-normal">
            Here's what's happening across your workforce, attendance streams, and biometric recognition pipelines today.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('recognition')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 active:bg-indigo-100 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <ScanFace className="w-4 h-4 text-indigo-600" />
            Live Recognition
          </button>
        </div>
      </div>

      {/* Top KPI Cards (6 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Registered staff"
          icon={Users}
          color="indigo"
          loading={loadingEmployees}
          onClick={() => navigate('employees')}
        />
        <StatCard
          title="Present Today"
          value={presentCount}
          subtitle={`${attendanceRate}% attendance rate`}
          icon={UserCheck}
          color="emerald"
          loading={loadingSummaries}
          onClick={() => navigate('attendance')}
        />
        <StatCard
          title="Absent Today"
          value={absentCount}
          subtitle="Pending check-in"
          icon={UserX}
          color="rose"
          loading={loadingSummaries}
          onClick={() => navigate('attendance')}
        />
        <StatCard
          title="Face Enrolled"
          value={enrolledFacesCount}
          subtitle="Vectors in Milvus"
          icon={ScanFace}
          color="blue"
          loading={loadingMilvusCount}
          onClick={() => navigate('system-health')}
        />
        <StatCard
          title="Enrollment Pending"
          value={pendingEnrollmentsCount}
          subtitle="Queued in pipeline"
          icon={Clock}
          color="amber"
          loading={loadingEnrollments}
          onClick={() => navigate('enrollments')}
        />
        <StatCard
          title="AI Engine Status"
          value="Healthy"
          subtitle="InsightFace buffalo_l"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => navigate('system-health')}
        />
      </div>

      {/* Main Grid: Today's Attendance Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Breakdown & Department Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Attendance Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time attendance rate and presence ratio</p>
              </div>
              <button
                onClick={() => navigate('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                View all logs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attendance Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Attendance Compliance</span>
                <span className="text-slate-900">{attendanceRate}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
                <div
                  className="bg-rose-400 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${100 - attendanceRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Present: {presentCount} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Absent / Unrecorded: {absentCount} employees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Attendance Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Workforce Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live attendance standing by department</p>
              </div>
              <button
                onClick={() => navigate('departments')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                Manage departments <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {deptStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No departments created yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {deptStats.map((dept) => (
                  <div key={dept.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{dept.name}</div>
                        <div className="text-[11px] text-slate-500">{dept.total} Total Employees</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">{dept.present}</span>
                        <span className="text-slate-400"> / {dept.total} Present</span>
                      </div>
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${dept.rate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 w-10 text-right">{dept.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Live Attendance Activity & Biometric Health */}
        <div className="space-y-6">
          {/* Recent Live Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Stream Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest face detections & events</p>
              </div>
              <button
                onClick={() => navigate('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View all
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-12 text-center">
                <ScanFace className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No attendance events recorded today yet.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentLogs.map((log) => {
                  const emp = employeeMap.get(log.employee_id);
                  const empName = emp ? `${emp.first_name} ${emp.last_name || ''}` : 'Enrolled Employee';
                  const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
                  const avatarColor = getAvatarColor(empName);

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-slate-900 truncate">{empName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {emp?.employee_code || log.employee_id?.substring(0, 8)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={log.event_type} type="event" />
                        </div>
                        <span className="text-[10px] text-slate-400">{formatTime(log.recognition_time)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Biometrics & Vector Health Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <ScanFace className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Vector Infrastructure</h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                Milvus v2.4
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-indigo-200 block mb-0.5">Indexed Embeddings</span>
                <span className="text-xl font-bold text-white">{vectorCount}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-indigo-200 block mb-0.5">Model Vector Dim</span>
                <span className="text-xl font-bold text-white">512-D</span>
              </div>
            </div>

            <button
              onClick={() => navigate('system-health')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Inspect Vector DB <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
