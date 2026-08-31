import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '../../api/enrollments';
import { employeesApi } from '../../api/employees';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchInput from '../../components/ui/SearchInput';
import PageBanner from '../../components/ui/PageBanner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EnrollmentWizard from './EnrollmentWizard';
import { getInitials, getAvatarColor } from '../../lib/utils';
import { Video, RotateCcw, Plus, Play, CheckCircle2, AlertCircle, Sparkles, Trash2 } from 'lucide-react';

export function EnrollmentsListPage() {
  const queryClient = useQueryClient();
  const { pageParams, navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const isWizardMode = pageParams.mode === 'wizard';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

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

  // Filtered List
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const emp = employeeMap.get(item.employee_id);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.toLowerCase() : '';
        const code = (emp?.employee_code || '').toLowerCase();
        const idStr = item.id.toLowerCase();
        if (!empName.includes(q) && !code.includes(q) && !idStr.includes(q)) {
          return false;
        }
      }
      if (selectedStatus && item.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [enrollments, searchQuery, selectedStatus, employeeMap]);

  if (isWizardMode) {
    return <EnrollmentWizard />;
  }

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

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {emp?.employee_code || item.employee_id.substring(0, 8)}
              </div>
            </div>
          </div>
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
      header: 'Enrollment ID',
      accessor: 'id',
      render: (item) => <span className="font-mono text-xs text-slate-600">{item.id.substring(0, 13)}...</span>,
    },
    {
      header: 'Video Path',
      accessor: 'video_path',
      render: (item) => <span className="text-xs text-slate-500 truncate max-w-xs block">{item.video_path}</span>,
    },
    {
      header: 'Error Notes',
      accessor: 'error_message',
      render: (item) => (
        <span className="text-xs text-rose-600 truncate max-w-xs block">{item.error_message || '—'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {item.status === 'FAILED' && (
            <button
              onClick={() => retryMutation.mutate(item.id)}
              disabled={retryMutation.isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}

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
      ),
    },
  ];

  const targetEmp = deleteTarget ? employeeMap.get(deleteTarget.employee_id) : null;
  const targetEmpName = targetEmp
    ? `${targetEmp.first_name} ${targetEmp.last_name || ''}`.trim()
    : 'this employee';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Biometric Pipeline"
        badgeIcon={Sparkles}
        title="Biometric Enrollment Pipeline"
        description="Monitor asynchronous face extraction, embedding generation, and Milvus vector indexing jobs."
        actions={
          <button
            onClick={() => navigate('enrollments', { mode: 'wizard' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Enroll Face Biometrics
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by employee name or code..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          {(searchQuery || selectedStatus) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredEnrollments}
        loading={loadingEnrollments}
        emptyTitle="No enrollment jobs found"
        emptyDescription="No biometric video processing jobs have been queued."
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
