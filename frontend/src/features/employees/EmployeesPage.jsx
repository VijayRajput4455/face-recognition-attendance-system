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
import StatCard from '../../components/ui/StatCard';
import EmployeeDrawer from './EmployeeDrawer';
import PageBanner from '../../components/ui/PageBanner';
import { getInitials, getAvatarColor, formatDate, cn } from '../../lib/utils';
import {
  UserPlus,
  UserCheck,
  UserX,
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
  Power,
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
  const [selectedDesignation, setSelectedDesignation] = useState('');
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

  // Quick Toggle Active/Inactive Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => employeesApi.update(id, { employment_status: newStatus }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Status Updated', `${updated.first_name} is now marked as ${updated.employment_status}.`);
      setActiveMenuId(null);
    },
    onError: (err) => {
      toastError('Update Failed', err.message);
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

  // Real-time KPI Metric Calculations
  const totalEmployeesCount = employees.length;

  const activeEmployeesCount = useMemo(() => {
    return employees.filter((emp) => (emp.employment_status || 'ACTIVE') === 'ACTIVE').length;
  }, [employees]);

  const inactiveEmployeesCount = useMemo(() => {
    return employees.filter((emp) => (emp.employment_status || 'ACTIVE') === 'INACTIVE').length;
  }, [employees]);

  const enrolledEmployeesCount = useMemo(() => {
    return employees.filter((emp) => {
      const enrollment = enrollmentMap.get(emp.id);
      return enrollment && enrollment.status === 'COMPLETED';
    }).length;
  }, [employees, enrollmentMap]);

  const enrolledPercentage =
    totalEmployeesCount > 0 ? Math.round((enrolledEmployeesCount / totalEmployeesCount) * 100) : 0;

  const departmentCount = departments.length;
  const assignedDeptEmployeesCount = useMemo(() => {
    return employees.filter((emp) => Boolean(emp.department_id)).length;
  }, [employees]);

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
      // Designation filter
      if (selectedDesignation && emp.designation_id !== selectedDesignation) {
        return false;
      }
      // Shift filter
      if (selectedShift && emp.shift_id !== selectedShift) {
        return false;
      }
      // Status filter
      if (selectedStatus) {
        const empStatus = emp.employment_status || 'ACTIVE';
        const enrollment = enrollmentMap.get(emp.id);
        const enrollStatus = enrollment ? enrollment.status : 'PENDING';

        if (selectedStatus === 'ACTIVE') {
          if (empStatus !== 'ACTIVE') return false;
        } else if (selectedStatus === 'INACTIVE') {
          if (empStatus !== 'INACTIVE') return false;
        } else if (selectedStatus === 'COMPLETED') {
          if (enrollStatus !== 'COMPLETED') return false;
        } else if (selectedStatus === 'PENDING') {
          if (enrollStatus !== 'PENDING') return false;
        }
      }
      return true;
    });
  }, [employees, searchQuery, selectedDepartment, selectedDesignation, selectedShift, selectedStatus, enrollmentMap]);

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

  // Handle Toggle Active/Inactive
  const handleToggleStatus = (emp, e) => {
    e?.stopPropagation();
    const currentStatus = emp.employment_status || 'ACTIVE';
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: emp.id, newStatus });
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
      header: 'Employment',
      accessor: 'employment_status',
      sortable: true,
      render: (emp) => {
        const status = emp.employment_status || 'ACTIVE';
        return <StatusBadge status={status} type="employment" />;
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
      render: (emp) => {
        const isEmpActive = (emp.employment_status || 'ACTIVE') === 'ACTIVE';

        return (
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
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={(e) => handleViewProfile(emp, e)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    View Profile
                  </button>
                  <button
                    onClick={(e) => handleEnrollFace(emp, e)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <ScanFace className="w-3.5 h-3.5 text-indigo-600" />
                    Enroll Biometrics
                  </button>
                  <button
                    onClick={(e) => handleEdit(emp, e)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    Edit Details
                  </button>
                  <button
                    onClick={(e) => handleToggleStatus(emp, e)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer',
                      isEmpActive
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    )}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {isEmpActive ? 'Set as Inactive' : 'Set as Active'}
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={(e) => handleDelete(emp, e)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Record
                  </button>
                </div>
              </>
            )}
          </div>
        );
      },
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
      />

      {/* Real-Time Blue Theme Metric Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce Toggle */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('');
            setSelectedDepartment('');
            setSelectedDesignation('');
            setSelectedShift('');
          }}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            !selectedStatus && !selectedDepartment && !selectedDesignation && !selectedShift
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Workforce
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Registered</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        </button>

        {/* Active Staff Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'ACTIVE' ? '' : 'ACTIVE')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'ACTIVE'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Active Staff
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {activeEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {totalEmployeesCount > 0 ? Math.round((activeEmployeesCount / totalEmployeesCount) * 100) : 0}% Active
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Inactive Staff Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'INACTIVE' ? '' : 'INACTIVE')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'INACTIVE'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Inactive Staff
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {inactiveEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {inactiveEmployeesCount} Deactivated
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserX className="w-5 h-5" />
          </div>
        </button>

        {/* Face Data Enrolled Toggle */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? '' : 'COMPLETED')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            selectedStatus === 'COMPLETED'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Face Enrolled
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {enrolledEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {enrolledPercentage}% Verified
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <ScanFace className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Filter & Search Bar with Add Employee Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, code, or email..."
              className="w-full md:max-w-xs"
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

              {/* Designation Filter */}
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Designations</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.designation_name}
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
                <option value="">All Status</option>
                <option value="ACTIVE">Active Staff ({activeEmployeesCount})</option>
                <option value="INACTIVE">Inactive Staff ({inactiveEmployeesCount})</option>
                <option value="COMPLETED">Biometric Enrolled ({enrolledEmployeesCount})</option>
                <option value="PENDING">Pending Enrollment</option>
              </select>

              {(searchQuery || selectedDepartment || selectedDesignation || selectedShift || selectedStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('');
                    setSelectedDesignation('');
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

          {/* Add Employee Action */}
          <div className="flex items-center justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setDrawerOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-white" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employees DataTable */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        isLoading={loadingEmployees}
        emptyMessage="No employees found matching current filters."
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
        description={`Are you sure you want to permanently remove ${deleteTarget?.first_name} ${deleteTarget?.last_name || ''} (${deleteTarget?.employee_code})? This will delete all biometric embeddings and attendance history.`}
        confirmText="Delete Record"
      />
    </div>
  );
}

export default EmployeesPage;
