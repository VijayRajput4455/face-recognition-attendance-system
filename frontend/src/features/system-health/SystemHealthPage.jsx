import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milvusApi } from '../../api/milvus';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageBanner from '../../components/ui/PageBanner';
import { getInitials, getAvatarColor } from '../../lib/utils';
import {
  Activity,
  ShieldCheck,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

export function SystemHealthPage() {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const [deleteTargetEmployee, setDeleteTargetEmployee] = useState(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Milvus Health
  const { data: milvusHealth, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['milvus-health'],
    queryFn: milvusApi.getHealth,
  });

  // 2. Fetch Milvus Count
  const { data: milvusCount, isLoading: loadingCount, refetch: refetchCount } = useQuery({
    queryKey: ['milvus-count'],
    queryFn: milvusApi.getCount,
  });

  // 3. Fetch Milvus Collection Info
  const { data: collectionInfo, isLoading: loadingInfo, refetch: refetchInfo } = useQuery({
    queryKey: ['milvus-info'],
    queryFn: milvusApi.getInfo,
  });

  // 4. Fetch Milvus Index Config
  const { data: indexConfig, isLoading: loadingConfig, refetch: refetchConfig } = useQuery({
    queryKey: ['milvus-config'],
    queryFn: milvusApi.getConfig,
  });

  // 5. Fetch Indexed Employees
  const { data: indexedEmployees = [], isLoading: loadingIndexed, refetch: refetchIndexed } = useQuery({
    queryKey: ['milvus-employees'],
    queryFn: milvusApi.getEmployees,
  });

  // 6. Fetch full employee details for mapping
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  const employeeMap = React.useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const handleRefreshAll = () => {
    refetchHealth();
    refetchCount();
    refetchInfo();
    refetchConfig();
    refetchIndexed();
  };

  // Delete single vector
  const deleteEmployeeVectorMutation = useMutation({
    mutationFn: (id) => milvusApi.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-employees'] });
      success('Vector Deleted', 'Biometric face vector removed from Milvus collection.');
      setDeleteTargetEmployee(null);
    },
    onError: (err) => toastError('Deletion Failed', err.message),
  });

  // Delete All Vectors Mutation
  const deleteAllVectorsMutation = useMutation({
    mutationFn: milvusApi.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
      queryClient.invalidateQueries({ queryKey: ['milvus-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Collection Cleared', 'All facial vectors have been purged from Milvus.');
      setIsDeleteAllOpen(false);
    },
    onError: (err) => toastError('Purge Failed', err.message),
  });

  // Filtered indexed list
  const filteredIndexed = React.useMemo(() => {
    if (!Array.isArray(indexedEmployees)) return [];
    return indexedEmployees.filter((item) => {
      const emp = employeeMap.get(item.employee_id || item.id);
      const name = emp ? `${emp.first_name} ${emp.last_name || ''}`.toLowerCase() : '';
      const code = (emp?.employee_code || item.employee_code || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [indexedEmployees, searchQuery, employeeMap]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="System Diagnostics"
        badgeIcon={Activity}
        title="AI Engine & Infrastructure Health"
        description="Monitor Milvus vector database clustering, InsightFace inference engine metrics, and biometric collection status."
        actions={
          <button
            onClick={handleRefreshAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            Refresh Diagnostics
          </button>
        }
      />

      {/* Cluster Overview Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Milvus Health */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Database className="w-5 h-5" />
            </div>
            <StatusBadge status={milvusHealth?.status || 'HEALTHY'} type="health" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Milvus Vector DB</h3>
            <p className="text-xs text-slate-500 mt-0.5">Standalone Vector Store (v2.4.4)</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Vectors</span>
              <span className="font-bold text-slate-900">{milvusCount?.total_vectors ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Connection</span>
              <span className="font-mono text-emerald-600 font-semibold">milvus:19530</span>
            </div>
          </div>
        </div>

        {/* Card 2: AI Face Recognition Engine */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Cpu className="w-5 h-5" />
            </div>
            <StatusBadge status="ACTIVE" type="health" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">InsightFace Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5">ArcFace Deep Learning Model</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Model Name</span>
              <span className="font-semibold text-slate-900">buffalo_l</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vector Dimension</span>
              <span className="font-semibold text-slate-900">512-Dimensional</span>
            </div>
          </div>
        </div>

        {/* Card 3: Index Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">HNSW Index</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Search Metric</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cosine Similarity Search</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Collection</span>
              <span className="font-mono text-slate-800 truncate">employee_face_embeddings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Index Type</span>
              <span className="font-semibold text-slate-900">HNSW (M=16, efConstruction=200)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Topologies & Quality Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" /> AI Vector Pipeline Architecture
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Face Detector</span>
              <span className="font-semibold text-slate-800">RetinaFace (ResNet50 Backbone)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Embedding Extractor</span>
              <span className="font-semibold text-slate-800">ArcFace (512-D Normalized Vector)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Vector Storage Engine</span>
              <span className="font-semibold text-slate-800">Milvus Standalone (v2.4+)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Index Type</span>
              <span className="font-semibold text-slate-800">HNSW (M=16, efConstruction=200)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Search Parameter</span>
              <span className="font-semibold text-slate-800">ef=64 (Sub-millisecond ANN Search)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-500">Inference Device</span>
              <span className="font-semibold text-slate-800">ONNX Runtime (CPU / CUDA Auto)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Face Quality Evaluation Rules
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Detection Confidence Threshold</span>
              <span className="font-semibold text-slate-800">&gt;= 0.60 (RetinaFace)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Laplacian Blur Threshold</span>
              <span className="font-semibold text-slate-800">&gt;= 100.0 (Sharp Focus)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Max Head Yaw / Pitch Angle</span>
              <span className="font-semibold text-slate-800">&lt;= 30.0 degrees</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Illumination Range</span>
              <span className="font-semibold text-slate-800">40 - 220 Mean Pixel Intensity</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">High Confidence Match</span>
              <span className="font-semibold text-emerald-600 font-mono">&gt;= 0.60 Cosine</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-500">Minimum Identity Verification</span>
              <span className="font-semibold text-amber-600 font-mono">&gt;= 0.45 Cosine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indexed Vectors Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Indexed Face Recognition Vectors</h3>
            <p className="text-xs text-slate-500 mt-0.5">Registered employee facial representations stored in Milvus</p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by employee name or code..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <DataTable
          columns={[
            {
              header: 'Employee',
              accessor: 'employee_id',
              render: (item) => {
                const empId = item.employee_id || item.id;
                const emp = employeeMap.get(empId);
                const fullName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Enrolled Employee';
                const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
                const avatarColor = getAvatarColor(fullName);

                return (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {emp?.employee_code || item.employee_code || empId?.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Vector Dimension',
              accessor: 'dimension',
              render: () => <span className="font-mono text-xs text-slate-700">512</span>,
            },
            {
              header: 'Metric',
              accessor: 'metric',
              render: () => <span className="font-mono text-xs font-semibold text-indigo-600">COSINE</span>,
            },
            {
              header: 'Status',
              accessor: 'status',
              render: () => <StatusBadge status="COMPLETED" type="enrollment" />,
            },
            {
              header: 'Action',
              accessor: 'actions',
              className: 'text-right',
              cellClassName: 'text-right',
              render: (item) => {
                return (
                  <button
                    onClick={() => setDeleteTargetEmployee(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete face recognition vector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                );
              },
            },
          ]}
          data={filteredIndexed}
          loading={loadingIndexed}
          emptyTitle="No vectors indexed in Milvus"
          emptyDescription="Perform face enrollment to index facial embeddings."
        />
      </div>

      {/* Danger Zone: Purge All Vectors */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Danger Zone: Vector Database Maintenance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Permanently purge all face recognition vector representations from the Milvus cluster. Employee database records
              will remain intact, but facial recognition will be disabled until employees are re-enrolled.
            </p>
          </div>

          <button
            onClick={() => setIsDeleteAllOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            Purge All Vectors
          </button>
        </div>
      </div>

      {/* Delete Single Vector Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetEmployee)}
        onClose={() => setDeleteTargetEmployee(null)}
        onConfirm={() =>
          deleteEmployeeVectorMutation.mutate(deleteTargetEmployee?.employee_id || deleteTargetEmployee?.id)
        }
        isLoading={deleteEmployeeVectorMutation.isPending}
        danger
        title="Delete Employee Face Recognition Vector?"
        description="This will remove the facial embedding from the Milvus index. The employee will no longer be recognized in camera streams."
        confirmText="Delete Vector"
      />

      {/* Delete All Vectors Dialog (Explicit verification) */}
      <ConfirmDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={() => deleteAllVectorsMutation.mutate()}
        isLoading={deleteAllVectorsMutation.isPending}
        danger
        requireVerificationText="DELETE ALL VECTORS"
        title="CRITICAL: Purge Entire Vector Collection?"
        description="This operation deletes every facial representation in Milvus. All employees will need to re-enroll face recognition."
        confirmText="Purge Vector Database"
      />
    </div>
  );
}

export default SystemHealthPage;
