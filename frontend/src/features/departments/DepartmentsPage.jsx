import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../../api/departments';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageBanner from '../../components/ui/PageBanner';
import { cn } from '../../lib/utils';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Layers,
  Loader2,
} from 'lucide-react';

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState(''); // '' | 'staffed' | 'empty'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'staff-desc' | 'staff-asc'

  // 1. Fetch Departments
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // 2. Fetch Employees for department employee count
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // Department staff mapping
  const deptStaffMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      if (emp.department_id) {
        map.set(emp.department_id, (map.get(emp.department_id) || 0) + 1);
      }
    });
    return map;
  }, [employees]);

  // Metric Calculations
  const totalDeptsCount = departments.length;
  const assignedEmployeesCount = useMemo(() => {
    return employees.filter((emp) => Boolean(emp.department_id)).length;
  }, [employees]);

  const staffedDeptsCount = useMemo(() => {
    return departments.filter((dept) => (deptStaffMap.get(dept.id) || 0) > 0).length;
  }, [departments, deptStaffMap]);

  const emptyDeptsCount = useMemo(() => {
    return departments.filter((dept) => (deptStaffMap.get(dept.id) || 0) === 0).length;
  }, [departments, deptStaffMap]);

  // Filtered & Sorted List
  const filteredDepartments = useMemo(() => {
    return departments
      .filter((dept) => {
        // Search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const nameMatch = dept.department_name.toLowerCase().includes(query);
          const descMatch = (dept.description || '').toLowerCase().includes(query);
          if (!nameMatch && !descMatch) return false;
        }

        // Staffing Filter
        const staffCount = deptStaffMap.get(dept.id) || 0;
        if (staffFilter === 'staffed' && staffCount === 0) return false;
        if (staffFilter === 'empty' && staffCount > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const countA = deptStaffMap.get(a.id) || 0;
        const countB = deptStaffMap.get(b.id) || 0;
        if (sortBy === 'staff-desc') return countB - countA;
        if (sortBy === 'staff-asc') return countA - countB;
        return a.department_name.localeCompare(b.department_name);
      });
  }, [departments, searchQuery, staffFilter, sortBy, deptStaffMap]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department Created', 'The department was added successfully.');
      handleCloseModal();
    },
    onError: (err) => toastError('Creation Failed', err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department Updated', 'Changes have been saved.');
      handleCloseModal();
    },
    onError: (err) => toastError('Update Failed', err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department Deleted', 'The department was removed.');
      setDeleteTarget(null);
    },
    onError: (err) => toastError('Deletion Failed', err.message),
  });

  const handleOpenCreate = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.department_name);
    setDeptDesc(dept.description || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setDeptName('');
    setDeptDesc('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toastError('Validation Error', 'Department name is required.');
      return;
    }
    const payload = {
      department_name: deptName.trim(),
      description: deptDesc.trim() || null,
    };

    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Organizational Structure"
        badgeIcon={Building2}
        title="Workforce Departments"
        description="Organize business units, team divisions, and monitor workforce distributions across departments."
      />

      {/* Real-Time Blue Theme Metric Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Departments Toggle */}
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
              Total Departments
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalDeptsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Divisions</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
        </button>

        {/* Assigned Workforce */}
        <button
          type="button"
          onClick={() => setStaffFilter('')}
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]"
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Assigned Staff
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {assignedEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {employees.length > 0 ? Math.round((assignedEmployeesCount / employees.length) * 100) : 0}% Allocated
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        </button>

        {/* Active Staffed Teams Toggle */}
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
              Active Teams
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {staffedDeptsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {totalDeptsCount > 0 ? Math.round((staffedDeptsCount / totalDeptsCount) * 100) : 0}% Staffed
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Unstaffed Units Toggle */}
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
              Unstaffed Units
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {emptyDeptsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">0 Staff</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Search & Filter Toolbar with Add Department Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search departments by name or description..."
              className="w-full md:max-w-xs"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Staffing Filter */}
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Teams</option>
                <option value="staffed">Staffed Teams ({staffedDeptsCount})</option>
                <option value="empty">Unstaffed Teams ({emptyDeptsCount})</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="name">Sort by Name (A-Z)</option>
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

          {/* Add Department Action */}
          <div className="flex items-center justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Department Cards */}
      {loadingDepts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">
            {searchQuery || staffFilter ? 'No matching departments' : 'No departments configured'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {searchQuery || staffFilter
              ? 'Try clearing your search or filters to see all departments.'
              : 'Create your first department to assign employees.'}
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
              Add Department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const count = deptStaffMap.get(dept.id) || 0;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{dept.department_name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {dept.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Users className="w-4 h-4 text-blue-600" />
                    {count} {count === 1 ? 'Employee' : 'Employees'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{dept.id.substring(0, 8)}</span>
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
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        description="Define an organizational team or division."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Engineering, Sales, Security"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              placeholder="Brief description of department scope..."
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
              {editingDept ? 'Save Changes' : 'Create Department'}
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
        title="Delete Department?"
        description={`Are you sure you want to delete ${deleteTarget?.department_name}? Employees assigned to this department will become unassigned.`}
        confirmText="Delete Department"
      />
    </div>
  );
}

export default DepartmentsPage;
