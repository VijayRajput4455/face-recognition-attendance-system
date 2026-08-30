import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designationsApi } from '../../api/designations';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageBanner from '../../components/ui/PageBanner';
import { Briefcase, Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';

export function DesignationsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [designationName, setDesignationName] = useState('');
  const [designationDesc, setDesignationDesc] = useState('');

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
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Designation
          </button>
        }
      />

      {/* Grid of Designation Cards */}
      {loadingDesignations ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : designations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No designations configured</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create job titles to assign to workforce members.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl cursor-pointer"
          >
            Add Designation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designations.map((desig) => {
            const count = employees.filter((e) => e.designation_id === desig.id).length;

            return (
              <div
                key={desig.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
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
                    <h3 className="text-base font-bold text-slate-900">{desig.designation_name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {desig.description || 'No job description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    {count} {count === 1 ? 'Employee' : 'Employees'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{desig.id.substring(0, 8)}</span>
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
