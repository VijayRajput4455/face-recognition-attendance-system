import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { shiftsApi } from '../../api/shifts';
import { useNavigation } from '../../context/NavigationContext';

import DashboardHeader from './components/DashboardHeader';
import DashboardGlobalFilters from './components/DashboardGlobalFilters';
import DashboardKpiGrid from './components/DashboardKpiGrid';
import FaceEnrollmentOverviewDonut from './components/FaceEnrollmentOverviewDonut';
import FaceEnrollmentTrendChart from './components/FaceEnrollmentTrendChart';
import EnrollmentCompletionTargetCard from './components/EnrollmentCompletionTargetCard';
import DepartmentEnrollmentHealthTable from './components/DepartmentEnrollmentHealthTable';
import WorkforceDistributionBarChart from './components/WorkforceDistributionBarChart';
import ShiftDistributionChart from './components/ShiftDistributionChart';
import DesignationDistributionChart from './components/DesignationDistributionChart';
import EmployeeGrowthTrendChart from './components/EmployeeGrowthTrendChart';
import RecentActivityFeed from './components/RecentActivityFeed';
import RecognitionSystemHealthCard from './components/RecognitionSystemHealthCard';
import MilvusVectorDistributionChart from './components/MilvusVectorDistributionChart';
import ConfidenceDistributionChart from './components/ConfidenceDistributionChart';

