import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../../api/departments';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Building2, Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize workforce segments and monitor department attendance rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Grid of Department Cards */}
      {loadingDepts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No departments configured</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create your first department to assign employees.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl cursor-pointer"
          >
            Add Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const count = employees.filter((e) => e.department_id === dept.id).length;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
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
                    <Users className="w-4 h-4 text-slate-400" />
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
