import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, getShifts, createShift } from '../api/employees';
import { Modal } from '../components/Modal';
import { Building2, Clock, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [shiftForm, setShiftForm] = useState({ name: '', start_time: '09:00', end_time: '17:00' });

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [deptRes, shiftRes] = await Promise.allSettled([
        getDepartments(),
        getShifts(),
      ]);

      if (deptRes.status === 'fulfilled') {
        setDepartments(Array.isArray(deptRes.value) ? deptRes.value : (deptRes.value?.items || []));
      }
      if (shiftRes.status === 'fulfilled') {
        setShifts(Array.isArray(shiftRes.value) ? shiftRes.value : (shiftRes.value?.items || []));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch departments or shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(deptForm);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create department');
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await createShift(shiftForm);
      setIsShiftModalOpen(false);
      setShiftForm({ name: '', start_time: '09:00', end_time: '17:00' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Departments & Work Shifts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure organizational divisions and scheduled employee work shifts.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of Departments & Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Departments</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Organizational units</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="inline-flex items-center space-x-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Dept</span>
              </button>
            </div>

            {departments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No departments created yet.</p>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{dept.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept.description || 'No description'}</p>
                    </div>
                    {dept.code && (
                      <span className="font-mono text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                        {dept.code}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shifts Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Work Shifts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Timing schedules</p>
                </div>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="inline-flex items-center space-x-1 rounded-xl bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Shift</span>
              </button>
            </div>

            {shifts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No shifts created yet.</p>
            ) : (
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {shift.name || `Shift #${shift.id}`}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {shift.start_time} — {shift.end_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Dept Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="Create Department">
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Code
            </label>
            <input
              type="text"
              placeholder="e.g. ENG"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              placeholder="Short summary of this division..."
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white h-20"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Shift Modal */}
      <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Create Shift Schedule">
        <form onSubmit={handleCreateShift} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shift Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Shift"
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={shiftForm.start_time}
                onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={shiftForm.end_time}
                onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white"
            >
              Create Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Departments;
