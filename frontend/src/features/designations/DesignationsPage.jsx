import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designationsApi } from '../../api/designations';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import PageBanner from '../../components/ui/PageBanner';
import BulkImportModal from '../../components/ui/BulkImportModal';
import { cn } from '../../lib/utils';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Layers,
  Award,
  Loader2,
  LayoutGrid,
  LayoutList,
  FileSpreadsheet,
} from 'lucide-react';

export function DesignationsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);


  const [designationName, setDesignationName] = useState('');
  const [designationDesc, setDesignationDesc] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState(''); // '' | 'staffed' | 'empty'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'staff-desc' | 'staff-asc'

  // 1. Fetch Designations
  const { data: designations = [], isLoading: loadingDesignations } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  // 2. Fetch Employees to calculate employee count per designation
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // Designation staff mapping
  const desigStaffMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      if (emp.designation_id) {
        map.set(emp.designation_id, (map.get(emp.designation_id) || 0) + 1);
      }
    });
    return map;
  }, [employees]);

  // Metric Calculations
  const totalDesigsCount = designations.length;
  const assignedEmployeesCount = useMemo(() => {
    return employees.filter((emp) => Boolean(emp.designation_id)).length;
  }, [employees]);

  const staffedDesigsCount = useMemo(() => {
    return designations.filter((desig) => (desigStaffMap.get(desig.id) || 0) > 0).length;
  }, [designations, desigStaffMap]);

  const emptyDesigsCount = useMemo(() => {
    return designations.filter((desig) => (desigStaffMap.get(desig.id) || 0) === 0).length;
  }, [designations, desigStaffMap]);

  // Columns for DataTable List View
  const desigColumns = [
    {
      header: 'Designation / Role',
      accessor: 'designation_name',
      render: (desig) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">{desig.designation_name}</div>
            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
              {desig.description || 'No description provided'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Staff',
      accessor: 'staffCount',
      render: (desig) => {
        const count = desigStaffMap.get(desig.id) || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {count}
            </span>
            <span className="text-xs text-slate-500">
              {count === 1 ? 'Employee' : 'Employees'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (desig) => {
        const count = desigStaffMap.get(desig.id) || 0;
        return count > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active Role</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border bg-slate-100 text-slate-600 border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Unstaffed</span>
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (desig) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(desig)}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Edit Designation"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(desig)}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Delete Designation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filtered & Sorted List
  const filteredDesignations = useMemo(() => {
    return designations
      .filter((desig) => {
        // Search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const nameMatch = desig.designation_name.toLowerCase().includes(query);
          const descMatch = (desig.description || '').toLowerCase().includes(query);
          if (!nameMatch && !descMatch) return false;
        }

        // Staffing Filter
        const staffCount = desigStaffMap.get(desig.id) || 0;
        if (staffFilter === 'staffed' && staffCount === 0) return false;
        if (staffFilter === 'empty' && staffCount > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const countA = desigStaffMap.get(a.id) || 0;
        const countB = desigStaffMap.get(b.id) || 0;
        if (sortBy === 'staff-desc') return countB - countA;
        if (sortBy === 'staff-asc') return countA - countB;
        return a.designation_name.localeCompare(b.designation_name);
      });
  }, [designations, searchQuery, staffFilter, sortBy, desigStaffMap]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => designationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      success('Designation Created', 'The designation was created successfully.');
      handleCloseModal();
    },
    onError: (err) => toastError('Creation Failed', err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => designationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      success('Designation Updated', 'Changes have been saved.');
      handleCloseModal();
    },
    onError: (err) => toastError('Update Failed', err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => designationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      success('Designation Deleted', 'The designation was removed.');
      setDeleteTarget(null);
    },
    onError: (err) => toastError('Deletion Failed', err.message),
  });

  const handleOpenCreate = () => {
    setEditingDesignation(null);
    setDesignationName('');
    setDesignationDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (desig) => {
    setEditingDesignation(desig);
    setDesignationName(desig.designation_name);
    setDesignationDesc(desig.description || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDesignation(null);
    setDesignationName('');
    setDesignationDesc('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!designationName.trim()) {
      toastError('Validation Error', 'Designation name is required.');
      return;
    }
    const payload = {
      designation_name: designationName.trim(),
      description: designationDesc.trim() || null,
    };

    if (editingDesignation) {
      updateMutation.mutate({ id: editingDesignation.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Job Roles & Hierarchy"
        badgeIcon={Briefcase}
        title="Workforce Designations"
        description="Configure job titles, organizational roles, and responsibilities across the workforce."
      />

      {/* Real-Time Blue Theme Metric Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Designations Toggle */}
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setStaffFilter('');
            setSortBy('name');
          }}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            !searchQuery && !staffFilter && sortBy === 'name'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Designations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalDesigsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Job Titles</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
        </button>

        {/* Assigned Staff */}
        <button
          type="button"
          onClick={() => setStaffFilter('')}
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]"
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Assigned Roles
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {assignedEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {employees.length > 0 ? Math.round((assignedEmployeesCount / employees.length) * 100) : 0}% Assigned
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        </button>

        {/* Active Staffed Roles Toggle */}
        <button
          type="button"
          onClick={() => setStaffFilter(staffFilter === 'staffed' ? '' : 'staffed')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            staffFilter === 'staffed'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Staffed Roles
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {staffedDesigsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {totalDesigsCount > 0 ? Math.round((staffedDesigsCount / totalDesigsCount) * 100) : 0}% Active
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Vacant / Unstaffed Roles Toggle */}
        <button
          type="button"
          onClick={() => setStaffFilter(staffFilter === 'empty' ? '' : 'empty')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            staffFilter === 'empty'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Vacant Roles
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {emptyDesigsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">0 Staff</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Search & Filter Toolbar with Add Designation Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search designations by title or description..."
              className="w-full md:max-w-xs"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Staffing Filter */}
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="staffed">Staffed Roles ({staffedDesigsCount})</option>
                <option value="empty">Vacant Roles ({emptyDesigsCount})</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="name">Sort by Title (A-Z)</option>
                <option value="staff-desc">Most Staff (High to Low)</option>
                <option value="staff-asc">Fewest Staff (Low to High)</option>
              </select>

              {(searchQuery || staffFilter || sortBy !== 'name') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStaffFilter('');
                    setSortBy('name');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Add Designation Action & View Toggle */}
          <div className="flex items-center gap-2.5 justify-between sm:justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Import CSV Action */}
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              Add Designation
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Import CSV Modal */}
      <BulkImportModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Import Designations in Bulk"
        entityName="Designations"
        sampleFileName="designations_template.csv"
        sampleTemplate="designation_name,description\nSenior AI Engineer,Develops computer vision and embedding models\nFrontend Architect,Leads React UI architecture and design system\nDevOps Engineer,Maintains Kubernetes and Milvus infrastructure\nProduct Manager,Guides feature roadmaps and attendance workflows\nHR Specialist,Manages employee onboarding and records"
        onUpload={(formData) => designationsApi.bulkUpload(formData)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['designations'] });
          success('Bulk Import Completed', 'Designations have been imported successfully.');
        }}
      />


      {/* View Mode: List or Grid */}
      {viewMode === 'list' ? (
        <DataTable
          columns={desigColumns}
          data={filteredDesignations}
          isLoading={loadingDesignations}
          emptyMessage="No matching designations found."
        />
      ) : loadingDesignations ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredDesignations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">
            {searchQuery || staffFilter ? 'No matching designations' : 'No designations configured'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {searchQuery || staffFilter
              ? 'Try clearing your search or filters to see all designations.'
              : 'Create job titles to assign to workforce members.'}
          </p>
          {searchQuery || staffFilter ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStaffFilter('');
                setSortBy('name');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl cursor-pointer"
            >
              Add Designation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesignations.map((desig) => {
            const count = desigStaffMap.get(desig.id) || 0;

            return (
              <div
                key={desig.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(desig)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(desig)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {desig.designation_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {desig.description || 'No job description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {count} {count === 1 ? 'Employee' : 'Employees'}
                    </span>
                  </div>

                  {count > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      Active Role
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Unstaffed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDesignation ? 'Edit Designation' : 'Create New Designation'}
        description="Define a job role or position title for employees."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={designationName}
              onChange={(e) => setDesignationName(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Operations Lead"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Responsibilities</label>
            <textarea
              rows={3}
              value={designationDesc}
              onChange={(e) => setDesignationDesc(e.target.value)}
              placeholder="Brief summary of role responsibilities..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingDesignation ? 'Save Changes' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isPending}
        danger
        title="Delete Designation?"
        description={`Are you sure you want to delete ${deleteTarget?.designation_name}? Employees assigned to this designation will become unassigned.`}
        confirmText="Delete Designation"
      />
    </div>
  );
}

export default DesignationsPage;