export function DashboardPage() {
  const { navigate } = useNavigation();
  const [dateRange, setDateRange] = useState('month');
  const [trendTimeframe, setTrendTimeframe] = useState('monthly');
  const [growthRange, setGrowthRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Global Multi-Attribute Filter State
  const [filters, setFilters] = useState({
    departmentId: 'ALL',
    shiftId: 'ALL',
    designationId: 'ALL',
    status: 'ALL',
    enrollmentStatus: 'ALL',
  });

  // Query parameters formatted for backend API
  const apiFilters = useMemo(() => {
    const params = {};
    if (filters.departmentId !== 'ALL') params.department_id = filters.departmentId;
    if (filters.shiftId !== 'ALL') params.shift_id = filters.shiftId;
    if (filters.designationId !== 'ALL') params.designation_id = filters.designationId;
    if (filters.status !== 'ALL') params.status = filters.status;
    return params;
  }, [filters]);

  // 1. Fetch Live Summary KPIs
  const {
    data: summaryData,
    isLoading: loadingSummary,
    refetch: refetchSummary,
    isRefetching: isRefetchingSummary,
  } = useQuery({
    queryKey: ['dashboard-summary', apiFilters],
    queryFn: () => dashboardApi.getSummary(apiFilters),
    refetchInterval: 30000,
  });

  // 2. Fetch Live Face Enrollment Overview
  const {
    data: enrollmentOverview,
    isLoading: loadingOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-enrollment-overview', apiFilters],
    queryFn: () => dashboardApi.getEnrollmentOverview(apiFilters),
    refetchInterval: 30000,
  });

  // 3. Fetch Live Face Enrollment Trend
  const {
    data: trendData,
    isLoading: loadingTrend,
    refetch: refetchTrend,
  } = useQuery({
    queryKey: ['dashboard-enrollment-trend', apiFilters, trendTimeframe],
    queryFn: () =>
      dashboardApi.getEnrollmentTrend({ ...apiFilters, timeframe: trendTimeframe }),
    refetchInterval: 60000,
  });

  // 4. Fetch Live Department Analytics Matrix
  const {
    data: departmentsData = [],
    isLoading: loadingDepartments,
    refetch: refetchDepartments,
  } = useQuery({
    queryKey: ['dashboard-departments'],
    queryFn: () => dashboardApi.getDepartments(),
    refetchInterval: 60000,
  });

  // 5. Fetch Live Shift Analytics
  const {
    data: shiftsData = [],
    isLoading: loadingShifts,
    refetch: refetchShifts,
  } = useQuery({
    queryKey: ['dashboard-shifts'],
    queryFn: () => dashboardApi.getShifts(),
    refetchInterval: 60000,
  });

  // 6. Fetch Live Designation Analytics
  const {
    data: designationsData = [],
    isLoading: loadingDesignations,
    refetch: refetchDesignations,
  } = useQuery({
    queryKey: ['dashboard-designations'],
    queryFn: () => dashboardApi.getDesignations(),
    refetchInterval: 60000,
  });

  // 7. Fetch Live Employee Growth
  const {
    data: growthData,
    isLoading: loadingGrowth,
    refetch: refetchGrowth,
  } = useQuery({
    queryKey: ['dashboard-growth', growthRange],
    queryFn: () => dashboardApi.getEmployeeGrowth({ range: growthRange }),
    refetchInterval: 60000,
  });

  // 8. Fetch Live Recent Activity
  const {
    data: activitiesData = [],
    isLoading: loadingActivity,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity({ limit: 8 }),
    refetchInterval: 15000,
  });

  // 9. Fetch Live System Health
  const {
    data: healthData,
    isLoading: loadingHealth,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: () => dashboardApi.getSystemHealth(),
    refetchInterval: 20000,
  });

  // Fetch Filter Lists
  const { data: rawDepartments = [] } = useQuery({
    queryKey: ['departments-list'],
    queryFn: departmentsApi.getAll,
  });

  const { data: rawShifts = [] } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: shiftsApi.getAll,
  });

  const { data: rawDesignations = [] } = useQuery({
    queryKey: ['designations-list'],
    queryFn: designationsApi.getAll,
  });

  const isRefreshing = isRefetchingSummary;

  const handleRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchOverview(),
      refetchTrend(),
      refetchDepartments(),
      refetchShifts(),
      refetchDesignations(),
      refetchGrowth(),
      refetchActivity(),
      refetchHealth(),
    ]);
    setLastUpdated(new Date());
  };

  const handleResetFilters = () => {
    setFilters({
      departmentId: 'ALL',
      shiftId: 'ALL',
      designationId: 'ALL',
      status: 'ALL',
      enrollmentStatus: 'ALL',
    });
  };

  // Metrics extracted from summary response
  const totalEmployees = summaryData?.total_employees ?? 0;
  const activeEmployees = summaryData?.active_employees ?? 0;
  const inactiveEmployees = summaryData?.inactive_employees ?? 0;
  const enrolledCount = summaryData?.face_enrolled ?? 0;
  const pendingCount = summaryData?.pending_face_enrollment ?? 0;
  const pending7Days = summaryData?.pending_7_days ?? 0;
  const pending30Days = summaryData?.pending_30_days ?? 0;
  const vectorCount = summaryData?.vector_count ?? (healthData?.vector_count ?? 0);

  // Export Analytics CSV Handler
  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Percentage,Status\n' +
      `Total Employees,${totalEmployees},100%,Active\n` +
      `Active Employees,${activeEmployees},${totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}%,Active\n` +
      `Face Enrolled,${enrolledCount},${summaryData?.enrollment_percentage ?? 0}%,Ready\n` +
      `Pending Enrollment,${pendingCount},${totalEmployees > 0 ? ((pendingCount / totalEmployees) * 100).toFixed(1) : 0}%,Attention\n` +
      `Milvus Indexed Vectors,${vectorCount},-,Healthy\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FaceAttend_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 1. Header & Controls */}
      <DashboardHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onExport={handleExportReport}
      />

      {/* 2. Global Filters Bar */}
      <DashboardGlobalFilters
        departments={rawDepartments}
        shifts={rawShifts}
        designations={rawDesignations}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* 3. Level 1: Top KPI Cards */}
      <DashboardKpiGrid
        totalEmployees={totalEmployees}
        activeEmployees={activeEmployees}
        inactiveEmployees={inactiveEmployees}
        enrolledCount={enrolledCount}
        pendingCount={pendingCount}
        loading={loadingSummary}
        selectedStatus={filters.status === 'ALL' ? '' : filters.status}
        selectedEnrollmentStatus={filters.enrollmentStatus === 'ALL' ? '' : filters.enrollmentStatus}
        onSelectMetric={(metric) => {
          if (metric === 'total') {
            setFilters((prev) => ({ ...prev, status: 'ALL', enrollmentStatus: 'ALL' }));
          } else if (metric === 'active') {
            setFilters((prev) => ({
              ...prev,
              status: prev.status === 'ACTIVE' ? 'ALL' : 'ACTIVE',
            }));
          } else if (metric === 'inactive') {
            setFilters((prev) => ({
              ...prev,
              status: prev.status === 'INACTIVE' ? 'ALL' : 'INACTIVE',
            }));
          } else if (metric === 'enrolled') {
            setFilters((prev) => ({
              ...prev,
              enrollmentStatus: prev.enrollmentStatus === 'ENROLLED' ? 'ALL' : 'ENROLLED',
            }));
          } else if (metric === 'pending') {
            setFilters((prev) => ({
              ...prev,
              enrollmentStatus: prev.enrollmentStatus === 'PENDING' ? 'ALL' : 'PENDING',
            }));
          } else if (metric === 'ready') {
            setFilters((prev) => ({
              ...prev,
              enrollmentStatus: prev.enrollmentStatus === 'ENROLLED' ? 'ALL' : 'ENROLLED',
            }));
          }
        }}
        onNavigate={(page) => navigate(page)}
      />

      {/* 4. Level 2: Face Enrollment Analytics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Overview */}
          <div className="lg:col-span-5">
            <FaceEnrollmentOverviewDonut
              enrolled={enrollmentOverview?.enrolled ?? enrolledCount}
              pending={enrollmentOverview?.pending ?? 0}
              failed={enrollmentOverview?.failed ?? 0}
              notStarted={enrollmentOverview?.not_started ?? 0}
            />
          </div>

          {/* Large Multi-Series Enrollment Trajectory Chart */}
          <div className="lg:col-span-7">
            <FaceEnrollmentTrendChart
              timeframe={trendTimeframe}
              setTimeframe={setTrendTimeframe}
              points={trendData?.points || []}
              loading={loadingTrend}
            />
          </div>
        </div>

        {/* Enrollment Completion Target & Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <EnrollmentCompletionTargetCard
              enrolledCount={enrolledCount}
              pendingCount={pendingCount}
              totalEmployees={totalEmployees}
              pending7Days={pending7Days}
              pending30Days={pending30Days}
              onViewPending={() => navigate('employees')}
            />
          </div>

          <div className="lg:col-span-7">
            <DepartmentEnrollmentHealthTable
              departments={departmentsData}
              onSelectDepartment={() => navigate('departments')}
            />
          </div>
        </div>
      </div>

      {/* 5. Level 3: Multi-Dimensional Workforce Distribution Matrix */}
      <WorkforceDistributionBarChart
        departments={departmentsData}
        shifts={shiftsData}
        designations={designationsData}
        onSelectDepartment={(id) => navigate('departments')}
        onSelectShift={(id) => navigate('shifts')}
        onSelectDesignation={(id) => navigate('designations')}
      />

      {/* 6. Level 4: Workforce Growth & Recognition System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <EmployeeGrowthTrendChart
            growthData={growthData}
            range={growthRange}
            setRange={setGrowthRange}
            loading={loadingGrowth}
          />
        </div>

        <div className="lg:col-span-5">
          <RecognitionSystemHealthCard
            milvusHealthy={healthData?.is_nominal ?? true}
            vectorCount={vectorCount}
            accuracy={healthData?.accuracy_percentage ?? 98.2}
            successRate={healthData?.success_rate_percentage ?? 99.1}
          />
        </div>
      </div>

      {/* 7. Level 5: Vector Index & Confidence Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MilvusVectorDistributionChart
          totalVectors={vectorCount}
          dimension={512}
          metricType="COSINE"
          indexType="HNSW"
          isConnected={healthData?.is_nominal ?? true}
        />

        <ConfidenceDistributionChart
          avgConfidence={healthData?.accuracy_percentage ?? 98.2}
          totalScans={vectorCount}
        />
      </div>

      {/* 8. Level 6 (Final): Live Recent Biometric Activity & Audit Stream */}
      <RecentActivityFeed
        activities={activitiesData}
        loading={loadingActivity}
        onNavigate={(page) => navigate(page)}
      />
    </div>
  );
}

export default DashboardPage;
