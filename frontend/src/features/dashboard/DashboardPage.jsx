import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { enrollmentsApi } from '../../api/enrollments';
import { milvusApi } from '../../api/milvus';
import { departmentsApi } from '../../api/departments';
import { shiftsApi } from '../../api/shifts';
import { useNavigation } from '../../context/NavigationContext';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PageBanner from '../../components/ui/PageBanner';
import { formatDate, formatDateTime, getInitials, getAvatarColor, cn } from '../../lib/utils';
import {
  Users,
  ScanFace,
  Clock,
  Activity,
  Building2,
  Briefcase,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Video,
  ChevronRight,
  UserCheck,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function DashboardPage() {
  const { navigate } = useNavigation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 1. Fetch Employees
  const {
    data: employees = [],
    isLoading: loadingEmployees,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // 2. Fetch Enrollments
  const {
    data: enrollments = [],
    isLoading: loadingEnrollments,
    refetch: refetchEnrollments,
  } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAll,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // 3. Fetch Milvus Vector Count & Health
  const {
    data: milvusCountData,
    isLoading: loadingMilvusCount,
    refetch: refetchMilvus,
  } = useQuery({
    queryKey: ['milvus-count'],
    queryFn: milvusApi.getCount,
    retry: false,
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // 4. Fetch Departments
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // 5. Fetch Shifts
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
  });

  const isRefreshing = loadingEmployees || loadingEnrollments || loadingMilvusCount;

  const handleManualSync = () => {
    refetchEmployees();
    refetchEnrollments();
    refetchMilvus();
  };

  // Employee Map
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  // Total Workforce
  const totalEmployees = employees.length;

  // Vector Count
  const vectorCount = milvusCountData?.total_vectors ?? 0;

  // Completed & Pending Enrollments
  const completedEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'COMPLETED').length;
  }, [enrollments]);

  const pendingEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'PENDING' || e.status === 'PROCESSING').length;
  }, [enrollments]);

  const enrolledEmployeesCount = useMemo(() => {
    const enrolledIds = new Set(
      enrollments.filter((e) => e.status === 'COMPLETED').map((e) => e.employee_id)
    );
    return enrolledIds.size;
  }, [enrollments]);

  const enrollmentRate = totalEmployees > 0 ? Math.round((enrolledEmployeesCount / totalEmployees) * 100) : 0;

  // Department Stats
  const deptStats = useMemo(() => {
    return departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department_id === dept.id);
      const total = deptEmployees.length;
      const enrolledInDept = deptEmployees.filter((emp) =>
        enrollments.some((en) => en.employee_id === emp.id && en.status === 'COMPLETED')
      ).length;
      const rate = total > 0 ? Math.round((enrolledInDept / total) * 100) : 0;

      return {
        id: dept.id,
        name: dept.department_name,
        total,
        enrolled: enrolledInDept,
        pending: Math.max(0, total - enrolledInDept),
        rate,
      };
    });
  }, [departments, employees, enrollments]);

  // Recent Enrollments (Last 6)
  const recentEnrollments = useMemo(() => {
    return [...enrollments].slice(0, 6);
  }, [enrollments]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Banner with Real-Time Sync Controls */}
      <PageBanner
        badge="Live Biometric Vision Intelligence"
        badgeIcon={Sparkles}
        title={`${greeting}, Admin`}
        description="Real-time facial vector verification, InsightFace 512-D neural embeddings, and high-performance Milvus biometric database telemetry."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-Sync Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs border',
                autoRefresh
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                )}
              />
              <span>{autoRefresh ? 'Live Sync Active' : 'Sync Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              title="Force sync telemetry now"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
              <span>Sync Now</span>
            </button>

            {/* Launch Recognition Studio */}
            <button
              type="button"
              onClick={() => navigate('recognition')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 active:bg-indigo-100 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <ScanFace className="w-4 h-4 text-indigo-600" />
              <span>Recognition Studio</span>
            </button>
          </div>
        }
      />

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          subtitle="Registered staff"
          icon={Users}
          color="indigo"
          loading={loadingEmployees}
          onClick={() => navigate('employees')}
        />
        <StatCard
          title="Enrolled Faces"
          value={enrolledEmployeesCount}
          subtitle={`${enrollmentRate}% coverage`}
          icon={UserCheck}
          color="emerald"
          loading={loadingEnrollments}
          onClick={() => navigate('enrollments')}
        />
        <StatCard
          title="Pending Pipeline"
          value={pendingEnrollments}
          subtitle="Awaiting vectorization"
          icon={Video}
          color="amber"
          loading={loadingEnrollments}
          onClick={() => navigate('enrollments')}
        />
        <StatCard
          title="Indexed Vectors"
          value={vectorCount}
          subtitle="512-D Milvus Gallery"
          icon={Database}
          color="blue"
          loading={loadingMilvusCount}
          onClick={() => navigate('system-health')}
        />
        <StatCard
          title="Departments"
          value={departments.length}
          subtitle="Organizational units"
          icon={Building2}
          color="indigo"
          loading={loadingDepts}
          onClick={() => navigate('departments')}
        />
        <StatCard
          title="Vision AI Engine"
          value="Online"
          subtitle="InsightFace buffalo_l"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => navigate('system-health')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Department Standings & Recent Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Biometric Enrollment Coverage */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Biometric Enrollment Coverage</h3>
                <p className="text-xs text-slate-500 mt-0.5">Biometric enrollment rate across organizational units</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('departments')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {deptStats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No departments configured yet.</div>
            ) : (
              <div className="space-y-4">
                {deptStats.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{dept.name}</span>
                          <span className="text-[11px] text-slate-400">{dept.total} Employees</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-slate-700 font-mono">
                          {dept.enrolled} / {dept.total} Enrolled
                        </span>
                        <span
                          className={cn(
                            'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                            dept.rate >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : dept.rate >= 50
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          )}
                        >
                          {dept.rate}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Department Distribution Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workforce Placement Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick distribution metrics by department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {deptStats.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                        {dept.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {dept.rate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{dept.enrolled} Enrolled</span>
                    <span>{dept.pending} Unenrolled</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Architecture Specs & Recent Enrollments */}
        <div className="space-y-6">
          {/* Biometric Engine Architecture Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Vision AI Specifications</h3>
                <p className="text-xs text-slate-500">Deep learning biometric stack</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-1">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Model Family</span>
                <span className="font-semibold text-slate-900">InsightFace (buffalo_l)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Embedding Dimension</span>
                <span className="font-semibold text-slate-900 font-mono">512-D L2 Normalized</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Vector Index Type</span>
                <span className="font-semibold text-slate-900 font-mono">HNSW</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Distance Metric</span>
                <span className="font-semibold text-slate-900 font-mono">Cosine Similarity</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Milvus Status</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                </span>
              </div>
            </div>
          </div>

          {/* Recent Enrollments Activity */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900">Recent Enrollments</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('enrollments')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View all
              </button>
            </div>

            {recentEnrollments.length === 0 ? (
              <div className="py-8 text-center">
                <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No enrollment records in pipeline yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enr) => {
                  const emp = employeeMap.get(enr.employee_id);
                  const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Enrolled Employee';
                  const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
                  const avatarColor = getAvatarColor(empName);

                  return (
                    <div
                      key={enr.id}
                      onClick={() => {
                        if (emp) {
                          navigate('employee-profile', {
                            employeeId: emp.id,
                            employeeName: empName,
                          });
                        }
                      }}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${avatarColor}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {empName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            <span>{emp?.employee_code || enr.employee_id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={enr.status} type="enrollment" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Biometric Hub Tile */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Biometric Quick Launch</h4>
                  <p className="text-[11px] text-slate-400">Direct operational shortcuts</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('recognition')}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <ScanFace className="w-4 h-4 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Recognition Studio</span>
                <span className="text-[10px] text-slate-400 block">Live face scanner</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('enrollments', { mode: 'wizard' })}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Enroll Face</span>
                <span className="text-[10px] text-slate-400 block">Register new vectors</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
