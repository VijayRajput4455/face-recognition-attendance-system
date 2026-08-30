import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '../../api/shifts';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageBanner from '../../components/ui/PageBanner';
import { Clock, Plus, Edit2, Trash2, Users, Loader2, Sparkles } from 'lucide-react';

export function ShiftsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('18:00:00');
  const [graceMinutes, setGraceMinutes] = useState(15);

  // 1. Fetch Shifts
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
  });

  // 2. Fetch Employees for workforce count
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => shiftsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Created', 'New work shift has been established.');
      handleCloseModal();
    },
    onError: (err) => toastError('Creation Failed', err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shiftsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Updated', 'Shift changes have been saved.');
      handleCloseModal();
    },
    onError: (err) => toastError('Update Failed', err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => shiftsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Deleted', 'The shift was removed.');
      setDeleteTarget(null);
    },
    onError: (err) => toastError('Deletion Failed', err.message),
  });

  const handleOpenCreate = () => {
    setEditingShift(null);
    setShiftName('');
    setStartTime('09:00:00');
    setEndTime('18:00:00');
    setGraceMinutes(15);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.shift_name);
    setStartTime(shift.start_time || '09:00:00');
    setEndTime(shift.end_time || '18:00:00');
    setGraceMinutes(shift.grace_minutes ?? 15);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      toastError('Validation Error', 'Shift name is required.');
      return;
    }

    // Ensure seconds are included if not present (format HH:MM:SS)
    const formatTimeWithSeconds = (t) => {
      if (!t) return '09:00:00';
      return t.split(':').length === 2 ? `${t}:00` : t;
    };

    const payload = {
      shift_name: shiftName.trim(),
      start_time: formatTimeWithSeconds(startTime),
      end_time: formatTimeWithSeconds(endTime),
      grace_minutes: parseInt(graceMinutes, 10) || 0,
    };

    if (editingShift) {
      updateMutation.mutate({ id: editingShift.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Shift Scheduling"
        badgeIcon={Clock}
        title="Work Shifts & Schedules"
        description="Configure standard shift operational hours, late arrival grace windows, and roster allocations."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Shift
          </button>
        }
      />

      {/* Grid of Shift Cards */}
      {loadingShifts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No work shifts defined</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create standard morning or night shifts for attendance tracking.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl cursor-pointer"
          >
            Add Shift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift) => {
            const count = employees.filter((e) => e.shift_id === shift.id).length;

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                      <Clock className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(shift)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{shift.shift_name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {shift.start_time} - {shift.end_time}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        +{shift.grace_minutes || 0}m grace
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    {count} Assigned {count === 1 ? 'Employee' : 'Employees'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{shift.id.substring(0, 8)}</span>
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
        title={editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
        description="Set operational work hours and grace minutes for late calculation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="e.g. Morning Shift, Evening Shift"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grace Period (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Arrivals within grace minutes will be marked as PRESENT without late penalty.
            </p>
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
              {editingShift ? 'Save Changes' : 'Create Shift'}
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
        title="Delete Shift Schedule?"
        description={`Are you sure you want to delete ${deleteTarget?.shift_name}? Assigned employees will default to standard shift.`}
        confirmText="Delete Shift"
      />
    </div>
  );
}

export default ShiftsPage;
