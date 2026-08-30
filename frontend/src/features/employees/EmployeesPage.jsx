import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { shiftsApi } from '../../api/shifts';
import { enrollmentsApi } from '../../api/enrollments';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchInput from '../../components/ui/SearchInput';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmployeeDrawer from './EmployeeDrawer';
import PageBanner from '../../components/ui/PageBanner';
import { getInitials, getAvatarColor, formatDate } from '../../lib/utils';
import {
  UserPlus,
  MoreVertical,
  ScanFace,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Building2,
  Briefcase,
  Clock,
  CalendarCheck2,
  Users,
} from 'lucide-react';

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const { navigate, pageParams } = useNavigation();
  const { success, error: toastError } = useToast();

  // Drawer / Dialog state
  const [drawerOpen, setDrawerOpen] = useState(pageParams.action === 'create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 1. Fetch Employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // 2. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // 3. Fetch Designations
  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  // 4. Fetch Shifts
  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
  });

  // 4. Fetch Enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAll,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Employee Removed', 'The employee record has been deleted.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toastError('Deletion Failed', err.message);
    },
  });

  // Lookups
  const departmentMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, d.department_name));
    return map;
  }, [departments]);

  const designationMap = useMemo(() => {
    const map = new Map();
    designations.forEach((desig) => map.set(desig.id, desig.designation_name));
    return map;
  }, [designations]);

  const shiftMap = useMemo(() => {
    const map = new Map();
    shifts.forEach((s) => map.set(s.id, s.shift_name));
    return map;
  }, [shifts]);

  const enrollmentMap = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      // Pick latest or completed status
      const existing = map.get(e.employee_id);
      if (!existing || existing.status !== 'COMPLETED') {
        map.set(e.employee_id, e);
      }
    });
    return map;
  }, [enrollments]);

  // Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
        const code = (emp.employee_code || '').toLowerCase();
        const email = (emp.email || '').toLowerCase();
        if (!fullName.includes(query) && !code.includes(query) && !email.includes(query)) {
          return false;
        }
      }
      // Department filter
      if (selectedDepartment && emp.department_id !== selectedDepartment) {
        return false;
      }
      // Shift filter
      if (selectedShift && emp.shift_id !== selectedShift) {
        return false;
      }
      // Status filter
      if (selectedStatus) {
        const enrollment = enrollmentMap.get(emp.id);
        const status = enrollment ? enrollment.status : 'PENDING';
        if (status !== selectedStatus) return false;
      }
      return true;
    });
  }, [employees, searchQuery, selectedDepartment, selectedShift, selectedStatus, enrollmentMap]);

  // Handle Edit
  const handleEdit = (emp, e) => {
    e?.stopPropagation();
    setSelectedEmployee(emp);
    setDrawerOpen(true);
    setActiveMenuId(null);
  };

  // Handle View Profile
  const handleViewProfile = (emp, e) => {
    e?.stopPropagation();
    navigate('employee-profile', {
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name || ''}`.trim(),
    });
    setActiveMenuId(null);
  };

  // Handle Enroll Face
  const handleEnrollFace = (emp, e) => {
    e?.stopPropagation();
    navigate('enrollments', {
      mode: 'wizard',
      employeeId: emp.id,
      employeeCode: emp.employee_code,
      employeeName: `${emp.first_name} ${emp.last_name || ''}`.trim(),
    });
    setActiveMenuId(null);
  };

  // Handle Delete
  const handleDelete = (emp, e) => {
    e?.stopPropagation();
    setDeleteTarget(emp);
    setActiveMenuId(null);
  };

  // Table Columns
  const columns = [
    {
      header: 'Employee',
      accessor: 'first_name',
      sortable: true,
      render: (emp) => {
        const fullName = `${emp.first_name} ${emp.last_name || ''}`.trim();
        const initials = getInitials(emp.first_name, emp.last_name);
        const avatarColor = getAvatarColor(fullName);
        const desigName = designationMap.get(emp.designation_id);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">{fullName}</div>
              <div className="text-[11px] text-slate-400 font-normal">
                {desigName ? `${desigName} • ` : ''}
                {emp.email || 'No email registered'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Code',
      accessor: 'employee_code',
      sortable: true,
      render: (emp) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          {emp.employee_code}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'department_id',
      sortable: true,
      render: (emp) => {
        const deptName = departmentMap.get(emp.department_id);
        return deptName ? (
          <span className="text-slate-800 font-medium">{deptName}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        );
      },
    },
    {
      header: 'Designation',
      accessor: 'designation_id',
      sortable: true,
      render: (emp) => {
        const desigName = designationMap.get(emp.designation_id);
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
      accessor: 'shift_id',
      sortable: true,
      render: (emp) => {
        const shiftName = shiftMap.get(emp.shift_id);
        return shiftName ? (
          <span className="text-slate-700">{shiftName}</span>
        ) : (
          <span className="text-slate-400 italic">Default</span>
        );
      },
    },
    {
      header: 'Biometric Status',
      accessor: 'enrollment',
      render: (emp) => {
        const enrollment = enrollmentMap.get(emp.id);
        const status = enrollment ? enrollment.status : 'PENDING';
        return <StatusBadge status={status} type="enrollment" />;
      },
    },
    {
      header: 'Joined',
      accessor: 'joining_date',
      sortable: true,
      render: (emp) => <span className="text-slate-500">{formatDate(emp.joining_date)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (emp) => (
        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {activeMenuId === emp.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => handleViewProfile(emp, e)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  View Profile
                </button>
                <button
                  onClick={(e) => handleEnrollFace(emp, e)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <ScanFace className="w-3.5 h-3.5 text-indigo-600" />
                  Enroll Biometrics
                </button>
                <button
                  onClick={(e) => handleEdit(emp, e)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Edit Employee
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={(e) => handleDelete(emp, e)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Record
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Workforce Management"
        badgeIcon={Users}
        title="Workforce Directory"
        description="Manage registered employees, organizational structure assignments, and biometric profiles."
        actions={
          <>
            <button
              onClick={() => navigate('recognition')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <ScanFace className="w-4 h-4 text-indigo-300" />
              Live Recognition
            </button>
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Add Employee
            </button>
          </>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, code, or email..."
            className="max-w-md"
          />

          <div className="flex flex-wrap items-center gap-2">
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
            </select>

            {(searchQuery || selectedDepartment || selectedShift || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('');
                  setSelectedShift('');
                  setSelectedStatus('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        loading={loadingEmployees}
        emptyTitle="No employees found"
        emptyDescription={
          searchQuery || selectedDepartment
            ? 'No employees match your active search filters.'
            : 'Get started by creating your first employee record.'
        }
        emptyActionLabel="Add Employee"
        onEmptyAction={() => {
          setSelectedEmployee(null);
          setDrawerOpen(true);
        }}
        onRowClick={(emp) => handleViewProfile(emp)}
      />

      {/* Employee Add/Edit Drawer */}
      <EmployeeDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEnrollFace={(newEmp) => handleEnrollFace(newEmp)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isPending}
        danger
        title="Delete Employee Record?"
        description={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name || ''} (${deleteTarget?.employee_code})? This will remove all associated attendance logs and face embeddings.`}
        confirmText="Delete Employee"
      />
    </div>
  );
}

export default EmployeesPage;
