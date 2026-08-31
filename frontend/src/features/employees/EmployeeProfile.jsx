import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { shiftsApi } from '../../api/shifts';
import { enrollmentsApi } from '../../api/enrollments';
import { attendanceApi } from '../../api/attendance';
import { milvusApi } from '../../api/milvus';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import EmployeeDrawer from './EmployeeDrawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatMinutes,
  formatConfidence,
  getInitials,
  getAvatarColor,
  cn,
} from '../../lib/utils';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  Clock,
  ScanFace,
  Video,
  Edit2,
  Trash2,
  CalendarCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Power,
  AlertTriangle,
} from 'lucide-react';

export function EmployeeProfile() {
  const queryClient = useQueryClient();
  const { pageParams, navigate } = useNavigation();
  const { success, error: toastError } = useToast();
  const employeeId = pageParams.employeeId;

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteEnrollmentTarget, setDeleteEnrollmentTarget] = useState(null);
  const [isDeleteBiometricsOpen, setIsDeleteBiometricsOpen] = useState(false);

  // Status Toggle Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => employeesApi.update(id, { employment_status: newStatus }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Status Updated', `${updated.first_name} is now ${updated.employment_status}.`);
    },
    onError: (err) => {
      toastError('Update Failed', err.message);
    },
  });

  // Delete Entire Employee Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Employee Removed', 'The employee record and Milvus embedding have been deleted.');
      navigate('employees');
    },
    onError: (err) => {
      toastError('Deletion Failed', err.message);
    },
  });

  // Delete Individual Enrollment Mutation
  const deleteEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId) => enrollmentsApi.delete(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments-employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-employee', employeeId] });
      success('Enrollment Deleted', 'Biometric vector and enrollment record removed.');
      setDeleteEnrollmentTarget(null);
    },
    onError: (err) => {
      toastError('Deletion Failed', err.message);
    },
  });

  // Delete All Biometrics For Employee Mutation
  const deleteBiometricsMutation = useMutation({
    mutationFn: () => enrollmentsApi.deleteByEmployeeId(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments-employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-employee', employeeId] });
      success('Biometrics Cleared', 'Facial vector removed from Milvus. Employee record remains intact.');
      setIsDeleteBiometricsOpen(false);
    },
    onError: (err) => {
      toastError('Clear Failed', err.message);
    },
  });

  // Month & Year for Monthly Report tab
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());

  // 1. Fetch Employee
  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeesApi.getById(employeeId),
    enabled: Boolean(employeeId),
  });

  // 2. Fetch Department
  const { data: department } = useQuery({
    queryKey: ['department', employee?.department_id],
    queryFn: () => departmentsApi.getById(employee.department_id),
    enabled: Boolean(employee?.department_id),
  });

  // 2.1 Fetch Designation
  const { data: designation } = useQuery({
    queryKey: ['designation', employee?.designation_id],
    queryFn: () => designationsApi.getById(employee.designation_id),
    enabled: Boolean(employee?.designation_id),
  });

  // 3. Fetch Shift
  const { data: shift } = useQuery({
    queryKey: ['shift', employee?.shift_id],
    queryFn: () => shiftsApi.getById(employee.shift_id),
    enabled: Boolean(employee?.shift_id),
  });

  // 4. Fetch Enrollments for Employee
  const { data: employeeEnrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments-employee', employeeId],
    queryFn: () => enrollmentsApi.getByEmployeeId(employeeId),
    enabled: Boolean(employeeId),
  });

  // 5. Fetch Attendance Logs for Employee
  const { data: attendanceLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['attendance-logs-employee', employeeId],
    queryFn: () => attendanceApi.getLogsByEmployee(employeeId),
    enabled: Boolean(employeeId),
  });

  // 6. Fetch Attendance Summaries for Employee
  const { data: attendanceSummaries = [], isLoading: loadingSummaries } = useQuery({
    queryKey: ['attendance-summaries-employee', employeeId],
    queryFn: () => attendanceApi.getSummariesByEmployee(employeeId),
    enabled: Boolean(employeeId),
  });

  // 7. Fetch Monthly Report
  const { data: monthlyReport, isLoading: loadingMonthlyReport } = useQuery({
    queryKey: ['monthly-report', employeeId, reportMonth, reportYear],
    queryFn: () => attendanceApi.getMonthlyReport(employeeId, reportMonth, reportYear),
    enabled: Boolean(employeeId) && activeTab === 'report',
  });

  // 8. Fetch Milvus Vector details for Employee
  const { data: milvusVector } = useQuery({
    queryKey: ['milvus-employee', employeeId],
    queryFn: () => milvusApi.getEmployeeById(employeeId),
    enabled: Boolean(employeeId) && activeTab === 'biometrics',
    retry: false,
  });

  if (loadingEmployee) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-44 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">Employee Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">The employee record may have been removed or does not exist.</p>
        <button
          onClick={() => navigate('employees')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const fullName = `${employee.first_name} ${employee.last_name || ''}`.trim();
  const initials = getInitials(employee.first_name, employee.last_name);
  const avatarColor = getAvatarColor(fullName);

  const latestEnrollment = employeeEnrollments[0];
  const isEnrolled = latestEnrollment?.status === 'COMPLETED' || employee.employment_status === 'ACTIVE';

  const handleEnrollClick = () => {
    navigate('enrollments', {
      mode: 'wizard',
      employeeId: employee.id,
      employeeCode: employee.employee_code,
      employeeName: fullName,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={() => navigate('employees')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workforce Roster
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center font-bold text-2xl shadow-md ${avatarColor}`}
            >
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.employee_code}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const currentStatus = employee.employment_status || 'ACTIVE';
                    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                    toggleStatusMutation.mutate({ id: employee.id, newStatus });
                  }}
                  disabled={toggleStatusMutation.isPending}
                  title={(employee.employment_status || 'ACTIVE') === 'ACTIVE' ? 'Click to deactivate' : 'Click to activate'}
                  className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <StatusBadge status={employee.employment_status || 'ACTIVE'} type="employment" />
                </button>
                <StatusBadge status={latestEnrollment?.status || 'PENDING'} type="enrollment" />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-normal">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {department?.department_name || 'No department assigned'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {designation?.designation_name || 'No designation assigned'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {shift ? `${shift.shift_name} (${shift.start_time} - ${shift.end_time})` : 'Default Shift'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(employee.joining_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsEditDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit Details
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={handleEnrollClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <ScanFace className="w-4 h-4" />
              {isEnrolled ? 'Re-enroll Face' : 'Enroll Biometrics'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'attendance', label: 'Attendance Logs', icon: CalendarCheck2 },
          { id: 'report', label: 'Monthly Report', icon: FileText },
          { id: 'biometrics', label: 'Biometrics & AI', icon: ScanFace },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80 -mb-1.5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact & Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Contact Information
                </h3>
                <button
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="text-slate-900 font-semibold">{employee.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="text-slate-900 font-semibold">{employee.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Employee Code</span>
                  <span className="text-slate-900 font-mono font-semibold">{employee.employee_code}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Joining Date</span>
                  <span className="text-slate-900 font-semibold">{formatDate(employee.joining_date)}</span>
                </div>
              </div>
            </div>

            {/* Department & Shift Assignment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Organizational Placement
                </h3>
                <button
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="text-slate-900 font-semibold">
                    {department?.department_name || 'Unassigned Department'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Designation</span>
                  <span className="text-slate-900 font-semibold">
                    {designation?.designation_name || 'Unassigned Designation'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Shift Schedule</span>
                  <span className="text-slate-900 font-semibold">{shift?.shift_name || 'General Shift'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Shift Timings</span>
                  <span className="text-slate-900 font-semibold">
                    {shift ? `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}` : '09:00 AM - 05:00 PM'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Record Actions / Danger Zone */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Manage Employee Record</h4>
              <p className="text-xs text-slate-500">
                Update employee profile details, reassign shift/department, or permanently remove this record.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Logs */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <DataTable
            columns={[
              {
                header: 'Recognition Time',
                accessor: 'recognition_time',
                sortable: true,
                render: (log) => (
                  <div>
                    <span className="font-semibold text-slate-900">{formatTime(log.recognition_time)}</span>
                    <span className="text-[11px] text-slate-400 block">{formatDate(log.recognition_time)}</span>
                  </div>
                ),
              },
              {
                header: 'Event Type',
                accessor: 'event_type',
                render: (log) => <StatusBadge status={log.event_type} type="event" />,
              },
              {
                header: 'Confidence Score',
                accessor: 'recognition_score',
                render: (log) => (
                  <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {formatConfidence(log.recognition_score)}
                  </span>
                ),
              },
              {
                header: 'Camera / Terminal',
                accessor: 'camera_name',
                render: (log) => <span>{log.camera_name || log.camera_id || 'Main Terminal'}</span>,
              },
              {
                header: 'Detection Type',
                accessor: 'recognition_type',
                render: (log) => <span className="text-slate-500 font-mono text-[11px]">{log.recognition_type}</span>,
              },
            ]}
            data={attendanceLogs}
            loading={loadingLogs}
            emptyTitle="No attendance logs recorded"
            emptyDescription="There are no face recognition logs recorded for this employee yet."
          />
        </div>
      )}

      {/* Tab 3: Monthly Report */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Month & Year Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Monthly Attendance Report</h4>
              <p className="text-[11px] text-slate-500">Aggregated working duration and present days breakdown</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={reportYear}
                onChange={(e) => setReportYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly KPI Stats */}
          {loadingMonthlyReport ? (
            <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ) : monthlyReport ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Present Days"
                value={`${monthlyReport.present_days} Days`}
                subtitle={`Recorded in ${new Date(2000, reportMonth - 1, 1).toLocaleString('default', { month: 'long' })}`}
                icon={CalendarCheck2}
                color="emerald"
              />
              <StatCard
                title="Total Working Duration"
                value={monthlyReport.total_working_duration || formatMinutes(monthlyReport.total_working_minutes)}
                subtitle="Calculated check-in to out"
                icon={Clock}
                color="indigo"
              />
              <StatCard
                title="Total Working Minutes"
                value={`${monthlyReport.total_working_minutes} Mins`}
                subtitle="Cumulative duration"
                icon={FileText}
                color="blue"
              />
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No summary report data available for this month.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Biometrics & AI */}
      {activeTab === 'biometrics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <ScanFace className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Milvus Biometric Vector Status</h3>
                  <p className="text-xs text-slate-500">512-dimensional facial embedding in standalone cluster</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <StatusBadge status={isEnrolled ? 'COMPLETED' : 'PENDING'} type="enrollment" />
                {isEnrolled && (
                  <button
                    onClick={() => setIsDeleteBiometricsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Biometrics from Milvus
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Model Architecture</span>
                <p className="text-xs font-bold text-slate-900">InsightFace (ArcFace buffalo_l)</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Vector Index</span>
                <p className="text-xs font-bold text-slate-900">HNSW (Cosine Similarity)</p>
              </div>
            </div>
          </div>

          {/* Enrollment History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enrollment Pipeline History</h4>
              <button
                onClick={handleEnrollClick}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                + New Enrollment
              </button>
            </div>

            <DataTable
              columns={[
                {
                  header: 'Enrollment ID',
                  accessor: 'id',
                  render: (e) => <span className="font-mono text-xs text-slate-700">{e.id.substring(0, 8)}...</span>,
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (e) => <StatusBadge status={e.status} type="enrollment" />,
                },
                {
                  header: 'Video Source',
                  accessor: 'video_path',
                  render: (e) => <span className="text-xs text-slate-500 truncate max-w-xs">{e.video_path}</span>,
                },
                {
                  header: 'Error Detail',
                  accessor: 'error_message',
                  render: (e) => (
                    <span className="text-xs text-rose-600">{e.error_message || '—'}</span>
                  ),
                },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (e) => (
                    <div className="flex items-center justify-end gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setDeleteEnrollmentTarget(e)}
                        className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/60 shadow-2xs transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
                        title="Delete Enrollment & Milvus Embedding"
                        aria-label="Delete Enrollment & Milvus Embedding"
                      >
                        <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={employeeEnrollments}
              loading={loadingEnrollments}
              emptyTitle="No enrollment records"
              emptyDescription="No video enrollment attempts have been made yet."
            />
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      <EmployeeDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        employee={employee}
      />

      {/* Delete Entire Employee Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(employee.id)}
        isLoading={deleteMutation.isPending}
        danger
        title="Delete Employee Record?"
        description={`Are you sure you want to permanently delete ${fullName} (${employee.employee_code})? This action cannot be undone and will delete all biometric embeddings and attendance history.`}
        confirmText="Delete Record"
      />

      {/* Delete Individual Enrollment Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteEnrollmentTarget)}
        onClose={() => setDeleteEnrollmentTarget(null)}
        onConfirm={() => deleteEnrollmentMutation.mutate(deleteEnrollmentTarget?.id)}
        isLoading={deleteEnrollmentMutation.isPending}
        danger
        title="Delete Enrollment Record & Embeddings?"
        description={`Are you sure you want to delete this enrollment record? This will remove the face vectors from Milvus. The employee record (${fullName}) will NOT be deleted.`}
        confirmText="Delete Enrollment"
      />

      {/* Delete All Biometrics Dialog */}
      <ConfirmDialog
        isOpen={isDeleteBiometricsOpen}
        onClose={() => setIsDeleteBiometricsOpen(false)}
        onConfirm={() => deleteBiometricsMutation.mutate()}
        isLoading={deleteBiometricsMutation.isPending}
        danger
        title="Remove All Facial Biometrics from Milvus?"
        description={`Are you sure you want to remove all biometric embeddings for ${fullName} (${employee.employee_code}) from Milvus? The employee profile, details, and attendance history will remain intact.`}
        confirmText="Remove Biometrics"
      />
    </div>
  );
}

export default EmployeeProfile;
