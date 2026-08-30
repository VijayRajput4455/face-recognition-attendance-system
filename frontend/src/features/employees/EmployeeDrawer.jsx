import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { shiftsApi } from '../../api/shifts';
import { useToast } from '../../context/ToastContext';
import Drawer from '../../components/ui/Drawer';
import { User, Briefcase, Mail, Phone, Calendar, Loader2, Sparkles } from 'lucide-react';

export function EmployeeDrawer({ isOpen, onClose, employee, onEnrollFace }) {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const isEditing = Boolean(employee);

  // Form State
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    joining_date: new Date().toISOString().split('T')[0],
    department_id: '',
    designation_id: '',
    shift_id: '',
  });

  const [errors, setErrors] = useState({});

  // Populate data when editing
  useEffect(() => {
    if (employee) {
      setFormData({
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        joining_date: employee.joining_date || new Date().toISOString().split('T')[0],
        department_id: employee.department_id || '',
        designation_id: employee.designation_id || '',
        shift_id: employee.shift_id || '',
      });
    } else {
      setFormData({
        employee_code: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        joining_date: new Date().toISOString().split('T')[0],
        department_id: '',
        designation_id: '',
        shift_id: '',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  // Fetch departments, designations & shifts for dropdowns
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    enabled: isOpen,
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
    enabled: isOpen,
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
    enabled: isOpen,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => employeesApi.create(data),
    onSuccess: (newEmployee) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Employee Created', `${newEmployee.first_name} has been added successfully.`);
      onClose();
      if (onEnrollFace) {
        onEnrollFace(newEmployee);
      }
    },
    onError: (err) => {
      toastError('Creation Failed', err.message);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => employeesApi.update(employee.id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employee.id] });
      success('Employee Updated', `${updated.first_name}'s record has been updated.`);
      onClose();
    },
    onError: (err) => {
      toastError('Update Failed', err.message);
    },
  });

  const validate = () => {
    const errs = {};
    if (!formData.employee_code.trim()) errs.employee_code = 'Employee code is required.';
    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!formData.joining_date) errs.joining_date = 'Joining date is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      employee_code: formData.employee_code.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      joining_date: formData.joining_date,
      department_id: formData.department_id || null,
      designation_id: formData.designation_id || null,
      shift_id: formData.shift_id || null,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Employee Record' : 'Register New Employee'}
      subtitle={
        isEditing
          ? 'Update contact, department, and work assignment info'
          : 'Add a new member to the workforce and initialize their profile'
      }
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create & Proceed'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100 uppercase tracking-wider">
            <User className="w-4 h-4 text-indigo-600" />
            Personal Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Jane"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.first_name && <p className="text-[11px] text-rose-500 mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Doe"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employee_code}
                disabled={isEditing}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="e.g. EMP-1042"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.employee_code && <p className="text-[11px] text-rose-500 mt-1">{errors.employee_code}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.joining_date && <p className="text-[11px] text-rose-500 mt-1">{errors.joining_date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@company.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department & Shift Assignment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Workforce Placement
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={formData.designation_id}
                onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.designation_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Shift</label>
              <select
                value={formData.shift_id}
                onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shift_name} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Biometrics Note */}
        {!isEditing && (
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-slate-600 leading-relaxed">
              <strong className="text-slate-900 font-semibold block">Face Biometrics:</strong>
              After saving, you will be prompted to capture or upload a video to enroll this employee's facial features into the AI vector database.
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
}

export default EmployeeDrawer;
