import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '../../api/enrollments';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { shiftsApi } from '../../api/shifts';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchInput from '../../components/ui/SearchInput';
import PageBanner from '../../components/ui/PageBanner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EnrollmentWizard from './EnrollmentWizard';
import { getInitials, getAvatarColor, cn } from '../../lib/utils';
import {
  Video,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Activity,
  ScanFace,
  Clock,
  Building2,
  Layers,
  Eye,
} from 'lucide-react';

export function EnrollmentsListPage() {
  const queryClient = useQueryClient();
  const { pageParams, navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const isWizardMode = pageParams.mode === 'wizard';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 1. Fetch Enrollments
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAll,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      const hasActiveJobs = Array.isArray(data) && data.some((e) => ['PENDING', 'PROCESSING'].includes(e.status));
      return hasActiveJobs ? 2000 : false;
    },
  });

  // 2. Fetch Employees for mapping
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // 3. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // 4. Fetch Designations
  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  // 5. Fetch Shifts
  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
  });

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const departmentMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, d.department_name));
    return map;
  }, [departments]);

  const designationMap = useMemo(() => {
    const map = new Map();
    designations.forEach((d) => map.set(d.id, d.designation_name));
    return map;
  }, [designations]);

  const shiftMap = useMemo(() => {
    const map = new Map();
    shifts.forEach((s) => map.set(s.id, s.shift_name));
    return map;
  }, [shifts]);

  // Metric Counts for 4 Toggles
  const totalEnrollmentsCount = enrollments.length;
  const completedCount = useMemo(
    () => enrollments.filter((e) => e.status === 'COMPLETED').length,
    [enrollments]
  );
  const processingCount = useMemo(
    () => enrollments.filter((e) => ['PROCESSING', 'PENDING'].includes(e.status)).length,
    [enrollments]
  );
  const failedCount = useMemo(
    () => enrollments.filter((e) => e.status === 'FAILED').length,
    [enrollments]
  );
  const completedPercentage =
    totalEnrollmentsCount > 0 ? Math.round((completedCount / totalEnrollmentsCount) * 100) : 0;

  // Retry Mutation
  const retryMutation = useMutation({
    mutationFn: (id) => enrollmentsApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      success('Retry Triggered', 'The enrollment pipeline has been re-queued.');
    },
    onError: (err) => {
      toastError('Retry Failed', err.message);
    },
  });

  // Delete Enrollment Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => enrollmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
      success(
        'Biometric Enrollment Removed',
        'The face vector embedding has been removed from Milvus DB and the enrollment record deleted.'
      );
      setDeleteTarget(null);
    },
    onError: (err) => {
      toastError('Deletion Failed', err.message);
    },
  });

  // Filtered & Sorted List
  const filteredEnrollments = useMemo(() => {
    return enrollments
      .filter((item) => {
        const emp = employeeMap.get(item.employee_id);

        // Search Query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.toLowerCase() : '';
          const code = (emp?.employee_code || '').toLowerCase();
          const idStr = item.id.toLowerCase();
          if (!empName.includes(q) && !code.includes(q) && !idStr.includes(q)) {
            return false;
          }
        }

        // Status Filter
        if (selectedStatus) {
          if (selectedStatus === 'PROCESSING') {
            if (!['PROCESSING', 'PENDING'].includes(item.status)) return false;
          } else if (item.status !== selectedStatus) {
            return false;
          }
        }

        // Department Filter
        if (selectedDepartment) {
          if (!emp || emp.department_id !== selectedDepartment) return false;
        }

        // Designation Filter
        if (selectedDesignation) {
          if (!emp || emp.designation_id !== selectedDesignation) return false;
        }

        // Shift Filter
        if (selectedShift) {
          if (!emp || emp.shift_id !== selectedShift) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const empA = employeeMap.get(a.employee_id);
        const empB = employeeMap.get(b.employee_id);

        if (sortBy === 'name') {
          const nameA = empA ? `${empA.first_name} ${empA.last_name || ''}`.trim() : '';
          const nameB = empB ? `${empB.first_name} ${empB.last_name || ''}`.trim() : '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        if (sortBy === 'oldest') {
          return (a.created_at || a.id).localeCompare(b.created_at || b.id);
        }
        // Default newest
        return (b.created_at || b.id).localeCompare(a.created_at || a.id);
      });
  }, [
    enrollments,
    searchQuery,
    selectedStatus,
    selectedDepartment,
    selectedDesignation,
    selectedShift,
    sortBy,
    employeeMap,
  ]);

  if (isWizardMode) {
    return <EnrollmentWizard />;
  }

  // Handle navigate to employee profile
  const handleViewEmployeeProfile = (emp, e) => {
    e?.stopPropagation();
    if (!emp) return;
    navigate('employee-profile', {
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name || ''}`.trim(),
    });
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee_id',
      sortable: true,
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        const name = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown Employee';
        const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
        const avatarColor = getAvatarColor(name);
        const desigName = emp ? designationMap.get(emp.designation_id) : null;

        return (
          <div
            onClick={(e) => handleViewEmployeeProfile(emp, e)}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Click to view full employee profile"
          >
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {name}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {desigName ? `${desigName} • ` : ''}
                {emp?.email || (emp?.employee_code ? `Code: ${emp.employee_code}` : 'No email registered')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Code',
      accessor: 'employee_code',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        return (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {emp?.employee_code || item.employee_id.substring(0, 8)}
          </span>
        );
      },
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        const deptName = emp ? departmentMap.get(emp.department_id) : null;
        return deptName ? (
          <span className="text-slate-800 font-medium">{deptName}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        );
      },
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        const desigName = emp ? designationMap.get(emp.designation_id) : null;
        return desigName ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            {desigName}
          </span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        );
      },
    },
    {
      header: 'Shift',
      accessor: 'shift',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        const shiftName = emp ? shiftMap.get(emp.shift_id) : null;
        return shiftName ? (
          <span className="text-slate-700">{shiftName}</span>
        ) : (
          <span className="text-slate-400 italic">Default</span>
        );
      },
    },
    {
      header: 'Employment',
      accessor: 'employment_status',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);
        const status = emp?.employment_status || 'ACTIVE';
        const isActive = status === 'ACTIVE';

        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs',
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isActive ? 'bg-emerald-500' : 'bg-slate-400'
              )}
            />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
          </span>
        );
      },
    },
    {
      header: 'Pipeline Status',
      accessor: 'status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} type="enrollment" />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (item) => {
        const emp = employeeMap.get(item.employee_id);

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {item.status === 'FAILED' && (
              <button
                type="button"
                onClick={() => retryMutation.mutate(item.id)}
                disabled={retryMutation.isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Retry Enrollment Pipeline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}

            {/* View Profile Button */}
            {emp && (
              <button
                type="button"
                onClick={(e) => handleViewEmployeeProfile(emp, e)}
                className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/60 shadow-2xs transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 group"
                title="View Employee Profile"
                aria-label="View Employee Profile"
              >
                <Eye className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </button>
            )}

            {/* Delete Biometrics Button */}
            <button
              type="button"
              onClick={() => setDeleteTarget(item)}
              className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/60 shadow-2xs transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 group"
              title="Delete Biometric Vectors & Record"
              aria-label="Delete Biometric Vectors & Record"
            >
              <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        );
      },
    },
  ];

  const targetEmp = deleteTarget ? employeeMap.get(deleteTarget.employee_id) : null;
  const targetEmpName = targetEmp
    ? `${targetEmp.first_name} ${targetEmp.last_name || ''}`.trim()
    : 'this employee';

  const isFiltered = Boolean(
    searchQuery || selectedStatus || selectedDepartment || selectedShift || sortBy !== 'newest'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Biometric Pipeline"
        badgeIcon={Sparkles}
        title="Biometric Enrollment Pipeline"
        description="Monitor asynchronous face extraction, embedding generation, and Milvus vector indexing jobs."
      />

      {/* Real-Time Blue Theme Metric Toggles (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Enrollments Toggle */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('');
            setSelectedDepartment('');
            setSelectedShift('');
            setSearchQuery('');
          }}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            !selectedStatus && !selectedDepartment && !selectedShift && !searchQuery
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Enrollments
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalEnrollmentsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Queued Jobs</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Video className="w-5 h-5" />
          </div>
        </button>

        {/* 2. Completed / Enrolled Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? '' : 'COMPLETED')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'COMPLETED'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Vectors Enrolled
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {completedCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {completedPercentage}% Ready
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        {/* 3. In Progress / Queue Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'PROCESSING' ? '' : 'PROCESSING')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'PROCESSING'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Processing Jobs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {processingCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {processingCount > 0 ? 'AI Processing' : 'Queue Idle'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Activity className={cn('w-5 h-5', processingCount > 0 && 'animate-spin')} />
          </div>
        </button>

        {/* 4. Failed Jobs Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'FAILED' ? '' : 'FAILED')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'FAILED'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Failed Jobs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {failedCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {failedCount > 0 ? `${failedCount} Need Retry` : '0 Errors'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Filter & Search Bar with Enroll Face Biometrics Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by employee name, code, or job ID..."
              className="w-full md:max-w-xs"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing / Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>

              {/* Designation Filter */}
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Designations</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.designation_name}
                  </option>
                ))}
              </select>

              {/* Shift Filter */}
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Shifts</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shift_name}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Employee Name (A-Z)</option>
                <option value="status">Pipeline Status</option>
              </select>

              {isFiltered && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('');
                    setSelectedDepartment('');
                    setSelectedDesignation('');
                    setSelectedShift('');
                    setSortBy('newest');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Relocated Primary Action Button */}
          <div className="flex items-center justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            <button
              onClick={() => navigate('enrollments', { mode: 'wizard' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              Enroll Face Biometrics
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredEnrollments}
        loading={loadingEnrollments}
        onRowClick={(row) => {
          const emp = employeeMap.get(row.employee_id);
          if (emp) {
            handleViewEmployeeProfile(emp);
          }
        }}
        emptyTitle="No enrollment jobs found"
        emptyDescription="No biometric video processing jobs match the selected filter criteria."
        emptyActionLabel="Enroll Face Biometrics"
        onEmptyAction={() => navigate('enrollments', { mode: 'wizard' })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isPending}
        danger
        title="Delete Biometric Embedding & Enrollment?"
        description={`Are you sure you want to remove face biometric vectors for ${targetEmpName} (${targetEmp?.employee_code || ''})? This will delete the 512-D embedding from Milvus vector database and clear the enrollment record. The employee record itself will NOT be deleted.`}
        confirmText="Delete Biometrics"
      />
    </div>
  );
}

export default EnrollmentsListPage;
